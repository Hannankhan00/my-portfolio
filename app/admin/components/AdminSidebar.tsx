'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminSidebarProps {
  activePage?: 'projects' | 'socials';
}

export default function AdminSidebar({ activePage }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const current = activePage || (pathname?.includes('/socials') ? 'socials' : 'projects');

  async function handleLogout() {
    try {
      localStorage.removeItem('admin_user');
    } catch {}
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-logo">
        <img src="/assets/icon.png" alt="HK" className="adm-logo-img" />
        <div>
          <div className="adm-logo-name">Hannan Khan</div>
          <div className="adm-logo-role">Portfolio Admin</div>
        </div>
      </div>

      <nav className="adm-nav">
        <Link
          href="/admin"
          className={`adm-nav-link ${current === 'projects' ? 'active' : ''}`}
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
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Social Links
        </Link>

        <div className="adm-nav-divider" />

        <a href="/" target="_blank" rel="noopener noreferrer" className="adm-nav-link">
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
  );
}
