import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Analytics state
  const [stats, setStats] = useState({
    users: 0,
    jobs: 0,
    applications: 0,
    completedJobs: 0,
    earnings: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: usersData } = await supabase.from('profiles').select('*');
      const { data: jobsData } = await supabase.from('jobs').select('*');
      setUsers(usersData || []);
      setJobs(jobsData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: jobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
      const { count: applications } = await supabase.from('job_applications').select('*', { count: 'exact', head: true });
      const { count: completedJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed');
      const { data: earningsData } = await supabase.from('earnings').select('amount');
      const earnings = earningsData ? earningsData.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) : 0;
      setStats({
        users: users || 0,
        jobs: jobs || 0,
        applications: applications || 0,
        completedJobs: completedJobs || 0,
        earnings,
      });
      setLoadingStats(false);
    };
    fetchStats();
  }, []);

  if (loading || loadingStats) return <div className="p-8 text-center">Loading admin dashboard...</div>;

  if (!jobs) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <h1 className="text-3xl font-extrabold mb-8">Admin Dashboard</h1>
      {/* Analytics Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Platform Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Total Users</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{stats.users}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Jobs</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{stats.jobs}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Applications</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{stats.applications}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Completed Jobs</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{stats.completedJobs}</div></CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Total Earnings</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">${stats.earnings.toLocaleString()}</div></CardContent>
          </Card>
        </div>
      </div>
      {/* Users Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{u.id}</td>
                    <td className="p-2">{u.full_name}</td>
                    <td className="p-2">{u.email || u.id}</td>
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">{u.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">Posted By</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {(jobs || []).map((j) => (
                  <tr key={j.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{j.id}</td>
                    <td className="p-2">{j.title}</td>
                    <td className="p-2">{j.posted_by}</td>
                    <td className="p-2">{j.status}</td>
                    <td className="p-2">{j.created_at ? new Date(j.created_at).toLocaleDateString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 