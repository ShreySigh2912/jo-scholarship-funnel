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

const generateApplicationLink = (trackingToken: string) => {
  return `https://tiypqlwjwmxjgidodmbq.supabase.co/functions/v1/track-link-click?token=${trackingToken}`;
};

const getEmailContent = (stage: number, name: string, trackingToken: string) => {
  const applicationLink = generateApplicationLink(trackingToken);
  
  switch (stage) {
    case 1:
      return {
        subject: "🎉 Congratulations! Next Step for Your MBA Scholarship",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; margin-bottom: 20px;">Congratulations ${name}! 🎉</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Great news! You have successfully completed our MBA Scholarship test.
            </p>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">🎯 Next Step: Complete Your Application</h3>
              <p style="color: #333; margin-bottom: 15px;">
                To claim your scholarship worth <strong>₹5,000</strong>, please complete your application form and make the payment.
              </p>
              <a href="${applicationLink}" 
                 style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Complete Application & Pay ₹5,000
              </a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              This is a limited-time offer. Please complete your application within the next 48 hours to secure your scholarship.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Best regards,<br>
              <strong>MBA Scholarship Program Team</strong>
            </p>
          </div>
        `,
      };
    case 2:
      return {
        subject: "⏰ Don't Miss Out! Your MBA Scholarship is Still Available",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ff6b35; margin-bottom: 20px;">⏰ Don't Miss Your Chance, ${name}!</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              We noticed you haven't completed your MBA Scholarship application yet. Your spot is still reserved!
            </p>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
              <h3 style="color: #ff6b35; margin-top: 0;">🚨 Limited Time Remaining</h3>
              <p style="color: #333; margin-bottom: 15px;">
                Your scholarship worth <strong>₹5,000</strong> is still available, but time is running out!
              </p>
              <a href="${applicationLink}" 
                 style="display: inline-block; background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Secure Your Scholarship Now
              </a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Don't let this opportunity slip away. Complete your application today!
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Best regards,<br>
              <strong>MBA Scholarship Program Team</strong>
            </p>
          </div>
        `,
      };
    case 3:
      return {
        subject: "🔥 Final Call! Your MBA Scholarship Expires Soon",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc3545; margin-bottom: 20px;">🔥 Final Call, ${name}!</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              This is your last chance! Your MBA Scholarship is about to expire.
            </p>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #dc3545; margin-top: 0;">⚠️ URGENT: Scholarship Expires Soon</h3>
              <p style="color: #333; margin-bottom: 15px;">
                Your <strong>₹5,000 scholarship</strong> will expire if you don't act now. This is your final reminder.
              </p>
              <a href="${applicationLink}" 
                 style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                CLAIM NOW - Last Chance!
              </a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              After this, your scholarship slot will be given to the next candidate.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Final regards,<br>
              <strong>MBA Scholarship Program Team</strong>
            </p>
          </div>
        `,
      };
    default:
      return { subject: "", html: "" };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    console.log("Checking for emails to send at:", now.toISOString());

    // Get email sequences that need emails sent
    const { data: sequences, error: sequencesError } = await supabase
      .from("email_sequences")
      .select(`
        *,
        application_links!inner(tracking_token, clicked)
      `)
      .eq("link_clicked", false)
      .in("sequence_stage", [1, 2, 3]);

    if (sequencesError) {
      console.error("Error fetching sequences:", sequencesError);
      throw sequencesError;
    }

    console.log(`Found ${sequences?.length || 0} sequences to check`);

    let emailsSent = 0;

    for (const sequence of sequences || []) {
      const testCompletedAt = new Date(sequence.test_completed_at);
      const timeSinceTest = now.getTime() - testCompletedAt.getTime();
      const hoursSinceTest = timeSinceTest / (1000 * 60 * 60);

      let shouldSendEmail = false;
      let newStage = sequence.sequence_stage;

      // Check if we should send email based on stage and time
      if (sequence.sequence_stage === 1 && hoursSinceTest >= 6) {
        shouldSendEmail = true;
      } else if (sequence.sequence_stage === 2 && hoursSinceTest >= 12) {
        shouldSendEmail = true;
      } else if (sequence.sequence_stage === 3 && hoursSinceTest >= 24) {
        shouldSendEmail = true;
      }

      // Also check if last email was sent and enough time has passed for next stage
      if (sequence.last_email_sent_at) {
        const lastEmailAt = new Date(sequence.last_email_sent_at);
        const timeSinceLastEmail = now.getTime() - lastEmailAt.getTime();
        const hoursSinceLastEmail = timeSinceLastEmail / (1000 * 60 * 60);

        if (sequence.sequence_stage === 1 && hoursSinceLastEmail >= 6) {
          shouldSendEmail = true;
          newStage = 2;
        } else if (sequence.sequence_stage === 2 && hoursSinceLastEmail >= 12) {
          shouldSendEmail = true;
          newStage = 3;
        }
      }

      if (shouldSendEmail) {
        console.log(`Sending email stage ${newStage} to ${sequence.email}`);

        const trackingToken = sequence.application_links[0]?.tracking_token;
        if (!trackingToken) {
          console.error("No tracking token found for sequence:", sequence.id);
          continue;
        }

        const emailContent = getEmailContent(newStage, sequence.name, trackingToken);

        try {
          const emailResponse = await resend.emails.send({
            from: "MBA Scholarship Program <info@jainonlinescholarship.in>",
            to: [sequence.email],
            subject: emailContent.subject,
            html: emailContent.html,
          });

          console.log("Email sent successfully:", emailResponse);

          // Update sequence with new stage and last email sent time
          const { error: updateError } = await supabase
            .from("email_sequences")
            .update({
              sequence_stage: newStage,
              last_email_sent_at: now.toISOString(),
            })
            .eq("id", sequence.id);

          if (updateError) {
            console.error("Error updating sequence:", updateError);
          } else {
            emailsSent++;
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
    }

    console.log(`Total emails sent: ${emailsSent}`);

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent,
      message: `Processed sequences and sent ${emailsSent} emails`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-sequence-emails function:", error);
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