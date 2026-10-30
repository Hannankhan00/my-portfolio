'use client';

import { useEffect, useState } from 'react';

const PHRASES = [
  'fast, scalable web apps',
  'pixel-perfect interfaces',
  'smooth, delightful animations',
  'products people love to use',
];

const TYPE_MS = 55;
const DELETE_MS = 28;
const HOLD_MS = 1600;

export default function HeroTypewriter() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(PHRASES[index]);
      const t = setTimeout(() => setIndex((i) => (i + 1) % PHRASES.length), HOLD_MS * 2);
      return () => clearTimeout(t);
    }

    const phrase = PHRASES[index];
    let delay = deleting ? DELETE_MS : TYPE_MS;

    if (!deleting && text === phrase) delay = HOLD_MS;

    const t = setTimeout(() => {
      if (!deleting && text === phrase) {
        setDeleting(true);
      } else if (deleting && text === '') {
        setDeleting(false);
        setIndex((i) => (i + 1) % PHRASES.length);
      } else {
        setText(phrase.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(t);
  }, [text, deleting, index]);

  const skipToNext = () => {
    setDeleting(false);
    setText('');
    setIndex((i) => (i + 1) % PHRASES.length);
  };

  return (
    <button
      type="button"
      className="hero-typewriter"
      onClick={skipToNext}
      aria-label={`I build ${PHRASES[index]}. Click for the next one.`}
    >
      <span className="hero-typewriter-lead">I build</span>
      <span className="hero-typewriter-text" aria-hidden="true">
        {text}
        <span className="hero-typewriter-caret" />
      </span>
      <span className="hero-typewriter-hint" aria-hidden="true">click ↻</span>
    </button>
  );
}
