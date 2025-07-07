import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

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
    console.log('ISpaniBot Generator function called');
    
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found in environment variables');
      throw new Error('GROQ_API_KEY not configured');
    }

    const { userPrompt } = await req.json();
    
    if (!userPrompt) {
      throw new Error('userPrompt is required');
    }

    console.log('Generating proposal with Groq for prompt:', userPrompt);

    const systemPrompt = `You are ISpaniBot, an expert freelance proposal generator specializing in creating professional, compelling proposals for various projects. 

Your task is to generate a concise, structured proposal based on the user's project description. The proposal should be professional, clear, and demonstrate capabilities while keeping each section brief for MVP purposes.

Return your response as a JSON object with the following structure:
{
  "title": "Professional project title",
  "executive_summary": "A brief 1-2 sentence executive summary highlighting the key value proposition",
  "problem_statement": "Clear, concise identification of the client's main needs and challenges",
  "objectives": ["3-4 specific", "measurable", "objectives"],
  "proposed_solution": "Brief methodology and approach to solving the problem",
  "implementation_plan": "Concise timeline with key milestones",
  "budget": {
    "total_cost": "Total project cost (e.g., '$5,000 - $8,000')",
    "breakdown": ["Planning: $1,000", "Development: $3,000", "Testing: $1,000"]
  },
  "team": "Brief description of team expertise and qualifications",
  "risks": ["Key risk with brief mitigation", "Another risk with brief mitigation"],
  "conclusion": "Strong, concise conclusion with clear next steps"
}

Keep each section brief but professional. Total proposal should be concise to demonstrate structure and capabilities for MVP. Use clear, actionable language.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a professional freelance proposal for this project: ${userPrompt}` }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Groq API response received');
    
    const generatedContent = data.choices[0].message.content;
    
    // Try to parse as JSON, fallback to structured format if it fails
    let proposalData;
    try {
      proposalData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.log('Failed to parse as JSON, creating structured response:', parseError);
      // Create a structured response from the raw content
      proposalData = {
        overview: generatedContent.split('\n')[0] || 'AI-generated proposal content',
        deliverables: [
          'Custom solution development',
          'Quality assurance and testing',
          'Documentation and support',
          'Timely delivery and communication'
        ],
        timeline: '2-4 weeks depending on project complexity',
        price: '$2,500 - $4,000'
      };
    }

    console.log('Proposal generated successfully');
    
    return new Response(JSON.stringify(proposalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ispanibot-generator function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate proposal',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});