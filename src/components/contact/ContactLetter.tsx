"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { ContactInput } from "@/lib/contact-validation";
import { cn } from "@/lib/utils";

/**
 * Live letter preview: whatever is typed in the form lands on real-looking
 * letter paper. When the form is sent the letter shrinks, slides into an
 * envelope, the flap closes and a postmark lands (GSAP timeline).
 * Decorative (aria-hidden): the form is the accessible surface.
 */
export function ContactLetter({
  values,
  sent,
}: {
  values: ContactInput;
  sent: boolean;
}) {
  const t = useTranslations("ContactPage");
  const locale = useLocale();
  const root = useRef<HTMLDivElement>(null);

  const date = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "fa" ? "fa-IR-u-ca-persian" : "en-GB", {
        dateStyle: "long",
        timeZone: "Asia/Tehran",
      }).format(new Date()),
    [locale],
  );

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const stage = q("[data-stage]")[0] as HTMLElement | undefined;
      if (!stage) return;
      const H = stage.clientHeight;
      const envH = 176;

      if (!sent) {
        gsap.set(q("[data-letter]"), { clearProps: "transform" });
        gsap.set(q("[data-envelope]"), { autoAlpha: 0, y: 40, clearProps: "scale" });
        gsap.set(q("[data-flap]"), { rotateX: 180 });
        gsap.set(q("[data-postmark]"), { autoAlpha: 0 });
        return;
      }

      if (prefersReducedMotion()) {
        gsap.set(q("[data-letter]"), { autoAlpha: 0 });
        gsap.set(q("[data-envelope]"), { autoAlpha: 1, y: 0 });
        gsap.set(q("[data-flap]"), { rotateX: 0 });
        gsap.set(q("[data-postmark]"), { autoAlpha: 1, scale: 1, rotate: -12 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
      tl.to(q("[data-letter]"), { scale: 0.56, y: H * 0.2, transformOrigin: "50% 0%", duration: 0.7 })
        .to(q("[data-envelope]"), { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.15")
        .to(q("[data-letter]"), { y: H - envH + 24, duration: 0.8 })
        .to(q("[data-flap]"), { rotateX: 0, duration: 0.55 }, "-=0.1")
        .fromTo(
          q("[data-postmark]"),
          { autoAlpha: 0, scale: 2.4, rotate: -30 },
          { autoAlpha: 1, scale: 1, rotate: -12, duration: 0.5, ease: "back.out(2.4)" },
          "-=0.05",
        )
        .to(q("[data-envelope]"), { y: -10, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" }, "-=0.25");
    },
    { scope: root, dependencies: [sent] },
  );

  const message = values.message.trim();
  const contact = [values.email, values.phone].filter(Boolean).join(" · ");

  return (
    <div ref={root} aria-hidden="true">
      <div data-stage className="relative mx-auto h-[38rem] w-full max-w-[30rem] overflow-hidden sm:overflow-visible">
        {/* letter */}
        <div
          data-letter
          className="paper paper--blank absolute inset-x-0 top-0 z-10 flex h-[36rem] flex-col ps-10 pe-8 pb-7 pt-8 will-change-transform"
        >
          <span aria-hidden="true" className="paper-margin" />
          <span aria-hidden="true" className="paper-hole top-[2.4rem]" />
          <span aria-hidden="true" className="paper-hole top-[17rem]" />
          <span aria-hidden="true" className="paper-hole top-[31.6rem]" />
          <p className="mb-4 flex items-center gap-2 text-xs font-bold text-[#6b5fa3]">
            <span className={cn("size-2 rounded-full", sent ? "bg-emerald-500" : "animate-pulse bg-[#8b6cff]")} />
            {sent ? t("letter.sent") : t("letter.live")}
          </p>
          <div className="flex items-start gap-3 border-b-2 border-double border-[#5b3fd0]/30 pb-4 pe-16">
            <div className="flex items-center gap-3">
              <Image src="/logo/AIC_logo_notext.svg" alt="" width={36} height={36} className="size-9" />
              <div>
                <p className="text-sm font-extrabold leading-tight text-[#1f1a3d]">{t("letter.org")}</p>
                <p className="text-xs leading-tight text-[#6b5fa3]">AI Association</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between gap-3 text-[13px] leading-7">
            <p className="min-w-0 font-bold text-[#1f1a3d]">
              <span className="text-[#6b5fa3]">{t("letter.to")}: </span>
              {t("letter.team")}
              <span className="text-[#6b5fa3]"> — </span>
              <span className="font-extrabold text-[#5b3fd0]">{values.subject}</span>
            </p>
            <p className="shrink-0 text-xs font-bold text-[#6b5fa3]">{date}</p>
          </div>

          <p className="mt-1 text-sm font-bold leading-7 text-[#1f1a3d]">{t("letter.greeting")}</p>

          <p
            className={cn(
              "ruled mt-1 line-clamp-[13] min-h-0 flex-1 overflow-hidden whitespace-pre-wrap text-[15px] leading-7",
              message ? "text-[#1f1a3d]" : "text-[#9a93b8]",
            )}
          >
            {message || t("letter.empty")}
          </p>

          <div className="mt-3 border-t border-dashed border-[#b9b0d8] pt-3">
            <p className="text-xs leading-6 text-[#6b5fa3]">{t("letter.closing")}</p>
            <p className="-rotate-1 text-lg font-extrabold leading-8 text-[#3b2a9a]">
              {values.name || <span className="text-[#b9b0d8]">{t("letter.anon")}</span>}
            </p>
            {contact ? (
              <p dir="ltr" className="truncate text-start text-xs leading-5 text-[#6b5fa3] rtl:text-end">
                {contact}
              </p>
            ) : null}
          </div>

          {/* postage stamp */}
          <span className="absolute -top-1 end-5 hidden h-12 w-10 rotate-3 items-center justify-center border-2 border-dashed border-[#5b3fd0]/40 bg-[#efe9ff] sm:flex">
            <Image src="/logo/AIC_logo_notext.svg" alt="" width={22} height={22} className="opacity-80" />
          </span>
        </div>

        {/* envelope */}
        <div
          data-envelope
          className="absolute inset-x-0 bottom-0 z-20 h-44 opacity-0 [perspective:900px]"
        >
          <div className="absolute inset-0 rounded-b-lg bg-[#d8cfb6]" />
          <svg
            viewBox="0 0 100 44"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full drop-shadow-[0_18px_24px_rgba(10,6,40,0.45)]"
          >
            <polygon points="0,0 50,26 0,44" fill="#ece4cd" />
            <polygon points="100,0 50,26 100,44" fill="#e6ddc4" />
            <polygon points="0,44 50,18 100,44" fill="#f3ecd8" />
          </svg>
          <div
            data-flap
            className="absolute inset-x-0 top-0 h-24 origin-top bg-[#e0d7bd] [clip-path:polygon(0_0,100%_0,50%_100%)]"
            style={{ transform: "rotateX(180deg)" }}
          />
          <span
            data-postmark
            className="absolute start-1/2 top-12 z-30 flex size-20 -translate-x-1/2 flex-col items-center justify-center rounded-full border-[3px] border-[#5b3fd0] text-[#5b3fd0] opacity-0 rtl:translate-x-1/2"
          >
            <span className="text-xs font-bold">{date}</span>
            <span className="text-sm font-extrabold">{t("letter.postmark")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
