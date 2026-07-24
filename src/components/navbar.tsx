"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Aurora from "@/components/Aurora";

const navLinks = [
  { href: "/#events", label: "رویدادها" },
  { href: "/#activities", label: "فعالیت‌ها" },
  { href: "/#teams", label: "تیم‌ها" },
  { href: "/#blog", label: "بلاگ" },
] as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="relative w-full overflow-hidden transition-all duration-500">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Aurora amplitude={2} blend={0.6} />
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="sm:inline">انجمن هوش مصنوعی</span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative px-3.5 py-2 text-sm font-medium"
            >
              {link.label}
              <span className="pointer-events-none absolute inset-x-1 bottom-1 h-[2px] origin-center scale-x-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-transform duration-300 ease-smooth group-hover:scale-x-100" />
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
        <nav className="animate-fade-in flex w-full flex-col gap-1 bg-background/80 px-4 py-4 backdrop-blur-xl sm:hidden">
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
          <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-3">
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