import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Messages = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch conversations (users you've messaged or have messaged you)
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data, error } = await supabase.rpc('get_conversations', { current_user_id: user.id });
      if (!error) setConversations(data);
    };
    fetchConversations();
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!user || !selectedUser) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${selectedUser.id},receiver_id.eq.${selectedUser.id}`)
        .order('sent_at', { ascending: true });
      if (!error) setMessages(data.filter((msg: any) =>
        (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
        (msg.sender_id === selectedUser.id && msg.receiver_id === user.id)
      ));
    };
    fetchMessages();
    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
          (msg.sender_id === selectedUser.id && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, selectedUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: newMessage,
    });
    const senderName = user.user_metadata?.full_name || user.email || 'Someone';
    await supabase.from('notifications').insert({
      user_id: selectedUser.id,
      type: 'New Message',
      content: `You received a new message from ${senderName}.`,
    });
    setSending(false);
    if (error) {
      toast({ title: 'Send Failed', description: error.message, variant: 'destructive' });
    } else {
      setNewMessage('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedUser) return;
    const file = e.target.files[0];
    if (!file || !['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast({ title: 'Invalid File', description: 'Only PDF or DOCX allowed.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const filePath = `invoices/${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Upload Failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('invoices').getPublicUrl(filePath);
    const fileUrl = data.publicUrl;
    const { error: msgError } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: '',
      file_url: fileUrl,
    });
    setUploading(false);
    if (msgError) {
      toast({ title: 'Send Failed', description: msgError.message, variant: 'destructive' });
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
    <>
      <div className="w-full max-w-5xl mx-auto min-h-[60vh] flex flex-col lg:flex-row gap-4 md:gap-6 animate-fade-in">
        {/* Conversations List */}
        <aside className="w-full lg:w-80 bg-card/80 border-b lg:border-b-0 lg:border-r border-border shadow-lg p-4 space-y-4">
          <h2 className="text-lg md:text-xl font-bold mb-4">Conversations</h2>
          {conversations.length === 0 ? (
            <div className="text-muted-foreground text-sm md:text-base">No conversations yet.</div>
          ) : (
            conversations.map((conv: any) => (
              <Card
                key={conv.id}
                className={`mb-2 cursor-pointer transition-all ${selectedUser?.id === conv.id ? 'bg-primary/10 border-primary' : 'hover:bg-card/60'}`}
                onClick={() => setSelectedUser(conv)}
              >
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <span className="font-semibold text-sm md:text-base">{conv.full_name || conv.email}</span>
                </CardContent>
              </Card>
            ))
          )}
        </aside>
        {/* Chat Window */}
        <main className="flex-1 flex flex-col p-3 md:p-4">
          {selectedUser ? (
            <Card className="flex-1 flex flex-col max-w-2xl mx-auto shadow-lg">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-base md:text-lg font-bold">Chat with {selectedUser.full_name || selectedUser.email}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-2 overflow-y-auto px-3 md:px-4" style={{ minHeight: 300 }}>
                {messages.length === 0 ? (
                  <div className="text-muted-foreground text-sm md:text-base">No messages yet.</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-lg px-3 md:px-4 py-2 mb-1 max-w-[80%] md:max-w-xs ${msg.sender_id === user.id ? 'bg-primary text-white' : 'bg-card/80 text-foreground'}`}>
                        {msg.content && <span className="text-sm md:text-base">{msg.content}</span>}
                        {msg.file_url && (
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline mt-1 text-sm">Invoice Attachment</a>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </CardContent>
              <form
                className="flex items-center gap-2 p-3 md:p-4 border-t bg-background"
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg h-10 md:h-9 text-sm md:text-base"
                  disabled={sending || uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg h-10 w-10 md:h-9 md:w-9 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg h-10 w-10 md:h-9 md:w-9 p-0"
                  disabled={sending || uploading || !newMessage.trim()}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </Button>
              </form>
            </Card>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 md:w-12 md:h-12 bg-muted rounded-full flex items-center justify-center">
                  <Send className="h-8 w-8 md:h-6 md:w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg md:text-base font-semibold mb-2 md:mb-1">No conversation selected</h3>
                  <p className="text-sm md:text-xs text-muted-foreground">Choose a conversation from the list to start messaging.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Messages; 