import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

type AdminRow = {
  id: number;
  email: string | null;
  username: string | null;
  password_hash: string;
  name: string | null;
  role: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ error: 'Username/Email and password are required' }, { status: 400 });
    }

    const cleanIdentifier = String(username).trim();

    // Query Neon database for user matching username or email
    const users = (await sql`
      SELECT id, email, username, password_hash, name, role
      FROM admin_users
      WHERE LOWER(username) = LOWER(${cleanIdentifier})
         OR LOWER(email) = LOWER(${cleanIdentifier})
      LIMIT 1
    `) as AdminRow[];

    if (!users || users.length === 0) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const admin = users[0];
    const isPasswordValid = await bcrypt.compare(String(password), admin.password_hash);

    if (!isPasswordValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_TOKEN, SESSION_VALUE, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: 'lax',
    });

    return Response.json({
      success: true,
      user: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Authentication service error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_TOKEN, '', { maxAge: 0, path: '/' });
  return Response.json({ success: true });
}
