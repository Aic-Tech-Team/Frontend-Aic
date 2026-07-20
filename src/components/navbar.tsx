"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navLinks = [
  { href: "/#events", label: "رویدادها" },
  { href: "/#activities", label: "فعالیت‌ها" },
  { href: "/#teams", label: "تیم‌ها" },
  { href: "/#blog", label: "بلاگ" },
] as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-500",
        scrolled
          ? "bg-background/60 shadow-[0_8px_40px_-16px_rgba(124,92,252,0.4)]"
          : "bg-background/30"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">

        <div className="flex items-center gap-3">
          <Button
            asChild
            size="sm"
            className="hidden rounded-xl sm:inline-flex"
          >
            <Link href="/#join">
              عضویت در انجمن
            </Link>
          </Button>

          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full sm:hidden"
            aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
            onClick={toggleMenu}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        <nav className="hidden items-center gap-2 sm:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="group relative px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {label}

              <span className="pointer-events-none absolute inset-x-1 bottom-1 h-[2px] origin-center scale-x-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-transform duration-300 ease-smooth group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-2 text-lg font-bold tracking-tight"
        >

          <span className="sm:inline">
             لوگو انجمن هوش مصنوعی
          </span>
        </Link>
      </div>

      {isOpen && (
        <nav className="animate-fade-in flex w-full flex-col gap-1 bg-background/80 px-4 py-4 backdrop-blur-xl sm:hidden">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
            >
              {label}
            </Link>
          ))}

          <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-3">
            <ThemeSwitcher />

            <Button asChild size="sm" className="rounded-full">
              <Link href="/#join" onClick={closeMenu}>
                عضویت در انجمن
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}