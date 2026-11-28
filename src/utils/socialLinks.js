/**
 * Utilities for normalizing and validating optional social URLs (LinkedIn, X/Twitter)
 * and live project URLs safely (rejecting non-http/https schemes).
 */

/**
 * Ensures an arbitrary URL string uses http:// or https://, prepending https:// if omitted.
 * Returns "" if empty or invalid.
 */
export function normalizeExternalHttpUrl(raw) {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    if (!parsed.hostname || !parsed.hostname.includes(".")) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

/**
 * Normalizes a LinkedIn input (full URL, `linkedin.com/in/foo`, `in/foo`, or `foo`)
 * into a canonical `https://www.linkedin.com/...` URL. Returns "" if empty/invalid.
 */
export function normalizeLinkedInUrl(raw) {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Handle full or protocol-less linkedin.com URLs
  if (/^(https?:\/\/)?([a-z0-9-]+\.)?linkedin\.com\//i.test(trimmed)) {
    return normalizeExternalHttpUrl(trimmed);
  }

  // Handle `in/username` or `company/name`
  const cleaned = trimmed.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
  if (!cleaned) return "";

  if (/^(in|company|school|pub)\/[a-zA-Z0-9._%-]+/i.test(cleaned)) {
    return `https://www.linkedin.com/${cleaned}`;
  }

  // Plain handle/slug -> /in/<slug>
  if (/^[a-zA-Z0-9._-]+$/.test(cleaned)) {
    return `https://www.linkedin.com/in/${cleaned}`;
  }

  return "";
}

/**
 * Normalizes an X / Twitter input (full x.com/twitter.com URL, `@handle`, or `handle`)
 * into a canonical `https://x.com/<handle>` URL. Returns "" if empty/invalid.
 */
export function normalizeTwitterUrl(raw) {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (/^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\//i.test(trimmed)) {
    const full = normalizeExternalHttpUrl(trimmed);
    if (!full) return "";
    try {
      const parsed = new URL(full);
      const seg = parsed.pathname.split("/").filter(Boolean)[0];
      if (!seg) return "";
      return `https://x.com/${seg.replace(/^@+/, "")}`;
    } catch {
      return "";
    }
  }

  const handle = trimmed.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
  if (/^[a-zA-Z0-9_]{1,30}$/.test(handle)) {
    return `https://x.com/${handle}`;
  }

  return "";
}

/**
 * Extracts a compact display label from a LinkedIn URL (e.g. `in/alex-chen` or `LinkedIn`).
 */
export function formatLinkedInDisplay(raw) {
  const url = normalizeLinkedInUrl(raw);
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}/${decodeURIComponent(parts[1])}`;
    }
    if (parts.length === 1) {
      return decodeURIComponent(parts[0]);
    }
  } catch {
    // ignore
  }
  return "LinkedIn";
}

/**
 * Extracts `@handle` from an X / Twitter URL or handle.
 */
export function formatTwitterDisplay(raw) {
  const url = normalizeTwitterUrl(raw);
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const seg = parsed.pathname.split("/").filter(Boolean)[0];
    if (seg) return `@${seg.replace(/^@+/, "")}`;
  } catch {
    // ignore
  }
  return "X";
}

/**
 * Formats a URL into a clean `hostname/path` label for project cards.
 */
export function formatCompactUrl(raw) {
  const normalized = normalizeExternalHttpUrl(raw);
  if (!normalized) return raw || "";
  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./i, "");
    const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.replace(/\/+$/, "") : "";
    return `${host}${path}`.slice(0, 48);
  } catch {
    return normalized;
  }
}
