'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/dashboard/header';

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled');
  
  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: plan,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setError(error.message || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={{id: '', email: ''}} /> {/* This would be populated in a real app */}
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Upgrade to TaskFlow Premium</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          
          {canceled && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 rounded-lg">
              Your payment was canceled. Feel free to try again when you're ready!
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-8 text-center border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Unlock the full potential of TaskFlow</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get unlimited access to all premium features and take your productivity to the next level.
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-lg p-1 bg-gray-100 dark:bg-gray-700">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      plan === 'monthly'
                        ? 'bg-white dark:bg-gray-600 shadow'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    onClick={() => setPlan('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      plan === 'annual'
                        ? 'bg-white dark:bg-gray-600 shadow'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    onClick={() => setPlan('annual')}
                  >
                    Annual <span className="text-green-600 dark:text-green-400">Save 20%</span>
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 flex flex-col">
                  <h3 className="font-bold text-xl mb-2">Free Plan</h3>
                  <div className="text-3xl font-bold mb-6">$0</div>
                  <ul className="mb-8 space-y-3 flex-1">
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Basic task management</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Limited AI suggestions (5/day)</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Mobile responsive design</span>
                    </li>
                    <li className="flex items-start text-gray-500 dark:text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 mr-2 flex-shrink-0"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      <span>Real-time collaboration</span>
                    </li>
                    <li className="flex items-start text-gray-500 dark:text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 mr-2 flex-shrink-0"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-start text-gray-500 dark:text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 mr-2 flex-shrink-0"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <div>
                    <p className="text-center text-gray-500 dark:text-gray-400">Current plan</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 flex flex-col border-2 border-primary relative">
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-primary text-white text-xs font-bold py-1 px-2 rounded">
                    RECOMMENDED
                  </div>
                  <h3 className="font-bold text-xl mb-2">Premium Plan</h3>
                  <div className="text-3xl font-bold mb-1">
                    {plan === 'monthly' ? '$9.99' : '$95.88'}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {plan === 'monthly' ? '/month' : '/year'}
                    </span>
                  </div>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {plan === 'annual' && 'Equivalent to $7.99/month. Save 20%!'}
                  </p>
                  <ul className="mb-8 space-y-3 flex-1">
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Everything in Free plan</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>
                        <strong>Unlimited</strong> AI task suggestions
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Real-time collaboration with unlimited users</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Advanced analytics and reporting</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : `Upgrade Now`}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="max-w-2xl mx-auto grid gap-6">
              <div className="text-left">
                <h4 className="font-medium mb-2">Can I cancel at any time?</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-medium mb-2">Is there a free trial?</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  We don't offer a free trial, but our free plan allows you to experience the core features before upgrading.
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  We accept all major credit cards through our secure payment processor, Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}