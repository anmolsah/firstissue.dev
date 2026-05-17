import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

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

export function useVerifyContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prUrl }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-contribution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ prUrl })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Verification failed');
      }

      return responseData.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the query to fetch the new attestation
      queryClient.invalidateQueries(['attestations']);
    }
  });
}
