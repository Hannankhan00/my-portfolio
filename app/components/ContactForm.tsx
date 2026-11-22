'use client';

import { useRef, useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'sent';

const MAX_MESSAGE = 3000;
const EMPTY_FORM = { name: '', email: '', message: '', website: '' };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<Status>('idle');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const originalWidth = useRef(0);

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status !== 'idle') return;
    setError('');

    // Lock the button's current width, then shrink it to a circle (CSS animates the change)
    const btn = btnRef.current;
    if (btn) {
      originalWidth.current = btn.offsetWidth;
      btn.style.width = `${btn.offsetWidth}px`;
      void btn.offsetWidth; // force reflow so the width change below is animated
      btn.style.width = `${btn.offsetHeight}px`;
    }
    setStatus('sending');

    // Keep the "plane flies away" animation on screen even if the server answers instantly
    const minDelay = new Promise((r) => setTimeout(r, 900));

    try {
      const [res] = await Promise.all([
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }),
        minDelay,
      ]);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Something went wrong. Please try again.');
      }
      setStatus('sent'); // circle + tick
      setTimeout(() => {
        setForm(EMPTY_FORM);
        setDone(true);
      }, 1400);
    } catch (err) {
      const el = btnRef.current;
      if (el) {
        el.style.width = `${originalWidth.current}px`;
        setTimeout(() => {
          if (btnRef.current) btnRef.current.style.width = '';
        }, 500);
      }
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      setStatus('idle');
    }
  }

  if (done) {
    return (
      <div className="contact-card contact-success" role="status">
        <svg className="contact-success-icon" viewBox="0 0 52 52" aria-hidden="true">
          <circle className="contact-success-circle" cx="26" cy="26" r="24" fill="none" />
          <path className="contact-success-check" fill="none" d="M15 27l8 8 14-16" />
        </svg>
        <h3 className="contact-success-title">Message sent!</h3>
        <p className="contact-success-text">Thanks for reaching out. I&apos;ll get back to you soon.</p>
        <button
          type="button"
          className="contact-reset"
          onClick={() => {
            setDone(false);
            setStatus('idle');
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-card" onSubmit={handleSubmit} noValidate>
      <p className="contact-eyebrow">{'// send me a message'}</p>

      <div className="contact-sentence">
        <span>Hi Hannan, I&apos;m</span>{' '}
        <label className="contact-sr" htmlFor="contact-name">Your name</label>
        <input
          id="contact-name"
          className="contact-inline"
          type="text"
          autoComplete="name"
          placeholder="your name"
          maxLength={100}
          value={form.name}
          onChange={update('name')}
          required
        />
        <span>.</span>
        <br />
        <span>You can reach me at</span>{' '}
        <label className="contact-sr" htmlFor="contact-email">Your email</label>
        <input
          id="contact-email"
          className="contact-inline contact-inline-email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          maxLength={200}
          value={form.email}
          onChange={update('email')}
          required
        />
        <span>.</span>
        <br />
        <label htmlFor="contact-message">I&apos;d like to talk about</label>{' '}
        <textarea
          id="contact-message"
          className="contact-inline contact-inline-message"
          rows={3}
          placeholder="a project, an idea, an opportunity…"
          maxLength={MAX_MESSAGE}
          value={form.message}
          onChange={update('message')}
          required
        />
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

      <div className="contact-actions">
        <button
          ref={btnRef}
          type="submit"
          className="contact-submit"
          data-state={status}
          aria-disabled={status !== 'idle'}
          aria-label={status === 'sending' ? 'Sending message' : status === 'sent' ? 'Message sent' : undefined}
        >
          <span className="contact-submit-label">Send it</span>
          <svg className="contact-submit-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4 20-7z" />
          </svg>
          <span className="contact-submit-ring" aria-hidden="true" />
          <svg className="contact-submit-tick" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </button>
        <span className="contact-count" aria-hidden="true">
          {form.message.length}/{MAX_MESSAGE}
        </span>
      </div>
    </form>
  );
}
