'use client';

import { useRef, MouseEvent } from 'react';

export default function HeroPortrait() {
  const ref = useRef<HTMLDivElement>(null);

  // Direct DOM writes: parallax without re-rendering
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty('--my', String((e.clientY - r.top) / r.height - 0.5));
  };
  const onLeave = () => {
    ref.current?.style.setProperty('--mx', '0');
    ref.current?.style.setProperty('--my', '0');
  };

  return (
    <div ref={ref} className="portrait" onMouseMove={onMove} onMouseLeave={onLeave}>
      {/* Outline arch, offset behind */}
      <div className="portrait-outline" aria-hidden="true" />

      {/* Solid arch + portrait that breaks out of the top */}
      <div className="portrait-stage">
        <div className="portrait-arch" aria-hidden="true">
          <span className="portrait-arch-text">HANNAN</span>
        </div>
        <img
          className="portrait-img"
          src="/assets/hannankhan.webp"
          alt="Portrait of Hannan Khan"
          width={720}
          height={958}
          fetchPriority="high"
          draggable={false}
        />
      </div>

      {/* Rotating text badge */}
      <div className="portrait-badge" aria-hidden="true">
        <svg viewBox="0 0 200 200" className="portrait-badge-ring">
          <defs>
            <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text>
            <textPath href="#badge-circle" startOffset="0">
              FULL STACK DEVELOPER ✦ OPEN TO WORK ✦
            </textPath>
          </text>
        </svg>
        <span className="portrait-badge-core">↘</span>
      </div>

      {/* Stickers */}
      <span className="portrait-tag portrait-tag-code" aria-hidden="true">&lt;/&gt; ships things</span>
      <span className="portrait-star" aria-hidden="true">✦</span>
    </div>
  );
}
