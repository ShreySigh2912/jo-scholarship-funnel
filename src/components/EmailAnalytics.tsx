import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, Users, Clock, CheckCircle, XCircle, Eye, MousePointer } from "lucide-react";

interface EmailAnalyticsProps {
  analytics: EmailAnalyticsData;
}

interface EmailAnalyticsData {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  recentEmails: EmailStatus[];
  openRateByDay: { date: string; opens: number; }[];
  campaignPerformance: { campaign: string; sent: number; opened: number; clicked: number; }[];
}

interface EmailStatus {
  id: string;
  subject: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  failed: number;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed' | 'scheduled';
}

const COLORS = ['#4c51bf', '#10b981', '#f59e0b', '#ef4444'];

export const EmailAnalytics: React.FC<EmailAnalyticsProps> = ({ analytics }) => {
  const deliveryRate = analytics.totalSent > 0 ? (analytics.totalDelivered / analytics.totalSent * 100).toFixed(1) : '0';
  const openRate = analytics.totalDelivered > 0 ? (analytics.totalOpened / analytics.totalDelivered * 100).toFixed(1) : '0';
  const clickRate = analytics.totalOpened > 0 ? (analytics.totalClicked / analytics.totalOpened * 100).toFixed(1) : '0';

  const pieData = [
    { name: 'Delivered', value: analytics.totalDelivered, color: '#10b981' },
    { name: 'Opened', value: analytics.totalOpened, color: '#4c51bf' },
    { name: 'Clicked', value: analytics.totalClicked, color: '#f59e0b' },
    { name: 'Failed', value: analytics.totalFailed, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{analytics.totalSent.toLocaleString()}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold">{deliveryRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{openRate}%</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{clickRate}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Email Opens Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.openRateByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="opens" fill="#4c51bf" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Email Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Email Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.campaignPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="campaign" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sent" fill="#8884d8" name="Sent" />
              <Bar dataKey="opened" fill="#82ca9d" name="Opened" />
              <Bar dataKey="clicked" fill="#ffc658" name="Clicked" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Emails Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Email Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Clicked</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.recentEmails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium">{email.subject}</TableCell>
                  <TableCell>{email.recipients}</TableCell>
                  <TableCell>{email.sent}</TableCell>
                  <TableCell>{email.opened}</TableCell>
                  <TableCell>{email.clicked}</TableCell>
                  <TableCell>{email.failed}</TableCell>
                  <TableCell>
                    <Badge variant={
                      email.status === 'sent' ? 'default' :
                      email.status === 'delivered' ? 'default' :
                      email.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {email.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(email.sentAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};