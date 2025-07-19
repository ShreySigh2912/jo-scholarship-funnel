-- Enable RLS on all quiz tables
ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for scholarship_applications (public access for submission)
CREATE POLICY "Anyone can insert scholarship applications" 
ON public.scholarship_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read scholarship applications" 
ON public.scholarship_applications 
FOR SELECT 
USING (true);

-- Create policies for quiz_sessions (public access)
CREATE POLICY "Anyone can insert quiz sessions" 
ON public.quiz_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update quiz sessions" 
ON public.quiz_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can read quiz sessions" 
ON public.quiz_sessions 
FOR SELECT 
USING (true);

-- Create policies for quiz_responses (public access)
CREATE POLICY "Anyone can insert quiz responses" 
ON public.quiz_responses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update quiz responses" 
ON public.quiz_responses 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can read quiz responses" 
ON public.quiz_responses 
FOR SELECT 
USING (true);