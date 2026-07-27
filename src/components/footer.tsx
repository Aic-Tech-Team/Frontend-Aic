"use client";

import { useRef } from "react";
import { Mail, MapPin, Clock, Send } from "lucide-react";

// Brand icons removed from lucide-react — using inline SVGs instead
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { Link } from "@/i18n/navigation";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import SplashCursor from "./SplashCursor";

const quickLinks = [
  { label: "خانه", href: "/" },
  { label: "رویدادها", href: "/#events" },
  { label: "فعالیت‌ها", href: "/#activities" },
  { label: "وبلاگ", href: "/#blog" },
  { label: "درباره ما", href: "/about" },
];

const activityLinks = [
  { label: "کارگاه‌های آموزشی", href: "/#activities" },
  { label: "کنفرانس‌های علمی", href: "/#events" },
  { label: "بازدیدهای صنعتی", href: "/#activities" },
  { label: "مسابقات دانشجویی", href: "/#events" },
  { label: "پروژه‌های پژوهشی", href: "/#teams" },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <footer
      ref={footerRef}
      dir="rtl"
      className="relative w-full overflow-hidden border-t border-border/50 bg-background/40 px-4 pb-8 pt-14 backdrop-blur-xl sm:px-6 lg:px-10"
    >
      <div className="opacity-50 pointer-events-none absolute inset-0 z-0">
        <SplashCursor
          containerRef={footerRef}
          DENSITY_DISSIPATION={2}
          VELOCITY_DISSIPATION={4}
          PRESSURE={0.1}
          CURL={14}
          SPLAT_RADIUS={0.90}
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
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-glow">
                logo
              </span>
              <span>
                <span className="block text-sm font-bold text-foreground">
                  انجمن علمی
                </span>
                <span className="block text-xs text-muted-foreground">
                  هوش مصنوعی
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              بستری علمی برای رشد، یادگیری و همکاری دانشجویان علاقه‌مند به هوش مصنوعی.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Send, LinkedinIcon, InstagramIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-300 hover:border-primary-400/40 hover:text-primary-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </RevealItem>

          <RevealItem direction="up">
            <h4 className="text-sm font-bold text-foreground">دسترسی سریع</h4>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </RevealItem>

          <RevealItem direction="up">
            <h4 className="text-sm font-bold text-foreground">فعالیت‌ها</h4>
            <ul className="mt-4 space-y-3">
              {activityLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </RevealItem>

          <RevealItem direction="up">
            <h4 className="text-sm font-bold text-foreground">تماس با ما</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-300" />
                ai.association@university.ac.ir
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-300" />
                دانشکده مهندسی کامپیوتر، ساختمان آموزشی شماره ۲
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-300" />
                شنبه تا چهارشنبه، ۱۰ تا ۱۶
              </li>
            </ul>
          </RevealItem>
        </RevealGroup>

        <Reveal
          direction="up"
          delay={0.1}
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row"
        >
          <p>© ۱۴۰۴ انجمن علمی هوش مصنوعی. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-primary-300">
              حریم خصوصی
            </a>
            <a href="#" className="transition-colors hover:text-primary-300">
              قوانین استفاده
            </a>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}