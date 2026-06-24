// Standard Webhooks signature verification (the scheme Dodo Payments uses).
// Reference: https://www.standardwebhooks.com/
//
// A valid request carries three headers:
//   webhook-id         — unique message id
//   webhook-timestamp  — unix seconds when the message was sent
//   webhook-signature  — space-delimited list of "v1,<base64 hmac>" entries
//
// The signature is HMAC-SHA256 over `${id}.${timestamp}.${rawBody}` using the
// endpoint secret (base64-encoded, prefixed with "whsec_") as the key.

const encoder = new TextEncoder();

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Constant-time string comparison to avoid leaking timing information.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export interface VerifyResult {
  valid: boolean;
  reason?: string;
}

/**
 * Verify a Standard Webhooks signature.
 *
 * @param secret            The endpoint secret (e.g. "whsec_...").
 * @param headers           Incoming request headers.
 * @param rawBody           The exact raw request body string (do not re-serialize).
 * @param toleranceSeconds  Max allowed clock skew for replay protection.
 */
export async function verifyStandardWebhook(
  secret: string,
  headers: Headers,
  rawBody: string,
  toleranceSeconds = 300,
): Promise<VerifyResult> {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");

  if (!id || !timestamp || !signatureHeader) {
    return {
      valid: false,
      reason: "Missing webhook-id, webhook-timestamp, or webhook-signature header",
    };
  }

  // Replay protection: reject timestamps outside the tolerance window.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { valid: false, reason: "Invalid webhook-timestamp" };
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSeconds) {
    return { valid: false, reason: "Webhook timestamp outside tolerance window" };
  }

  // The signing key is the base64 payload after the "whsec_" prefix.
  const secretKey = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes: Uint8Array;
  try {
    keyBytes = base64ToUint8Array(secretKey);
  } catch {
    // Fall back to treating the secret as a raw UTF-8 key.
    keyBytes = encoder.encode(secretKey);
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signedContent));
  const expectedSignature = uint8ArrayToBase64(new Uint8Array(sigBuffer));

  // The header may list multiple signatures: "v1,<sig1> v1,<sig2>".
  for (const versioned of signatureHeader.split(" ")) {
    const commaIdx = versioned.indexOf(",");
    const sig = commaIdx === -1 ? versioned : versioned.slice(commaIdx + 1);
    if (sig && timingSafeEqual(sig, expectedSignature)) {
      return { valid: true };
    }
  }

  return { valid: false, reason: "No matching signature" };
}
