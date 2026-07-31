"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Particles from "./Particles";

interface ThemeAwareParticlesProps {
  particleCount?: number;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const particleColors =
    resolvedTheme === "light" ? ["#3f0861"] : ["#ffffff"];

  return (
    <Particles
      key={resolvedTheme}
      {...props}
      particleColors={particleColors}
    />
  );
}