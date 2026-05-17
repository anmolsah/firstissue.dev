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

export function useVerifyContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prUrl }) => {
      const { data, error } = await supabase.functions.invoke('verify-contribution', {
        body: { prUrl }
      });

      if (error) {
        // Try to parse the error body for a user-friendly message
        throw new Error(error.message || 'Verification failed');
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
