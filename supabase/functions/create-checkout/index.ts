// Supabase Edge Function: Create Dodo Payments Checkout Session
// Deploy: supabase functions deploy create-checkout

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/supabaseClient.ts";

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { returnUrl } = await req.json().catch(() => ({}));

    // ── Authenticate the caller; derive identity from the JWT, not the body ──
    // The user_id placed in checkout metadata becomes the activation target in
    // the webhook, so it must come from a verified session — never from
    // attacker-controlled request fields.
    let userClient;
    try {
      userClient = createUserClient(req);
    } catch {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const email = user.email;
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Authenticated user has no email address" }),
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

    // Fail loudly if the product isn't configured rather than sending a
    // placeholder that produces a confusing downstream Dodo error.
    const productId = Deno.env.get("DODO_PRODUCT_ID");
    if (!productId) {
      console.error("DODO_PRODUCT_ID is not configured.");
      return new Response(
        JSON.stringify({ error: "Checkout is not configured. Please contact support." }),
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
            product_id: productId,
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
