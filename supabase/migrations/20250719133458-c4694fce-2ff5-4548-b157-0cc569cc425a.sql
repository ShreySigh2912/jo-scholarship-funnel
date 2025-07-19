-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the email sequence function to run every hour
-- This will check for emails that need to be sent based on timing
SELECT cron.schedule(
  'send-sequence-emails-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://tiypqlwjwmxjgidodmbq.supabase.co/functions/v1/send-sequence-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeXBxbHdqd214amdpZG9kbWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzQ1MDIsImV4cCI6MjA2NzgxMDUwMn0.3XWDkhBmkGlySWcR7EuQ9OSgD-KpAsZBmRxS-iThZfU"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);