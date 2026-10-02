import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

export type SocialRow = {
  id: number;
  platform: string;
  label: string;
  url: string;
  icon: string;
  position: number;
  created_at: string;
};

export async function GET() {
  try {
    const rows = (await sql`
      SELECT id, platform, label, url, COALESCE(icon, '') as icon, COALESCE(position, 0) as position, created_at
      FROM socials
      ORDER BY position ASC, id ASC
    `) as SocialRow[];
    return Response.json(rows);
  } catch (err) {
    console.error('Error fetching socials:', err);
    return Response.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
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

  // Compute next position
  const maxPosRow = (await sql`
    SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM socials
  `) as Array<{ next_pos: number }>;
  const nextPos = maxPosRow[0]?.next_pos ?? 1;

  const rows = (await sql`
    INSERT INTO socials (platform, label, url, icon, position)
    VALUES (${platformStr}, ${labelStr}, ${urlStr}, ${iconStr}, ${nextPos})
    RETURNING id, platform, label, url, icon, position, created_at
  `) as SocialRow[];

  return Response.json(rows[0], { status: 201 });
}
