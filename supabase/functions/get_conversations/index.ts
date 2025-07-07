import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { current_user_id } = await req.json();

    if (!current_user_id) {
      throw new Error('current_user_id is required');
    }

    // Get unique users that the current user has messaged or received messages from
    const { data: conversations, error } = await supabaseClient
      .from('messages')
      .select(`
        sender_id,
        receiver_id,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${current_user_id},receiver_id.eq.${current_user_id}`)
      .order('sent_at', { ascending: false });

    if (error) throw error;

    // Extract unique conversation partners
    const uniqueUsers = new Map();
    
    conversations?.forEach((msg: any) => {
      if (msg.sender_id === current_user_id && msg.receiver) {
        uniqueUsers.set(msg.receiver_id, msg.receiver);
      } else if (msg.receiver_id === current_user_id && msg.sender) {
        uniqueUsers.set(msg.sender_id, msg.sender);
      }
    });

    const result = Array.from(uniqueUsers.values());

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});