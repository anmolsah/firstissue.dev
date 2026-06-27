import { useQuery, useQueryClient } from '@tanstack/react-query';
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
 *
 * NOTE: Supabase Realtime is intentionally disabled app-wide
 * (`eventsPerSecond: 0` in lib/supabase.js) to conserve Supavisor connection
 * slots, so there is NO live postgres_changes subscription here — it would
 * never fire. Freshness instead comes from:
 *   - explicit `refreshStatus()` after checkout/cancel (callers already do this)
 *   - a short staleTime + refetch on window focus, so returning to the tab
 *     (e.g. after the webhook activates/cancels) reconciles the UI.
 */
export function useSupporterStatus(userId) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: supporterKeys.status(userId),
    queryFn: () => fetchSupporterStatus(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute — billing state should reflect changes quickly
    refetchOnWindowFocus: true,
  });

  return {
    isSupporter: query.data?.isSupporter ?? false,
    supporterData: query.data?.supporterData ?? null,
    loading: query.isLoading,
    refreshStatus: () => queryClient.invalidateQueries({ queryKey: supporterKeys.status(userId) }),
  };
}
