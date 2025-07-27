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
  trigger: 'immediate' | 'delayed' | 'test_completion';
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

    // Get recipient data from scholarship_applications for personalization
    const { data: recipientData, error: recipientError } = await supabase
      .from('scholarship_applications')
      .select('*')
      .in('email', emails);

    if (recipientError) {
      console.error('Error fetching recipient data:', recipientError);
    }

    const recipientMap = new Map(recipientData?.map(r => [r.email, r]) || []);

    // Helper function to personalize content
    const personalizeContent = (template: string, email: string) => {
      const recipient = recipientMap.get(email);
      return template
        .replace(/{{name}}/g, recipient?.name || 'Valued Applicant')
        .replace(/{{email}}/g, email)
        .replace(/{{first_name}}/g, recipient?.name?.split(' ')[0] || 'There')
        .replace(/{{phone}}/g, recipient?.phone || '')
        .replace(/{{application_date}}/g, recipient?.created_at ? new Date(recipient.created_at).toLocaleDateString() : new Date().toLocaleDateString())
        .replace(/{{application_url}}/g, 'https://your-domain.com/application')
        .replace(/{{test_score}}/g, '85%') // This will be dynamic when we have test data
        .replace(/{{completion_date}}/g, new Date().toLocaleDateString())
        // Convert plain text formatting to HTML
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^# (.*$)/gm, '<h2 style="color: #2d3748; margin: 20px 0 10px 0;">$1</h2>')
        .replace(/^• (.*$)/gm, '<li style="margin: 5px 0;">$1</li>')
        .replace(/(<li.*<\/li>)/gs, '<ul style="margin: 10px 0; padding-left: 20px;">$1</ul>')
        .replace(/^\d+\. (.*$)/gm, '<li style="margin: 5px 0;">$1</li>')
        .replace(/\[BUTTON: (.*?)\]/g, '<div style="text-align: center; margin: 30px 0;"><a href="#" style="background: linear-gradient(135deg, #4c51bf, #667eea); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">$1</a></div>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #4c51bf; text-decoration: underline;">$1</a>')
        .replace(/\n---\n/g, '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">')
        .replace(/\n/g, '<br>');
    };

    if (trigger === 'immediate') {
      // Send emails immediately
      let successCount = 0;
      let errorCount = 0;

      for (const email of emails) {
        try {
          const personalizedSubject = personalizeContent(subject, email);
          const personalizedContent = personalizeContent(content, email);

          const emailResponse = await resend.emails.send({
            from: "MBA Scholarship <info@jainonlinescholarship.in>",
            to: [email],
            subject: personalizedSubject,
            html: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
                <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                  ${personalizedContent}
                  
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

      // Store each email as a scheduled email record with personalized content
      const scheduledEmails = emails.map(email => ({
        email: email,
        subject: personalizeContent(subject, email),
        content: personalizeContent(content, email),
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

    } else if (trigger === 'test_completion') {
      // Create email sequence entries that will be triggered when tests are completed
      const emailSequenceEntries = emails.map(email => {
        const recipient = recipientMap.get(email);
        return {
          application_id: recipient?.id || null,
          email: email,
          name: recipient?.name || 'Unknown',
          sequence_stage: 0,
          test_completed_at: null, // Will be set when test is completed
          last_email_sent_at: null
        };
      });

      const { error: sequenceError } = await supabase
        .from('email_sequences')
        .upsert(emailSequenceEntries, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        });

      if (sequenceError) {
        console.error('Error creating email sequences:', sequenceError);
        throw sequenceError;
      }

      // Store the template for when the test completion trigger fires
      const testCompletionEmails = emails.map(email => ({
        email: email,
        subject: personalizeContent(subject, email),
        content: personalizeContent(content, email),
        scheduled_for: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year in the future as placeholder
        status: 'test_completion_pending'
      }));

      const { error: templateError } = await supabase
        .from('scheduled_emails')
        .insert(testCompletionEmails);

      if (templateError) {
        console.error('Error storing test completion templates:', templateError);
        throw templateError;
      }

      console.log(`Set up test completion triggers for ${emails.length} recipients`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Set up test completion triggers for ${emails.length} recipients`,
        triggerCount: emails.length,
        trigger: 'test_completion'
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