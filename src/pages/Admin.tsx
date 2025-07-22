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
import { Eye, Plus, Trash2, LogOut, LogIn, EyeOff } from "lucide-react";
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

  // Email Creator State
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailTrigger, setEmailTrigger] = useState('immediate');
  const [emailTriggerDelay, setEmailTriggerDelay] = useState(0);
  const [isEmailCreatorOpen, setIsEmailCreatorOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isSendingEmails, setIsSendingEmails] = useState(false);

  const { user, loading: authStateLoading, isAdmin, signOut, signIn } = useAuth();
  
  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

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

  const handleSignOut = async () => {
    await signOut();
  };

  // Email Creator Functions
  const insertHyperlink = () => {
    const link = prompt('Enter the URL (include https://):');
    const text = prompt('Enter the link text:');
    if (link && text) {
      const hyperlink = `<a href="${link}" style="color: #4c51bf; text-decoration: underline;" target="_blank">${text}</a>`;
      const textarea = document.querySelector('textarea[placeholder*="email content"]') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = emailContent;
        const newContent = currentContent.substring(0, start) + hyperlink + currentContent.substring(end);
        setEmailContent(newContent);
        
        // Set cursor position after the inserted hyperlink
        setTimeout(() => {
          textarea.setSelectionRange(start + hyperlink.length, start + hyperlink.length);
          textarea.focus();
        }, 10);
      } else {
        setEmailContent(prev => prev + hyperlink);
      }
    }
  };

  const insertButton = () => {
    const link = prompt('Enter the button URL (include https://):');
    const text = prompt('Enter the button text:');
    if (link && text) {
      const button = `<div style="text-align: center; margin: 20px 0;"><a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #4c51bf, #667eea); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0;" target="_blank">${text}</a></div>`;
      const textarea = document.querySelector('textarea[placeholder*="email content"]') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = emailContent;
        const newContent = currentContent.substring(0, start) + button + currentContent.substring(end);
        setEmailContent(newContent);
        
        // Set cursor position after the inserted button
        setTimeout(() => {
          textarea.setSelectionRange(start + button.length, start + button.length);
          textarea.focus();
        }, 10);
      } else {
        setEmailContent(prev => prev + button);
      }
    }
  };

  const handleSendEmails = async () => {
    if (!emailSubject.trim() || !emailContent.trim() || selectedEmails.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select recipients.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmails(true);
    try {
      const { error } = await supabase.functions.invoke('send-custom-email', {
        body: {
          subject: emailSubject,
          content: emailContent,
          emails: selectedEmails,
          trigger: emailTrigger,
          delay: emailTriggerDelay
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Emails ${emailTrigger === 'immediate' ? 'sent' : 'scheduled'} successfully!`,
      });

      // Reset form
      setEmailSubject('');
      setEmailContent('');
      setSelectedEmails([]);
      setIsEmailCreatorOpen(false);
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  const handleEmailSelection = (email: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails(prev => [...prev, email]);
    } else {
      setSelectedEmails(prev => prev.filter(e => e !== email));
    }
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
                Sign in to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <LogIn className="h-4 w-4 mr-2" />
                  {authLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Manage Questions</TabsTrigger>
            <TabsTrigger value="email-creator">Email Creator</TabsTrigger>
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

          <TabsContent value="email-creator" className="space-y-6">
            {/* Email Creator Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Email Creator</h2>
                <p className="text-muted-foreground">Create and send custom emails to applicants</p>
              </div>
              <Dialog open={isEmailCreatorOpen} onOpenChange={setIsEmailCreatorOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Custom Email</DialogTitle>
                    <DialogDescription>
                      Compose and send custom emails to selected recipients
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Email Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Email Subject</Label>
                      <Input
                        id="email-subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Enter email subject..."
                      />
                    </div>

                    {/* Email Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-content">Email Content</Label>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={insertHyperlink}>
                            Add Link
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertButton}>
                            Add Button
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        id="email-content"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        placeholder="Compose your email content here... You can use HTML for formatting."
                        className="min-h-[200px]"
                      />
                      <div className="text-sm text-muted-foreground">
                        Tip: You can use HTML tags for formatting. Use the buttons above to add links and buttons.
                      </div>
                    </div>

                    {/* Email Preview */}
                    {emailContent && (
                      <div className="space-y-2">
                        <Label>Email Preview</Label>
                        <div 
                          className="p-4 border rounded-lg bg-background max-h-[200px] overflow-y-auto"
                          dangerouslySetInnerHTML={{ __html: emailContent }}
                        />
                      </div>
                    )}

                    {/* Trigger Settings */}
                    <div className="space-y-4">
                      <Label>Email Trigger Settings</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="trigger-type">Trigger Type</Label>
                          <Select value={emailTrigger} onValueChange={setEmailTrigger}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Send Immediately</SelectItem>
                              <SelectItem value="delayed">Send After Delay</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {emailTrigger === 'delayed' && (
                          <div className="space-y-2">
                            <Label htmlFor="delay-hours">Delay (Hours)</Label>
                            <Input
                              id="delay-hours"
                              type="number"
                              min="1"
                              value={emailTriggerDelay}
                              onChange={(e) => setEmailTriggerDelay(Number(e.target.value))}
                              placeholder="Hours to wait..."
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recipients Selection */}
                    <div className="space-y-4">
                      <Label>Select Recipients</Label>
                      <div className="max-h-[200px] overflow-y-auto border rounded-lg p-4 space-y-2">
                        <div className="flex items-center space-x-2 font-medium border-b pb-2">
                          <input
                            type="checkbox"
                            id="select-all"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmails(applications.map(app => app.email));
                              } else {
                                setSelectedEmails([]);
                              }
                            }}
                            checked={selectedEmails.length === applications.length}
                          />
                          <label htmlFor="select-all">Select All ({applications.length})</label>
                        </div>
                        {applications.map((application) => (
                          <div key={application.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={application.id}
                              checked={selectedEmails.includes(application.email)}
                              onChange={(e) => handleEmailSelection(application.email, e.target.checked)}
                            />
                            <label htmlFor={application.id} className="text-sm">
                              {application.name} ({application.email})
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedEmails.length} recipient(s) selected
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setIsEmailCreatorOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendEmails} disabled={isSendingEmails}>
                        {isSendingEmails ? 'Sending...' : (emailTrigger === 'immediate' ? 'Send Now' : 'Schedule Email')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Email Templates Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Email Templates</CardTitle>
                <CardDescription>Pre-built email templates for common scenarios</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => {
                    setEmailSubject('Welcome to MBA Scholarship Program');
                    setEmailContent(`<div style="font-family: Arial, sans-serif; max-width: 600px;">
                      <h2 style="color: #4c51bf;">Welcome to the MBA Scholarship Program!</h2>
                      <p>Dear Applicant,</p>
                      <p>Thank you for your interest in our MBA Scholarship Program. We're excited to have you on board!</p>
                      <a href="#" style="display: inline-block; background: linear-gradient(135deg, #4c51bf, #667eea); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0;">Get Started</a>
                      <p>Best regards,<br>MBA Team</p>
                    </div>`);
                    setIsEmailCreatorOpen(true);
                  }}
                >
                  <h3 className="font-semibold">Welcome Email</h3>
                  <p className="text-sm text-muted-foreground">Greeting for new applicants</p>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => {
                    setEmailSubject('Important Update Regarding Your Application');
                    setEmailContent(`<div style="font-family: Arial, sans-serif; max-width: 600px;">
                      <h2 style="color: #dc3545;">Important Update</h2>
                      <p>Dear Applicant,</p>
                      <p>We have an important update regarding your scholarship application. Please review the details below:</p>
                      <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold;">Your application status has been updated.</p>
                      </div>
                      <a href="#" style="display: inline-block; background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0;">View Update</a>
                      <p>Best regards,<br>MBA Team</p>
                    </div>`);
                    setIsEmailCreatorOpen(true);
                  }}
                >
                  <h3 className="font-semibold">Application Update</h3>
                  <p className="text-sm text-muted-foreground">Status update notification</p>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => {
                    setEmailSubject('🎉 Congratulations! Scholarship Awarded');
                    setEmailContent(`<div style="font-family: Arial, sans-serif; max-width: 600px;">
                      <h2 style="color: #38a169;">🎉 Congratulations!</h2>
                      <p>Dear Applicant,</p>
                      <p>We are delighted to inform you that you have been selected for our MBA Scholarship Program!</p>
                      <div style="background: linear-gradient(135deg, #48bb78, #38a169); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                        <h3 style="margin: 0;">Scholarship Awarded: ₹5,000</h3>
                      </div>
                      <a href="#" style="display: inline-block; background: linear-gradient(135deg, #38a169, #48bb78); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0;">Accept Scholarship</a>
                      <p>Congratulations and best regards,<br>MBA Team</p>
                    </div>`);
                    setIsEmailCreatorOpen(true);
                  }}
                >
                  <h3 className="font-semibold">Scholarship Award</h3>
                  <p className="text-sm text-muted-foreground">Congratulations message</p>
                </Button>
              </CardContent>
            </Card>

            {/* Email Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Recipients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{applications.length}</div>
                  <p className="text-sm text-muted-foreground">Available email addresses</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Email Sequences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{emailSequences.length}</div>
                  <p className="text-sm text-muted-foreground">Active email sequences</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Links Clicked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {emailSequences.filter(seq => seq.link_clicked).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Email engagement rate</p>
                </CardContent>
              </Card>
            </div>
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
                                               {response.is_correct !== null && (
                                                 <Badge variant={response.is_correct ? 'default' : 'destructive'}>
                                                   {response.is_correct ? 'Correct' : 'Wrong'}
                                                 </Badge>
                                               )}
                                               {response.is_correct === null && (
                                                 <Badge variant="secondary">
                                                   Subjective
                                                 </Badge>
                                               )}
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
                                                 <span className="text-sm font-medium text-muted-foreground">Student Answer:</span>
                                                 <div className="mt-1 p-3 bg-muted rounded-md">
                                                   <p className="font-medium">{response.answer}</p>
                                                 </div>
                                               </div>
                                               
                                               {/* Show expected answers for subjective questions */}
                                               {response.question_type !== 'mcq' && (
                                                 <div>
                                                   <span className="text-sm font-medium text-muted-foreground">Expected Answer Guidelines:</span>
                                                   <div className="mt-1 p-3 bg-secondary/20 rounded-md border border-secondary/30">
                                                     {(() => {
                                                       const questionId = response.question_id;
                                                       const expectedAnswers = {
                                                         'sub1': 'Should demonstrate clear career goals, understanding of MBA value, and specific ways the degree will advance their career. Look for: passion for business, leadership aspirations, skill gaps MBA will fill, and post-MBA career plans.',
                                                         'sub2': 'Should be professional, concise, and appreciative. Must include: proper subject line, formal salutation, specific appreciation for support, acknowledgment of team lead\'s contribution, and professional closing.',
                                                         'sub3': 'Should be confident, clear, and memorable. Must include: name, current role/background, key achievement or skill, what makes them unique, and enthusiasm for MBA program.',
                                                         'sub4': 'Should demonstrate accountability, problem-solving, and client focus. Look for: acknowledging the issue, explaining steps to resolve, timeline for completion, and measures to prevent future delays.',
                                                         'sub5': 'No correct answer - this is preference based. Look for thoughtful consideration of their career goals and interests.'
                                                       };
                                                       
                                                       return (
                                                         <p className="text-sm text-muted-foreground italic">
                                                           {expectedAnswers[questionId as keyof typeof expectedAnswers] || 'No specific guidelines available for this question.'}
                                                         </p>
                                                       );
                                                     })()}
                                                   </div>
                                                 </div>
                                               )}
                                               
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
