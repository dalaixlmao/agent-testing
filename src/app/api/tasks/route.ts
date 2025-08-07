import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    
    // Build query
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignees:task_assignees(
          user_id,
          profiles:user_id(id, name, avatar_url)
        )
      `)
      .eq('user_id', session.user.id);
    
    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    // Execute query
    const { data, error } = await query.order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our Task type
    const tasks = data.map((task) => ({
      ...task,
      assignees: task.assignees?.map((assignee: any) => assignee.profiles) || []
    }));
    
    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get request body
    const body = await request.json();
    const { title, description, priority, due_date } = body;
    
    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Create task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || null,
        priority: priority || 'medium',
        status: 'todo',
        due_date: due_date || null,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ task: data[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 500 });
  }
}