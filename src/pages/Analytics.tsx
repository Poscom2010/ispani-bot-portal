import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  // Sample data for charts
  const earningsData = [
    { month: 'Jan', earnings: 1200 },
    { month: 'Feb', earnings: 1800 },
    { month: 'Mar', earnings: 1500 },
    { month: 'Apr', earnings: 2200 },
    { month: 'May', earnings: 1900 },
    { month: 'Jun', earnings: 2500 },
  ];

  const proposalData = [
    { status: 'Draft', count: 5 },
    { status: 'Pending', count: 12 },
    { status: 'Approved', count: 8 },
    { status: 'Rejected', count: 3 },
    { status: 'Completed', count: 15 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-4 md:space-y-3 h-auto md:h-screen overflow-y-auto md:overflow-hidden">
      <div className="flex items-center justify-between pt-0">
        <div>
          <h1 className="text-2xl md:text-xl font-bold tracking-tight mb-0">Analytics</h1>
          <p className="text-sm md:text-xs text-muted-foreground">
            Track your performance and earnings over time
          </p>
        </div>
      </div>

      {/* Enhanced Metrics Cards with Dashboard Effects */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-2">
        <Card className="shadow-card border border-border/60 bg-gradient-primary/10 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
          <CardContent className="p-3 md:p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Earnings</p>
                <div className="text-lg md:text-xl font-bold text-primary">$11,100</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +20.1% from last month
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <BarChart className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border border-border/60 bg-gradient-hero/10 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
          <CardContent className="p-3 md:p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Active Proposals</p>
                <div className="text-lg md:text-xl font-bold text-primary">12</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +2 from last week
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <BarChart className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border border-border/60 bg-gradient-primary/5 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
          <CardContent className="p-3 md:p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Success Rate</p>
                <div className="text-lg md:text-xl font-bold text-primary">85%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +5% from last month
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <BarChart className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border border-border/60 bg-gradient-hero/5 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
          <CardContent className="p-3 md:p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Avg. Response Time</p>
                <div className="text-lg md:text-xl font-bold text-primary">2.4h</div>
                <p className="text-xs text-muted-foreground mt-1">
                  -0.3h from last week
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <BarChart className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Mobile Responsive */}
      <div className="grid gap-4 md:gap-2 md:grid-cols-2">
        <Card className="shadow-card border border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2 md:pb-1">
            <CardTitle className="text-base md:text-sm">Monthly Earnings</CardTitle>
            <CardDescription className="text-sm md:text-xs">
              Your earnings trend over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200} className="md:h-[150px]">
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="earnings" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card border border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2 md:pb-1">
            <CardTitle className="text-base md:text-sm">Proposal Status Distribution</CardTitle>
            <CardDescription className="text-sm md:text-xs">
              Breakdown of your proposals by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200} className="md:h-[150px]">
              <PieChart>
                <Pie
                  data={proposalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  className="md:outerRadius-[45px]"
                  fill="#8884d8"
                  dataKey="count"
                >
                  {proposalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Mobile Responsive */}
      <Card className="shadow-card border border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2 md:pb-1">
          <CardTitle className="text-base md:text-sm">Recent Activity</CardTitle>
          <CardDescription className="text-sm md:text-xs">
            Your latest proposals and earnings
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 md:space-y-1">
            <div className="flex items-center justify-between p-3 md:p-1 border rounded-lg">
              <div>
                <p className="font-medium text-sm md:text-xs">Website Redesign Proposal</p>
                <p className="text-sm md:text-xs text-muted-foreground">Approved • $2,500</p>
              </div>
              <span className="text-sm md:text-xs text-green-600">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 md:p-1 border rounded-lg">
              <div>
                <p className="font-medium text-sm md:text-xs">Mobile App Development</p>
                <p className="text-sm md:text-xs text-muted-foreground">Pending • $5,000</p>
              </div>
              <span className="text-sm md:text-xs text-yellow-600">1 day ago</span>
            </div>
            <div className="flex items-center justify-between p-3 md:p-1 border rounded-lg">
              <div>
                <p className="font-medium text-sm md:text-xs">Logo Design Project</p>
                <p className="text-sm md:text-xs text-muted-foreground">Completed • $800</p>
              </div>
              <span className="text-sm md:text-xs text-gray-600">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics; 