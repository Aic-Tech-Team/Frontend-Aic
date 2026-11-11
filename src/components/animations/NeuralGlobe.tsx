"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Camera, Geometry, Mesh, Program, Renderer, Sphere, Transform } from "ogl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotionCapability } from "@/hooks/useMotionCapability";
import { whenBooted } from "@/lib/boot";
import { GLOBE_HUB, GLOBE_PEERS, IRAN_RING, LAND_RINGS, isIran, isLand, type Ring } from "@/lib/globe-land";
import { cn } from "@/lib/utils";

/**
 * 3D "neural" globe (ogl/WebGL): land-masked Fibonacci dots over real coastlines,
 * Iran outlined as the signal hub, a lit core with an atmosphere rim, neural links
 * across the continents, and great-circle signal arcs that draw on from the middle
 * of Iran to peer cities, deliver a packet and ripple on arrival.
 * GSAP drives the intro and scroll spin; drag/tilt are pointer-driven.
 * Pauses off-screen / hidden tab; reduced motion renders one static frame.
 */

export interface GlobeMarker {
  lat: number;
  lon: number;
}

interface NeuralGlobeProps {
  className?: string;
  /** Hub location (degrees). Defaults to Tehran. */
  marker?: GlobeMarker;
  /** Keep the hub facing the viewer and only sway (no free spin / drag). */
  lockMarker?: boolean;
  /** Pointer tilt + drag-to-spin (fine pointers / touch). */
  interactive?: boolean;
  /** Dot count; reduced automatically on weak / narrow devices. */
  density?: number;
}

type Tone = {
  a: number[];
  b: number[];
  fillA: number[];
  fillB: number[];
  rim: number[];
  /** Accent for Iran (border, dots, hub). */
  hot: number[];
  additive: boolean;
};
const PALETTE: Record<"dark" | "light", Tone> = {
  dark: {
    a: [0.78, 0.55, 1.0],
    b: [0.24, 0.72, 0.96],
    fillA: [0.09, 0.05, 0.22],
    fillB: [0.02, 0.01, 0.07],
    rim: [0.5, 0.36, 1.0],
    hot: [1.0, 0.78, 0.42],
    additive: true,
  },
  light: {
    a: [0.36, 0.14, 0.72],
    b: [0.1, 0.4, 0.75],
    fillA: [0.97, 0.95, 1.0],
    fillB: [0.84, 0.8, 0.96],
    rim: [0.52, 0.36, 0.9],
    hot: [0.86, 0.42, 0.04],
    additive: false,
  },
};

/** Signal cycle: arcs draw on for ARC_DRAW of the cycle, then the packet lands and ripples. */
const ARC_SPEED = 0.19;
const ARC_DRAW = 0.58;

const DOT_VS = /* glsl */ `
  attribute vec3 position;
  attribute float aSeed;
  attribute float aLand;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uPx;
  uniform float uSize;
  uniform float uReveal;
  varying float vDepth;
  varying float vLand;
  void main() {
    vec3 p = position * mix(1.7, 1.0, uReveal);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = smoothstep(-5.3, -3.1, mv.z);
    vLand = aLand;
    float land = min(aLand, 1.0);
    float iran = step(1.5, aLand);
    float tw = 1.0 + (0.4 + 0.5 * iran) * sin(uTime * (1.5 + iran) + aSeed * 6.2831) * land;
    float base = mix(0.3, 1.0, land) * (1.0 + 0.35 * iran);
    gl_PointSize = uSize * uPx * base * (0.55 + 0.9 * vDepth) * tw * uReveal;
    gl_Position = projectionMatrix * mv;
  }
`;

const DOT_FS = /* glsl */ `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uHot;
  uniform float uReveal;
  uniform float uLight;
  varying float vDepth;
  varying float vLand;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    float land = min(vLand, 1.0);
    float iran = step(1.5, vLand);
    vec3 c = mix(mix(uColorB, uColorA, vDepth), uHot, iran);
    float k = mix(0.14, 1.0, vDepth) * mix(0.22, 1.0, land) * mix(1.0, 1.3, uLight);
    gl_FragColor = vec4(c, a * k * uReveal);
  }
`;

const LINE_VS = /* glsl */ `
  attribute vec3 position;
  attribute float aSeed;
  attribute float aT;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uReveal;
  varying float vDepth;
  varying float vSeed;
  varying float vT;
  void main() {
    vec3 p = position * mix(1.7, 1.0, uReveal);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = smoothstep(-5.3, -3.1, mv.z);
    vSeed = aSeed;
    vT = aT;
    gl_Position = projectionMatrix * mv;
  }
`;

const LINE_FS = /* glsl */ `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  uniform float uReveal;
  uniform float uLight;
  uniform float uBase;
  uniform float uPulse;
  uniform float uSpeed;
  varying float vDepth;
  varying float vSeed;
  varying float vT;
  void main() {
    float head = fract(uTime * uSpeed + vSeed);
    float pulse = smoothstep(0.2, 0.0, abs(vT - head)) * uPulse;
    vec3 c = mix(uColorB, uColorA, clamp(pulse + 0.25, 0.0, 1.0));
    float a = (uBase * mix(1.0, 2.2, uLight) + 0.8 * pulse) * (0.12 + 0.88 * vDepth) * uReveal;
    gl_FragColor = vec4(c, a);
  }
`;

/** Iran's border: steady accent glow with a bright head circling it. */
const BORDER_FS = /* glsl */ `
  precision highp float;
  uniform vec3 uHot;
  uniform float uTime;
  uniform float uReveal;
  uniform float uLight;
  varying float vDepth;
  varying float vT;
  void main() {
    float head = fract(uTime * 0.12);
    float dd = abs(vT - head);
    dd = min(dd, 1.0 - dd);
    float pulse = smoothstep(0.16, 0.0, dd);
    float breathe = 0.82 + 0.18 * sin(uTime * 1.6);
    float a = (0.62 * breathe + 0.9 * pulse) * mix(1.0, 1.35, uLight) * (0.2 + 0.8 * vDepth) * uReveal;
    gl_FragColor = vec4(mix(uHot, vec3(1.0), pulse * 0.55), a);
  }
`;

/**
 * Signal arc: draws on from the hub, a bright head leads a fading trail, then the
 * whole arc dims out after the packet lands. Cycle phase = fract(t * speed + seed).
 */
const ARC_FS = /* glsl */ `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uHot;
  uniform float uTime;
  uniform float uReveal;
  uniform float uLight;
  uniform float uSpeed;
  uniform float uDraw;
  varying float vDepth;
  varying float vSeed;
  varying float vT;
  void main() {
    float ph = fract(uTime * uSpeed + vSeed);
    float h = clamp(ph / uDraw, 0.0, 1.0);
    float behind = h - vT;
    float drawn = step(0.0, behind);
    float trail = drawn * exp(-behind * 2.6);
    float head = smoothstep(0.045, 0.0, abs(vT - h)) * step(ph, uDraw);
    float fade = 1.0 - smoothstep(uDraw, 1.0, ph);
    float ghost = 0.09;
    float a = ghost + (0.18 + 0.72 * trail + 1.1 * head) * fade;
    a *= mix(1.0, 1.8, uLight) * (0.12 + 0.88 * vDepth) * uReveal;
    vec3 c = mix(uHot, uColorA, smoothstep(0.0, 0.55, vT));
    gl_FragColor = vec4(mix(c, vec3(1.0), head * 0.6), a);
  }
`;

const NODE_VS = /* glsl */ `
  attribute vec3 position;
  attribute float aSize;
  attribute float aSeed;
  attribute float aKind;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uPx;
  uniform float uReveal;
  varying float vFront;
  varying float vSeed;
  varying float vKind;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position * 1.012, 1.0);
    vFront = smoothstep(-4.55, -3.5, mv.z);
    vSeed = aSeed;
    vKind = aKind;
    gl_PointSize = aSize * uPx * uReveal;
    gl_Position = projectionMatrix * mv;
  }
`;

/** Peers idle as a faint dot, then ripple when their arc's packet lands; the hub emits continuously. */
const NODE_FS = /* glsl */ `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uHot;
  uniform float uTime;
  uniform float uReveal;
  uniform float uSpeed;
  uniform float uDraw;
  varying float vFront;
  varying float vSeed;
  varying float vKind;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a;
    vec3 col;
    if (vKind > 0.5) {
      float p1 = fract(uTime * 0.55);
      float p2 = fract(uTime * 0.55 + 0.5);
      float breathe = 0.8 + 0.2 * sin(uTime * 2.4);
      float core = smoothstep(0.3, 0.0, d) * breathe;
      float r1 = smoothstep(0.09, 0.0, abs(d - p1)) * (1.0 - p1);
      float r2 = smoothstep(0.09, 0.0, abs(d - p2)) * (1.0 - p2) * 0.7;
      a = (core + r1 + r2) * vFront * uReveal;
      col = mix(uHot, vec3(1.0), core * 0.55);
    } else {
      float ph = fract(uTime * uSpeed + vSeed);
      float arrived = step(uDraw, ph);
      float age = clamp((ph - uDraw) / (1.0 - uDraw), 0.0, 1.0);
      float core = smoothstep(0.26, 0.0, d) * (0.3 + 0.7 * arrived * (1.0 - age));
      float r1 = arrived * smoothstep(0.1, 0.0, abs(d - age)) * (1.0 - age);
      float r2 = arrived * smoothstep(0.1, 0.0, abs(d - age * 0.55)) * (1.0 - age) * 0.5;
      a = (core + r1 + r2) * vFront * uReveal;
      col = mix(uColorA, vec3(1.0), core * 0.65);
    }
    gl_FragColor = vec4(col, a);
  }
`;

const PACKET_FS = /* glsl */ `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uHot;
  uniform float uReveal;
  varying float vFront;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, d);
    gl_FragColor = vec4(mix(mix(uHot, uColorA, 0.5), vec3(1.0), 0.7), a * a * vFront * uReveal);
  }
`;

const FILL_VS = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FILL_FS = /* glsl */ `
  precision highp float;
  uniform vec3 uFillA;
  uniform vec3 uFillB;
  uniform float uReveal;
  varying vec3 vN;
  void main() {
    float f = clamp(vN.z, 0.0, 1.0);
    vec3 c = mix(uFillB, uFillA, pow(f, 0.8));
    gl_FragColor = vec4(c, 0.94 * uReveal);
  }
`;

const RIM_FS = /* glsl */ `
  precision highp float;
  uniform vec3 uRim;
  uniform float uReveal;
  uniform float uLight;
  varying vec3 vN;
  void main() {
    float f = 1.0 - clamp(abs(vN.z), 0.0, 1.0);
    float a = pow(f, 3.0) * mix(0.85, 0.55, uLight) * uReveal;
    gl_FragColor = vec4(uRim, a);
  }
`;

type V3 = [number, number, number];

function latLon(lat: number, lon: number): V3 {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

function slerp(a: V3, b: V3, t: number): V3 {
  const d = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(d);
  if (om < 1e-3) return a;
  const s = Math.sin(om);
  const w1 = Math.sin((1 - t) * om) / s;
  const w2 = Math.sin(t * om) / s;
  return [w1 * a[0] + w2 * b[0], w1 * a[1] + w2 * b[1], w1 * a[2] + w2 * b[2]];
}

function arcPoint(a: V3, b: V3, t: number, lift: number): V3 {
  const p = slerp(a, b, t);
  const k = 1.005 + Math.sin(Math.PI * t) * lift;
  return [p[0] * k, p[1] * k, p[2] * k];
}

interface Dots {
  pts: Float32Array;
  land: Float32Array;
  seed: Float32Array;
}

const dotsCache = new Map<number, Dots>();

function buildDots(count: number): Dots {
  const hit = dotsCache.get(count);
  if (hit) return hit;
  const built = computeDots(count);
  dotsCache.set(count, built);
  return built;
}

function computeDots(count: number): Dots {
  const pts = new Float32Array(count * 3);
  const land = new Float32Array(count);
  const seed = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    pts.set([x, y, z], i * 3);
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = (Math.atan2(x, z) * 180) / Math.PI;
    land[i] = isIran(lat, lon) ? 2 : isLand(lat, lon) ? 1 : 0;
    seed[i] = Math.random();
  }
  return { pts, land, seed };
}

/** Closed outlines as line-segment pairs (subdivided so chords never sink into the core); `t` runs 0→1 around each ring. */
function ringSegments(rings: Ring[], radius: number, maxStep = 0.03) {
  const pos: number[] = [];
  const t: number[] = [];
  for (const ring of rings) {
    const pts: V3[] = [];
    for (let i = 0; i < ring.length; i++) {
      const a = latLon(ring[i][1], ring[i][0]);
      const b = latLon(ring[(i + 1) % ring.length][1], ring[(i + 1) % ring.length][0]);
      const om = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
      const n = Math.max(1, Math.ceil(om / maxStep));
      for (let k = 0; k < n; k++) pts.push(slerp(a, b, k / n));
    }
    pts.push(pts[0]);
    for (let i = 0; i < pts.length - 1; i++) {
      pos.push(pts[i][0] * radius, pts[i][1] * radius, pts[i][2] * radius);
      pos.push(pts[i + 1][0] * radius, pts[i + 1][1] * radius, pts[i + 1][2] * radius);
      t.push(i / (pts.length - 1), (i + 1) / (pts.length - 1));
    }
  }
  return { pos: new Float32Array(pos), t: new Float32Array(t) };
}

/** Links between nearby *land* dots only, so continents read as neural meshes. */
function buildLandLinks(d: Dots, perPoint: number, maxDist: number) {
  const idx: number[] = [];
  for (let i = 0; i < d.land.length; i++) if (d.land[i]) idx.push(i);
  const seen = new Set<number>();
  const pairs: [number, number][] = [];
  const n = d.land.length;
  for (const i of idx) {
    const near: [number, number][] = [];
    for (const j of idx) {
      if (i === j) continue;
      const dx = d.pts[i * 3] - d.pts[j * 3];
      const dy = d.pts[i * 3 + 1] - d.pts[j * 3 + 1];
      const dz = d.pts[i * 3 + 2] - d.pts[j * 3 + 2];
      const dist = dx * dx + dy * dy + dz * dz;
      if (dist < maxDist * maxDist) near.push([dist, j]);
    }
    near.sort((a, b) => a[0] - b[0]);
    for (const [, j] of near.slice(0, perPoint)) {
      const key = Math.min(i, j) * n + Math.max(i, j);
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push([i, j]);
      }
    }
  }
  return pairs;
}

export default function NeuralGlobe({
  className,
  marker = GLOBE_HUB,
  lockMarker = false,
  interactive = true,
  density = 5200,
}: NeuralGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const { mounted, prefersReducedMotion, isNarrow, isLowEnd, isFinePointer } =
    useMotionCapability();
  const themeRef = useRef<"dark" | "light">("dark");
  useEffect(() => {
    themeRef.current = resolvedTheme === "light" ? "light" : "dark";
  }, [resolvedTheme]);

  const lite = isNarrow || isLowEnd;
  const count = lite ? Math.round(density * 0.55) : density;
  const hubLat = marker.lat;
  const hubLon = marker.lon;

  useEffect(() => {
    const wrap = wrapRef.current;
    // wait for the real device capabilities: the server defaults would build the globe twice
    if (!wrap || !mounted) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: !lite,
        depth: true,
        dpr: Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.75),
      });
    } catch {
      return; // WebGL unavailable: the glow behind the canvas remains.
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = "width:100%;height:100%;display:block;";
    wrap.appendChild(canvas);

    const camera = new Camera(gl, { fov: 32 });
    camera.position.set(0, 0, 4.2);
    const scene = new Transform();
    const globe = new Transform();
    globe.setParent(scene);

    const shared = {
      uTime: { value: 0 },
      uPx: { value: renderer.dpr },
      uReveal: { value: prefersReducedMotion ? 1 : 0 },
      uColorA: { value: [...PALETTE.dark.a] },
      uColorB: { value: [...PALETTE.dark.b] },
      uHot: { value: [...PALETTE.dark.hot] },
      uLight: { value: 0 },
    };
    const additivePrograms: Program[] = [];
    const mk = (vertex: string, fragment: string, extra: Record<string, { value: unknown }> = {}) => {
      const p = new Program(gl, {
        vertex,
        fragment,
        uniforms: { ...shared, ...extra },
        transparent: true,
        depthTest: true,
        depthWrite: false,
      });
      additivePrograms.push(p);
      return p;
    };

    // --- core (writes depth so the far hemisphere hides behind it) ---
    const fillU = { uFillA: { value: [...PALETTE.dark.fillA] }, uFillB: { value: [...PALETTE.dark.fillB] } };
    const fillProgram = new Program(gl, {
      vertex: FILL_VS,
      fragment: FILL_FS,
      uniforms: { ...shared, ...fillU },
      transparent: true,
      depthTest: true,
      depthWrite: true,
    });
    const fill = new Mesh(gl, {
      geometry: new Sphere(gl, { radius: 0.985, widthSegments: 48, heightSegments: 32 }),
      program: fillProgram,
    });
    fill.renderOrder = 0;
    fill.setParent(globe);

    // --- dots ---
    const dots = buildDots(count);
    const dotMesh = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: new Geometry(gl, {
        position: { size: 3, data: dots.pts },
        aSeed: { size: 1, data: dots.seed },
        aLand: { size: 1, data: dots.land },
      }),
      program: mk(DOT_VS, DOT_FS, { uSize: { value: lite ? 3.8 : 4.6 } }),
    });
    dotMesh.renderOrder = 2;
    dotMesh.setParent(globe);

    // --- neural links over land ---
    const pairs = buildLandLinks(dots, 2, (lite ? 1.9 : 1.8) * Math.sqrt((4 * Math.PI) / count));
    const lp = new Float32Array(pairs.length * 6);
    const ls = new Float32Array(pairs.length * 2);
    const lt = new Float32Array(pairs.length * 2);
    pairs.forEach(([a, b], i) => {
      lp.set(dots.pts.subarray(a * 3, a * 3 + 3), i * 6);
      lp.set(dots.pts.subarray(b * 3, b * 3 + 3), i * 6 + 3);
      ls.fill(Math.random(), i * 2, i * 2 + 2);
      lt.set([0, 1], i * 2);
    });
    const linkMesh = new Mesh(gl, {
      mode: gl.LINES,
      geometry: new Geometry(gl, {
        position: { size: 3, data: lp },
        aSeed: { size: 1, data: ls },
        aT: { size: 1, data: lt },
      }),
      program: mk(LINE_VS, LINE_FS, {
        uBase: { value: 0.07 },
        uPulse: { value: 1 },
        uSpeed: { value: 0.22 },
      }),
    });
    linkMesh.renderOrder = 3;
    linkMesh.setParent(globe);

    // --- graticule (static rings) ---
    const ringPos: number[] = [];
    const ringT: number[] = [];
    const SEG = 72;
    for (const lat of [-60, -30, 0, 30, 60]) {
      for (let s = 0; s < SEG; s++) {
        ringPos.push(...latLon(lat, (s / SEG) * 360 - 180), ...latLon(lat, ((s + 1) / SEG) * 360 - 180));
        ringT.push(0, 1);
      }
    }
    const gratMesh = new Mesh(gl, {
      mode: gl.LINES,
      geometry: new Geometry(gl, {
        position: { size: 3, data: new Float32Array(ringPos) },
        aSeed: { size: 1, data: new Float32Array(ringT.length) },
        aT: { size: 1, data: new Float32Array(ringT) },
      }),
      program: mk(LINE_VS, LINE_FS, {
        uBase: { value: 0.045 },
        uPulse: { value: 0 },
        uSpeed: { value: 0 },
      }),
    });
    gratMesh.renderOrder = 1;
    gratMesh.setParent(globe);

    // --- coastlines (real outlines pin the continents to the sphere) ---
    const coast = ringSegments(LAND_RINGS, 1.002, 0.04);
    const coastMesh = new Mesh(gl, {
      mode: gl.LINES,
      geometry: new Geometry(gl, {
        position: { size: 3, data: coast.pos },
        aSeed: { size: 1, data: new Float32Array(coast.t.length) },
        aT: { size: 1, data: coast.t },
      }),
      program: mk(LINE_VS, LINE_FS, {
        uBase: { value: 0.2 },
        uPulse: { value: 0 },
        uSpeed: { value: 0 },
      }),
    });
    coastMesh.renderOrder = 2;
    coastMesh.setParent(globe);

    // --- Iran's border: accent outline, bright head circling it ---
    const border = ringSegments([IRAN_RING], 1.006, 0.02);
    const borderMesh = new Mesh(gl, {
      mode: gl.LINES,
      geometry: new Geometry(gl, {
        position: { size: 3, data: border.pos },
        aSeed: { size: 1, data: new Float32Array(border.t.length) },
        aT: { size: 1, data: border.t },
      }),
      program: mk(LINE_VS, BORDER_FS),
    });
    borderMesh.renderOrder = 5;
    borderMesh.setParent(globe);

    // --- signal arcs hub → peers ---
    const hub = latLon(hubLat, hubLon);
    const peers = (lite ? GLOBE_PEERS.slice(0, 7) : GLOBE_PEERS).map((c) => latLon(c.lat, c.lon));
    const ARC = 44;
    const arcPos = new Float32Array(peers.length * ARC * 6);
    const arcSeed = new Float32Array(peers.length * ARC * 2);
    const arcT = new Float32Array(peers.length * ARC * 2);
    const lifts = peers.map((p) => {
      const d = Math.acos(Math.min(1, hub[0] * p[0] + hub[1] * p[1] + hub[2] * p[2]));
      return 0.06 + d * 0.12;
    });
    const arcSeeds = peers.map((_, i) => (i * 0.61803) % 1);
    peers.forEach((p, i) => {
      const seed = arcSeeds[i];
      for (let s = 0; s < ARC; s++) {
        const o = (i * ARC + s) * 6;
        arcPos.set(arcPoint(hub, p, s / ARC, lifts[i]), o);
        arcPos.set(arcPoint(hub, p, (s + 1) / ARC, lifts[i]), o + 3);
        const k = (i * ARC + s) * 2;
        arcSeed.fill(seed, k, k + 2);
        arcT[k] = s / ARC;
        arcT[k + 1] = (s + 1) / ARC;
      }
    });
    const arcMesh = new Mesh(gl, {
      mode: gl.LINES,
      geometry: new Geometry(gl, {
        position: { size: 3, data: arcPos },
        aSeed: { size: 1, data: arcSeed },
        aT: { size: 1, data: arcT },
      }),
      program: mk(LINE_VS, ARC_FS, {
        uSpeed: { value: ARC_SPEED },
        uDraw: { value: ARC_DRAW },
      }),
    });
    arcMesh.renderOrder = 4;
    arcMesh.setParent(globe);

    // --- city beacons (hub bigger) ---
    const nodeCount = peers.length + 1;
    const nodePos = new Float32Array(nodeCount * 3);
    const nodeSize = new Float32Array(nodeCount);
    const nodeSeed = new Float32Array(nodeCount);
    nodePos.set(hub, 0);
    const nodeKind = new Float32Array(nodeCount);
    nodeSize[0] = lite ? 64 : 84;
    nodeKind[0] = 1;
    peers.forEach((p, i) => {
      nodePos.set(p, (i + 1) * 3);
      nodeSize[i + 1] = lite ? 20 : 26;
      nodeSeed[i + 1] = arcSeeds[i];
    });
    const nodeMesh = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: new Geometry(gl, {
        position: { size: 3, data: nodePos },
        aSize: { size: 1, data: nodeSize },
        aSeed: { size: 1, data: nodeSeed },
        aKind: { size: 1, data: nodeKind },
      }),
      program: mk(NODE_VS, NODE_FS, {
        uSpeed: { value: ARC_SPEED },
        uDraw: { value: ARC_DRAW },
      }),
    });
    nodeMesh.renderOrder = 6;
    nodeMesh.setParent(globe);

    // --- packets travelling along arcs (CPU-updated, ≤ 12 points) ---
    const packetPos = new Float32Array(peers.length * 3);
    const packetMax = lite ? 14 : 20;
    const packetSize = new Float32Array(peers.length);
    const packetGeo = new Geometry(gl, {
      position: { size: 3, data: packetPos },
      aSize: { size: 1, data: packetSize },
      aSeed: { size: 1, data: new Float32Array(peers.length) },
      aKind: { size: 1, data: new Float32Array(peers.length) },
    });
    const packetMesh = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: packetGeo,
      program: mk(NODE_VS, PACKET_FS),
    });
    packetMesh.renderOrder = 5;
    packetMesh.setParent(globe);

    // --- atmosphere rim (in the scene, not the spinning globe: a clean halo) ---
    const rimU = { uRim: { value: [...PALETTE.dark.rim] } };
    const rimProgram = new Program(gl, {
      vertex: FILL_VS,
      fragment: RIM_FS,
      uniforms: { ...shared, ...rimU },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: gl.FRONT,
    });
    const rim = new Mesh(gl, {
      geometry: new Sphere(gl, { radius: 1.1, widthSegments: 48, heightSegments: 32 }),
      program: rimProgram,
    });
    rim.renderOrder = 7;
    rim.setParent(scene);

    const applyTheme = () => {
      const p = PALETTE[themeRef.current];
      const dst = p.additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA;
      for (const prog of additivePrograms) prog.setBlendFunc(gl.SRC_ALPHA, dst);
      rimProgram.setBlendFunc(gl.SRC_ALPHA, dst);
      shared.uColorA.value = [...p.a];
      shared.uColorB.value = [...p.b];
      shared.uHot.value = [...p.hot];
      shared.uLight.value = p.additive ? 0 : 1;
      fillU.uFillA.value = [...p.fillA];
      fillU.uFillB.value = [...p.fillB];
      rimU.uRim.value = [...p.rim];
    };

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const state = { spin: 0, tiltX: 0, tiltY: 0, drag: 0, vel: 0, intro: 0 };
    const target = { x: 0, y: 0 };
    const baseY = (-hubLon * Math.PI) / 180;
    const baseX = lockMarker ? (hubLat * Math.PI) / 180 : 0.3;

    let p0: number | null = null;
    let spinTarget = 0;
    let cancelIntro = () => {};
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;
      // The globe swings in and settles with Iran facing the viewer, once the boot loader leaves.
      state.intro = -2.4;
      cancelIntro = whenBooted(() => {
        gsap.to(shared.uReveal, { value: 1, duration: 1.6, ease: "expo.out" });
        gsap.to(state, { intro: 0, duration: 2.4, ease: "expo.out" });
      });
      if (!lockMarker) {
        // Scroll adds spin *relative to where the page loaded*, so the hub starts facing the viewer.
        const st = ScrollTrigger.create({
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            if (p0 === null) p0 = self.progress;
            spinTarget = (self.progress - p0) * Math.PI * 0.9;
          },
        });
        p0 = st.progress;
      }
    }, wrap);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "80px" });
    io.observe(wrap);

    const canTilt = interactive && isFinePointer && !prefersReducedMotion;
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      target.y = ((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 1.0;
      target.x = ((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 0.7;
    };
    if (canTilt) window.addEventListener("pointermove", onMove, { passive: true });

    // Drag to spin (horizontal). touch-action keeps vertical page scroll working.
    let dragging = false;
    let lastX = 0;
    const canDrag = interactive && !lockMarker && !prefersReducedMotion;
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      state.vel = 0;
      wrap.setPointerCapture(e.pointerId);
    };
    const drag = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      state.drag += dx * 0.0065;
      state.vel = dx * 0.0065;
    };
    const up = () => (dragging = false);
    if (canDrag) {
      wrap.addEventListener("pointerdown", down);
      wrap.addEventListener("pointermove", drag);
      wrap.addEventListener("pointerup", up);
      wrap.addEventListener("pointercancel", up);
    }

    // Packet head follows its arc's draw-on phase (same maths as ARC_FS), then hides until the next cycle.
    const updatePackets = (t: number) => {
      for (let i = 0; i < peers.length; i++) {
        const ph = (t * ARC_SPEED + arcSeeds[i]) % 1;
        const k = Math.min(ph / ARC_DRAW, 1);
        packetPos.set(arcPoint(hub, peers[i], k, lifts[i]), i * 3);
        packetSize[i] = ph < ARC_DRAW ? packetMax * (0.65 + 0.35 * Math.sin(Math.PI * k)) : 0;
      }
      packetGeo.attributes.position.needsUpdate = true;
      packetGeo.attributes.aSize.needsUpdate = true;
    };

    let raf = 0;
    let last = performance.now();
    let auto = 0;
    let frameN = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || document.hidden) return;
      // Weak devices render at ~30 fps.
      if (lite && ++frameN % 2) return;

      shared.uTime.value += dt;
      state.spin += (spinTarget - state.spin) * Math.min(1, dt * 4);
      if (!dragging) {
        state.drag += state.vel;
        state.vel *= 0.94;
        auto += dt * 0.1;
      }
      state.tiltX += (target.x - state.tiltX) * Math.min(1, dt * 3);
      state.tiltY += (target.y - state.tiltY) * Math.min(1, dt * 3);

      // Slow pan (±18°) keeps Iran in frame; drag reveals the rest.
      const sway = lockMarker ? Math.sin(shared.uTime.value * 0.25) * 0.4 : Math.sin(auto * 0.9) * 0.32;
      globe.rotation.y = baseY + sway + state.spin + state.drag + state.tiltY + state.intro;
      globe.rotation.x = baseX + state.tiltX;

      updatePackets(shared.uTime.value);

      applyTheme();
      renderer.render({ scene, camera });
    };

    if (prefersReducedMotion) {
      globe.rotation.y = baseY;
      globe.rotation.x = baseX;
      updatePackets(0.5 * ARC_DRAW / ARC_SPEED);
      applyTheme();
      renderer.render({ scene, camera });
    } else {
      raf = requestAnimationFrame(frame);
    }

    // tell the boot loader the globe has drawn
    requestAnimationFrame(() => requestAnimationFrame(() => window.dispatchEvent(new Event("aic:ready"))));

    return () => {
      cancelIntro();
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", down);
      wrap.removeEventListener("pointermove", drag);
      wrap.removeEventListener("pointerup", up);
      wrap.removeEventListener("pointercancel", up);
      ctx.revert();
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [mounted, count, lite, lockMarker, interactive, isFinePointer, prefersReducedMotion, hubLat, hubLon]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={cn(
        "relative aspect-square w-full touch-pan-y",
        interactive && !lockMarker ? "cursor-grab active:cursor-grabbing" : "pointer-events-none",
        className,
      )}
    />
  );
}
