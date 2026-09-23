import Image from "next/image";

interface BlogHeroProps {
  src: string;
  alt: string;
}

export function BlogHero({ src, alt }: BlogHeroProps) {
  return (
    <figure className="w-full">
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[14px] bg-muted sm:rounded-2xl">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1280px) 820px, (min-width: 1024px) 68vw, 100vw"
          // API media lives on the public host, which the server cannot reach —
          // routing through /_next/image would 504. Let the browser fetch it.
          unoptimized
          className="object-cover"
        />
      </div>
    </figure>
  );
}
