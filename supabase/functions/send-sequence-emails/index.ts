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
    case 0:
      // Immediate email after test completion
      return {
        subject: "✅ Test Completed Successfully! Results Coming Soon",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px;">
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d3748; font-size: 28px; font-weight: bold; margin: 0;">
                  ✅ Test Completed Successfully, ${name}!
                </h1>
                <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #48bb78, #38a169); margin: 15px auto; border-radius: 2px;"></div>
              </div>
              
              <div style="background: linear-gradient(135deg, #48bb78, #38a169); color: white; padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎉 Congratulations!</h2>
                <p style="margin: 0; font-size: 18px; font-weight: 500;">
                  You have successfully completed the MBA Scholarship Assessment
                </p>
              </div>
              
              <div style="background: #f7fafc; padding: 20px; border-radius: 8px; border-left: 5px solid #4299e1; margin: 25px 0;">
                <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">📝 What's Next?</h3>
                <p style="color: #4a5568; margin: 0; line-height: 1.6;">
                  Our expert panel is reviewing your responses. You will receive your detailed results and scholarship eligibility status within <strong>24 hours</strong>.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                <p style="color: #718096; margin: 5px 0;">📧 Keep an eye on your inbox for updates</p>
                <p style="color: #2d3748; margin: 10px 0; font-weight: 600;">
                  Best wishes,<br>
                  <span style="color: #4c51bf;">MBA Scholarship Program Team</span>
                </p>
              </div>
            </div>
          </div>
        `,
      };
    case 1:
      // 6 hours after test completion - exciting email with payment link
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
      // 12 hours after test completion - if no link click, exciting email
      return {
        subject: "🔥 Don't Miss Out! Your Exclusive MBA Scholarship Awaits",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-radius: 15px;">
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d3748; font-size: 28px; font-weight: bold; margin: 0;">
                  🔥 Hey ${name}, Your Scholarship is Waiting! 🔥
                </h1>
                <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #ff6b6b, #ee5a24); margin: 15px auto; border-radius: 2px;"></div>
              </div>
              
              <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">⚡ SCHOLARSHIP STILL AVAILABLE! ⚡</h2>
                <p style="margin: 0; font-size: 18px; font-weight: 500;">
                  Your ₹5,000 MBA Scholarship is still reserved for you!
                </p>
              </div>
              
              <div style="background: #fff5f5; padding: 20px; border-radius: 8px; border-left: 5px solid #f56565; margin: 25px 0;">
                <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">🚨 Time is Running Out!</h3>
                <p style="color: #4a5568; margin: 0; line-height: 1.6;">
                  We noticed you haven't secured your scholarship yet. Only a few spots remain, and we'd hate for you to miss this incredible opportunity!
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; color: #2d3748; margin-bottom: 25px; font-weight: 500;">
                  💸 Secure your future with just ₹5,000 investment!
                </p>
                
                <a href="https://rzp.io/rzp/jotest" 
                   style="display: inline-block; background: linear-gradient(135deg, #38a169, #48bb78); color: white; padding: 20px 45px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 20px; margin: 10px; box-shadow: 0 10px 30px rgba(56, 161, 105, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;">
                  🎯 CLAIM YOUR SCHOLARSHIP NOW
                </a>
              </div>
              
              <div style="background: linear-gradient(135deg, #4299e1, #3182ce); color: white; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
                <h3 style="margin: 0 0 10px 0; font-size: 20px;">🏆 Why This Scholarship?</h3>
                <ul style="list-style: none; padding: 0; margin: 10px 0;">
                  <li style="margin: 8px 0;">✨ Premium MBA Program Access</li>
                  <li style="margin: 8px 0;">📚 Expert Faculty & Industry Mentors</li>
                  <li style="margin: 8px 0;">🚀 100% Placement Assistance</li>
                  <li style="margin: 8px 0;">💼 Network with Top Professionals</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                <p style="color: #2d3748; margin: 10px 0; font-weight: 600;">
                  Don't let this opportunity slip away!<br>
                  <span style="color: #4c51bf;">MBA Scholarship Program Team</span>
                </p>
              </div>
            </div>
          </div>
        `,
      };
    case 3:
      // 24 hours after test completion - FOMO email
      return {
        subject: "⚠️ FINAL NOTICE: Your MBA Scholarship Expires in Hours!",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); border-radius: 15px;">
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc3545; font-size: 28px; font-weight: bold; margin: 0;">
                  ⚠️ FINAL NOTICE, ${name}! ⚠️
                </h1>
                <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #dc3545, #c82333); margin: 15px auto; border-radius: 2px;"></div>
              </div>
              
              <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">🕐 SCHOLARSHIP EXPIRES SOON! 🕐</h2>
                <p style="margin: 0; font-size: 18px; font-weight: 500;">
                  This is your absolute FINAL chance to claim your ₹5,000 scholarship!
                </p>
              </div>
              
              <div style="background: #fef5e7; padding: 20px; border-radius: 8px; border: 2px solid #f6ad55; margin: 25px 0;">
                <h3 style="color: #dc3545; margin: 0 0 15px 0; font-size: 20px; text-align: center;">🚨 URGENT: Scholarship Slot Being Released</h3>
                <p style="color: #2d3748; margin: 0; line-height: 1.6; text-align: center; font-weight: 500;">
                  Your reserved scholarship worth <strong>₹5,000</strong> will be automatically transferred to the next candidate if you don't act within the next few hours!
                </p>
              </div>
              
              <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">😢 What You'll Miss Out On:</h3>
                <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Premium MBA Program worth ₹50,000+ for just ₹5,000</li>
                  <li>Industry-recognized certification</li>
                  <li>Direct access to top recruiters</li>
                  <li>Exclusive alumni network</li>
                  <li>Lifetime career support</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 20px; color: #dc3545; margin-bottom: 25px; font-weight: bold;">
                  ⏰ Don't let regret be your only reward!
                </p>
                
                <a href="https://rzp.io/rzp/jotest" 
                   style="display: inline-block; background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 22px 50px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 22px; margin: 10px; box-shadow: 0 12px 35px rgba(220, 53, 69, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; animation: pulse 2s infinite;">
                  🔥 SECURE SCHOLARSHIP NOW - FINAL CALL
                </a>
                
                <p style="font-size: 14px; color: #718096; margin-top: 15px;">
                  This offer will expire automatically and cannot be extended.
                </p>
              </div>
              
              <div style="background: #feb2b2; color: #742a2a; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;">
                <strong>⚡ FINAL WARNING: This is the last email you'll receive about this scholarship opportunity!</strong>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                <p style="color: #2d3748; margin: 10px 0; font-weight: 600;">
                  This is goodbye if you don't act now,<br>
                  <span style="color: #dc3545;">MBA Scholarship Program Team</span>
                </p>
              </div>
            </div>
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
      .select("*")
      .eq("link_clicked", false)
      .in("sequence_stage", [0, 1, 2, 3]);

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
      if (sequence.sequence_stage === 0 && !sequence.last_email_sent_at) {
        // Send immediate email after test completion
        shouldSendEmail = true;
        newStage = 0;
      } else if (sequence.sequence_stage === 0 && hoursSinceTest >= 6) {
        // Send first follow-up email 6 hours after test
        shouldSendEmail = true;
        newStage = 1;
      } else if (sequence.sequence_stage === 1 && hoursSinceTest >= 12) {
        // Send second follow-up email 12 hours after test (if no click)
        shouldSendEmail = true;
        newStage = 2;
      } else if (sequence.sequence_stage === 2 && hoursSinceTest >= 24) {
        // Send final FOMO email 24 hours after test (if no click)
        shouldSendEmail = true;
        newStage = 3;
      }

      // Also check if last email was sent and enough time has passed for next stage
      if (sequence.last_email_sent_at) {
        const lastEmailAt = new Date(sequence.last_email_sent_at);
        const timeSinceLastEmail = now.getTime() - lastEmailAt.getTime();
        const hoursSinceLastEmail = timeSinceLastEmail / (1000 * 60 * 60);

        if (sequence.sequence_stage === 0 && hoursSinceLastEmail >= 6) {
          shouldSendEmail = true;
          newStage = 1;
        } else if (sequence.sequence_stage === 1 && hoursSinceLastEmail >= 6) {
          shouldSendEmail = true;
          newStage = 2;
        } else if (sequence.sequence_stage === 2 && hoursSinceLastEmail >= 12) {
          shouldSendEmail = true;
          newStage = 3;
        }
      }

      if (shouldSendEmail) {
        console.log(`Sending email stage ${newStage} to ${sequence.email}`);

        // Get tracking token for this application
        const { data: applicationLink, error: linkError } = await supabase
          .from("application_links")
          .select("tracking_token")
          .eq("application_id", sequence.application_id)
          .single();

        if (linkError || !applicationLink) {
          console.error("No tracking token found for application:", sequence.application_id, linkError);
          continue;
        }

        const trackingToken = applicationLink.tracking_token;

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