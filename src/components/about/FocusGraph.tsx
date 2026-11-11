"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useMotionCapability } from "@/hooks/useMotionCapability";

type Area = { title: string; desc: string };

const TAU = Math.PI * 2;
const TILT = 0.24;
const LAT = 0.75;
const DEPTH = 6;

/** Six areas on two rings of a sphere (alternating up and down); `a` is the yaw that brings one to the front. */
const NODES = Array.from({ length: 6 }, (_, i) => {
  const a = (i * TAU) / 6;
  const lat = i % 2 === 0 ? LAT : -LAT;
  return { a, x: Math.cos(lat) * Math.sin(a), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(a) };
});

/** Backdrop dots: an evenly spread sphere. */
const DOTS = Array.from({ length: 150 }, (_, i) => {
  const y = 1 - ((i + 0.5) / 150) * 2;
  const r = Math.sqrt(1 - y * y);
  const phi = i * 2.399963;
  return { x: Math.cos(phi) * r, y, z: Math.sin(phi) * r };
});

/** Same turn the nodes take, then the fixed tilt toward the viewer. */
function turn(x: number, y: number, z: number, yaw: number, tilt: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return { x: x1, y: y * ct - z1 * st, z: y * st + z1 * ct };
}


/** Line and dot colour of the canvas drawing: pale violet on dark, deep violet on light. */
const INK = { dark: "196,181,253", light: "91,56,200" } as const;

/** A shaded sphere with a slowly turning wire mesh, light from the top start corner. */
function drawCore(canvas: HTMLCanvasElement | null, spin: number, light: boolean) {
  if (!canvas || !canvas.width) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const S = canvas.width;
  const c = S / 2;
  const r = c - 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, S, S);

  const body = ctx.createRadialGradient(c - r * 0.38, c - r * 0.42, r * 0.08, c, c, r);
  if (light) {
    // lit from above on a pale page: a lavender glass ball rather than a black one
    body.addColorStop(0, "#f1eaff");
    body.addColorStop(0.3, "#a98bf7");
    body.addColorStop(0.72, "#6b46d6");
    body.addColorStop(1, "#4527a0");
  } else {
    body.addColorStop(0, "#b9a4ff");
    body.addColorStop(0.28, "#7c3aed");
    body.addColorStop(0.7, "#2b1260");
    body.addColorStop(1, "#0d0820");
  }
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, TAU);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, r, 0, TAU);
  ctx.clip();
  ctx.lineWidth = Math.max(1, S / 160);
  // meridians turn about the vertical axis
  for (let k = 0; k < 6; k++) {
    const a = spin + (k * Math.PI) / 6;
    ctx.strokeStyle = light ? "rgba(255,255,255,0.4)" : "rgba(221,214,254,0.28)";
    ctx.beginPath();
    ctx.ellipse(c, c, Math.abs(Math.cos(a)) * r, r, 0, 0, TAU);
    ctx.stroke();
  }
  // parallels, seen from slightly above
  for (const lat of [-1.05, -0.52, 0, 0.52, 1.05]) {
    const rr = Math.cos(lat) * r;
    ctx.strokeStyle = light ? "rgba(255,255,255,0.3)" : "rgba(221,214,254,0.2)";
    ctx.beginPath();
    ctx.ellipse(c, c + Math.sin(lat) * r * 0.92, rr, rr * 0.22, 0, 0, TAU);
    ctx.stroke();
  }
  // night side, then the specular spot
  const shade = ctx.createRadialGradient(c + r * 0.35, c + r * 0.4, r * 0.35, c + r * 0.2, c + r * 0.25, r * 1.15);
  shade.addColorStop(0, "rgba(5,3,15,0)");
  shade.addColorStop(1, light ? "rgba(40,18,110,0.5)" : "rgba(5,3,15,0.78)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, S, S);
  const spec = ctx.createRadialGradient(c - r * 0.42, c - r * 0.46, 0, c - r * 0.42, c - r * 0.46, r * 0.34);
  spec.addColorStop(0, light ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec;
  ctx.fillRect(0, 0, S, S);
  ctx.restore();

  // rim light
  const rim = ctx.createRadialGradient(c, c, r * 0.82, c, c, r);
  rim.addColorStop(0, "rgba(167,139,250,0)");
  rim.addColorStop(1, light ? "rgba(255,255,255,0.5)" : "rgba(196,181,253,0.55)");
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, TAU);
  ctx.fill();
}

/**
 * Focus areas on a small 3D globe of nodes. The globe turns to face the open area (hover, tap or
 * the parent's auto-advance); drag it to spin by hand and it settles on the nearest area.
 */
export function FocusGraph({
  areas,
  label,
  active,
  onPick,
  className,
}: {
  areas: Area[];
  label: string;
  active: number;
  onPick: (i: number) => void;
  className?: string;
}) {
  const locale = useLocale();
  const { fxActive, mounted, isNarrow, isLowEnd } = useMotionCapability();
  const compact = isNarrow || isLowEnd;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const pulseRef = useRef<SVGCircleElement>(null);
  const activeRef = useRef(active);
  const pickRef = useRef(onPick);
  const s = useRef({ yaw: NODES[0].a, target: NODES[0].a, w: 0, h: 0, half: 60, drag: false, moved: 0, lastX: 0 });
  const renderRef = useRef<(t: number) => void>(() => {});
  // hover picks an area only after a short, deliberate pause, and not again until the pointer has
  // really moved: the turning globe slides nodes under a still pointer, which used to chain picks
  const hover = useRef({ timer: 0, lockUntil: 0, x: 0, y: 0 });

  useEffect(() => {
    pickRef.current = onPick;
  });

  // aim at the open area by the shortest way round
  useEffect(() => {
    activeRef.current = active;
    const st = s.current;
    if (st.drag) return;
    const ta = NODES[active].a;
    st.target = ta + Math.round((st.yaw - ta) / TAU) * TAU;
    if (!fxActive) {
      st.yaw = st.target;
      renderRef.current(0);
    }
  }, [active, fxActive]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!root || !canvas || !svg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = s.current;
    let raf = 0;
    let visible = true;
    let last = 0;
    let coreAt = -1e9;
    let drawnAt = 0;
    const BUCKETS = 6;
    const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
    // a phone or a weak machine draws at 30 frames a second
    const minFrame = compact ? 30 : 0;

    const measure = () => {
      const rect = root.getBoundingClientRect();
      st.w = rect.width;
      st.h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(st.w * dpr);
      canvas.height = Math.round(st.h * dpr);
      const core = coreRef.current;
      if (core) {
        const cr = core.getBoundingClientRect();
        core.width = Math.round(cr.width * dpr);
        core.height = Math.round(cr.height * dpr);
      }
      svg.setAttribute("viewBox", `${-st.w / 2} ${-st.h / 2} ${st.w} ${st.h}`);
      // on phones only the open area shows its name; the rest are small numbered dots
      st.half = window.innerWidth < 640 ? 26 : Math.max(...btnRefs.current.map((b) => (b ? b.offsetWidth / 2 : 0)), 40);
      renderRef.current(0);
    };

    const render = (t: number) => {
      const { w, h } = st;
      if (!w) return;
      const light = document.documentElement.getAttribute("data-theme") === "light";
      const ink = light ? INK.light : INK.dark;
      // nodes reach cos(LAT) of the radius sideways, so size the globe until the widest label still fits
      const R = Math.max(w * 0.2, Math.min(w * 0.44, (w / 2 - st.half - 6) / (Math.cos(LAT) * (DEPTH / (DEPTH - 1)))));
      const sway = fxActive ? Math.sin(t / 1900) * 0.05 : 0;
      const yaw = st.yaw + sway;
      const tilt = TILT + (fxActive ? Math.cos(t / 2600) * 0.03 : 0);
      const dpr = canvas.width / w;
      const persp = (z: number) => DEPTH / (DEPTH - z);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.translate(w / 2, h / 2);

      // latitude rings the nodes sit on, plus the equator
      for (const lat of [-LAT, 0, LAT]) {
        ctx.beginPath();
        for (let k = 0; k <= 72; k++) {
          const a = (k / 72) * TAU;
          const p = turn(Math.cos(lat) * Math.sin(a), Math.sin(lat), Math.cos(lat) * Math.cos(a), yaw, tilt);
          const sc = persp(p.z) * R;
          if (k === 0) ctx.moveTo(p.x * sc, -p.y * sc);
          else ctx.lineTo(p.x * sc, -p.y * sc);
        }
        ctx.strokeStyle = `rgba(${ink},${lat === 0 ? (light ? 0.22 : 0.1) : light ? 0.42 : 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // the backdrop dots share a few shades, so they are drawn as a handful of paths
      for (const path of buckets) path.length = 0;
      for (const d of DOTS) {
        const p = turn(d.x, d.y, d.z, yaw, tilt);
        const sc = persp(p.z) * R;
        const depth = (p.z + 1) / 2;
        buckets[Math.min(BUCKETS - 1, Math.floor(depth * BUCKETS))].push(p.x * sc, -p.y * sc);
      }
      buckets.forEach((pts, b) => {
        if (!pts.length) return;
        const depth = (b + 0.5) / BUCKETS;
        const a = light ? 0.2 + depth * 0.6 : 0.06 + depth * 0.34;
        const rad = (light ? 0.9 : 0.7) + depth * 1.1;
        ctx.fillStyle = `rgba(${ink},${a.toFixed(3)})`;
        ctx.beginPath();
        for (let k = 0; k < pts.length; k += 2) {
          ctx.moveTo(pts[k] + rad, pts[k + 1]);
          ctx.arc(pts[k], pts[k + 1], rad, 0, TAU);
        }
        ctx.fill();
      });

      // the sphere turns slowly: ten redraws a second look the same as sixty and cost far less
      if (!t || t - coreAt > 90) {
        coreAt = t;
        drawCore(coreRef.current, fxActive ? t / 5200 : 0.6, light);
      }

      // nodes: labels ride the same projection
      const act = activeRef.current;
      NODES.forEach((n, i) => {
        const p = turn(n.x, n.y, n.z, yaw, tilt);
        const sc = persp(p.z) * R;
        const px = p.x * sc;
        const py = -p.y * sc;
        const depth = (p.z + 1) / 2;
        const btn = btnRefs.current[i];
        if (btn) {
          // lean each pill toward the sphere's axis so it reads as a tile on the surface, not a flat sticker
          const ry = (-p.x * 38).toFixed(1);
          const rx = (p.y * 18).toFixed(1);
          btn.style.transform = `translate(-50%,-50%) translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) perspective(420px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${(0.86 + depth * 0.2).toFixed(3)})`;
          btn.style.zIndex = p.z > 0 ? "20" : "5";
          btn.style.setProperty("--d", i === act ? "1" : (0.5 + depth * 0.5).toFixed(2));
        }
        const ln = lineRefs.current[i];
        if (ln) {
          ln.setAttribute("x2", px.toFixed(1));
          ln.setAttribute("y2", py.toFixed(1));
          ln.style.opacity = String(i === act ? 1 : 0.12 + depth * 0.28);
        }
        if (i === act && pulseRef.current) {
          const f = fxActive ? (t % 1700) / 1700 : 1;
          pulseRef.current.setAttribute("cx", (px * f).toFixed(1));
          pulseRef.current.setAttribute("cy", (py * f).toFixed(1));
        }
      });
    };
    renderRef.current = render;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (minFrame && now - drawnAt < minFrame) return;
      drawnAt = now;
      const dt = Math.min(now - (last || now), 50);
      last = now;
      if (!st.drag) st.yaw += (st.target - st.yaw) * Math.min(1, dt * 0.005);
      render(now);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(root);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 });
    io.observe(root);
    measure();
    if (fxActive) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [fxActive, mounted, compact]);

  // drag to spin; on release settle on whichever area faces the viewer
  const onPointerDown = (e: React.PointerEvent) => {
    const st = s.current;
    st.drag = true;
    st.moved = 0;
    st.lastX = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const st = s.current;
    if (!st.drag) return;
    const dx = e.clientX - st.lastX;
    st.lastX = e.clientX;
    st.moved += Math.abs(dx);
    if (st.moved > 6) {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      st.yaw -= dx * 0.009;
      st.target = st.yaw;
      if (!fxActive) renderRef.current(0);
    }
  };
  const endDrag = () => {
    const st = s.current;
    if (!st.drag) return;
    st.drag = false;
    if (st.moved <= 6) return;
    // the area whose turn is nearest to where the globe stopped. Comparing depth instead only
    // ever picked the upper ring: it is tilted toward the viewer, so its nodes always sit nearer.
    let best = 0;
    let bestGap = Infinity;
    NODES.forEach((n, i) => {
      const gap = Math.abs(((st.yaw - n.a + Math.PI) % TAU + TAU) % TAU - Math.PI);
      if (gap < bestGap) {
        bestGap = gap;
        best = i;
      }
    });
    pickRef.current(best);
    const ta = NODES[best].a;
    st.target = ta + Math.round((st.yaw - ta) / TAU) * TAU;
    if (!fxActive) {
      st.yaw = st.target;
      renderRef.current(0);
    }
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative mx-auto aspect-square w-full max-w-xl cursor-grab touch-pan-y select-none overflow-hidden rounded-3xl active:cursor-grabbing lg:max-w-none",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-[10%] rounded-full bg-radial from-primary-500/35 via-primary-500/10 to-transparent to-70% blur-3xl"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <svg ref={svgRef} aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
        {NODES.map((_, i) => (
          <line
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            x1={0}
            y1={0}
            x2={0}
            y2={0}
            strokeWidth={1}
            strokeLinecap="round"
            className={cn("transition-[stroke] duration-500", i === active ? "stroke-primary-300" : "stroke-foreground")}
          />
        ))}
        {fxActive ? <circle ref={pulseRef} r={3} className="fill-primary-200" /> : null}
      </svg>

      <div
        dir="ltr"
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid size-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-[0_0_44px_color-mix(in_srgb,var(--primary)_40%,transparent),0_24px_30px_-12px_rgba(76,29,149,0.5)] dark:shadow-[0_0_44px_color-mix(in_srgb,var(--primary)_45%,transparent),0_30px_34px_-6px_rgba(0,0,0,0.75)]"
      >
        <canvas ref={coreRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      </div>

      {areas.map((area, i) => (
        <button
          key={area.title}
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          type="button"
          aria-pressed={i === active}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse" || s.current.drag || i === activeRef.current) return;
            const h = hover.current;
            if (performance.now() < h.lockUntil && Math.hypot(e.clientX - h.x, e.clientY - h.y) < 12) return;
            window.clearTimeout(h.timer);
            h.timer = window.setTimeout(() => {
              h.lockUntil = performance.now() + 1200;
              h.x = e.clientX;
              h.y = e.clientY;
              pickRef.current(i);
            }, 160);
          }}
          onPointerLeave={() => window.clearTimeout(hover.current.timer)}
          onFocus={() => onPick(i)}
          onClick={() => s.current.moved <= 6 && onPick(i)}
          style={{ left: "50%", top: "50%" }}
          className={cn(
            "absolute grid w-max place-items-center after:absolute after:-inset-2 after:content-[''] rounded-full border text-center text-[11px] font-bold leading-5 outline-none transition-[background-color,border-color,color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-8 sm:px-4 sm:py-2 sm:text-sm",
            i === active ? "max-sm:max-w-[8.5rem] max-sm:px-3 max-sm:py-1.5" : "max-sm:size-8",
            i === active
              ? "border-primary-300/60 bg-primary bg-linear-to-b from-white/30 to-transparent text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_3px_0_#4c1d95,0_6px_0_#2e1065,0_14px_26px_color-mix(in_srgb,var(--primary)_60%,transparent)]"
              : "border-[color-mix(in_srgb,var(--border)_calc(var(--d,1)*100%),var(--background))] bg-[color-mix(in_srgb,var(--secondary)_calc(var(--d,1)*100%),var(--background))] text-[color-mix(in_srgb,var(--muted-foreground)_calc(var(--d,1)*100%),var(--background))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_14px_-8px_rgba(20,10,60,0.45)] hover:text-foreground",
          )}
        >
          <span className={cn("sm:hidden", i !== active && "tabular-nums")}>
            {i === active ? area.title : (i + 1).toLocaleString(locale)}
          </span>
          <span className="hidden sm:inline">{area.title}</span>
        </button>
      ))}
    </div>
  );
}
