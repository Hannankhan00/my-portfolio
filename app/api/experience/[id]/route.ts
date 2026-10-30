import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { ensureExperienceTable } from '@/lib/experience';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

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
    return Response.json({ error: 'Invalid experience ID' }, { status: 400 });
  }

  const body = await request.json();
  const { role, company, period, description, is_current, tags, highlights } = body;

  if (!role || !company || !period) {
    return Response.json(
      { error: 'Role, company and period are required' },
      { status: 400 }
    );
  }

  const roleStr = String(role).trim();
  const companyStr = String(company).trim();
  const periodStr = String(period).trim();
  const descStr = String(description ?? '').trim();
  const current = Boolean(is_current);
  const tagList = toStringList(tags);
  const highlightList = toStringList(highlights);

  await ensureExperienceTable();

  const rows = await sql`
    UPDATE experience
    SET
      role = ${roleStr},
      company = ${companyStr},
      period = ${periodStr},
      description = ${descStr},
      is_current = ${current},
      tags = ${tagList},
      highlights = ${highlightList}
    WHERE id = ${numericId}
    RETURNING id, role, company, period, description, is_current, tags, highlights, position
  `;

  if (!rows || rows.length === 0) {
    return Response.json({ error: 'Experience not found' }, { status: 404 });
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
    return Response.json({ error: 'Invalid experience ID' }, { status: 400 });
  }

  const rows = await sql`
    DELETE FROM experience WHERE id = ${numericId} RETURNING id
  `;

  if (!rows || rows.length === 0) {
    return Response.json({ error: 'Experience not found' }, { status: 404 });
  }

  return Response.json({ success: true });
}
