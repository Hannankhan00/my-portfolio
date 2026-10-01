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

async function readProjects() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeProjects(projects: unknown[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(projects, null, 2), 'utf-8');
}

export async function GET() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return Response.json(JSON.parse(raw));
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, stack, image, link, reversed } = body;

  if (!title || !description || !link) {
    return Response.json({ error: 'title, description and link are required' }, { status: 400 });
  }

  const projects = await readProjects();
  const newProject = {
    id: Date.now().toString(),
    title: String(title).trim(),
    description: String(description).trim(),
    stack: Array.isArray(stack) ? stack.map(String) : [],
    image: String(image ?? '').trim(),
    link: String(link).trim(),
    reversed: Boolean(reversed),
  };

  projects.push(newProject);
  await writeProjects(projects);

  return Response.json(newProject, { status: 201 });
}
