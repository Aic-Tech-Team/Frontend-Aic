"use client";

import { useCallback, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * A photograph that arrives gracefully: the server resizes it to WebP for the width it is shown
 * at, it loads lazily, and until it is ready a tiny, soft copy of the same picture fills the box
 * (so the space is never empty) and the sharp one paints over it the moment it is decoded. Use with `fill` inside a box
 * that has a size; falls back to the plain image for anything that cannot be optimised.
 */
export function SmartImage({ src, className, onLoad, priority, ...rest }: ImageProps) {
  const [ready, setReady] = useState(false);
  const remote = typeof src === "string" && src.length > 0;
  // an image pushed behind its siblings (`-z-20`) needs its placeholder one step further back,
  // or the blurred copy paints over the sharp one
  const behind = typeof className === "string" ? className.match(/(?:^|\s)-z-(\d+)/) : null;
  const tiny = remote ? `/_next/image?url=${encodeURIComponent(src as string)}&w=32&q=20` : undefined;

  // an image that finished loading before React attached its handler never fires onLoad
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setReady(true);
  }, []);

  if (!remote) return <Image src={src} className={className} priority={priority} {...rest} />;

  return (
    <>
      {tiny ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-cover bg-center blur-md transition-opacity duration-300",
            ready && "opacity-0 delay-500",
          )}
          style={{ backgroundImage: `url("${tiny}")`, ...(behind ? { zIndex: -(Number(behind[1]) + 1) } : {}) }}
        />
      ) : null}
      <Image
        ref={ref}
        src={src}
        priority={priority}
        className={className}
        onLoad={(e) => {
          setReady(true);
          onLoad?.(e);
        }}
        {...rest}
      />
    </>
  );
}
