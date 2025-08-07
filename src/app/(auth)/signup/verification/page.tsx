import Link from 'next/link';

export const metadata = {
  title: 'Verify Your Email | TaskFlow',
  description: 'Verify your email to complete your TaskFlow account registration',
};

export default function VerificationPage() {
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
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
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
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent you an email with a link to verify your account. Please check your inbox and follow the instructions.
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            If you don't see the email, check your spam folder or click below to resend.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button
              className="py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              // In a real app, this would trigger a resend email function
            >
              Resend Verification Email
            </button>
            
            <Link
              href="/login"
              className="py-2 px-4 text-gray-600 dark:text-gray-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}