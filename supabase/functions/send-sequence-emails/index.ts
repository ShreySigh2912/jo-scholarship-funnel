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
        subject: "🎉 CONGRATULATIONS! You've Been SELECTED for MBA Scholarship!",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px;">
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d3748; font-size: 28px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                  🎉 AMAZING NEWS, ${name}! 🎉
                </h1>
                <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #48bb78, #38a169); margin: 15px auto; border-radius: 2px;"></div>
              </div>
              
              <div style="background: linear-gradient(135deg, #48bb78, #38a169); color: white; padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">🌟 YOU'VE BEEN SELECTED! 🌟</h2>
                <p style="margin: 0; font-size: 18px; font-weight: 500;">
                  Congratulations! You've successfully qualified for our exclusive MBA Scholarship Program
                </p>
              </div>
              
              <div style="background: linear-gradient(135deg, #fbb6ce, #f687b3); padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 22px;">💰 YOUR EXCLUSIVE SCHOLARSHIP</h3>
                <div style="font-size: 36px; font-weight: bold; color: #2d3748; margin: 10px 0;">₹5,000</div>
                <p style="color: #4a5568; margin: 0; font-size: 16px;">Limited Time Offer - Only for Selected Candidates!</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; color: #2d3748; margin-bottom: 25px; font-weight: 500;">
                  🚀 Ready to transform your career? Secure your spot NOW!
                </p>
                
                <a href="https://rzp.io/rzp/jotest" 
                   style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; margin: 10px; box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;">
                  💳 Pay ₹5,000 & Claim Scholarship
                </a>
                
                <div style="margin: 20px 0;">
                  <a href="${applicationLink}" 
                     style="display: inline-block; background: linear-gradient(135deg, #4c51bf, #667eea); color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 6px 20px rgba(76, 81, 191, 0.3);">
                    📋 Complete Application Form
                  </a>
                </div>
              </div>
              
              <div style="background: #f7fafc; padding: 20px; border-radius: 8px; border-left: 5px solid #38a169; margin: 25px 0;">
                <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">⏰ URGENT: Limited Time Offer</h4>
                <p style="color: #4a5568; margin: 0; line-height: 1.6;">
                  This exclusive selection is valid for <strong>48 hours only</strong>. Don't miss this life-changing opportunity to advance your MBA dreams at an unbeatable price!
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                <p style="color: #718096; margin: 5px 0;">🎓 Join thousands of successful MBA graduates</p>
                <p style="color: #2d3748; margin: 10px 0; font-weight: 600;">
                  Best wishes for your bright future,<br>
                  <span style="color: #4c51bf;">MBA Scholarship Program Team</span>
                </p>
              </div>
            </div>
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