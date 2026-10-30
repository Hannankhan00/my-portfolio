import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { ensureMessagesTable, type MessageRow } from '@/lib/messages';
import { createLead } from '@/lib/leads';
import { sendContactNotification } from '@/lib/mailer';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

const MAX_PER_HOUR = 5; // per visitor
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

/** Public: a visitor sends a message from the contact form. */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend it worked.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return Response.json({ success: true });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!name || !email || !message) {
    return Response.json({ error: 'Please fill in your name, email and message.' }, { status: 400 });
  }
  if (name.length > 100 || email.length > 200 || message.length > 3000) {
    return Response.json({ error: 'One of the fields is too long.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (message.length < 10) {
    return Response.json({ error: 'Your message is a bit short. Tell me a little more.' }, { status: 400 });
  }

  // Only a hash of the visitor's IP is stored, just enough to rate-limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ipHash = createHash('sha256').update(ip).digest('hex');

  try {
    await ensureMessagesTable();

    const recent = (await sql`
      SELECT COUNT(*)::int AS n FROM contact_messages
      WHERE ip_hash = ${ipHash} AND created_at > NOW() - INTERVAL '1 hour'
    `) as Array<{ n: number }>;
    if ((recent[0]?.n ?? 0) >= MAX_PER_HOUR) {
      return Response.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
    }

    await sql`
      INSERT INTO contact_messages (name, email, message, ip_hash)
      VALUES (${name}, ${email}, ${message}, ${ipHash})
    `;

    // Every message also becomes a lead in the "New" column of the pipeline
    try {
      await createLead({ name, email, message, source: 'Contact form' });
    } catch (err) {
      console.error('Could not create a lead from the contact message:', err);
    }

    // Email me. A mail failure must not make the visitor think their message was lost.
    try {
      await sendContactNotification({ name, email, message });
    } catch (err) {
      console.error('Could not send the contact notification email:', err);
    }

    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Error saving contact message:', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

/** Admin: list every message, newest first. */
export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureMessagesTable();
    const rows = (await sql`
      SELECT id, name, email, message, is_read, created_at
      FROM contact_messages
      ORDER BY created_at DESC, id DESC
    `) as MessageRow[];
    return Response.json(rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    return Response.json([], { status: 500 });
  }
}
