import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

export type ProjectRow = {
  id: number;
  title: string;
  description: string;
  stack: string[];
  image: string;
  link: string;
  reversed: boolean;
  created_at: string;
};

export async function GET() {
  const rows = (await sql`
    SELECT id, title, description, stack, image, link, reversed, created_at
    FROM projects
    ORDER BY created_at ASC
  `) as ProjectRow[];
  return Response.json(rows);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, stack, image, link, reversed } = body;

  if (!title || !description || !link) {
    return Response.json(
      { error: 'title, description and link are required' },
      { status: 400 }
    );
  }

  const stackArr: string[] = Array.isArray(stack) ? stack.map(String) : [];
  const imageStr = String(image ?? '').trim();
  const linkStr = String(link).trim();
  const titleStr = String(title).trim();
  const descStr = String(description).trim();
  const reversedBool = Boolean(reversed);

  const rows = (await sql`
    INSERT INTO projects (title, description, stack, image, link, reversed)
    VALUES (${titleStr}, ${descStr}, ${stackArr}, ${imageStr}, ${linkStr}, ${reversedBool})
    RETURNING id, title, description, stack, image, link, reversed, created_at
  `) as ProjectRow[];

  return Response.json(rows[0], { status: 201 });
}
