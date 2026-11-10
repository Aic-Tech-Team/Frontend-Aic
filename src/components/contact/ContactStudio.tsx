"use client";

import { StickyColumn } from "@/components/common/StickyColumn";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactFaq } from "@/components/contact/ContactFaq";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactLetter } from "@/components/contact/ContactLetter";
import { ContactLetters } from "@/components/contact/ContactLetters";
import { PARTNER_INDEX } from "@/components/contact/intents";
import { Reveal } from "@/components/animations/Reveal";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { whenBooted } from "@/lib/boot";
import type { ContactInput } from "@/lib/contact-validation";

const EMPTY: ContactInput = { name: "", email: "", phone: "", subject: "", message: "" };

export function ContactStudio({ initialIndex = 0 }: { initialIndex?: number }) {
  const t = useTranslations("ContactPage");
  const subjects = t.raw("subjects") as string[];
  const [subject, setSubject] = useState(subjects[initialIndex] ?? subjects[0] ?? "");
  const [draft, setDraft] = useState<ContactInput>(EMPTY);
  const [sent, setSent] = useState(false);
  const hero = useRef<HTMLElement>(null);

  const index = Math.max(0, subjects.indexOf(subject));

  // Headline: words rise out of a mask.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // paused until the boot loader leaves: nothing plays out of sight under it
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });
      whenBooted(() => tl.play());
      tl.from("[data-word]", { yPercent: 115, duration: 1, stagger: 0.07 })
        .from("[data-lede]", { autoAlpha: 0, y: 16, duration: 0.8 }, "-=0.6")
        .from("[data-envelope-wrap]", { autoAlpha: 0, y: 24, duration: 0.8 }, "-=0.4");
    },
    { scope: hero },
  );

  const goForm = () =>
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" });

  const pick = (i: number) => setSubject(subjects[i] ?? subjects[0]);
  const pickAndGo = (i: number) => {
    pick(i);
    goForm();
  };

  const words = (text: string, cls = "") =>
    text.split(" ").map((w, i) => (
      <span key={i} className="me-[0.28em] inline-block overflow-hidden align-bottom">
        <span data-word className={`inline-block ${cls}`}>
          {w}
        </span>
      </span>
    ));

  return (
    <>
      <section ref={hero} className="relative overflow-x-clip pb-10 pt-10 sm:pb-16 sm:pt-14">
        <div className="container min-w-0 text-center">
          <p data-lede data-no-anim className="mx-auto inline-flex items-center gap-3 text-sm font-bold text-primary-300">
            <span aria-hidden="true" className="h-px w-8 bg-primary-300/60" />
            {t("heroKicker")}
            <span aria-hidden="true" className="h-px w-8 bg-primary-300/60" />
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-black leading-[1.3] tracking-tight text-foreground min-[420px]:text-5xl sm:text-6xl lg:text-7xl">
            <span className="block">{words(t("headline"))}</span>
            <span className="block text-gradient">{words(t("headlineAccent"), "text-gradient")}</span>
          </h1>
          <p data-lede data-no-anim className="mx-auto mt-6 max-w-[44rem] text-pretty text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
            {t("lede")}
          </p>

          <div data-envelope-wrap className="relative mt-8 min-w-0 sm:mt-10">
            <div className="pointer-events-none absolute inset-x-[10%] inset-y-[6%] rounded-full bg-linear-to-br from-primary-500/25 via-glow-2/10 to-transparent blur-3xl" />
            <ContactLetters index={index} onPick={pickAndGo} />
          </div>
        </div>
      </section>

      <section className="pb-14 pt-12 sm:pb-24 sm:pt-24">
        <div className="container grid min-w-0 items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
          <Reveal className="min-w-0" direction="up">
            <div id="contact-form" className="scroll-mt-28">
              <ContactForm
                subject={subject}
                onSubjectChange={setSubject}
                onValues={setDraft}
                onSentChange={setSent}
              />
            </div>
          </Reveal>

          <StickyColumn className="hidden min-w-0 lg:block">
          <Reveal className="min-w-0" direction="left" delay={0.1}>
            <ContactLetter values={{ ...draft, subject }} sent={sent} />
          </Reveal>
          </StickyColumn>
        </div>
      </section>

      <ContactChannels onPartner={() => pickAndGo(PARTNER_INDEX)} />
      <ContactFaq onIntent={pickAndGo} onWrite={() => pickAndGo(index)} />
    </>
  );
}
