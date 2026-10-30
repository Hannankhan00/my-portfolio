'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'sent';

const MAX_MESSAGE = 3000;

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setError('');
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Something went wrong. Please try again.');
      }
      setStatus('sent');
      setForm({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      setStatus('idle');
    }
  }

  if (status === 'sent') {
    return (
      <div className="contact-card contact-success" role="status">
        <svg className="contact-success-icon" viewBox="0 0 52 52" aria-hidden="true">
          <circle className="contact-success-circle" cx="26" cy="26" r="24" fill="none" />
          <path className="contact-success-check" fill="none" d="M15 27l8 8 14-16" />
        </svg>
        <h3 className="contact-success-title">Message sent!</h3>
        <p className="contact-success-text">Thanks for reaching out. I&apos;ll get back to you soon.</p>
        <button type="button" className="contact-reset" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-card" onSubmit={handleSubmit} noValidate>
      <h3 className="contact-title">Send me a message</h3>

      <div className="contact-field">
        <label htmlFor="contact-name">Name</label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          maxLength={100}
          value={form.name}
          onChange={update('name')}
          required
        />
      </div>

      <div className="contact-field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          maxLength={200}
          value={form.email}
          onChange={update('email')}
          required
        />
      </div>

      <div className="contact-field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Tell me about your project or idea…"
          maxLength={MAX_MESSAGE}
          value={form.message}
          onChange={update('message')}
          required
        />
        <span className="contact-count" aria-hidden="true">
          {form.message.length}/{MAX_MESSAGE}
        </span>
      </div>

      {/* Honeypot: hidden from people, bots tend to fill it in */}
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={update('website')}
        />
      </div>

      {error && (
        <p className="contact-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="contact-submit" disabled={status === 'sending'}>
        {status === 'sending' ? (
          <>
            <span className="contact-spinner" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Send message <span aria-hidden="true">→</span>
          </>
        )}
      </button>
    </form>
  );
}
