// Supabase Edge Function: Dodo Payments Webhook Handler
// Deploy: supabase functions deploy dodo-webhook
// Set webhook URL in Dodo dashboard to: https://<your-project>.supabase.co/functions/v1/dodo-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-signature, webhook-id, webhook-timestamp",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log("=== DODO WEBHOOK RAW PAYLOAD ===");
    console.log(rawBody);
    console.log("=== END RAW PAYLOAD ===");

    const payload = JSON.parse(rawBody);

    const webhookSecret = Deno.env.get("DODO_WEBHOOK_SECRET");

    // Log all headers for debugging
    console.log("Webhook headers:");
    req.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    // Optional: Verify webhook signature
    const signature = req.headers.get("webhook-signature");
    if (webhookSecret && signature) {
      console.log("Webhook signature present:", !!signature);
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Dodo Payments can send events in different formats
    // Try multiple paths to find the event type
    const event = payload.event || payload.type || payload.event_type || "";
    const data = payload.data || payload;

    console.log("Parsed event type:", event);
    console.log("Parsed data:", JSON.stringify(data));

    // Check for metadata in various locations (Dodo may nest it differently)
    const metadata = data.metadata || data.payment?.metadata || payload.metadata || {};
    const userId = metadata.user_id || metadata.userId;
    const customerEmail = data.customer?.email || data.email || data.customer_email || payload.customer?.email;
    const customerId = data.customer_id || data.customer?.id || data.payer_id;
    const subscriptionId = data.subscription_id || data.payment_id || data.id || payload.payment_id;

    console.log("Extracted - userId:", userId, "email:", customerEmail, "customerId:", customerId);

    // Handle payment success events (match various Dodo event name formats)
    const isPaymentSuccess = [
      "payment.succeeded",
      "payment_succeeded",
      "payment.completed",
      "payment_completed",
      "checkout.completed",
      "checkout_completed",
      "order.completed",
      "order_completed",
      "subscription.active",
      "subscription_active",
    ].includes(event.toLowerCase());

    // Handle cancellation events
    const isCancellation = [
      "subscription.cancelled",
      "subscription_cancelled",
      "subscription.canceled",
      "subscription_canceled",
      "subscription.expired",
      "subscription_expired",
    ].includes(event.toLowerCase());

    // Handle payment failure events
    const isPaymentFailed = [
      "payment.failed",
      "payment_failed",
      "payment.declined",
      "payment_declined",
    ].includes(event.toLowerCase());

    if (isPaymentSuccess) {
      console.log(">>> Processing PAYMENT SUCCESS event");

      if (!userId) {
        console.error("No user_id found in metadata. Full metadata:", JSON.stringify(metadata));
        console.error("Full payload for debugging:", JSON.stringify(payload));

        // Still return 200 so Dodo doesn't retry
        return new Response(
          JSON.stringify({ received: true, warning: "No user_id in metadata" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate expiry (1 month from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const supporterRecord = {
        user_id: userId,
        email: customerEmail,
        dodo_customer_id: customerId,
        dodo_subscription_id: subscriptionId,
        plan: "supporter",
        status: "active",
        amount_cents: 900,
        currency: "USD",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Upserting supporter record:", JSON.stringify(supporterRecord));

      const { error } = await supabase
        .from("supporters")
        .upsert(supporterRecord, { onConflict: "user_id" });

      if (error) {
        console.error("Error upserting supporter:", JSON.stringify(error));
      } else {
        console.log("✅ Supporter activated for user:", userId);
      }
    } else if (isCancellation) {
      console.log(">>> Processing CANCELLATION event");

      if (userId) {
        const { error } = await supabase
          .from("supporters")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) console.error("Error cancelling supporter:", error);
        else console.log("Supporter cancelled for user:", userId);
      }
    } else if (isPaymentFailed) {
      console.log(">>> Payment failed:", subscriptionId);
    } else {
      console.log(">>> Unhandled webhook event:", event);
      console.log(">>> Full payload:", JSON.stringify(payload));
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
