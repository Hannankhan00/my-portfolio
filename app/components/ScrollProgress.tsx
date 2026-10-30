'use client';

import { useEffect, useRef, useState } from 'react';

type Section = { id: string; label: string };

/**
 * A thin progress line along the top of the page, plus a dot rail on the right
 * edge that shows which section you're in and jumps to any of them.
 */
export default function ScrollProgress({ sections }: { sections: Section[] }) {
  const barRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(sections[0]?.id ?? '');

  // Progress line
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Which section sits on the middle of the screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -54% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <div ref={barRef} className="scroll-progress-bar" />
      </div>

      <nav className="section-rail" aria-label="Page sections">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`section-rail-dot${active === id ? ' active' : ''}`}
            onClick={() => goTo(id)}
            aria-label={`Go to ${label}`}
            aria-current={active === id ? 'true' : undefined}
          >
            <span className="section-rail-label">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
