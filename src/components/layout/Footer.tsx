"use client";
import Image from "next/image";

import { useRef } from "react";
import { Mail, MapPin, Clock } from "lucide-react";
import { SiInstagram, SiTelegram } from "@icons-pack/react-simple-icons";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";
import SplashCursor from "@/components/animations/SplashCursor";
import { getCopyrightYears } from "@/lib/utils";

export function Footer() {
  const tCommon = useTranslations("Common");
  const tFooter = useTranslations("Footer");
  const locale = useLocale();
  const footerRef = useRef<HTMLElement>(null);
  const copyrightYears = getCopyrightYears(locale);

  const quickLinks = [
    { label: tFooter("home"), href: "/" },
    { label: tFooter("events"), href: "/#events" },
    { label: tFooter("activities"), href: "/#activities" },
    { label: tFooter("blog"), href: "/#blog" },
    { label: tFooter("about"), href: "/about" },
  ];

  const activityLinks = [
    { label: tFooter("workshops"), href: "/#activities" },
    { label: tFooter("conferences"), href: "/#events" },
    { label: tFooter("visits"), href: "/#activities" },
    { label: tFooter("contests"), href: "/#events" },
    { label: tFooter("research"), href: "/#teams" },
  ];

  const social = [
    {
      label: tFooter("telegram"),
      href: "#",
      node: <SiTelegram color="currentColor" className="h-4 w-4" />,
    },
    {
      label: tFooter("linkedin"),
      href: "#",
      node: <LinkedinIcon className="h-4 w-4" />,
    },
    {
      label: tFooter("instagram"),
      href: "#",
      node: <SiInstagram color="currentColor" className="h-4 w-4" />,
    },
  ];

  return (
    <footer
      ref={footerRef}
      className="glass-footer relative w-full overflow-hidden px-4 pb-8 pt-14 sm:px-6 lg:px-10"
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
        <SplashCursor
          containerRef={footerRef}
          DENSITY_DISSIPATION={2}
          VELOCITY_DISSIPATION={4}
          PRESSURE={0.1}
          CURL={14}
          SPLAT_RADIUS={0.9}
          SPLAT_FORCE={5500}
          COLOR_UPDATE_SPEED={11}
          COLOR_INTENSITY={0.15}
          SHADING
          RAINBOW_MODE={false}
          COLOR="#5f1f99"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <RevealGroup className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <RevealItem direction="up">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo/AIC_logo_notext.svg"
                alt={tCommon("brandTitle")}
                width={65}
                height={65}
                className="object-contain"
              />
              <span>
                <span className="block text-lg font-bold text-foreground">
                  {tCommon("brandTitle")}
                </span>
                <span className="block text-base text-muted-foreground">
                  {tCommon("brandSubtitle")}
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {tFooter("blurb")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {social.map(({ label, href, node }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-300 hover:border-primary-400/40 hover:text-primary-300"
                >
                  {node}
                </a>
              ))}
            </div>
          </RevealItem>

          <RevealItem direction="up">
            <h4 className="text-sm font-bold text-foreground">
              {tFooter("quickTitle")}
            </h4>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group relative inline-block pb-1.5 pt-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-center scale-x-0 rounded-full bg-linear-to-r from-primary-400 to-primary-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </RevealItem>

          <RevealItem direction="up">
            <h4 className="text-sm font-bold text-foreground">
              {tFooter("activitiesTitle")}
            </h4>
            <ul className="mt-4 space-y-3">
              {activityLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group relative inline-block pb-1.5 pt-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-center scale-x-0 rounded-full bg-linear-to-r from-primary-400 to-primary-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </RevealItem>

          <RevealItem direction="up">
            <h4 className="text-sm font-bold text-foreground">
              {tFooter("contactTitle")}
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-300" />
                {tFooter("email")}
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-300" />
                {tFooter("address")}
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-300" />
                {tFooter("hours")}
              </li>
            </ul>
          </RevealItem>
        </RevealGroup>

        <div className="relative mt-6 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-4 text-xs text-muted-foreground sm:flex-row">
          <p>{tFooter("copyright", { years: copyrightYears })}</p>

          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-primary-300">
              {tFooter("privacy")}
            </a>
            <a href="#" className="transition-colors hover:text-primary-300">
              {tFooter("terms")}
            </a>
          </div>

          <figure className="absolute inset-e-0 top-0 z-20 -translate-y-[75%]">
            <Image
              src="/images/CatTyping.svg"
              alt="typing cat"
              width={75}
              height={75}
            />
          </figure>
        </div>
      </div>
    </footer>
  );
}
