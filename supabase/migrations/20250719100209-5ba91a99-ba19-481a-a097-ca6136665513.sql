-- Add foreign key constraints to ensure data integrity
ALTER TABLE quiz_sessions 
ADD CONSTRAINT fk_quiz_sessions_application_id 
FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) 
ON DELETE CASCADE;

ALTER TABLE quiz_responses 
ADD CONSTRAINT fk_quiz_responses_session_id 
FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) 
ON DELETE CASCADE;