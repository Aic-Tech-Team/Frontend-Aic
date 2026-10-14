"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { LocaleSwitcher } from "@/components/common/LocaleSwitcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  gsap,
  prefersReducedMotion,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/events", key: "events" },
  { href: "/activities", key: "activities" },
  { href: "/teams", key: "teams" },
  { href: "/blog", key: "blog" },
] as const;

function menuOrigin() {
  return document.documentElement.dir === "rtl" ? "8% 5%" : "92% 5%";
}

function setBodyScrollLock(locked: boolean) {
  document.body.style.overflowY = locked ? "hidden" : "";
  document.body.style.touchAction = locked ? "none" : "";
}

function pinHeaderVisible(root: HTMLElement | null) {
  if (!root) return;
  gsap.killTweensOf(root);
  gsap.set(root, { yPercent: 0 });
}

export function Navbar() {
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Nav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const rootRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuOpenedRef = useRef(false);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const closeMenu = () => setIsOpen(false);

  const toggleMenu = () => {
    setIsOpen((prev) => {
      if (!prev) pinHeaderVisible(rootRef.current);
      return !prev;
    });
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Pin header before paint whenever the menu is open (close btn lives here).
  useLayoutEffect(() => {
    if (isOpen) pinHeaderVisible(rootRef.current);
  }, [isOpen]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pill = pillRef.current;
      if (!root || !pill || prefersReducedMotion()) return;

      const hide = gsap.quickTo(root, "yPercent", {
        duration: 0.5,
        ease: "power3.out",
      });

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          pill.toggleAttribute("data-scrolled", y > 24);
          if (isOpenRef.current) {
            hide(0);
            return;
          }
          if (y < 120) hide(0);
          else if (self.direction === 1) hide(-130);
          else hide(0);
        },
      });
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const nav = navRef.current;
      const ind = indicatorRef.current;
      if (!nav || !ind) return;

      const links = gsap.utils.toArray<HTMLElement>("[data-nav-link]", nav);
      const place = (el: HTMLElement | undefined, animate: boolean) => {
        if (!el) {
          gsap.to(ind, { autoAlpha: 0, duration: 0.2 });
          return;
        }
        const n = nav.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        gsap.to(ind, {
          x: r.left - n.left,
          width: r.width,
          autoAlpha: 1,
          duration: animate && !prefersReducedMotion() ? 0.45 : 0,
          ease: "expo.out",
          overwrite: true,
        });
      };

      const active = () => links.find((l) => l.dataset.active === "true");
      place(active(), false);

      const cleanups = links.map((l) => {
        const enter = () => place(l, true);
        const leave = () => place(active(), true);
        l.addEventListener("pointerenter", enter);
        l.addEventListener("focus", enter);
        l.addEventListener("pointerleave", leave);
        l.addEventListener("blur", leave);
        return () => {
          l.removeEventListener("pointerenter", enter);
          l.removeEventListener("focus", enter);
          l.removeEventListener("pointerleave", leave);
          l.removeEventListener("blur", leave);
        };
      });

      const onResize = () => place(active(), false);
      window.addEventListener("resize", onResize);
      return () => {
        cleanups.forEach((fn) => fn());
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: navRef, dependencies: [pathname] },
  );

  useGSAP(
    () => {
      const menu = menuRef.current;
      if (!menu) return;

      const items = gsap.utils.toArray<HTMLElement>(
        menu.querySelectorAll("[data-menu-item]"),
      );
      const origin = menuOrigin();
      const circle = (size: string) => `circle(${size} at ${origin})`;
      const reduce = prefersReducedMotion();

      setBodyScrollLock(isOpen);
      gsap.killTweensOf([menu, ...items]);

      const hideMenu = () => {
        gsap.set(menu, { autoAlpha: 0, clipPath: circle("0%") });
        gsap.set(items, { yPercent: 110, autoAlpha: 0 });
      };

      if (isOpen) {
        menuOpenedRef.current = true;
        pinHeaderVisible(rootRef.current);
        if (reduce) {
          gsap.set(menu, { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1 });
          gsap.set(items, { yPercent: 0, autoAlpha: 1 });
          return;
        }
        gsap.set(menu, { autoAlpha: 1 });
        gsap.fromTo(
          menu,
          { clipPath: circle("0%") },
          { clipPath: circle("150%"), duration: 0.85, ease: "expo.inOut" },
        );
        gsap.fromTo(
          items,
          { yPercent: 110, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.75,
            stagger: 0.06,
            delay: 0.22,
            ease: "expo.out",
          },
        );
      } else if (menuOpenedRef.current) {
        if (reduce) {
          hideMenu();
          return;
        }
        gsap
          .timeline({
            defaults: { overwrite: "auto" },
            onComplete: hideMenu,
          })
          .to(items, {
            yPercent: 90,
            autoAlpha: 0,
            duration: 0.4,
            stagger: { each: 0.045, from: "end" },
            ease: "power2.in",
          })
          .to(
            menu,
            { clipPath: circle("0%"), duration: 0.7, ease: "expo.inOut" },
            "-=0.12",
          );
      } else {
        hideMenu();
      }

      return () => setBodyScrollLock(false);
    },
    { scope: menuRef, dependencies: [isOpen] },
  );

  return (
    <>
      <header
        ref={rootRef}
        data-menu-open={isOpen || undefined}
        className={cn(
          "top-0 w-full pt-3 will-change-transform sm:pt-4",
          // ! beats GSAP inline transform so the close button stays on-screen.
          isOpen
            ? "fixed inset-x-0 z-[60] translate-y-0!"
            : "sticky z-50",
        )}
      >
        <div className="container">
          <div
            ref={pillRef}
            className={cn(
              "group/pill flex items-center justify-between gap-2 rounded-full border border-border/40 bg-background/40 py-2 ps-3 pe-2 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 sm:gap-4 sm:ps-4",
              "data-scrolled:border-border/70 data-scrolled:bg-background/80 data-scrolled:shadow-[0_18px_50px_-24px_color-mix(in_srgb,var(--primary)_55%,transparent)]",
            )}
          >
            <Link
              href="/"
              onClick={closeMenu}
              className="flex min-w-0 items-center gap-2.5 text-foreground"
            >
              <Image
                src="/logo/AIC_logo_notext.svg"
                alt={tCommon("brandTitle")}
                width={40}
                height={40}
                priority
                className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
              />
              <span className="min-w-0 max-sm:hidden">
                <span className="block truncate text-sm font-extrabold leading-tight">
                  {tCommon("brandTitle")}
                </span>
                <span className="block truncate text-xs leading-tight text-muted-foreground">
                  {tCommon("brandSubtitle")}
                </span>
              </span>
            </Link>

            <nav
              ref={navRef}
              className="relative hidden items-center lg:flex"
              aria-label={tCommon("brandTitle")}
            >
              <span
                ref={indicatorRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-primary/15 opacity-0 ring-1 ring-primary/25"
              />
              {LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-nav-link
                    data-active={active}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-foreground"
                        : "text-foreground/65 hover:text-foreground",
                    )}
                  >
                    {tNav(link.key)}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <LocaleSwitcher />
              <ThemeSwitcher />
              <Button
                asChild
                size="sm"
                className="hidden h-10 rounded-full px-5 shadow-glow lg:inline-flex"
              >
                <Link href="/#join">{tNav("join")}</Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full lg:hidden"
                aria-label={isOpen ? tNav("closeMenu") : tNav("openMenu")}
                aria-expanded={isOpen}
                onClick={toggleMenu}
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        aria-hidden={!isOpen}
        inert={!isOpen}
        className="invisible fixed inset-0 z-40 flex flex-col bg-background/95 px-6 pb-8 pt-28 opacity-0 backdrop-blur-2xl lg:hidden"
      >
        <nav className="flex flex-1 flex-col justify-center gap-1">
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <div key={link.href} className="overflow-hidden py-1">
                <Link
                  href={link.href}
                  data-menu-item
                  onClick={closeMenu}
                  className={cn(
                    "block text-4xl font-extrabold leading-snug tracking-tight transition-colors sm:text-5xl",
                    active
                      ? "text-gradient"
                      : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  {tNav(link.key)}
                </Link>
              </div>
            );
          })}
        </nav>
        <div data-menu-item>
          <Button asChild size="lg" className="w-full rounded-2xl shadow-glow">
            <Link href="/#join" onClick={closeMenu}>
              {tNav("join")}
              <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
