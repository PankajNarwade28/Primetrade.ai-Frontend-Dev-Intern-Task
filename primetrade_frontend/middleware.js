import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Force Node.js runtime instead of Edge runtime
export const runtime = 'nodejs';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/api/profile', '/api/tasks'];

// Routes that should redirect to dashboard if already logged in
const authRoutes = ['/auth'];

export function middleware(request) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Verify token validity
  let isValidToken = false;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      isValidToken = true;
      console.log('✅ Valid token found for user:', decoded.email);
    } catch (error) {
      console.log('❌ Invalid token:', error.message);
      isValidToken = false;
    }
  } else {
    console.log('ℹ️ No token found in cookies for path:', pathname);
  }

  // Redirect to auth if trying to access protected route without valid token
  if (isProtectedRoute && !isValidToken) {
    console.log('🔒 Redirecting to /auth - protected route without token');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Redirect to dashboard if already logged in and trying to access auth page
  if (isAuthRoute && isValidToken) {
    console.log('✅ Redirecting to /dashboard - already authenticated');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/api/profile/:path*', '/api/tasks/:path*'],
};
