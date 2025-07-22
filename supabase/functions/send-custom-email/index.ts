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

interface CustomEmailRequest {
  subject: string;
  content: string;
  emails: string[];
  trigger: 'immediate' | 'delayed';
  delay?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, content, emails, trigger, delay }: CustomEmailRequest = await req.json();

    console.log(`Received request to send email to ${emails.length} recipients`);
    console.log(`Trigger: ${trigger}, Delay: ${delay || 0} hours`);

    if (trigger === 'immediate') {
      // Send emails immediately
      let successCount = 0;
      let errorCount = 0;

      for (const email of emails) {
        try {
          const emailResponse = await resend.emails.send({
            from: "MBA Scholarship <onboarding@resend.dev>",
            to: [email],
            subject: subject,
            html: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                  ${content}
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                    <p style="color: #718096; margin: 5px 0; font-size: 12px;">
                      This email was sent from the MBA Scholarship Program Admin Panel
                    </p>
                  </div>
                </div>
              </div>
            `,
          });

          if (emailResponse.error) {
            console.error(`Failed to send email to ${email}:`, emailResponse.error);
            errorCount++;
          } else {
            console.log(`Email sent successfully to ${email}`);
            successCount++;
          }
        } catch (error) {
          console.error(`Error sending email to ${email}:`, error);
          errorCount++;
        }
      }

      console.log(`Email sending completed. Success: ${successCount}, Errors: ${errorCount}`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Emails sent successfully. Success: ${successCount}, Errors: ${errorCount}`,
        successCount,
        errorCount
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });

    } else if (trigger === 'delayed') {
      // Store emails in database for delayed sending
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + (delay || 1));

      // Store each email as a scheduled email record
      const scheduledEmails = emails.map(email => ({
        email: email,
        subject: subject,
        content: content,
        scheduled_for: scheduledTime.toISOString(),
        status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('scheduled_emails')
        .insert(scheduledEmails);

      if (insertError) {
        console.error('Error storing scheduled emails:', insertError);
        throw insertError;
      }

      console.log(`Scheduled ${emails.length} emails for ${scheduledTime.toISOString()}`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `${emails.length} emails scheduled for ${scheduledTime.toLocaleString()}`,
        scheduledFor: scheduledTime.toISOString(),
        emailCount: emails.length
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid trigger type" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-custom-email function:", error);
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