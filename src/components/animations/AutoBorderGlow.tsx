"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useTheme } from "next-themes";
import { useMotionCapability } from "@/hooks/useMotionCapability";
import "./AutoBorderGlow.css";

interface AutoBorderGlowProps {
  children?: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  colors?: string[];
  fillOpacity?: number;
  speed?: number;
  reverse?: boolean;
  lightModeBoost?: number;
  /** Starting angle offset in degrees (0–360) so multiple cards stay out of sync */
  phaseOffset?: number;
}

function parseHSL(hslStr: string): { h: number; s: number; l: number } {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

function buildBoxShadow(glowColor: string, intensity: number): string {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const layers: [number, number, number, number, number, boolean][] = [
    [0, 0, 0, 1, 100, true],
    [0, 0, 1, 0, 60, true],
    [0, 0, 3, 0, 50, true],
    [0, 0, 6, 0, 40, true],
    [0, 0, 15, 0, 30, true],
    [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 1, 0, 60, false],
    [0, 0, 3, 0, 50, false],
    [0, 0, 6, 0, 40, false],
    [0, 0, 15, 0, 30, false],
    [0, 0, 25, 2, 20, false],
    [0, 0, 50, 2, 10, false],
  ];
  return layers
    .map(([x, y, blur, spread, alpha, inset]) => {
      const a = Math.min(alpha * intensity, 100);
      return `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
    })
    .join(", ");
}

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors: string[]): string[] {
  const gradients: string[] = [];
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    gradients.push(
      `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`
    );
  }
  gradients.push(`linear-gradient(${colors[0]} 0 100%)`);
  return gradients;
}

/** Cheap static ring — no @property spin, no multi-mask, no 13-layer shadow. */
function LiteBorderShell({
  children,
  className,
  borderRadius,
  backgroundColor,
  colors,
}: {
  children?: ReactNode;
  className: string;
  borderRadius: number;
  backgroundColor: string;
  colors: string[];
}) {
  const accent = colors[0] ?? "#c084fc";
  return (
    <div
      className={`relative grid isolate overflow-hidden bg-transparent ${className}`}
      style={{
        background:
          backgroundColor === "transparent" ? undefined : backgroundColor,
        borderRadius: `${borderRadius}px`,
        boxShadow: `
          0 0 0 1px color-mix(in srgb, ${accent} 55%, transparent),
          0 10px 28px -18px color-mix(in srgb, var(--primary) 35%, transparent)
        `,
      }}
    >
      <div className="relative z-[1] flex h-full min-h-0 flex-col overflow-visible rounded-[inherit]">
        {children}
      </div>
    </div>
  );
}

const AutoBorderGlow: React.FC<AutoBorderGlowProps> = ({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "transparent",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  fillOpacity = 0.5,
  speed = 6,
  reverse = false,
  lightModeBoost = 1.7,
  phaseOffset = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isNarrow, prefersReducedMotion, mounted: capMounted } =
    useMotionCapability();

  const { resolvedTheme } = useTheme();
  const themeMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isLight = themeMounted && resolvedTheme === "light";
  const themeBoost = isLight ? lightModeBoost : 1;

  // Mobile / reduced-motion: static ring only (spinning masks destroy weak GPUs)
  const useLite =
    !capMounted || isNarrow || prefersReducedMotion;

  useEffect(() => {
    if (useLite) return;
    const el = cardRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        el.querySelectorAll<HTMLElement>(".abg-spin").forEach((node) => {
          node.style.animationPlayState = entry.isIntersecting
            ? "running"
            : "paused";
        });
      },
      { rootMargin: "60px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [useLite]);

  if (useLite) {
    return (
      <LiteBorderShell
        className={className}
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        colors={colors}
      >
        {children}
      </LiteBorderShell>
    );
  }

  const edgeProximity = 1;
  const colorSensitivity = edgeSensitivity + 20;
  const rawBorderOpacity = Math.max(
    0,
    (edgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity)
  );
  const rawGlowOpacity = Math.max(
    0,
    (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity)
  );

  const borderOpacity = Math.min(1, rawBorderOpacity * themeBoost);
  const glowOpacity = Math.min(1, rawGlowOpacity * themeBoost);
  const effectiveGlowIntensity = glowIntensity * themeBoost;

  const meshGradients = buildMeshGradients(colors);
  const borderBg = meshGradients.map((g) => `${g} border-box`);
  const fillBg = meshGradients.map((g) => `${g} padding-box`);
  const fillColor =
    backgroundColor === "transparent" ? "var(--card)" : backgroundColor;
  const offset = ((phaseOffset % 360) + 360) % 360;
  const duration = `${speed}s`;
  const direction = reverse ? "reverse" : "normal";

  const spinStyle = {
    "--abg-duration": duration,
    "--abg-direction": direction,
    animationDelay: `-${(offset / 360) * speed}s`,
  } as CSSProperties;

  return (
    <div
      ref={cardRef}
      className={`relative grid isolate overflow-hidden bg-transparent ${className}`}
      style={{
        background:
          backgroundColor === "transparent" ? undefined : backgroundColor,
        borderRadius: `${borderRadius}px`,
        transform: "translate3d(0, 0, 0.01px)",
        boxShadow:
          "0 12px 40px -24px color-mix(in srgb, var(--primary) 35%, transparent)",
      }}
    >
      <div
        className="abg-spin absolute inset-0 -z-[1] rounded-[inherit]"
        style={{
          ...spinStyle,
          border: "1px solid transparent",
          background: [
            `linear-gradient(${fillColor} 0 100%) padding-box`,
            "linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box",
            ...borderBg,
          ].join(", "),
          opacity: borderOpacity,
          maskImage: `conic-gradient(from var(--abg-angle) at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          WebkitMaskImage: `conic-gradient(from var(--abg-angle) at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
        }}
      />

      <div
        className="abg-spin absolute inset-0 -z-[1] rounded-[inherit]"
        style={
          {
            ...spinStyle,
            border: "1px solid transparent",
            background: fillBg.join(", "),
            maskImage: [
              "linear-gradient(to bottom, black, black)",
              "radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)",
              "radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)",
              "radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)",
              "radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)",
              "radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)",
              `conic-gradient(from var(--abg-angle) at center, transparent 5%, black 15%, black 85%, transparent 95%)`,
            ].join(", "),
            WebkitMaskImage: [
              "linear-gradient(to bottom, black, black)",
              "radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)",
              "radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)",
              "radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)",
              "radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)",
              "radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)",
              `conic-gradient(from var(--abg-angle) at center, transparent 5%, black 15%, black 85%, transparent 95%)`,
            ].join(", "),
            maskComposite: "subtract, add, add, add, add, add",
            WebkitMaskComposite:
              "source-out, source-over, source-over, source-over, source-over, source-over",
            opacity: borderOpacity * fillOpacity,
            mixBlendMode: "soft-light",
          } as CSSProperties
        }
      />

      <span
        className="abg-spin pointer-events-none absolute z-[1] rounded-[inherit]"
        style={
          {
            ...spinStyle,
            inset: `${-glowRadius}px`,
            maskImage: `conic-gradient(from var(--abg-angle) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
            WebkitMaskImage: `conic-gradient(from var(--abg-angle) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
            opacity: glowOpacity,
            mixBlendMode: "plus-lighter",
          } as CSSProperties
        }
      >
        <span
          className="absolute rounded-[inherit]"
          style={{
            inset: `${glowRadius}px`,
            boxShadow: buildBoxShadow(glowColor, effectiveGlowIntensity),
          }}
        />
      </span>

      <div className="relative z-[1] flex h-full min-h-0 flex-col overflow-visible rounded-[inherit]">
        {children}
      </div>
    </div>
  );
};

export default AutoBorderGlow;
