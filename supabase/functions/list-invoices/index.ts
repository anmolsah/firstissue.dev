// Supabase Edge Function: List Dodo Payments Invoices for a User
// Deploy: supabase functions deploy list-invoices

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user from the request Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with user's Auth Header (respects RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user identity
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch the supporter record to get the Dodo customer and subscription IDs.
    // Note: We need the service client to access supporters table bypass if needed,
    // but the policy allows users to view their own supporter status, so user client works!
    const { data: supporter, error: dbError } = await supabaseClient
      .from("supporters")
      .select("dodo_customer_id, dodo_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (dbError) {
      console.error("Database error fetching supporter status:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to query subscription status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If there is no supporter record, the user has never purchased any subscription,
    // so we can immediately return an empty invoices list.
    if (!supporter) {
      return new Response(
        JSON.stringify({ items: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Query the Dodo Payments API using the Customer ID or Subscription ID
    const DODO_API_KEY = Deno.env.get("DODO_API_KEY");
    if (!DODO_API_KEY) {
      console.error("DODO_API_KEY environment variable is not configured.");
      return new Response(
        JSON.stringify({ error: "Billing service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine Dodo environment base URL from API key prefix
    const isTestMode = DODO_API_KEY.includes("test");
    const baseUrl = isTestMode
      ? "https://test.dodopayments.com"
      : "https://live.dodopayments.com";

    // Set query parameters: prefer customer_id (shows all payments), fallback to subscription_id
    let url = `${baseUrl}/payments`;
    if (supporter.dodo_customer_id) {
      url += `?customer_id=${encodeURIComponent(supporter.dodo_customer_id)}`;
    } else if (supporter.dodo_subscription_id) {
      url += `?subscription_id=${encodeURIComponent(supporter.dodo_subscription_id)}`;
    } else {
      // Supporter record exists (e.g. mock supporter created locally), but no Dodo IDs are bound yet
      return new Response(
        JSON.stringify({ items: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Querying Dodo Payments API: ${url}`);

    const dodoResponse = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!dodoResponse.ok) {
      const errorText = await dodoResponse.text();
      console.error(`Dodo Payments API error (${dodoResponse.status}):`, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve billing records from provider" }),
        { status: dodoResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dodoData = await dodoResponse.json();
    const rawItems = dodoData.items || [];

    // Map and sanitize the response items to expose only necessary fields to the client
    const items = rawItems.map((item: any) => ({
      payment_id: item.payment_id || item.id,
      created_at: item.created_at,
      amount: item.amount,
      currency: item.currency,
      status: item.status,
      invoice_url: item.invoice_url || null,
      invoice_id: item.invoice_id || null,
    }));

    return new Response(
      JSON.stringify({ items }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Unhandled error listing invoices:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
