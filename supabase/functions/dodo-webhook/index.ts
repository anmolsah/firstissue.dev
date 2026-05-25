// Supabase Edge Function: Dodo Payments Webhook Handler
// Deploy: supabase functions deploy dodo-webhook
// Set webhook URL in Dodo dashboard to: https://<your-project>.supabase.co/functions/v1/dodo-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
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

    // Dodo Payments uses "type" as the event field name
    const event = payload.type || payload.event || payload.event_type || "";
    const data = payload.data || payload;

    console.log("Parsed event type:", event);
    console.log("Parsed data:", JSON.stringify(data));

    // ── Extract fields from Dodo's actual payload structure ──
    // Dodo nests customer info inside data.customer object:
    //   data.customer.customer_id, data.customer.email, data.customer.name
    // Subscription ID is at data.subscription_id
    // Metadata is at data.metadata (top-level in data)
    const metadata = data.metadata || data.customer?.metadata || payload.metadata || {};
    const userId = metadata.user_id || metadata.userId;
    const customerEmail = data.customer?.email || data.email || data.customer_email || payload.customer?.email;
    const customerId = data.customer?.customer_id || data.customer_id || data.customer?.id;
    const subscriptionId = data.subscription_id;

    console.log("Extracted - userId:", userId, "email:", customerEmail, "customerId:", customerId, "subscriptionId:", subscriptionId);

    // ── Classify the event type ──

    // Payment/subscription activation events
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
      "subscription.created",
      "subscription_created",
    ].includes(event.toLowerCase());

    // Subscription renewal events
    const isRenewal = [
      "subscription.renewed",
      "subscription_renewed",
    ].includes(event.toLowerCase());

    // Subscription updated events (can indicate cancellation scheduled)
    const isSubscriptionUpdated = [
      "subscription.updated",
      "subscription_updated",
    ].includes(event.toLowerCase());

    // Cancellation events
    const isCancellation = [
      "subscription.cancelled",
      "subscription_cancelled",
      "subscription.canceled",
      "subscription_canceled",
      "subscription.expired",
      "subscription_expired",
    ].includes(event.toLowerCase());

    // Payment failure events
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

      // Check if there's an existing record that was cancelled.
      // If so, do NOT re-activate — the user explicitly cancelled and
      // Dodo may still fire payment.succeeded for the current billing period.
      const { data: existingSupporter } = await supabase
        .from("supporters")
        .select("status, dodo_subscription_id, dodo_customer_id")
        .eq("user_id", userId)
        .single();

      if (existingSupporter?.status === "cancelled") {
        console.log("⚠️ Payment success event received but subscription is cancelled. Only updating IDs, NOT re-activating for user:", userId);

        // Still update the Dodo IDs if they were missing
        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (subscriptionId && !existingSupporter.dodo_subscription_id) {
          updates.dodo_subscription_id = subscriptionId;
        }
        if (customerId && !existingSupporter.dodo_customer_id) {
          updates.dodo_customer_id = customerId;
        }

        await supabase
          .from("supporters")
          .update(updates)
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({ received: true, info: "Subscription cancelled, payment event ignored" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate expiry (1 month from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const supporterRecord = {
        user_id: userId,
        email: customerEmail,
        dodo_customer_id: customerId || null,
        dodo_subscription_id: subscriptionId || null,
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
    } else if (isRenewal) {
      console.log(">>> Processing RENEWAL event");

      // Before renewing, check if the user has locally cancelled.
      // If they cancelled, do NOT re-activate — the cancellation should stick.
      // Look up by subscription ID first, then by user_id from metadata.
      let supporter = null;

      if (subscriptionId) {
        const { data: subMatch } = await supabase
          .from("supporters")
          .select("user_id, status, dodo_subscription_id")
          .eq("dodo_subscription_id", subscriptionId)
          .single();
        supporter = subMatch;
      }

      if (!supporter && userId) {
        const { data: userMatch } = await supabase
          .from("supporters")
          .select("user_id, status, dodo_subscription_id")
          .eq("user_id", userId)
          .single();
        supporter = userMatch;
      }

      if (supporter?.status === "cancelled") {
        console.log("⚠️ Renewal event received but subscription is locally cancelled. Ignoring re-activation for user:", supporter.user_id);
        return new Response(
          JSON.stringify({ received: true, info: "Subscription is cancelled, renewal ignored" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Subscription is still active, extend the expiry
      if (supporter) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const { error } = await supabase
          .from("supporters")
          .update({
            status: "active",
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
            // Update IDs in case they were missing before
            ...(subscriptionId && { dodo_subscription_id: subscriptionId }),
            ...(customerId && { dodo_customer_id: customerId }),
          })
          .eq("user_id", supporter.user_id);

        if (error) console.error("Error renewing supporter:", error);
        else console.log("✅ Supporter renewed for user:", supporter.user_id);
      } else {
        console.log("⚠️ Renewal event but no matching supporter found. subscriptionId:", subscriptionId, "userId:", userId);
      }
    } else if (isSubscriptionUpdated) {
      console.log(">>> Processing SUBSCRIPTION UPDATED event");

      // Dodo fires subscription.updated when fields change.
      // Check if the status in the payload indicates cancellation scheduled.
      const newStatus = data.status;

      if (newStatus === "cancelled" || newStatus === "canceled") {
        // Treat as a cancellation event
        console.log(">>> Subscription updated to cancelled status");
        await handleCancellation(supabase, userId, subscriptionId, customerId);
      } else {
        // Generic update — update IDs if we have them
        if (subscriptionId && userId) {
          const { error } = await supabase
            .from("supporters")
            .update({
              ...(subscriptionId && { dodo_subscription_id: subscriptionId }),
              ...(customerId && { dodo_customer_id: customerId }),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (error) console.error("Error updating supporter:", error);
          else console.log("✅ Supporter record updated for user:", userId);
        }
      }
    } else if (isCancellation) {
      console.log(">>> Processing CANCELLATION event");
      await handleCancellation(supabase, userId, subscriptionId, customerId);
    } else if (isPaymentFailed) {
      console.log(">>> Payment failed for subscription:", subscriptionId);
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

/**
 * Handle cancellation from Dodo webhooks.
 * Looks up the supporter by user_id (from metadata) OR by dodo_subscription_id
 * since Dodo cancellation events may not carry user_id in metadata.
 */
async function handleCancellation(
  supabase: any,
  userId: string | undefined,
  subscriptionId: string | undefined,
  customerId: string | undefined
) {
  // Try to find the supporter record — first by user_id, then by subscription_id
  let targetUserId = userId;

  if (!targetUserId && subscriptionId) {
    const { data: match } = await supabase
      .from("supporters")
      .select("user_id")
      .eq("dodo_subscription_id", subscriptionId)
      .single();

    if (match) {
      targetUserId = match.user_id;
      console.log("Found supporter by subscription_id:", subscriptionId, "-> user:", targetUserId);
    }
  }

  if (!targetUserId && customerId) {
    const { data: match } = await supabase
      .from("supporters")
      .select("user_id")
      .eq("dodo_customer_id", customerId)
      .single();

    if (match) {
      targetUserId = match.user_id;
      console.log("Found supporter by customer_id:", customerId, "-> user:", targetUserId);
    }
  }

  if (targetUserId) {
    const { error } = await supabase
      .from("supporters")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", targetUserId);

    if (error) console.error("Error cancelling supporter:", error);
    else console.log("✅ Supporter cancelled for user:", targetUserId);
  } else {
    console.error("⚠️ Could not find supporter to cancel. userId:", userId, "subscriptionId:", subscriptionId, "customerId:", customerId);
  }
}
