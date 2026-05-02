// Shared CORS configuration for all Edge Functions
// Import this in each function instead of defining CORS headers inline

const ALLOWED_ORIGINS = [
  "https://firstissue.dev",
  "https://www.firstissue.dev",
  "http://localhost:5173",
  "http://localhost:3000",
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-signature, webhook-id, webhook-timestamp",
  };
}
