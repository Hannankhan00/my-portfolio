'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

export type SocialLink = {
  id: number;
  platform: string;
  label: string;
  url: string;
  icon: string;
  position: number;
  created_at: string;
};

const PLATFORMS = [
  { name: 'GitHub', icon: 'github' },
  { name: 'LinkedIn', icon: 'linkedin' },
  { name: 'WhatsApp', icon: 'whatsapp' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'Email', icon: 'mail' },
  { name: 'X / Twitter', icon: 'twitter' },
  { name: 'YouTube', icon: 'youtube' },
  { name: 'Discord', icon: 'discord' },
  { name: 'Website / Portfolio', icon: 'globe' },
  { name: 'Other', icon: 'link' },
];

export function getSocialIcon(iconOrPlatform: string) {
  const key = (iconOrPlatform || '').toLowerCase().trim();

  if (key.includes('whats') || key.includes('wa')) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        <path d="M9.5 9c.3-.3.8-.4 1.2-.1l1.4 1c.3.2.4.6.3.9l-.5.8c.8.9 1.6 1.7 2.5 2.5l.8-.5c.3-.1.7 0 .9.3l1 1.4c.3.4.2.9-.1 1.2l-.8.8c-.5.5-1.2.7-1.9.5-2.1-.6-4-2-5.4-3.8-.9-1.2-1.4-2.5-1.4-3.6 0-.7.3-1.4.8-1.9l.8-.8z" />
      </svg>
    );
  }
  // Instagram
  if (key.includes('insta')) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
      </svg>
    );
  }
  if (key.includes('git')) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    );
  }
  // LinkedIn
  if (key.includes('linkedin') || key === 'in' || key === 'li') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  if (key.includes('mail') || key.includes('email') || key.includes('gmail')) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    );
  }
  if (key.includes('twit') || key === 'x' || key.includes('x ')) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    );
  }
  if (key.includes('tube')) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes('disc')) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6h0a14.5 14.5 0 0 0-4-1.2 11.2 11.2 0 0 0-.5 1.1 13.5 13.5 0 0 0-3 0 11.2 11.2 0 0 0-.5-1.1A14.5 14.5 0 0 0 6 6a15.8 15.8 0 0 0-2 11 15.5 15.5 0 0 0 4.5 2.3c.4-.5.7-1.1 1-1.7a9.3 9.3 0 0 1-1.6-.8c.1-.1.3-.2.4-.3a11.1 11.1 0 0 0 7.4 0c.1.1.3.2.4.3-.5.3-1.1.6-1.6.8.3.6.6 1.2 1 1.7A15.5 15.5 0 0 0 20 17a15.8 15.8 0 0 0-2-11z" />
        <circle cx="9.5" cy="11.5" r="1.5" fill="currentColor" />
        <circle cx="14.5" cy="11.5" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes('glob') || key.includes('web') || key.includes('site')) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }

  // Default link icon
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const EMPTY_SOCIAL_FORM = {
  platform: 'GitHub',
  label: '',
  url: '',
  icon: 'github',
};

export default function SocialsAdminPage() {
  const router = useRouter();
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [form, setForm] = useState(EMPTY_SOCIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Social modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit State
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_SOCIAL_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Drag & drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSocials = useCallback(async () => {
    try {
      const res = await fetch('/api/socials');
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSocials(data);
    } catch {
      showToast('Could not load social links', 'error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSocials();
  }, [fetchSocials]);

  // Handle platform change and autofill icon
  function handlePlatformChange(selectedPlatform: string) {
    const found = PLATFORMS.find((p) => p.name === selectedPlatform);
    const defaultIcon = found ? found.icon : 'link';
    setForm((prev) => ({
      ...prev,
      platform: selectedPlatform,
      icon: defaultIcon,
      label: prev.label || (selectedPlatform !== 'Other' ? selectedPlatform : ''),
    }));
  }

  function handleEditPlatformChange(selectedPlatform: string) {
    const found = PLATFORMS.find((p) => p.name === selectedPlatform);
    const defaultIcon = found ? found.icon : 'link';
    setEditForm((prev) => ({
      ...prev,
      platform: selectedPlatform,
      icon: defaultIcon,
    }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/socials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? 'Failed to add social link', 'error');
        return;
      }

      showToast('Social link added successfully!');
      setForm(EMPTY_SOCIAL_FORM);
      setShowAddModal(false);
      fetchSocials();
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(social: SocialLink) {
    setEditingSocial(social);
    setEditForm({
      platform: social.platform,
      label: social.label,
      url: social.url,
      icon: social.icon || 'link',
    });
  }

  function closeEditModal() {
    setEditingSocial(null);
    setEditForm(EMPTY_SOCIAL_FORM);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSocial) return;

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/socials/${editingSocial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? 'Failed to update social link', 'error');
        return;
      }

      showToast('Social link updated!');
      closeEditModal();
      fetchSocials();
    } catch {
      showToast('Network error updating link', 'error');
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id: number, label: string) {
    if (!confirm(`Delete "${label}" link?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/socials/${id}`, { method: 'DELETE' });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to delete');
      showToast(`"${label}" deleted`);
      fetchSocials();
    } catch {
      showToast('Could not delete link', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  // --- DRAG & DROP HANDLERS ---
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragEnter = (idx: number) => {
    setDragOverIdx(idx);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDrop = async (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      handleDragEnd();
      return;
    }

    const updated = [...socials];
    const [movedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, movedItem);

    setSocials(updated);
    handleDragEnd();

    try {
      const order = updated.map((s) => s.id);
      const res = await fetch('/api/socials/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) throw new Error('Failed to save order');
      showToast('Social links reordered!');
    } catch {
      showToast('Failed to save order', 'error');
      fetchSocials();
    }
  };

  return (
    <div className="adm-root">
      {/* Sidebar */}
      <AdminSidebar activePage="socials" />

      {/* Main Content */}
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
            <h1 className="adm-page-title">Social Links & Accounts</h1>
            <p className="adm-page-sub">
              Manage the social profile links shown in your portfolio&apos;s &ldquo;Let&apos;s Connect&rdquo; section
            </p>
          </div>
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={() => setShowAddModal(true)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Social Link
          </button>
        </header>

        {/* Current Social Links */}
        <section className="adm-card">
          <h2 className="adm-card-title">
            <span className="adm-card-title-dot" />
            Current Social Accounts ({socials.length})
          </h2>

          {loading ? (
            <div className="adm-loading">
              <span className="adm-spinner adm-spinner--lg" />
              <span>Loading social links…</span>
            </div>
          ) : socials.length === 0 ? (
            <div className="adm-empty" style={{ flexDirection: 'column', gap: '1rem', padding: '3.5rem 0' }}>
              <p>No social links yet. Add your accounts!</p>
              <button
                type="button"
                className="adm-btn adm-btn--primary"
                onClick={() => setShowAddModal(true)}
              >
                + Add Social Link
              </button>
            </div>
          ) : (
            <>
              <div className="adm-reorder-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                </svg>
                <span>Drag and drop using the grip handle to reorder links on your landing page.</span>
              </div>

              <div className="adm-social-list">
                {socials.map((soc, idx) => (
                  <div
                    key={soc.id}
                    className={`adm-social-card ${draggedIdx === idx ? 'dragging' : ''} ${dragOverIdx === idx ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDragEnd={handleDragEnd}
                    onDrop={() => handleDrop(idx)}
                  >
                    {/* Drag Handle */}
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

                    {/* Platform Icon */}
                    <div className="adm-social-icon-box">
                      {getSocialIcon(soc.icon || soc.platform)}
                    </div>

                    {/* Info */}
                    <div className="adm-social-info">
                      <div className="adm-social-platform">{soc.platform}</div>
                      <div className="adm-social-label">{soc.label}</div>
                      <a
                        href={soc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adm-social-url"
                        title={soc.url}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        {soc.url}
                      </a>
                    </div>

                    {/* Actions */}
                    <div className="adm-row-actions">
                      <button
                        className="adm-edit-btn"
                        onClick={() => openEditModal(soc)}
                        title="Edit link"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button
                        className="adm-delete-btn"
                        onClick={() => handleDelete(soc.id, soc.label || soc.platform)}
                        disabled={deletingId === soc.id}
                        title="Delete link"
                      >
                        {deletingId === soc.id ? <span className="adm-spinner" /> : (
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

      {/* Add Social Link Modal */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Add New Social Link</h2>
              <button
                type="button"
                className="adm-modal-close"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form className="adm-form" onSubmit={handleAdd}>
              <div className="adm-form-grid">
                {/* Platform Preset */}
                <div className="adm-field">
                  <label className="adm-label">Platform <span className="adm-required">*</span></label>
                  <select
                    className="adm-input adm-select"
                    value={form.platform}
                    onChange={(e) => handlePlatformChange(e.target.value)}
                    required
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Label */}
                <div className="adm-field">
                  <label className="adm-label">Display Label <span className="adm-required">*</span></label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. GitHub or hannankhan@gmail.com"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    required
                  />
                </div>

                {/* URL */}
                <div className="adm-field adm-field--full">
                  <label className="adm-label">Link URL <span className="adm-required">*</span></label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="https://github.com/username or mailto:you@gmail.com"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="adm-form-actions">
                <button
                  type="button"
                  className="adm-btn adm-btn--ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={submitting}>
                  {submitting ? <span className="adm-spinner" /> : null}
                  {submitting ? 'Adding…' : '+ Add Social Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Social Modal */}
      {editingSocial && (
        <div className="adm-modal-overlay" onClick={closeEditModal}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Edit Social Link</h2>
              <button type="button" className="adm-modal-close" onClick={closeEditModal} aria-label="Close">
                ✕
              </button>
            </div>

            <form className="adm-form" onSubmit={handleSaveEdit}>
              <div className="adm-form-grid">
                {/* Platform */}
                <div className="adm-field">
                  <label className="adm-label">Platform</label>
                  <select
                    className="adm-input adm-select"
                    value={editForm.platform}
                    onChange={(e) => handleEditPlatformChange(e.target.value)}
                    required
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Label */}
                <div className="adm-field">
                  <label className="adm-label">Display Label <span className="adm-required">*</span></label>
                  <input
                    type="text"
                    className="adm-input"
                    value={editForm.label}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    required
                  />
                </div>

                {/* URL */}
                <div className="adm-field adm-field--full">
                  <label className="adm-label">Link URL <span className="adm-required">*</span></label>
                  <input
                    type="text"
                    className="adm-input"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="adm-form-actions">
                <button type="button" className="adm-btn adm-btn--ghost" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={editSubmitting}>
                  {editSubmitting ? <span className="adm-spinner" /> : null}
                  {editSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
