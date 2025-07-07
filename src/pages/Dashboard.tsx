import React, { useState, useRef, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, FileText, Sparkles, Users, Briefcase, UserCheck, CheckCircle, Clock, DollarSign, TrendingUp, BarChart3, Settings, Home, Bot, Eye, Edit, Download } from 'lucide-react';
import { format } from 'date-fns';
import ispaniBotIcon from '@/assets/ispanibot-icon.png';
import EarningsCard from '@/components/dashboard/EarningsCard';
import ProposalStatusManager from '@/components/dashboard/ProposalStatusManager';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import ProfileModal from '@/pages/Profile';
import UserProfile from '@/components/UserProfile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const sidebarLinks = [
  { label: 'Overview', to: '/dashboard', icon: <Home className="h-5 w-5" /> },
  { label: 'Analytics', to: '/dashboard#analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Job Board', to: '/jobs', icon: <Briefcase className="h-5 w-5" /> },
  { label: 'Proposal Library', to: '/dashboard#library', icon: <FileText className="h-5 w-5" /> },
];

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadingProposalId, setUploadingProposalId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const viewerFileInputRef = useRef<HTMLInputElement | null>(null);
  const proposalFileInputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();

  // Sync tab state with URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && hash !== activeTab) {
      setActiveTab(hash);
    } else if (!hash && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
    // eslint-disable-next-line
  }, [location.hash]);

  // When tab changes, update hash (only for non-dashboard tabs)
  useEffect(() => {
    if (activeTab === 'dashboard' && location.hash) {
      window.location.hash = '';
    } else if (activeTab && activeTab !== 'dashboard' && location.hash.replace('#', '') !== activeTab) {
      window.location.hash = `#${activeTab}`;
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch user profile query
  const { data: userProfile, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id && !loading,
    retry: 3,
    retryDelay: 1000
  });

  // Fetch proposals query with enhanced data
  const { data: proposals, isLoading: proposalsLoading, refetch } = useQuery({
    queryKey: ['proposals', user?.id],
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

  // Fetch proposal metrics
  const { data: metrics } = useQuery({
    queryKey: ['proposal-metrics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const handleGenerateProposal = async () => {
    if (!proposalTitle.trim() || !projectDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both the title and description fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Starting proposal generation...');
      
      // Ensure user profile exists
      if (user?.id) {
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (profileCheckError && profileCheckError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          console.log('Creating user profile...');
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || 'User',
              role: 'freelancer'
            });
          
          if (createProfileError) {
            console.error('Error creating profile:', createProfileError);
            throw new Error(`Failed to create user profile: ${createProfileError.message}`);
          }
        } else if (profileCheckError) {
          console.error('Error checking profile:', profileCheckError);
          throw new Error(`Failed to check user profile: ${profileCheckError.message}`);
        }
      }
      
      // Invoke Supabase Edge Function with timeout
      const functionPromise = supabase.functions.invoke('ispanibot-generator', {
        body: { 
          userPrompt: `Project Title: ${proposalTitle}\n\nProject Description: ${projectDescription}` 
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Function call timed out after 30 seconds')), 30000)
      );
      
      const { data: generatedContent, error: functionError } = await Promise.race([functionPromise, timeoutPromise]) as any;

      console.log('Function response:', { generatedContent, functionError });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(`Edge Function Error: ${functionError.message}`);
      }

      if (!generatedContent) {
        throw new Error('No content generated from AI function');
      }

      console.log('Generated content:', generatedContent);

      // Insert Row into Supabase
      const { error: insertError } = await supabase
        .from('proposals')
        .insert({
          title: proposalTitle,
          initial_prompt: projectDescription,
          generated_content: generatedContent,
          user_id: user?.id,
          status: 'draft'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      setIsModalOpen(false);
      setProposalTitle('');
      setProjectDescription('');
      refetch();

      toast({
        title: "Proposal Generated Successfully!",
        description: "Your new proposal has been created and saved."
      });
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Oops! Something went wrong while generating the proposal.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProposalClick = (proposal) => {
    setSelectedProposal(proposal);
    setIsViewerOpen(true);
  };

  const handleDraftUpload = async (proposalId: string, file: File) => {
    if (!file || file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      toast({
        title: 'Invalid File',
        description: 'Please upload a valid DOCX file.',
        variant: 'destructive',
      });
      return;
    }
    const filePath = `drafts/${user.id}/${proposalId}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from('proposals').upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({
        title: 'Upload Failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      return;
    }
    const { data } = supabase.storage.from('proposals').getPublicUrl(filePath);
    const draftUrl = data.publicUrl;
    const { error: updateError } = await supabase.from('proposals').update({ draft_docx_url: draftUrl }).eq('id', proposalId);
    if (updateError) {
      toast({
        title: 'Update Failed',
        description: updateError.message,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Draft Uploaded',
      description: 'Your draft proposal has been uploaded.',
    });
    refetch();
  };

  const handleProposalMarkAsPaid = async (proposalId: string, file: File) => {
    setUploadingProposalId(proposalId);
    // Upload invoice
    const filePath = `invoices/proposal_${proposalId}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Upload Failed', description: uploadError.message, variant: 'destructive' });
      setUploadingProposalId(null);
      return;
    }
    const { data } = supabase.storage.from('invoices').getPublicUrl(filePath);
    const invoiceUrl = data.publicUrl;
    // Try to update related earning if exists
    const { data: earning } = await supabase.from('earnings').select('id').eq('proposal_id', proposalId).maybeSingle();
    if (earning?.id) {
      await supabase.from('earnings').update({ status: 'paid', description: `Invoice: ${invoiceUrl}` }).eq('id', earning.id);
    }
    // Optionally update proposal status
    await supabase.from('proposals').update({ status: 'completed' }).eq('id', proposalId);
    setUploadingProposalId(null);
    toast({ title: 'Marked as Paid', description: 'Proposal marked as paid and invoice attached.' });
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profileError) {
    console.error('Profile error:', profileError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading profile</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Handle loading state properly within the component
  // Remove the problematic loading guard that was causing infinite loading

  // Calculate enhanced stats
  const totalProposals = proposals?.length || 0;
  const approvedProposals = proposals?.filter(p => p.status === 'approved').length || 0;
  const pendingProposals = proposals?.filter(p => p.status === 'pending').length || 0;
  const completedProposals = proposals?.filter(p => p.status === 'completed').length || 0;
  const estimatedEarnings = proposals?.reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0;

  return (
    <>
      <ProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />
      <div className="w-full max-w-6xl mx-auto animate-fade-in relative">
        <div className="max-w-6xl mx-auto">
          {/* Only render the active tab's content */}
          {activeTab === 'dashboard' && (
            <div style={{ fontSize: '0.92rem' }}>
              {/* Enhanced Stats Dashboard + Profile Avatar */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
                  <Card className="shadow-card border border-border/60 bg-gradient-primary/10 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Total Proposals</p>
                          <div className="text-lg md:text-2xl font-bold text-primary">{totalProposals}</div>
                        </div>
                        <div className="h-8 w-8 md:h-10 md:w-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-card border border-border/60 bg-gradient-hero/10 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Approved</p>
                          <div className="text-lg md:text-2xl font-bold text-accent">{approvedProposals}</div>
                        </div>
                        <div className="h-8 w-8 md:h-10 md:w-10 bg-accent/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-card border border-border/60 bg-gradient-primary/5 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Pending</p>
                          <div className="text-lg md:text-2xl font-bold text-primary-glow">{pendingProposals}</div>
                        </div>
                        <div className="h-8 w-8 md:h-10 md:w-10 bg-primary-glow/20 rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary-glow" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-card border border-border/60 bg-gradient-hero/5 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Est. Value</p>
                          <div className="text-lg md:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                            ${estimatedEarnings.toLocaleString()}
                          </div>
                        </div>
                        <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-hero/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Profile Avatar Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 rounded-full ml-2">
                        <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-sm ring-2 ring-primary/10">
                          {userProfile?.avatar_url ? (
                            <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name || user?.email || 'Profile'} />
                          ) : (
                            <AvatarFallback>{userProfile?.full_name && userProfile.full_name.trim() !== '' && userProfile.full_name.trim().toLowerCase() !== 'user' ? userProfile.full_name[0] : (user?.email ? user.email[0].toUpperCase() : 'U')}</AvatarFallback>
                          )}
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Latest Proposal Section - Mobile Responsive */}
              {proposals && proposals.length > 0 && (
                <div className="flex justify-center md:justify-end mb-4">
                  <div className="w-full max-w-sm md:w-64">
                    <Card 
                      className="rounded-xl shadow-lg border border-border/60 bg-card/90 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl cursor-pointer animate-fade-in"
                      onClick={() => handleProposalClick(proposals[0])}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm md:text-base font-bold truncate flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          {proposals[0].title}
                        </CardTitle>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Created {format(new Date(proposals[0].created_at), 'MMM d, yyyy')}
                          </span>
                          <Badge className={`text-xs ${
                            proposals[0].status === 'approved' ? 'bg-green-100 text-green-800' :
                            proposals[0].status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            proposals[0].status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            proposals[0].status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {proposals[0].status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
                            e.stopPropagation();
                            handleProposalClick(proposals[0]);
                          }}>
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
                          <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Link to="/library">
                              View All ({proposals.length})
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* AI Generation Button - Left Aligned Above Quick Actions with More Left Margin */}
              <div className="flex items-center justify-start mb-2 ml-0 md:ml-8" style={{ width: '100%' }}>
                <Button 
                  onClick={() => setIsModalOpen(true)} 
                  variant="ai" 
                  size="lg" 
                  className="text-base md:text-lg px-6 md:px-10 py-3 md:py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full max-w-md"
                >
                  <Bot className="w-6 h-6 md:w-7 md:h-7 mr-2 md:mr-3" />
                  🤖 Generate New Proposal with AI
                </Button>
              </div>
              {/* Quick Actions - Mobile Responsive */}
              <div className="flex justify-center md:justify-end">
                <div className="w-full max-w-sm md:w-64">
                  <Card className="shadow-card border border-border/60 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg font-semibold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild variant="outline" size="lg" className="w-full justify-start">
                        <Link to="/library">
                          <FileText className="w-5 h-5 mr-2" />
                          View All Proposals
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="w-full justify-start">
                        <Link to="/jobs">
                          <Briefcase className="w-5 h-5 mr-2" />
                          Browse Jobs
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="w-full justify-start">
                        <Link to="/analytics">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          View Analytics
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}
          {activeTab === 'proposals' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Manage Proposals</h3>
                {proposals && proposals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {proposals.map((proposal) => (
                      <ProposalStatusManager key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
                    <CardContent className="py-12">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                          <Settings className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-muted-foreground text-lg">
                          No proposals to manage yet. Create your first proposal to get started!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          {activeTab === 'library' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Proposal Library</h3>
                {proposals && proposals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Title</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Created</th>
                          <th className="text-left p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposals.map((proposal) => (
                          <tr key={proposal.id} className="border-b last:border-0 hover:bg-primary/5 cursor-pointer" onClick={() => handleProposalClick(proposal)}>
                            <td className="p-3 font-medium">{proposal.title}</td>
                            <td className="p-3">
                              <Badge className={`${
                                proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                proposal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {proposal.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={(e) => {
                                  e.stopPropagation();
                                  handleProposalClick(proposal);
                                }}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={(e) => {
                                  e.stopPropagation();
                                  // Edit functionality
                                }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={(e) => {
                                  e.stopPropagation();
                                  // Download functionality
                                }}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
                    <CardContent className="py-12">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-muted-foreground text-lg">
                          No proposals yet. Generate your first proposal to get started!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          {activeTab === 'earnings' && (
            <EarningsCard />
          )}
        </div>
      </div>

      {/* Proposal Generation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Generate AI Proposal
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="proposal-title">Proposal Title</Label>
              <Input
                id="proposal-title"
                placeholder="Enter a descriptive title for your proposal"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                placeholder="Describe your project, requirements, goals, and any specific details you want the AI to consider..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setProposalTitle('');
                  setProjectDescription('');
                }}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateProposal}
                disabled={isGenerating || !proposalTitle.trim() || !projectDescription.trim()}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Proposal
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Proposal Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedProposal?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProposal?.generated_content && (
            <div className="space-y-6 py-4">
              {/* Title */}
              {selectedProposal.generated_content.title && (
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    {selectedProposal.generated_content.title}
                  </h2>
                </div>
              )}
              
              {/* Executive Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Executive Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProposal.generated_content.executive_summary || 'No executive summary available.'}
                </p>
              </div>
              
              {/* Problem Statement */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Problem Statement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProposal.generated_content.problem_statement || 'No problem statement available.'}
                </p>
              </div>
              
              {/* Objectives */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Objectives</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {selectedProposal.generated_content.objectives?.map((item, index) => (
                    <li key={index}>{item}</li>
                  )) || <li>No objectives specified.</li>}
                </ul>
              </div>
              
              {/* Proposed Solution */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Proposed Solution</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProposal.generated_content.proposed_solution || 'No solution details available.'}
                </p>
              </div>
              
              {/* Implementation Plan */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Implementation Plan</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProposal.generated_content.implementation_plan || 'No implementation plan available.'}
                </p>
              </div>
              
              {/* Budget */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Budget</h3>
                {selectedProposal.generated_content.budget ? (
                  <div className="space-y-2">
                    <p className="font-bold text-foreground">
                      Total Cost: {selectedProposal.generated_content.budget.total_cost || 'Not specified'}
                    </p>
                    {selectedProposal.generated_content.budget.breakdown && (
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground mb-1">Cost Breakdown:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {selectedProposal.generated_content.budget.breakdown.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No budget information available.</p>
                )}
              </div>
              
              {/* Team */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Team</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProposal.generated_content.team || 'No team information available.'}
                </p>
              </div>
              
              {/* Risks */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Risks and Mitigation</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {selectedProposal.generated_content.risks?.map((item, index) => (
                    <li key={index}>{item}</li>
                  )) || <li>No risks identified.</li>}
                </ul>
              </div>
              
              {/* Conclusion */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Conclusion</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProposal.generated_content.conclusion || 'No conclusion available.'}
                </p>
              </div>
              
              {/* Download Options */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3 text-primary">Export Options</h3>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="opacity-50 cursor-not-allowed"
                    title="Coming soon in next version"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download as DOCX
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="opacity-50 cursor-not-allowed"
                    title="Coming soon in next version"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download as PDF
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Export functionality will be available in the next version for further customization.
                </p>
              </div>
              
              {/* Fallback for old format proposals */}
              {!selectedProposal.generated_content.executive_summary && selectedProposal.generated_content.overview && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">Overview</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProposal.generated_content.overview}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">Key Deliverables</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      {selectedProposal.generated_content.deliverables?.map((item, index) => (
                        <li key={index}>{item}</li>
                      )) || <li>No deliverables specified.</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">Timeline</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProposal.generated_content.timeline || 'No timeline specified.'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">Price</h3>
                    <p className="font-bold text-foreground">
                      {selectedProposal.generated_content.price || 'No price suggestion available.'}
                    </p>
                  </div>
                </>
              )}

              {/* Additional proposal details */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={`${
                    selectedProposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedProposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedProposal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    selectedProposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProposal.status}
                  </Badge>
                </div>
                {selectedProposal.estimated_value && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Value:</span>
                    <span className="font-semibold">${selectedProposal.estimated_value.toLocaleString()}</span>
                  </div>
                )}
                {selectedProposal.actual_value && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Actual Value:</span>
                    <span className="font-semibold text-green-600">${selectedProposal.actual_value.toLocaleString()}</span>
                  </div>
                )}
                {selectedProposal?.docx_url && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <a href={selectedProposal.docx_url} download target="_blank" rel="noopener noreferrer">
                      Download as DOCX
                    </a>
                  </Button>
                )}
              </div>
              {selectedProposal && selectedProposal.user_id === user.id && (
                <div className="mt-4">
                  <input
                    type="file"
                    accept=".docx"
                    style={{ display: 'none' }}
                    ref={viewerFileInputRef}
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleDraftUpload(selectedProposal.id, e.target.files[0]);
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={e => {
                      e.stopPropagation();
                      viewerFileInputRef.current?.click();
                    }}
                  >
                    Upload Draft Proposal (DOCX)
                  </Button>
                  {selectedProposal.draft_docx_url && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="ml-2 mt-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <a href={selectedProposal.draft_docx_url} download target="_blank" rel="noopener noreferrer">
                        Download Draft
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;