import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // A simple query to test the connection
    const result = await query('SELECT NOW()');
    
    return NextResponse.json({
      status: 'Connected',
      timestamp: result.rows[0].now,
      message: 'Database connection is healthy!'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      status: 'Disconnected',
      error: error.message,
      hint: 'Check your .env.local credentials and ensure PostgreSQL is running.'
    }, { status: 500 });
  }
}