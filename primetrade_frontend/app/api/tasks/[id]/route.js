import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET single task
export async function GET(request, { params }) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    
    const result = await query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task: result.rows[0] });
  } catch (err) {
    console.error('Error fetching task:', err);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT - Update task
export async function PUT(request, { params }) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const { title, description, status } = await request.json();

    // Validation
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
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, in-progress, or completed' },
        { status: 400 }
      );
    }

    // Check if task exists and belongs to user
    const checkResult = await query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, user.userId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update task
    const result = await query(
      `UPDATE tasks 
       SET title = $1, description = $2, status = $3, updated_at = NOW() 
       WHERE id = $4 AND user_id = $5 
       RETURNING *`,
      [title.trim(), description?.trim() || '', status || 'pending', id, user.userId]
    );

    return NextResponse.json({
      message: 'Task updated successfully',
      task: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating task:', err);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(request, { params }) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;

    const result = await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
