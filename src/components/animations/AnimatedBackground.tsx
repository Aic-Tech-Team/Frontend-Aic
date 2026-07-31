"use client";

import { useEffect, useRef } from "react";
import { useMotionCapability } from "@/hooks/useMotionCapability";

interface BlobDef {
  wrapperClass: string;
  blobClass: string;
  style: React.CSSProperties;
  speed: number;
  /** Hide on lite (mobile) tier to cut GPU blur cost. */
  fullOnly?: boolean;
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
    speed: 0.1,
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
    fullOnly: true,
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
    fullOnly: true,
  },
  {
    wrapperClass: "blob-wrapper",
    blobClass: "blob blob-8",
    style: { bottom: "45%", insetInlineStart: "35%" },
    speed: 0.11,
    fullOnly: true,
  },
];

export function AnimatedBackground() {
  const { prefersReducedMotion, fxActive, blobTier } = useMotionCapability();
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const speedsRef = useRef<number[]>([]);
  const rafId = useRef<number | null>(null);
  const targetY = useRef(0);
  const currentY = useRef(0);

  const activeBlobs =
    blobTier === "lite" ? blobs.filter((b) => !b.fullOnly) : blobs;

  useEffect(() => {
    const list = blobTier === "lite" ? blobs.filter((b) => !b.fullOnly) : blobs;
    speedsRef.current = list.map((b) => b.speed);
  }, [blobTier]);

  useEffect(() => {
    if (prefersReducedMotion || !fxActive) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      return;
    }

    const lerp = blobTier === "lite" ? 0.12 : 0.07;
    let ticking = false;

    const tick = () => {
      const diff = targetY.current - currentY.current;
      currentY.current += diff * lerp;

      wrapperRefs.current.forEach((el, i) => {
        if (!el) return;
        const speed = speedsRef.current[i] ?? 0.1;
        el.style.transform = `translate3d(0, ${currentY.current * speed}px, 0)`;
      });

      if (Math.abs(diff) > 0.15) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        ticking = false;
        rafId.current = null;
      }
    };

    const handleScroll = () => {
      targetY.current = window.scrollY;
      if (!ticking) {
        ticking = true;
        rafId.current = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [prefersReducedMotion, fxActive, blobTier]);

  return (
    <div
      className={`blob-bg${blobTier === "lite" ? " blob-bg--lite" : ""}`}
      aria-hidden="true"
    >
      {activeBlobs.map((blob, i) => (
        <div
          key={blob.blobClass}
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
