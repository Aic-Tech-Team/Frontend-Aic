"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactForm } from "@/components/contact/ContactForm";
import { cn } from "@/lib/utils";

type Intent = { title: string; body: string; after: string };

export function ContactStudio() {
  const t = useTranslations("ContactPage");
  const subjects = t.raw("subjects") as string[];
  const intents = t.raw("intents") as Intent[];
  const [subject, setSubject] = useState(subjects[0] ?? "");

  const index = Math.max(0, subjects.indexOf(subject));
  const intent = intents[index];

  return (
    <>
      <section className="pb-8 pt-6 sm:pb-14 sm:pt-10">
        <div className="container grid min-w-0 items-start gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-12">
          <div className="order-2 min-w-0 sm:order-1 lg:sticky lg:top-24">
            <h1 className="text-balance text-4xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
              {t("headline")}
            </h1>
            <p className="mt-5 max-w-[36ch] text-pretty text-base leading-8 text-muted-foreground">
              {t("lede")}
            </p>

            <div className="mt-8">
              {subjects.map((item) => {
                const on = item === subject;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSubject(item)}
                    className={cn(
                      "block w-full py-1.5 text-start text-lg font-extrabold leading-snug outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:text-xl",
                      on
                        ? "text-foreground"
                        : "text-muted-foreground/40 hover:text-foreground",
                    )}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <p aria-live="polite" className="mt-6 max-w-[36ch] text-base leading-8 text-foreground">
              {intent?.after}
            </p>
          </div>

          <div className="order-1 min-w-0 sm:order-2">
            <ContactForm subject={subject} onSubjectChange={setSubject} />
          </div>
        </div>
      </section>

      <ContactChannels />
    </>
  );
}
