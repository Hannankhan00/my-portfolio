import { sql } from '@/lib/db';

export type MessageRow = {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

let ready: Promise<void> | null = null;

/** Creates the contact_messages table on first use. Creation is atomic, so concurrent calls are safe. */
export function ensureMessagesTable(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      try {
        await sql`
          CREATE TABLE contact_messages (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            ip_hash TEXT,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
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
