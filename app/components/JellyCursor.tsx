'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const BOX = 240; // svg canvas the blob is drawn in (centered on the ball)
const POINTS = 16; // points around the blob's outline
const RADIUS = 14;
const HOVER_SCALE = 2.2; // over links and buttons
const HEADING_SCALE = 3; // over headings
const MAGNET_PULL = 0.3; // how far the ball is pulled toward the centre of a hovered element

// Centre of the ball chasing the pointer
const CENTER_STIFFNESS = 0.22;
const CENTER_DAMPING = 0.5; // no overshoot, so the ball never bounces around the pointer

// Soft body: every outline point is a spring tied to its rest spot on the circle
const POINT_STIFFNESS = 0.18;
const POINT_DAMPING = 0.5; // no overshoot: it stretches and glides back to round without wobbling
const NEIGHBOUR_PULL = 0.2; // keeps the outline smooth and cohesive
const LAG_GAIN = 1.5; // how strongly the trailing side drags behind when moving
const MAX_DISPLACEMENT = RADIUS * 3.2;

const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="button"], [data-magnetic]';

/** Closed Catmull-Rom spline through the points, as an SVG path. */
function blobPath(xs: number[], ys: number[]): string {
  const n = xs.length;
  let d = `M${xs[0].toFixed(2)},${ys[0].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const i0 = (i - 1 + n) % n, i1 = i, i2 = (i + 1) % n, i3 = (i + 2) % n;
    const c1x = xs[i1] + (xs[i2] - xs[i0]) / 6;
    const c1y = ys[i1] + (ys[i2] - ys[i0]) / 6;
    const c2x = xs[i2] - (xs[i3] - xs[i1]) / 6;
    const c2y = ys[i2] - (ys[i3] - ys[i1]) / 6;
    d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${xs[i2].toFixed(2)},${ys[i2].toFixed(2)}`;
  }
  return d + 'Z';
}

export default function JellyCursor() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Only for devices with a real mouse (false on the server, so no hydration mismatch)
  const enabled = useSyncExternalStore(
    () => () => {},
    () => window.matchMedia('(pointer: fine)').matches,
    () => false
  );

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!enabled || !svg || !path) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pos = { x: -200, y: -200 };
    const vel = { x: 0, y: 0 };
    let target = { x: -200, y: -200 };
    let size = 1; // eased scale multiplier
    let sizeGoal = 1;
    let press = 0;
    let seen = false;
    let raf = 0;

    // Soft-body state: displacement of each outline point from its rest spot (relative to the centre)
    const angles = Array.from({ length: POINTS }, (_, i) => (i / POINTS) * Math.PI * 2);
    const dx = new Array(POINTS).fill(0);
    const dy = new Array(POINTS).fill(0);
    const vx = new Array(POINTS).fill(0);
    const vy = new Array(POINTS).fill(0);
    const xs = new Array(POINTS).fill(0);
    const ys = new Array(POINTS).fill(0);

    const onMove = (e: PointerEvent) => {
      const m = { x: e.clientX, y: e.clientY };
      target = m;

      const el = (e.target as Element | null)?.closest?.(INTERACTIVE);
      if (el) {
        // Magnetic: drift toward the centre of whatever you're hovering
        const r = el.getBoundingClientRect();
        target = {
          x: m.x + (r.left + r.width / 2 - m.x) * MAGNET_PULL,
          y: m.y + (r.top + r.height / 2 - m.y) * MAGNET_PULL,
        };
        sizeGoal = HOVER_SCALE;
      } else if ((e.target as Element | null)?.closest?.(HEADINGS)) {
        sizeGoal = HEADING_SCALE;
      } else {
        sizeGoal = 1;
      }

      if (!seen) {
        seen = true;
        pos.x = m.x;
        pos.y = m.y;
        svg.style.opacity = '1';
      }
    };

    const onDown = () => { press = 1; };
    const onUp = () => { press = 0; };
    const onLeave = () => { svg.style.opacity = '0'; seen = false; };

    const tick = () => {
      // 1. The ball's centre chases the pointer
      const prevX = pos.x, prevY = pos.y;
      if (reduced) {
        pos.x = target.x;
        pos.y = target.y;
      } else {
        vel.x = (vel.x + (target.x - pos.x) * CENTER_STIFFNESS) * CENTER_DAMPING;
        vel.y = (vel.y + (target.y - pos.y) * CENTER_STIFFNESS) * CENTER_DAMPING;
        pos.x += vel.x;
        pos.y += vel.y;
      }
      const moveX = pos.x - prevX;
      const moveY = pos.y - prevY;
      const moveLen = Math.hypot(moveX, moveY);
      const moveAngle = Math.atan2(moveY, moveX);

      size += (sizeGoal - size) * 0.18;
      const radius = RADIUS * size * (1 - press * 0.2);

      // 2. Soft-body step
      for (let i = 0; i < POINTS; i++) {
        if (reduced) {
          dx[i] = dy[i] = vx[i] = vy[i] = 0;
          continue;
        }
        const a = (i - 1 + POINTS) % POINTS;
        const b = (i + 1) % POINTS;

        // inertia: the trailing side of the blob stays behind while the centre moves,
        // the leading side doesn't, so the ball stretches into a teardrop
        const w = moveLen > 0.05 ? 0.5 * (1 - Math.cos(angles[i] - moveAngle)) : 0;
        dx[i] -= moveX * w * LAG_GAIN;
        dy[i] -= moveY * w * LAG_GAIN;

        // spring back to rest + pull toward the average of neighbours
        const fx = -dx[i] * POINT_STIFFNESS + ((dx[a] + dx[b]) / 2 - dx[i]) * NEIGHBOUR_PULL;
        const fy = -dy[i] * POINT_STIFFNESS + ((dy[a] + dy[b]) / 2 - dy[i]) * NEIGHBOUR_PULL;

        vx[i] = (vx[i] + fx) * POINT_DAMPING;
        vy[i] = (vy[i] + fy) * POINT_DAMPING;
        dx[i] += vx[i];
        dy[i] += vy[i];

        const len = Math.hypot(dx[i], dy[i]);
        if (len > MAX_DISPLACEMENT) {
          dx[i] *= MAX_DISPLACEMENT / len;
          dy[i] *= MAX_DISPLACEMENT / len;
        }
      }

      for (let i = 0; i < POINTS; i++) {
        xs[i] = Math.cos(angles[i]) * radius + dx[i];
        ys[i] = Math.sin(angles[i]) * radius + dy[i];
      }

      path.setAttribute('d', blobPath(xs, ys));
      svg.style.transform = `translate3d(${pos.x - BOX / 2}px, ${pos.y - BOX / 2}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return createPortal(
    <svg
      ref={svgRef}
      className="jelly-cursor"
      width={BOX}
      height={BOX}
      viewBox={`${-BOX / 2} ${-BOX / 2} ${BOX} ${BOX}`}
      aria-hidden="true"
    >
      <path ref={pathRef} fill="#fff" />
    </svg>,
    document.body
  );
}
