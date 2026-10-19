/**
 * app/page.tsx — Server Component
 *
 * Fetches projects & socials directly from the database at request time.
 * All SEO-critical HTML (h1, about text, project names) is rendered to static
 * HTML before the response reaches the client, making it fully readable by
 * Googlebot without JavaScript.
 *
 * Interactive/animation logic lives in HomeClient.tsx ('use client').
 */

import { sql } from '@/lib/db';
import initialProjectsFallback from '@/data/projects.json';
import HomeClient, { type Project, type SocialItem } from './HomeClient';

// Default socials shown if the DB is empty or unreachable
const defaultSocials: SocialItem[] = [
  { id: 1, platform: 'GitHub',    label: 'GitHub',              url: 'https://github.com/Hannankhan00',                                          icon: 'github'    },
  { id: 2, platform: 'LinkedIn',  label: 'LinkedIn',            url: 'https://www.linkedin.com/in/hannankhan',                                    icon: 'linkedin'  },
  { id: 3, platform: 'WhatsApp',  label: '+92 339 7197970',     url: 'https://wa.me/923397197970',                                               icon: 'whatsapp'  },
  { id: 4, platform: 'Instagram', label: 'Instagram',           url: 'https://www.instagram.com/hannankhan',                                      icon: 'instagram' },
  { id: 5, platform: 'Email',     label: 'hannankhan@gmail.com',url: 'https://mail.google.com/mail/?view=cm&fs=1&to=hannankhan@gmail.com',        icon: 'mail'      },
];

export default async function Page() {
  // ── Fetch projects from DB ─────────────────────────────────────────────────
  let projects: Project[] = initialProjectsFallback as Project[];
  try {
    const rows = (await sql`
      SELECT id, title, description, stack, image, link, reversed, COALESCE(position, 0) as position
      FROM projects
      ORDER BY position ASC, id ASC
    `) as Project[];
    if (Array.isArray(rows) && rows.length > 0) {
      projects = rows;
    }
  } catch (err) {
    console.error('[Page] Failed to fetch projects from DB, using JSON fallback:', err);
  }

  // ── Fetch socials from DB ──────────────────────────────────────────────────
  let socials: SocialItem[] = defaultSocials;
  try {
    const rows = (await sql`
      SELECT id, platform, label, url, COALESCE(icon, '') as icon, COALESCE(position, 0) as position
      FROM socials
      ORDER BY position ASC, id ASC
    `) as SocialItem[];
    if (Array.isArray(rows) && rows.length > 0) {
      socials = rows;
    }
  } catch (err) {
    console.error('[Page] Failed to fetch socials from DB, using defaults:', err);
  }

  // ── Hand off to the client component ──────────────────────────────────────
  // The server has already rendered this component tree to HTML — Google reads
  // everything above this line statically. HomeClient hydrates on the client
  // and adds GSAP animations, the layout switcher, modal, etc.
  return (
    <HomeClient
      initialProjects={projects}
      initialSocials={socials}
    />
  );
}
