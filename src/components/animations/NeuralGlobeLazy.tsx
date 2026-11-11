"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore, type ComponentProps } from "react";

const NeuralGlobe = dynamic(() => import("./NeuralGlobe"), { ssr: false });

let webglSupport: boolean | null = null;
function detectWebGL() {
  if (webglSupport === null) {
    try {
      const c = document.createElement("canvas");
      const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
      webglSupport = !!gl;
      // the probe is thrown away: give the context back instead of leaving it to the collector
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/** `null` on the server / first render, then whether WebGL can create a context. */
export function useWebGL() {
  return useSyncExternalStore(
    () => () => {},
    detectWebGL,
    () => null,
  );
}

/** Lazy, WebGL-checked globe. Renders `fallback` when WebGL is unavailable. */
export function NeuralGlobeLazy({
  fallback = null,
  ...props
}: ComponentProps<typeof NeuralGlobe> & { fallback?: React.ReactNode }) {
  const ok = useWebGL();
  // no WebGL: the still image is all there is, so release the boot loader
  useEffect(() => {
    if (ok === false) window.dispatchEvent(new Event("aic:ready"));
  }, [ok]);
  if (ok === false) return <>{fallback}</>;
  if (ok === null) return null;
  return <NeuralGlobe {...props} />;
}
