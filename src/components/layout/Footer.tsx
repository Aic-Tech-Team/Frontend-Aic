"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUp, Clock, Mail, MapPin, type LucideIcon } from "lucide-react";
import { SiInstagram, SiTelegram } from "@icons-pack/react-simple-icons";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { FooterWordmark } from "@/components/animations/FooterWordmark";
import { getCopyrightYears } from "@/lib/utils";

type NavLink = { label: string; href: string };

function FooterLink({ href, label }: NavLink) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="h-px w-0 bg-primary-400 transition-[width] duration-300 group-hover:w-4" />
      {label}
    </Link>
  );
}

function LinkColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: NavLink[];
  className?: string;
}) {
  return (
    <RevealItem direction="up" className={className}>
      <h4 className="text-base font-extrabold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-1.5">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </RevealItem>
  );
}

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="mt-1 h-4 w-4 shrink-0 text-primary-300" />
      <span className="min-w-0 wrap-break-words leading-7">{children}</span>
    </li>
  );
}

export function Footer() {
  const tCommon = useTranslations("Common");
  const tFooter = useTranslations("Footer");
  const locale = useLocale();
  const footerRef = useRef<HTMLElement>(null);

  const quickLinks: NavLink[] = [
    { label: tFooter("home"), href: "/" },
    { label: tFooter("events"), href: "/events" },
    { label: tFooter("activities"), href: "/activities" },
    { label: tFooter("blog"), href: "/blog" },
    { label: tFooter("about"), href: "/about" },
    { label: tFooter("contact"), href: "/contact" },
  ];

  const activityLinks: NavLink[] = [
    { label: tFooter("workshops"), href: "/activities" },
    { label: tFooter("conferences"), href: "/events" },
    { label: tFooter("visits"), href: "/activities" },
    { label: tFooter("contests"), href: "/events" },
    { label: tFooter("research"), href: "/about" },
  ];

  const social = [
    { label: tFooter("telegram"), node: <SiTelegram color="currentColor" className="h-4 w-4" /> },
    { label: tFooter("linkedin"), node: <LinkedinIcon className="h-4 w-4" /> },
    { label: tFooter("instagram"), node: <SiInstagram color="currentColor" className="h-4 w-4" /> },
  ];

  useEffect(() => {
    const root = footerRef.current;
    const line = root?.querySelector(".signal-line");
    if (!root || !line) return;

    const io = new IntersectionObserver(
      ([entry]) => line.toggleAttribute("data-paused", !entry.isIntersecting),
      { rootMargin: "80px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer
      ref={footerRef}
      className="glass-footer relative isolate mt-auto w-full overflow-hidden pb-0"
    >
      <div className="signal-line" aria-hidden="true">
        <span className="signal-packet" />
      </div>

      <div className="container relative z-10 pt-14 sm:pt-20">
        <RevealGroup className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-20">
          <RevealItem direction="up">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/AIC_logo_notext.svg"
                alt={tCommon("brandTitle")}
                width={64}
                height={64}
                className="h-14 w-14 object-contain sm:h-16 sm:w-16"
              />
              <span className="min-w-0">
                <span className="block text-lg font-extrabold text-foreground sm:text-xl">
                  {tCommon("brandTitle")}
                </span>
                <span className="block text-sm text-muted-foreground sm:text-base">
                  {tCommon("brandSubtitle")}
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-[40ch] text-sm leading-8 text-muted-foreground">
              {tFooter("blurb")}
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {social.map(({ label, node }) => (
                <span
                  key={label}
                  role="img"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors duration-300 hover:border-primary/60 hover:bg-primary/15 hover:text-foreground"
                >
                  {node}
                </span>
              ))}
            </div>
          </RevealItem>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            <LinkColumn title={tFooter("quickTitle")} links={quickLinks} />
            <LinkColumn title={tFooter("activitiesTitle")} links={activityLinks} />
            <RevealItem direction="up" className="col-span-2 sm:col-span-1">
              <h4 className="text-base font-extrabold text-foreground">
                {tFooter("contactTitle")}
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <ContactRow icon={Mail}>{tFooter("email")}</ContactRow>
                <ContactRow icon={MapPin}>{tFooter("address")}</ContactRow>
                <ContactRow icon={Clock}>{tFooter("hours")}</ContactRow>
              </ul>
            </RevealItem>
          </div>
        </RevealGroup>

        <FooterWordmark />
      </div>

      <section className="relative z-10 border-t border-border/50 bg-background/40 py-4 sm:py-5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20"
          aria-hidden="true"
        >
          <div className="container relative h-0">
            {/* SVG bottom padding ~24% — nudge so ink sits on the border */}
            <figure className="absolute inset-e-0 bottom-0 translate-y-[24%] leading-none">
              <Image
                src="/images/CatTyping.svg"
                alt=""
                width={75}
                height={75}
                className="block h-11 w-11 sm:h-14 sm:w-14 md:h-18.75 md:w-18.75"
              />
            </figure>
          </div>
        </div>

        <div className="container relative flex flex-col items-center justify-between gap-3 text-center text-xs text-muted-foreground sm:flex-row sm:text-start">
          <p>{tFooter("copyright", { years: getCopyrightYears(locale) })}</p>
          <button
            type="button"
            onClick={toTop}
            aria-label={tFooter("backToTop")}
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-border/60 text-foreground transition-colors duration-300 hover:border-primary/60 hover:bg-primary/15"
          >
            <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </section>
    </footer>
  );
}
