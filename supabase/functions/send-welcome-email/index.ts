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
 *
 * Design principles (inspired by Vercel, Linear, Resend):
 *  - White/light background for maximum readability on every client
 *  - Clean typography with strong hierarchy
 *  - Single, prominent CTA button
 *  - Numbered steps instead of icon grids
 *  - Personal sign-off from the founder
 *  - Fully responsive, tested in dark mode
 */
function buildWelcomeEmail(username?: string): string {
  const displayName = username || "there";
  const year = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Welcome to FirstIssue.dev</title>
  <style type="text/css">
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body { background-color: #1a1a1a !important; }
      .email-bg { background-color: #1a1a1a !important; }
      .email-card { background-color: #262626 !important; border-color: #333333 !important; }
      .text-primary { color: #f5f5f5 !important; }
      .text-secondary { color: #a3a3a3 !important; }
      .text-muted { color: #737373 !important; }
      .step-number { background-color: #333333 !important; color: #00ADB5 !important; }
      .divider { border-color: #333333 !important; }
      .footer-text { color: #737373 !important; }
    }

    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-card { padding: 32px 24px !important; }
      .email-container { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f6f6;">
    <tr>
      <td align="center" class="email-container" style="padding:40px 20px;">

        <!-- Inner container -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span class="text-primary" style="font-size:18px;font-weight:700;color:#171717;letter-spacing:-0.3px;">
                FirstIssue.dev
              </span>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:40px 36px;">

              <!-- Greeting -->
              <h1 class="text-primary" style="margin:0 0 12px;font-size:22px;font-weight:700;color:#171717;line-height:1.3;">
                Welcome, ${displayName}
              </h1>

              <p class="text-secondary" style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#525252;">
                Your account is ready. FirstIssue.dev helps you discover beginner-friendly open source issues, get AI-powered recommendations, and build a verifiable contribution portfolio.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:32px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://firstissue.dev/explore" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="14%" fillcolor="#171717">
                      <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">Explore Issues</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="https://firstissue.dev/explore" style="display:inline-block;padding:12px 28px;background-color:#171717;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;line-height:1;">
                      Explore Issues
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td class="divider" style="border-top:1px solid #e5e5e5;padding-top:28px;"></td></tr>
              </table>

              <!-- Getting started steps -->
              <p class="text-primary" style="margin:0 0 20px;font-size:14px;font-weight:600;color:#171717;text-transform:uppercase;letter-spacing:0.5px;">
                Get started
              </p>

              <!-- Step 1 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="vertical-align:top;width:28px;padding-right:14px;">
                    <div class="step-number" style="width:28px;height:28px;border-radius:50%;background-color:#f5f5f5;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#171717;">1</div>
                  </td>
                  <td style="vertical-align:top;">
                    <p class="text-primary" style="margin:0 0 2px;font-size:14px;font-weight:600;color:#171717;line-height:28px;">Browse curated issues</p>
                    <p class="text-secondary" style="margin:0;font-size:13px;color:#737373;line-height:1.5;">Filter by language, framework, and difficulty to find issues that match your skills.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="vertical-align:top;width:28px;padding-right:14px;">
                    <div class="step-number" style="width:28px;height:28px;border-radius:50%;background-color:#f5f5f5;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#171717;">2</div>
                  </td>
                  <td style="vertical-align:top;">
                    <p class="text-primary" style="margin:0 0 2px;font-size:14px;font-weight:600;color:#171717;line-height:28px;">Get AI recommendations</p>
                    <p class="text-secondary" style="margin:0;font-size:13px;color:#737373;line-height:1.5;">Connect your GitHub and let our AI match you with issues tailored to your profile.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="vertical-align:top;width:28px;padding-right:14px;">
                    <div class="step-number" style="width:28px;height:28px;border-radius:50%;background-color:#f5f5f5;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#171717;">3</div>
                  </td>
                  <td style="vertical-align:top;">
                    <p class="text-primary" style="margin:0 0 2px;font-size:14px;font-weight:600;color:#171717;line-height:28px;">Build your portfolio</p>
                    <p class="text-secondary" style="margin:0;font-size:13px;color:#737373;line-height:1.5;">Track contributions, earn badges, and mint verified Proof of Work credentials.</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td class="divider" style="border-top:1px solid #e5e5e5;padding-top:24px;"></td></tr>
              </table>

              <!-- Sign off -->
              <p class="text-secondary" style="margin:0 0 4px;font-size:14px;line-height:1.7;color:#525252;">
                Have questions? Visit our <a href="https://firstissue.dev/docs" style="color:#171717;font-weight:600;text-decoration:underline;">Docs</a> and use the <strong>Contact Support</strong> button to reach us. Happy contributing!
              </p>
              <p class="text-secondary" style="margin:0;font-size:14px;color:#525252;">
                — Built with ❤️ for the open source community.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 20px 0;">
              <p class="footer-text" style="margin:0 0 4px;font-size:12px;color:#a3a3a3;line-height:1.5;">
                You're receiving this because you created an account on
                <a href="https://firstissue.dev" style="color:#a3a3a3;text-decoration:underline;">FirstIssue.dev</a>
              </p>
              <p class="footer-text" style="margin:0;font-size:12px;color:#a3a3a3;">
                &copy; ${year} FirstIssue.dev
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Build a plain-text fallback for email clients that don't support HTML.
 */
function buildWelcomeText(username?: string): string {
  const displayName = username || "there";
  const year = new Date().getFullYear();
  return [
    `Welcome, ${displayName}`,
    "",
    "Your account is ready. FirstIssue.dev helps you discover beginner-friendly",
    "open source issues, get AI-powered recommendations, and build a verifiable",
    "contribution portfolio.",
    "",
    "Explore issues: https://firstissue.dev/explore",
    "",
    "GET STARTED",
    "",
    "1. Browse curated issues",
    "   Filter by language, framework, and difficulty to find issues",
    "   that match your skills.",
    "",
    "2. Get AI recommendations",
    "   Connect your GitHub and let our AI match you with issues",
    "   tailored to your profile.",
    "",
    "3. Build your portfolio",
    "   Track contributions, earn badges, and mint verified",
    "   Proof of Work credentials.",
    "",
    "---",
    "",
    "Have questions? Visit https://firstissue.dev/docs and use the Contact Support button to reach us.",
    "Happy contributing!",
    "",
    "— Built with ❤️ for the open source community.",
    "",
    `© ${year} FirstIssue.dev`,
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
