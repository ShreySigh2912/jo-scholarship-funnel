import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

const Admin = () => {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch quiz sessions with applicant names
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('quiz_sessions')
        .select(`
          *,
          scholarship_applications!inner(name)
        `)
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      setApplications(applicationsData || []);
      
      // Map quiz sessions to include applicant name
      const sessionsWithNames = sessionsData?.map(session => ({
        ...session,
        applicant_name: session.scholarship_applications?.name
      })) || [];
      
      setQuizSessions(sessionsWithNames);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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