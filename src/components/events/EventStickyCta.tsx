"use client";

import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

/**
 * On phones the registration card sits below the text. This bar keeps the way in on screen until
 * that card scrolls into view, then steps aside.
 */
export function EventStickyCta({
  title,
  label,
  href,
  external,
  targetId,
}: {
  title: string;
  label: string;
  href: string;
  external: boolean;
  targetId: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let pastTop = window.scrollY > 320;
    let inView = false;
    const apply = () => setShow(pastTop && !inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      apply();
    });
    io.observe(target);
    const onScroll = () => {
      const next = window.scrollY > 320;
      if (next !== pastTop) {
        pastTop = next;
        apply();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [targetId]);

  const cls = cn(
    buttonVariants({ size: "lg" }),
    "h-11 shrink-0 gap-2 rounded-full px-6 shadow-glow",
  );

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
        show ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="container flex items-center justify-between gap-4 px-0">
        <p className="min-w-0 truncate text-sm font-bold text-foreground">
          {title}
        </p>
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={show ? 0 : -1}
            className={cls}
          >
            <Ticket className="size-4" />
            {label}
          </a>
        ) : (
          <Link href={href} tabIndex={show ? 0 : -1} className={cls}>
            <Ticket className="size-4" />
            {label}
          </Link>
        )}
      </div>
    </div>
  );
}
