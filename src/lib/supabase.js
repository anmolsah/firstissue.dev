import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // ── Connection pooling optimisations ──────────────────────────
  // These settings minimise idle connections against Supavisor (transaction mode).
  //
  // 1. Disable the Realtime WebSocket channel — the app does not subscribe
  //    to live database changes.  Each open WebSocket consumes one Supavisor
  //    connection slot, which is the primary concurrency bottleneck on the
  //    Free tier (60 slots).
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
  // 2. Use explicit schema to bypass PostgREST schema auto-detect overhead.
  db: {
    schema: 'public',
  },
  // 3. Keep auth defaults (autoRefreshToken, persistSession) for the SPA —
  //    these are needed for the browser session lifecycle.
});