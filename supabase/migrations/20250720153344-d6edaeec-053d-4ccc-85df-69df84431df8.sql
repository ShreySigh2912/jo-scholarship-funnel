-- Enable extensions for cron functionality
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run email sequence every 10 minutes
SELECT cron.schedule(
  'send-email-sequence',
  '*/10 * * * *', -- every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://tiypqlwjwmxjgidodmbq.supabase.co/functions/v1/send-sequence-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeXBxbHdqd214amdpZG9kbWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzQ1MDIsImV4cCI6MjA2NzgxMDUwMn0.3XWDkhBmkGlySWcR7EuQ9OSgD-KpAsZBmRxS-iThZfU"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);