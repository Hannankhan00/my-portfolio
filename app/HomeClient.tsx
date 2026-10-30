'use client';

import { useEffect, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DarkVeil from './components/DarkVeil';
import Header from './components/Header';
import JellyCursor from './components/JellyCursor';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import ContactForm from './components/ContactForm';
import ProfileCard from './components/ProfileCard';
import dynamic from 'next/dynamic';
import ChromaticTextIntro from './components/ChromaticTextIntro';
import HeroTechSphere from './components/HeroTechSphere';
import HeroTypewriter from './components/HeroTypewriter';

const ProjectModal = dynamic(() => import('./components/ProjectModal'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

export type Project = {
  id: number | string;
  title: string;
  description: string;
  stack: string[];
  image: string;
  link: string;
  reversed: boolean;
  github?: string;
};

export type SocialItem = {
  id: number | string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
};

export type ExperienceItem = {
  id: number | string;
  role: string;
  company: string;
  period: string;
  description: string;
  is_current: boolean;
  tags?: string[];
  highlights?: string[];
};

// ─── Skill data (static – no need to come from DB) ────────────────────────────

const skillsData = [
  {
    category: 'Frontend',
    items: [
      { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E', color: '#F7DF1E' },
      { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/3178C6', color: '#3178C6' },
      { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB', color: '#61DAFB' },
      { name: 'Next.js', icon: 'https://cdn.simpleicons.org/nextdotjs/white', color: '#ffffff' },
      { name: 'Tailwind CSS', icon: 'https://cdn.simpleicons.org/tailwindcss/06B6D4', color: '#06B6D4' },
      { name: 'Sass', icon: 'https://cdn.simpleicons.org/sass/CC6699', color: '#CC6699' },
      { name: 'Bootstrap', icon: 'https://cdn.simpleicons.org/bootstrap/7952B3', color: '#7952B3' },
      { name: 'GSAP', icon: 'https://cdn.simpleicons.org/greensock/88CE02', color: '#88CE02' },
      { name: 'Framer Motion', icon: 'https://cdn.simpleicons.org/framer/white', color: '#ffffff' },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/5FA04E', color: '#5FA04E' },
      { name: 'Express.js', icon: 'https://cdn.simpleicons.org/express/white', color: '#ffffff' },
      { name: 'Nest.js', icon: 'https://cdn.simpleicons.org/nestjs/E0234E', color: '#E0234E' },
    ],
  },
  {
    category: 'Database',
    items: [
      { name: 'MySQL', icon: 'https://cdn.simpleicons.org/mysql/4479A1', color: '#4479A1' },
      { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql/4169E1', color: '#4169E1' },
      { name: 'MongoDB', icon: 'https://cdn.simpleicons.org/mongodb/47A248', color: '#47A248' },
    ],
  },
];

// ─── Social icon renderer ─────────────────────────────────────────────────────

function renderSocialIcon(iconOrPlatform: string) {
  const key = (iconOrPlatform || '').toLowerCase().trim();
  if (key.includes('whats') || key.includes('wa')) {
    return (
      <svg
        className="connect-icon"
        viewBox="1.8 1.8 20.4 20.4"
        width="24"
        height="24"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="WhatsApp"
      >
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </svg>
    );
  }
  if (key.includes('insta')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-label="Instagram">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
      </svg>
    );
  }
  if (key.includes('git')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-label="GitHub">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    );
  }
  if (key.includes('linkedin') || key === 'in' || key === 'li') {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-label="LinkedIn">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  if (key.includes('mail') || key.includes('email') || key.includes('gmail')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-label="Email">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    );
  }
  if (key.includes('twit') || key === 'x' || key.includes('x ')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-label="Twitter / X">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    );
  }
  if (key.includes('tube')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-label="YouTube">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes('discord')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-label="Discord">
        <path d="M18 6h0a14.5 14.5 0 0 0-4-1.2 12.6 12.6 0 0 0-.6 1.2 13.9 13.9 0 0 0-4.8 0 12.6 12.6 0 0 0-.6-1.2A14.5 14.5 0 0 0 4 6c-2.4 3.6-3 7-3 10.5a14.8 14.8 0 0 0 4.5 2.3c.4-.5.7-1.1 1-1.7-.5-.2-1-.4-1.5-.7.1-.1.2-.2.4-.3 3 .1 6 .1 9 0 .1.1.3.2.4.3-.5.3-1 .5-1.5.7.3.6.6 1.2 1 1.7a14.8 14.8 0 0 0 4.5-2.3c0-4.3-.8-7.7-2.8-10.5z" />
        <circle cx="8.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (key.includes('link')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    );
  }
  return (
    <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HomeClientProps {
  initialProjects: Project[];
  initialSocials: SocialItem[];
  initialExperience: ExperienceItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomeClient({ initialProjects, initialSocials, initialExperience }: HomeClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [socials, setSocials] = useState<SocialItem[]>(initialSocials);
  const [experience, setExperience] = useState<ExperienceItem[]>(initialExperience);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // ── Refresh data in background (keeps admin edits live without blocking SSR) ──
  useEffect(() => {
    fetch('/api/projects')
      .then((r) => { if (!r.ok) throw new Error('Failed to fetch projects'); return r.json(); })
      .then((data: Project[]) => { if (Array.isArray(data) && data.length > 0) setProjects(data); })
      .catch((err) => console.error('Background project refresh failed:', err));

    fetch('/api/experience')
      .then((r) => { if (!r.ok) throw new Error('Failed to fetch experience'); return r.json(); })
      .then((data: ExperienceItem[]) => { if (Array.isArray(data)) setExperience(data); })
      .catch((err) => console.error('Background experience refresh failed:', err));

    fetch('/api/socials')
      .then((r) => { if (!r.ok) throw new Error('Failed to fetch socials'); return r.json(); })
      .then((data: SocialItem[]) => { if (Array.isArray(data) && data.length > 0) setSocials(data); })
      .catch((err) => console.error('Background socials refresh failed:', err));
  }, []);

  // ── Magnetic button effect ─────────────────────────────────────────────────
  useEffect(() => {
    const magneticBtns = document.querySelectorAll<HTMLElement>('.btn');
    const magneticStrength = 0.38;
    const magneticHandlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];

    magneticBtns.forEach((btn) => {
      const onMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        btn.style.transform = `translate(${(e.clientX - cx) * magneticStrength}px, ${(e.clientY - cy) * magneticStrength}px)`;
      };
      const onLeave = () => { btn.style.transform = 'translate(0, 0)'; };
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      magneticHandlers.push({ el: btn, move: onMove, leave: onLeave });
    });

    return () => {
      magneticHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, []);

  // ── GSAP scroll animations ─────────────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const getScrollTrigger = (trigger: string | Element, start = 'top 85%') => ({
          trigger,
          start,
          toggleActions: 'play none none reverse',
        });

        // Hero entrance
        const heroTimeline = gsap.timeline({
          scrollTrigger: getScrollTrigger('#hero', 'top 95%'),
          defaults: { duration: 1.0, ease: 'power3.out' },
        });
        heroTimeline
          .from('#hero-greeting', { y: 20, duration: 0.7, ease: 'power2.out' })
          .from('#hero-role', { y: 16, duration: 0.6, ease: 'power2.out' }, '-=0.4')
          .from('#hero-summary', { opacity: 0.3, y: 14, duration: 0.6, ease: 'power2.out' }, '-=0.4')
          .from('#hero-actions', { opacity: 0.2, y: 10, duration: 0.5, ease: 'power2.out' }, '-=0.4')
          .from('#hero-visual', { opacity: 0.3, scale: 0.94, duration: 0.8, ease: 'power2.out' }, '-=0.5');

        // About
        gsap.fromTo('.about-text > *', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', scrollTrigger: getScrollTrigger('.about-text') });
        gsap.fromTo('.about-card', { opacity: 0, scale: 0.9, y: 50 }, { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: getScrollTrigger('.about-card') });

        // Experience
        gsap.fromTo('.experience-line-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.experience-timeline', start: 'top 65%', end: 'bottom 65%', scrub: true } });
        gsap.fromTo('.experience-item', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.2, ease: 'power3.out', scrollTrigger: getScrollTrigger('#experience') });

        // Skills
        gsap.fromTo('.skill-category-title', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out', scrollTrigger: getScrollTrigger('#skills') });
        gsap.fromTo('.skill-card', { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.05, ease: 'power2.out', scrollTrigger: getScrollTrigger('#skills') });

        // Connect
        gsap.fromTo('.connect-section .section-title, .connect-text', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', scrollTrigger: getScrollTrigger('.connect-section') });
        gsap.fromTo('.connect-row', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: getScrollTrigger('.connect-links') });
      });
    });

    const timeout = setTimeout(() => { ScrollTrigger.refresh(); }, 500);
    return () => { clearTimeout(timeout); ctx.revert(); };
  }, []);

  const railSections = useMemo(
    () => [
      { id: 'hero', label: 'Home' },
      { id: 'about', label: 'About' },
      ...(experience.length > 0 ? [{ id: 'experience', label: 'Experience' }] : []),
      { id: 'skills', label: 'Skills' },
      { id: 'projects', label: 'Projects' },
      { id: 'connect', label: 'Connect' },
    ],
    [experience.length]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <JellyCursor />
      <ScrollProgress sections={railSections} />
      <BackToTop />
      <div style={{ overflowX: 'hidden', width: '100%', position: 'relative', minHeight: '100vh' }}>
        {/* WebGL Background */}
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: -1 }}>
          <DarkVeil hueShift={0} noiseIntensity={0} scanlineIntensity={0} speed={0.5} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
        </div>

        <div className="grain-overlay" aria-hidden="true" />
        <Header />

        <main>
          {/* ── Hero ────────────────────────────────────────────────────── */}
          <section id="hero" className="hero">
            <div className="section-container hero-container">
              <div className="hero-content">
                <h1 className="hero-greeting" id="hero-greeting">
                  <span className="hero-hi">Hi, I&apos;m</span>
                  <span className="hero-name-wrapper">
                    <ChromaticTextIntro text="Hannan Khan" className="hero-name-chromatic" />
                    <span className="hero-accent-dot">.</span>
                  </span>
                </h1>
                <h2 className="hero-role" id="hero-role">
                  I&apos;m a <span className="hero-role-highlight">Full Stack Developer</span><span className="hero-role-dot">.</span>
                </h2>
                <p className="hero-summary" id="hero-summary">
                  <HeroTypewriter />
                </p>
                <div className="hero-actions" id="hero-actions">
                  <a href="https://wa.me/923397197970" target="_blank" rel="noopener noreferrer" className="btn btn-outline hero-btn">Let&apos;s Talk</a>
                </div>
              </div>
              <div className="hero-visual" id="hero-visual">
                <HeroTechSphere />
              </div>
            </div>
            <a href="#about" className="hero-scroll" aria-label="Scroll to About">
              <span className="hero-scroll-text">Scroll</span>
              <span className="hero-scroll-line" aria-hidden="true" />
            </a>
          </section>

          {/* ── About ───────────────────────────────────────────────────── */}
          <section id="about" className="about-section">
            <div className="section-container about-container">
              <div className="about-text">
                <h2 className="section-title">About Me</h2>
                <p className="about-body">
                  Hey! I&apos;m <strong>Hannan Khan</strong>, a Full Stack Developer based in Pakistan with a passion for building beautiful, high-performance digital experiences from the ground up.
                </p>
                <p className="about-body">
                  I specialize in the modern JavaScript ecosystem. React, Next.js, Node.js and care deeply about clean code, thoughtful UX, and pixel-perfect design. Whether it&apos;s a sleek marketing site or a complex web application, I bring the same level of craft and attention to every project.
                </p>
                <p className="about-body">
                  When I&apos;m not coding, you&apos;ll find me exploring new design trends, tinkering with creative tech, or hunting for the perfect cup of chai.
                </p>
                <div className="about-stats">
                  <div className="about-stat">
                    <span className="about-stat-num">2+</span>
                    <span className="about-stat-label">Years experience</span>
                  </div>
                  <div className="about-stat">
                    <span className="about-stat-num">15+</span>
                    <span className="about-stat-label">Projects shipped</span>
                  </div>
                  <div className="about-stat">
                    <span className="about-stat-num">10+</span>
                    <span className="about-stat-label">Technologies</span>
                  </div>
                </div>
              </div>
              <div className="about-card">
                <ProfileCard
                  name="Hannan Khan"
                  title="Full Stack Developer"
                  handle="hannankhan"
                  status="Open to work ✦"
                  contactText="Hire Me"
                  avatarUrl="/assets/hannankhan.webp"
                  showUserInfo={false}
                  enableTilt={true}
                  enableMobileTilt={false}
                  behindGlowEnabled={true}
                  behindGlowColor="rgba(168, 85, 247, 0.5)"
                  innerGradient="linear-gradient(145deg, #2d1b4e 0%, #1a1035 50%, #0f0a1e 100%)"
                  onContactClick={() => { document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' }); }}
                />
              </div>
            </div>
          </section>

          {/* ── Experience ──────────────────────────────────────────────── */}
          {experience.length > 0 && (
          <section id="experience" className="experience-section">
            <div className="section-container">
              <h2 className="section-title">Experience</h2>
              <div className="experience-timeline">
                <div className="experience-line" aria-hidden="true">
                  <div className="experience-line-fill" />
                </div>
                <ol className="experience-list">
                {experience.map((job) => (
                  <li key={job.id} className="experience-item">
                    <span className="experience-marker" aria-hidden="true" />
                    <div className="experience-card">
                      <div className="experience-head">
                        <div>
                          <h3 className="experience-role">{job.role}</h3>
                          <p className="experience-company">{job.company}</p>
                        </div>
                        <span className={`experience-period ${job.is_current ? 'current' : ''}`}>
                          {job.is_current && <span className="experience-live-dot" aria-hidden="true" />}
                          {job.period}
                        </span>
                      </div>
                      {job.description && <p className="experience-desc">{job.description}</p>}
                      {job.highlights && job.highlights.length > 0 && (
                        <ul className="experience-highlights">
                          {job.highlights.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      )}
                      {job.tags && job.tags.length > 0 && (
                        <ul className="experience-tags" aria-label="Technologies used">
                          {job.tags.map((t) => <li key={t} className="experience-tag">{t}</li>)}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
                </ol>
              </div>
            </div>
          </section>
          )}

          {/* ── Skills ──────────────────────────────────────────────────── */}
          <section id="skills" className="skills-section">
            <div className="section-container">
              <h2 className="section-title">Skills &amp; Technologies</h2>
              <div className="skills-container-new">
                {skillsData.map((category, idx) => (
                  <div key={idx} className="skill-category">
                    <h3 className="skill-category-title">{category.category}</h3>
                    <div className="skills-grid-new">
                      {category.items.map((skill, i) => (
                        <div key={i} className="skill-card" style={{ '--hover-color': skill.color } as React.CSSProperties}>
                          <img src={skill.icon} alt={`${skill.name} — Hannan Khan Tech Stack`} className="skill-icon" loading="lazy" />
                          <span className="skill-name">{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Projects ────────────────────────────────────────────────── */}
          <section id="projects" className="projects-section">
            <div className="section-container">
              <div className="projects-header-row">
                <h2 className="section-title">Projects</h2>
              </div>

                <div className="projects-grid">
                  {projects.map((project, index) => (
                    <article key={`grid-${project.id ?? index}`} className="project-grid-card" onClick={() => setSelectedProject(project)}>
                      <div className="project-grid-preview-box">
                        <div className="project-grid-mockup">
                          <img
                            src={project.image || '/assets/corpulate.png'}
                            alt={`${project.title} — project by Hannan Khan`}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('corpulate.png')) target.src = '/assets/corpulate.png';
                            }}
                          />
                        </div>
                      </div>
                      <div className="project-grid-header">
                        <h3 className="project-grid-title">{project.title}</h3>
                        <span className="project-grid-divider" aria-hidden="true" />
                        <div className="project-grid-links" onClick={(e) => e.stopPropagation()}>
                          <a href={project.github || 'https://github.com/Hannankhan00'} target="_blank" rel="noopener noreferrer" className="project-grid-icon-link" title="GitHub" aria-label={`${project.title} GitHub`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </a>
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-grid-icon-link" title="Live Project" aria-label={`${project.title} Live Link`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </div>
                      </div>
                      <div className="project-grid-stack">{(project.stack || []).join(' - ')}</div>
                      <p className="project-grid-desc">
                        {project.description}{' '}
                        <button type="button" className="project-grid-more-btn" onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}>
                          Learn more &gt;
                        </button>
                      </p>
                    </article>
                  ))}
                </div>
            </div>
          </section>

          {/* ── Connect ─────────────────────────────────────────────────── */}
          <section id="connect" className="connect-section">
            <div className="section-container">
              <h2 className="section-title">Let&apos;s Connect</h2>
              <div className="connect-layout">
                <div className="connect-info">
                  <p className="connect-text">I&apos;m open to internships, freelance projects, and collaborations.</p>
                  <div className="connect-links" id="connect-links">
                    {socials.map((soc) => (
                      <a key={soc.id} href={soc.url} target="_blank" rel="noopener noreferrer" className="connect-row">
                        {renderSocialIcon(soc.icon || soc.platform)}
                        <span className="connect-label">{soc.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
                <ContactForm />
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="section-container footer-content">
            <p className="copyright">© 2026 Hannan Khan</p>
          </div>
        </footer>

        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      </div>
    </>
  );
}
