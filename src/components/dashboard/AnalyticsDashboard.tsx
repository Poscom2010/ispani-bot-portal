import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Clock, CheckCircle, DollarSign, Calendar } from 'lucide-react';

const AnalyticsDashboard = () => {
  const { user } = useAuth();

  // Fetch proposals with detailed analytics
  const { data: proposals, error: proposalsError, isLoading: proposalsLoading } = useQuery({
    queryKey: ['proposals-analytics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch earnings for analytics
  const { data: earnings, error: earningsError, isLoading: earningsLoading } = useQuery({
    queryKey: ['earnings-analytics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Show loading state
  if (proposalsLoading || earningsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <BarChart className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Loading Analytics</h3>
          <p className="text-muted-foreground">Gathering your data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (proposalsError || earningsError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <BarChart className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
          <p className="text-muted-foreground">Unable to load analytics data. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Demo data for showcasing analytics
  const demoProposals = [
    { id: '1', status: 'approved', created_at: '2024-01-15T10:00:00Z', estimated_value: 2500 },
    { id: '2', status: 'pending', created_at: '2024-02-20T14:30:00Z', estimated_value: 1800 },
    { id: '3', status: 'completed', created_at: '2024-03-10T09:15:00Z', estimated_value: 3200 },
    { id: '4', status: 'draft', created_at: '2024-03-25T16:45:00Z', estimated_value: 1500 },
    { id: '5', status: 'approved', created_at: '2024-04-05T11:20:00Z', estimated_value: 2800 },
    { id: '6', status: 'rejected', created_at: '2024-04-15T13:10:00Z', estimated_value: 1200 },
    { id: '7', status: 'completed', created_at: '2024-05-01T08:30:00Z', estimated_value: 4100 },
    { id: '8', status: 'pending', created_at: '2024-05-10T15:45:00Z', estimated_value: 2200 },
  ];

  const demoEarnings = [
    { id: '1', amount: 2500, status: 'paid', created_at: '2024-01-20T10:00:00Z' },
    { id: '2', amount: 1800, status: 'pending', created_at: '2024-02-25T14:30:00Z' },
    { id: '3', amount: 3200, status: 'paid', created_at: '2024-03-15T09:15:00Z' },
    { id: '4', amount: 2800, status: 'paid', created_at: '2024-04-10T11:20:00Z' },
    { id: '5', amount: 4100, status: 'paid', created_at: '2024-05-05T08:30:00Z' },
    { id: '6', amount: 2200, status: 'pending', created_at: '2024-05-15T15:45:00Z' },
  ];

  // Use demo data if no real data exists
  const proposalsData = proposals && proposals.length > 0 ? proposals : demoProposals;
  const earningsData = earnings && earnings.length > 0 ? earnings : demoEarnings;

  // Memoize all chart data and metrics calculations
  const chartData = useMemo(() => {
    // Calculate analytics data
    const statusData = [
      { name: 'Draft', value: proposalsData.filter(p => p.status === 'draft').length, color: '#6B7280' },
      { name: 'Pending', value: proposalsData.filter(p => p.status === 'pending').length, color: '#F59E0B' },
      { name: 'Approved', value: proposalsData.filter(p => p.status === 'approved').length, color: '#10B981' },
      { name: 'Rejected', value: proposalsData.filter(p => p.status === 'rejected').length, color: '#EF4444' },
      { name: 'Completed', value: proposalsData.filter(p => p.status === 'completed').length, color: '#3B82F6' }
    ].filter(item => item.value > 0); // Only show statuses with data

    // Monthly proposal creation data
    const monthlyData = proposalsData.reduce((acc, proposal) => {
      const month = new Date(proposal.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      proposals: count
    })).slice(-6); // Last 6 months

    // Ensure we have at least some data for the chart
    if (monthlyChartData.length === 0) {
      monthlyChartData.push({ month: 'Jan 2024', proposals: 0 });
    }

    // Earnings over time
    const earningsChartDataRaw = earningsData.reduce((acc, earning) => {
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

    const earningsChartData = Object.values(earningsChartDataRaw).slice(-6);

    // Ensure we have at least some data for the earnings chart
    if (earningsChartData.length === 0) {
      earningsChartData.push({ month: 'Jan 2024', total: 0, paid: 0 });
    }

    return {
      statusData,
      monthlyChartData,
      earningsChartData
    };
  }, [proposalsData, earningsData]);

  // Memoize key metrics
  const metrics = useMemo(() => {
    const totalProposals = proposalsData.length;
    const approvedProposals = proposalsData.filter(p => p.status === 'approved').length;
    const completedProposals = proposalsData.filter(p => p.status === 'completed').length;
    const approvalRate = totalProposals > 0 ? (approvedProposals / totalProposals * 100).toFixed(1) : '0';
    const completionRate = approvedProposals > 0 ? (completedProposals / approvedProposals * 100).toFixed(1) : '0';
    
    const totalEarnings = earningsData.reduce((sum, e) => sum + e.amount, 0);
    const paidEarnings = earningsData.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
    const avgProposalValue = proposalsData.filter(p => p.estimated_value).length > 0 
      ? proposalsData.filter(p => p.estimated_value).reduce((sum, p) => sum + (p.estimated_value || 0), 0) / proposalsData.filter(p => p.estimated_value).length
      : 0;

    return {
      totalProposals,
      approvedProposals,
      completedProposals,
      approvalRate,
      completionRate,
      totalEarnings,
      paidEarnings,
      avgProposalValue
    };
  }, [proposalsData, earningsData]);

  const { statusData, monthlyChartData, earningsChartData } = chartData;
  const { approvalRate, completionRate, totalEarnings, paidEarnings, avgProposalValue } = metrics;

  const isUsingDemoData = (!proposals || proposals.length === 0) || (!earnings || earnings.length === 0);

  return (
    <div className="space-y-1.5 -mt-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-card border border-border/60 bg-gradient-primary/10 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Approval Rate</p>
                <div className="text-2xl font-bold text-primary">{approvalRate}%</div>
              </div>
              <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border border-border/60 bg-gradient-hero/10 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completion Rate</p>
                <div className="text-2xl font-bold text-accent">{completionRate}%</div>
              </div>
              <div className="h-10 w-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border border-border/60 bg-gradient-primary/5 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Proposal Value</p>
                <div className="text-2xl font-bold text-primary-glow">${avgProposalValue.toLocaleString()}</div>
              </div>
              <div className="h-10 w-10 bg-primary-glow/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-glow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border border-border/60 bg-gradient-hero/5 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Collection Rate</p>
                <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  {totalEarnings > 0 ? ((paidEarnings / totalEarnings) * 100).toFixed(1) : '0'}%
                </div>
              </div>
              <div className="h-10 w-10 bg-gradient-hero/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 -mt-1">
        {/* Proposal Status Distribution */}
        <Card className="shadow-card border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-1 text-xs">
              <Target className="h-3 w-3 text-primary" />
              Proposal Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[120px] text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No proposal data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Proposals */}
        <Card className="shadow-card border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3 text-primary" />
              Monthly Proposal Creation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Proposals']} />
                <Bar dataKey="proposals" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card className="shadow-card border-0 bg-card/90 backdrop-blur-sm -mt-1">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-1 text-xs">
            <DollarSign className="h-3 w-3 text-primary" />
            Earnings Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={earningsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Total Earnings"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="paid" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="Paid Earnings"
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demo Data Notice - Moved to bottom */}
      {isUsingDemoData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-blue-700 font-medium">
              📊 Demo analytics data
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;