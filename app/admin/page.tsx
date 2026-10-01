'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './admin.css';

type Project = {
  id: number;
  title: string;
  description: string;
  stack: string[];
  image: string;
  link: string;
  reversed: boolean;
};

const EMPTY_FORM = {
  title: '',
  description: '',
  stack: '',
  image: '',
  link: '',
  reversed: false,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      setProjects(await res.json());
    } catch {
      showToast('Could not load projects', 'error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        stack: form.stack.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? 'Failed to add project', 'error');
        return;
      }
      showToast('Project added successfully!');
      setForm(EMPTY_FORM);
      fetchProjects();
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to delete');
      showToast(`"${title}" deleted`);
      fetchProjects();
    } catch {
      showToast('Could not delete project', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="adm-root">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <img src="/assets/icon.png" alt="HK" className="adm-logo-img" />
          <div>
            <div className="adm-logo-name">Hannan Khan</div>
            <div className="adm-logo-role">Portfolio Admin</div>
          </div>
        </div>

        <nav className="adm-nav">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-nav-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            View Portfolio
          </a>
        </nav>

        <button className="adm-logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="adm-main">
        {/* Toast */}
        {toast && (
          <div className={`adm-toast adm-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
          </div>
        )}

        {/* Page header */}
        <header className="adm-header">
          <div>
            <h1 className="adm-page-title">Projects</h1>
            <p className="adm-page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} in portfolio</p>
          </div>
        </header>

        {/* Add Project Form */}
        <section className="adm-card">
          <h2 className="adm-card-title">
            <span className="adm-card-title-dot" />
            Add New Project
          </h2>

          <form className="adm-form" onSubmit={handleAdd}>
            <div className="adm-form-grid">
              {/* Title */}
              <div className="adm-field adm-field--full">
                <label htmlFor="proj-title" className="adm-label">Project Title <span className="adm-required">*</span></label>
                <input
                  id="proj-title"
                  type="text"
                  className="adm-input"
                  placeholder="e.g. My Awesome App"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="adm-field adm-field--full">
                <label htmlFor="proj-desc" className="adm-label">Description <span className="adm-required">*</span></label>
                <textarea
                  id="proj-desc"
                  className="adm-input adm-textarea"
                  placeholder="Describe what this project does, the problem it solves, or key features..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {/* Stack */}
              <div className="adm-field">
                <label htmlFor="proj-stack" className="adm-label">Tech Stack</label>
                <input
                  id="proj-stack"
                  type="text"
                  className="adm-input"
                  placeholder="Next.js, TypeScript, MySQL (comma-separated)"
                  value={form.stack}
                  onChange={(e) => setForm({ ...form, stack: e.target.value })}
                />
                <span className="adm-hint">Separate each technology with a comma</span>
              </div>

              {/* Image path */}
              <div className="adm-field">
                <label htmlFor="proj-image" className="adm-label">Image Path</label>
                <input
                  id="proj-image"
                  type="text"
                  className="adm-input"
                  placeholder="/assets/my-project.png"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                <span className="adm-hint">Upload file to /public/assets/ first</span>
              </div>

              {/* Link */}
              <div className="adm-field">
                <label htmlFor="proj-link" className="adm-label">Live URL <span className="adm-required">*</span></label>
                <input
                  id="proj-link"
                  type="url"
                  className="adm-input"
                  placeholder="https://myproject.com"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  required
                />
              </div>

              {/* Reversed layout */}
              <div className="adm-field adm-field--toggle">
                <label className="adm-label">Layout</label>
                <label className="adm-toggle" htmlFor="proj-reversed">
                  <input
                    id="proj-reversed"
                    type="checkbox"
                    className="adm-toggle-input"
                    checked={form.reversed}
                    onChange={(e) => setForm({ ...form, reversed: e.target.checked })}
                  />
                  <span className="adm-toggle-track" />
                  <span className="adm-toggle-label">
                    {form.reversed ? 'Image on right (reversed)' : 'Image on left (default)'}
                  </span>
                </label>
              </div>
            </div>

            <div className="adm-form-actions">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setForm(EMPTY_FORM)}>
                Clear
              </button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={submitting}>
                {submitting ? <span className="adm-spinner" /> : null}
                {submitting ? 'Adding…' : '+ Add Project'}
              </button>
            </div>
          </form>
        </section>

        {/* Projects list */}
        <section className="adm-card">
          <h2 className="adm-card-title">
            <span className="adm-card-title-dot" />
            Current Projects
          </h2>

          {loading ? (
            <div className="adm-loading">
              <span className="adm-spinner adm-spinner--lg" />
              <span>Loading projects…</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="adm-empty">No projects yet. Add one above!</div>
          ) : (
            <div className="adm-project-list">
              {projects.map((proj, idx) => (
                <div key={proj.id} className="adm-project-row">
                  <div className="adm-project-num">0{idx + 1}</div>

                  {proj.image && (
                    <img
                      src={proj.image}
                      alt={proj.title}
                      className="adm-project-thumb"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}

                  <div className="adm-project-info">
                    <h3 className="adm-project-title">{proj.title}</h3>
                    <p className="adm-project-desc">{proj.description}</p>

                    {proj.stack.length > 0 && (
                      <div className="adm-project-stack">
                        {proj.stack.map((tech) => (
                          <span key={tech} className="adm-tag">{tech}</span>
                        ))}
                      </div>
                    )}

                    <div className="adm-project-meta">
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="adm-project-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        {proj.link}
                      </a>
                      <span className="adm-badge">{proj.reversed ? 'Reversed' : 'Default'} layout</span>
                    </div>
                  </div>

                  <button
                    className="adm-delete-btn"
                    onClick={() => handleDelete(proj.id, proj.title)}
                    disabled={deletingId === proj.id}
                    title="Delete project"
                  >
                    {deletingId === proj.id ? <span className="adm-spinner" /> : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
