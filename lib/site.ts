/**
 * Site configuration and SEO constants for Hannan Khan's portfolio.
 * Used across sitemap.ts, robots.ts, and root metadata.
 */

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '');
  }
  // Default fallback URL (matching Vercel production canonical domain)
  return 'https://www.hannankhan.dev';
};

export const siteConfig = {
  name: 'Hannan Khan',
  // Title: name first so it renders prominently in SERPs even when truncated.
  title: 'Hannan Khan — Full Stack Developer & UI/UX Specialist',
  // Description: written to maximise CTR from position 5.
  // – States WHO (Hannan Khan), WHAT (Full Stack Developer), WHERE (Pakistan)
  // – Includes a clear value prop and a soft CTA.
  description:
    'Hannan Khan is a Full Stack Developer from Pakistan building fast web apps with Next.js, React, and Node.js. View projects and get in touch.',
  url: getBaseUrl(),
  // ogImage: Use a branded 1200×630 photo of yourself for Google Image results.
  // Replace this file with your actual branded OG photo.
  ogImage: '/assets/og-hannankhan.png',
  author: {
    name: 'Hannan Khan',
    email: 'hannankhan@gmail.com',
    github: 'https://github.com/Hannankhan00',
    linkedin: 'https://www.linkedin.com/in/hannankhan',
    instagram: 'https://www.instagram.com/hannankhan',
    whatsapp: 'https://wa.me/923397197970',
  },
  keywords: [
    'Hannan Khan',
    'Hannan Khan Portfolio',
    'Hannan Khan Developer',
    'Full Stack Developer Pakistan',
    'Full Stack Web Developer',
    'Next.js Developer',
    'React Developer',
    'Frontend Developer',
    'Software Engineer Pakistan',
    'Web Developer Portfolio',
    'TypeScript Developer',
    'Tailwind CSS Developer',
    'GSAP Animation Specialist',
    'UI/UX Creative Developer',
    'SkillSpill',
    'Node.js Developer',
  ],
};
