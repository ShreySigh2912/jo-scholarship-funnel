import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: ConfirmationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "MBA Scholarship Program <info@jainonlinescholarship.in>",
      to: [email],
      subject: "Application Received - MBA Scholarship Program",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Application Received Successfully!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${name},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for submitting your application for our MBA Scholarship Program. We have successfully received your application and quiz responses.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Next Steps:</h3>
            <ul style="color: #555; line-height: 1.6;">
              <li>Your application is now under review by our admissions team</li>
              <li>You will receive the results within the next <strong>24 hours</strong></li>
              <li>Please keep an eye on your email for the next steps</li>
              <li>Check your spam/junk folder if you don't see our email in your inbox</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            If you have any questions or concerns, please don't hesitate to reach out to our support team.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Best regards,<br>
            <strong>MBA Scholarship Program Team</strong>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
            This is an automated email. Please do not reply to this message.
          </div>
        </div>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
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