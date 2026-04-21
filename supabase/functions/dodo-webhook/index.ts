// Supabase Edge Function: Dodo Payments Webhook Handler
// Deploy: supabase functions deploy dodo-webhook
// Set webhook URL in Dodo dashboard to: https://<your-project>.supabase.co/functions/v1/dodo-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-signature",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const webhookSecret = Deno.env.get("DODO_WEBHOOK_SECRET");

    // Optional: Verify webhook signature
    const signature = req.headers.get("webhook-signature");
    if (webhookSecret && signature) {
      // Dodo webhook verification logic
      // In production, verify the signature matches
      console.log("Webhook signature present:", !!signature);
    }

    console.log("Webhook event:", payload.event || payload.type);

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event = payload.event || payload.type;
    const data = payload.data || payload;

    switch (event) {
      case "payment.succeeded":
      case "payment_succeeded": {
        const userId = data.metadata?.user_id;
        const email = data.customer?.email || data.email;

        if (!userId) {
          console.error("No user_id in metadata");
          break;
        }

        // Calculate expiry (1 month from now)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const { error } = await supabase
          .from("supporters")
          .upsert(
            {
              user_id: userId,
              email: email,
              dodo_customer_id: data.customer_id || data.customer?.id,
              dodo_subscription_id: data.subscription_id || data.payment_id,
              plan: "supporter",
              status: "active",
              amount_cents: 900,
              currency: "USD",
              started_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (error) {
          console.error("Error upserting supporter:", error);
        } else {
          console.log("Supporter activated for user:", userId);
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription_cancelled": {
        const userId = data.metadata?.user_id;
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
        break;
      }

      case "payment.failed":
      case "payment_failed": {
        console.log("Payment failed:", data.payment_id);
        break;
      }

      default:
        console.log("Unhandled webhook event:", event);
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
