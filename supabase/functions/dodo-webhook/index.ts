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

    // Cancellation events — the subscription was cancelled (by the user, the
    // merchant, or Dodo). The user keeps access until the end of the period
    // they already paid for. NOTE: "expired" is deliberately NOT here — see
    // isExpiry below. Conflating the two caused expired subs to show as
    // "cancelled" while wrongly retaining access (stale future expires_at).
    const isCancellation = [
      "subscription.cancelled",
      "subscription_cancelled",
      "subscription.canceled",
      "subscription_canceled",
    ].includes(event.toLowerCase());

    // Expiry events — the subscription reached the end of its term and is over.
    // Access must end now (unlike a scheduled cancellation).
    const isExpiry = [
      "subscription.expired",
      "subscription_expired",
    ].includes(event.toLowerCase());

    // Renewal trouble: a renewal payment failed and Dodo put the sub on hold,
    // or the initial mandate could not be created. These are NOT terminal — we
    // record them for visibility but do not revoke access automatically (Dodo
    // retries; a terminal cancelled/expired event will follow if it gives up).
    const isOnHold = [
      "subscription.on_hold",
      "subscription_on_hold",
    ].includes(event.toLowerCase());
    const isFailed = [
      "subscription.failed",
      "subscription_failed",
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

      await recordSupporterEvent(supabase, {
        userId,
        subscriptionId,
        customerId,
        eventType: event,
        status: data?.status,
      });
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

        await recordSupporterEvent(supabase, {
          userId: supporter.user_id,
          subscriptionId,
          customerId,
          eventType: event,
          status: data?.status,
        });
      } else {
        console.log("⚠️ Renewal event but no matching supporter found. subscriptionId:", subscriptionId, "userId:", userId);
      }
    } else if (isSubscriptionUpdated) {
      console.log(">>> Processing SUBSCRIPTION UPDATED event");

      // Dodo fires subscription.updated whenever any field changes. Inspect the
      // payload to decide whether this update is a (scheduled) cancellation, an
      // expiry, or just a benign field change.
      const newStatus = (data.status || "").toLowerCase();
      const scheduledToCancel = data.cancel_at_next_billing_date === true;

      if (newStatus === "cancelled" || newStatus === "canceled" || scheduledToCancel) {
        // Catches cancellations made through Dodo's own customer portal, where
        // the status stays "active" but cancel_at_next_billing_date flips true.
        console.log(">>> Subscription update indicates cancellation (scheduled:", scheduledToCancel, ")");
        await handleCancellation(supabase, userId, subscriptionId, customerId, data, event);
      } else if (newStatus === "expired") {
        console.log(">>> Subscription update indicates expiry");
        await handleExpiry(supabase, userId, subscriptionId, customerId, data, event);
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
      await handleCancellation(supabase, userId, subscriptionId, customerId, data, event);
    } else if (isExpiry) {
      console.log(">>> Processing EXPIRY event");
      await handleExpiry(supabase, userId, subscriptionId, customerId, data, event);
    } else if (isOnHold || isFailed) {
      // Non-terminal renewal/mandate trouble. Record it but keep access — Dodo
      // retries, and a terminal cancelled/expired event will arrive if it ends.
      console.log(`>>> Processing ${isOnHold ? "ON_HOLD" : "FAILED"} event (recording only, access unchanged)`);
      await recordSupporterEvent(supabase, {
        userId,
        subscriptionId,
        customerId,
        eventType: event,
        status: data.status,
      });
    } else if (isPaymentFailed) {
      console.log(">>> Payment failed for subscription:", subscriptionId);
      await recordSupporterEvent(supabase, {
        userId,
        subscriptionId,
        customerId,
        eventType: event,
        status: data.status,
      });
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
 * Resolve the local supporter's user_id from whatever identifiers a Dodo event
 * carries. Cancellation/expiry events often omit user_id from metadata, so we
 * fall back to the bound subscription_id and then the customer_id.
 */
async function resolveTargetUserId(
  supabase: any,
  userId: string | undefined,
  subscriptionId: string | undefined,
  customerId: string | undefined,
): Promise<string | undefined> {
  if (userId) return userId;

  if (subscriptionId) {
    const { data: match } = await supabase
      .from("supporters")
      .select("user_id")
      .eq("dodo_subscription_id", subscriptionId)
      .maybeSingle();
    if (match) {
      console.log("Found supporter by subscription_id:", subscriptionId, "-> user:", match.user_id);
      return match.user_id;
    }
  }

  if (customerId) {
    const { data: match } = await supabase
      .from("supporters")
      .select("user_id")
      .eq("dodo_customer_id", customerId)
      .maybeSingle();
    if (match) {
      console.log("Found supporter by customer_id:", customerId, "-> user:", match.user_id);
      return match.user_id;
    }
  }

  return undefined;
}

/**
 * Best-effort audit log. Records every meaningful lifecycle event into the
 * `supporter_events` table so that, even when edge-function logs have rolled
 * off, you can always answer "what changed this row and why?". Wrapped so a
 * missing table (migration not yet applied) never breaks webhook processing.
 */
async function recordSupporterEvent(
  supabase: any,
  e: {
    userId: string | undefined;
    subscriptionId: string | undefined;
    customerId: string | undefined;
    eventType: string;
    status?: string;
    cancelReason?: string;
  },
) {
  try {
    const { error } = await supabase.from("supporter_events").insert({
      user_id: e.userId || null,
      dodo_subscription_id: e.subscriptionId || null,
      dodo_customer_id: e.customerId || null,
      event_type: e.eventType || null,
      dodo_status: e.status || null,
      cancel_reason: e.cancelReason || null,
    });
    if (error) console.warn("Could not write supporter_events audit row:", error.message);
  } catch (err) {
    console.warn("supporter_events audit insert threw (table may not exist yet):", err);
  }
}

/**
 * Handle a (scheduled) cancellation. The subscription was cancelled but the
 * user keeps access until the end of the period they already paid for, so we
 * set status="cancelled" and pin expires_at to the period end (next_billing_date).
 */
async function handleCancellation(
  supabase: any,
  userId: string | undefined,
  subscriptionId: string | undefined,
  customerId: string | undefined,
  data: any = {},
  eventType = "subscription.cancelled",
) {
  const targetUserId = await resolveTargetUserId(supabase, userId, subscriptionId, customerId);

  if (!targetUserId) {
    console.error("⚠️ Could not find supporter to cancel. userId:", userId, "subscriptionId:", subscriptionId, "customerId:", customerId);
    await recordSupporterEvent(supabase, { userId, subscriptionId, customerId, eventType, status: data?.status, cancelReason: data?.cancel_reason });
    return;
  }

  // Decide when access should actually end:
  //  - Scheduled cancellation (cancel_at_next_billing_date = true, status still
  //    "active"): the user keeps what they paid for, so access runs until the
  //    period end (next_billing_date).
  //  - Terminal cancellation (status already "cancelled", cancelled_at present):
  //    the subscription is over now, so access ends at cancelled_at.
  const scheduled = data?.cancel_at_next_billing_date === true;
  const accessEnds = scheduled
    ? (data?.next_billing_date || null)
    : (data?.cancelled_at || new Date().toISOString());

  const { error } = await supabase
    .from("supporters")
    .update({
      status: "cancelled",
      ...(accessEnds && { expires_at: new Date(accessEnds).toISOString() }),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", targetUserId);

  if (error) console.error("Error cancelling supporter:", error);
  else console.log(`✅ Supporter cancelled (${scheduled ? "scheduled" : "terminal"}) for user:`, targetUserId, "access until:", accessEnds || "(unchanged)");

  await recordSupporterEvent(supabase, {
    userId: targetUserId,
    subscriptionId,
    customerId,
    eventType,
    status: data?.status,
    cancelReason: data?.cancel_reason,
  });
}

/**
 * Handle expiry. Unlike a cancellation, the subscription's term is fully over,
 * so access ends now: status="expired" and expires_at is set to the present.
 */
async function handleExpiry(
  supabase: any,
  userId: string | undefined,
  subscriptionId: string | undefined,
  customerId: string | undefined,
  data: any = {},
  eventType = "subscription.expired",
) {
  const targetUserId = await resolveTargetUserId(supabase, userId, subscriptionId, customerId);

  if (!targetUserId) {
    console.error("⚠️ Could not find supporter to expire. userId:", userId, "subscriptionId:", subscriptionId, "customerId:", customerId);
    await recordSupporterEvent(supabase, { userId, subscriptionId, customerId, eventType, status: data?.status });
    return;
  }

  const { error } = await supabase
    .from("supporters")
    .update({
      status: "expired",
      expires_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", targetUserId);

  if (error) console.error("Error expiring supporter:", error);
  else console.log("✅ Supporter expired (access revoked) for user:", targetUserId);

  await recordSupporterEvent(supabase, {
    userId: targetUserId,
    subscriptionId,
    customerId,
    eventType,
    status: data?.status,
  });
}
