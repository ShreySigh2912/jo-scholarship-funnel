-- Update the questions table to support all quiz question types
ALTER TABLE public.questions 
DROP CONSTRAINT questions_question_type_check;

-- Add new constraint with all required question types
ALTER TABLE public.questions 
ADD CONSTRAINT questions_question_type_check 
CHECK (question_type IN ('mcq', 'subjective', 'email', 'pitch', 'scenario', 'specialization', 'multiple_choice', 'true_false'));

-- Now insert all the quiz questions
INSERT INTO public.questions (question_text, question_type, section_name, options, correct_answer) VALUES
-- Logical Reasoning & Aptitude questions
('What comes next in the sequence: 3, 6, 11, 18, 27, ___', 'mcq', 'Logical Reasoning & Aptitude', '["38", "40", "36", "39"]', '38'),
('If all accountants are professionals, and some professionals are teachers, which of the following is definitely true?', 'mcq', 'Logical Reasoning & Aptitude', '["All teachers are accountants", "Some accountants are teachers", "Some professionals are accountants", "All professionals are teachers"]', 'Some professionals are accountants'),
('A train travels 60 km in 1 hour 30 minutes. What is its average speed?', 'mcq', 'Logical Reasoning & Aptitude', '["45 km/h", "40 km/h", "60 km/h", "80 km/h"]', '40 km/h'),
('Find the odd one out: Growth, Revenue, Profit, Weakness', 'mcq', 'Logical Reasoning & Aptitude', '["Growth", "Revenue", "Profit", "Weakness"]', 'Weakness'),
('If "WORK" is coded as 23-15-18-11, what is the code for "PLAY"?', 'mcq', 'Logical Reasoning & Aptitude', '["16-12-1-25", "15-13-1-24", "16-11-2-24", "17-12-2-23"]', '16-12-1-25'),
('Which shape completes the pattern?', 'mcq', 'Logical Reasoning & Aptitude', '["Triangle", "Square", "Circle", "Pentagon"]', 'Circle'),
('A man walks 5 km north, then 3 km east, then 5 km south. Where is he from the starting point?', 'mcq', 'Logical Reasoning & Aptitude', '["3 km East", "2 km West", "3 km West", "Back to starting point"]', '3 km East'),
('Choose the correct Venn diagram relationship: Finance, Business, Accounting', 'mcq', 'Logical Reasoning & Aptitude', '["All overlap", "Disjoint", "Nested", "No relation"]', 'Nested'),

-- Quantitative & Data Interpretation questions
('What is the percentage increase from ₹500 to ₹650?', 'mcq', 'Quantitative & Data Interpretation', '["25%", "30%", "35%", "40%"]', '30%'),
('A product costs ₹200 and is sold for ₹250. What is the profit margin?', 'mcq', 'Quantitative & Data Interpretation', '["25%", "20%", "30%", "40%"]', '25%'),
('Median of the following data: 5, 10, 15, 20, 25', 'mcq', 'Quantitative & Data Interpretation', '["15", "10", "20", "12.5"]', '15'),
('If 4x = 20, what is x² + 2x?', 'mcq', 'Quantitative & Data Interpretation', '["40", "50", "60", "70"]', '50'),
('Bar graph shows Company A has 20% market share and Company B has 30%. Combined, they hold?', 'mcq', 'Quantitative & Data Interpretation', '["60%", "40%", "50%", "45%"]', '50%'),
('A train increases speed from 30 km/h to 60 km/h. What is the percentage increase?', 'mcq', 'Quantitative & Data Interpretation', '["50%", "100%", "75%", "60%"]', '100%'),
('Ratio of working professionals to students is 3:5. If total = 80, how many are students?', 'mcq', 'Quantitative & Data Interpretation', '["30", "40", "50", "60"]', '50'),

-- English & Verbal Ability questions
('Choose the correct sentence:', 'mcq', 'English & Verbal Ability', '["She don''t work here.", "She doesn''t works here.", "She doesn''t work here.", "She didn''t worked here."]', 'She doesn''t work here.'),
('Fill in the blank: "The presentation was ___ than expected."', 'mcq', 'English & Verbal Ability', '["more good", "best", "better", "gooder"]', 'better'),
('Find the synonym of "Innovative"', 'mcq', 'English & Verbal Ability', '["Creative", "Repetitive", "Traditional", "Conservative"]', 'Creative'),
('Which sentence uses correct punctuation?', 'mcq', 'English & Verbal Ability', '["Lets go now!", "Let''s go now.", "Lets go, now.", "Let''s go now!"]', 'Let''s go now!'),
('Select the antonym of "Flexible"', 'mcq', 'English & Verbal Ability', '["Rigid", "Fluid", "Adaptable", "Calm"]', 'Rigid'),
('Rearrange the sentence: "learners / most / practical / prefer / methods"', 'mcq', 'English & Verbal Ability', '["Most learners prefer practical methods", "Learners prefer methods most practical", "Methods prefer practical learners most", "Practical methods most learners prefer"]', 'Most learners prefer practical methods'),
('Which word is misspelled?', 'mcq', 'English & Verbal Ability', '["Achievement", "Entreprenuer", "Knowledge", "Strategy"]', 'Entreprenuer'),
('Choose the correct passive voice: "They completed the project."', 'mcq', 'English & Verbal Ability', '["The project completes.", "The project was completed.", "The project has completed.", "The project was complete."]', 'The project was completed.'),

-- Business & Career Awareness questions
('What does ROI stand for?', 'mcq', 'Business & Career Awareness', '["Return on Income", "Revenue on Investment", "Return on Investment", "Revenue of Institution"]', 'Return on Investment'),
('A marketing funnel is used to:', 'mcq', 'Business & Career Awareness', '["Track finances", "Hire employees", "Guide customer journey", "Measure stock prices"]', 'Guide customer journey'),
('In HR, what does KRA stand for?', 'mcq', 'Business & Career Awareness', '["Key Result Area", "Known Resource Allocation", "Knowledge Recruitment Assignment", "Key Risk Assessment"]', 'Key Result Area'),
('Who is the current CEO of Microsoft?', 'mcq', 'Business & Career Awareness', '["Sundar Pichai", "Satya Nadella", "Elon Musk", "Jeff Bezos"]', 'Satya Nadella'),
('What is a key component of business analytics?', 'mcq', 'Business & Career Awareness', '["Intuition", "Data", "Posters", "Gut feeling"]', 'Data'),
('What does B2B mean in business?', 'mcq', 'Business & Career Awareness', '["Back to Business", "Brand to Brand", "Business to Business", "Buy to Buy"]', 'Business to Business'),
('Which function is responsible for employee engagement?', 'mcq', 'Business & Career Awareness', '["Finance", "HR", "Logistics", "Legal"]', 'HR'),

-- Subjective Questions
('Mini Essay (100–150 words): Why do you want to pursue an MBA, and how will it impact your career?', 'subjective', 'Subjective Questions', '[]', ''),
('Write a professional email (3–5 lines): Appreciate your team lead for supporting you during a project delivery.', 'email', 'Subjective Questions', '[]', ''),
('Elevator Pitch (max 2 lines): Introduce yourself to the Dean in 30 seconds.', 'pitch', 'Subjective Questions', '[]', ''),
('Business Scenario – Text Answer (2–3 lines): Your team missed a deadline. How would you explain this to a client?', 'scenario', 'Subjective Questions', '[]', ''),
('Pick Your Specialisation (Multi-choice, no correct answer):', 'specialization', 'Subjective Questions', '["Marketing", "HR", "Finance", "Business Analytics", "AI/ML", "Project Management"]', '');