import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { ensureLeadsTable, isLeadStatus } from '@/lib/leads';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return Response.json({ error: 'Invalid lead ID' }, { status: 400 });
  }

  const body = await request.json();
  const name = String(body.name ?? '').trim();
  if (!name) {
    return Response.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!isLeadStatus(body.status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }

  await ensureLeadsTable();

  const rows = await sql`
    UPDATE leads
    SET
      name = ${name},
      email = ${String(body.email ?? '').trim()},
      phone = ${String(body.phone ?? '').trim()},
      source = ${String(body.source ?? '').trim() || 'Manual'},
      budget = ${String(body.budget ?? '').trim()},
      message = ${String(body.message ?? '').trim()},
      notes = ${String(body.notes ?? '').trim()},
      status = ${body.status}
    WHERE id = ${numericId}
    RETURNING id, name, email, phone, source, budget, message, notes, status, position, created_at
  `;

  if (!rows || rows.length === 0) {
    return Response.json({ error: 'Lead not found' }, { status: 404 });
  }
  return Response.json(rows[0]);
}

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
    return Response.json({ error: 'Invalid lead ID' }, { status: 400 });
  }

  const rows = await sql`DELETE FROM leads WHERE id = ${numericId} RETURNING id`;
  if (!rows || rows.length === 0) {
    return Response.json({ error: 'Lead not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}
