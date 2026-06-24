// Shared supporter-entitlement helpers for Edge Functions.
//
// Centralizes the "is this user a paying supporter?" decision so that
// server-side feature gating (Smart Match, unlimited Proof of Work) matches
// the client-side logic in src/hooks/queries/useSupporterStatus.js.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Free accounts may mint up to this many Proof of Work attestations.
export const FREE_ATTESTATION_LIMIT = 5;

/**
 * Determine whether a user currently has an active supporter entitlement.
 *
 * Mirrors the client-side rules:
 *   - status must be 'active' or 'cancelled'
 *     (cancelled users keep access until the period they paid for ends)
 *   - expires_at, if set, must be in the future
 *
 * @param supabase  A service-role (admin) client — this reads across users.
 * @param userId    The user to check.
 */
export async function isActiveSupporter(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("supporters")
    .select("status, expires_at")
    .eq("user_id", userId)
    .in("status", ["active", "cancelled"])
    .maybeSingle();

  if (error || !data) return false;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return false;
  return true;
}
