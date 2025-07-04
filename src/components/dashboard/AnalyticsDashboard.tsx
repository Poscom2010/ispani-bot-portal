import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Clock, CheckCircle, DollarSign, Calendar } from 'lucide-react';

const AnalyticsDashboard = () => {
  const { user } = useAuth();

  // Fetch proposals with detailed analytics
  const { data: proposals } = useQuery({
    queryKey: ['proposals-analytics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch earnings for analytics
  const { data: earnings } = useQuery({
    queryKey: ['earnings-analytics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  if (!proposals || !earnings) {
    return <div>Loading analytics...</div>;
  }

  // Calculate analytics data
  const statusData = [
    { name: 'Draft', value: proposals.filter(p => p.status === 'draft').length, color: '#6B7280' },
    { name: 'Pending', value: proposals.filter(p => p.status === 'pending').length, color: '#F59E0B' },
    { name: 'Approved', value: proposals.filter(p => p.status === 'approved').length, color: '#10B981' },
    { name: 'Rejected', value: proposals.filter(p => p.status === 'rejected').length, color: '#EF4444' },
    { name: 'Completed', value: proposals.filter(p => p.status === 'completed').length, color: '#3B82F6' }
  ];

  // Monthly proposal creation data
  const monthlyData = proposals.reduce((acc, proposal) => {
    const month = new Date(proposal.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    proposals: count
  })).slice(-6); // Last 6 months

  // Earnings over time
  const earningsData = earnings.reduce((acc, earning) => {
    const month = new Date(earning.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { month, total: 0, paid: 0 };
    }
    acc[month].total += earning.amount;
    if (earning.status === 'paid') {
      acc[month].paid += earning.amount;
    }
    return acc;
  }, {} as Record<string, { month: string; total: number; paid: number }>);

  const earningsChartData = Object.values(earningsData).slice(-6);

  // Key metrics
  const totalProposals = proposals.length;
  const approvedProposals = proposals.filter(p => p.status === 'approved').length;
  const completedProposals = proposals.filter(p => p.status === 'completed').length;
  const approvalRate = totalProposals > 0 ? (approvedProposals / totalProposals * 100).toFixed(1) : '0';
  const completionRate = approvedProposals > 0 ? (completedProposals / approvedProposals * 100).toFixed(1) : '0';
  
  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const paidEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const avgProposalValue = proposals.filter(p => p.estimated_value).length > 0 
    ? proposals.filter(p => p.estimated_value).reduce((sum, p) => sum + (p.estimated_value || 0), 0) / proposals.filter(p => p.estimated_value).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card border-0 bg-gradient-primary/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approval Rate</p>
                <div className="text-2xl font-bold text-primary">{approvalRate}%</div>
              </div>
              <Target className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-hero/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <div className="text-2xl font-bold text-accent">{completionRate}%</div>
              </div>
              <CheckCircle className="h-8 w-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-primary/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Proposal Value</p>
                <div className="text-2xl font-bold text-primary">${avgProposalValue.toLocaleString()}</div>
              </div>
              <DollarSign className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-hero/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  {totalEarnings > 0 ? ((paidEarnings / totalEarnings) * 100).toFixed(1) : '0'}%
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proposal Status Distribution */}
        <Card className="shadow-card border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Proposal Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Proposals */}
        <Card className="shadow-card border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Monthly Proposal Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="proposals" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card className="shadow-card border-0 bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Earnings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, '']} />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Total Earnings"
              />
              <Line 
                type="monotone" 
                dataKey="paid" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="Paid Earnings"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;