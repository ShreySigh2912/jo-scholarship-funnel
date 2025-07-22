import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Eye, Plus, Trash2, LogOut, LogIn, UserPlus, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ScholarshipApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface EmailSequence {
  id: string;
  application_id: string;
  email: string;
  name: string;
  sequence_stage: number;
  last_email_sent_at: string | null;
  link_clicked: boolean;
  link_clicked_at: string | null;
}

interface QuizSession {
  id: string;
  application_id: string;
  status: string;
  current_question: number;
  current_section: number;
  total_score: number;
  started_at: string;
  completed_at: string | null;
  applicant_name?: string;
}

interface QuizResponse {
  id: string;
  session_id: string;
  question_id: string;
  question_type: string;
  section_name: string;
  question_text: string;
  answer: string;
  is_correct: boolean | null;
  answered_at: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  section_name: string;
  options: string[] | null;
  correct_answer: string;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [emailSequences, setEmailSequences] = useState<EmailSequence[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  
  // Add Question Form State
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: '',
    section_name: '',
    options: ['', '', '', ''],
    correct_answer: ''
  });
  
  // Delete Question State
  const [isDeleteQuestionOpen, setIsDeleteQuestionOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');

  const { user, loading: authStateLoading, isAdmin, signOut, signIn, signUp } = useAuth();
  
  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    try {
      // Fetch applications, sessions, email sequences, and questions in parallel for better performance
      const [applicationsResult, sessionsResult, emailSequencesResult, questionsResult] = await Promise.all([
        supabase
          .from('scholarship_applications')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('quiz_sessions')
          .select('*')
          .order('started_at', { ascending: false }),
        supabase
          .from('email_sequences')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (applicationsResult.error) {
        console.error('Error fetching applications:', applicationsResult.error);
        setApplications([]);
      } else {
        setApplications(applicationsResult.data || []);
      }

      if (emailSequencesResult.error) {
        console.error('Error fetching email sequences:', emailSequencesResult.error);
        setEmailSequences([]);
      } else {
        setEmailSequences(emailSequencesResult.data || []);
      }

      if (sessionsResult.error) {
        console.error('Error fetching sessions:', sessionsResult.error);
        setQuizSessions([]);
      } else {
        // Map quiz sessions to include applicant name from applications data
        const sessionsWithNames = sessionsResult.data?.map(session => {
          const application = applicationsResult.data?.find(app => app.id === session.application_id);
          return {
            ...session,
            applicant_name: application?.name || 'Unknown'
          };
        }) || [];
        
        setQuizSessions(sessionsWithNames);
      }

      if (questionsResult.error) {
        console.error('Error fetching questions:', questionsResult.error);
        setQuestions([]);
      } else {
        // Transform the data to match our interface
        const transformedQuestions = questionsResult.data?.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : (q.options ? JSON.parse(q.options as string) : null)
        })) || [];
        setQuestions(transformedQuestions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setApplications([]);
      setQuizSessions([]);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResponses = async (applicationId: string) => {
    setLoadingResponses(true);
    try {
      // First get the quiz session for this application
      const quizSession = quizSessions.find(session => session.application_id === applicationId);
      if (!quizSession) {
        setQuizResponses([]);
        return;
      }

      // Fetch quiz responses for this session
      const { data: responsesData, error: responsesError } = await supabase
        .from('quiz_responses')
        .select('*')
        .eq('session_id', quizSession.id)
        .order('answered_at', { ascending: true });

      if (responsesError) throw responsesError;
      setQuizResponses(responsesData || []);
    } catch (error) {
      console.error('Error fetching quiz responses:', error);
      setQuizResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleViewQuizDetails = async (application: ScholarshipApplication) => {
    setSelectedApplication(application);
    await fetchQuizResponses(application.id);
  };

  const handleAddQuestion = async () => {
    try {
      const questionData = {
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type,
        section_name: newQuestion.section_name,
        options: newQuestion.question_type === 'multiple_choice' ? newQuestion.options.filter(opt => opt.trim() !== '') : ['True', 'False'],
        correct_answer: newQuestion.correct_answer
      };

      const { error } = await supabase
        .from('questions')
        .insert([questionData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question added successfully!",
      });

      // Reset form and close dialog
      setNewQuestion({
        question_text: '',
        question_type: '',
        section_name: '',
        options: ['', '', '', ''],
        correct_answer: ''
      });
      setIsAddQuestionOpen(false);
      
      // Refresh questions
      fetchData();
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestionId) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', selectedQuestionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully!",
      });

      setSelectedQuestionId('');
      setIsDeleteQuestionOpen(false);
      
      // Refresh questions
      fetchData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const completedQuizzes = quizSessions.filter(session => session.status === 'completed');
  const getQuizSessionForApplication = (applicationId: string) => {
    return quizSessions.find(session => session.application_id === applicationId);
  };
  
  const getEmailSequenceForApplication = (applicationId: string) => {
    return emailSequences.find(sequence => sequence.application_id === applicationId);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive"
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "An error occurred during sign in.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
        // Force a refresh of the admin role check
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    if (!email || !password || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      setAuthLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive"
          });
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: "Password Too Weak",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "An error occurred during sign up.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email for confirmation.",
        });
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
        // Force a refresh after signup
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Show loading while checking authentication
  if (authStateLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
              <CardDescription>
                Sign in or create an account to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authTab} onValueChange={(value) => setAuthTab(value as 'signin' | 'signup')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4 mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={authLoading}>
                      {authLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password (min. 6 characters)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={authLoading}>
                      {authLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Manage Questions</TabsTrigger>
            <TabsTrigger value="data">Application Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Applications</CardTitle>
                  <CardDescription>Number of scholarship applications received</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{applications.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Attempts</CardTitle>
                  <CardDescription>Number of people who started the quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{quizSessions.length}</div>
                </CardContent>
              </Card>
              
               <Card>
                 <CardHeader>
                   <CardTitle>Completed Quizzes</CardTitle>
                   <CardDescription>Number of people who completed the quiz</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold text-primary">{completedQuizzes.length}</div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle>Total Questions</CardTitle>
                   <CardDescription>Number of questions in the quiz</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold text-primary">35</div>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            {/* Question Management Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Question Management</h2>
                <p className="text-muted-foreground">Add, edit, or delete quiz questions</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Question</DialogTitle>
                      <DialogDescription>
                        Create a new question for the quiz
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="question_text">Question Text</Label>
                        <Textarea
                          id="question_text"
                          value={newQuestion.question_text}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                          placeholder="Enter the question..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="question_type">Question Type</Label>
                          <Select
                            value={newQuestion.question_type}
                            onValueChange={(value) => setNewQuestion({ ...newQuestion, question_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True/False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="section_name">Section</Label>
                          <Input
                            id="section_name"
                            value={newQuestion.section_name}
                            onChange={(e) => setNewQuestion({ ...newQuestion, section_name: e.target.value })}
                            placeholder="e.g., Mathematics, Science"
                          />
                        </div>
                      </div>

                      {newQuestion.question_type === 'multiple_choice' && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {newQuestion.options.map((option, index) => (
                            <Input
                              key={index}
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="correct_answer">Correct Answer</Label>
                        {newQuestion.question_type === 'multiple_choice' ? (
                          <Select
                            value={newQuestion.correct_answer}
                            onValueChange={(value) => setNewQuestion({ ...newQuestion, correct_answer: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {newQuestion.options.filter(opt => opt.trim() !== '').map((option, index) => (
                                <SelectItem key={index} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select
                            value={newQuestion.correct_answer}
                            onValueChange={(value) => setNewQuestion({ ...newQuestion, correct_answer: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="True">True</SelectItem>
                              <SelectItem value="False">False</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddQuestionOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddQuestion}>
                          Add Question
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isDeleteQuestionOpen} onOpenChange={setIsDeleteQuestionOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Question</DialogTitle>
                      <DialogDescription>
                        Select a question to delete. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="question_select">Select Question to Delete</Label>
                        <Select
                          value={selectedQuestionId}
                          onValueChange={setSelectedQuestionId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a question to delete" />
                          </SelectTrigger>
                          <SelectContent>
                            {questions.map((question) => (
                              <SelectItem key={question.id} value={question.id}>
                                {question.question_text.substring(0, 100)}...
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedQuestionId && (
                        <div className="p-4 border rounded-lg bg-muted">
                          {(() => {
                            const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
                            return selectedQuestion ? (
                              <div>
                                <p className="font-medium">{selectedQuestion.question_text}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Type: {selectedQuestion.question_type} | Section: {selectedQuestion.section_name}
                                </p>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteQuestionOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteQuestion}
                          disabled={!selectedQuestionId}
                        >
                          Delete Question
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Questions Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Questions</CardTitle>
                <CardDescription>Manage your quiz questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Correct Answer</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="max-w-md">
                          <p className="truncate">{question.question_text}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {question.question_type === 'multiple_choice' ? 'Multiple Choice' : 'True/False'}
                          </Badge>
                        </TableCell>
                        <TableCell>{question.section_name}</TableCell>
                        <TableCell className="font-medium">{question.correct_answer}</TableCell>
                        <TableCell>{new Date(question.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-8">

        {/* Applications Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scholarship Applications</CardTitle>
            <CardDescription>All applicants and their quiz status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Applied At</TableHead>
                  <TableHead>Quiz Status</TableHead>
                  <TableHead>Quiz Score</TableHead>
                  <TableHead>Email Stage</TableHead>
                  <TableHead>Last Email</TableHead>
                  <TableHead>Link Clicked</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => {
                  const quizSession = getQuizSessionForApplication(application.id);
                  const emailSequence = getEmailSequenceForApplication(application.id);
                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell>{application.email}</TableCell>
                      <TableCell>{application.phone}</TableCell>
                      <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {quizSession ? (
                          <Badge variant={quizSession.status === 'completed' ? 'default' : 'secondary'}>
                            {quizSession.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Started</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {quizSession?.status === 'completed' ? quizSession.total_score : '-'}
                      </TableCell>
                      <TableCell>
                        {emailSequence ? (
                          <Badge variant="secondary">
                            Stage {emailSequence.sequence_stage}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Emails</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {emailSequence?.last_email_sent_at ? (
                          <span className="text-sm">
                            {new Date(emailSequence.last_email_sent_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {emailSequence ? (
                          <Badge variant={emailSequence.link_clicked ? 'default' : 'destructive'}>
                            {emailSequence.link_clicked ? 'Yes' : 'No'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {quizSession ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewQuizDetails(application)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Quiz
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Quiz Details - {application.name}</DialogTitle>
                                <DialogDescription>
                                  Detailed quiz responses and results
                                </DialogDescription>
                              </DialogHeader>
                              {loadingResponses ? (
                                <div className="flex items-center justify-center p-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {/* Quiz Summary */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Quiz Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                         <div className="text-center">
                                           <div className="text-2xl font-bold text-primary">35</div>
                                           <div className="text-sm text-muted-foreground">Total Questions</div>
                                         </div>
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-green-600">
                                            {quizResponses.filter(r => r.is_correct === true).length}
                                          </div>
                                          <div className="text-sm text-muted-foreground">Correct Answers</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-red-600">
                                            {quizResponses.filter(r => r.is_correct === false).length}
                                          </div>
                                          <div className="text-sm text-muted-foreground">Wrong Answers</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-primary">{quizSession?.total_score}</div>
                                          <div className="text-sm text-muted-foreground">Final Score</div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Detailed Responses */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Detailed Responses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-4">
                                        {quizResponses.map((response, index) => (
                                          <div key={response.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                              <h4 className="font-medium">Question {index + 1}</h4>
                                              <Badge variant={response.is_correct ? 'default' : 'destructive'}>
                                                {response.is_correct ? 'Correct' : 'Wrong'}
                                              </Badge>
                                            </div>
                                            <div className="space-y-2">
                                              <div>
                                                <span className="text-sm font-medium text-muted-foreground">Section:</span>
                                                <span className="ml-2">{response.section_name}</span>
                                              </div>
                                              <div>
                                                <span className="text-sm font-medium text-muted-foreground">Question:</span>
                                                <p className="mt-1">{response.question_text}</p>
                                              </div>
                                              <div>
                                                <span className="text-sm font-medium text-muted-foreground">Answer:</span>
                                                <span className="ml-2 font-medium">{response.answer}</span>
                                              </div>
                                              <div className="text-xs text-muted-foreground">
                                                Answered at: {new Date(response.answered_at).toLocaleString()}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-muted-foreground text-sm">No Quiz Taken</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quiz Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Sessions</CardTitle>
            <CardDescription>Detailed quiz session information</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Completed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.applicant_name || 'Unknown'}</TableCell>
                    <TableCell className="font-mono text-sm">{session.id.substring(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-sm">{session.application_id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{session.total_score}</TableCell>
                    <TableCell>{new Date(session.started_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {session.completed_at ? new Date(session.completed_at).toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;