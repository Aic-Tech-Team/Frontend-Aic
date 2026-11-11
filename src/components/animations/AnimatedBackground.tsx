"use client";

import { useEffect, useRef } from "react";
import { useMotionCapability } from "@/hooks/useMotionCapability";
import type { BlobTier } from "@/lib/motion-capability";

type BlobDef = {
  wrapperClass: string;
  blobClass: string;
  style: React.CSSProperties;
  speed: number;
  fullOnly?: boolean;
};

const BLOBS: BlobDef[] = [
  { wrapperClass: "blob-wrapper", blobClass: "blob blob-1", style: { top: "-16%", insetInlineStart: "-14%" }, speed: 0.1 },
  { wrapperClass: "blob-wrapper", blobClass: "blob blob-2", style: { top: "-4%", insetInlineEnd: "-12%" }, speed: 0.2 },
  { wrapperClass: "blob-wrapper", blobClass: "blob blob-3", style: { top: "40%", insetInlineEnd: "-10%" }, speed: 0.14 },
  { wrapperClass: "blob-wrapper", blobClass: "blob blob-4", style: { bottom: "-18%", insetInlineStart: "-10%" }, speed: 0.26 },
  { wrapperClass: "blob-wrapper", blobClass: "blob blob-5", style: { bottom: "14%", insetInlineEnd: "20%" }, speed: 0.18 },
  { wrapperClass: "blob-wrapper", blobClass: "blob blob-6", style: { top: "24%", insetInlineStart: "8%" }, speed: 0.08 },
];

function blobsForTier(tier: BlobTier) {
  if (tier === "off") return [];
  // Lite keeps every orb, but CSS freezes them. Cutting orbs left mobile flat.
  return BLOBS;
}

export function AnimatedBackground() {
  const { prefersReducedMotion, fxActive, blobTier } = useMotionCapability();
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const speedsRef = useRef<number[]>([]);
  const rafId = useRef<number | null>(null);
  const targetY = useRef(0);
  const currentY = useRef(0);
  const activeBlobs = blobsForTier(blobTier);

  useEffect(() => {
    speedsRef.current = blobsForTier(blobTier).map((b) => b.speed);
  }, [blobTier]);

  useEffect(() => {
    if (prefersReducedMotion || !fxActive || blobTier !== "full") {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      wrapperRefs.current.forEach((el) => {
        if (el) el.style.transform = "";
      });
      return;
    }

    // only the full tier gets here (the guard above), so one easing is enough
    const lerp = 0.07;
    let ticking = false;

    const tick = () => {
      const diff = targetY.current - currentY.current;
      currentY.current += diff * lerp;

      wrapperRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transform = `translate3d(0, ${currentY.current * (speedsRef.current[i] ?? 0.1)}px, 0)`;
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
