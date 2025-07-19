import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ScholarshipApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
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

const Admin = () => {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch scholarship applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('scholarship_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      // Fetch quiz sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      setApplications(applicationsData || []);
      
      // Map quiz sessions to include applicant name from applications data
      const sessionsWithNames = sessionsData?.map(session => {
        const application = applicationsData?.find(app => app.id === session.application_id);
        return {
          ...session,
          applicant_name: application?.name || 'Unknown'
        };
      }) || [];
      
      setQuizSessions(sessionsWithNames);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const completedQuizzes = quizSessions.filter(session => session.status === 'completed');
  const getQuizSessionForApplication = (applicationId: string) => {
    return quizSessions.find(session => session.application_id === applicationId);
  };

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
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => {
                  const quizSession = getQuizSessionForApplication(application.id);
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
                                          <div className="text-2xl font-bold text-primary">{quizResponses.length}</div>
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
      </div>
    </div>
  );
};

export default Admin;