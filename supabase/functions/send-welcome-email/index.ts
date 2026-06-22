// Supabase Edge Function: Send Welcome Email via Resend
// Deploy: supabase functions deploy send-welcome-email
//
// Triggered by a Database Webhook on INSERT into auth.users.
// Sends a professional welcome email using the Resend API.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabaseClient.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Build the welcome email HTML.
 * Clean, professional design with firstissue.dev branding.
 */
function buildWelcomeEmail(username?: string): string {
  const displayName = username || "there";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to firstissue.dev</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo & Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                <span style="color:#a78bfa;">first</span><span style="color:#ffffff;">issue</span><span style="color:#60a5fa;">.dev</span>
              </h1>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16162a 100%);border:1px solid rgba(167,139,250,0.2);border-radius:16px;padding:48px 40px;">

              <!-- Welcome Message -->
              <h2 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#ffffff;">
                Welcome aboard, ${displayName}!
              </h2>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#a0a0b8;">
                Thank you for joining <strong style="color:#ffffff;">firstissue.dev</strong> — the platform that helps developers find their first open-source contribution.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(167,139,250,0.15);margin:24px 0;" />

              <!-- What You Can Do -->
              <h3 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#ffffff;">
                Here's what you can do now:
              </h3>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:12px;">
                          <div style="display:inline-block;width:36px;height:36px;background:rgba(167,139,250,0.15);border-radius:10px;text-align:center;line-height:36px;">
                            <img src="https://img.icons8.com/fluency-systems-regular/24/a78bfa/search--v1.png" alt="Search" width="18" height="18" style="vertical-align:middle;" />
                          </div>
                        </td>
                        <td>
                          <p style="margin:0;font-size:15px;color:#ffffff;font-weight:500;">Discover Issues</p>
                          <p style="margin:4px 0 0;font-size:14px;color:#a0a0b8;line-height:1.5;">Browse curated beginner-friendly issues across popular open-source projects.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:12px;">
                          <div style="display:inline-block;width:36px;height:36px;background:rgba(96,165,250,0.15);border-radius:10px;text-align:center;line-height:36px;">
                            <img src="https://img.icons8.com/fluency-systems-regular/24/60a5fa/artificial-intelligence.png" alt="AI" width="18" height="18" style="vertical-align:middle;" />
                          </div>
                        </td>
                        <td>
                          <p style="margin:0;font-size:15px;color:#ffffff;font-weight:500;">AI-Powered Matching</p>
                          <p style="margin:4px 0 0;font-size:14px;color:#a0a0b8;line-height:1.5;">Get personalized issue recommendations based on your GitHub profile and skills.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:12px;">
                          <div style="display:inline-block;width:36px;height:36px;background:rgba(52,211,153,0.15);border-radius:10px;text-align:center;line-height:36px;">
                            <img src="https://img.icons8.com/fluency-systems-regular/24/34d399/trophy.png" alt="Trophy" width="18" height="18" style="vertical-align:middle;" />
                          </div>
                        </td>
                        <td>
                          <p style="margin:0;font-size:15px;color:#ffffff;font-weight:500;">Track Contributions</p>
                          <p style="margin:4px 0 0;font-size:14px;color:#a0a0b8;line-height:1.5;">Log your merged PRs, earn badges, and build your open-source portfolio.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(167,139,250,0.15);margin:24px 0;" />

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 0;">
                    <a href="https://firstissue.dev"
                       style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a78bfa 0%,#60a5fa 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
                      Start Exploring Issues →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 20px 0;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b6b80;">
                You're receiving this because you signed up at
                <a href="https://firstissue.dev" style="color:#a78bfa;text-decoration:none;">firstissue.dev</a>
              </p>
              <p style="margin:0;font-size:13px;color:#6b6b80;">
                © ${new Date().getFullYear()} firstissue.dev — Built for the open-source community
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Build a plain-text fallback for email clients that don't support HTML.
 */
function buildWelcomeText(username?: string): string {
  const displayName = username || "there";
  return [
    `Welcome to firstissue.dev, ${displayName}!`,
    "",
    "Thank you for joining firstissue.dev — the platform that helps developers",
    "find their first open-source contribution.",
    "",
    "Here's what you can do now:",
    "",
    "* Discover Issues",
    "   Browse curated beginner-friendly issues across popular open-source projects.",
    "",
    "* AI-Powered Matching",
    "   Get personalized issue recommendations based on your GitHub profile and skills.",
    "",
    "* Track Contributions",
    "   Log your merged PRs, earn badges, and build your open-source portfolio.",
    "",
    "Start exploring: https://firstissue.dev",
    "",
    "---",
    `© ${new Date().getFullYear()} firstissue.dev — Built for the open-source community`,
  ].join("\n");
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Parse the Database Webhook payload ──
    // Supabase DB Webhooks send: { type, table, schema, record, old_record }
    const payload = await req.json();
    console.log("[send-welcome-email] Webhook event received:", payload.type);

    // Only process INSERT events
    if (payload.type !== "INSERT") {
      console.log("[send-welcome-email] Ignoring non-INSERT event:", payload.type);
      return new Response(
        JSON.stringify({ received: true, skipped: "not an INSERT event" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUser = payload.record;
    if (!newUser) {
      console.error("[send-welcome-email] No record in payload");
      return new Response(
        JSON.stringify({ received: true, error: "no record in payload" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract user details
    const userId = newUser.id;
    const userEmail = newUser.email;
    const rawMeta = newUser.raw_user_meta_data || {};
    const githubUsername =
      rawMeta.user_name ||
      rawMeta.preferred_username ||
      rawMeta.full_name ||
      rawMeta.name ||
      null;

    console.log(`[send-welcome-email] New user: ${userId}, email: ${userEmail}, github: ${githubUsername}`);

    if (!userEmail) {
      console.error("[send-welcome-email] No email found for user:", userId);
      return new Response(
        JSON.stringify({ received: true, error: "no email for user" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Idempotency check ──
    // Prevent duplicate emails on webhook retries
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("welcome_email_sent_at")
      .eq("id", userId)
      .single();

    if (profile?.welcome_email_sent_at) {
      console.log("[send-welcome-email] Welcome email already sent for user:", userId);
      return new Response(
        JSON.stringify({ received: true, skipped: "already sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Send email via Resend API ──
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "welcome@firstissue.dev";

    if (!resendApiKey) {
      console.error("[send-welcome-email] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ received: true, error: "RESEND_API_KEY not set" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailPayload = {
      from: `firstissue.dev <${fromEmail}>`,
      to: [userEmail],
      subject: "Welcome to firstissue.dev — Your Open Source Journey Starts Here",
      html: buildWelcomeEmail(githubUsername),
      text: buildWelcomeText(githubUsername),
    };

    console.log("[send-welcome-email] Sending email to:", userEmail);

    const resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-welcome-email] Resend API error:", JSON.stringify(resendResult));
      // Return 200 to prevent Supabase from retrying the webhook
      return new Response(
        JSON.stringify({ received: true, error: "resend_api_error", details: resendResult }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[send-welcome-email] ✅ Email sent successfully. Resend ID:", resendResult.id);

    // ── 4. Mark email as sent (idempotency) ──
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      // Non-fatal — the email was already sent, just log the tracking error
      console.error("[send-welcome-email] Failed to update welcome_email_sent_at:", updateError);
    }

    return new Response(
      JSON.stringify({ received: true, success: true, resend_id: resendResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[send-welcome-email] Unhandled error:", error);
    // Always return 200 to prevent infinite webhook retries
    return new Response(
      JSON.stringify({ received: true, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
