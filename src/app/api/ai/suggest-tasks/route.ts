import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user is premium
  // In a real app, you would check the user's subscription status
  const isPremium = true; // TODO: Implement actual premium check
  
  try {
    // Check API usage limits for non-premium users
    if (!isPremium) {
      // Check how many AI requests the user has made today
      const today = new Date().toISOString().split('T')[0];
      const { count, error: countError } = await supabase
        .from('ai_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .gte('created_at', `${today}T00:00:00Z`)
        .lte('created_at', `${today}T23:59:59Z`);
        
      if (countError) throw countError;
      
      // Free tier limit: 5 requests per day
      if (count && count >= 5) {
        return NextResponse.json(
          { 
            error: 'Daily AI suggestion limit reached', 
            upgradeRequired: true 
          }, 
          { status: 429 }
        );
      }
    }
    
    // Get the user's existing tasks to provide context
    const { data: userTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('title, description, priority, status')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (tasksError) throw tasksError;
    
    // Build prompt for the AI model
    const existingTasksContext = userTasks
      .map((task: any) => `- ${task.title} (${task.priority} priority, ${task.status})`)
      .join('\n');
    
    const prompt = `Based on the following recent tasks:
${existingTasksContext || 'No recent tasks'}

Suggest 5 new potential tasks that would be relevant for a professional. Each task should be a brief title (no descriptions). Only respond with the list of task titles, one per line.`;

    // Call Hugging Face API
    // Note: In a real app, you'd use a more specialized model for this task
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.7,
      }
    });
    
    // Process the response to extract the task suggestions
    // This parsing logic would need to be adapted based on the actual model output
    const suggestions = response.generated_text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.length > 0 && !line.includes('Based on') && !line.includes('Suggest'))
      .map(line => line.replace(/^\d+\.\s*|^-\s*/, ''))
      .filter(line => line.length > 3)
      .slice(0, 5);
    
    // Log the AI usage for free tier users
    if (!isPremium) {
      await supabase.from('ai_usage').insert({
        user_id: session.user.id,
        feature: 'task_suggestions',
        created_at: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Error getting AI suggestions:', error);
    
    // Handle the case where the Hugging Face API key is missing
    if (error.message && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'AI suggestions are temporarily unavailable' }, 
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestions' }, 
      { status: 500 }
    );
  }
}