import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Query key factory for supporter status
 */
export const supporterKeys = {
  status: (userId) => ['supporter', userId],
};

/**
 * Fetch supporter status from Supabase
 */
async function fetchSupporterStatus(userId) {
  const { data, error } = await supabase
    .from('supporters')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'cancelled'])
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found (not an error for us)
    throw error;
  }

  if (!data) {
    return { isSupporter: false, supporterData: null };
  }

  // Check if subscription has expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { isSupporter: false, supporterData: { ...data, status: 'expired' } };
  }

  return { isSupporter: true, supporterData: data };
}

/**
 * Hook to fetch and cache supporter status with TanStack Query.
 * Also sets up a Supabase realtime subscription to auto-invalidate on changes.
 */
export function useSupporterStatus(userId) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: supporterKeys.status(userId),
    queryFn: () => fetchSupporterStatus(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up realtime subscription for auto-invalidation
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`supporter-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supporters',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: supporterKeys.status(userId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    isSupporter: query.data?.isSupporter ?? false,
    supporterData: query.data?.supporterData ?? null,
    loading: query.isLoading,
    refreshStatus: () => queryClient.invalidateQueries({ queryKey: supporterKeys.status(userId) }),
  };
}
