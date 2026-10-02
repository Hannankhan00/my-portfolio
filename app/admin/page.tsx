'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar';
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
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Project modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Project state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editUploading, setEditUploading] = useState(false);

  // Drag & drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || 'Upload failed', 'error');
        return;
      }

      setForm((prev) => ({ ...prev, image: json.url }));
      showToast('Image uploaded to Cloudinary!');
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

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

  const [showMalkinModal, setShowMalkinModal] = useState(false);

  useEffect(() => {
    fetchProjects();

    // Check if user logged in as "chuzzi"
    try {
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        const u = JSON.parse(stored);
        const nameOrUser = (u.username || u.name || '').toLowerCase();
        if (nameOrUser === 'chuzzi') {
          setShowMalkinModal(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [fetchProjects]);

  // Confetti effect with pink & red hearts + particles
  useEffect(() => {
    if (!showMalkinModal) return;

    const canvas = document.getElementById('malkin-confetti-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const heartColors = ['#ff2d55', '#f43f5e', '#fb7185', '#ec4899', '#f472b6', '#fda4af', '#fff0f3'];

    type Particle = {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotSpeed: number;
      isHeart: boolean;
      opacity: number;
    };

    const particles: Particle[] = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height * 0.8,
        size: Math.random() * 16 + 10,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        speedX: (Math.random() - 0.5) * 3,
        speedY: Math.random() * 2.5 + 1.8,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        isHeart: Math.random() > 0.35, // 65% hearts, 35% sparkles
        opacity: Math.random() * 0.4 + 0.6,
      });
    }

    const drawHeart = (context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rot: number, alpha: number) => {
      context.save();
      context.translate(x, y);
      context.rotate((rot * Math.PI) / 180);
      context.globalAlpha = alpha;
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 10;
      context.beginPath();
      const topCurveHeight = size * 0.3;
      context.moveTo(0, topCurveHeight);
      context.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      context.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.15);
      context.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      context.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      context.closePath();
      context.fill();
      context.restore();
    };

    const drawCircle = (context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) => {
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 8;
      context.beginPath();
      context.arc(x, y, size * 0.25, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(p.y / 35) * 1.5 + p.speedX;
        p.rotation += p.rotSpeed;

        if (p.isHeart) {
          drawHeart(ctx, p.x, p.y, p.size, p.color, p.rotation, p.opacity);
        } else {
          drawCircle(ctx, p.x, p.y, p.size, p.color, p.opacity);
        }

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [showMalkinModal]);

  async function handleLogout() {
    try {
      localStorage.removeItem('admin_user');
    } catch {}
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
      setShowAddModal(false);
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

  // --- EDIT PROJECT HANDLERS ---
  function openEditModal(proj: Project) {
    setEditingProject(proj);
    setEditForm({
      title: proj.title,
      description: proj.description,
      stack: (proj.stack || []).join(', '),
      image: proj.image || '',
      link: proj.link,
      reversed: Boolean(proj.reversed),
    });
  }

  function closeEditModal() {
    setEditingProject(null);
    setEditForm(EMPTY_FORM);
  }

  async function handleEditImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || 'Upload failed', 'error');
        return;
      }

      setEditForm((prev) => ({ ...prev, image: json.url }));
      showToast('Image uploaded!');
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setEditUploading(false);
      e.target.value = '';
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProject) return;

    setEditSubmitting(true);
    try {
      const payload = {
        ...editForm,
        stack: editForm.stack.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? 'Failed to update project', 'error');
        return;
      }

      showToast('Project updated successfully!');
      closeEditModal();
      fetchProjects();
    } catch {
      showToast('Network error updating project', 'error');
    } finally {
      setEditSubmitting(false);
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

    const updated = [...projects];
    const [movedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, movedItem);

    setProjects(updated);
    handleDragEnd();

    try {
      const order = updated.map((p) => p.id);
      const res = await fetch('/api/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) throw new Error('Failed to save order');
      showToast('Project order updated!');
    } catch {
      showToast('Failed to save project order', 'error');
      fetchProjects();
    }
  };

  return (
    <div className="adm-root">
      {/* Sidebar */}
      <AdminSidebar activePage="projects" />

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
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={() => setShowAddModal(true)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Project
          </button>
        </header>

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
            <div className="adm-empty" style={{ flexDirection: 'column', gap: '1rem', padding: '3.5rem 0' }}>
              <p>No projects yet. Click below to add your first project!</p>
              <button
                type="button"
                className="adm-btn adm-btn--primary"
                onClick={() => setShowAddModal(true)}
              >
                + Add Project
              </button>
            </div>
          ) : (
            <>
              <div className="adm-reorder-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                </svg>
                <span>Drag and drop cards using the grip handle to reorder how projects appear on your landing page.</span>
              </div>

              <div className="adm-project-list">
                {projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className={`adm-project-row ${draggedIdx === idx ? 'dragging' : ''} ${dragOverIdx === idx ? 'drag-over' : ''}`}
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

                    <div className="adm-row-actions">
                      {/* Edit Button */}
                      <button
                        className="adm-edit-btn"
                        onClick={() => openEditModal(proj)}
                        title="Edit project"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Delete Button */}
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
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Add New Project</h2>
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

                {/* Image path and Cloudinary Upload */}
                <div className="adm-field adm-field--full">
                  <label className="adm-label">Project Image</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        id="proj-image"
                        type="text"
                        className="adm-input"
                        placeholder="Paste image URL or upload to Cloudinary"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                      />
                      <label
                        htmlFor="proj-upload"
                        className="adm-btn adm-btn--ghost"
                        style={{
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          margin: 0,
                          padding: '0.65rem 1rem',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        {uploading ? <span className="adm-spinner" /> : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        )}
                        {uploading ? 'Uploading...' : 'Cloudinary Upload'}
                      </label>
                      <input
                        id="proj-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploading}
                        onChange={handleImageUpload}
                      />
                    </div>
                    {form.image && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <img
                          src={form.image}
                          alt="Preview"
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="adm-hint" style={{ color: '#c084fc' }}>✓ Image attached</span>
                      </div>
                    )}
                    <span className="adm-hint">Upload directly to Cloudinary or supply an image link</span>
                  </div>
                </div>

                {/* Reversed layout */}
                <div className="adm-field adm-field--full">
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
                      {form.reversed ? 'Image on right (reversed on desktop)' : 'Image on left (default on desktop)'}
                    </span>
                  </label>
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
                  {submitting ? 'Adding…' : '+ Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="adm-modal-overlay" onClick={closeEditModal}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Edit Project</h2>
              <button type="button" className="adm-modal-close" onClick={closeEditModal} aria-label="Close">
                ✕
              </button>
            </div>

            <form className="adm-form" onSubmit={handleSaveEdit}>
              <div className="adm-form-grid">
                {/* Title */}
                <div className="adm-field adm-field--full">
                  <label className="adm-label">Project Title <span className="adm-required">*</span></label>
                  <input
                    type="text"
                    className="adm-input"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div className="adm-field adm-field--full">
                  <label className="adm-label">Description <span className="adm-required">*</span></label>
                  <textarea
                    className="adm-input adm-textarea"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                {/* Tech Stack */}
                <div className="adm-field">
                  <label className="adm-label">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="Next.js, TypeScript, Tailwind"
                    value={editForm.stack}
                    onChange={(e) => setEditForm({ ...editForm, stack: e.target.value })}
                  />
                </div>

                {/* Project Link */}
                <div className="adm-field">
                  <label className="adm-label">Live Link / URL <span className="adm-required">*</span></label>
                  <input
                    type="url"
                    className="adm-input"
                    placeholder="https://..."
                    value={editForm.link}
                    onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                    required
                  />
                </div>

                {/* Image */}
                <div className="adm-field adm-field--full">
                  <label className="adm-label">Project Image URL</label>
                  <div className="adm-upload-row">
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="https://... or upload from your computer"
                      value={editForm.image}
                      onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    />
                    <label className="adm-upload-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        disabled={editUploading}
                        style={{ display: 'none' }}
                      />
                      {editUploading ? <span className="adm-spinner" /> : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      )}
                      {editUploading ? 'Uploading…' : 'Upload File'}
                    </label>
                  </div>
                  {editForm.image && (
                    <div className="adm-img-preview">
                      <img src={editForm.image} alt="Preview" />
                    </div>
                  )}
                </div>

                {/* Reversed layout toggle */}
                <div className="adm-field adm-field--full">
                  <label className="adm-toggle">
                    <input
                      type="checkbox"
                      className="adm-toggle-input"
                      checked={editForm.reversed}
                      onChange={(e) => setEditForm({ ...editForm, reversed: e.target.checked })}
                    />
                    <span className="adm-toggle-track" />
                    <span className="adm-toggle-label">Reversed visual layout (image right, text left on desktop)</span>
                  </label>
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

      {/* Welcome Malkin Popup & Confetti */}
      {showMalkinModal && (
        <div className="malkin-overlay" onClick={() => setShowMalkinModal(false)}>
          <canvas id="malkin-confetti-canvas" className="malkin-confetti-canvas" />

          <div className="malkin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="malkin-glow-bg" />

            <button
              className="malkin-close-btn"
              onClick={() => setShowMalkinModal(false)}
              aria-label="Close welcome modal"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="malkin-heart-badge">
              <div className="malkin-heart-pulse-ring" />
              <div className="malkin-heart-icon-wrapper">
                <svg className="malkin-heart-svg" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            <div className="malkin-tag">
              <span>Special Access</span>
            </div>

            <h2 className="malkin-title">Welcome Malkin ❤️</h2>

            <p className="malkin-subtitle">
              The portfolio admin panel is at your command. Everything is set up and ready for you!
            </p>

            <button className="malkin-action-btn" onClick={() => setShowMalkinModal(false)}>
              <span>Enter Dashboard</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

