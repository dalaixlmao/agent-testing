import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import Header from '@/components/dashboard/header';
import ActiveUsers from '@/components/dashboard/active-users';
import TaskList from '@/components/tasks/task-list';
import TaskForm from '@/components/tasks/task-form';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard | TaskFlow',
  description: 'Manage your tasks and track progress',
};

export default async function DashboardPage() {
  const supabase = createServerClient();
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const user = session.user;
  
  // Fetch user profile data
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  const userWithProfile = {
    ...user,
    name: profileData?.name || null,
    avatar_url: profileData?.avatar_url || null,
    is_premium: false, // Set default value, would fetch from user_preferences in a real app
  };
  
  // Fetch tasks
  const { data: tasksData } = await supabase
    .from('tasks')
    .select(`
      *,
      assignees:task_assignees(
        user_id,
        profiles:user_id(id, name, avatar_url)
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  
  // Transform the data to match our Task type
  const tasks = tasksData?.map((task: any) => ({
    ...task,
    assignees: task.assignees?.map((assignee: any) => assignee.profiles) || []
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={userWithProfile} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          
          <div>
            <Link
              href="/upgrade"
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-full hover:from-purple-700 hover:to-indigo-700"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4 mr-1"
              >
                <path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7" />
                <path d="M15 7h6v6" />
              </svg>
              Upgrade to Premium
            </Link>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active Users</h2>
          <ActiveUsers />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium mb-4">Recent Tasks</h2>
            <TaskList initialTasks={tasks} />
          </div>
          
          <div>
            <TaskForm userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  );
}