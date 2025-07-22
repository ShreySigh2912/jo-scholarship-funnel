-- Create scheduled_emails table for delayed email sending
CREATE TABLE public.scheduled_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Only admins can view scheduled emails" 
ON public.scheduled_emails 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can insert scheduled emails" 
ON public.scheduled_emails 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update scheduled emails" 
ON public.scheduled_emails 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scheduled_emails_updated_at
BEFORE UPDATE ON public.scheduled_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient querying of pending emails
CREATE INDEX idx_scheduled_emails_status_scheduled_for 
ON public.scheduled_emails (status, scheduled_for);