import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Eye, Plus, Trash2, LogOut, LogIn, Mail, BarChart3, Workflow } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { EmailComposer } from "@/components/EmailComposer";
import { EmailAnalytics } from "@/components/EmailAnalytics";
import { EmailSequenceManager } from "@/components/EmailSequenceManager";
import { EmailSequenceBuilder } from "@/components/EmailSequenceBuilder";

interface ScholarshipApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
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
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizSessions, setQuizSessions] = useState<any[]>([]);
  const [emailSequencesData, setEmailSequencesData] = useState<any[]>([]);
  const [quizResponses, setQuizResponses] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [isQuizDetailOpen, setIsQuizDetailOpen] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);
  
  // Email Management States
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [emailSequences, setEmailSequences] = useState<any[]>([]);
  const [emailAnalytics, setEmailAnalytics] = useState<any>({
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalFailed: 0,
    recentEmails: [],
    openRateByDay: [],
    campaignPerformance: []
  });
  const [isSendingEmails, setIsSendingEmails] = useState(false);

  const { user, loading: authStateLoading, isAdmin, signOut, signIn } = useAuth();
  
  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!authStateLoading) {
      if (user && isAdmin) {
        fetchData();
      } else {
        // If not authenticated or not admin, stop loading immediately
        setLoading(false);
      }
    }
  }, [user, isAdmin, authStateLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('scholarship_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;
      setQuestions(questionsData?.map(q => ({
        ...q,
        options: Array.isArray(q.options) 
          ? q.options.map(opt => String(opt))
          : q.options 
            ? [String(q.options)] 
            : null
      })) || []);

      // Fetch quiz sessions
      const { data: quizSessionsData, error: quizSessionsError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .order('started_at', { ascending: false });

      if (quizSessionsError) throw quizSessionsError;
      setQuizSessions(quizSessionsData || []);

      // Fetch email sequences
      const { data: emailSequencesData, error: emailSequencesError } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });

      if (emailSequencesError) throw emailSequencesError;
      setEmailSequencesData(emailSequencesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResponses = async (applicationId: string) => {
    try {
      setLoadingResponses(true);
      console.log('Fetching quiz responses for application:', applicationId);
      
      // First get the quiz session for this application
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      console.log('Quiz session query result:', { sessionData, sessionError });

      if (sessionError) {
        console.error('Error fetching quiz session:', sessionError);
        throw sessionError;
      }
      
      if (!sessionData) {
        console.log('No quiz session found for application:', applicationId);
        setQuizResponses([]);
        toast({
          title: "No Quiz Data",
          description: "No quiz session found for this application.",
          variant: "default"
        });
        return;
      }

      console.log('Found quiz session:', sessionData.id);

      // Then get all responses for this session
      const { data: responsesData, error: responsesError } = await supabase
        .from('quiz_responses')
        .select('*')
        .eq('session_id', sessionData.id)
        .order('answered_at', { ascending: true });

      console.log('Quiz responses query result:', { responsesData, responsesError });

      if (responsesError) {
        console.error('Error fetching quiz responses:', responsesError);
        throw responsesError;
      }

      const responses = responsesData || [];
      console.log('Setting quiz responses:', responses.length, 'responses found');
      setQuizResponses(responses);

      if (responses.length === 0) {
        toast({
          title: "No Responses",
          description: "No quiz responses found for this session.",
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Error fetching quiz responses:', error);
      toast({
        title: "Error",
        description: `Failed to fetch quiz responses: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleViewQuizDetails = async (application: ScholarshipApplication) => {
    if (selectedApplication?.id === application.id && isQuizDetailOpen) {
      // If same application and modal is already open, don't refetch
      return;
    }
    
    setSelectedApplication(application);
    setQuizResponses([]); // Clear previous responses
    setIsQuizDetailOpen(true);
    await fetchQuizResponses(application.id);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Signed in successfully!",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSendEmails = async (emailData: any) => {
    setIsSendingEmails(true);
    try {
      const { error } = await supabase.functions.invoke('send-custom-email', {
        body: {
          subject: emailData.subject,
          content: emailData.content,
          emails: emailData.recipients,
          trigger: emailData.trigger,
          delay: emailData.delay
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Emails ${emailData.trigger === 'immediate' ? 'sent' : 'scheduled'} successfully!`,
      });

    } catch (error: any) {
      console.error('Error sending emails:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  const handleSaveTemplate = async (template: any) => {
    try {
      setEmailTemplates(prev => [...prev, template]);
      toast({
        title: "Success",
        description: "Template saved successfully!",
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive"
      });
    }
  };

  const handleCreateSequence = async (sequence: any) => {
    try {
      setEmailSequences(prev => [...prev, sequence]);
      toast({
        title: "Success",
        description: "Email sequence created successfully!",
      });
    } catch (error) {
      console.error('Error creating sequence:', error);
      toast({
        title: "Error",
        description: "Failed to create sequence.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSequence = async (sequence: any) => {
    try {
      setEmailSequences(prev => 
        prev.map(s => s.id === sequence.id ? sequence : s)
      );
      toast({
        title: "Success",
        description: "Sequence updated successfully!",
      });
    } catch (error) {
      console.error('Error updating sequence:', error);
      toast({
        title: "Error",
        description: "Failed to update sequence.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSequence = async (sequenceId: string) => {
    try {
      setEmailSequences(prev => prev.filter(s => s.id !== sequenceId));
      toast({
        title: "Success",
        description: "Sequence deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting sequence:', error);
      toast({
        title: "Error",
        description: "Failed to delete sequence.",
        variant: "destructive"
      });
    }
  };

  const handleToggleSequence = async (sequenceId: string, active: boolean) => {
    try {
      setEmailSequences(prev => 
        prev.map(s => s.id === sequenceId ? { ...s, active } : s)
      );
      toast({
        title: "Success",
        description: `Sequence ${active ? 'activated' : 'deactivated'} successfully!`,
      });
    } catch (error) {
      console.error('Error toggling sequence:', error);
      toast({
        title: "Error",
        description: "Failed to update sequence status.",
        variant: "destructive"
      });
    }
  };

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authStateLoading) {
        console.warn('Auth loading timeout - showing login screen');
        // Force-stop page loading so the login form renders
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [authStateLoading]);

  console.log('Admin render - authStateLoading:', authStateLoading, 'loading:', loading, 'user:', user?.email, 'isAdmin:', isAdmin);

  if (authStateLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Sign in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? (
                  <>
                    <LogIn className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage scholarship applications and communications</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="email-composer">
              <Mail className="h-4 w-4 mr-2" />
              Email Composer
            </TabsTrigger>
            <TabsTrigger value="email-sequences">
              <Workflow className="h-4 w-4 mr-2" />
              Email Sequences
            </TabsTrigger>
            <TabsTrigger value="email-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Email Analytics
            </TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                      <p className="text-2xl font-bold">{applications.length}</p>
                    </div>
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{applications.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                      <p className="text-2xl font-bold">{questions.length}</p>
                    </div>
                    <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{questions.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email Sequences</p>
                      <p className="text-2xl font-bold">{emailSequences.length}</p>
                    </div>
                    <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{emailSequences.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="email-composer" className="space-y-6">
            <EmailComposer
              onSendEmail={handleSendEmails}
              onSaveTemplate={handleSaveTemplate}
              templates={emailTemplates}
              recipients={applications}
              isLoading={isSendingEmails}
            />
          </TabsContent>

          <TabsContent value="email-sequences" className="space-y-6">
            <EmailSequenceManager
              sequences={emailSequences}
              onCreateSequence={handleCreateSequence}
              onUpdateSequence={handleUpdateSequence}
              onDeleteSequence={handleDeleteSequence}
              onToggleSequence={handleToggleSequence}
            />
          </TabsContent>

          <TabsContent value="email-analytics" className="space-y-6">
            <EmailAnalytics analytics={emailAnalytics} />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {/* Scholarship Applications */}
            <Card>
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
                      const quizSession = quizSessions.find(session => session.application_id === application.id);
                      const emailSequence = emailSequencesData.find(seq => seq.application_id === application.id);
                      
                      return (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">{application.name}</TableCell>
                          <TableCell>{application.email}</TableCell>
                          <TableCell>{application.phone}</TableCell>
                          <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {quizSession ? (
                              <Badge variant={quizSession.status === 'completed' ? 'default' : 
                                            quizSession.status === 'in_progress' ? 'secondary' : 'outline'}>
                                {quizSession.status}
                              </Badge>
                            ) : (
                              <Badge variant="outline">-</Badge>
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
                            {emailSequence?.last_email_sent_at 
                              ? new Date(emailSequence.last_email_sent_at).toLocaleDateString()
                              : 'None'
                            }
                          </TableCell>
                          <TableCell>
                            {emailSequence?.link_clicked ? (
                              <Badge variant="default">Yes</Badge>
                            ) : (
                              <Badge variant="destructive">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewQuizDetails(application)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quiz Sessions */}
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
                    {quizSessions.map((session) => {
                      const application = applications.find(app => app.id === session.application_id);
                      
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {application?.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {session.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {session.application_id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant={session.status === 'completed' ? 'default' : 
                                          session.status === 'in_progress' ? 'secondary' : 'outline'}>
                              {session.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{session.total_score || 0}</TableCell>
                          <TableCell>
                            {new Date(session.started_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {session.completed_at 
                              ? new Date(session.completed_at).toLocaleString() 
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quiz Detail Modal */}
            <Dialog open={isQuizDetailOpen} onOpenChange={(open) => {
              setIsQuizDetailOpen(open);
              if (!open) {
                setSelectedApplication(null);
                setQuizResponses([]);
              }
            }}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Quiz Details - {selectedApplication?.name}
                  </DialogTitle>
                  <DialogDescription>
                    Individual responses and performance analysis
                  </DialogDescription>
                </DialogHeader>
                
                {loadingResponses ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Quiz Summary */}
                    {(() => {
                      const quizSession = quizSessions.find(session => 
                        session.application_id === selectedApplication?.id
                      );
                      
                      if (!quizSession) {
                        return (
                          <Card>
                            <CardContent className="p-6">
                              <p className="text-center text-muted-foreground">
                                No quiz session found for this applicant.
                              </p>
                            </CardContent>
                          </Card>
                        );
                      }

                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Quiz Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge variant={quizSession.status === 'completed' ? 'default' : 'secondary'}>
                                  {quizSession.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Score</p>
                                <p className="text-lg font-bold">{quizSession.total_score || 0}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Started</p>
                                <p className="text-sm">{new Date(quizSession.started_at).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-sm">
                                  {quizSession.completed_at 
                                    ? new Date(quizSession.completed_at).toLocaleString()
                                    : 'In Progress'
                                  }
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}

                    {/* Individual Responses */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Individual Responses</CardTitle>
                        <CardDescription>
                          Question-by-question breakdown of answers
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {quizResponses.length === 0 ? (
                          <p className="text-center text-muted-foreground py-6">
                            No quiz responses found for this applicant.
                          </p>
                         ) : (
                           <div className="space-y-4">
                             {quizResponses
                               .filter((response, index, self) => 
                                 // Remove duplicates based on question_id and session_id
                                 index === self.findIndex(r => 
                                   r.question_id === response.question_id && 
                                   r.session_id === response.session_id
                                 )
                               )
                               .map((response, index) => (
                               <div key={`${response.session_id}-${response.question_id}`} className="border rounded-lg p-4">
                                 <div className="flex items-start justify-between mb-3">
                                   <div className="flex-1">
                                     <div className="flex items-center gap-2 mb-2">
                                       <Badge variant="outline">Q{index + 1}</Badge>
                                       <Badge variant="secondary">{response.section_name}</Badge>
                                       <Badge variant="outline">{response.question_type}</Badge>
                                     </div>
                                     <h4 className="font-medium mb-2">{response.question_text}</h4>
                                   </div>
                                   <div className="flex items-center gap-2">
                                     {response.is_correct !== null && (
                                       <Badge variant={response.is_correct ? 'default' : 'destructive'}>
                                         {response.is_correct ? 'Correct' : 'Incorrect'}
                                       </Badge>
                                     )}
                                   </div>
                                 </div>
                                 
                                 <div className="bg-muted p-3 rounded">
                                   <p className="text-sm font-medium text-muted-foreground mb-1">Answer:</p>
                                   <p className="font-medium">{response.answer}</p>
                                 </div>
                                 
                                 <div className="mt-2 text-xs text-muted-foreground">
                                   Answered at: {new Date(response.answered_at).toLocaleString()}
                                 </div>
                               </div>
                             ))}
                           </div>
                         )}
                      </CardContent>
                    </Card>

                    {/* Performance Analysis */}
                    {quizResponses.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <p className="text-2xl font-bold text-green-600">
                                {quizResponses.filter(r => r.is_correct === true).length}
                              </p>
                              <p className="text-sm text-muted-foreground">Correct Answers</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <p className="text-2xl font-bold text-red-600">
                                {quizResponses.filter(r => r.is_correct === false).length}
                              </p>
                              <p className="text-sm text-muted-foreground">Incorrect Answers</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">
                                {quizResponses.length > 0 
                                  ? Math.round((quizResponses.filter(r => r.is_correct === true).length / quizResponses.length) * 100)
                                  : 0
                                }%
                              </p>
                              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                            </div>
                          </div>
                          
                          {/* Section-wise breakdown */}
                          <div className="mt-6">
                            <h4 className="font-medium mb-3">Section-wise Performance</h4>
                            <div className="space-y-2">
                              {Object.entries(
                                quizResponses.reduce((acc, response) => {
                                  const section = response.section_name;
                                  if (!acc[section]) {
                                    acc[section] = { total: 0, correct: 0 };
                                  }
                                  acc[section].total++;
                                  if (response.is_correct) acc[section].correct++;
                                  return acc;
                                }, {} as Record<string, { total: number; correct: number }>)
                              ).map(([section, stats]: [string, { total: number; correct: number }]) => (
                                <div key={section} className="flex justify-between items-center p-2 border rounded">
                                  <span className="font-medium">{section}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                      {stats.correct}/{stats.total}
                                    </span>
                                    <Badge variant="outline">
                                      {Math.round((stats.correct / stats.total) * 100)}%
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;