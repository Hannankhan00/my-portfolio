import { sql } from '@/lib/db';

export const LEAD_STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  budget: string;
  message: string;
  notes: string;
  status: LeadStatus;
  position: number;
  created_at: string;
};

export const isLeadStatus = (value: unknown): value is LeadStatus =>
  typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);

let ready: Promise<void> | null = null;

/** Creates the leads table on first use. Creation is atomic, so concurrent calls are safe. */
export function ensureLeadsTable(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      try {
        await sql`
          CREATE TABLE leads (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL DEFAULT '',
            phone TEXT NOT NULL DEFAULT '',
            source TEXT NOT NULL DEFAULT 'Manual',
            budget TEXT NOT NULL DEFAULT '',
            message TEXT NOT NULL DEFAULT '',
            notes TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'new',
            position INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `;
      } catch (err) {
        const e = err as { code?: string; message?: string };
        // 42P07 = the table already exists, which is the normal case
        if (e.code !== '42P07' && !/already exists/i.test(e.message ?? '')) throw err;
      }
    })().catch((err) => {
      ready = null; // retry on the next request
      throw err;
    });
  }
  return ready;
}

/** New leads go to the top of their column. */
export async function createLead(input: {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  budget?: string;
  message?: string;
  notes?: string;
  status?: LeadStatus;
}): Promise<LeadRow> {
  await ensureLeadsTable();
  const status = input.status ?? 'new';

  const top = (await sql`
    SELECT COALESCE(MIN(position), 1) - 1 AS pos FROM leads WHERE status = ${status}
  `) as Array<{ pos: number }>;

  const rows = (await sql`
    INSERT INTO leads (name, email, phone, source, budget, message, notes, status, position)
    VALUES (
      ${input.name}, ${input.email ?? ''}, ${input.phone ?? ''}, ${input.source ?? 'Manual'},
      ${input.budget ?? ''}, ${input.message ?? ''}, ${input.notes ?? ''}, ${status}, ${top[0]?.pos ?? 0}
    )
    RETURNING id, name, email, phone, source, budget, message, notes, status, position, created_at
  `) as LeadRow[];
  return rows[0];
}
