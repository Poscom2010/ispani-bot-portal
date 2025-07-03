import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { userPrompt } = await req.json();

    if (!userPrompt) {
      throw new Error('User prompt is required');
    }

    console.log('Generating proposal for prompt:', userPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert freelance proposal writer. Generate a professional proposal based on the user's project description. Return your response as a JSON object with exactly these fields:
            {
              "overview": "A compelling project overview paragraph",
              "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3"],
              "timeline": "A realistic timeline estimate",
              "price": "A price range or estimate"
            }`
          },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Try to parse as JSON, fallback to a structured response
    let proposalData;
    try {
      proposalData = JSON.parse(generatedText);
    } catch (parseError) {
      console.log('Failed to parse JSON, creating structured response');
      // Fallback: create a structured response if OpenAI didn't return valid JSON
      proposalData = {
        overview: generatedText.substring(0, 500) + '...',
        deliverables: ['Project planning and analysis', 'Development and implementation', 'Testing and quality assurance', 'Delivery and support'],
        timeline: '4-6 weeks',
        price: '$2,000 - $5,000'
      };
    }

    console.log('Generated proposal data:', proposalData);

    return new Response(JSON.stringify(proposalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ispanibot-generator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});