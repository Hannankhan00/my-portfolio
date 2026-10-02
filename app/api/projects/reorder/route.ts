import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { order } = body; // Array of IDs in sequence: [2, 1, 3]

  if (!Array.isArray(order) || order.length === 0) {
    return Response.json({ error: 'order array is required' }, { status: 400 });
  }

  // Update positions in batch
  for (let i = 0; i < order.length; i++) {
    const id = parseInt(String(order[i]), 10);
    if (!isNaN(id)) {
      await sql`
        UPDATE projects
        SET position = ${i + 1}
        WHERE id = ${id}
      `;
    }
  }

  return Response.json({ success: true, message: 'Projects reordered successfully' });
}
