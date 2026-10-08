'use client';

import { useState, useCallback } from 'react';

// Exact PRNG implementation from creator-studio-intro.html line 179
function rng(s: number) {
  let a = s >>> 0;
  return function () {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ChromaticTextIntroProps {
  text?: string;
  className?: string;
}

export function ChromaticTextIntro({
  text = 'Hannan Khan',
  className = '',
}: ChromaticTextIntroProps) {
  const [animKey, setAnimKey] = useState(0);

  // Split characters preserving spaces
  const chars = text.split('').map((char) => (char === ' ' ? '\u00a0' : char));

  // Deterministic random jitters matching author's seed 7719
  const R = rng(7719);
  const charData = chars.map((char, i) => {
    const j = [R() * 2 - 1, R() * 2 - 1, R()];
    const tx = (j[0] * 78).toFixed(1);
    const ty = (j[1] * 42).toFixed(1);
    const delay = (i * 0.04).toFixed(2);
    return { char, tx, ty, delay };
  });

  const replay = useCallback(() => {
    setAnimKey((prev) => prev + 1);
  }, []);

  return (
    <span
      key={animKey}
      className={`chromatic-wordmark-container ${className}`}
      onClick={replay}
      onMouseEnter={replay}
      title="Hover or click to replay animation"
      style={{
        display: 'inline-flex',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {charData.map(({ char, tx, ty, delay }, index) => (
        <span
          key={index}
          className="chromatic-char is-animating"
          style={
            {
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              '--delay': `${delay}s`,
              '--scale': '1.28',
            } as React.CSSProperties
          }
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export default ChromaticTextIntro;
