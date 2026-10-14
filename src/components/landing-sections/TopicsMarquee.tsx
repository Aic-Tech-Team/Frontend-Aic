"use client";

import { useEffect, useRef } from "react";
import { Sparkle } from "lucide-react";

const TOPICS = [
  "Machine Learning",
  "Deep Learning",
  "NLP",
  "Computer Vision",
  "LLMs",
  "Robotics",
  "Reinforcement Learning",
  "Data Science",
] as const;

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {TOPICS.map((topic, i) => (
        <li
          key={topic}
          dir="ltr"
          className="flex items-center gap-6 pe-6 sm:gap-10 sm:pe-10"
        >
          <span
            className={
              i % 2
                ? "text-gradient text-2xl font-extrabold tracking-tight sm:text-4xl"
                : "outline-text text-2xl font-extrabold tracking-tight sm:text-4xl"
            }
          >
            {topic}
          </span>
          <Sparkle className="h-4 w-4 shrink-0 text-primary-400/70 sm:h-5 sm:w-5" />
        </li>
      ))}
    </ul>
  );
}

/** Topic ticker. Loops on the compositor and pauses when off-screen. */
export function TopicsMarquee() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => el.setAttribute("data-paused", String(!e.isIntersecting)),
      { rootMargin: "80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      aria-label="AI topics"
      className="relative overflow-hidden py-16 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] sm:py-24"
    >
      <div ref={ref} className="marquee-wrap">
        <div className="marquee">
          <Track />
          <Track hidden />
        </div>
      </div>
    </section>
  );
}
