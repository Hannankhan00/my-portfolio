import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';
const DATA_PATH = path.join(process.cwd(), 'data', 'projects.json');

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const projects: { id: string }[] = JSON.parse(raw);
  const filtered = projects.filter((p) => p.id !== id);

  if (filtered.length === projects.length) {
    return Response.json({ error: 'Project not found' }, { status: 404 });
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
  return Response.json({ success: true });
}
