import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAttestations(userId) {
  return useQuery({
    queryKey: ['attestations', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_attestations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function usePublicProfileAndAttestations(githubUsername) {
  return useQuery({
    queryKey: ['publicProfile', githubUsername],
    queryFn: async () => {
      if (!githubUsername) return null;

      // 1. Fetch user ID from profiles using github_username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, github_username, github_avatar_url, name')
        .eq('github_username', githubUsername)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') return null; // Not found
        throw profileError;
      }

      if (!profileData?.id) return null;

      // 2. Fetch attestations for this user ID
      const { data: attestations, error: attestationsError } = await supabase
        .from('user_attestations')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (attestationsError) throw attestationsError;

      return {
        profile: profileData,
        attestations: attestations || []
      };
    },
    enabled: !!githubUsername,
  });
}

export function useVerifyContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prUrl, userId, githubUsername }) => {
      const { data, error } = await supabase.functions.invoke('verify-contribution', {
        body: { prUrl, userId, githubUsername }
      });

      if (error) {
        // Supabase client wraps non-2xx Edge Function responses in a generic error.
        // The actual JSON body with the user-friendly message is in error.context.
        // We need to parse it to show the real reason (e.g. "PR not merged", "author mismatch").
        let message = 'Verification failed';
        try {
          if (error.context && typeof error.context.json === 'function') {
            const body = await error.context.json();
            if (body?.error) message = body.error;
          } else if (error.message && !error.message.includes('non-2xx')) {
            message = error.message;
          }
        } catch {
          // If parsing fails, fall back to generic message
        }
        throw new Error(message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the query to fetch the new attestation
      queryClient.invalidateQueries(['attestations']);
    }
  });
}
