/**
 * Placeholder stub for image optimization on Supabase Edge without sharp.
 * 
 * Notes:
 * - Supabase Edge (Deno) cannot run sharp; use Supabase Image Transform API or WASM codecs (e.g., Squoosh) when implementing.
 * - This stub documents the intended interface; replace with a real implementation.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  return new Response(
    JSON.stringify({
      error: "Not implemented",
      message: "Use Supabase Transform API or a WASM codec for image optimization.",
    }),
    {
      status: 501,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
});
