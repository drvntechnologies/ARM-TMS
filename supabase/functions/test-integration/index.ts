import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { integration } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: setting } = await supabase
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", `${integration}_api_key`)
      .maybeSingle();

    const apiKey = setting?.setting_value;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: "API key not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (integration === "superdispatch") {
      const response = await fetch("https://api.superdispatch.com/v1/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          origin: { zip: "10001", state: "NY" },
          destination: { zip: "90001", state: "CA" },
          vehicles: [{ year: 2020, make: "Toyota", model: "Camry", type: "sedan", is_operable: true }],
          trailer_type: "open",
        }),
      });

      // 401/403 = bad key, 200/400/422 = key is valid (bad request body is still authenticated)
      const success = response.status !== 401 && response.status !== 403;

      return new Response(
        JSON.stringify({
          success,
          status: response.status,
          message: success ? "Connection successful" : "Authentication failed — check your API key",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Unknown integration" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
