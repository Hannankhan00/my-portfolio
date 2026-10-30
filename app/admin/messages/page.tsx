'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

type Message = {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessagesAdminPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/contact');
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      setMessages(await res.json());
    } catch {
      showToast('Could not load messages', 'error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function setRead(msg: Message, isRead: boolean) {
    // optimistic update
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: isRead } : m)));
    try {
      const res = await fetch(`/api/contact/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: isRead }),
      });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed');
    } catch {
      showToast('Could not update message', 'error');
      fetchMessages();
    }
  }

  function toggleOpen(msg: Message) {
    const opening = openId !== msg.id;
    setOpenId(opening ? msg.id : null);
    if (opening && !msg.is_read) setRead(msg, true);
  }

  async function handleDelete(msg: Message) {
    if (!confirm(`Delete the message from "${msg.name}"?`)) return;
    setDeletingId(msg.id);
    try {
      const res = await fetch(`/api/contact/${msg.id}`, { method: 'DELETE' });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Message deleted');
      fetchMessages();
    } catch {
      showToast('Could not delete message', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="adm-root">
      <AdminSidebar activePage="messages" />

      <main className="adm-main">
        {toast && (
          <div className={`adm-toast adm-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
          </div>
        )}

        <header className="adm-header">
          <div>
            <h1 className="adm-page-title">Messages</h1>
            <p className="adm-page-sub">Messages sent from the contact form on your portfolio</p>
          </div>
        </header>

        <section className="adm-card">
          <h2 className="adm-card-title">
            <span className="adm-card-title-dot" />
            Inbox ({messages.length}){unread > 0 && ` · ${unread} unread`}
          </h2>

          {loading ? (
            <div className="adm-loading">
              <span className="adm-spinner adm-spinner--lg" />
              <span>Loading messages…</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="adm-empty" style={{ padding: '3.5rem 0' }}>
              <p>No messages yet. They&apos;ll show up here when someone uses your contact form.</p>
            </div>
          ) : (
            <div className="adm-msg-list">
              {messages.map((msg) => {
                const open = openId === msg.id;
                return (
                  <div key={msg.id} className={`adm-msg ${msg.is_read ? '' : 'adm-msg--unread'} ${open ? 'adm-msg--open' : ''}`}>
                    <button type="button" className="adm-msg-head" onClick={() => toggleOpen(msg)} aria-expanded={open}>
                      <span className="adm-msg-dot" aria-hidden="true" />
                      <span className="adm-msg-from">
                        <span className="adm-msg-name">{msg.name}</span>
                        <span className="adm-msg-email">{msg.email}</span>
                      </span>
                      <span className="adm-msg-date">{formatDate(msg.created_at)}</span>
                    </button>

                    {!open && <p className="adm-msg-preview">{msg.message}</p>}

                    {open && (
                      <div className="adm-msg-body">
                        <p className="adm-msg-text">{msg.message}</p>
                        <div className="adm-msg-actions">
                          <a
                            className="adm-btn adm-btn--primary"
                            href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: your message')}`}
                          >
                            Reply by email
                          </a>
                          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setRead(msg, false)}>
                            Mark as unread
                          </button>
                          <button
                            type="button"
                            className="adm-btn adm-btn--ghost"
                            onClick={() => handleDelete(msg)}
                            disabled={deletingId === msg.id}
                          >
                            {deletingId === msg.id ? <span className="adm-spinner" /> : null}
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
