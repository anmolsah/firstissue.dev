// Supabase Edge Function: Create Dodo Payments Checkout Session
// Deploy: supabase functions deploy create-checkout

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, email, returnUrl } = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing userId or email" }),
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

    // Determine environment from key prefix
    // Test keys start with "sk_test_", Live keys start with "sk_live_"
    const isTestMode = DODO_API_KEY.includes("test");
    const baseUrl = isTestMode
      ? "https://test.dodopayments.com"
      : "https://live.dodopayments.com";

    // Create Dodo Payments checkout session
    // Docs: https://docs.dodopayments.com/api-reference/checkout-sessions/create
    const dodoResponse = await fetch(`${baseUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: Deno.env.get("DODO_PRODUCT_ID") || "YOUR_PRODUCT_ID",
            quantity: 1,
          },
        ],
        customer: {
          email: email,
          name: email.split("@")[0],
        },
        return_url: returnUrl || "https://firstissue.dev/support?success=true",
        metadata: {
          user_id: userId,
          plan: "supporter",
        },
      }),
    });

    if (!dodoResponse.ok) {
      const errorText = await dodoResponse.text();
      console.error("Dodo API error:", dodoResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dodoData = await dodoResponse.json();
    console.log("Dodo checkout created:", JSON.stringify(dodoData));

    return new Response(
      JSON.stringify({
        checkoutUrl: dodoData.checkout_url || dodoData.payment_link || dodoData.url,
        sessionId: dodoData.session_id,
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
