'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/dashboard/header';

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    // Verify the session and update the UI
    const verifySession = async () => {
      if (!sessionId) {
        setError('Invalid session');
        setLoading(false);
        return;
      }
      
      try {
        // In a real app, you would verify the session with your backend
        // const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        // const data = await response.json();
        
        // if (!response.ok) {
        //   throw new Error(data.error || 'Failed to verify session');
        // }
        
        // For now, just simulate a successful verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error: any) {
        console.error('Error verifying session:', error);
        setError(error.message || 'Failed to verify session');
        setLoading(false);
      }
    };
    
    verifySession();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={{id: '', email: ''}} /> {/* This would be populated in a real app */}
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Processing your payment...</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we confirm your subscription.
              </p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-6 w-6"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}. Please try again or contact support if the issue persists.
              </p>
              <Link
                href="/upgrade"
                className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Try Again
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-8 w-8"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-lg mb-4">Your premium subscription is now active.</p>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                You now have unlimited access to all premium features. Enjoy your enhanced TaskFlow experience!
              </p>
              <div className="flex flex-col space-y-3">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/settings/subscription"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Manage Subscription
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}