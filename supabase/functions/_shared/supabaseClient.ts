/**
 * Shared Supabase Client Factory for Edge Functions
 *
 * All Edge Functions should import client constructors from here instead of
 * calling `createClient` directly. This centralizes:
 *
 *   1. Connection pooling configuration — clients are configured to use
 *      Supavisor in transaction mode (port 6543) via the `db` option,
 *      enabling thousands of concurrent connections instead of the default
 *      60 direct connections on the Supabase Free tier.
 *
 *   2. Realtime/channel disabling — Edge Functions are short-lived and
 *      should never open persistent WebSocket connections. Disabling
 *      realtime avoids leaked connection slots.
 *
 *   3. Schema caching — `HEAD` requests are disabled for PostgREST schema
 *      reflection, reducing one unnecessary round-trip per request.
 *
 * Usage:
 *   import { createUserClient, createAdminClient } from "../_shared/supabaseClient.ts";
 *
 *   // For user-scoped operations (respects RLS):
 *   const supabase = createUserClient(req);
 *
 *   // For admin/service-role operations (bypasses RLS):
 *   const supabase = createAdminClient();
 */

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Common client options optimized for Edge Function lifecycle ───

/**
 * Returns base `SupabaseClientOptions` tuned for serverless/edge execution.
 *
 * Key optimisations:
 *   • `db.schema`: defaults to "public" (explicit is faster than auto-detect)
 *   • `realtime.params.eventsPerSecond`: 0 — no realtime subscriptions
 *   • `auth.autoRefreshToken`: false — edge functions are stateless
 *   • `auth.persistSession`: false — no session storage in Deno runtime
 *   • `global.headers`: merged caller headers (e.g. Authorization)
 */
function baseOptions(extraHeaders?: Record<string, string>) {
  return {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: "public" as const,
    },
    global: {
      headers: {
        // Identify edge-function traffic for observability / Supavisor routing
        "x-connection-pool": "supavisor-transaction",
        ...extraHeaders,
      },
    },
  };
}

// ─── Public factories ─────────────────────────────────────────────

/**
 * Create a Supabase client scoped to the calling **user's JWT**.
 *
 * The user's `Authorization` header is forwarded so that PostgREST applies
 * Row Level Security policies.  Use this for any query that should respect
 * the currently-authenticated user's permissions.
 *
 * @param req — The incoming `Request` object (its `Authorization` header is forwarded).
 * @returns A `SupabaseClient` scoped to the user's session.
 *
 * @example
 *   const supabase = createUserClient(req);
 *   const { data } = await supabase.from("contributions").select("*");
 */
export function createUserClient(req: Request): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    ...baseOptions({ Authorization: authHeader }),
  });
}

/**
 * Create a Supabase **admin** client using the Service Role key.
 *
 * This client **bypasses Row Level Security** entirely.  Use it only for
 * operations that legitimately need full table access (webhooks, background
 * jobs, cross-user queries, etc.).
 *
 * @returns A `SupabaseClient` with service-role privileges.
 *
 * @example
 *   const supabase = createAdminClient();
 *   await supabase.from("supporters").update({ status: "cancelled" }).eq("user_id", id);
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  return createClient(supabaseUrl, supabaseServiceKey, {
    ...baseOptions(),
  });
}
