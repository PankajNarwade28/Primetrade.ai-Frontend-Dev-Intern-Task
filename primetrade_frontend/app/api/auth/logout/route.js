import { clearAuthToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await clearAuthToken();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
