'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DarkVeil from './components/DarkVeil';
import Header from './components/Header';
import ClickSpark from './components/ClickSpark';
import ProfileCard from './components/ProfileCard';
import initialProjects from '@/data/projects.json';
import { Scene } from './components/HeroScene';
import ChromaticTextIntro from './components/ChromaticTextIntro';
import HeroTerminalCard from './components/HeroTerminalCard';
import ProjectModal from './components/ProjectModal';



const skillsData = [
  {
    category: "Frontend",
    items: [
      { name: "JavaScript", icon: "https://cdn.simpleicons.org/javascript/F7DF1E", color: "#F7DF1E" },
      { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6", color: "#3178C6" },
      { name: "React", icon: "https://cdn.simpleicons.org/react/61DAFB", color: "#61DAFB" },
      { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/white", color: "#ffffff" },
      { name: "Tailwind CSS", icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4", color: "#06B6D4" },
      { name: "Sass", icon: "https://cdn.simpleicons.org/sass/CC6699", color: "#CC6699" },
      { name: "Bootstrap", icon: "https://cdn.simpleicons.org/bootstrap/7952B3", color: "#7952B3" },
      { name: "GSAP", icon: "https://cdn.simpleicons.org/greensock/88CE02", color: "#88CE02" },
      { name: "Framer Motion", icon: "https://cdn.simpleicons.org/framer/white", color: "#ffffff" },
    ]
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/5FA04E", color: "#5FA04E" },
      { name: "Express.js", icon: "https://cdn.simpleicons.org/express/white", color: "#ffffff" },
      { name: "Nest.js", icon: "https://cdn.simpleicons.org/nestjs/E0234E", color: "#E0234E" },
    ]
  },
  {
    category: "Database",
    items: [
      { name: "MySQL", icon: "https://cdn.simpleicons.org/mysql/4479A1", color: "#4479A1" },
      { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql/4169E1", color: "#4169E1" },
      { name: "MongoDB", icon: "https://cdn.simpleicons.org/mongodb/47A248", color: "#47A248" },
    ]
  }
];

type Project = {
  id: number | string;
  title: string;
  description: string;
  stack: string[];
  image: string;
  link: string;
  reversed: boolean;
  github?: string;
};

type SocialItem = {
  id: number | string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
};

const defaultSocials: SocialItem[] = [
  { id: 1, platform: 'GitHub', label: 'GitHub', url: 'https://github.com/Hannankhan00', icon: 'github' },
  { id: 2, platform: 'LinkedIn', label: 'LinkedIn', url: 'https://www.linkedin.com/in/hannankhan', icon: 'linkedin' },
  { id: 3, platform: 'WhatsApp', label: '+92 339 7197970', url: 'https://wa.me/923397197970', icon: 'whatsapp' },
  { id: 4, platform: 'Instagram', label: 'Instagram', url: 'https://www.instagram.com/hannankhan', icon: 'instagram' },
  { id: 5, platform: 'Email', label: 'hannankhan@gmail.com', url: 'https://mail.google.com/mail/?view=cm&fs=1&to=hannankhan@gmail.com', icon: 'mail' },
];

function renderSocialIcon(iconOrPlatform: string) {
  const key = (iconOrPlatform || '').toLowerCase().trim();
  if (key.includes('whats') || key.includes('wa')) {
    return (
      <svg
        className="connect-icon"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
        style={{ stroke: 'none' }}
        aria-label="WhatsApp"
      >
        <path d="M17.472 14.382c-.301-.15-1.767-.867-2.04-.966-.271-.101-.469-.15-.668.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.648.074-.3-.149-1.264-.462-2.408-1.477-.891-.795-1.493-1.777-1.666-2.074-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.01-1.42.25-.69.25-1.29.173-1.414zM12.04 2.004c-5.504 0-9.977 4.473-9.977 9.977 0 1.76.457 3.473 1.328 4.981l-1.41 5.15 5.27-1.382a9.92 9.92 0 0 0 4.789 1.228h.004c5.504 0 9.977-4.473 9.977-9.977a9.917 9.917 0 0 0-2.923-7.054 9.917 9.917 0 0 0-7.058-2.923zm0 18.333h-.003a8.27 8.27 0 0 1-4.218-1.155l-.302-.18-3.134.822.836-3.056-.197-.314a8.266 8.266 0 0 1-1.267-4.473c0-4.568 3.717-8.285 8.285-8.285a8.243 8.243 0 0 1 5.858 2.428 8.243 8.243 0 0 1 2.428 5.858c0 4.568-3.717 8.285-8.286 8.285z" />
      </svg>
    );
  }
  // Instagram (check before LinkedIn so 'in' doesn't match 'instagram')
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
  // LinkedIn
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

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(initialProjects as Project[]);
  const [socials, setSocials] = useState<SocialItem[]>(defaultSocials);
  const [layoutMode, setLayoutMode] = useState<'showcase' | 'grid'>('showcase');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleLayoutChange = (mode: 'showcase' | 'grid') => {
    if (mode === layoutMode) return;
    // Kill any active ScrollTriggers on projects before switching
    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars.trigger === '#projects' || (st.trigger && (st.trigger as HTMLElement).id === 'projects')) {
        st.kill(true);
      }
    });
    // Clear all GSAP inline styles on rows, visuals, contents, and the section container
    gsap.set('.project-row, .project-visual, .project-content, #projects', { clearProps: 'all' });
    setLayoutMode(mode);
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
  };

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch projects');
        return r.json();
      })
      .then((data: Project[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load projects from API, using fallback data:', err);
      });

    fetch('/api/socials')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch socials');
        return r.json();
      })
      .then((data: SocialItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSocials(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load socials from API, using fallback data:', err);
      });
  }, []);

  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // --- MAGNETIC BUTTON EFFECT ---
    const magneticBtns = document.querySelectorAll<HTMLElement>('.btn');
    const magneticStrength = 0.38;

    const magneticHandlers: Array<{
      el: HTMLElement;
      move: (e: MouseEvent) => void;
      leave: () => void;
    }> = [];

    magneticBtns.forEach(btn => {
      const onMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * magneticStrength;
        const dy = (e.clientY - cy) * magneticStrength;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      };

      const onLeave = () => {
        btn.style.transform = 'translate(0, 0)';
      };

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

  useEffect(() => {
    // --- GSAP ANIMATIONS LOGIC ---
    // Wrap in gsap.context to ensure correct cleanup on unmount
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Helper for consistent scroll triggers
        const getScrollTrigger = (trigger: string | Element, start = 'top 85%') => ({
          trigger,
          start,
          // play on enter, do nothing on leave, do nothing on enter back, reverse on leave back
          toggleActions: 'play none none reverse'
        });

        // Hero entrance sequence
        const heroTimeline = gsap.timeline({
          scrollTrigger: getScrollTrigger('#hero', 'top 95%'),
          defaults: {
            duration: 1.0,
            ease: 'power3.out'
          }
        });

        heroTimeline.fromTo('#hero-greeting',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.0, delay: 0.2 }
        );

        heroTimeline.fromTo('#hero-role',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.9 },
          '-=0.6'
        );

        heroTimeline.fromTo('#hero-summary',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9 },
          '-=0.6'
        );

        heroTimeline.fromTo('#hero-actions',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.6'
        );

        heroTimeline.fromTo('#hero-visual',
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' },
          '-=0.8'
        );

        // About Section
        gsap.fromTo('.about-text > *',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: getScrollTrigger('.about-text')
          }
        );

        gsap.fromTo('.about-card',
          { opacity: 0, scale: 0.9, y: 50 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: getScrollTrigger('.about-card')
          }
        );

        // Skills section stagger
        gsap.fromTo('.skill-category-title',
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: getScrollTrigger('#skills')
          }
        );

        gsap.fromTo('.skill-card',
          {
            opacity: 0,
            y: 30,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: getScrollTrigger('#skills')
          }
        );


        // Connect Section
        gsap.fromTo('.connect-section .section-title, .connect-text',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: getScrollTrigger('.connect-section')
          }
        );

        gsap.fromTo('.connect-row',
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: getScrollTrigger('.connect-links')
          }
        );

      });
    });

    // Refresh ScrollTrigger after elements have settled
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(timeout);
      ctx.revert();
    };
  }, []);

  // Dedicated effect for Projects GSAP animation (reacts when projects change or layout switches)
  useEffect(() => {
    if (!projects || projects.length === 0 || layoutMode !== 'showcase') return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const showcase = document.querySelector('.projects-showcase');
      const projectRows = gsap.utils.toArray('.project-row') as HTMLElement[];

      if (!showcase || projectRows.length === 0) return;

      const mm = gsap.matchMedia();

      // Desktop Pinned Scroll Animation
      mm.add("(min-width: 901px)", () => {
        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#projects',
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => '+=' + (window.innerHeight * projectRows.length),
          }
        });

        projectRows.forEach((row, i) => {
          const isReversed = row.classList.contains('reversed');
          const visual = row.querySelector('.project-visual');
          const content = row.querySelector('.project-content');

          // Set initial state for all rows
          gsap.set(row, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });

          if (i === 0) {
            // First row is visible immediately
            gsap.set(row, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
            if (visual) gsap.set(visual, { opacity: 1, scale: 1, y: 0 });
            if (content) gsap.set(content, { opacity: 1, x: 0 });
          } else {
            // Animate IN subsequent rows
            pinTl.to(row, { autoAlpha: 1, pointerEvents: 'auto', duration: 0.1 }, "+=0.2");
            if (visual) {
              pinTl.fromTo(visual,
                { opacity: 0, scale: 0.9, y: 80 },
                { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power2.out' },
                "<"
              );
            }
            if (content) {
              pinTl.fromTo(content,
                { opacity: 0, x: isReversed ? -80 : 80 },
                { opacity: 1, x: 0, duration: 1, ease: 'power2.out' },
                "<0.2"
              );
            }
          }

          // Animate OUT all rows except the last one
          if (i !== projectRows.length - 1) {
            if (visual) {
              pinTl.to(visual, { opacity: 0, scale: 0.95, y: -40, duration: 0.8, ease: 'power2.in' }, "+=1");
            }
            if (content) {
              pinTl.to(content, { opacity: 0, y: -20, duration: 0.8, ease: 'power2.in' }, "<");
            }
            pinTl.set(row, { pointerEvents: 'none', visibility: 'hidden' });
          }
        });

        return () => {
          gsap.set(projectRows, { clearProps: "all" });
          gsap.set('.project-visual, .project-content', { clearProps: "all" });
        };
      });

      // Mobile Standard Scroll Animation
      mm.add("(max-width: 900px)", () => {
        projectRows.forEach(row => {
          gsap.fromTo(row,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });
        return () => {
          gsap.set(projectRows, { clearProps: "all" });
        };
      });
    });

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [projects, layoutMode]);

  return (
    <ClickSpark
      sparkColor="#c084fc"
      sparkSize={14}
      sparkRadius={28}
      sparkCount={10}
      duration={450}
      easing="ease-out"
      extraScale={1.1}
    >
      <div style={{ overflowX: 'hidden', width: '100%', position: 'relative', minHeight: '100vh' }}>
        {/* DarkVeil — Fixed full-screen WebGL background */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
        >
          <DarkVeil
            hueShift={0}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={0.5}
            scanlineFrequency={0}
            warpAmount={0}
            resolutionScale={1}
          />
        </div>

        {/* Animated Grain Overlay */}
        <div className="grain-overlay" aria-hidden="true" />

        {/* Morphing Hamburger Header */}
        <Header />

        <main>
          {/* Hero Section */}
          <section id="hero" className="hero">
            <div className="section-container hero-container">
              <div className="hero-content">
                <h1 className="hero-greeting" id="hero-greeting">
                  Hi, I&apos;m{' '}
                  <span className="hero-name-wrapper">
                    <ChromaticTextIntro text="Hannan" className="hero-name-chromatic" />
                    <span className="hero-accent-dot">.</span>
                  </span>
                </h1>
                <h2 className="hero-role" id="hero-role">
                  I&apos;m a <span className="hero-role-highlight">Full Stack Developer</span><span className="hero-role-dot">.</span>
                </h2>
                <p className="hero-summary" id="hero-summary">
                  I build and scale high-performance, beautifully crafted web applications and digital products. Specialized in the modern JavaScript ecosystem—React, Next.js, and Node.js—with a deep focus on clean code, thoughtful architecture, and pixel-perfect UX. Let&apos;s connect!
                </p>
                <div className="hero-actions" id="hero-actions">
                  <a href="#connect" className="btn btn-outline hero-btn">
                    Let&apos;s Talk
                  </a>
                </div>
              </div>
              <div className="hero-visual" id="hero-visual">
                <HeroTerminalCard />
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="about-section">
            <div className="section-container about-container">
              {/* Left — text */}
              <div className="about-text">
                <h2 className="section-title">About Me</h2>
                <p className="about-body">
                  Hey! I&apos;m <strong>Hannan Khan</strong> a Full Stack Developer based in
                  Pakistan with a passion for building beautiful, high-performance digital
                  experiences from the ground up.
                </p>
                <p className="about-body">
                  I specialize in the modern JavaScript ecosystem. React, Next.js, Node.js
                  and care deeply about clean code, thoughtful UX, and pixel-perfect design.
                  Whether it&apos;s a sleek marketing site or a complex web application, I bring
                  the same level of craft and attention to every project.
                </p>
                <p className="about-body">
                  When I&apos;m not coding, you&apos;ll find me exploring new design trends,
                  tinkering with creative tech, or hunting for the perfect cup of chai.
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

              {/* Right — ProfileCard */}
              <div className="about-card">
                <ProfileCard
                  name="Hannan Khan"
                  title="Full Stack Developer"
                  handle="hannankhan"
                  status="Open to work ✦"
                  contactText="Hire Me"
                  avatarUrl="/assets/hannankhan.png"
                  showUserInfo={false}
                  enableTilt={true}
                  enableMobileTilt={false}
                  behindGlowEnabled={true}
                  behindGlowColor="rgba(168, 85, 247, 0.5)"
                  innerGradient="linear-gradient(145deg, #2d1b4e 0%, #1a1035 50%, #0f0a1e 100%)"
                  onContactClick={() => {
                    document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section id="skills" className="skills-section">
            <div className="section-container">
              <h2 className="section-title">What I Work With</h2>
              <div className="skills-container-new">
                {skillsData.map((category, idx) => (
                  <div key={idx} className="skill-category">
                    <h3 className="skill-category-title">{category.category}</h3>
                    <div className="skills-grid-new">
                      {category.items.map((skill, i) => (
                        <div 
                          key={i} 
                          className="skill-card"
                          style={{ '--hover-color': skill.color } as React.CSSProperties}
                        >
                          <img src={skill.icon} alt={skill.name} className="skill-icon" loading="lazy" />
                          <span className="skill-name">{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="projects-section">
            <div className="section-container">
              <div className="projects-header-row">
                <h2 className="section-title">Selected Work</h2>
                <div className="layout-switcher" role="group" aria-label="Project layout view">
                  <button
                    type="button"
                    className={`layout-switch-btn ${layoutMode === 'showcase' ? 'active' : ''}`}
                    onClick={() => handleLayoutChange('showcase')}
                    title="Showcase View"
                    aria-pressed={layoutMode === 'showcase'}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <span>Showcase</span>
                  </button>
                  <button
                    type="button"
                    className={`layout-switch-btn ${layoutMode === 'grid' ? 'active' : ''}`}
                    onClick={() => handleLayoutChange('grid')}
                    title="Grid View"
                    aria-pressed={layoutMode === 'grid'}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                    <span>Grid</span>
                  </button>
                </div>
              </div>

              {layoutMode === 'showcase' ? (
                <div className="projects-showcase">
                  {projects.map((project, index) => (
                    <article key={`showcase-${project.id ?? index}`} className={`project-row ${project.reversed ? 'reversed' : ''}`}>
                      <div className="project-visual">
                        <img
                          src={project.image || '/assets/corpulate.png'}
                          alt={project.title || 'Project'}
                          loading="eager"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('corpulate.png')) {
                              target.src = '/assets/corpulate.png';
                            }
                          }}
                        />
                      </div>
                      <div className="project-content">
                        <span className="project-num">0{index + 1} /</span>
                        <h3 className="project-name">{project.title}</h3>
                        <p className="project-desc">{project.description}</p>
                        <div className="project-stack">
                          {(project.stack || []).map((tech, i) => (
                            <span key={i} className="stack-tag">{tech}</span>
                          ))}
                        </div>
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline">View Project</a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.map((project, index) => (
                    <article
                      key={`grid-${project.id ?? index}`}
                      className="project-grid-card"
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="project-grid-preview-box">
                        <div className="project-grid-mockup">
                          <img
                            src={project.image || '/assets/corpulate.png'}
                            alt={project.title || 'Project'}
                            loading="eager"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('corpulate.png')) {
                                target.src = '/assets/corpulate.png';
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="project-grid-header">
                        <h3 className="project-grid-title">{project.title}</h3>
                        <span className="project-grid-divider" aria-hidden="true" />
                        <div className="project-grid-links" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={project.github || 'https://github.com/Hannankhan00'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-grid-icon-link"
                            title="GitHub"
                            aria-label={`${project.title} GitHub`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </a>
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-grid-icon-link"
                            title="Live Project"
                            aria-label={`${project.title} Live Link`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </div>
                      </div>

                      <div className="project-grid-stack">
                        {(project.stack || []).join(' - ')}
                      </div>

                      <p className="project-grid-desc">
                        {project.description}{' '}
                        <button
                          type="button"
                          className="project-grid-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                          }}
                        >
                          Learn more &gt;
                        </button>
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Connect Section */}
          <section id="connect" className="connect-section">
            <div className="section-container">
              <h2 className="section-title">Let's Connect</h2>
              <p className="connect-text">I'm open to internships, freelance projects, and collaborations.</p>

              <div className="connect-links" id="connect-links">
                {socials.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="connect-row"
                  >
                    {renderSocialIcon(soc.icon || soc.platform)}
                    <span className="connect-label">{soc.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="section-container footer-content">
            <p className="copyright">© 2026 Hannan Khan</p>
          </div>
        </footer>

        {/* Project Details Modal */}
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </ClickSpark>
  );
}
