import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

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
    return Response.json({ error: 'Invalid social ID' }, { status: 400 });
  }

  const body = await request.json();
  const { platform, label, url, icon } = body;

  if (!platform || !url) {
    return Response.json(
      { error: 'Platform and URL are required' },
      { status: 400 }
    );
  }

  const platformStr = String(platform).trim();
  const labelStr = String(label || platform).trim();
  const urlStr = String(url).trim();
  const iconStr = String(icon ?? '').trim();

  const rows = await sql`
    UPDATE socials
    SET
      platform = ${platformStr},
      label = ${labelStr},
      url = ${urlStr},
      icon = ${iconStr}
    WHERE id = ${numericId}
    RETURNING id, platform, label, url, icon, position, created_at
  `;

  if (!rows || rows.length === 0) {
    return Response.json({ error: 'Social link not found' }, { status: 404 });
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
    return Response.json({ error: 'Invalid social ID' }, { status: 400 });
  }

  const rows = await sql`
    DELETE FROM socials WHERE id = ${numericId} RETURNING id
  `;

  if (!rows || rows.length === 0) {
    return Response.json({ error: 'Social link not found' }, { status: 404 });
  }

  return Response.json({ success: true });
}
