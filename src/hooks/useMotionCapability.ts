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
  isLowEnd: false,
  fxActive: false,
  particleCount: 0,
  blobTier: "full",
  borderQuality: "full",
  allowSplash: false,
};

const CAP_KEYS = [
  "mounted",
  "isFinePointer",
  "prefersReducedMotion",
  "isNarrow",
  "isVisible",
  "isLowEnd",
  "fxActive",
  "particleCount",
  "blobTier",
  "borderQuality",
  "allowSplash",
] as const satisfies readonly (keyof MotionCapability)[];

function sameCapability(a: MotionCapability, b: MotionCapability) {
  return CAP_KEYS.every((key) => a[key] === b[key]);
}

export function useMotionCapability(): MotionCapability {
  const [cap, setCap] = useState<MotionCapability>(SSR_CAPABILITY);

  useEffect(() => {
    const sync = () => {
      const next: MotionCapability = { mounted: true, ...readMotionCapability() };
      setCap((prev) => (sameCapability(prev, next) ? prev : next));
    };

    sync();

    const medias = [
      window.matchMedia(REDUCED_MOTION_MQ),
      window.matchMedia(FINE_POINTER_MQ),
      window.matchMedia(NARROW_MQ),
    ];

    medias.forEach((mq) => mq.addEventListener("change", sync));
    document.addEventListener("visibilitychange", sync);

    return () => {
      medias.forEach((mq) => mq.removeEventListener("change", sync));
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return cap;
}
