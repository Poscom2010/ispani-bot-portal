import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, FileText, Sparkles, Users, Briefcase, X, UserCheck, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import ispaniBotIcon from '@/assets/ispanibot-icon.png';
const Dashboard = () => {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch user profile query
  const {
    data: userProfile
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch proposals query
  const {
    data: proposals,
    isLoading: proposalsLoading,
    refetch
  } = useQuery({
    queryKey: ['proposals', user?.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('proposals').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
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
      // Action 1: Invoke Supabase Edge Function
      const {
        data: generatedContent,
        error: functionError
      } = await supabase.functions.invoke('ispanibot-generator', {
        body: {
          userPrompt: projectDescription
        }
      });
      if (functionError) throw functionError;

      // Action 2: Insert Row into Supabase
      const {
        error: insertError
      } = await supabase.from('proposals').insert({
        title: proposalTitle,
        initial_prompt: projectDescription,
        generated_content: generatedContent,
        user_id: user?.id
      });
      if (insertError) throw insertError;

      // Action 3: Finalize
      setIsModalOpen(false);
      setProposalTitle('');
      setProjectDescription('');
      refetch(); // Refresh the proposals list

      toast({
        title: "Proposal Generated Successfully!",
        description: "Your new proposal has been created and saved."
      });
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast({
        title: "Generation Failed",
        description: "Oops! Something went wrong while generating the proposal.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleProposalClick = proposal => {
    setSelectedProposal(proposal);
    setIsViewerOpen(true);
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-card/95 to-background/80 backdrop-blur-lg border-r border-border shadow-2xl">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow">
              <img src={ispaniBotIcon} alt="ISpaniBot" className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent tracking-tight">
              ISpaniBot
            </h1>
          </div>
          
          <nav className="space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary/10 text-primary shadow transition-all duration-200 hover:bg-primary/20">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Proposals</span>
            </div>
            
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-300/80 via-yellow-200/80 to-primary/60 text-yellow-900 shadow-lg border border-yellow-300/60 cursor-not-allowed opacity-100 hover:scale-105 transition-all duration-200">
              <Users className="h-5 w-5 animate-bounce" />
              <span className="font-semibold">Writing Assistant</span>
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-900 px-2 py-1 rounded shadow">Soon</span>
            </div>
            
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-400/80 via-pink-300/80 to-primary/60 text-pink-900 shadow-lg border border-pink-300/60 cursor-not-allowed opacity-100 hover:scale-105 transition-all duration-200">
              <Briefcase className="h-5 w-5 animate-bounce" />
              <span className="font-semibold">Job Matching</span>
              <span className="ml-auto text-xs bg-pink-100 text-pink-900 px-2 py-1 rounded shadow">Soon</span>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/90 backdrop-blur-lg shadow-card">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-hero bg-clip-text text-transparent tracking-tight">ISpaniBot</h1>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Welcome back, <span className="font-semibold text-primary">{userProfile?.full_name || user?.email}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="relative p-2 rounded-full hover:bg-primary/10 transition-all duration-200">
                    <Avatar className="h-9 w-9 border-2 border-primary shadow-glow transition-transform duration-200 hover:scale-105">
                      <AvatarImage src="" alt="User avatar" />
                      <AvatarFallback className="text-sm">
                        {userProfile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {userProfile?.verified && <div className="absolute -top-1 -right-1">
                        <UserCheck className="h-4 w-4 text-primary bg-background rounded-full p-0.5" />
                      </div>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src="" alt="User avatar" />
                      <AvatarFallback className="text-lg">
                        {userProfile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{userProfile?.full_name || user?.email}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                    <Button variant="destructive" size="sm" className="w-full mt-2" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Enhanced Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-transparent">
                <Card className="shadow-card border-0 bg-gradient-primary/10 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Proposals Done</p>
                        <div className="text-2xl font-bold text-primary">{proposals?.length || 0}</div>
                      </div>
                      <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card border-0 bg-gradient-hero/10 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Approved</p>
                        <div className="text-2xl font-bold text-accent">{Math.floor((proposals?.length || 0) * 0.7)}</div>
                      </div>
                      <div className="h-12 w-12 bg-accent/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card border-0 bg-gradient-primary/5 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
                        <div className="text-2xl font-bold text-primary-glow">{Math.floor((proposals?.length || 0) * 0.3)}</div>
                      </div>
                      <div className="h-12 w-12 bg-primary-glow/20 rounded-xl flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary-glow" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card border-0 bg-gradient-hero/5 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</p>
                        <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                          ${((proposals?.length || 0) * 2500).toLocaleString()}
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-gradient-hero/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            {/* Welcome Section & Primary Action */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  My Proposals
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Manage and track your AI-generated proposals. Create, edit, and organize your content with the power of ISpaniBot.
                </p>
              </div>
              
              {/* Primary Action Button */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" className="rounded-lg shadow-md transition-all duration-200 hover:scale-105">
                    <Sparkles className="h-5 w-5 mr-2" /> Generate Proposal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg w-full rounded-2xl p-8 animate-fade-in">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold mb-2">Generate New Proposal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Label htmlFor="proposalTitle" className="font-medium">Title</Label>
                    <Input
                      id="proposalTitle"
                      value={proposalTitle}
                      onChange={e => setProposalTitle(e.target.value)}
                      placeholder="Enter proposal title"
                      className="rounded-lg py-3 px-4 border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                    <Label htmlFor="projectDescription" className="font-medium">Project Description</Label>
                    <Textarea
                      id="projectDescription"
                      value={projectDescription}
                      onChange={e => setProjectDescription(e.target.value)}
                      placeholder="Describe your project..."
                      className="rounded-lg py-3 px-4 border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm hover:shadow-md min-h-[100px]"
                    />
                    <Button
                      onClick={handleGenerateProposal}
                      disabled={isGenerating}
                      className="w-full py-3 rounded-lg font-semibold text-lg shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      {isGenerating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Generate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Proposals Grid */}
            {proposalsLoading ? <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Loading proposals...</p>
                </div>
              </div> : proposals && proposals.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proposals.map(proposal => <Card key={proposal.id} className="rounded-xl shadow-lg border-0 bg-card/90 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl cursor-pointer animate-fade-in" onClick={() => handleProposalClick(proposal)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold truncate flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {proposal.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Created {format(new Date(proposal.created_at), 'PPP p')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="line-clamp-3 text-sm text-foreground/90">
                        {typeof proposal.generated_content === 'string'
                          ? proposal.generated_content
                          : proposal.generated_content && typeof proposal.generated_content === 'object' && !Array.isArray(proposal.generated_content)
                            ? (proposal.generated_content as any).overview || JSON.stringify(proposal.generated_content)
                            : proposal.initial_prompt}
                      </div>
                    </CardContent>
                  </Card>)}
              </div> : <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Welcome! You have no proposals yet. Click '✨ Create New Proposal' to get started!
                    </p>
                  </div>
                </CardContent>
              </Card>}

          </div>
        </main>
      </div>

      {/* Proposal Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedProposal?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProposal?.generated_content && <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProposal.generated_content.overview || 'No overview available.'}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Deliverables</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {selectedProposal.generated_content.deliverables?.map((item, index) => <li key={index}>{item}</li>) || <li>No deliverables specified.</li>}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Estimated Timeline</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProposal.generated_content.timeline || 'No timeline specified.'}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Price Suggestion</h3>
                <p className="font-bold text-foreground">
                  {selectedProposal.generated_content.price || 'No price suggestion available.'}
                </p>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default Dashboard;