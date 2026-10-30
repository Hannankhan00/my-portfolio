import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { createLead, ensureLeadsTable, isLeadStatus, type LeadRow } from '@/lib/leads';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureLeadsTable();
    const rows = (await sql`
      SELECT id, name, email, phone, source, budget, message, notes, status, position, created_at
      FROM leads
      ORDER BY position ASC, id DESC
    `) as LeadRow[];
    return Response.json(rows);
  } catch (err) {
    console.error('Error fetching leads:', err);
    return Response.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? '').trim();
  if (!name) {
    return Response.json({ error: 'Name is required' }, { status: 400 });
  }

  const lead = await createLead({
    name,
    email: String(body.email ?? '').trim(),
    phone: String(body.phone ?? '').trim(),
    source: String(body.source ?? '').trim() || 'Manual',
    budget: String(body.budget ?? '').trim(),
    message: String(body.message ?? '').trim(),
    notes: String(body.notes ?? '').trim(),
    status: isLeadStatus(body.status) ? body.status : 'new',
  });

  return Response.json(lead, { status: 201 });
}
