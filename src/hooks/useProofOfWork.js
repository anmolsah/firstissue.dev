import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

function isMissingSchemaError(err) {
  if (!err) return false;
  const msg = String(err.message || '').toLowerCase();
  return (
    err.code === '42703' ||
    err.code === '42P01' ||
    err.code === 'PGRST204' ||
    err.code === 'PGRST205' ||
    msg.includes('column') ||
    msg.includes('does not exist') ||
    msg.includes('schema cache')
  );
}

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

      const fullCols =
        'id, github_username, github_avatar_url, name, bio, linkedin_url, twitter_url, open_to_work, open_to_work_blurb';
      const legacyCols =
        'id, github_username, github_avatar_url, name, open_to_work, open_to_work_blurb';

      // 1. Fetch profile using github_username (case-insensitive match fallback)
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(fullCols)
        .ilike('github_username', githubUsername)
        .maybeSingle();

      if (profileError && isMissingSchemaError(profileError)) {
        const fallbackRes = await supabase
          .from('profiles')
          .select(legacyCols)
          .ilike('github_username', githubUsername)
          .maybeSingle();
        profileData = fallbackRes.data;
        profileError = fallbackRes.error;
      }

      if (profileError) {
        if (profileError.code === 'PGRST116') return null;
        throw profileError;
      }

      if (!profileData?.id) return null;

      // 2. Fetch verified attestations and live projects in parallel
      const [attestationsRes, projectsRes] = await Promise.all([
        supabase
          .from('user_attestations')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_projects')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false }),
      ]);

      if (attestationsRes.error) throw attestationsRes.error;

      let projects = [];
      if (!projectsRes.error) {
        projects = projectsRes.data || [];
      } else if (!isMissingSchemaError(projectsRes.error)) {
        console.warn('Error fetching public user_projects:', projectsRes.error);
      }

      return {
        profile: profileData,
        attestations: attestationsRes.data || [],
        projects,
      };
    },
    enabled: !!githubUsername,
  });
}

// Owner-only: read/update the "open to work" recruiter flag on the user's
// own profiles row (RLS: "Users can update own profile").
export function useOpenToWork(userId) {
  return useQuery({
    queryKey: ['openToWork', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('open_to_work, open_to_work_blurb')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateOpenToWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, open_to_work, open_to_work_blurb }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ open_to_work, open_to_work_blurb })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['openToWork', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attestations'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
    }
  });
}

export function useGenerateQuantifiedImpact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attestationId }) => {
      const { data, error } = await supabase.functions.invoke('verify-contribution', {
        body: { action: 'summarize-existing', attestationId }
      });

      if (error) {
        let message = 'Failed to generate impact summary';
        try {
          if (error.context && typeof error.context.json === 'function') {
            const body = await error.context.json();
            if (body?.error) message = body.error;
          } else if (error.message && !error.message.includes('non-2xx')) {
            message = error.message;
          }
        } catch {
          // Fallback
        }
        throw new Error(message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attestations'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
    }
  });
}
