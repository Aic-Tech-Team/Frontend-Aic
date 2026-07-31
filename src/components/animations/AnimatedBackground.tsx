"use client";

import { useEffect, useRef } from "react";

interface BlobDef {
  wrapperClass: string;
  blobClass: string;
  style: React.CSSProperties;
  speed: number;
}

const blobs: BlobDef[] = [
  {
    wrapperClass: "blob-wrapper",
    blobClass: "blob blob-1",
    style: { top: "-10%", insetInlineStart: "-8%" },
    speed: 0.12,
  },
  {
    wrapperClass: "blob-wrapper",
    blobClass: "blob blob-2",
    style: { top: "4%", insetInlineEnd: "-10%" },
    speed: 0.22,
  },
  {
    wrapperClass: "blob-wrapper",
    blobClass: "blob blob-3",
    style: { bottom: "18%", insetInlineStart: "6%" },
    speed: 0.10,
  },
  {
    wrapperClass: "blob-wrapper",
    blobClass: "blob blob-4",
    style: { bottom: "-12%", insetInlineEnd: "8%" },
    speed: 0.28,
  },
  {
    wrapperClass: "blob-wrapper",
    blobClass: "blob blob-5",
    style: { top: "15%", insetInlineEnd: "33%" },
    speed: 0.16,
  },
  {
    wrapperClass: "blob-wrapper",
    blobClass: "blob blob-6",
    style: { bottom: "10%", insetInlineStart: "54%" },
    speed: 0.2,
  },
  {
    wrapperClass: "blob-wrapper",
    blobClass: "blob blob-7",
    style: { top: "56%", insetInlineEnd: "9%" },
    speed: 0.14,
  },
  {
    wrapperClass: "blob-wrapper",
    blobClass: "blob blob-8",
    style: { bottom: "45%", insetInlineStart: "35%" },
    speed: 0.11,
  },
];

export function AnimatedBackground() {
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafId = useRef<number | null>(null);
  const targetY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      targetY.current = window.scrollY;
    };

    const tick = () => {
      currentY.current += (targetY.current - currentY.current) * 0.07;

      wrapperRefs.current.forEach((el, i) => {
        if (!el) return;
        const offset = currentY.current * blobs[i].speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });

      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="blob-bg" aria-hidden="true">
      {blobs.map((blob, i) => (
        <div
          key={i}
          ref={(el) => {
            wrapperRefs.current[i] = el;
          }}
          className={blob.wrapperClass}
          style={blob.style}
        >
          <div className={blob.blobClass} />
        </div>
      ))}
    </div>
  );
}