import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Edit, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Proposal {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  estimated_value: number | null;
  actual_value: number | null;
  completion_date: string | null;
  created_at: string;
}

interface ProposalStatusManagerProps {
  proposal: Proposal;
}

const ProposalStatusManager: React.FC<ProposalStatusManagerProps> = ({ proposal }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: proposal.status,
    estimated_value: proposal.estimated_value?.toString() || '',
    actual_value: proposal.actual_value?.toString() || '',
    completion_date: proposal.completion_date ? format(new Date(proposal.completion_date), 'yyyy-MM-dd') : ''
  });

  const updateProposalMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const payload: any = {
        status: updateData.status
      };

      if (updateData.estimated_value) {
        payload.estimated_value = parseFloat(updateData.estimated_value);
      }
      
      if (updateData.actual_value) {
        payload.actual_value = parseFloat(updateData.actual_value);
      }
      
      if (updateData.completion_date) {
        payload.completion_date = new Date(updateData.completion_date).toISOString();
      }

      const { error } = await supabase
        .from('proposals')
        .update(payload)
        .eq('id', proposal.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsEditModalOpen(false);
      toast({
        title: "Proposal Updated",
        description: "Proposal details have been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update proposal details.",
        variant: "destructive"
      });
    }
  });

  const handleUpdate = () => {
    updateProposalMutation.mutate(editData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-card border-0 bg-card/90 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          {proposal.title}
        </CardTitle>
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Proposal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editData.status} onValueChange={(value: any) => setEditData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimated_value">Estimated Value ($)</Label>
                <Input
                  id="estimated_value"
                  type="number"
                  step="0.01"
                  value={editData.estimated_value}
                  onChange={(e) => setEditData(prev => ({ ...prev, estimated_value: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="actual_value">Actual Value ($)</Label>
                <Input
                  id="actual_value"
                  type="number"
                  step="0.01"
                  value={editData.actual_value}
                  onChange={(e) => setEditData(prev => ({ ...prev, actual_value: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="completion_date">Completion Date</Label>
                <Input
                  id="completion_date"
                  type="date"
                  value={editData.completion_date}
                  onChange={(e) => setEditData(prev => ({ ...prev, completion_date: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handleUpdate} 
                disabled={updateProposalMutation.isPending}
                className="w-full"
              >
                {updateProposalMutation.isPending ? 'Updating...' : 'Update Proposal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className={getStatusColor(proposal.status)}>
              {proposal.status}
            </Badge>
          </div>

          {proposal.estimated_value && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Estimated Value
              </span>
              <span className="font-semibold">${proposal.estimated_value.toLocaleString()}</span>
            </div>
          )}

          {proposal.actual_value && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Actual Value
              </span>
              <span className="font-semibold text-green-600">${proposal.actual_value.toLocaleString()}</span>
            </div>
          )}

          {proposal.completion_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Completed
              </span>
              <span className="text-sm">{format(new Date(proposal.completion_date), 'MMM d, yyyy')}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm">{format(new Date(proposal.created_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalStatusManager;