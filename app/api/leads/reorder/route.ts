import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { LEAD_STATUSES, ensureLeadsTable } from '@/lib/leads';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

/**
 * Saves where cards sit on the board.
 * Body: { columns: { new: [id, id], contacted: [id], ... } }, each list in top-to-bottom order.
 * A lead listed under a different column than before is moved to it.
 */
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const columns = body?.columns;
  if (!columns || typeof columns !== 'object') {
    return Response.json({ error: 'columns object is required' }, { status: 400 });
  }

  await ensureLeadsTable();

  for (const status of LEAD_STATUSES) {
    const ids: unknown = columns[status];
    if (!Array.isArray(ids)) continue;

    for (let i = 0; i < ids.length; i++) {
      const id = parseInt(String(ids[i]), 10);
      if (isNaN(id)) continue;
      await sql`
        UPDATE leads SET status = ${status}, position = ${i + 1}
        WHERE id = ${id}
      `;
    }
  }

  return Response.json({ success: true });
}
