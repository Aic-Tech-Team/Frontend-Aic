"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useMotionCapability } from "@/hooks/useMotionCapability";

const Particles = dynamic(() => import("./Particles"), { ssr: false });

const COLORS_LIGHT = ["#3f0861"] as const;
const COLORS_DARK = ["#ffffff"] as const;

interface ThemeAwareParticlesProps {
  particleSpread?: number;
  speed?: number;
  moveParticlesOnHover?: boolean;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  disableRotation?: boolean;
  pixelRatio?: number;
}

export function ThemeAwareParticles(props: ThemeAwareParticlesProps) {
  const { resolvedTheme } = useTheme();
  const { mounted, prefersReducedMotion, isVisible, particleCount } =
    useMotionCapability();

  if (!mounted || prefersReducedMotion || particleCount <= 0) return null;

  const particleColors =
    resolvedTheme === "light" ? COLORS_LIGHT : COLORS_DARK;

  return (
    <Particles
      {...props}
      particleCount={particleCount}
      particleColors={particleColors as unknown as string[]}
      paused={!isVisible}
    />
  );
}
