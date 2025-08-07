'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

interface TaskFormProps {
  onTaskCreated?: () => void;
  userId: string;
}

export default function TaskForm({ onTaskCreated, userId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  
  const supabase = createBrowserClient();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!title.trim()) {
      setError('Task title is required');
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description: description || null,
          priority,
          status: 'todo',
          due_date: dueDate || null,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      
      if (error) throw error;
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      
      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getAiSuggestions = async () => {
    setLoadingAi(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/suggest-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }
      
      const data = await response.json();
      setAiSuggestions(data.suggestions);
      setShowAiSuggestions(true);
    } catch (error: any) {
      console.error('Error getting AI suggestions:', error);
      setError('Failed to get AI suggestions. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };
  
  const useAiSuggestion = (suggestion: string) => {
    setTitle(suggestion);
    setShowAiSuggestions(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Title
            </label>
            <div className="flex">
              <input
                type="text"
                id="title"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-900 dark:border-gray-700"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
              <button
                type="button"
                onClick={getAiSuggestions}
                className="ml-2 flex items-center justify-center px-3 py-2 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20"
                disabled={loadingAi}
              >
                {loadingAi ? (
                  <span className="loading-dots flex justify-center">
                    <span className="h-1 w-1 rounded-full bg-purple-700 dark:bg-purple-400 mx-0.5"></span>
                    <span className="h-1 w-1 rounded-full bg-purple-700 dark:bg-purple-400 mx-0.5"></span>
                    <span className="h-1 w-1 rounded-full bg-purple-700 dark:bg-purple-400 mx-0.5"></span>
                  </span>
                ) : (
                  <>
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
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                      <path d="M18 15h.01" />
                    </svg>
                    <span className="sr-only md:not-sr-only md:inline-block md:ml-1">Suggest</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {showAiSuggestions && aiSuggestions.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-md border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2 flex items-center">
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
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 15h.01" />
                </svg>
                AI Suggestions
              </h4>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => useAiSuggestion(suggestion)}
                    className="w-full text-left px-3 py-2 bg-white dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded border border-purple-100 dark:border-purple-900 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-900 dark:border-gray-700 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details..."
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-900 dark:border-gray-700 appearance-none bg-no-repeat bg-right"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundSize: '16px',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="dueDate">
                Due Date (optional)
              </label>
              <input
                type="date"
                id="dueDate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-900 dark:border-gray-700"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-dots flex justify-center">
                  <span className="h-1 w-1 rounded-full bg-white mx-0.5"></span>
                  <span className="h-1 w-1 rounded-full bg-white mx-0.5"></span>
                  <span className="h-1 w-1 rounded-full bg-white mx-0.5"></span>
                </span>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}