
"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, Brain, BarChart3, BookOpen, Briefcase, PenTool, ChevronRight, ChevronLeft, GraduationCap, X } from 'lucide-react'
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"

// Declare fbq function for TypeScript
declare global {
  interface Window {
    fbq: (action: string, event: string, data?: any) => void;
  }
}

interface MCQQuestion {
  type: 'mcq'
  id: string
  question: string
  options: string[]
  correctAnswer?: number
}

interface SubjectiveQuestion {
  type: 'subjective' | 'email' | 'pitch' | 'scenario' | 'specialization'
  id: string
  question: string
  placeholder?: string
  maxLength?: number
  options?: string[]
}

type Question = MCQQuestion | SubjectiveQuestion

interface QuizData {
  title: string
  totalQuestions: number
  estimatedTime: string
  sections: {
    title: string
    icon: React.ReactNode
    questions: Question[]
  }[]
}

interface MBAScholarshipQuizProps {
  onClose: () => void
  applicationId?: string
}

// Function to shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to shuffle questions within each section
const getRandomizedQuizData = (): QuizData => {
  const baseData: QuizData = {
    title: "MBA Scholarship Quiz",
    totalQuestions: 33,
    estimatedTime: "15–20 minutes",
    sections: [
      {
        title: "Logical Reasoning & Aptitude",
        icon: <Brain className="w-5 h-5" />,
        questions: [
          {
            type: 'mcq',
            id: 'lr1',
            question: "What comes next in the sequence: 3, 6, 11, 18, 27, ___",
            options: ["38", "40", "36", "39"],
            correctAnswer: 0
          },
          {
            type: 'mcq',
            id: 'lr2',
            question: "If all accountants are professionals, and some professionals are teachers, which of the following is definitely true?",
            options: ["All teachers are accountants", "Some accountants are teachers", "Some professionals are accountants", "All professionals are teachers"],
            correctAnswer: 2
          },
          {
            type: 'mcq',
            id: 'lr3',
            question: "A train travels 60 km in 1 hour 30 minutes. What is its average speed?",
            options: ["45 km/h", "40 km/h", "60 km/h", "80 km/h"],
            correctAnswer: 1
          },
          {
            type: 'mcq',
            id: 'lr4',
            question: "Find the odd one out: Growth, Revenue, Profit, Weakness",
            options: ["Growth", "Revenue", "Profit", "Weakness"],
            correctAnswer: 3
          },
          {
            type: 'mcq',
            id: 'lr5',
            question: 'If "WORK" is coded as 23-15-18-11, what is the code for "PLAY"?',
            options: ["16-12-1-25", "15-13-1-24", "16-11-2-24", "17-12-2-23"],
            correctAnswer: 0
          },
          {
            type: 'mcq',
            id: 'lr6',
            question: "Which shape completes the pattern?",
            options: ["Triangle", "Square", "Circle", "Pentagon"],
            correctAnswer: 2
          },
          {
            type: 'mcq',
            id: 'lr7',
            question: "A man walks 5 km north, then 3 km east, then 5 km south. Where is he from the starting point?",
            options: ["3 km East", "2 km West", "3 km West", "Back to starting point"],
            correctAnswer: 0
          },
          {
            type: 'mcq',
            id: 'lr8',
            question: "Choose the correct Venn diagram relationship: Finance, Business, Accounting",
            options: ["All overlap", "Disjoint", "Nested", "No relation"],
            correctAnswer: 2
          }
        ]
      },
      {
        title: "Quantitative & Data Interpretation",
        icon: <BarChart3 className="w-5 h-5" />,
        questions: [
          {
            type: 'mcq',
            id: 'qd1',
            question: "What is the percentage increase from ₹500 to ₹650?",
            options: ["25%", "30%", "35%", "40%"],
            correctAnswer: 1
          },
          {
            type: 'mcq',
            id: 'qd2',
            question: "A product costs ₹200 and is sold for ₹250. What is the profit margin?",
            options: ["25%", "20%", "30%", "40%"],
            correctAnswer: 0
          },
          {
            type: 'mcq',
            id: 'qd3',
            question: "Median of the following data: 5, 10, 15, 20, 25",
            options: ["15", "10", "20", "12.5"],
            correctAnswer: 0
          },
          {
            type: 'mcq',
            id: 'qd4',
            question: "If 4x = 20, what is x² + 2x?",
            options: ["40", "50", "60", "70"],
            correctAnswer: 1
          },
          {
            type: 'mcq',
            id: 'qd5',
            question: "Bar graph shows Company A has 20% market share and Company B has 30%. Combined, they hold?",
            options: ["60%", "40%", "50%", "45%"],
            correctAnswer: 2
          },
          {
            type: 'mcq',
            id: 'qd6',
            question: "A train increases speed from 30 km/h to 60 km/h. What's the percentage increase?",
            options: ["50%", "100%", "75%", "60%"],
            correctAnswer: 1
          },
          {
            type: 'mcq',
            id: 'qd7',
            question: "Ratio of working professionals to students is 3:5. If total = 80, how many are students?",
            options: ["30", "40", "50", "60"],
            correctAnswer: 2
          }
        ]
      },
      {
        title: "English & Verbal Ability",
        icon: <BookOpen className="w-5 h-5" />,
        questions: [
          {
            type: 'mcq',
            id: 'ev1',
            question: "Choose the correct sentence:",
            options: ["She don't work here.", "She doesn't works here.", "She doesn't work here.", "She didn't worked here."],
            correctAnswer: 2
          },
          {
            type: 'mcq',
            id: 'ev2',
            question: 'Fill in the blank: "The presentation was ___ than expected."',
            options: ["more good", "best", "better", "gooder"],
            correctAnswer: 2
          },
          {
            type: 'mcq',
            id: 'ev3',
            question: 'Find the synonym of "Innovative"',
            options: ["Creative", "Repetitive", "Traditional", "Conservative"],
            correctAnswer: 0
          },
          {
            type: 'mcq',
            id: 'ev4',
            question: "Which sentence uses correct punctuation?",
            options: ["Lets go now!", "Let's go now.", "Lets go, now.", "Let's go now!"],
            correctAnswer: 3
          },
          {
            type: 'mcq',
            id: 'ev5',
            question: 'Select the antonym of "Flexible"',
            options: ["Rigid", "Fluid", "Adaptable", "Calm"],
            correctAnswer: 0
          },
          {
            type: 'mcq',
            id: 'ev6',
            question: 'Rearrange the sentence: "learners / most / practical / prefer / methods"',
            options: ["Most learners prefer practical methods", "Learners prefer methods most practical", "Methods prefer practical learners most", "Practical methods most learners prefer"],
            correctAnswer: 0
          },
          {
            type: 'mcq',
            id: 'ev7',
            question: "Which word is misspelled?",
            options: ["Achievement", "Entreprenuer", "Knowledge", "Strategy"],
            correctAnswer: 1
          },
          {
            type: 'mcq',
            id: 'ev8',
            question: 'Choose the correct passive voice: "They completed the project."',
            options: ["The project completes.", "The project was completed.", "The project has completed.", "The project was complete."],
            correctAnswer: 1
          }
        ]
      },
      {
        title: "Business & Career Awareness",
        icon: <Briefcase className="w-5 h-5" />,
        questions: [
          {
            type: 'mcq',
            id: 'bc1',
            question: "What does ROI stand for?",
            options: ["Return on Income", "Revenue on Investment", "Return on Investment", "Revenue of Institution"],
            correctAnswer: 2
          },
          {
            type: 'mcq',
            id: 'bc2',
            question: "A marketing funnel is used to:",
            options: ["Track finances", "Hire employees", "Guide customer journey", "Measure stock prices"],
            correctAnswer: 2
          },
          {
            type: 'mcq',
            id: 'bc3',
            question: "In HR, what does KRA stand for?",
            options: ["Key Result Area", "Known Resource Allocation", "Knowledge Recruitment Assignment", "Key Risk Assessment"],
            correctAnswer: 0
          },
          {
            type: 'mcq',
            id: 'bc4',
            question: "Who is the current CEO of Microsoft?",
            options: ["Sundar Pichai", "Satya Nadella", "Elon Musk", "Jeff Bezos"],
            correctAnswer: 1
          },
          {
            type: 'mcq',
            id: 'bc5',
            question: "What is a key component of business analytics?",
            options: ["Intuition", "Data", "Posters", "Gut feeling"],
            correctAnswer: 1
          },
          {
            type: 'mcq',
            id: 'bc6',
            question: "What does B2B mean in business?",
            options: ["Back to Business", "Brand to Brand", "Business to Business", "Buy to Buy"],
            correctAnswer: 2
          },
          {
            type: 'mcq',
            id: 'bc7',
            question: "Which function is responsible for employee engagement?",
            options: ["Finance", "HR", "Logistics", "Legal"],
            correctAnswer: 1
          }
        ]
      },
      {
        title: "Subjective Questions",
        icon: <PenTool className="w-5 h-5" />,
        questions: [
          {
            type: 'subjective',
            id: 'sub1',
            question: "Mini Essay (100–150 words): Why do you want to pursue an MBA, and how will it impact your career?",
            placeholder: "Write your essay here...",
            maxLength: 150
          },
          {
            type: 'email',
            id: 'sub2',
            question: "Write a professional email (3–5 lines): Appreciate your team lead for supporting you during a project delivery.",
            placeholder: "Subject: Thank you for your support\n\nDear [Team Lead Name],\n\n...",
            maxLength: 200
          },
          {
            type: 'pitch',
            id: 'sub3',
            question: "Elevator Pitch (max 2 lines): Introduce yourself to the Dean in 30 seconds.",
            placeholder: "Hello Dean, I am...",
            maxLength: 100
          },
          {
            type: 'scenario',
            id: 'sub4',
            question: "Business Scenario – Text Answer (2–3 lines): Your team missed a deadline. How would you explain this to a client?",
            placeholder: "I would explain to the client that...",
            maxLength: 150
          },
          {
            type: 'specialization',
            id: 'sub5',
            question: "Pick Your Specialisation (Multi-choice, no correct answer):",
            options: ["Marketing", "HR", "Finance", "Business Analytics", "AI/ML", "Project Management"]
          }
        ]
      }
    ]
  };

  // Randomize questions within each section (except subjective questions which should stay in order)
  return {
    ...baseData,
    sections: baseData.sections.map(section => {
      if (section.title === "Subjective Questions") {
        return section; // Keep subjective questions in original order
      }
      return {
        ...section,
        questions: shuffleArray(section.questions)
      };
    })
  };
};

export default function MBAScholarshipQuiz({ onClose, applicationId }: MBAScholarshipQuizProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [quizData, setQuizData] = useState<QuizData | null>(null)

  // Initialize randomized quiz data on component mount
  useEffect(() => {
    setQuizData(getRandomizedQuizData());
  }, []);

  const allQuestions = quizData?.sections.flatMap(section => section.questions) || []
  const currentQuestionData = allQuestions[currentQuestion]
  const progress = quizData ? ((currentQuestion + 1) / quizData.totalQuestions) * 100 : 0

  // Initialize quiz session on component mount
  useEffect(() => {
    const initializeQuizSession = async () => {
      if (!applicationId) {
        toast({
          title: "Error",
          description: "No application ID found. Please complete the contact form first.",
          variant: "destructive"
        });
        return;
      }

      try {
        const { data: session, error } = await supabase
          .from('quiz_sessions')
          .insert({
            application_id: applicationId,
            status: 'started'
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating quiz session:', error);
          toast({
            title: "Error",
            description: "Failed to start quiz session. Please try again.",
            variant: "destructive"
          });
          return;
        }

        setSessionId(session.id);
      } catch (error) {
        console.error('Error initializing quiz session:', error);
      }
    };

    initializeQuizSession();
  }, [applicationId]);

  // Save answer to Supabase
  const saveAnswerToSupabase = async (questionId: string, answer: string | string[], questionData: Question) => {
    if (!sessionId || !quizData) return;

    try {
      const sectionIndex = quizData.sections.findIndex(section => 
        section.questions.some(q => q.id === questionId)
      );
      const sectionName = sectionIndex >= 0 ? quizData.sections[sectionIndex].title : 'Unknown';

      const isCorrect = questionData.type === 'mcq' && questionData.correctAnswer !== undefined
        ? answer === questionData.options[questionData.correctAnswer]
        : null;

      const { error } = await supabase
        .from('quiz_responses')
        .upsert({
          session_id: sessionId,
          question_id: questionId,
          question_type: questionData.type,
          section_name: sectionName,
          question_text: questionData.question,
          answer: Array.isArray(answer) ? answer.join(', ') : answer,
          is_correct: isCorrect
        });

      if (error) {
        console.error('Error saving answer:', error);
        toast({
          title: "Warning",
          description: "Failed to save answer. Please continue, we'll retry.",
          variant: "destructive"
        });
      } else {
        console.log('Answer saved successfully for question:', questionId);
      }
    } catch (error) {
      console.error('Error saving answer to Supabase:', error);
    }
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Save answer to Supabase immediately
    const questionData = allQuestions.find(q => q.id === questionId);
    if (questionData) {
      saveAnswerToSupabase(questionId, answer, questionData);
    }
  };

  const handleNext = async () => {
    // Update quiz session progress
    if (sessionId) {
      try {
        await supabase
          .from('quiz_sessions')
          .update({
            current_question: currentQuestion + 1,
            current_section: currentSection,
            status: 'in_progress'
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error updating quiz progress:', error);
      }
    }

    if (quizData && currentQuestion < quizData.totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1)
      
      // Update section if needed
      let questionCount = 0
      for (let i = 0; i < quizData.sections.length; i++) {
        if (currentQuestion + 1 < questionCount + quizData.sections[i].questions.length) {
          setCurrentSection(i)
          break
        }
        questionCount += quizData.sections[i].questions.length
      }
    } else {
      setIsCompleted(true)
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0 && quizData) {
      setCurrentQuestion(prev => prev - 1)
      
      // Update section if needed
      let questionCount = 0
      for (let i = 0; i < quizData.sections.length; i++) {
        if (currentQuestion - 1 < questionCount + quizData.sections[i].questions.length) {
          setCurrentSection(i)
          break
        }
        questionCount += quizData.sections[i].questions.length
      }
    }
  }

  const calculateScore = () => {
    let correct = 0
    let total = 0
    
    allQuestions.forEach(question => {
      if (question.type === 'mcq' && question.correctAnswer !== undefined) {
        total++
        const userAnswer = answers[question.id]
        if (userAnswer === question.options[question.correctAnswer].toString()) {
          correct++
        }
      }
    })
    
    return { correct, total, percentage: Math.round((correct / total) * 100) }
  }

  const handleSubmit = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session not found. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate final score
      const score = calculateScore();

      // Update quiz session as completed
      await supabase
        .from('quiz_sessions')
        .update({
          status: 'completed',
          total_score: score.correct,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // Send confirmation email
      try {
        const { data: applicationData } = await supabase
          .from('scholarship_applications')
          .select('name, email')
          .eq('id', applicationId)
          .single();

        if (applicationData) {
          await fetch(`https://tiypqlwjwmxjgidodmbq.supabase.co/functions/v1/send-confirmation-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeXBxbHdqd214amdpZG9kbWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzQ1MDIsImV4cCI6MjA2NzgxMDUwMn0.3XWDkhBmkGlySWcR7EuQ9OSgD-KpAsZBmRxS-iThZfU`,
            },
            body: JSON.stringify({
              name: applicationData.name,
              email: applicationData.email,
            }),
          });

          // Start email sequence
          await fetch(`https://tiypqlwjwmxjgidodmbq.supabase.co/functions/v1/email-sequence`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeXBxbHdqd214amdpZG9kbWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzQ1MDIsImV4cCI6MjA2NzgxMDUwMn0.3XWDkhBmkGlySWcR7EuQ9OSgD-KpAsZBmRxS-iThZfU`,
            },
            body: JSON.stringify({
              applicationId: applicationId,
              name: applicationData.name,
              email: applicationData.email,
            }),
          });
          console.log('Email sequence initiated successfully');
        }
      } catch (error) {
        console.error('Error sending confirmation email or starting sequence:', error);
      }

      // Track quiz completion event
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', 'SubmitApplication');
      }

      toast({
        title: "🎉 Quiz Completed!",
        description: "Your responses have been saved successfully!"
      });

      // Redirect to thank you page with session info
      window.location.href = `/thank-you?sessionId=${sessionId}`;
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderQuestion = () => {
    if (!currentQuestionData) return null

    if (currentQuestionData.type === 'mcq') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary mb-4">
            {currentQuestionData.question}
          </h3>
          <RadioGroup
            value={answers[currentQuestionData.id] as string || ""}
            onValueChange={(value) => handleAnswer(currentQuestionData.id, value)}
            className="space-y-3"
          >
            {currentQuestionData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {String.fromCharCode(97 + index)}) {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )
    }

    if (currentQuestionData.type === 'specialization') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary mb-4">
            {currentQuestionData.question}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {currentQuestionData.options?.map((option, index) => (
              <Button
                key={index}
                variant={
                  (answers[currentQuestionData.id] as string[])?.includes(option) 
                    ? "default" 
                    : "outline"
                }
                onClick={() => {
                  const currentAnswers = (answers[currentQuestionData.id] as string[]) || []
                  const newAnswers = currentAnswers.includes(option)
                    ? currentAnswers.filter(a => a !== option)
                    : [...currentAnswers, option]
                  handleAnswer(currentQuestionData.id, newAnswers)
                }}
                className="h-auto p-4 text-left justify-start"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-primary mb-4">
          {currentQuestionData.question}
        </h3>
        <Textarea
          placeholder={currentQuestionData.placeholder}
          value={answers[currentQuestionData.id] as string || ""}
          onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
          className="min-h-[120px] resize-none"
          maxLength={currentQuestionData.maxLength}
        />
        {currentQuestionData.maxLength && (
          <div className="text-sm text-muted-foreground text-right">
            {(answers[currentQuestionData.id] as string || "").length} / {currentQuestionData.maxLength}
          </div>
        )}
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="min-h-screen p-4">
          <div className="max-w-4xl mx-auto">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Quiz Completed!</CardTitle>
                <p className="text-muted-foreground">Thank you for taking the MBA Scholarship Quiz</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {score.percentage}%
                  </div>
                  <p className="text-muted-foreground">
                    You scored {score.correct} out of {score.total} MCQ questions correctly
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-semibold text-primary">{quizData?.totalQuestions || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Questions</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-semibold text-primary">{score.correct}</div>
                    <div className="text-sm text-muted-foreground">Correct Answers</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-semibold text-primary">{quizData?.estimatedTime || '15-20 minutes'}</div>
                    <div className="text-sm text-muted-foreground">Time Taken</div>
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                    <h3 className="font-semibold text-primary mb-2">🎉 Congratulations!</h3>
                    <p className="text-muted-foreground">
                      You've successfully completed the scholarship quiz. Our counselor will contact you within 24 hours to discuss your ₹25,000 scholarship eligibility.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => window.location.reload()} variant="outline" size="lg">
                      Take Quiz Again
                    </Button>
                    <Button onClick={onClose} size="lg">
                      Back to Main Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="min-h-screen p-4">
          <div className="max-w-4xl mx-auto">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Review Your Answers</CardTitle>
                <p className="text-muted-foreground">Please review your responses before submitting</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto">
                    Submit Quiz & Claim Scholarship
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Header */}
          <Card className="mb-6 border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
                    <GraduationCap className="h-8 w-8" />
                    {quizData?.title || 'MBA Scholarship Quiz'}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Total: {quizData?.totalQuestions || 0} Questions • Estimated Time: {quizData?.estimatedTime || '15-20 minutes'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{quizData?.estimatedTime || '15-20 minutes'}</span>
                </div>
              </div>
              
              {/* Progress */}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary font-medium">
                    {currentQuestion + 1} of {quizData?.totalQuestions || 0}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </CardHeader>
          </Card>

          {/* Current Section Badge */}
          <div className="mb-4">
            <Badge variant="secondary" className="flex items-center gap-2 w-fit bg-secondary text-secondary-foreground">
              {quizData?.sections[currentSection]?.icon}
              Section {currentSection + 1}: {quizData?.sections[currentSection]?.title || 'Loading...'}
            </Badge>
          </div>

          {/* Question Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {quizData?.totalQuestions || 0}
                </div>
                <Badge variant="outline" className="border-primary/20">
                  {currentQuestionData?.type === 'mcq' ? 'Multiple Choice' : 'Subjective'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {renderQuestion()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestionData?.id || ""]}
              className="flex items-center gap-2"
            >
              {currentQuestion === (quizData?.totalQuestions || 0) - 1 ? 'Finish Quiz' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
