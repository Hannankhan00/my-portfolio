'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';

const LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#projects' },
  { label: 'Connect', href: '#connect' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 0 });

  const toggle = () => {
    if (!open) {
      // The circle grows out of the button, so measure where it is right now
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 8;
        setOrigin({ x, y, r });
      }
    }
    setOpen((prev) => !prev);
  };

  const close = useCallback(() => setOpen(false), []);

  // Escape closes, and the page behind doesn't scroll while the menu is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open, close]);

  const goTo = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    close();
    // Scroll while the circle is still shrinking away
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`menu-btn${open ? ' menu-btn--open' : ''}`}
        onClick={toggle}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="site-menu"
      >
        <span className="menu-bar menu-bar--top" />
        <span className="menu-bar menu-bar--mid" />
        <span className="menu-bar menu-bar--bot" />
      </button>

      <div
        id="site-menu"
        className={`menu-overlay${open ? ' menu-overlay--open' : ''}`}
        style={{ '--cx': `${origin.x}px`, '--cy': `${origin.y}px`, '--r': `${origin.r}px` } as CSSProperties}
        inert={!open}
      >
        <a href="#hero" className="menu-logo" aria-label="Hannan Khan, home" onClick={(e) => goTo(e, '#hero')}>
          <img src="/assets/iconn.png" alt="" />
        </a>

        <nav className="menu-nav" aria-label="Main">
          <ul className="menu-list">
            {LINKS.map((link, i) => (
              <li key={link.href} className="menu-item" style={{ '--i': i } as CSSProperties}>
                <a href={link.href} className="menu-link" onClick={(e) => goTo(e, link.href)}>
                  <span className="menu-link-num">0{i + 1}</span>
                  <span className="menu-link-inner">{link.label}</span>
                  <span className="menu-link-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="menu-footer" style={{ '--i': LINKS.length } as CSSProperties}>
          <span className="menu-footer-text">Hannan Khan · Full Stack Developer</span>
          <a
            href="https://wa.me/923397197970"
            target="_blank"
            rel="noopener noreferrer"
            className="menu-cta"
            onClick={close}
          >
            Let&apos;s Talk
          </a>
        </div>
      </div>
    </>
  );
}
