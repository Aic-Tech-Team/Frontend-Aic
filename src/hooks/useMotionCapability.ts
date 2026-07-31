"use client";

import { useEffect, useState } from "react";
import {
  FINE_POINTER_MQ,
  NARROW_MQ,
  REDUCED_MOTION_MQ,
  readMotionCapability,
  type MotionCapability,
} from "@/lib/motion-capability";

const SSR_CAPABILITY: MotionCapability = {
  mounted: false,
  isFinePointer: true,
  prefersReducedMotion: false,
  isNarrow: false,
  isVisible: true,
  fxActive: false,
  particleCount: 0,
  blobTier: "full",
  borderQuality: "full",
};

function sameCapability(a: MotionCapability, b: MotionCapability): boolean {
  return (
    a.mounted === b.mounted &&
    a.isFinePointer === b.isFinePointer &&
    a.prefersReducedMotion === b.prefersReducedMotion &&
    a.isNarrow === b.isNarrow &&
    a.isVisible === b.isVisible &&
    a.fxActive === b.fxActive &&
    a.particleCount === b.particleCount &&
    a.blobTier === b.blobTier &&
    a.borderQuality === b.borderQuality
  );
}

export function useMotionCapability(): MotionCapability {
  const [cap, setCap] = useState<MotionCapability>(SSR_CAPABILITY);

  useEffect(() => {
    const sync = () => {
      const next: MotionCapability = {
        mounted: true,
        ...readMotionCapability(),
      };
      setCap((prev) => (sameCapability(prev, next) ? prev : next));
    };

    sync();

    const reduced = window.matchMedia(REDUCED_MOTION_MQ);
    const fine = window.matchMedia(FINE_POINTER_MQ);
    const narrow = window.matchMedia(NARROW_MQ);

    reduced.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      reduced.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return cap;
}
