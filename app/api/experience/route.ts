import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { ensureExperienceTable, getExperience, type ExperienceRow } from '@/lib/experience';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

export async function GET() {
  try {
    return Response.json(await getExperience());
  } catch (err) {
    console.error('Error fetching experience:', err);
    return Response.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
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

  const maxPosRow = (await sql`
    SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM experience
  `) as Array<{ next_pos: number }>;
  const nextPos = maxPosRow[0]?.next_pos ?? 1;

  const rows = (await sql`
    INSERT INTO experience (role, company, period, description, is_current, tags, highlights, position)
    VALUES (${roleStr}, ${companyStr}, ${periodStr}, ${descStr}, ${current}, ${tagList}, ${highlightList}, ${nextPos})
    RETURNING id, role, company, period, description, is_current, tags, highlights, position
  `) as ExperienceRow[];

  return Response.json(rows[0], { status: 201 });
}
