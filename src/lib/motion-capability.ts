export type BlobTier = "full" | "lite" | "off";
export type BorderQuality = "full" | "lite";

export type MotionCapability = {
  mounted: boolean;
  isFinePointer: boolean;
  prefersReducedMotion: boolean;
  isNarrow: boolean;
  isVisible: boolean;
  isLowEnd: boolean;
  fxActive: boolean;
  particleCount: number;
  blobTier: BlobTier;
  borderQuality: BorderQuality;
  allowSplash: boolean;
};

export const NARROW_MQ = "(max-width: 768px)";
/** Phones / tablets, including landscape where width exceeds 768. */
export const COARSE_MQ = "(hover: none) and (pointer: coarse)";
export const FINE_POINTER_MQ = "(pointer: fine)";
export const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

export const PARTICLE_COUNT_DESKTOP = 72;
export const PARTICLE_COUNT_LOW_END = 28

function detectLowEnd(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 8;
  const mem =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData === true;
  return saveData || cores <= 2 || mem <= 2;
}

function particleBudget(
  prefersReducedMotion: boolean,
  isNarrow: boolean,
  isLowEnd: boolean,
): number {
  // Full-viewport WebGL canvas costs more than the point count.
  // Compact devices skip the canvas entirely.
  if (prefersReducedMotion || isNarrow) return 0;
  if (isLowEnd) return PARTICLE_COUNT_LOW_END;
  return PARTICLE_COUNT_DESKTOP;
}

export function readMotionCapability(): Omit<MotionCapability, "mounted"> {
  if (typeof window === "undefined") {
    return {
      isFinePointer: true,
      prefersReducedMotion: false,
      isNarrow: false,
      isVisible: true,
      isLowEnd: false,
      fxActive: true,
      particleCount: PARTICLE_COUNT_DESKTOP,
      blobTier: "full",
      borderQuality: "full",
      allowSplash: true,
    };
  }

  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_MQ).matches;
  const isFinePointer = window.matchMedia(FINE_POINTER_MQ).matches;
  const isNarrow =
    window.matchMedia(NARROW_MQ).matches ||
    window.matchMedia(COARSE_MQ).matches;
  const isVisible = document.visibilityState === "visible";
  const isLowEnd = detectLowEnd();
  const fxActive = isVisible && !prefersReducedMotion;
  const lite = isNarrow || isLowEnd;

  return {
    isFinePointer,
    prefersReducedMotion,
    isNarrow,
    isVisible,
    isLowEnd,
    fxActive,
    particleCount: particleBudget(prefersReducedMotion, isNarrow, isLowEnd),
    blobTier: prefersReducedMotion ? "off" : lite ? "lite" : "full",
    borderQuality: lite ? "lite" : "full",
    allowSplash: fxActive && isFinePointer && !isNarrow && !isLowEnd,
  };
}
