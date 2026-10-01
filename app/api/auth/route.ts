import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS ?? 'portfolio2026';
const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_TOKEN, SESSION_VALUE, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    sameSite: 'lax',
  });

  return Response.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_TOKEN, '', { maxAge: 0, path: '/' });
  return Response.json({ success: true });
}
