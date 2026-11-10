import { PosterImage } from "@/components/events/PosterImage";

interface ActivityHeroProps {
  src: string;
  alt: string;
}

/**
 * The poster, whole: activity photos are posters with text on them, so a wide crop cuts words
 * off. It sits contained over a blurred copy of itself so the frame is always full.
 */
export function ActivityHero({ src, alt }: ActivityHeroProps) {
  return (
    <figure className="w-full">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-[14px] bg-muted sm:rounded-2xl">
        <PosterImage
          bare
          src={src}
          alt=""
          sizes="820px"
          className="scale-125 opacity-70 blur-2xl"
        />
        <PosterImage
          src={src}
          alt={alt}
          priority
          sizes="(min-width: 1280px) 820px, (min-width: 1024px) 68vw, 100vw"
          className="object-contain"
        />
      </div>
    </figure>
  );
}
