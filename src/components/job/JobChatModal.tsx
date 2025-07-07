import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Paperclip } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  clientId: string;
}

const JobChatModal: React.FC<JobChatModalProps> = ({ open, onOpenChange, jobId, clientId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user || !open) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('job_id', jobId)
        .order('sent_at', { ascending: true });
      if (!error) setMessages(data);
    };
    fetchMessages();
    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        if (msg.job_id === jobId) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, jobId, open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: clientId,
      job_id: jobId,
      content: newMessage,
    });
    setSending(false);
    if (error) {
      toast({ title: 'Send Failed', description: error.message, variant: 'destructive' });
    } else {
      setNewMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full rounded-2xl p-0 overflow-hidden animate-fade-in">
        <DialogHeader className="bg-card/90 px-6 py-4 border-b">
          <DialogTitle className="text-lg font-bold">Job Chat</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-96 bg-background px-6 py-4">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {messages.length === 0 ? (
              <div className="text-muted-foreground text-center mt-8">No messages yet.</div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-4 py-2 mb-1 max-w-xs ${msg.sender_id === user.id ? 'bg-primary text-white' : 'bg-card/80 text-foreground'}`}>
                    {msg.content && <span>{msg.content}</span>}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <form
            className="flex items-center gap-2 mt-4"
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg"
              disabled={sending}
            />
            <Button type="submit" variant="hero" className="rounded-lg" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobChatModal; 