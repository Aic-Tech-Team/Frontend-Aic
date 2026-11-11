"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import { Check, Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlareButton } from "@/components/ui/glare-button";
import AutoBorderGlow from "@/components/animations/AutoBorderGlow";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { INTENT_HUES, INTENT_ICONS } from "@/components/contact/intents";
import { cn } from "@/lib/utils";
import {
  hasErrors,
  MESSAGE_MIN_LENGTH,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactInput,
} from "@/lib/contact-validation";
import { submitContact } from "@/app/[locale]/contact/actions";

const ERROR_CODES = ["required", "email", "phone", "messageShort"];

function Field({
  id,
  label,
  optionalLabel,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  optionalLabel?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 flex items-baseline gap-2 text-sm font-bold text-foreground"
      >
        {label}
        {optionalLabel ? (
          <span className="text-xs font-normal text-muted-foreground">
            {optionalLabel}
          </span>
        ) : null}
      </label>
      {children}
      {!error && hint ? (
        <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs leading-6 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm({
  subject: subjectProp,
  onSubjectChange,
  onValues,
  onSentChange,
}: {
  subject?: string;
  onSubjectChange?: (subject: string) => void;
  /** Fires on every edit so a live preview can mirror the draft. */
  onValues?: (values: ContactInput) => void;
  onSentChange?: (sent: boolean) => void;
} = {}) {
  const t = useTranslations("ContactPage");
  const subjects = t.raw("subjects") as string[];

  const [values, setValues] = useState<ContactInput>({
    name: "",
    email: "",
    phone: "",
    subject: subjectProp ?? subjects[0],
    message: "",
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => onValues?.(values), [values, onValues]);
  useEffect(() => onSentChange?.(sent), [sent, onSentChange]);

  useEffect(() => {
    if (!subjectProp) return;
    setValues((v) =>
      v.subject === subjectProp ? v : { ...v, subject: subjectProp },
    );
  }, [subjectProp]);

  const set = (field: ContactField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (field === "subject") onSubjectChange?.(value);
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const message = (field: ContactField) => {
    const code = errors[field];
    if (!code) return undefined;
    return ERROR_CODES.includes(code) ? t(`errors.${code}`) : code;
  };

  const fieldProps = (field: ContactField) => ({
    id: `contact-${field}`,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
    disabled: pending,
    value: values[field],
  });

  const focusFirstError = (errs: ContactErrors) => {
    const first = (Object.keys(errs) as ContactField[])[0];
    formRef.current?.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = normalizeContact(values);
    const clientErrors = validateContact(input);
    setErrors(clientErrors);
    setFailed(false);
    if (hasErrors(clientErrors)) return focusFirstError(clientErrors);

    startTransition(async () => {
      const result = await submitContact({
        ...input,
        website: honeypot.current?.value,
      });
      if (result.ok) return setSent(true);
      setErrors(result.fieldErrors);
      setFailed(result.failed);
      if (hasErrors(result.fieldErrors)) focusFirstError(result.fieldErrors);
    });
  };

  const reset = () => {
    const next = subjects[0];
    setValues({ name: "", email: "", phone: "", subject: next, message: "" });
    onSubjectChange?.(next);
    setErrors({});
    setSent(false);
  };

  useGSAP(
    () => {
      if (!sent || prefersReducedMotion()) return;
      gsap.from("[data-done-badge]", { scale: 0.4, autoAlpha: 0, duration: 0.8, ease: "back.out(2)" });
      gsap.fromTo(
        "[data-done-check]",
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.6, delay: 0.35, ease: "power2.out" },
      );
      gsap.from("[data-done-item]", { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1, delay: 0.25, ease: "power3.out" });
    },
    { scope: doneRef, dependencies: [sent] },
  );

  return (
    <div className="relative transition-transform duration-300 focus-within:-translate-y-1 motion-reduce:transform-none">
      {/* Same cat as the footer, perched on the card edge */}
      <Image
        src="/images/CatTyping.svg"
        alt=""
        aria-hidden="true"
        width={75}
        height={75}
        className="pointer-events-none absolute bottom-full z-10 h-14 w-14 translate-y-[24%] inset-e-8 sm:h-18.75 sm:w-18.75"
      />

      <AutoBorderGlow
        className="w-full"
        borderRadius={32}
        glowColor="270 90 75"
        colors={["#c084fc", "#f472b6", "#38bdf8"]}
        glowRadius={26}
        glowIntensity={0.8}
        coneSpread={25}
        speed={7}
        lightModeBoost={2.5}
      >
        <div className="surface relative w-full rounded-[inherit] border-0 p-5 sm:p-10">
          {sent ? (
            <div ref={doneRef} role="status" className="flex min-h-96 flex-col items-center justify-center text-center">
              <span
                data-done-badge
                className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary-300 shadow-glow ring-1 ring-primary/40"
              >
                <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path data-done-check pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <h2 data-done-item className="mt-7 text-2xl font-extrabold text-foreground sm:text-3xl">
                {t("success.title")}
              </h2>
              <p data-done-item className="mt-3 max-w-[40ch] text-sm leading-8 text-muted-foreground sm:text-base">
                {t("success.description")}
              </p>
              <Button data-done-item type="button" variant="outline" onClick={reset} className="mt-8 h-11 rounded-full px-7">
                {t("success.again")}
              </Button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6">
              <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">{t("form.title")}</h2>

              {/* Honeypot: hidden from people and assistive tech */}
              <input
                ref={honeypot}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -start-2499.75 h-0 w-0 opacity-0"
              />

              <div role="radiogroup" aria-label={t("form.subject")}>
                <p className="mb-3 text-sm font-bold text-foreground">{t("form.subject")}</p>
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 xl:grid-cols-3">
                  {subjects.map((s, i) => {
                    const active = values.subject === s;
                    const Icon = INTENT_ICONS[i];
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={pending}
                        onClick={() => set("subject", s)}
                        className={cn(
                          "relative flex min-h-[5.5rem] flex-col items-start justify-between gap-2.5 rounded-2xl border p-3 text-start outline-none sm:min-h-[4.25rem] sm:flex-row sm:items-center sm:justify-start sm:gap-3 transition-[background-color,border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
                          active
                            ? "border-[var(--hue)] bg-[color-mix(in_srgb,var(--hue)_16%,transparent)] shadow-[0_10px_26px_-14px_var(--hue)]"
                            : "border-border/60 bg-white/[0.03] hover:border-[color-mix(in_srgb,var(--hue)_70%,transparent)]",
                        )}
                        style={{ "--hue": INTENT_HUES[i] } as React.CSSProperties}
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                            active
                              ? "-rotate-6 bg-[var(--hue)] text-white shadow-[0_4px_12px_-4px_var(--hue)]"
                              : "bg-[color-mix(in_srgb,var(--hue)_18%,transparent)] text-[var(--hue)]",
                          )}
                        >
                          {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
                        </span>
                        <span className={cn("min-w-0 text-sm font-bold leading-snug", active ? "text-foreground" : "text-foreground/80")}>{s}</span>
                        {active ? <Check className="absolute end-2.5 top-2.5 size-3.5 text-[var(--hue)]" aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field id="contact-name" label={t("form.name")} error={message("name")}>
                  <Input
                    {...fieldProps("name")}
                    name="name"
                    autoComplete="name"
                    placeholder={t("form.namePlaceholder")}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </Field>
                <Field id="contact-email" label={t("form.email")} error={message("email")}>
                  <Input
                    {...fieldProps("email")}
                    name="email"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    placeholder={t("form.emailPlaceholder")}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
              </div>

              <Field id="contact-phone" label={t("form.phone")} error={message("phone")} hint={t("form.phoneHint")}>
                <Input
                  {...fieldProps("phone")}
                  name="phone"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t("form.phonePlaceholder")}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>

              <Field
                id="contact-message"
                label={t("form.message")}
                error={message("message")}
                hint={
                  values.message.trim().length < MESSAGE_MIN_LENGTH
                    ? t("form.minChars", { count: MESSAGE_MIN_LENGTH - values.message.trim().length })
                    : undefined
                }
              >
                <Textarea
                  {...fieldProps("message")}
                  name="message"
                  placeholder={t("form.messagePlaceholder")}
                  onChange={(e) => set("message", e.target.value)}
                />
              </Field>

              {failed ? (
                <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm leading-7 text-destructive">
                  {t("errors.failed")}
                </p>
              ) : null}

              <GlareButton className="w-full sm:w-auto">
                <Button
                  type="submit"
                  size="lg"
                  disabled={pending}
                  className="h-12 w-full rounded-full px-9 shadow-glow sm:w-auto"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("form.sending")}
                    </>
                  ) : (
                    <>
                      {t("form.submit")}
                      <Send className="h-4 w-4 rtl:-scale-x-100" />
                    </>
                  )}
                </Button>
              </GlareButton>
            </form>
          )}
        </div>
      </AutoBorderGlow>
    </div>
  );
}
