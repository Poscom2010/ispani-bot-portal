import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase, User, Send, MessageCircle, Paperclip, Star, Clock } from 'lucide-react';
import JobChatModal from '@/components/job/JobChatModal';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const importanceOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const JobBoard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pay, setPay] = useState('');
  const [deadline, setDeadline] = useState('');
  const [posting, setPosting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatJobId, setChatJobId] = useState<string | null>(null);
  const [chatClientId, setChatClientId] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [applicationFile, setApplicationFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [applications, setApplications] = useState<{ [jobId: string]: any[] }>({});
  const [milestones, setMilestones] = useState<{ [jobId: string]: any[] }>({});
  const [newMilestone, setNewMilestone] = useState<{ [jobId: string]: { title: string; description: string; due_date: string; amount: string } }>({});
  const [addingMilestone, setAddingMilestone] = useState<{ [jobId: string]: boolean }>({});
  const [freelancerMilestones, setFreelancerMilestones] = useState<{ [jobId: string]: any[] }>({});
  const [masterSkills, setMasterSkills] = useState<any[]>([]);
  const [jobSkills, setJobSkills] = useState<any[]>([]);
  const [jobCardSkills, setJobCardSkills] = useState<{ [jobId: string]: any[] }>({});
  const [search, setSearch] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewJob, setReviewJob] = useState<any>(null);
  const [revieweeId, setRevieweeId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  // Fetch jobs
  const { data: jobs, isLoading: jobsLoading, refetch, error: jobsError } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !loading && !!user?.id,
    retry: 3,
    retryDelay: 1000
  });

  // Fetch applications for jobs posted by the current user (client)
  useEffect(() => {
    if (!user) return;
    const fetchApplications = async () => {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id')
        .eq('posted_by', user.id);
      if (!jobsData) return;
      const jobIds = jobsData.map((j: any) => j.id);
      if (jobIds.length === 0) return;
      const { data: appsData, error } = await supabase
        .from('job_applications')
        .select('*, applicant:profiles(full_name, avatar_url, role)')
        .in('job_id', jobIds);
      if (!error && appsData) {
        const grouped: { [jobId: string]: any[] } = {};
        appsData.forEach((app: any) => {
          if (!grouped[app.job_id]) grouped[app.job_id] = [];
          grouped[app.job_id].push(app);
        });
        setApplications(grouped);
      }
    };
    fetchApplications();
    // No cleanup needed
    return undefined;
  }, [user]);

  // Fetch milestones for jobs posted by the current user (client)
  useEffect(() => {
    if (!user) return;
    const fetchMilestones = async () => {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id')
        .eq('posted_by', user.id);
      if (!jobsData) return;
      const jobIds = jobsData.map((j: any) => j.id);
      if (jobIds.length === 0) return;
      const { data: msData, error } = await supabase
        .from('job_milestones')
        .select('*')
        .in('job_id', jobIds);
      if (!error && msData) {
        const grouped: { [jobId: string]: any[] } = {};
        msData.forEach((ms: any) => {
          if (!grouped[ms.job_id]) grouped[ms.job_id] = [];
          grouped[ms.job_id].push(ms);
        });
        setMilestones(grouped);
      }
    };
    fetchMilestones();
    return undefined;
  }, [user]);

  // Fetch milestones for jobs where the user is the freelancer (accepted application)
  useEffect(() => {
    if (!user) return;
    const fetchFreelancerMilestones = async () => {
      // Get jobs where user has an accepted application
      const { data: appsData } = await supabase
        .from('job_applications')
        .select('job_id, status')
        .eq('applicant_id', user.id)
        .eq('status', 'accepted');
      if (!appsData) return;
      const jobIds = appsData.map((a: any) => a.job_id);
      if (jobIds.length === 0) return;
      const { data: msData, error } = await supabase
        .from('job_milestones')
        .select('*')
        .in('job_id', jobIds);
      if (!error && msData) {
        const grouped: { [jobId: string]: any[] } = {};
        msData.forEach((ms: any) => {
          if (!grouped[ms.job_id]) grouped[ms.job_id] = [];
          grouped[ms.job_id].push(ms);
        });
        setFreelancerMilestones(grouped);
      }
    };
    fetchFreelancerMilestones();
    return undefined;
  }, [user]);

  useEffect(() => {
    supabase.from('skills').select('*').then(({ data }) => setMasterSkills(data || []));
  }, []);

  const handleAddJobSkill = () => {
    setJobSkills((prev) => [...prev, { skill_id: '', importance_level: 'Medium', is_required: false }]);
  };
  const handleJobSkillChange = (idx: number, field: string, value: any) => {
    setJobSkills((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };
  const handleRemoveJobSkill = (idx: number) => {
    setJobSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // Post a new job
  const handlePostJob = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    setPosting(true);
    const { data: jobData, error } = await supabase.from('jobs').insert({
      title,
      description,
      pay_per_hour: pay ? Number(pay) : null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      posted_by: user.id,
    }).select();
    if (error) {
      setPosting(false);
      toast({
        title: 'Job Post Failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    // Insert job_skills
    if (jobData && jobData[0] && jobSkills.length > 0) {
      const job_id = jobData[0].id;
      const skillsToInsert = jobSkills.filter(s => s.skill_id).map(s => ({
        job_id,
        skill_id: s.skill_id,
        importance_level: s.importance_level,
        is_required: s.is_required,
      }));
      if (skillsToInsert.length > 0) {
        await supabase.from('job_skills').insert(skillsToInsert);
      }
    }
    setPosting(false);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setPay('');
      setDeadline('');
    setJobSkills([]);
      refetch();
      toast({
        title: 'Job Posted',
        description: 'Your job has been posted to the board.',
      });
  };

  // Accept job (placeholder)
  const handleAcceptJob = (jobId: string) => {
    toast({
      title: 'Job Accepted',
      description: 'You have accepted this job (demo only).',
    });
  };

  const handleOpenApplyModal = (jobId: string) => {
    setApplyJobId(jobId);
    setApplyModalOpen(true);
    setCoverLetter('');
    setProposedRate('');
    setApplicationFile(null);
  };

  const handleApplicationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setApplicationFile(e.target.files[0]);
    }
  };

  const handleSubmitApplication = async () => {
    if (!applyJobId || !user) return;
    setSubmitting(true);
    let fileUrl = null;
    if (applicationFile) {
      const filePath = `applications/job_${applyJobId}/user_${user.id}_${Date.now()}_${applicationFile.name}`;
      const { data, error: uploadError } = await supabase.storage.from('applications').upload(filePath, applicationFile, { upsert: true });
      if (uploadError) {
        toast({ title: 'File Upload Failed', description: uploadError.message, variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      fileUrl = data?.path ? supabase.storage.from('applications').getPublicUrl(data.path).data.publicUrl : null;
    }
    const { error } = await supabase
      .from('job_applications')
      .insert([
        {
          job_id: applyJobId,
          applicant_id: user.id,
          cover_letter: coverLetter,
          proposed_rate: proposedRate ? Number(proposedRate) : null,
          file_url: fileUrl,
          status: 'pending',
        }
      ]);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Application Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Application Submitted', description: 'Your application has been submitted.' });
      setApplyModalOpen(false);
      setApplyJobId(null);
      setCoverLetter('');
      setProposedRate('');
      setApplicationFile(null);
    }
  };

  const handleAddMilestone = async (jobId: string) => {
    if (!newMilestone[jobId]?.title || !newMilestone[jobId]?.amount) return;
    setAddingMilestone((prev) => ({ ...prev, [jobId]: true }));
    const { error } = await supabase
      .from('job_milestones')
      .insert([
        {
          job_id: jobId,
          title: newMilestone[jobId].title,
          description: newMilestone[jobId].description,
          due_date: newMilestone[jobId].due_date || null,
          amount: newMilestone[jobId].amount ? Number(newMilestone[jobId].amount) : null,
          status: 'pending',
        }
      ]);
    setAddingMilestone((prev) => ({ ...prev, [jobId]: false }));
    if (!error) {
      setNewMilestone((prev) => ({ ...prev, [jobId]: { title: '', description: '', due_date: '', amount: '' } }));
      // Refetch milestones
      const { data: msData } = await supabase.from('job_milestones').select('*').eq('job_id', jobId);
      setMilestones((prev) => ({ ...prev, [jobId]: msData || [] }));
      toast({ title: 'Milestone Added', description: 'Milestone created successfully.' });
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // Milestone action handlers
  const handleMarkCompleted = async (milestoneId: string, jobId: string) => {
    const { error } = await supabase
      .from('job_milestones')
      .update({ status: 'completed' })
      .eq('id', milestoneId);
    if (!error) {
      // Refetch milestones
      const { data: msData } = await supabase.from('job_milestones').select('*').eq('job_id', jobId);
      setFreelancerMilestones((prev) => ({ ...prev, [jobId]: msData || [] }));
      setMilestones((prev) => ({ ...prev, [jobId]: msData || [] }));
      toast({ title: 'Milestone Completed', description: 'Milestone marked as completed.' });
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };
  const handleApproveMilestone = async (milestoneId: string, jobId: string) => {
    const { error } = await supabase
      .from('job_milestones')
      .update({ status: 'approved' })
      .eq('id', milestoneId);
    if (!error) {
      const { data: msData } = await supabase.from('job_milestones').select('*').eq('job_id', jobId);
      setMilestones((prev) => ({ ...prev, [jobId]: msData || [] }));
      toast({ title: 'Milestone Approved', description: 'Milestone approved.' });
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };
  const handleRejectMilestone = async (milestoneId: string, jobId: string) => {
    const { error } = await supabase
      .from('job_milestones')
      .update({ status: 'rejected' })
      .eq('id', milestoneId);
    if (!error) {
      const { data: msData } = await supabase.from('job_milestones').select('*').eq('job_id', jobId);
      setMilestones((prev) => ({ ...prev, [jobId]: msData || [] }));
      toast({ title: 'Milestone Rejected', description: 'Milestone rejected.' });
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // Fetch job_skills for all jobs
  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    const fetchJobSkills = async () => {
      const jobIds = jobs.map((j: any) => j.id);
      if (jobIds.length === 0) return;
      const { data: jsData, error } = await supabase
        .from('job_skills')
        .select('*, skill:skills(name, category)')
        .in('job_id', jobIds);
      if (!error && jsData) {
        const grouped: { [jobId: string]: any[] } = {};
        jsData.forEach((js: any) => {
          if (!grouped[js.job_id]) grouped[js.job_id] = [];
          grouped[js.job_id].push(js);
        });
        setJobCardSkills(grouped);
      }
    };
    fetchJobSkills();
  }, [jobs]);

  // Fetch reviews left by the user
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('reviews')
      .select('*')
      .eq('reviewer_id', user.id)
      .then(({ data }) => setUserReviews(data || []));
  }, [user]);

  // Helper: has user reviewed this job?
  const hasReviewed = (jobId: string, reviewee: string) => {
    return userReviews.some(r => r.job_id === jobId && r.reviewee_id === reviewee);
  };

  // Demo jobs for MVP
  const demoJobs = [
    {
      id: 'demo-1',
      title: 'React Frontend Developer',
      description: 'Looking for a skilled React developer to build modern web applications. Experience with TypeScript, Redux, and responsive design required.',
      pay_per_hour: 45,
      deadline: '2024-02-15',
      posted_by: 'demo-client-1',
      profiles: { full_name: 'TechCorp Inc.' },
      status: 'open'
    },
    {
      id: 'demo-2',
      title: 'UI/UX Designer',
      description: 'Creative designer needed for mobile app redesign. Must have experience with Figma, user research, and design systems.',
      pay_per_hour: 35,
      deadline: '2024-02-20',
      posted_by: 'demo-client-2',
      profiles: { full_name: 'Design Studio' },
      status: 'open'
    },
    {
      id: 'demo-3',
      title: 'Content Writer',
      description: 'Experienced content writer for tech blog. Topics include AI, web development, and digital marketing. SEO knowledge preferred.',
      pay_per_hour: 25,
      deadline: '2024-02-18',
      posted_by: 'demo-client-3',
      profiles: { full_name: 'TechBlog Media' },
      status: 'open'
    },
    {
      id: 'demo-4',
      title: 'Python Data Analyst',
      description: 'Data analyst to work with large datasets using Python, pandas, and visualization libraries. Experience with SQL required.',
      pay_per_hour: 40,
      deadline: '2024-02-25',
      posted_by: 'demo-client-4',
      profiles: { full_name: 'Data Insights Co.' },
      status: 'open'
    },
    {
      id: 'demo-5',
      title: 'Mobile App Developer',
      description: 'iOS/Android developer for fitness tracking app. Experience with React Native, Firebase, and app store deployment.',
      pay_per_hour: 50,
      deadline: '2024-02-22',
      posted_by: 'demo-client-5',
      profiles: { full_name: 'FitTech Solutions' },
      status: 'open'
    },
    {
      id: 'demo-6',
      title: 'SEO Specialist',
      description: 'SEO expert to improve website rankings and organic traffic. Experience with Google Analytics, keyword research, and link building.',
      pay_per_hour: 30,
      deadline: '2024-02-28',
      posted_by: 'demo-client-6',
      profiles: { full_name: 'Digital Marketing Pro' },
      status: 'open'
    }
  ];

  // Add loading and guard for jobs
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Loading...</span></div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><span className="text-muted-foreground">Please log in to view jobs</span></div>;
  }

  if (jobsError) {
    console.error('Jobs query error:', jobsError);
    return <div className="flex items-center justify-center min-h-screen"><span className="text-red-500">Error loading jobs. Please try again.</span></div>;
  }

  if (jobsLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Loading jobs...</span></div>;
  }

  // Use demo jobs if no real jobs exist
  const jobsToDisplay = jobs && jobs.length > 0 ? jobs : demoJobs;

  // Filtered jobs
  const filteredJobs = (jobsToDisplay || []).filter((job: any) => {
    // Keyword filter
    const keywordMatch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    return keywordMatch;
  });

  // 1. Application Acceptance Notification
  // After updating job_applications status to 'accepted', notify the freelancer
  const handleAcceptApplication = async (applicationId: string, jobId: string, applicantId: string) => {
    await supabase
      .from('job_applications')
      .update({ status: 'accepted' })
      .eq('id', applicationId);
    // Fetch job title for the notification
    const { data: jobData } = await supabase.from('jobs').select('title').eq('id', jobId).single();
    const jobTitle = jobData?.title || 'a job';
    await supabase.from('notifications').insert({
      user_id: applicantId,
      type: 'Application Accepted',
      content: `Your application for "${jobTitle}" was accepted!`,
    });
  };

  // 2. Milestone Status Change Notifications
  // After updating milestone status, notify the relevant user
  const handleMarkMilestoneCompleted = async (milestoneId: string, jobId: string, clientId: string) => {
    await supabase
      .from('job_milestones')
      .update({ status: 'completed' })
      .eq('id', milestoneId);
    // Fetch milestone and job info
    const { data: msData } = await supabase.from('job_milestones').select('title').eq('id', milestoneId).single();
    const { data: jobData } = await supabase.from('jobs').select('title').eq('id', jobId).single();
    const milestoneTitle = msData?.title || 'a milestone';
    const jobTitle = jobData?.title || 'a job';
    await supabase.from('notifications').insert({
      user_id: clientId,
      type: 'Milestone Completed',
      content: `Milestone "${milestoneTitle}" for job "${jobTitle}" was marked as completed.`,
    });
  };
  const handleApproveMilestoneWithNotification = async (milestoneId: string, jobId: string, freelancerId: string) => {
    await supabase
      .from('job_milestones')
      .update({ status: 'approved' })
      .eq('id', milestoneId);
    // Fetch milestone and job info
    const { data: msData } = await supabase.from('job_milestones').select('title').eq('id', milestoneId).single();
    const { data: jobData } = await supabase.from('jobs').select('title').eq('id', jobId).single();
    const milestoneTitle = msData?.title || 'a milestone';
    const jobTitle = jobData?.title || 'a job';
    await supabase.from('notifications').insert({
      user_id: freelancerId,
      type: 'Milestone Approved',
      content: `Milestone "${milestoneTitle}" for job "${jobTitle}" was approved!`,
    });
  };

  // 3. Proposal Status Change Notification
  // After updating proposal status, notify the client
  const handleUpdateProposalStatus = async (
    proposalId: string,
    clientId: string,
    newStatus: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed'
  ) => {
    await supabase
      .from('proposals')
      .update({ status: newStatus })
      .eq('id', proposalId);
    // Fetch proposal info
    const { data: proposalData } = await supabase.from('proposals').select('title').eq('id', proposalId).single();
    const proposalTitle = proposalData?.title || 'a proposal';
    await supabase.from('notifications').insert({
      user_id: clientId,
      type: 'Proposal Status',
      content: `Proposal "${proposalTitle}" status changed to ${newStatus}.`,
    });
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-3 md:space-y-1 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-1 gap-3 md:gap-1">
          <div>
            <h1 className="text-xl md:text-base font-extrabold bg-gradient-hero bg-clip-text text-transparent tracking-tight mb-0">Ispan Panel</h1>
            <p className="text-xs md:text-[8px] text-muted-foreground">Find your next freelance opportunity or post a job</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="rounded-lg shadow-md hover:scale-105 transition-transform text-sm md:text-xs h-8 md:h-6 w-full sm:w-auto">
                <Briefcase className="h-4 w-4 md:h-3 md:w-3 mr-1" />
                Post a Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-[95vw] md:w-full rounded-2xl p-4 md:p-6 animate-fade-in">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold mb-2">Post a New Job</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title" className="text-sm">Job Title</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="rounded-lg mt-1 text-sm h-10 md:h-8" />
                </div>
                <div>
                <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required className="rounded-lg mt-1 text-sm" rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                <Label htmlFor="pay" className="text-sm">Pay per Hour (USD)</Label>
                    <Input id="pay" type="number" min="0" step="0.01" value={pay} onChange={e => setPay(e.target.value)} className="rounded-lg mt-1 text-sm h-10 md:h-8" />
                  </div>
                  <div>
                <Label htmlFor="deadline" className="text-sm">Deadline</Label>
                    <Input id="deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="rounded-lg mt-1 text-sm h-10 md:h-8" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Required Skills</Label>
                  <div className="space-y-2 mb-2 mt-1">
                    {jobSkills.map((s, idx) => (
                      <div key={idx} className="flex flex-col gap-2 items-stretch bg-muted/40 rounded-lg p-3 md:p-2">
                        <select
                          value={s.skill_id}
                          onChange={e => handleJobSkillChange(idx, 'skill_id', e.target.value)}
                          className="rounded-lg border p-2 md:p-1 text-sm w-full"
                        >
                          <option value="">Select skill</option>
                          {masterSkills.map((sk) => (
                            <option key={sk.id} value={sk.id}>{sk.name} ({sk.category})</option>
                          ))}
                        </select>
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                          <select
                            value={s.importance_level}
                            onChange={e => handleJobSkillChange(idx, 'importance_level', e.target.value)}
                            className="rounded-lg border p-2 md:p-1 text-sm w-full sm:w-24"
                          >
                            {importanceOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-1">
                              <Switch checked={s.is_required} onCheckedChange={v => handleJobSkillChange(idx, 'is_required', v)} />
                              <span className="text-xs">Required</span>
                            </div>
                            <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveJobSkill(idx)} className="text-xs h-8 md:h-6">Remove</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button type="button" onClick={handleAddJobSkill} variant="outline" className="mb-2 text-xs h-8 md:h-6">+ Add Skill</Button>
                </div>
                <Button onClick={handlePostJob} disabled={posting} className="w-full mt-3 rounded-lg font-semibold text-sm shadow-md hover:scale-[1.03] transition-transform h-10 md:h-8">
                  {posting ? <Loader2 className="h-4 w-4 md:h-3 md:w-3 animate-spin mr-2" /> : null}
                  Post Job
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Section */}
        <div className="bg-card/50 rounded-lg p-3 md:p-2 shadow-sm border">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Label htmlFor="search" className="text-sm font-medium whitespace-nowrap">Search:</Label>
            <Input
              id="search"
              type="text"
              placeholder="Job title, description, keywords..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 md:h-8 text-sm"
            />
          </div>
        </div>

        {/* Jobs Section */}
        {jobsLoading ? (
          <div className="flex items-center justify-center py-8 md:py-4">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 md:h-6 md:w-6 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading jobs...</p>
            </div>
          </div>
        ) : jobsToDisplay && jobsToDisplay.length > 0 ? (
          <div className="space-y-3 md:space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-xl md:text-lg font-bold">Available Jobs</h2>
              <p className="text-sm text-muted-foreground">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</p>
            </div>
            
            {filteredJobs.length === 0 ? (
              <div className="text-center py-8 md:py-4">
                <div className="mx-auto w-16 h-16 md:w-12 md:h-12 bg-muted rounded-full flex items-center justify-center mb-3 md:mb-2">
                  <Briefcase className="h-8 w-8 md:h-6 md:w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg md:text-base font-semibold mb-2 md:mb-1">No jobs found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
                {filteredJobs.slice(0, 6).map((job: any) => (
                  <Card key={job.id} className="rounded-lg shadow-md border-0 bg-card/90 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in overflow-hidden">
                    <CardHeader className="pb-2 px-4 md:px-3 pt-4 md:pt-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base md:text-sm font-bold line-clamp-2 mb-2 md:mb-1">{job.title}</CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-4 w-4 md:h-3 md:w-3" />
                            <span className="truncate">{job.profiles?.full_name || 'Anonymous'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {job.pay_per_hour && (
                            <Badge variant="secondary" className="text-xs font-semibold">
                              ${job.pay_per_hour}/hr
                            </Badge>
                          )}
                          {job.id.startsWith('demo-') && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 px-1.5 py-0.5">
                              Demo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 md:px-3 pb-4 md:pb-3 space-y-3 md:space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                      
                      {job.deadline && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 md:h-3 md:w-3" />
                          <span>Due: {new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Required Skills Section */}
                      {jobCardSkills[job.id]?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2 md:mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {jobCardSkills[job.id].slice(0, 2).map((js: any) => (
                              <Badge key={js.id} variant="outline" className="text-xs px-2 py-1 md:px-1 md:py-0.5">
                                {js.skill?.name}
                                {js.is_required && <span className="text-red-500 ml-0.5">*</span>}
                              </Badge>
                            ))}
                            {jobCardSkills[job.id].length > 2 && (
                              <Badge variant="outline" className="text-xs px-2 py-1 md:px-1 md:py-0.5">
                                +{jobCardSkills[job.id].length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 md:gap-1 pt-2 md:pt-1">
                        <Button
                          onClick={() => handleOpenApplyModal(job.id)}
                          className="flex-1 text-sm md:text-xs h-10 md:h-6"
                          size="sm"
                        >
                          <Send className="h-4 w-4 md:h-3 md:w-3 mr-1" />
                          Apply
                    </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 md:h-6 md:w-6 p-0"
                          onClick={() => {
                            setChatJobId(job.id);
                            setChatClientId(job.posted_by);
                            setChatOpen(true);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 md:h-3 md:w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 md:py-4">
            <div className="mx-auto w-16 h-16 md:w-12 md:h-12 bg-muted rounded-full flex items-center justify-center mb-3 md:mb-2">
              <Briefcase className="h-8 w-8 md:h-6 md:w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg md:text-base font-semibold mb-2 md:mb-1">No jobs available</h3>
            <p className="text-sm text-muted-foreground mb-3 md:mb-2">Be the first to post a job!</p>
            <Button onClick={() => setIsModalOpen(true)} variant="hero" size="sm" className="text-sm h-10 md:h-8">
              Post a Job
            </Button>
          </div>
        )}
      </div>
      {/* Chat Modal (only one open at a time) */}
      {chatJobId && chatClientId && (
        <JobChatModal open={chatOpen} onOpenChange={setChatOpen} jobId={chatJobId} clientId={chatClientId} />
      )}
      {/* Application Modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="max-w-lg w-full rounded-2xl p-6 animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold mb-3">Apply to Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="coverLetter" className="text-sm">Cover Letter</Label>
            <Textarea id="coverLetter" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} required className="rounded-lg text-sm" rows={3} />
            <Label htmlFor="proposedRate" className="text-sm">Proposed Rate (USD/hr)</Label>
            <Input id="proposedRate" type="number" min="0" step="0.01" value={proposedRate} onChange={e => setProposedRate(e.target.value)} className="rounded-lg text-sm h-8" />
            <Label htmlFor="applicationFile" className="text-sm">Attachment (optional, PDF/DOCX)</Label>
            <Input id="applicationFile" type="file" accept=".pdf,.docx" onChange={handleApplicationFileChange} className="rounded-lg text-sm" />
            <Button onClick={handleSubmitApplication} disabled={submitting} className="w-full mt-3 rounded-lg font-semibold text-sm shadow-md hover:scale-[1.03] transition-transform h-8">
              {submitting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-md w-full rounded-2xl p-6 animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Rating:</span>
              {[1,2,3,4,5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 cursor-pointer ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <Textarea
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <Button
              onClick={async () => {
                if (!reviewJob || !revieweeId) return;
                setSubmittingReview(true);
                const reviewerName = user.user_metadata?.full_name || user.email || 'Someone';
                const jobTitle = reviewJob?.title || 'a job';
                // Insert review
                const { error } = await supabase.from('reviews').insert({
                  reviewer_id: user.id,
                  reviewee_id: revieweeId,
                  job_id: reviewJob.id,
                  rating,
                  comment,
                });
                // Insert notification for reviewee
                await supabase.from('notifications').insert({
                  user_id: revieweeId,
                  type: 'Review Received',
                  content: `You received a new review from ${reviewerName} for job "${jobTitle}".`,
                });
                setSubmittingReview(false);
                if (!error) {
                  setReviewModalOpen(false);
                  setRating(5);
                  setComment('');
                  setReviewJob(null);
                  setRevieweeId(null);
                  // Refresh user reviews
                  supabase
                    .from('reviews')
                    .select('*')
                    .eq('reviewer_id', user.id)
                    .then(({ data }) => setUserReviews(data || []));
                } else {
                  alert('Error submitting review: ' + error.message);
                }
              }}
              disabled={submittingReview}
              variant="hero"
              className="w-full text-sm h-8"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobBoard; 
