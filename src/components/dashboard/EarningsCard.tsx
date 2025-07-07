import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Plus, Calendar, CheckCircle, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useRef } from 'react';

interface Earning {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  payment_date: string | null;
  description: string | null;
  created_at: string;
  proposal_id: string | null;
  proposals?: {
    title: string;
  };
}

const EarningsCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEarning, setNewEarning] = useState({
    amount: '',
    description: '',
    proposal_id: '',
    status: 'pending' as const
  });
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch earnings
  const { data: earnings, isLoading } = useQuery({
    queryKey: ['earnings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('earnings')
        .select(`
          *,
          proposals (
            title
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Earning[];
    },
    enabled: !!user?.id
  });

  // Fetch proposals for dropdown
  const { data: proposals } = useQuery({
    queryKey: ['proposals-for-earnings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('id, title')
        .eq('status', 'approved')
        .order('title');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Add earning mutation
  const addEarningMutation = useMutation({
    mutationFn: async (earningData: typeof newEarning) => {
      const { error } = await supabase
        .from('earnings')
        .insert({
          user_id: user?.id,
          amount: parseFloat(earningData.amount),
          description: earningData.description || null,
          proposal_id: earningData.proposal_id || null,
          status: earningData.status
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      setIsAddModalOpen(false);
      setNewEarning({ amount: '', description: '', proposal_id: '', status: 'pending' });
      toast({
        title: "Earning Added",
        description: "Your earning record has been created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add earning record.",
        variant: "destructive"
      });
    }
  });

  // Update earning status mutation
  const updateEarningMutation = useMutation({
    mutationFn: async ({ id, status, payment_date }: { id: string; status: string; payment_date?: string }) => {
      const updateData: any = { status };
      if (status === 'paid' && !payment_date) {
        updateData.payment_date = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('earnings')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      toast({
        title: "Status Updated",
        description: "Earning status has been updated successfully."
      });
    }
  });

  const handleAddEarning = () => {
    if (!newEarning.amount) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount.",
        variant: "destructive"
      });
      return;
    }
    addEarningMutation.mutate(newEarning);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEarnings = earnings?.reduce((sum, earning) => 
    earning.status === 'paid' ? sum + earning.amount : sum, 0) || 0;

  const pendingEarnings = earnings?.reduce((sum, earning) => 
    earning.status === 'pending' ? sum + earning.amount : sum, 0) || 0;

  const handleMarkAsPaid = async (earningId: string, file: File) => {
    setUploadingId(earningId);
    // Upload invoice
    const filePath = `invoices/${earningId}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Upload Failed', description: uploadError.message, variant: 'destructive' });
      setUploadingId(null);
      return;
    }
    const { data } = supabase.storage.from('invoices').getPublicUrl(filePath);
    const invoiceUrl = data.publicUrl;
    // Update earning status and attach invoice
    const { error: updateError } = await supabase.from('earnings').update({ status: 'paid', description: `Invoice: ${invoiceUrl}` }).eq('id', earningId);
    setUploadingId(null);
    if (updateError) {
      toast({ title: 'Update Failed', description: updateError.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Marked as Paid', description: 'Earning marked as paid and invoice attached.' });
    queryClient.invalidateQueries({ queryKey: ['earnings'] });
  };

  return (
    <Card className="shadow-card border-0 bg-card/90 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Earnings Management
        </CardTitle>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Earning
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Earning</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newEarning.amount}
                  onChange={(e) => setNewEarning(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="proposal">Related Proposal (Optional)</Label>
                <Select value={newEarning.proposal_id} onValueChange={(value) => setNewEarning(prev => ({ ...prev, proposal_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a proposal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No proposal</SelectItem>
                    {proposals?.map((proposal) => (
                      <SelectItem key={proposal.id} value={proposal.id}>
                        {proposal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newEarning.status} onValueChange={(value: 'pending' | 'paid' | 'cancelled') => setNewEarning(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newEarning.description}
                  onChange={(e) => setNewEarning(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add notes about this earning..."
                />
              </div>

              <Button 
                onClick={handleAddEarning} 
                disabled={addEarningMutation.isPending}
                className="w-full"
              >
                {addEarningMutation.isPending ? 'Adding...' : 'Add Earning'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Paid</div>
              <div className="text-2xl font-bold text-green-700">${totalEarnings.toLocaleString()}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
              <div className="text-2xl font-bold text-yellow-700">${pendingEarnings.toLocaleString()}</div>
            </div>
          </div>

          {/* Earnings List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Recent Earnings</h4>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading earnings...</div>
            ) : earnings && earnings.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {earnings.slice(0, 10).map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">${earning.amount.toLocaleString()}</span>
                        {getStatusIcon(earning.status)}
                      </div>
                      {earning.proposals?.title && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {earning.proposals.title}
                        </div>
                      )}
                      {earning.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {earning.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(earning.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(earning.status)}>
                        {earning.status}
                      </Badge>
                      {earning.status === 'pending' && (
                        <div className="mt-2">
                          <input
                            type="file"
                            accept=".pdf,.docx"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                handleMarkAsPaid(earning.id, e.target.files[0]);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="hero"
                            className="rounded-lg font-semibold"
                            disabled={uploadingId === earning.id}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {uploadingId === earning.id ? 'Uploading...' : 'Mark as Paid & Attach Invoice'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No earnings recorded yet</p>
                <p className="text-xs">Add your first earning to get started</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsCard;