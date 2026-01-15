import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Middleware to verify JWT token from cookies
 * Returns user data if valid, null if invalid
 */
export async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to protect API routes
 * Returns user data if authenticated, error response if not
 */
export async function requireAuth() {
  const user = await verifyAuth();
  
  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

/**
 * Logout helper - clears auth token
 */
export async function clearAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
