'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import TaskCard from './task-card';
import { Task } from '@/types';
import { isBrowser } from '@/lib/utils';

interface TaskListProps {
  initialTasks: Task[];
}

export default function TaskList({ initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!isBrowser) return;
    
    // Subscribe to changes on the tasks table
    const channel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        async (payload) => {
          console.log('Change received!', payload);
          
          // Refetch all tasks to get the latest state
          // In a production app, you might want to update the local state more efficiently
          fetchTasks();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would likely want to use more sophisticated querying with pagination
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignees:task_assignees(
            user_id,
            profiles:user_id(id, name, avatar_url)
          )
        `)
        .order('updated_at', { ascending: false });
      
      if (tasksError) throw tasksError;
      
      // Transform the data to match our Task type
      const formattedTasks = tasksData.map((task: any) => ({
        ...task,
        assignees: task.assignees?.map((assignee: any) => assignee.profiles) || []
      }));
      
      setTasks(formattedTasks);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state immediately for better UX
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (error: any) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, status: 'todo' | 'in-progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state immediately for better UX
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, status, updated_at: new Date().toISOString() } : task
        )
      );
    } catch (error: any) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };
  
  // Group tasks by status
  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress');
  const completedTasks = tasks.filter((task) => task.status === 'completed');

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 mb-6">
        <p className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-5 w-5 mr-2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          {error}
        </p>
        <button 
          onClick={fetchTasks}
          className="mt-2 text-sm font-medium text-red-700 dark:text-red-400 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* To Do Column */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          To Do
          <span className="ml-2 text-gray-500 dark:text-gray-500 text-sm">
            ({todoTasks.length})
          </span>
        </h3>
        
        <div className="space-y-3 mt-4">
          {loading && todoTasks.length === 0 ? (
            <div className="animate-pulse space-y-3">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : todoTasks.length > 0 ? (
            todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No tasks to do</p>
            </div>
          )}
        </div>
      </div>
      
      {/* In Progress Column */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4 mr-2 text-blue-500"
          >
            <path d="M12 2v4" />
            <path d="m4.93 10.93 2.83 2.83" />
            <path d="M2 18h4" />
            <path d="M12 22v-4" />
            <path d="m19.07 13.83-2.83-2.83" />
            <path d="M22 6h-4" />
            <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
          </svg>
          In Progress
          <span className="ml-2 text-gray-500 dark:text-gray-500 text-sm">
            ({inProgressTasks.length})
          </span>
        </h3>
        
        <div className="space-y-3 mt-4">
          {loading && inProgressTasks.length === 0 ? (
            <div className="animate-pulse space-y-3">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : inProgressTasks.length > 0 ? (
            inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No tasks in progress</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Completed Column */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4 mr-2 text-green-500"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
          Completed
          <span className="ml-2 text-gray-500 dark:text-gray-500 text-sm">
            ({completedTasks.length})
          </span>
        </h3>
        
        <div className="space-y-3 mt-4">
          {loading && completedTasks.length === 0 ? (
            <div className="animate-pulse space-y-3">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No completed tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}