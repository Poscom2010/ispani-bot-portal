import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, FileText, Download, Eye, Edit, Trash2, CheckCircle, Clock, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const ProposalLibrary = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
      } else {
        setProposals(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProposalClick = (proposal: any) => {
    setSelectedProposal(proposal);
    setIsViewerOpen(true);
  };

  // Calculate enhanced stats
  const totalProposals = proposals.length;
  const approvedProposals = proposals.filter(p => p.status === 'approved').length;
  const pendingProposals = proposals.filter(p => p.status === 'pending').length;
  const completedProposals = proposals.filter(p => p.status === 'completed').length;
  const estimatedEarnings = proposals.reduce((sum, p) => sum + (p.estimated_value || 0), 0);

  const filteredProposals = proposals.filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Proposal Library</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage and organize your saved proposals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 md:h-9"
          />
        </div>
        <Button variant="outline" className="h-10 md:h-9">Filter</Button>
      </div>

      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* All Proposals Grid */}
      <div className="mt-6 md:mt-8">
        <h3 className="text-lg font-semibold mb-4">All Proposals</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8 md:py-6">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 md:h-6 md:w-6 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground text-sm">Loading proposals...</p>
            </div>
          </div>
        ) : filteredProposals.length === 0 ? (
          <Card className="shadow-card border border-border/60 bg-card/80 backdrop-blur-sm w-full max-w-md mx-auto">
            <CardContent className="py-8">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 md:w-12 md:h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-3">
                  <FileText className="h-8 w-8 md:h-6 md:w-6 text-white" />
                </div>
                <p className="text-muted-foreground text-base">
                  {searchTerm ? 'No proposals match your search.' : 'No proposals found. Start by creating your first proposal.'}
                </p>
                <Button className="h-10 md:h-9">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProposals.map((proposal) => (
              <Card 
                key={proposal.id} 
                className="rounded-xl shadow-lg border border-border/60 bg-card/90 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl cursor-pointer animate-fade-in"
                onClick={() => handleProposalClick(proposal)}
              >
                <CardHeader className="pb-2 px-4 md:px-3 pt-4 md:pt-3">
                  <CardTitle className="text-base font-bold truncate flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {proposal.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Created {format(new Date(proposal.created_at), 'MMM d')}</span>
                    <Badge className={`text-xs ${
                      proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                      proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      proposal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {proposal.status}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4 md:px-3 pb-4 md:pb-3">
                  <div className="line-clamp-2 text-sm text-foreground/90">
                    {typeof proposal.generated_content === 'string'
                      ? proposal.generated_content
                      : proposal.generated_content && typeof proposal.generated_content === 'object' && !Array.isArray(proposal.generated_content)
                        ? (proposal.generated_content as any).overview || JSON.stringify(proposal.generated_content)
                        : proposal.initial_prompt}
                  </div>
                  {proposal.estimated_value && (
                    <div className="mt-2 text-sm font-semibold text-primary">
                      Est. Value: ${proposal.estimated_value.toLocaleString()}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-8 md:h-7">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-8 md:h-7">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8 md:h-7">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 text-xs h-8 md:h-7">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Proposal Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold">
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
                  {selectedProposal.generated_content.objectives?.map((item: any, index: number) => (
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
                          {selectedProposal.generated_content.budget.breakdown.map((item: any, index: number) => (
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
                  {selectedProposal.generated_content.risks?.map((item: any, index: number) => (
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
                      {selectedProposal.generated_content.deliverables?.map((item: any, index: number) => (
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
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm">{selectedProposal.created_at ? format(new Date(selectedProposal.created_at), 'MMM d, yyyy') : ''}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalLibrary; 