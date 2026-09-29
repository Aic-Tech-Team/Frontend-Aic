import Image from "next/image";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeptHead {
  label: string;
  names: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  team: string;
  bio: string;
  tasks: string[];
  heads?: DeptHead[];
}

interface TeamMemberCardProps extends TeamMember {
  photo: string;
  index: number;
  tasksLabel: string;
  active?: boolean;
  className?: string;
}

const MEMBER_PHOTOS = [
  "/images/1002895410747413355.jpg",
  "/images/668010557261534380.jpg",
  "/images/158048268165812819.jpg",
  "/images/581949583092327844.jpg",
  "/images/766456430349003443.jpg",
  "/images/1088745278696137752.jpg",
] as const;

export function memberPhoto(index: number): string {
  return MEMBER_PHOTOS[index % MEMBER_PHOTOS.length];
}

const BLOBS = [
  <>
    <span
      aria-hidden
      className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-600/25 blur-[80px]"
    />
    <span
      aria-hidden
      className="absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-fuchsia-500/[0.13] blur-[80px]"
    />
    <span
      aria-hidden
      className="absolute left-1/4 top-1/3 h-48 w-48 rounded-full bg-indigo-500/20 blur-[70px]"
    />
  </>,
  <>
    <span
      aria-hidden
      className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-sky-500/20 blur-[80px]"
    />
    <span
      aria-hidden
      className="absolute -bottom-20 -right-16 h-60 w-60 rounded-full bg-violet-600/25 blur-[80px]"
    />
    <span
      aria-hidden
      className="absolute right-1/4 top-1/4 h-48 w-48 rounded-full bg-blue-600/[0.14] blur-[70px]"
    />
  </>,
  <>
    <span
      aria-hidden
      className="absolute -right-16 top-1/4 h-60 w-60 rounded-full bg-fuchsia-600/20 blur-[80px]"
    />
    <span
      aria-hidden
      className="absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-purple-600/25 blur-[80px]"
    />
    <span
      aria-hidden
      className="absolute -top-10 left-1/3 h-44 w-44 rounded-full bg-violet-500/[0.16] blur-[70px]"
    />
  </>,
] as const;

export function TeamMemberCard({
  name,
  role,
  team,
  bio,
  tasks,
  heads,
  photo,
  index,
  tasksLabel,
  active = false,
  className,
}: TeamMemberCardProps) {
  const leadership: DeptHead[] =
    heads && heads.length > 0 ? heads : [{ label: role, names: [name] }];

  return (
    <article
      className={cn(
        "relative flex h-[480px] w-[340px] flex-col overflow-hidden rounded-[24px] transition-all duration-500 sm:h-[500px] sm:w-[380px]",
        "border border-white/10 bg-[#141020] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.65)]",
        active
          ? "opacity-100 shadow-[0_0_60px_-12px_rgba(139,92,246,0.45)] ring-1 ring-violet-400/30"
          : "opacity-80 saturate-90",
        className,
      )}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {/* ── ambient glow blobs ─────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {BLOBS[index % BLOBS.length]}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="relative h-28 w-full shrink-0 sm:h-32">
          <div className="absolute -top-3 inset-x-[-24px] bottom-[-40px]">
            <Image
              src={photo}
              alt=""
              fill
              sizes="400px"
              className="object-cover"
              draggable={false}
              style={{
                maskImage:
                  "radial-gradient(140% 115% at 50% 0%, black 58%, transparent 90%)",
                WebkitMaskImage:
                  "radial-gradient(140% 115% at 50% 0%, black 58%, transparent 90%)",
              }}
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-x-0 top-[40%] bottom-[-32px] bg-gradient-to-b from-transparent via-[#141020]/70 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-3/4 bg-gradient-to-b from-[#141020]/25 via-transparent to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-12 bottom-[-14px] h-16 bg-violet-500/25 blur-2xl"
          />
          <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-white/90 ring-1 ring-violet-300/30 backdrop-blur-md [box-shadow:0_0_18px_-4px_rgba(139,92,246,0.55),inset_0_1px_0_rgba(255,255,255,0.15)]">
            <Sparkles className="h-3 w-3 text-violet-200" strokeWidth={2.5} />
            AIC · TEAM
          </span>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <h2 className="mt-1 text-center text-[20px] font-black leading-7 text-white drop-shadow-[0_0_24px_rgba(139,92,246,0.45)]">
          {team}
        </h2>

        <div className="mt-4 rounded-2xl bg-white/[0.045] p-2.5 ring-1 ring-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-violet-300/40 [box-shadow:0_0_16px_-2px_rgba(139,92,246,0.6)]">
              <Image
                src={photo}
                alt={name}
                fill
                sizes="48px"
                className="object-cover"
                draggable={false}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300/80">
                {leadership[0].label}
              </p>
              <p className="truncate text-[14px] font-bold leading-6 text-white/90">
                {leadership[0].names[0]}
                {leadership[0].names.length > 1
                  ? ` +${leadership[0].names.length - 1}`
                  : null}
              </p>
            </div>
          </div>
          {leadership.slice(1).map((head) => (
            <div
              key={head.label}
              className="mt-2 border-t border-white/[0.07] pt-2"
            >
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300/80">
                {head.label}
              </p>
              <p className="truncate text-[13px] font-semibold leading-6 text-white/75">
                {head.names.join(" · ")}
              </p>
            </div>
          ))}
        </div>

        {/* description */}
        <p className="mx-auto mt-2.5 line-clamp-2 w-full max-w-[250px] text-center text-[12px] leading-6 text-white/55">
          {bio}
        </p>

        {/* responsibilities */}
        <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200/60">
          {tasksLabel}
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {tasks.slice(0, 3).map((task) => (
            <li
              key={task}
              className="flex items-center gap-2.5 rounded-xl bg-white/[0.045] px-3 py-[6px] text-start ring-1 ring-white/[0.08]"
            >
              <span
                aria-hidden
                className="h-1 w-1 shrink-0 rounded-full bg-violet-300/70"
              />
              <span className="line-clamp-1 min-w-0 flex-1 text-[11.5px] leading-5 text-white/80">
                {task}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex-1" />
        </div>
      </div>
    </article>
  );
}
