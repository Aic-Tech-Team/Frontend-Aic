"use client";


import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

import './Particles.css';

interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  pixelRatio?: number;
  /** Depth of the cloud, in world units (default 3). */
  depth?: number;
  /** Overall strength of the dots, 0–1. */
  opacity?: number;
  /** Frames per second to draw at: the drift is slow, so 30 looks the same at half the cost. */
  maxFps?: number;
  /** Stop RAF when true (tab hidden / reduced-motion). */
  paused?: boolean;
  className?: string;
}

const defaultColors: string[] = ['#ffffff', '#ffffff', '#ffffff'];

const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('');
  }
  const int = parseInt(hex.slice(0, 6), 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  uniform float uAspect;
  uniform float uDepth;
  uniform float uOpacity;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  varying float vNear;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    // the cloud fills the screen: x follows the aspect ratio, depth stays shallow
    vec3 pos = position * uSpread;
    pos.x *= uAspect;
    pos.z *= uDepth;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.15, 1.1, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.15, 1.1, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.15, 1.1, random.z);
    
    vec4 mvPos = viewMatrix * mPos;
    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = clamp((uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz), 1.5, 14.0);
    }
    
    // nearer points are brighter, far ones sink into the background
    vNear = clamp(1.0 - (length(mvPos.xyz) - 10.0) / 22.0, 0.15, 1.0);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  uniform float uOpacity;
  varying vec4 vRandom;
  varying vec3 vColor;
  varying float vNear;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.15, d) * 0.8 * uOpacity * vNear;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const Particles: React.FC<ParticlesProps> = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio = 1,
  depth = 3,
  opacity = 1,
  maxFps = 30,
  paused = false,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pausedRef = useRef(paused);
  const startLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) startLoopRef.current?.();
  }, [paused]);

  // Stable string key — avoid remount when parent passes a new array ref of same colors
  const particleColorsKey = (particleColors ?? defaultColors).join(",");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr: pixelRatio,
      depth: false,
      alpha: true
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    // eslint-disable-next-line prefer-const
    let program: Program | undefined;
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      const aspect = gl.canvas.width / gl.canvas.height;
      camera.perspective({ aspect });
      if (program) program.uniforms.uAspect.value = aspect;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };

    if (moveParticlesOnHover) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = particleColors && particleColors.length > 0 ? particleColors : defaultColors;

    for (let i = 0; i < count; i++) {
      // a box, not a sphere: a sphere leaves the corners of a wide screen empty
      positions.set([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors }
    });

    program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * pixelRatio },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
        uAspect: { value: gl.canvas.width / gl.canvas.height },
        uDepth: { value: depth / particleSpread },
        uOpacity: { value: opacity }
      },
      transparent: true,
      depthTest: false
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    window.addEventListener('resize', resize, false);
    resize();

    let animationFrameId: number | null = null;
    let lastTime = performance.now();
    let elapsed = 0;
    const minFrame = 1000 / maxFps - 2;
    // while the page is being scrolled the browser has enough to do: the slow drift waits
    let scrolledAt = -1e9;
    const onScroll = () => {
      scrolledAt = performance.now();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const update = (t: number) => {
      if (pausedRef.current) {
        animationFrameId = null;
        lastTime = t;
        return;
      }

      animationFrameId = requestAnimationFrame(update);

      const delta = t - lastTime;
      if (delta < minFrame) return;
      if (t - scrolledAt < 140) {
        lastTime = t;
        return;
      }
      lastTime = t;
      elapsed += delta * speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      if (moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * particleHoverFactor;
        particles.position.y = -mouseRef.current.y * particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * speed;
      }

      renderer.render({ scene: particles, camera });
    };

    const ensureLoop = () => {
      if (!pausedRef.current && animationFrameId === null) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(update);
      }
    };

    startLoopRef.current = ensureLoop;
    ensureLoop();

    return () => {
      startLoopRef.current = null;
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      if (moveParticlesOnHover) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColorsKey,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
    pixelRatio,
    depth,
    opacity,
    maxFps
  ]);

  return <div ref={containerRef} className={`particles-container ${className}`} />;
};

export default Particles;
