import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { FREE_DAILY_COPILOT_MESSAGES } from '../../lib/limits';

/**
 * Query key factory for the FirstMate daily message quota
 */
export const copilotQuotaKeys = {
  usage: (userId) => ['copilot-quota', userId],
};

function utcToday() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Read today's copilot usage row.
 *
 * RLS allows a user to SELECT their own row only; writes happen exclusively in
 * the `kb-query` edge function via the service role. This is therefore a
 * read-only mirror for the UI counter — never the enforcement point.
 */
async function fetchCopilotUsage(userId) {
  const { data, error } = await supabase
    .from('ai_copilot_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('usage_date', utcToday())
    .maybeSingle();

  if (error) throw error;

  const used = data?.message_count ?? 0;
  return {
    used,
    limit: FREE_DAILY_COPILOT_MESSAGES,
    remaining: Math.max(0, FREE_DAILY_COPILOT_MESSAGES - used),
  };
}

/**
 * Hook exposing how many free FirstMate messages remain today.
 *
 * Pass `enabled: false` for supporters — they are unlimited, so there is no
 * reason to spend a query on it.
 */
export function useCopilotQuota(userId, { enabled = true } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: copilotQuotaKeys.usage(userId),
    queryFn: () => fetchCopilotUsage(userId),
    enabled: !!userId && enabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  /**
   * Apply the authoritative quota the edge function returned alongside an
   * answer, so the counter updates without another round-trip.
   */
  const applyServerQuota = (quota) => {
    if (!userId || !quota?.limited) return;
    const limit = quota.limit ?? FREE_DAILY_COPILOT_MESSAGES;
    const used = quota.used ?? 0;
    queryClient.setQueryData(copilotQuotaKeys.usage(userId), {
      used,
      limit,
      remaining: quota.remaining ?? Math.max(0, limit - used),
    });
  };

  /** Mark the quota as fully spent (after a 429 from the edge function). */
  const markExhausted = (limit = FREE_DAILY_COPILOT_MESSAGES) => {
    if (!userId) return;
    queryClient.setQueryData(copilotQuotaKeys.usage(userId), {
      used: limit,
      limit,
      remaining: 0,
    });
  };

  return {
    used: query.data?.used ?? 0,
    limit: query.data?.limit ?? FREE_DAILY_COPILOT_MESSAGES,
    remaining: query.data?.remaining ?? FREE_DAILY_COPILOT_MESSAGES,
    loading: query.isLoading,
    applyServerQuota,
    markExhausted,
  };
}
