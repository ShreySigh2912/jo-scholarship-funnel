import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, Underline, Link, Image, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Type, Mail, UserPlus, Calendar, Send, Clock, Save, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EmailComposerProps {
  onSendEmail: (emailData: EmailData) => void;
  onSaveTemplate: (template: EmailTemplate) => void;
  templates: EmailTemplate[];
  recipients: string[];
  isLoading?: boolean;
}

interface EmailData {
  subject: string;
  content: string;
  recipients: string[];
  trigger: 'immediate' | 'delayed' | 'test_completion';
  delay?: number;
  templateName?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'welcome' | 'follow_up' | 'reminder' | 'custom';
}

const personalizationTokens = [
  { token: '{{name}}', description: 'Recipient\'s name' },
  { token: '{{email}}', description: 'Recipient\'s email' },
  { token: '{{first_name}}', description: 'First name only' },
  { token: '{{test_score}}', description: 'Quiz test score' },
  { token: '{{completion_date}}', description: 'Test completion date' },
  { token: '{{application_url}}', description: 'Application form link' },
];

const emailTemplates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to MBA Scholarship Program, {{name}}!',
    content: `<h2>Welcome {{name}}!</h2>
<p>Thank you for your interest in our MBA Scholarship Program.</p>
<p>We're excited to have you on board. Here's what happens next:</p>
<ul>
<li>Complete your application</li>
<li>Take the qualification test</li>
<li>Interview round (if selected)</li>
</ul>
<div style="text-align: center; margin: 30px 0;">
<a href="{{application_url}}" style="background: linear-gradient(135deg, #4c51bf, #667eea); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Start Application</a>
</div>
<p>Best regards,<br>MBA Scholarship Team</p>`,
    category: 'welcome' as const
  },
  {
    id: 'test_completion',
    name: 'Test Completion Follow-up',
    subject: 'Your Test Results - Next Steps, {{name}}',
    content: `<h2>Great job {{name}}!</h2>
<p>You've completed the qualification test with a score of {{test_score}}.</p>
<p>Test completed on: {{completion_date}}</p>
<p>Our team will review your application and get back to you within 3-5 business days.</p>
<div style="text-align: center; margin: 30px 0;">
<a href="{{application_url}}" style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Complete Your Application</a>
</div>
<p>Questions? Reply to this email or contact us.</p>
<p>Best regards,<br>MBA Scholarship Team</p>`,
    category: 'follow_up' as const
  }
];

export const EmailComposer: React.FC<EmailComposerProps> = ({
  onSendEmail,
  onSaveTemplate,
  templates,
  recipients,
  isLoading = false
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [trigger, setTrigger] = useState<'immediate' | 'delayed' | 'test_completion'>('immediate');
  const [delay, setDelay] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showButtonDialog, setShowButtonDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const insertPersonalizationToken = (token: string) => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + token + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after the inserted token
      setTimeout(() => {
        textarea.setSelectionRange(start + token.length, start + token.length);
        textarea.focus();
      }, 10);
    }
  };

  const insertFormatting = (tag: string, closeTag?: string) => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const replacement = `<${tag}>${selectedText}</${closeTag || tag}>`;
      const newContent = content.substring(0, start) + replacement + content.substring(end);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        textarea.focus();
      }, 10);
    }
  };

  // Insert HTML at cursor
  const insertAtCursor = (html: string) => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + html + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.setSelectionRange(start + html.length, start + html.length);
        textarea.focus();
      }, 10);
    }
  };

  // Insert Link
  const handleInsertLink = () => {
    if (!linkText || !linkUrl) return;
    insertAtCursor(`<a href=\"${linkUrl}\" target=\"_blank\">${linkText}</a>`);
    setShowLinkDialog(false);
    setLinkText('');
    setLinkUrl('');
  };

  // Insert Button
  const handleInsertButton = () => {
    if (!buttonText || !buttonUrl) return;
    insertAtCursor(`<a href=\"${buttonUrl}\" target=\"_blank\" style=\"background: linear-gradient(135deg, #4c51bf, #667eea); color: white; padding: 12px 28px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;\">${buttonText}</a>`);
    setShowButtonDialog(false);
    setButtonText('');
    setButtonUrl('');
  };

  const loadTemplate = (templateId: string) => {
    const template = [...emailTemplates, ...templates].find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setContent(template.content);
      toast({
        title: "Template Loaded",
        description: `Loaded template: ${template.name}`,
      });
    }
  };

  const saveAsTemplate = () => {
    if (!templateName || !subject || !content) {
      toast({
        title: "Error",
        description: "Please fill in template name, subject, and content.",
        variant: "destructive"
      });
      return;
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: templateName,
      subject,
      content,
      category: 'custom'
    };

    onSaveTemplate(newTemplate);
    setTemplateName('');
    toast({
      title: "Template Saved",
      description: `Template "${templateName}" has been saved.`,
    });
  };

  const handleSend = () => {
    if (!subject || !content || selectedRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select recipients.",
        variant: "destructive"
      });
      return;
    }

    const emailData: EmailData = {
      subject,
      content,
      recipients: selectedRecipients,
      trigger,
      delay: trigger === 'delayed' ? delay : undefined,
    };

    onSendEmail(emailData);
  };

  const toggleRecipient = (email: string) => {
    setSelectedRecipients(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const selectAllRecipients = () => {
    setSelectedRecipients(recipients);
  };

  const clearAllRecipients = () => {
    setSelectedRecipients([]);
  };

  const previewContent = content
    .replace(/{{name}}/g, 'John Doe')
    .replace(/{{email}}/g, 'john.doe@example.com')
    .replace(/{{first_name}}/g, 'John')
    .replace(/{{test_score}}/g, '85%')
    .replace(/{{completion_date}}/g, new Date().toLocaleDateString())
    .replace(/{{application_url}}/g, '#application-form');

  return (
    <div className="space-y-6">
      {/* Template Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Load Template</Label>
              <Select value={selectedTemplate} onValueChange={(value) => {
                setSelectedTemplate(value);
                loadTemplate(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Blank Email</SelectItem>
                  {emailTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} (Custom)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Save as Template</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
                <Button onClick={saveAsTemplate} variant="outline">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Composer */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject Line */}
          <div>
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Personalization Tokens */}
          <div>
            <Label>Personalization Tokens</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
              {personalizationTokens.map(({ token, description }) => (
                <Button
                  key={token}
                  variant="outline"
                  size="sm"
                  onClick={() => insertPersonalizationToken(token)}
                  className="text-xs"
                >
                  {token}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Click tokens to insert them into your email content. They'll be replaced with actual values when sent.
            </p>
          </div>

          {/* Formatting Toolbar */}
          <div>
            <Label>Email Content</Label>
            <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-t-lg border-b">
              <Button size="sm" variant="ghost" onClick={() => insertFormatting('strong')}>
                <Bold className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => insertFormatting('em')}>
                <Italic className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => insertFormatting('u')}>
                <Underline className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button size="sm" variant="ghost" onClick={() => insertFormatting('h2')}>
                <Type className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => insertFormatting('ul')}>
                <List className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => insertFormatting('ol')}>
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowLinkDialog(true)}>
                <Link className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowButtonDialog(true)}>
                <span className="font-bold text-xs">Btn</span>
              </Button>
            </div>
            <Textarea
              ref={contentRef}
              placeholder="Compose your email content here... You can use HTML tags for formatting."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] rounded-t-none"
            />
          </div>

          {/* Preview Toggle */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>

          {/* Email Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  This is how your email will look to recipients
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="border-b pb-4 mb-4">
                    <h3 className="font-semibold">Subject: {subject || 'No subject'}</h3>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Recipients & Trigger Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Recipients & Send Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recipients */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Select Recipients ({selectedRecipients.length}/{recipients.length})</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllRecipients}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllRecipients}>
                  Clear All
                </Button>
              </div>
            </div>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-2">
              {recipients.map(email => (
                <div key={email} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedRecipients.includes(email)}
                    onChange={() => toggleRecipient(email)}
                    className="rounded"
                  />
                  <span className="text-sm">{email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>When to Send</Label>
              <Select value={trigger} onValueChange={(value: any) => setTrigger(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Send Immediately</SelectItem>
                  <SelectItem value="delayed">Send After Delay</SelectItem>
                  <SelectItem value="test_completion">After Test Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {trigger === 'delayed' && (
              <div>
                <Label>Delay (hours)</Label>
                <Input
                  type="number"
                  min="1"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Send Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !subject || !content || selectedRecipients.length === 0}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Link text" value={linkText} onChange={e => setLinkText(e.target.value)} />
            <Input placeholder="URL (https://...)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
              <Button onClick={handleInsertLink} disabled={!linkText || !linkUrl}>Insert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Button Dialog */}
      <Dialog open={showButtonDialog} onOpenChange={setShowButtonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Button</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Button text" value={buttonText} onChange={e => setButtonText(e.target.value)} />
            <Input placeholder="Button URL (https://...)" value={buttonUrl} onChange={e => setButtonUrl(e.target.value)} />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setShowButtonDialog(false)}>Cancel</Button>
              <Button onClick={handleInsertButton} disabled={!buttonText || !buttonUrl}>Insert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};