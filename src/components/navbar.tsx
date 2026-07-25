"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Aurora from "@/components/Aurora";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";

const navLinks = [
  { href: "/#events", label: "رویدادها" },
  { href: "/#activities", label: "فعالیت‌ها" },
  { href: "/#teams", label: "تیم‌ها" },
  { href: "/#blog", label: "بلاگ" },
] as const;

const auroraStops = {
  navy: ["#432086", "#5227FF", "#a15fe0"],
  pink: ["#c4b5fd", "#e9d5ff", "#93c5fd"],
} as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        scrolled || isOpen
          ? "border-b border-border/60 bg-background/85 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300",
          scrolled || isOpen ? "opacity-0" : "opacity-100"
        )}
      >
        <Aurora
          amplitude={1.4}
          blend={theme === "pink" ? 0.35 : 0.6}
          colorStops={[...auroraStops[theme]]}
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
        >
          <span className="sm:inline">انجمن هوش مصنوعی</span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="pointer-events-none absolute inset-x-1 bottom-1 h-[2px] origin-center scale-x-0 rounded-full bg-linear-to-r from-primary-400 to-primary-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>

          <Button asChild size="sm" className="hidden rounded-xl sm:inline-flex">
            <Link href="/#join">عضویت در انجمن</Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full sm:hidden"
            aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <nav className="animate-fade-in flex w-full flex-col gap-1 border-t border-border/50 px-4 py-4 sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-3">
            <ThemeSwitcher />
            <Button asChild size="sm" className="rounded-xl">
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
