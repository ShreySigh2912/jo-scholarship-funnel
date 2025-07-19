-- Create table to track email sequences
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  sequence_stage INTEGER NOT NULL DEFAULT 1,
  test_completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  link_clicked BOOLEAN DEFAULT FALSE,
  link_clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track application form links
CREATE TABLE public.application_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  tracking_token VARCHAR(255) NOT NULL UNIQUE,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_links ENABLE ROW LEVEL SECURITY;

-- Create policies for email_sequences
CREATE POLICY "Email sequences are viewable by service role" 
ON public.email_sequences 
FOR ALL 
USING (true);

-- Create policies for application_links
CREATE POLICY "Application links are viewable by service role" 
ON public.application_links 
FOR ALL 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_email_sequences_updated_at
BEFORE UPDATE ON public.email_sequences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_email_sequences_application_id ON public.email_sequences(application_id);
CREATE INDEX idx_email_sequences_stage ON public.email_sequences(sequence_stage);
CREATE INDEX idx_email_sequences_test_completed ON public.email_sequences(test_completed_at);
CREATE INDEX idx_application_links_token ON public.application_links(tracking_token);
CREATE INDEX idx_application_links_application_id ON public.application_links(application_id);