"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * An event poster that survives a dead image URL: when the file fails to load it swaps to the
 * association's mark on a soft gradient instead of leaving a broken-image box.
 */
export function PosterImage({
  src,
  alt,
  sizes,
  priority,
  bare,
  className,
}: {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Render nothing, instead of the mark, when there is no image. For decorative backdrops. */
  bare?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (bare) return null;
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--primary)_45%,transparent),transparent_60%),linear-gradient(160deg,color-mix(in_srgb,var(--primary)_22%,var(--card)),var(--card))]"
      >
        <Image
          src="/logo/AIC_logo_notext.svg"
          alt=""
          width={96}
          height={96}
          className="opacity-70 drop-shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_70%,transparent)]"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
