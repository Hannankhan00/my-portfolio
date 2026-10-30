import { sql } from '@/lib/db';

export type ExperienceRow = {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  is_current: boolean;
  tags: string[];
  highlights: string[];
  position: number;
};

const SEED: (Omit<ExperienceRow, 'id' | 'tags' | 'highlights'> & { seed_key: string })[] = [
  {
    seed_key: 'canzova-digital',
    role: 'Full Stack Developer',
    company: 'Canzova Digital',
    period: 'Aug 2026 – Present',
    description: 'Building and shipping full stack web applications, from polished front-end interfaces to the APIs and databases behind them.',
    is_current: true,
    position: 1,
  },
  {
    seed_key: 'rapidtechpro',
    role: 'Web Developer',
    company: 'RapidTechPro',
    period: '2024 – Aug 2026',
    description: 'Two years of building responsive, high-performance websites and web applications for clients.',
    is_current: false,
    position: 2,
  },
];

let ready: Promise<void> | null = null;

/**
 * Makes sure the experience table exists, and seeds it with the two original
 * roles only when this call is the one that created it. Creating the table is
 * atomic, so two requests arriving together can never both seed it, and
 * deleting every entry later won't bring the roles back.
 */
export function ensureExperienceTable(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      let created = false;
      try {
        await sql`
          CREATE TABLE experience (
            id SERIAL PRIMARY KEY,
            role TEXT NOT NULL,
            company TEXT NOT NULL,
            period TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            is_current BOOLEAN NOT NULL DEFAULT FALSE,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `;
        created = true;
      } catch (err) {
        const e = err as { code?: string; message?: string };
        // 42P07 = the table already exists, which is the normal case
        if (e.code !== '42P07' && !/already exists/i.test(e.message ?? '')) throw err;
      }

      // Columns added after the first version of the table
      await sql`ALTER TABLE experience ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'`;
      await sql`ALTER TABLE experience ADD COLUMN IF NOT EXISTS highlights TEXT[] NOT NULL DEFAULT '{}'`;
      await sql`ALTER TABLE experience ADD COLUMN IF NOT EXISTS seed_key TEXT`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS experience_seed_key_idx ON experience (seed_key)`;

      if (created) {
        for (const e of SEED) {
          await sql`
            INSERT INTO experience (role, company, period, description, is_current, position, seed_key)
            VALUES (${e.role}, ${e.company}, ${e.period}, ${e.description}, ${e.is_current}, ${e.position}, ${e.seed_key})
            ON CONFLICT (seed_key) DO NOTHING
          `;
        }
      }
    })().catch((err) => {
      ready = null; // retry on the next request
      throw err;
    });
  }
  return ready;
}

export async function getExperience(): Promise<ExperienceRow[]> {
  await ensureExperienceTable();
  return (await sql`
    SELECT id, role, company, period, description, is_current, tags, highlights, position
    FROM experience
    ORDER BY position ASC, id ASC
  `) as ExperienceRow[];
}
