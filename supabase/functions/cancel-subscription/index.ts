// Supabase Edge Function: Cancel Dodo Payments Subscription
// Deploy: supabase functions deploy cancel-subscription

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseClient.ts";

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const DODO_API_KEY = Deno.env.get("DODO_API_KEY");
    if (!DODO_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Dodo API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client (via shared pooling-optimized factory)
    const supabase = createAdminClient();

    // Fetch the supporter record to get the subscription ID
    const { data: supporter, error: fetchError } = await supabase
      .from("supporters")
      .select("dodo_subscription_id, status")
      .eq("user_id", userId)
      .single();

    if (fetchError || !supporter) {
      return new Response(
        JSON.stringify({ error: "Supporter record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (supporter.status === "cancelled") {
        return new Response(
            JSON.stringify({ message: "Subscription already cancelled" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
    }

    const subscriptionId = supporter.dodo_subscription_id;

    // Guard against cancelling locally while Dodo keeps billing. If we have no
    // subscription ID, the activation webhook likely hasn't finished binding it
    // yet. Marking the row "cancelled" here would show "cancelled" in the UI
    // while the card is still charged — a real billing mismatch. Refuse and ask
    // the user to retry shortly instead.
    if (!subscriptionId) {
      console.warn("Cancellation requested but no Dodo subscription ID is bound yet for user:", userId);
      return new Response(
        JSON.stringify({
          error: "Your subscription is still being set up. Please try cancelling again in a minute.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine environment from key prefix
    const isTestMode = DODO_API_KEY.includes("test");
    const baseUrl = isTestMode
      ? "https://test.dodopayments.com"
      : "https://live.dodopayments.com";

    // Cancel the subscription via Dodo Payments API.
    // Dodo requires cancel_at_next_billing_date: true to schedule cancellation
    // at the end of the current billing period (not a direct status change).
    // If this call fails we must NOT cancel locally, otherwise the UI and the
    // provider fall out of sync and the user keeps getting billed.
    let dodoResponse: Response;
    try {
      dodoResponse = await fetch(`${baseUrl}/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${DODO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancel_at_next_billing_date: true,
        }),
      });
    } catch (err) {
      console.error("Failed to reach Dodo Payments API:", err);
      return new Response(
        JSON.stringify({ error: "Could not reach the payment provider. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!dodoResponse.ok) {
      const errorText = await dodoResponse.text();
      console.error("Dodo API error:", dodoResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to cancel the subscription with the payment provider. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dodoData = await dodoResponse.json();
    console.log("Dodo subscription cancelled:", JSON.stringify(dodoData));

    // Proactively update it locally for faster UI feedback.
    const { error: updateError } = await supabase
      .from("supporters")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("user_id", userId);
      
    if (updateError) {
        console.error("Failed to update status locally:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update status locally" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription successfully cancelled.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
