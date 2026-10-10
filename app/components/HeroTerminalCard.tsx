'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';

type TabType = 'profile' | 'stack' | 'terminal';

export default function HeroTerminalCard() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt and Glare State
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max 10 deg rotation for a refined, premium feel
    const rotateY = ((x - centerX) / centerX) * 9;
    const rotateX = -((y - centerY) / centerY) * 9;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransform({
      rotateX,
      rotateY,
      glareX,
      glareY,
      glareOpacity: 0.16,
    });
  };

  const handleMouseLeave = () => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
    });
  };

  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'profile') {
      textToCopy = `export const engineer = {
  name: "Hannan Khan",
  role: "Full Stack Developer",
  status: "Open to opportunities",
  location: "Pakistan 🌐",
};`;
    } else if (activeTab === 'stack') {
      textToCopy = `const stack = ["React", "Next.js", "Node.js", "Nest.js", "TypeScript", "PostgreSQL", "REST APIs"];`;
    } else {
      textToCopy = `npx hannan-portfolio --connect`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="hero-card-3d-scene">
      <div
        ref={cardRef}
        className="hero-terminal-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        }}
      >
        {/* Dynamic Holographic Glare Sheen */}
        <div
          className="hero-terminal-glare"
          style={{
            background: `radial-gradient(circle 320px at ${transform.glareX}% ${transform.glareY}%, rgba(192, 132, 252, ${transform.glareOpacity}) 0%, transparent 65%)`,
          }}
          aria-hidden="true"
        />

        {/* Top Window Bar */}
        <div className="hero-terminal-header">
          <div className="hero-terminal-dots">
            <span className="dot dot-close" />
            <span className="dot dot-minimize" />
            <span className="dot dot-expand" />
          </div>

          <div className="hero-terminal-tabs">
            <button
              type="button"
              className={`terminal-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              hannan.ts
            </button>
            <button
              type="button"
              className={`terminal-tab ${activeTab === 'stack' ? 'active' : ''}`}
              onClick={() => setActiveTab('stack')}
            >
              stack.json
            </button>
            <button
              type="button"
              className={`terminal-tab ${activeTab === 'terminal' ? 'active' : ''}`}
              onClick={() => setActiveTab('terminal')}
            >
              connect.sh
            </button>
          </div>

          <button
            type="button"
            className="terminal-copy-btn"
            onClick={handleCopy}
            title="Copy code"
            aria-label="Copy code"
          >
            {copied ? (
              <span className="copy-feedback">Copied!</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>

        {/* Card Body / Code Content */}
        <div className="hero-terminal-body">
          {activeTab === 'profile' && (
            <div className="code-content">
              <div className="code-line">
                <span className="line-num">1</span>
                <span className="code-kw">export</span> <span className="code-kw">const</span>{' '}
                <span className="code-var">engineer</span> = &#123;
              </div>
              <div className="code-line indent">
                <span className="line-num">2</span>
                <span className="code-key">name</span>:{' '}
                <span className="code-str">&quot;Hannan Khan&quot;</span>,
              </div>
              <div className="code-line indent">
                <span className="line-num">3</span>
                <span className="code-key">role</span>:{' '}
                <span className="code-str">&quot;Full Stack Developer&quot;</span>,
              </div>
              <div className="code-line indent">
                <span className="line-num">4</span>
                <span className="code-key">status</span>:{' '}
                <span className="code-accent">&quot;Open to Work ✦&quot;</span>,
              </div>
              <div className="code-line indent">
                <span className="line-num">5</span>
                <span className="code-key">focus</span>: [
                <span className="code-str">&quot;Next.js&quot;</span>,{' '}
                <span className="code-str">&quot;Node&quot;</span>,{' '}
                <span className="code-str">&quot;GSAP&quot;</span>],
              </div>
              <div className="code-line indent">
                <span className="line-num">6</span>
                <span className="code-key">craft</span>:{' '}
                <span className="code-str">&quot;High-performance & UX&quot;</span>
              </div>
              <div className="code-line">
                <span className="line-num">7</span>
                &#125;;
              </div>
            </div>
          )}

          {activeTab === 'stack' && (
            <div className="code-content">
              <div className="code-line">
                <span className="line-num">1</span>
                &#123;
              </div>
              <div className="code-line indent">
                <span className="line-num">2</span>
                <span className="code-key">&quot;frontend&quot;</span>: [
                <span className="code-str">&quot;React 19&quot;</span>,{' '}
                <span className="code-str">&quot;Next.js 16&quot;</span>,{' '}
                <span className="code-str">&quot;TypeScript&quot;</span>],
              </div>
              <div className="code-line indent">
                <span className="line-num">3</span>
                <span className="code-key">&quot;backend&quot;</span>: [
                <span className="code-str">&quot;Node.js&quot;</span>,{' '}
                <span className="code-str">&quot;Nest.js&quot;</span>,{' '}
                <span className="code-str">&quot;PostgreSQL&quot;</span>],
              </div>
              <div className="code-line indent">
                <span className="line-num">4</span>
                <span className="code-key">&quot;creative&quot;</span>: [
                <span className="code-str">&quot;GSAP ScrollTrigger&quot;</span>,{' '}
                <span className="code-str">&quot;WebGL / OGL&quot;</span>]
              </div>
              <div className="code-line">
                <span className="line-num">5</span>
                &#125;
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="code-content terminal-view">
              <div className="code-line">
                <span className="line-num">1</span>
                <span className="terminal-prompt">$</span>{' '}
                <span className="terminal-cmd">curl</span> -X GET https://hannankhan.dev/status
              </div>
              <div className="code-line terminal-output">
                <span className="line-num">2</span>
                <span className="code-comment">&#62; 200 OK — Ready for hire & freelance</span>
              </div>
              <div className="code-line">
                <span className="line-num">3</span>
                <span className="terminal-prompt">$</span>{' '}
                <span className="terminal-cmd">contact</span> --direct
              </div>
              <div className="code-line terminal-output">
                <span className="line-num">4</span>
                <a href="#connect" className="terminal-link">
                  &#8594; Click here to open contact channels
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Ribbon */}
        <div className="hero-terminal-footer">
          <div className="status-indicator">
            <span className="status-dot" />
            <span className="status-text">Available for projects</span>
          </div>
          <span className="card-hint">✦ Interactive 3D Card</span>
        </div>
      </div>
    </div>
  );
}
