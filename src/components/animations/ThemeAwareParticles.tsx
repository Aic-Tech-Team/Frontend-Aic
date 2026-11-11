"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useIdleReady } from "@/hooks/useIdleReady";
import { useMotionCapability } from "@/hooks/useMotionCapability";

const Particles = dynamic(() => import("./Particles"), { ssr: false });

const COLORS_LIGHT = ["#5b2fc8", "#7a4fe0"] as const;
const COLORS_DARK = ["#ffffff"] as const;

interface ThemeAwareParticlesProps {
  particleSpread?: number;
  speed?: number;
  moveParticlesOnHover?: boolean;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  disableRotation?: boolean;
  pixelRatio?: number;
  depth?: number;
  opacity?: number;
}

export function ThemeAwareParticles(props: ThemeAwareParticlesProps) {
  const { resolvedTheme } = useTheme();
  const idle = useIdleReady();
  const { mounted, prefersReducedMotion, isVisible, particleCount } =
    useMotionCapability();

  if (!idle || !mounted || prefersReducedMotion || particleCount <= 0) return null;

  const particleColors =
    resolvedTheme === "light" ? COLORS_LIGHT : COLORS_DARK;

  return (
    <Particles
      {...props}
      particleCount={particleCount}
      {...(resolvedTheme === "light" ? { opacity: 1 } : {})}
      particleColors={particleColors as unknown as string[]}
      paused={!isVisible}
    />
  );
}
