import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET all tasks for the authenticated user (with optional search/filter)
export async function GET(request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') || 'DESC';

    let queryText = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [user.userId];
    let paramIndex = 2;

    // Add search filter
    if (search) {
      queryText += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add status filter
    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Add sorting
    const validSortFields = ['created_at', 'updated_at', 'title', 'status'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    
    queryText += ` ORDER BY ${sortField} ${sortOrder}`;

    const result = await query(queryText, params);
    
    return NextResponse.json({ tasks: result.rows });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const { title, description, status } = await request.json();

    // Server-side validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be less than 200 characters' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    const taskStatus = status && validStatuses.includes(status) ? status : 'pending';

    const result = await query(
      `INSERT INTO tasks (user_id, title, description, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING *`,
      [user.userId, title.trim(), description?.trim() || '', taskStatus]
    );

    return NextResponse.json(
      { message: 'Task created successfully', task: result.rows[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating task:', err);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
