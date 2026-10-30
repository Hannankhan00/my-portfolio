'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

type ExperienceItem = {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  is_current: boolean;
  tags: string[];
  highlights: string[];
  position: number;
};

const EMPTY_FORM = {
  role: '',
  company: '',
  period: '',
  description: '',
  is_current: false,
  tags: '', // comma separated
  points: [''], // bullet points, one input row each
};

const splitList = (value: string, separator: RegExp) =>
  value.split(separator).map((v) => v.trim()).filter(Boolean);

export default function ExperienceAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // One modal handles both adding (editing === null) and editing
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ExperienceItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Drag & drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/experience');
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      setItems(await res.json());
    } catch {
      showToast('Could not load experience', 'error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function openAddModal() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEditModal(item: ExperienceItem) {
    setEditing(item);
    setForm({
      role: item.role,
      company: item.company,
      period: item.period,
      description: item.description,
      is_current: item.is_current,
      tags: (item.tags ?? []).join(', '),
      points: item.highlights && item.highlights.length > 0 ? item.highlights : [''],
    });
    setShowModal(true);
  }

  function setPoint(index: number, value: string) {
    setForm((f) => ({ ...f, points: f.points.map((p, i) => (i === index ? value : p)) }));
  }

  function addPoint(afterIndex = form.points.length - 1) {
    setForm((f) => {
      const next = [...f.points];
      next.splice(afterIndex + 1, 0, '');
      return { ...f, points: next };
    });
    // focus the new row once it exists
    setTimeout(() => {
      document.querySelectorAll<HTMLInputElement>('.adm-point-input')[afterIndex + 1]?.focus();
    }, 0);
  }

  function removePoint(index: number) {
    setForm((f) => {
      const next = f.points.filter((_, i) => i !== index);
      return { ...f, points: next.length > 0 ? next : [''] };
    });
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(editing ? `/api/experience/${editing.id}` : '/api/experience', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: form.role,
          company: form.company,
          period: form.period,
          description: form.description,
          is_current: form.is_current,
          tags: splitList(form.tags, /,/),
          highlights: form.points.map((p) => p.trim()).filter(Boolean),
        }),
      });

      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? 'Failed to save experience', 'error');
        return;
      }

      showToast(editing ? 'Experience updated!' : 'Experience added successfully!');
      closeModal();
      fetchItems();
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: ExperienceItem) {
    if (!confirm(`Delete "${item.role} at ${item.company}"?`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/experience/${item.id}`, { method: 'DELETE' });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Experience deleted');
      fetchItems();
    } catch {
      showToast('Could not delete experience', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  // --- DRAG & DROP HANDLERS ---
  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDrop = async (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      handleDragEnd();
      return;
    }

    const updated = [...items];
    const [moved] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, moved);

    setItems(updated);
    handleDragEnd();

    try {
      const res = await fetch('/api/experience/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated.map((i) => i.id) }),
      });
      if (!res.ok) throw new Error('Failed to save order');
      showToast('Experience reordered!');
    } catch {
      showToast('Failed to save order', 'error');
      fetchItems();
    }
  };

  return (
    <div className="adm-root">
      <AdminSidebar activePage="experience" />

      <main className="adm-main">
        {toast && (
          <div className={`adm-toast adm-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
          </div>
        )}

        <header className="adm-header">
          <div>
            <h1 className="adm-page-title">Work Experience</h1>
            <p className="adm-page-sub">
              Manage the roles shown in your portfolio&apos;s Experience timeline
            </p>
          </div>
          <button type="button" className="adm-btn adm-btn--primary" onClick={openAddModal}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Experience
          </button>
        </header>

        <section className="adm-card">
          <h2 className="adm-card-title">
            <span className="adm-card-title-dot" />
            Current Experience ({items.length})
          </h2>

          {loading ? (
            <div className="adm-loading">
              <span className="adm-spinner adm-spinner--lg" />
              <span>Loading experience…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="adm-empty" style={{ flexDirection: 'column', gap: '1rem', padding: '3.5rem 0' }}>
              <p>No experience yet. Add your first role!</p>
              <button type="button" className="adm-btn adm-btn--primary" onClick={openAddModal}>
                + Add Experience
              </button>
            </div>
          ) : (
            <>
              <div className="adm-reorder-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                </svg>
                <span>Drag and drop using the grip handle to reorder. The top entry appears first on your site.</span>
              </div>

              <div className="adm-social-list">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`adm-social-card ${draggedIdx === idx ? 'dragging' : ''} ${dragOverIdx === idx ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={() => setDraggedIdx(idx)}
                    onDragEnter={() => setDragOverIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={handleDragEnd}
                    onDrop={() => handleDrop(idx)}
                  >
                    <div className="adm-drag-handle" title="Drag to reorder" draggable={false}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="5" r="1.5" fill="currentColor" />
                        <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="9" cy="19" r="1.5" fill="currentColor" />
                        <circle cx="15" cy="5" r="1.5" fill="currentColor" />
                        <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="15" cy="19" r="1.5" fill="currentColor" />
                      </svg>
                    </div>

                    <div className="adm-social-icon-box">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>

                    <div className="adm-social-info">
                      <div className="adm-social-platform">
                        {item.company}
                        {item.is_current && ' · Current'}
                      </div>
                      <div className="adm-social-label">{item.role}</div>
                      <div className="adm-social-url" style={{ pointerEvents: 'none' }}>{item.period}</div>
                    </div>

                    <div className="adm-row-actions">
                      <button className="adm-edit-btn" onClick={() => openEditModal(item)} title="Edit experience">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button
                        className="adm-delete-btn"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        title="Delete experience"
                      >
                        {deletingId === item.id ? <span className="adm-spinner" /> : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {showModal && (
        <div className="adm-modal-overlay" onClick={closeModal}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{editing ? 'Edit Experience' : 'Add New Experience'}</h2>
              <button type="button" className="adm-modal-close" onClick={closeModal} aria-label="Close">
                ✕
              </button>
            </div>

            <form className="adm-form" onSubmit={handleSubmit}>
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label className="adm-label" htmlFor="exp-role">Role <span className="adm-required">*</span></label>
                  <input
                    id="exp-role"
                    type="text"
                    className="adm-input"
                    placeholder="e.g. Full Stack Developer"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    required
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label" htmlFor="exp-company">Company <span className="adm-required">*</span></label>
                  <input
                    id="exp-company"
                    type="text"
                    className="adm-input"
                    placeholder="e.g. Canzova Digital"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    required
                  />
                </div>

                <div className="adm-field adm-field--full">
                  <label className="adm-label" htmlFor="exp-period">Period <span className="adm-required">*</span></label>
                  <input
                    id="exp-period"
                    type="text"
                    className="adm-input"
                    placeholder="e.g. Aug 2026 – Present"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    required
                  />
                </div>

                <div className="adm-field adm-field--full">
                  <label className="adm-label" htmlFor="exp-desc">Short summary (optional)</label>
                  <textarea
                    id="exp-desc"
                    className="adm-input adm-textarea"
                    placeholder="One or two lines about the role…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="adm-field adm-field--full">
                  <span className="adm-label">Bullet points (description &amp; achievements)</span>
                  <div className="adm-points">
                    {form.points.map((point, i) => (
                      <div key={i} className="adm-point-row">
                        <span className="adm-point-bullet" aria-hidden="true">✦</span>
                        <input
                          type="text"
                          className="adm-input adm-point-input"
                          placeholder={i === 0 ? 'e.g. Built and shipped a client dashboard' : 'Add another point…'}
                          value={point}
                          onChange={(e) => setPoint(i, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addPoint(i);
                            } else if (e.key === 'Backspace' && point === '' && form.points.length > 1) {
                              e.preventDefault();
                              removePoint(i);
                              setTimeout(() => {
                                document.querySelectorAll<HTMLInputElement>('.adm-point-input')[Math.max(i - 1, 0)]?.focus();
                              }, 0);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="adm-point-remove"
                          onClick={() => removePoint(i)}
                          aria-label={`Remove point ${i + 1}`}
                          title="Remove point"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="adm-btn adm-btn--ghost adm-point-add" onClick={() => addPoint()}>
                    + Add point
                  </button>
                  <span className="adm-point-hint">Press Enter for a new point. Empty points are ignored.</span>
                </div>

                <div className="adm-field adm-field--full">
                  <label className="adm-label" htmlFor="exp-tags">Tech used</label>
                  <input
                    id="exp-tags"
                    type="text"
                    className="adm-input"
                    placeholder="Comma separated, e.g. React, Next.js, Node.js"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  />
                </div>

                <div className="adm-field adm-field--full">
                  <label className="adm-toggle" htmlFor="exp-current">
                    <input
                      id="exp-current"
                      type="checkbox"
                      className="adm-toggle-input"
                      checked={form.is_current}
                      onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
                    />
                    <span className="adm-toggle-track" />
                    <span className="adm-toggle-label">
                      {form.is_current ? 'Current role (shows a green “live” badge)' : 'Past role'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="adm-form-actions">
                <button type="button" className="adm-btn adm-btn--ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={submitting}>
                  {submitting ? <span className="adm-spinner" /> : null}
                  {submitting ? 'Saving…' : editing ? 'Save Changes' : '+ Add Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
