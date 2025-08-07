import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import AuthForm from '@/components/auth/auth-form';
import Link from 'next/link';

export const metadata = {
  title: 'Sign Up | TaskFlow',
  description: 'Create a new TaskFlow account',
};

export default async function SignupPage() {
  const supabase = createServerClient();
  
  // Check if user is already authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // If authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="text-xl font-bold">TaskFlow</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthForm type="signup" />
        </div>
      </main>
    </div>
  );
}