import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh session if expired & still valid
  await supabase.auth.getSession();
  
  return res;
}

// Only run the middleware on specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the following:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - /api/stripe/webhook (stripe webhook)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/stripe/webhook).*)',
  ],
};