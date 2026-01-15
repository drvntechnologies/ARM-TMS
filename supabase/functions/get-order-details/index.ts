import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get the API key from environment variable
    const TMS_API_KEY = Deno.env.get("TMS_API_KEY");

    if (!TMS_API_KEY) {
      console.error("TMS_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error: TMS_API_KEY not configured",
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

    // Validate the incoming API key
    const clientApiKey = req.headers.get("X-API-Key");

    if (!clientApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing authorization header",
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

    // Parse the request body
    const { order_number } = await req.json();

    if (!order_number) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order number is required",
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

    // Make request to the external TMS API
    const tmsApiUrl = `https://d1api.stadiumtms.com/api/orders/${order_number}`;

    console.log(`Fetching order ${order_number} from TMS API`);

    const tmsResponse = await fetch(tmsApiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TMS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!tmsResponse.ok) {
      const errorText = await tmsResponse.text();
      console.error(`TMS API error: ${tmsResponse.status} - ${errorText}`);

      if (tmsResponse.status === 401) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Authentication failed with TMS API",
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

      if (tmsResponse.status === 404) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Order not found",
          }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `TMS API error: ${tmsResponse.status}`,
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

    console.log(`Successfully fetched order ${order_number}`);

    return new Response(
      JSON.stringify({
        success: true,
        order: orderData,
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
    console.error("Error processing request:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
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