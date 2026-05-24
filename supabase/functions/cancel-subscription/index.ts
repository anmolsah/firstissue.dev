// Supabase Edge Function: Cancel Dodo Payments Subscription
// Deploy: supabase functions deploy cancel-subscription

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    if (subscriptionId && DODO_API_KEY) {
      // Determine environment from key prefix
      const isTestMode = DODO_API_KEY.includes("test");
      const baseUrl = isTestMode
        ? "https://test.dodopayments.com"
        : "https://live.dodopayments.com";

      try {
        // Cancel the subscription via Dodo Payments API
        // Dodo requires cancel_at_next_billing_date: true to schedule cancellation
        // at the end of the current billing period (not a direct status change)
        const dodoResponse = await fetch(`${baseUrl}/subscriptions/${subscriptionId}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${DODO_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cancel_at_next_billing_date: true,
          }),
        });

        if (!dodoResponse.ok) {
          const errorText = await dodoResponse.text();
          console.error("Dodo API error:", dodoResponse.status, errorText);
          // Don't fail the whole request, proceed to cancel locally
        } else {
          const dodoData = await dodoResponse.json();
          console.log("Dodo subscription cancelled:", JSON.stringify(dodoData));
        }
      } catch (err) {
        console.error("Failed to reach Dodo Payments API:", err);
      }
    } else {
      console.log("No Dodo subscription ID found or API key missing, proceeding with local cancellation only.");
    }

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
