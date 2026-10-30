'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

type Status = 'new' | 'contacted' | 'in_progress' | 'won' | 'lost';

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  budget: string;
  message: string;
  notes: string;
  status: Status;
  position: number;
  created_at: string;
};

const COLUMNS: { status: Status; label: string; color: string }[] = [
  { status: 'new', label: 'New', color: '#c084fc' },
  { status: 'contacted', label: 'Contacted', color: '#60a5fa' },
  { status: 'in_progress', label: 'In Progress', color: '#fbbf24' },
  { status: 'won', label: 'Won', color: '#34d399' },
  { status: 'lost', label: 'Lost', color: '#f87171' },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  source: '',
  budget: '',
  message: '',
  notes: '',
  status: 'new' as Status,
};

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LeadsAdminPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // One modal for adding (editing === null) and editing
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Drag & drop
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [overColumn, setOverColumn] = useState<Status | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      setLeads(await res.json());
    } catch {
      showToast('Could not load leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Cards per column, in saved order, narrowed by the search box
  const board = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = (l: Lead) =>
      !q || [l.name, l.email, l.phone, l.source, l.budget].some((v) => v.toLowerCase().includes(q));

    const out = {} as Record<Status, Lead[]>;
    COLUMNS.forEach(({ status }) => {
      out[status] = leads
        .filter((l) => l.status === status && matches(l))
        .sort((a, b) => a.position - b.position || b.id - a.id);
    });
    return out;
  }, [leads, search]);

  const counts = useMemo(() => {
    const won = leads.filter((l) => l.status === 'won').length;
    const lost = leads.filter((l) => l.status === 'lost').length;
    return { total: leads.length, active: leads.length - won - lost, won, lost };
  }, [leads]);

  // --- Modal ---
  function openAddModal(status: Status = 'new') {
    setEditing(null);
    setForm({ ...EMPTY_FORM, status });
    setShowModal(true);
  }

  function openEditModal(lead: Lead) {
    setEditing(lead);
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      budget: lead.budget,
      message: lead.message,
      notes: lead.notes,
      status: lead.status,
    });
    setShowModal(true);
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
      const res = await fetch(editing ? `/api/leads/${editing.id}` : '/api/leads', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? 'Failed to save lead', 'error');
        return;
      }
      showToast(editing ? 'Lead updated!' : 'Lead added!');
      closeModal();
      fetchLeads();
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirm(`Delete the lead "${editing.name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${editing.id}`, { method: 'DELETE' });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Lead deleted');
      closeModal();
      fetchLeads();
    } catch {
      showToast('Could not delete lead', 'error');
    } finally {
      setDeleting(false);
    }
  }

  // --- Drag & drop ---
  function handleDragEnd() {
    setDraggedId(null);
    setOverColumn(null);
  }

  /** Drop on a column (beforeId undefined = at the bottom) or in front of a card. */
  async function handleDrop(target: Status, beforeId?: number) {
    const id = draggedId;
    handleDragEnd();
    if (id === null || id === beforeId) return;

    const dragged = leads.find((l) => l.id === id);
    if (!dragged) return;
    const source = dragged.status;

    // Work on the full columns, not the search-filtered view
    const column = (status: Status) =>
      leads
        .filter((l) => l.status === status && l.id !== id)
        .sort((a, b) => a.position - b.position || b.id - a.id)
        .map((l) => l.id);

    const targetIds = column(target);
    const at = beforeId === undefined ? -1 : targetIds.indexOf(beforeId);
    if (at === -1) targetIds.push(id);
    else targetIds.splice(at, 0, id);

    const sourceIds = source === target ? targetIds : column(source);

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => {
        const t = targetIds.indexOf(l.id);
        if (t !== -1) return { ...l, status: target, position: t + 1 };
        const s = sourceIds.indexOf(l.id);
        if (s !== -1 && l.status === source) return { ...l, position: s + 1 };
        return l;
      })
    );

    try {
      const columns: Record<string, number[]> = { [target]: targetIds };
      if (source !== target) columns[source] = sourceIds;
      const res = await fetch('/api/leads/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns }),
      });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to save');
    } catch {
      showToast('Could not save the move', 'error');
      fetchLeads();
    }
  }

  const whatsappHref = form.phone ? `https://wa.me/${form.phone.replace(/\D/g, '')}` : '';

  return (
    <div className="adm-root">
      <AdminSidebar activePage="leads" />

      <main className="adm-main">
        {toast && (
          <div className={`adm-toast adm-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
          </div>
        )}

        <header className="adm-header">
          <div>
            <h1 className="adm-page-title">Leads</h1>
            <p className="adm-page-sub">
              Drag cards between columns to track every lead. Contact-form messages arrive in <strong>New</strong> automatically.
            </p>
          </div>
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => openAddModal()}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Lead
          </button>
        </header>

        <div className="adm-kanban-bar">
          <div className="adm-kanban-stats">
            <span><strong>{counts.total}</strong> total</span>
            <span><strong>{counts.active}</strong> active</span>
            <span className="adm-kstat-won"><strong>{counts.won}</strong> won</span>
            <span className="adm-kstat-lost"><strong>{counts.lost}</strong> lost</span>
          </div>
          <input
            type="search"
            className="adm-input adm-kanban-search"
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search leads"
          />
        </div>

        {loading ? (
          <div className="adm-loading">
            <span className="adm-spinner adm-spinner--lg" />
            <span>Loading leads…</span>
          </div>
        ) : (
          <div className="adm-kanban">
            {COLUMNS.map((col) => (
              <section
                key={col.status}
                className={`adm-kcol ${overColumn === col.status ? 'adm-kcol--over' : ''}`}
                style={{ '--col': col.color } as React.CSSProperties}
                onDragOver={(e) => { if (draggedId !== null) { e.preventDefault(); setOverColumn(col.status); } }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverColumn(null);
                }}
                onDrop={(e) => { e.preventDefault(); handleDrop(col.status); }}
              >
                <header className="adm-kcol-head">
                  <span className="adm-kcol-dot" />
                  <h2 className="adm-kcol-title">{col.label}</h2>
                  <span className="adm-kcol-count">{board[col.status].length}</span>
                  <button
                    type="button"
                    className="adm-kcol-add"
                    onClick={() => openAddModal(col.status)}
                    aria-label={`Add a lead to ${col.label}`}
                    title={`Add a lead to ${col.label}`}
                  >
                    +
                  </button>
                </header>

                <div className="adm-kcol-body">
                  {board[col.status].map((lead) => (
                    <article
                      key={lead.id}
                      className={`adm-kcard ${draggedId === lead.id ? 'adm-kcard--dragging' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(lead.id));
                        setDraggedId(lead.id);
                      }}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => { if (draggedId !== null) e.preventDefault(); }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(col.status, lead.id); }}
                      onClick={() => openEditModal(lead)}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') openEditModal(lead); }}
                    >
                      <div className="adm-kcard-top">
                        <h3 className="adm-kcard-name">{lead.name}</h3>
                        <span className="adm-kcard-time">{timeAgo(lead.created_at)}</span>
                      </div>
                      {lead.email && <p className="adm-kcard-email">{lead.email}</p>}
                      {lead.message && <p className="adm-kcard-msg">{lead.message}</p>}
                      <div className="adm-kcard-tags">
                        {lead.source && <span className="adm-kcard-tag">{lead.source}</span>}
                        {lead.budget && <span className="adm-kcard-tag adm-kcard-tag--budget">{lead.budget}</span>}
                      </div>
                    </article>
                  ))}

                  {board[col.status].length === 0 && (
                    <div className="adm-kcol-empty">{draggedId !== null ? 'Drop here' : 'No leads'}</div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="adm-modal-overlay" onClick={closeModal}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{editing ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button type="button" className="adm-modal-close" onClick={closeModal} aria-label="Close">
                ✕
              </button>
            </div>

            <form className="adm-form" onSubmit={handleSubmit}>
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label className="adm-label" htmlFor="lead-name">Name <span className="adm-required">*</span></label>
                  <input
                    id="lead-name"
                    type="text"
                    className="adm-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label" htmlFor="lead-status">Stage</label>
                  <select
                    id="lead-status"
                    className="adm-input adm-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.status} value={c.status}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="adm-field">
                  <label className="adm-label" htmlFor="lead-email">Email</label>
                  <input
                    id="lead-email"
                    type="email"
                    className="adm-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label" htmlFor="lead-phone">Phone / WhatsApp</label>
                  <input
                    id="lead-phone"
                    type="text"
                    className="adm-input"
                    placeholder="+92 300 1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label" htmlFor="lead-source">Source</label>
                  <input
                    id="lead-source"
                    type="text"
                    className="adm-input"
                    placeholder="Contact form, LinkedIn, referral…"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label" htmlFor="lead-budget">Budget / value</label>
                  <input
                    id="lead-budget"
                    type="text"
                    className="adm-input"
                    placeholder="e.g. $500"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  />
                </div>

                <div className="adm-field adm-field--full">
                  <label className="adm-label" htmlFor="lead-message">Their message</label>
                  <textarea
                    id="lead-message"
                    className="adm-input adm-textarea"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <div className="adm-field adm-field--full">
                  <label className="adm-label" htmlFor="lead-notes">Your notes</label>
                  <textarea
                    id="lead-notes"
                    className="adm-input adm-textarea"
                    rows={3}
                    placeholder="Call notes, next steps, quote sent…"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              {editing && (form.email || whatsappHref) && (
                <div className="adm-lead-contact">
                  {form.email && (
                    <a className="adm-btn adm-btn--ghost" href={`mailto:${form.email}`}>Email</a>
                  )}
                  {whatsappHref && (
                    <a className="adm-btn adm-btn--ghost" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  )}
                </div>
              )}

              <div className="adm-form-actions">
                {editing && (
                  <button
                    type="button"
                    className="adm-btn adm-btn--ghost adm-lead-delete"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? <span className="adm-spinner" /> : null}
                    Delete
                  </button>
                )}
                <button type="button" className="adm-btn adm-btn--ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={submitting}>
                  {submitting ? <span className="adm-spinner" /> : null}
                  {submitting ? 'Saving…' : editing ? 'Save Changes' : '+ Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
