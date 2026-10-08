'use client';

import { useState, useEffect, useCallback } from 'react';

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
  const [introFinished, setIntroFinished] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  // Split characters preserving spaces
  const chars = text.split('').map((char) => (char === ' ' ? '\u00a0' : char));

  // Deterministic random jitters matching author's seed 7719
  const R = rng(7719);
  const charData = chars.map((char, i) => {
    const j = [R() * 2 - 1, R() * 2 - 1, R()];
    const tx = (j[0] * 78).toFixed(1);
    const ty = (j[1] * 42).toFixed(1);
    const delay = (i * 0.04).toFixed(2);
    return { char, tx, ty, delay, index: i };
  });

  // Mark intro as completed after initial welcome sequence concludes (1.35s + max delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Automatically reset glitch state once the 0.38s animation completes
  // so it can trigger anew on every subsequent hover or click
  useEffect(() => {
    if (isGlitching) {
      const timer = setTimeout(() => {
        setIsGlitching(false);
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [isGlitching]);

  const handleMouseEnter = useCallback(() => {
    if (!introFinished) return;
    setIsGlitching(true);
  }, [introFinished]);

  const handleMouseLeave = useCallback(() => {
    setIsGlitching(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!introFinished) return;
    setIsGlitching(false);
    requestAnimationFrame(() => {
      setIsGlitching(true);
    });
  }, [introFinished]);

  return (
    <span
      className={`chromatic-wordmark-container ${introFinished ? 'intro-completed' : ''} ${isGlitching ? 'is-glitching' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title="Hover or click for glitch effect"
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
      {charData.map(({ char, tx, ty, delay, index }) => (
        <span
          key={index}
          className={`chromatic-char ${!introFinished ? 'is-animating' : ''}`}
          style={
            {
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              '--delay': `${delay}s`,
              '--scale': '1.28',
              '--char-index': index,
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
