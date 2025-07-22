import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Play, Pause, Mail, Clock, Users, ArrowRight, Workflow } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { EmailSequenceBuilder } from "./EmailSequenceBuilder";

interface EmailSequenceManagerProps {
  sequences: EmailSequence[];
  onCreateSequence: (sequence: EmailSequence) => void;
  onUpdateSequence: (sequence: EmailSequence) => void;
  onDeleteSequence: (sequenceId: string) => void;
  onToggleSequence: (sequenceId: string, active: boolean) => void;
}

interface EmailSequence {
  id: string;
  name: string;
  description: string;
  trigger: 'test_completion' | 'application_submitted' | 'manual' | 'scheduled';
  active: boolean;
  emails: SequenceEmail[];
  createdAt: string;
  stats: {
    totalSent: number;
    activeRecipients: number;
    completionRate: number;
  };
}

interface SequenceEmail {
  id: string;
  name: string;
  subject: string;
  content: string;
  delay: number; // in hours
  delayUnit: 'hours' | 'days';
  conditions?: {
    mustOpen?: boolean;
    mustClick?: boolean;
    waitDays?: number;
  };
}

const triggerOptions = [
  { value: 'test_completion', label: 'After Test Completion', icon: '🎯' },
  { value: 'application_submitted', label: 'After Application Submitted', icon: '📝' },
  { value: 'manual', label: 'Manual Trigger', icon: '👤' },
  { value: 'scheduled', label: 'Scheduled', icon: '⏰' },
];

export const EmailSequenceManager: React.FC<EmailSequenceManagerProps> = ({
  sequences,
  onCreateSequence,
  onUpdateSequence,
  onDeleteSequence,
  onToggleSequence
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingSequence, setEditingSequence] = useState<EmailSequence | null>(null);
  const [newSequence, setNewSequence] = useState<Partial<EmailSequence>>({
    name: '',
    description: '',
    trigger: 'test_completion',
    active: false,
    emails: []
  });

  const createSequence = () => {
    if (!newSequence.name || !newSequence.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const sequence: EmailSequence = {
      ...newSequence as EmailSequence,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      stats: {
        totalSent: 0,
        activeRecipients: 0,
        completionRate: 0
      }
    };

    onCreateSequence(sequence);
    setNewSequence({
      name: '',
      description: '',
      trigger: 'test_completion',
      active: false,
      emails: []
    });
    setIsCreateOpen(false);
    
    toast({
      title: "Success",
      description: "Email sequence created successfully!",
    });
  };

  const handleSaveSequence = (sequenceData: any) => {
    // Convert visual builder data to our sequence format
    const emailNodes = sequenceData.nodes.filter((node: any) => node.type === 'email');
    const delayNodes = sequenceData.nodes.filter((node: any) => node.type === 'delay');
    
    // Convert nodes to emails array
    const emails: SequenceEmail[] = emailNodes.map((node: any, index: number) => ({
      id: node.id,
      name: node.data.subject || `Email ${index + 1}`,
      subject: node.data.subject || 'Untitled Email',
      content: node.data.content || '',
      delay: 24, // Default delay
      delayUnit: 'hours' as const,
    }));

    const sequence: EmailSequence = {
      id: Date.now().toString(),
      name: sequenceData.name,
      description: 'Created with visual builder',
      trigger: 'test_completion',
      active: false,
      emails,
      createdAt: new Date().toISOString(),
      stats: {
        totalSent: 0,
        activeRecipients: 0,
        completionRate: 0
      }
    };

    onCreateSequence(sequence);
    setIsBuilderOpen(false);
    
    toast({
      title: "Success",
      description: "Email sequence created successfully!",
    });
  };

  const addEmailToSequence = (sequenceEmails: SequenceEmail[], newEmail: Partial<SequenceEmail>) => {
    const email: SequenceEmail = {
      ...newEmail as SequenceEmail,
      id: Date.now().toString(),
    };
    return [...sequenceEmails, email];
  };

  const removeEmailFromSequence = (sequenceEmails: SequenceEmail[], emailId: string) => {
    return sequenceEmails.filter(email => email.id !== emailId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Sequences</h2>
          <p className="text-muted-foreground">
            Create automated email sequences that trigger based on user actions
          </p>
        </div>
        <Button onClick={() => setIsBuilderOpen(true)}>
          <Workflow className="h-4 w-4 mr-2" />
          Create Sequence
        </Button>
      </div>

      {/* Sequences Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sequences</p>
                <p className="text-2xl font-bold">{sequences.filter(s => s.active).length}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">
                  {sequences.reduce((acc, seq) => acc + seq.stats.activeRecipients, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">
                  {sequences.length > 0 
                    ? Math.round(sequences.reduce((acc, seq) => acc + seq.stats.completionRate, 0) / sequences.length)
                    : 0
                  }%
                </p>
              </div>
              <Mail className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sequences Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sequences</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Emails</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sequences.map((sequence) => (
                <TableRow key={sequence.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sequence.name}</div>
                      <div className="text-sm text-muted-foreground">{sequence.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {triggerOptions.find(opt => opt.value === sequence.trigger)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {sequence.emails.length}
                    </div>
                  </TableCell>
                  <TableCell>{sequence.stats.activeRecipients}</TableCell>
                  <TableCell>{sequence.stats.completionRate}%</TableCell>
                  <TableCell>
                    <Badge variant={sequence.active ? "default" : "secondary"}>
                      {sequence.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onToggleSequence(sequence.id, !sequence.active)}
                      >
                        {sequence.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingSequence(sequence)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteSequence(sequence.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sequence Builder Modal */}
      {editingSequence && (
        <Dialog open={!!editingSequence} onOpenChange={() => setEditingSequence(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Sequence: {editingSequence.name}</DialogTitle>
              <DialogDescription>
                Configure the emails in this sequence and their timing.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="emails" className="w-full">
              <TabsList>
                <TabsTrigger value="emails">Emails</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="emails" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Email Sequence</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Email
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {editingSequence.emails.map((email, index) => (
                    <Card key={email.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{email.name}</h4>
                              <p className="text-sm text-muted-foreground">{email.subject}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {email.delay} {email.delayUnit}
                            </Badge>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {index < editingSequence.emails.length - 1 && (
                          <div className="flex justify-center mt-4">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="space-y-4">
                  <div>
                    <Label>Sequence Name</Label>
                    <Input value={editingSequence.name} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={editingSequence.description} />
                  </div>
                  <div>
                    <Label>Trigger</Label>
                    <Select value={editingSequence.trigger}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{editingSequence.stats.totalSent}</p>
                          <p className="text-sm text-muted-foreground">Total Sent</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{editingSequence.stats.activeRecipients}</p>
                          <p className="text-sm text-muted-foreground">Active Recipients</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{editingSequence.stats.completionRate}%</p>
                          <p className="text-sm text-muted-foreground">Completion Rate</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSequence(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onUpdateSequence(editingSequence);
                setEditingSequence(null);
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Visual Sequence Builder */}
      {isBuilderOpen && (
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogContent className="max-w-7xl h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create Email Sequence</DialogTitle>
              <DialogDescription>
                Build your email sequence visually by dragging and connecting email steps.
              </DialogDescription>
            </DialogHeader>
            
            <EmailSequenceBuilder
              onSave={handleSaveSequence}
              onCancel={() => setIsBuilderOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};