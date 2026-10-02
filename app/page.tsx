'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DarkVeil from './components/DarkVeil';
import Header from './components/Header';
import ClickSpark from './components/ClickSpark';
import ProfileCard from './components/ProfileCard';
import initialProjects from '@/data/projects.json';

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
  { id: 3, platform: 'Instagram', label: 'Instagram', url: 'https://www.instagram.com/hannankhan', icon: 'instagram' },
  { id: 4, platform: 'Email', label: 'hannankhan@gmail.com', url: 'https://mail.google.com/mail/?view=cm&fs=1&to=hannankhan@gmail.com', icon: 'mail' },
];

function renderSocialIcon(iconOrPlatform: string) {
  const key = (iconOrPlatform || '').toLowerCase().trim();
  if (key.includes('git')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    );
  }
  if (key.includes('link') || key.includes('in')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  if (key.includes('insta')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0" fill="currentColor" stroke="none" />
        <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes('mail') || key.includes('email') || key.includes('gmail')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    );
  }
  if (key.includes('twit') || key === 'x' || key.includes('x ')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    );
  }
  if (key.includes('tube')) {
    return (
      <svg className="connect-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
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
            duration: 1.2,
            ease: 'power3.out'
          }
        });

        heroTimeline.fromTo('#hero-name',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0 }
        );

        heroTimeline.fromTo('#hero-subtitle',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0 },
          '-=1.0'
        );

        heroTimeline.fromTo('#hero-actions',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0 },
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

  // Dedicated effect for Projects GSAP animation (reacts when projects change)
  useEffect(() => {
    if (!projects || projects.length === 0) return;

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
  }, [projects]);

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
            <div className="hero-content">
              <h1 className="hero-name" id="hero-name">Hannan Khan</h1>
              <p className="hero-subtitle" id="hero-subtitle">
                Full Stack Developer · Building end-to-end digital products that are fast, scalable, and beautifully crafted
              </p>
              <div className="hero-actions" id="hero-actions">
                <a href="#projects" className="btn btn-outline">View My Work</a>
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
              <h2 className="section-title">Selected Work</h2>
              <div className="projects-showcase">
                {projects.map((project, index) => (
                  <article key={project.id ?? index} className={`project-row ${project.reversed ? 'reversed' : ''}`}>
                    <div className="project-visual">
                      <img src={project.image} alt={project.title} loading="lazy" />
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
      </div>
    </ClickSpark>
  );
}
