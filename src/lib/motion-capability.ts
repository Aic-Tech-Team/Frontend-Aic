export type BlobTier = "full" | "lite";
export type BorderQuality = "full" | "lite";

export type MotionCapability = {
  mounted: boolean;
  isFinePointer: boolean;
  prefersReducedMotion: boolean;
  isNarrow: boolean;
  isVisible: boolean;
  /** Heavy FX should run (visible + not reduced-motion). */
  fxActive: boolean;
  particleCount: number;
  blobTier: BlobTier;
  borderQuality: BorderQuality;
};

export const NARROW_MQ = "(max-width: 768px)";
export const FINE_POINTER_MQ = "(pointer: fine)";
export const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

export const PARTICLE_COUNT_DESKTOP = 220;
export const PARTICLE_COUNT_MOBILE = 100;

export function readMotionCapability(): Omit<MotionCapability, "mounted"> {
  if (typeof window === "undefined") {
    return {
      isFinePointer: true,
      prefersReducedMotion: false,
      isNarrow: false,
      isVisible: true,
      fxActive: true,
      particleCount: PARTICLE_COUNT_DESKTOP,
      blobTier: "full",
      borderQuality: "full",
    };
  }

  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_MQ).matches;
  const isFinePointer = window.matchMedia(FINE_POINTER_MQ).matches;
  const isNarrow = window.matchMedia(NARROW_MQ).matches;
  const isVisible = document.visibilityState === "visible";
  const fxActive = isVisible && !prefersReducedMotion;

  return {
    isFinePointer,
    prefersReducedMotion,
    isNarrow,
    isVisible,
    fxActive,
    particleCount: isNarrow ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP,
    blobTier: isNarrow ? "lite" : "full",
    borderQuality: isNarrow ? "lite" : "full",
  };
}
