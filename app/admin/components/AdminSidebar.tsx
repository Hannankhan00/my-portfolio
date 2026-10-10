'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminSidebarProps {
  activePage?: 'projects' | 'socials';
}

export default function AdminSidebar({ activePage }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = activePage || (pathname?.includes('/socials') ? 'socials' : 'projects');

  // Auto-close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll on mobile when drawer is open & handle Escape key
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  async function handleLogout() {
    try {
      localStorage.removeItem('admin_user');
    } catch {}
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <>
      {/* Mobile Top App Bar (visible on screens <= 900px) */}
      <header className="adm-mobile-bar">
        <div className="adm-mobile-bar-brand">
          <img src="/assets/iconn.png" alt="HK" className="adm-logo-img" />
          <div className="adm-mobile-bar-text">
            <span className="adm-mobile-bar-title">Hannan Khan</span>
            <span className="adm-mobile-bar-subtitle">
              {current === 'projects' ? 'Projects' : 'Social Links'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="adm-mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
      </header>

      {/* Backdrop overlay on mobile */}
      {mobileOpen && (
        <div
          className="adm-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`adm-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="adm-sidebar-logo">
          <img src="/assets/iconn.png" alt="HK" className="adm-logo-img" />
          <div className="adm-sidebar-logo-text">
            <div className="adm-logo-name">Hannan Khan</div>
            <div className="adm-logo-role">Portfolio Admin</div>
          </div>
          <button
            type="button"
            className="adm-sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="adm-nav">
          <Link
            href="/admin"
            className={`adm-nav-link ${current === 'projects' ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Projects
          </Link>

          <Link
            href="/admin/socials"
            className={`adm-nav-link ${current === 'socials' ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Social Links
          </Link>

          <div className="adm-nav-divider" />

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="adm-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View Portfolio
          </a>
        </nav>

        <button className="adm-logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </aside>
    </>
  );
}
