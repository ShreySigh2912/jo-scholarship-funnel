-- Create questions table to store quiz questions
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false')),
  section_name TEXT NOT NULL,
  options JSONB, -- Array of options for multiple choice questions
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is admin functionality)
CREATE POLICY "Anyone can read questions" 
ON public.questions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert questions" 
ON public.questions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update questions" 
ON public.questions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete questions" 
ON public.questions 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample questions
INSERT INTO public.questions (question_text, question_type, section_name, options, correct_answer) VALUES
('What is 2 + 2?', 'multiple_choice', 'Mathematics', '["2", "3", "4", "5"]', '4'),
('Is the earth round?', 'true_false', 'Science', '["True", "False"]', 'True'),
('What is the capital of France?', 'multiple_choice', 'Geography', '["London", "Berlin", "Paris", "Madrid"]', 'Paris');