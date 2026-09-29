import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TEAM_IMAGES = [
  "/images/banner.jpg",
  "/images/581949583092327844.jpg",
  "/images/668010557261534380.jpg",
  "/images/766456430349003443.jpg",
  "/images/158048268165812819.jpg",
] as const;

interface TeamCardProps {
  icon: LucideIcon;
  index: number;
  title: string;
  desc: string;
  membersText: string;
  image?: string;
  className?: string;
}

export function TeamCard({
  icon: Icon,
  index,
  title,
  desc,
  membersText,
  image,
  className,
}: TeamCardProps) {
  const num = String(index + 1).padStart(2, "0");
  const src = image ?? TEAM_IMAGES[index % TEAM_IMAGES.length];

  return (
    <article
      className={cn(
        "group flex aspect-square w-full flex-col overflow-hidden bg-black",
        "rounded-[28px] border-[6px] border-black",
        "shadow-[0_18px_45px_-18px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <div className="relative h-[42%] shrink-0 overflow-hidden bg-neutral-800">
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/25"
        />
        <p className="absolute end-4 top-3 text-end text-[13px] font-bold leading-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
          AIC Team
          <span className="block">Card {num}</span>
        </p>
        <Icon
          aria-hidden
          className="absolute bottom-2 start-3 h-14 w-14 text-white/25 blur-[1px] transition-transform duration-500 group-hover:scale-110"
          strokeWidth={1.25}
        />
      </div>

      <div className="relative flex flex-1 flex-col bg-[#1b1b1d] px-5 pb-5 pt-4">
        <span
          aria-hidden
          className="absolute -top-[21px] start-0 h-[22px] w-[46%] bg-[#1b1b1d]"
          style={{
            clipPath: "polygon(0 100%, 0 45%, 6% 0, 88% 0, 100% 100%)",
            borderTopLeftRadius: 10,
          }}
        />
        <h3 className="text-[17px] font-bold leading-6 text-white">{title}</h3>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-neutral-400">
          {desc}
        </p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="flex items-baseline gap-1.5 text-white">
            <span className="text-[32px] font-extrabold leading-none tracking-tight">
              {num}
            </span>
            <span className="text-[13px] font-medium text-neutral-300">Team</span>
          </p>
          <p className="text-[13px] font-semibold text-neutral-200">
            {membersText}
          </p>
        </div>
      </div>
    </article>
  );
}
