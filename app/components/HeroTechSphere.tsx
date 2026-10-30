'use client';

import { useEffect, useMemo, useRef, useState, PointerEvent } from 'react';

const TECH = [
  'React', 'Next.js', 'Node.js', 'Nest.js', 'TypeScript', 'JavaScript',
  'PostgreSQL', 'GSAP', 'WebGL', 'REST APIs', 'HTML', 'CSS', 'Git', 'Tailwind',
];

const AUTO_SPIN = 0.0035;
const FRICTION = 0.95;

export default function HeroTechSphere() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const points = useMemo(
    () =>
      TECH.map((_, i) => {
        // Fibonacci sphere: evenly spread points
        const phi = Math.acos(1 - (2 * (i + 0.5)) / TECH.length);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        return {
          x: Math.cos(theta) * Math.sin(phi),
          y: Math.sin(theta) * Math.sin(phi),
          z: Math.cos(phi),
        };
      }),
    []
  );

  const state = useRef({
    rotX: 0.25,
    rotY: 0,
    velX: 0,
    velY: AUTO_SPIN,
    dragging: false,
    hovering: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const render = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const s = state.current;
      // Smaller radius on narrow screens so edge pills don't get clipped
      const radius = wrap.clientWidth * (wrap.clientWidth < 400 ? 0.35 : 0.38);

      if (!s.dragging) {
        s.rotX += s.velX;
        s.rotY += s.velY;
        s.velX *= FRICTION;
        // Ease back to the idle spin (paused while hovering an item)
        const target = s.hovering || reduced ? 0 : AUTO_SPIN;
        s.velY += (target - s.velY) * 0.04;
      }

      const cx = Math.cos(s.rotX), sx = Math.sin(s.rotX);
      const cy = Math.cos(s.rotY), sy = Math.sin(s.rotY);

      points.forEach((p, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        // rotate around Y, then X
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;

        const depth = (z2 + 1) / 2; // 0 (back) → 1 (front)
        const scale = 0.6 + depth * 0.6;
        el.style.transform = `translate(-50%, -50%) translate3d(${x1 * radius}px, ${y2 * radius}px, 0) scale(${scale})`;
        el.style.opacity = String(0.25 + depth * 0.75);
        el.style.zIndex = String(Math.round(depth * 100));
        el.style.filter = depth < 0.35 ? `blur(${(0.35 - depth) * 3}px)` : 'none';
      });

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [points]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const s = state.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.velY = dx * 0.006;
    s.velX = -dy * 0.006;
    s.rotY += s.velY;
    s.rotX += s.velX;
  };

  const endDrag = () => {
    state.current.dragging = false;
  };

  return (
    <div className="tech-sphere-scene">
      <div className="tech-sphere-aura" aria-hidden="true" />
      <div
        ref={wrapRef}
        className="tech-sphere"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="group"
        aria-label="Interactive sphere of technologies I work with. Drag to rotate."
      >
        <div className="tech-sphere-core" aria-hidden="true">
          <span className="tech-sphere-core-label">{active ?? 'Drag me'}</span>
          <span className="tech-sphere-core-sub">{active ? 'click to see more' : 'my tech universe'}</span>
        </div>

        {TECH.map((name, i) => (
          <button
            key={name}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            className={`tech-sphere-item ${active === name ? 'active' : ''}`}
            onMouseEnter={() => {
              state.current.hovering = true;
              setActive(name);
            }}
            onMouseLeave={() => {
              state.current.hovering = false;
              setActive(null);
            }}
            onFocus={() => setActive(name)}
            onBlur={() => setActive(null)}
            onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
