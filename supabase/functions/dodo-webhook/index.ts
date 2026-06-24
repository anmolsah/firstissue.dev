// Supabase Edge Function: Dodo Payments Webhook Handler
// Deploy: supabase functions deploy dodo-webhook
// Set webhook URL in Dodo dashboard to: https://<your-project>.supabase.co/functions/v1/dodo-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabaseClient.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { verifyStandardWebhook } from "../_shared/verifyWebhook.ts";

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    // ── Verify the webhook signature BEFORE trusting any of the payload ──
    // This endpoint grants paid entitlements based on the body, so an
    // unsigned/forged request must never be processed.
    const webhookSecret = Deno.env.get("DODO_WEBHOOK_SECRET");
    if (!webhookSecret) {
      // Fail closed: refuse to process if the verification secret is missing.
      console.error("DODO_WEBHOOK_SECRET is not configured — rejecting webhook.");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verification = await verifyStandardWebhook(webhookSecret, req.headers, rawBody);
    if (!verification.valid) {
      console.error("⛔ Webhook signature verification failed:", verification.reason);
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("✅ Webhook signature verified");

    const payload = JSON.parse(rawBody);

    // Initialize Supabase admin client (via shared pooling-optimized factory)
    const supabase = createAdminClient();

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
      const { data: existingSupporter } = await supabase
        .from("supporters")
        .select("status, dodo_subscription_id, dodo_customer_id")
        .eq("user_id", userId)
        .single();

      // Only ignore a payment event for an already-cancelled subscription when it
      // refers to that SAME subscription (Dodo may still fire payment.succeeded
      // for the billing period the user already cancelled). A different — or
      // newly-present — subscription_id means the user RE-SUBSCRIBED, which is a
      // genuine new purchase that must re-activate them.
      const isStaleEventForCancelledSub =
        existingSupporter?.status === "cancelled" &&
        subscriptionId &&
        existingSupporter.dodo_subscription_id &&
        subscriptionId === existingSupporter.dodo_subscription_id;

      if (isStaleEventForCancelledSub) {
        console.log("⚠️ Payment event for the already-cancelled subscription; NOT re-activating for user:", userId);

        await supabase
          .from("supporters")
          .update({ updated_at: new Date().toISOString() })
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({ received: true, info: "Subscription cancelled, payment event ignored" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (existingSupporter?.status === "cancelled") {
        console.log("✅ Previously-cancelled user re-subscribed (new subscription id); re-activating user:", userId);
      }

      const supporterRecord = {
        user_id: userId,
        email: customerEmail,
        dodo_customer_id: customerId || null,
        dodo_subscription_id: subscriptionId || null,
        plan: "supporter",
        status: "active",
        amount_cents: extractAmountCents(data),
        currency: extractCurrency(data),
        started_at: new Date().toISOString(),
        expires_at: computeExpiry(data),
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
        const { error } = await supabase
          .from("supporters")
          .update({
            status: "active",
            expires_at: computeExpiry(data),
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

// ── Payload extraction helpers ──
// Dodo's payloads vary slightly by event type, so read defensively and fall
// back to the historical defaults ($9 USD / 1 month) when a field is absent.

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Compute the local entitlement expiry.
 * Prefer the subscription's actual next billing date from the provider so a
 * paying user never loses access early. A small grace period absorbs any
 * delay in the renewal webhook arriving.
 */
function computeExpiry(data: any): string {
  const GRACE_DAYS = 3;
  const candidate =
    data?.next_billing_date ||
    data?.current_period_end ||
    data?.subscription?.next_billing_date;

  let base: Date;
  if (candidate) {
    const parsed = new Date(candidate);
    base = isNaN(parsed.getTime()) ? addMonths(new Date(), 1) : parsed;
  } else {
    base = addMonths(new Date(), 1);
  }

  base.setDate(base.getDate() + GRACE_DAYS);
  return base.toISOString();
}

function extractAmountCents(data: any): number {
  const amount =
    data?.total_amount ??
    data?.amount ??
    data?.recurring_pre_tax_amount ??
    data?.payment?.total_amount;
  return typeof amount === "number" && amount > 0 ? amount : 900;
}

function extractCurrency(data: any): string {
  return data?.currency || data?.payment?.currency || "USD";
}

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
