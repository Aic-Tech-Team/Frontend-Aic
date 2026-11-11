"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { markBooted } from "@/lib/boot";

/** First visit of a session shows the whole opening; later loads only need to cover the hydration. */
const MIN_VISIBLE_MS = 900;
const MIN_VISIBLE_RETURN_MS = 250;
const MAX_WAIT_MS = 5500;
const CURTAIN_MS = 700;

const POLAR = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [Math.round(Math.cos(a) * r * 10) / 10, Math.round(Math.sin(a) * r * 10) / 10] as const;
};
const INNER = Array.from({ length: 6 }, (_, i) => POLAR(58, -90 + i * 60));
const OUTER = Array.from({ length: 6 }, (_, i) => POLAR(90, -60 + i * 60));
/** [x1, y1, x2, y2] for every line of the little network around the logo. */
const EDGES: [number, number, number, number][] = [
  ...INNER.map((p) => [0, 0, p[0], p[1]] as [number, number, number, number]),
  ...INNER.map((p, i) => [p[0], p[1], INNER[(i + 1) % 6][0], INNER[(i + 1) % 6][1]] as [number, number, number, number]),
  ...INNER.map((p, i) => [p[0], p[1], OUTER[i][0], OUTER[i][1]] as [number, number, number, number]),
];
const NODES = [...INNER, ...OUTER];

/**
 * Full-screen loader that is part of the server HTML, so it paints with the first bytes while
 * the page underneath hydrates. A small network draws itself around the logo, a counter climbs
 * as fonts, the window and (on pages with a globe) its first frame become ready, then the
 * screen parts like a curtain. Entrance animations are gated on it through `@/lib/boot`.
 */
export function BootLoader({ brand }: { brand: string }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const count = countRef.current;
    const fill = fillRef.current;
    if (!el || !count || !fill) {
      markBooted();
      return;
    }
    const started = performance.now();
    let minVisible = MIN_VISIBLE_MS;
    try {
      if (sessionStorage.getItem("aic-boot")) minVisible = MIN_VISIBLE_RETURN_MS;
      sessionStorage.setItem("aic-boot", "1");
    } catch {}
    const fmt = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 });
    let target = 12;
    let shown = 0;
    let ready = false;
    let leaving = false;
    let raf = 0;
    let last = started;
    let lastInt = -1;

    const leave = () => {
      if (leaving) return;
      leaving = true;
      el.classList.add("is-leaving");
      markBooted();
      window.setTimeout(() => el.classList.add("is-hidden"), CURTAIN_MS + 400);
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 60);
      last = now;
      // never show 100 before everything is really ready
      const cap = ready && now - started >= minVisible ? 100 : Math.min(target, 92);
      shown += (cap - shown) * (1 - Math.exp(-dt * 0.0048));
      if (cap === 100 && shown > 99.4) shown = 100;
      // only touch the DOM when something visible changes: the counter once per whole number,
      // the line through its own transform (no style recalculation of the whole loader)
      const whole = Math.round(shown);
      if (whole !== lastInt) {
        lastInt = whole;
        count.textContent = fmt.format(whole);
      }
      fill.style.transform = `scaleX(${(shown / 100).toFixed(3)})`;
      if (shown >= 100) {
        window.setTimeout(leave, 320);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const fonts = (document.fonts?.ready ?? Promise.resolve()).then(() => (target = Math.max(target, 45)));
    // the window `load` (every image) only moves the counter: waiting on it kept the curtain
    // down for as long as the slowest picture below the fold
    void (
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }))
    ).then(() => (target = Math.max(target, 78)));
    // a page with a globe holds the loader until its first frame
    const globe = document.querySelector("[data-boot-wait]")
      ? new Promise<void>((r) => window.addEventListener("aic:ready", () => r(), { once: true }))
      : Promise.resolve();

    const cap = window.setTimeout(() => (ready = true), MAX_WAIT_MS);
    // a background tab throttles animation frames: never let that keep the page covered
    const hardStop = window.setTimeout(leave, MAX_WAIT_MS + 2500);
    void Promise.all([fonts, globe]).then(() => {
      window.clearTimeout(cap);
      ready = true;
    });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);
      window.clearTimeout(hardStop);
    };
  }, [locale]);

  return (
    <div id="boot-loader" ref={ref} aria-hidden="true" suppressHydrationWarning>
      <span className="boot-half boot-half--top" />
      <span className="boot-half boot-half--bottom" />
      <div className="boot-stage">
        <span className="boot-glow" />
        <span className="boot-grid" />
        <div className="boot-core">
          <span className="boot-wave" />
          <span className="boot-wave" style={{ animationDelay: "1s" }} />
          <span className="boot-wave" style={{ animationDelay: "2s" }} />
          <svg className="boot-net" viewBox="-100 -100 200 200" fill="none">
            {EDGES.map(([x1, y1, x2, y2], i) => (
              <path
                key={i}
                d={`M${x1} ${y1}L${x2} ${y2}`}
                pathLength={1}
                className="boot-edge"
              />
            ))}
            {NODES.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i < 6 ? 2.6 : 1.8}
                className="boot-node"
              />
            ))}
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/AIC_logo_notext.svg" alt="" width={96} height={96} fetchPriority="high" decoding="async" />
        </div>
        <div className="boot-foot">
          <span className="boot-brand">{brand}</span>
          <span className="boot-count" dir="ltr">
            <b ref={countRef}>00</b>
            <i>%</i>
          </span>
        </div>
        <span className="boot-line">
          <span ref={fillRef} className="boot-line__fill" />
        </span>
      </div>
      <noscript>
        <style>{"#boot-loader{display:none}"}</style>
      </noscript>
    </div>
  );
}
