'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Only run client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!mounted) return;
    const handleClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mounted]);

  // Close on Escape
  useEffect(() => {
    if (!mounted) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mounted]);

  const isOpen = mounted && open;

  return (
    <div className="header-wrapper" ref={headerRef} suppressHydrationWarning>
      <div className={`header-morph${isOpen ? ' header-morph--open' : ''}`} suppressHydrationWarning>
        {/* Hamburger toggle button — always visible */}
        <button
          className="hamburger-btn"
          onClick={() => setOpen(prev => !prev)}
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isOpen}
          suppressHydrationWarning
        >
          <span className={`ham-bar ham-bar--top${isOpen ? ' ham-bar--top-open' : ''}`} />
          <span className={`ham-bar ham-bar--mid${isOpen ? ' ham-bar--mid-open' : ''}`} />
          <span className={`ham-bar ham-bar--bot${isOpen ? ' ham-bar--bot-open' : ''}`} />
        </button>

        {/* Nav content — fades/slides in when open */}
        <nav
          className={`morph-nav${isOpen ? ' morph-nav--visible' : ''}`}
          aria-hidden={isOpen ? 'false' : 'true'}
          suppressHydrationWarning
        >
          <a
            href="#"
            className="nav-logo"
            aria-label="Hannan Khan Home"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            <img src="/assets/iconn.png" alt="HK Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </a>
          <ul className="nav-links">
            <li>
              <a href="#skills" tabIndex={isOpen ? 0 : -1} onClick={() => setOpen(false)}>
                Skills
              </a>
            </li>
            <li>
              <a href="#projects" tabIndex={isOpen ? 0 : -1} onClick={() => setOpen(false)}>
                Work
              </a>
            </li>
            <li>
              <a href="#connect" tabIndex={isOpen ? 0 : -1} onClick={() => setOpen(false)}>
                Connect
              </a>
            </li>
          </ul>
          <a
            href="#connect"
            className="nav-cta"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            Let's Talk
          </a>
        </nav>
      </div>
    </div>
  );
}

