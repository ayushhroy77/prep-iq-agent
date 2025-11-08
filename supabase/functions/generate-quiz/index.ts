import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topicName, topicDescription, difficulty } = await req.json();
    
    if (!topicName || !topicDescription) {
      return new Response(
        JSON.stringify({ error: 'Topic name and description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating quiz for topic:', topicName);

    // First, research the topic thoroughly
    const researchPrompt = `Research the topic "${topicName}" (${topicDescription}) in depth. Provide comprehensive, accurate, and up-to-date information about this topic. Focus on key concepts, important facts, common misconceptions, and relevant examples. This research will be used to generate high-quality quiz questions.`;

    const researchResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert educational researcher. Provide comprehensive, accurate information about academic topics.' },
          { role: 'user', content: researchPrompt }
        ],
      }),
    });

    if (!researchResponse.ok) {
      const errorText = await researchResponse.text();
      console.error('AI research error:', researchResponse.status, errorText);
      throw new Error('Failed to research topic');
    }

    const researchData = await researchResponse.json();
    const researchContent = researchData.choices[0].message.content;
    console.log('Research completed, generating questions...');

    // Now generate questions based on the research
    const questionPrompt = `Based on this research about "${topicName}":

${researchContent}

Generate exactly 15 unique, high-quality quiz questions about this topic. Each question should:
- Be clear, concise, and unambiguous
- Have 4 answer options (A, B, C, D)
- Have exactly ONE correct answer
- Include a detailed explanation of why the correct answer is right
- Include educational context and learning points in the explanation
- Vary in difficulty from easy to ${difficulty || 'medium'}
- Cover different aspects of the topic

Return ONLY a valid JSON array with this exact structure (no additional text):
[
  {
    "question": "Question text here",
    "options": {
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    },
    "correctAnswer": "A",
    "explanation": "Detailed explanation of why this answer is correct, including relevant context and learning points."
  }
]`;

    const questionsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert quiz generator. You must respond ONLY with valid JSON, no other text. Generate diverse, accurate, and educational quiz questions.' 
          },
          { role: 'user', content: questionPrompt }
        ],
      }),
    });

    if (!questionsResponse.ok) {
      if (questionsResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (questionsResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service unavailable. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await questionsResponse.text();
      console.error('AI generation error:', questionsResponse.status, errorText);
      throw new Error('Failed to generate questions');
    }

    const questionsData = await questionsResponse.json();
    let questionsText = questionsData.choices[0].message.content;
    
    // Clean up the response to extract JSON
    questionsText = questionsText.trim();
    if (questionsText.startsWith('```json')) {
      questionsText = questionsText.substring(7);
    }
    if (questionsText.startsWith('```')) {
      questionsText = questionsText.substring(3);
    }
    if (questionsText.endsWith('```')) {
      questionsText = questionsText.substring(0, questionsText.length - 3);
    }
    questionsText = questionsText.trim();

    const questions = JSON.parse(questionsText);
    
    if (!Array.isArray(questions) || questions.length !== 15) {
      console.error('Invalid questions format or count:', questions.length);
      throw new Error('Generated questions are not in the correct format');
    }

    console.log('Successfully generated', questions.length, 'questions');

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});