"use client";

import { useEffect, useState } from "react";
import { Menu, X, Ticket, CalendarClock, Layers, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { LocaleSwitcher } from "@/components/common/LocaleSwitcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Navbar() {
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Nav");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { href: "/", label: tNav("home"), icon: Ticket },
    { href: "/#events", label: tNav("events"), icon: Ticket },
    { href: "/#activities", label: tNav("activities"), icon: CalendarClock },
    { href: "/#teams", label: tNav("teams"), icon: Layers },
    { href: "/#blog", label: tNav("blog"), icon: BookOpen },
  ] as const;

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 8;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (isOpen) {
      document.body.style.overflowY = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflowY = "";
      document.body.style.touchAction = "";
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.style.overflowY = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isOpen && "opacity-0 pointer-events-none",
          !isOpen &&
            (scrolled
              ? "border-b border-border/60 bg-background/90 shadow-sm backdrop-blur-md max-md:bg-background/95 max-md:backdrop-blur-sm"
              : "border-b border-transparent bg-transparent"),
        )}
      >
        <div className="container flex items-center justify-between gap-2 py-3 sm:gap-4 sm:py-4">
          <Link
            href="/"
            onClick={closeMenu}
            className="group flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight text-foreground sm:gap-2.5"
          >
            <Image
              src="/logo/AIC_logo_notext.svg"
              alt={tCommon("brandTitle")}
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11"
            />

            <span className="min-w-0">
              <span className="block truncate text-xs font-bold leading-tight text-foreground sm:text-sm">
                {tCommon("brandTitle")}
              </span>
              <span className="block truncate text-[10px] leading-tight text-muted-foreground sm:text-xs">
                {tCommon("brandSubtitle")}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
                <span className="pointer-events-none absolute inset-x-1 bottom-1 h-[2px] origin-center scale-x-0 rounded-full bg-linear-to-r from-primary-400 to-primary-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex lg:items-center lg:gap-2">
              <LocaleSwitcher />
              <ThemeSwitcher />
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <LocaleSwitcher />
              <ThemeSwitcher />
            </div>

            <Button
              asChild
              size="sm"
              className="hidden rounded-xl lg:inline-flex"
            >
              <Link href="/#join">{tNav("join")}</Link>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full lg:hidden"
              aria-label={isOpen ? tNav("closeMenu") : tNav("openMenu")}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <div
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-0 z-40 bg-background/90 backdrop-blur-xl transition-all duration-300 lg:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <nav
        className={cn(
          "fixed inset-y-0 end-0 z-50 flex h-dvh w-[min(24rem,90vw)] max-w-full flex-col border-s border-border/50 bg-background/65 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out lg:hidden",
          isOpen
            ? "translate-x-0"
            : "pointer-events-none ltr:translate-x-full rtl:-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/AIC_logo_notext.svg"
              alt={tCommon("brandTitle")}
              width={40}
              height={40}
              className="object-contain"
            />

            <div>
              <p className="text-sm font-semibold text-foreground">
                {tCommon("brandTitle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {tCommon("brandSubtitle")}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={tNav("closeMenu")}
            onClick={closeMenu}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary-300" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/50 px-4 py-8">
          <Button asChild size="sm" className="w-full rounded-xl">
            <Link href="/#join" onClick={closeMenu}>
              {tNav("join")}
            </Link>
          </Button>
        </div>
      </nav>
    </>
  );
}
