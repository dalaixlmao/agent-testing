'use client';

import { useState, useRef, useEffect } from 'react';
import { Task } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'todo' | 'in-progress' | 'completed') => void;
}

export default function TaskCard({ task, onDelete, onStatusChange }: TaskCardProps) {
  const [swipeState, setSwipeState] = useState<null | 'right' | 'left'>(null);
  const startX = useRef<number | null>(null);
  const currentX = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    
    const deltaX = e.touches[0].clientX - startX.current;
    currentX.current = deltaX;
    
    if (deltaX > 60) {
      setSwipeState('right');
    } else if (deltaX < -60) {
      setSwipeState('left');
    } else {
      setSwipeState(null);
    }
  };
  
  const handleTouchEnd = () => {
    if (swipeState === 'right') {
      onStatusChange(task.id, 'completed');
    } else if (swipeState === 'left') {
      onDelete(task.id);
    }
    
    startX.current = null;
    currentX.current = 0;
    setSwipeState(null);
  };
  
  // Animation cleanup
  useEffect(() => {
    return () => setSwipeState(null);
  }, []);
  
  // Priority badge classes
  const priorityClasses = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  
  // Status badge classes
  const statusClasses = {
    'todo': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div 
      ref={cardRef}
      className={cn(
        'task-card bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm hover:shadow-md',
        swipeState === 'right' && 'swiping-right',
        swipeState === 'left' && 'swiping-left'
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-between items-start mb-2">
        <Link
          href={`/tasks/${task.id}`}
          className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
        >
          {task.title}
        </Link>
        
        <div className="flex space-x-2">
          <span className={cn(
            'text-xs px-2 py-1 rounded-full capitalize',
            priorityClasses[task.priority]
          )}>
            {task.priority}
          </span>
          
          <span className={cn(
            'text-xs px-2 py-1 rounded-full capitalize',
            statusClasses[task.status]
          )}>
            {task.status.replace('-', ' ')}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500 dark:text-gray-500">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3 mr-1"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Updated {formatRelativeTime(task.updated_at)}</span>
        </div>
        
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 text-xs"
                title={user.name || user.email}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || 'User'}
                    className="h-full w-full object-cover rounded-full presence-indicator online"
                  />
                ) : (
                  <span>{(user.name || user.email).charAt(0).toUpperCase()}</span>
                )}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs ring-2 ring-white dark:ring-gray-800">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => onStatusChange(task.id, task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'todo')}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Change status"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4 text-gray-500 dark:text-gray-400"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Delete task"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4 text-gray-500 dark:text-gray-400"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
      
      <div className="absolute bottom-1 right-1 text-[10px] text-gray-400">
        {swipeState === 'right' ? 'Release to complete' : swipeState === 'left' ? 'Release to delete' : ''}
      </div>
    </div>
  );
}