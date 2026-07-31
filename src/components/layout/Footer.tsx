"use client";
import Image from "next/image";

import { Mail, MapPin, Clock } from "lucide-react";
import { SiInstagram, SiTelegram } from "@icons-pack/react-simple-icons";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { getCopyrightYears } from "@/lib/utils";

export function Footer() {
  const tCommon = useTranslations("Common");
  const tFooter = useTranslations("Footer");
  const locale = useLocale();
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
    <footer className="glass-footer relative w-full overflow-hidden pb-6 pt-10 sm:pb-8 sm:pt-14">
      <div className="container relative z-10">
        <RevealGroup className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16 xl:gap-24">
          <RevealItem direction="up" className="lg:max-w-[18rem] lg:shrink-0 xl:max-w-[20rem]">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo/AIC_logo_notext.svg"
                alt={tCommon("brandTitle")}
                width={52}
                height={52}
                className="h-12 w-12 object-contain sm:h-16 sm:w-16"
              />
              <span className="min-w-0">
                <span className="block text-base font-bold text-foreground sm:text-lg">
                  {tCommon("brandTitle")}
                </span>
                <span className="block text-sm text-muted-foreground sm:text-base">
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

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border/40 pt-8 sm:grid-cols-3 sm:gap-x-6 lg:min-w-0 lg:flex-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1.45fr)] lg:gap-x-3 xl:gap-x-4 lg:border-t-0 lg:pt-0">
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

            <RevealItem
              direction="up"
              className="col-span-2 sm:col-span-1"
            >
              <h4 className="text-sm font-bold text-foreground">
                {tFooter("contactTitle")}
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                  <span className="min-w-0 break-words">{tFooter("email")}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                  <span className="min-w-0 break-words">{tFooter("address")}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                  <span className="min-w-0">{tFooter("hours")}</span>
                </li>
              </ul>
            </RevealItem>
          </div>
        </RevealGroup>

        <div className="relative mt-6 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-4 text-center text-xs text-muted-foreground sm:flex-row sm:text-start">
          <p>{tFooter("copyright", { years: copyrightYears })}</p>

          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-primary-300">
              {tFooter("privacy")}
            </a>
            <a href="#" className="transition-colors hover:text-primary-300">
              {tFooter("terms")}
            </a>
          </div>

          <figure className="pointer-events-none absolute inset-e-0 top-0 z-20 -translate-y-[75%]">
            <Image
              src="/images/CatTyping.svg"
              alt="typing cat"
              width={75}
              height={75}
              className="h-14 w-14 sm:h-[75px] sm:w-[75px]"
            />
          </figure>
        </div>
      </div>
    </footer>
  );
}
