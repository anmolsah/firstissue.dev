/**
 * Free-tier limits shared across the app.
 *
 * These are for DISPLAY ONLY — every limit here is enforced server-side
 * (see supabase/functions/_shared/supporter.ts). Changing a value here does
 * not change what a free account can actually do.
 */

// FirstMate AI Copilot messages a free account may send per UTC day.
export const FREE_DAILY_COPILOT_MESSAGES = 10;

// Proof of Work attestations a free account may mint in total.
export const FREE_ATTESTATION_LIMIT = 5;
