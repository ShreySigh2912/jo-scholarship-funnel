import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Missing tracking token", { status: 400 });
    }

    console.log("Processing link click for token:", token);

    // Update application link as clicked
    const { data: linkData, error: linkError } = await supabase
      .from("application_links")
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq("tracking_token", token)
      .select()
      .single();

    if (linkError || !linkData) {
      console.error("Error updating link:", linkError);
      return new Response("Invalid tracking token", { status: 404 });
    }

    console.log("Link clicked successfully for application:", linkData.application_id);

    // Update email sequence to mark link as clicked
    const { error: sequenceError } = await supabase
      .from("email_sequences")
      .update({
        link_clicked: true,
        link_clicked_at: new Date().toISOString(),
      })
      .eq("application_id", linkData.application_id);

    if (sequenceError) {
      console.error("Error updating sequence:", sequenceError);
    }

    // Redirect to the actual application form
    // Replace this URL with your actual application form URL
    const applicationFormUrl = "https://your-application-form-url.com";
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: applicationFormUrl,
      },
    });
  } catch (error: any) {
    console.error("Error in track-link-click function:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

serve(handler);