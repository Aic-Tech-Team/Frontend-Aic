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

const TOOLS = [
  "Python",
  "PyTorch",
  "TensorFlow",
  "Transformers",
  "Diffusion",
  "RAG",
  "Agents",
  "MLOps",
  "Edge AI",
  "Prompting",
] as const;

function Topics({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {TOPICS.map((topic, i) => (
        <li key={topic} dir="ltr" className="flex items-center gap-6 pe-6 sm:gap-10 sm:pe-10">
          <span
            className={
              i % 2
                ? "text-gradient text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl"
                : "outline-text text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl"
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

function Tools({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {TOOLS.map((tool) => (
        <li key={tool} dir="ltr" className="pe-3 sm:pe-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground sm:text-sm">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_var(--primary)]" />
            {tool}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Two tickers moving against each other: big topics above, small tool tags below. */
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
      className="relative overflow-hidden py-14 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] sm:py-20"
    >
      <div ref={ref} className="marquee-wrap space-y-5 sm:space-y-7">
        <div className="marquee">
          <Topics />
          <Topics hidden />
        </div>
        <div className="marquee marquee--rev">
          <Tools />
          <Tools hidden />
          <Tools hidden />
        </div>
      </div>
    </section>
  );
}
