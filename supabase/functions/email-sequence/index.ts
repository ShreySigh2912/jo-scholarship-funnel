import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailSequenceRequest {
  applicationId: string;
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationId, name, email }: EmailSequenceRequest = await req.json();

    // Create email sequence entry starting at stage 0 (immediate email)
    const { data: sequenceData, error: sequenceError } = await supabase
      .from("email_sequences")
      .insert({
        application_id: applicationId,
        email: email,
        name: name,
        test_completed_at: new Date().toISOString(),
        sequence_stage: 0
      })
      .select()
      .single();

    if (sequenceError) {
      console.error("Error creating email sequence:", sequenceError);
      throw sequenceError;
    }

    // Generate tracking token for application link
    const trackingToken = crypto.randomUUID();
    
    // Create application link entry
    const { error: linkError } = await supabase
      .from("application_links")
      .insert({
        application_id: applicationId,
        email: email,
        tracking_token: trackingToken
      });

    if (linkError) {
      console.error("Error creating application link:", linkError);
      throw linkError;
    }

    console.log("Email sequence initiated for:", email);

    return new Response(JSON.stringify({ 
      success: true, 
      sequenceId: sequenceData.id,
      trackingToken: trackingToken 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in email-sequence function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);