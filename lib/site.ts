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
  title: 'Hannan Khan | Full Stack Developer & UI/UX Specialist',
  description:
    'Personal portfolio of Hannan Khan, a Full Stack Developer building fast, scalable, and beautifully crafted digital products with Next.js, React, Node.js, and TypeScript.',
  url: getBaseUrl(),
  ogImage: '/assets/skillspill.png',
  author: {
    name: 'Hannan Khan',
    email: 'hannankhan@gmail.com',
    github: 'https://github.com/Hannankhan00',
    linkedin: 'https://www.linkedin.com/in/hannankhan',
    whatsapp: 'https://wa.me/923397197970',
  },
  keywords: [
    'Hannan Khan',
    'Hannan Khan Portfolio',
    'Full Stack Developer',
    'Full Stack Web Developer',
    'Next.js Developer',
    'React Developer',
    'Frontend Developer',
    'Software Engineer',
    'Web Developer Portfolio',
    'TypeScript Developer',
    'Tailwind CSS Developer',
    'GSAP Animation Specialist',
    'UI/UX Creative Developer',
    'SkillSpill',
    'Node.js Developer',
  ],
};
