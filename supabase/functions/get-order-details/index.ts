import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Validate API key from request header
    const apiKey = req.headers.get("X-API-Key");
    const validApiKey = Deno.env.get("D1_API_KEY");

    if (!apiKey || apiKey !== validApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized: Invalid API key"
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse request body
    const { order_number } = await req.json();

    if (!order_number) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order number is required"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get the TMS API key from environment
    const tmsApiKey = Deno.env.get("TMS_API_KEY");

    if (!tmsApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "TMS API key not configured on server"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Call the D1 TMS API
    const tmsResponse = await fetch(
      `https://cqvgadrdfrjekcgpwfyx.supabase.co/functions/v1/get-order?order_number=${order_number}`,
      {
        method: "GET",
        headers: {
          "X-API-Key": tmsApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!tmsResponse.ok) {
      const errorData = await tmsResponse.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          success: false,
          error: errorData.error || `TMS API returned status ${tmsResponse.status}`,
          message: errorData.message || "Failed to fetch order details"
        }),
        {
          status: tmsResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const orderData = await tmsResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        order: orderData
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in get-order-details function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
