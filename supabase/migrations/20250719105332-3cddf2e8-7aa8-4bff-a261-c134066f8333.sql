-- Update the question_type constraint to allow all question types used in the quiz
ALTER TABLE questions DROP CONSTRAINT questions_question_type_check;

ALTER TABLE questions ADD CONSTRAINT questions_question_type_check 
CHECK (question_type = ANY (ARRAY['mcq'::text, 'subjective'::text, 'email'::text, 'pitch'::text, 'scenario'::text, 'specialization'::text, 'multiple_choice'::text, 'true_false'::text]));