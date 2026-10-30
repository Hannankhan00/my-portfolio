import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

/** Admin: mark a message read or unread. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return Response.json({ error: 'Invalid message ID' }, { status: 400 });
  }

  const body = await request.json();
  const isRead = Boolean(body.is_read);

  const rows = await sql`
    UPDATE contact_messages SET is_read = ${isRead}
    WHERE id = ${numericId}
    RETURNING id, name, email, message, is_read, created_at
  `;

  if (!rows || rows.length === 0) {
    return Response.json({ error: 'Message not found' }, { status: 404 });
  }
  return Response.json(rows[0]);
}

/** Admin: delete a message. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return Response.json({ error: 'Invalid message ID' }, { status: 400 });
  }

  const rows = await sql`DELETE FROM contact_messages WHERE id = ${numericId} RETURNING id`;
  if (!rows || rows.length === 0) {
    return Response.json({ error: 'Message not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}
