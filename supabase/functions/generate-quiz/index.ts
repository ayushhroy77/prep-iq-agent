import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    console.log('Generating quiz for topic:', topicName, 'with difficulty:', difficulty);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert educational content creator and teacher. Generate exactly 15 high-quality, diverse quiz questions about the given topic. Each question should:
- Be unique and not repetitive - vary the question types and aspects covered
- Test different concepts, applications, and depths of understanding of the topic
- Include 4 answer options (A, B, C, D) with plausible distractors
- Have exactly one correct answer
- Include a comprehensive, educational explanation (3-5 sentences) that:
  * Clearly explains WHY the correct answer is right
  * Provides context and additional learning points
  * Mentions why common wrong answers are incorrect (when relevant)
  * Uses real-world examples or applications when possible
  * Cites key concepts, principles, or facts to reinforce learning

Research the topic thoroughly before generating questions to ensure accuracy, relevance, and educational value. Make explanations engaging and informative.`;

    const userPrompt = `Generate 15 quiz questions about: "${topicName}"
Description: ${topicDescription}
Difficulty level: ${difficulty}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation here."
  }
]

Ensure the JSON is valid and properly formatted. No additional text outside the JSON array.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content);

    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    const questions = JSON.parse(jsonContent);

    if (!Array.isArray(questions) || questions.length !== 15) {
      throw new Error('Invalid question format or count');
    }

    // Validate question structure
    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
          typeof q.correctAnswer !== 'number' || !q.explanation) {
        throw new Error(`Invalid question structure at index ${index}`);
      }
    });

    console.log('Successfully generated 15 questions');

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
