import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, FileText, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import ispaniBotIcon from '@/assets/ispanibot-icon.png';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch proposals query
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
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const handleGenerateProposal = async () => {
    if (!proposalTitle.trim() || !projectDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both the title and description fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Action 1: Invoke Supabase Edge Function
      const { data: generatedContent, error: functionError } = await supabase.functions.invoke('ispanibot-generator', {
        body: { userPrompt: projectDescription },
      });

      if (functionError) throw functionError;

      // Action 2: Insert Row into Supabase
      const { error: insertError } = await supabase
        .from('proposals')
        .insert({
          title: proposalTitle,
          initial_prompt: projectDescription,
          generated_content: generatedContent,
          user_id: user?.id,
        });

      if (insertError) throw insertError;

      // Action 3: Finalize
      setIsModalOpen(false);
      setProposalTitle('');
      setProjectDescription('');
      refetch(); // Refresh the proposals list

      toast({
        title: "Proposal Generated Successfully!",
        description: "Your new proposal has been created and saved.",
      });
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-soft">
              <img src={ispaniBotIcon} alt="ISpaniBot" className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                ISpaniBot
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.email}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
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
                <Button variant="hero" size="lg" className="shadow-glow">
                  <Sparkles className="h-5 w-5" />
                  ✨ Create New Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">Create a New Proposal</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Proposal Title</Label>
                    <Input
                      id="title"
                      value={proposalTitle}
                      onChange={(e) => setProposalTitle(e.target.value)}
                      placeholder="Enter your proposal title..."
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Briefly describe the project...</Label>
                    <Textarea
                      id="description"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe your project requirements, goals, and any specific details..."
                      className="w-full min-h-[120px] resize-none"
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateProposal}
                    disabled={isGenerating}
                    className="w-full"
                    variant="hero"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Proposals Grid */}
          {proposalsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : proposals && proposals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="shadow-card border-0 bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold line-clamp-2">
                      {proposal.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {format(new Date(proposal.created_at), 'MMMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {proposal.initial_prompt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    No proposals yet. Create your first one above!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">{proposals?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent">{proposals?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary-glow">0</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;