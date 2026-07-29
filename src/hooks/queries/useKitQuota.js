import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { FREE_MONTHLY_KITS } from '../../lib/limits';

/**
 * Query key factory for the Contribution Kit monthly quota
 */
export const kitQuotaKeys = {
  usage: (userId) => ['kit-quota', userId],
};

function utcMonthStart() {
  const now = new Date();
  // First day of the current UTC month, as YYYY-MM-DD — matches the
  // `usage_month` bucket the edge function writes.
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Read this month's kit usage row.
 *
 * RLS allows a user to SELECT their own row only; writes happen exclusively in
 * the `contribution-kit` edge function via the service role. Read-only mirror
 * for the UI — never the enforcement point.
 */
async function fetchKitUsage(userId) {
  const { data, error } = await supabase
    .from('contribution_kit_usage')
    .select('kit_count')
    .eq('user_id', userId)
    .eq('usage_month', utcMonthStart())
    .maybeSingle();

  if (error) throw error;

  const used = data?.kit_count ?? 0;
  return {
    used,
    limit: FREE_MONTHLY_KITS,
    remaining: Math.max(0, FREE_MONTHLY_KITS - used),
  };
}

/**
 * Hook exposing how many free Contribution Kits remain this month.
 *
 * Pass `enabled: false` for supporters — they are unlimited, so there is no
 * reason to spend a query on it.
 */
export function useKitQuota(userId, { enabled = true } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: kitQuotaKeys.usage(userId),
    queryFn: () => fetchKitUsage(userId),
    enabled: !!userId && enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  /** Apply the authoritative quota the edge function returned with a kit. */
  const applyServerQuota = (quota) => {
    if (!userId || !quota?.limited) return;
    const limit = quota.limit ?? FREE_MONTHLY_KITS;
    const used = quota.used ?? 0;
    queryClient.setQueryData(kitQuotaKeys.usage(userId), {
      used,
      limit,
      remaining: quota.remaining ?? Math.max(0, limit - used),
    });
  };

  /** Mark the month's allowance as fully spent (after a 429). */
  const markExhausted = (limit = FREE_MONTHLY_KITS) => {
    if (!userId) return;
    queryClient.setQueryData(kitQuotaKeys.usage(userId), {
      used: limit,
      limit,
      remaining: 0,
    });
  };

  return {
    used: query.data?.used ?? 0,
    limit: query.data?.limit ?? FREE_MONTHLY_KITS,
    remaining: query.data?.remaining ?? FREE_MONTHLY_KITS,
    loading: query.isLoading,
    applyServerQuota,
    markExhausted,
  };
}
