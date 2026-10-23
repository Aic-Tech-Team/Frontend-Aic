"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import { Check, Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlareButton } from "@/components/ui/glare-button";
import AutoBorderGlow from "@/components/animations/AutoBorderGlow";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import {
  hasErrors,
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
  children,
}: {
  id: string;
  label: string;
  optionalLabel?: string;
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
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs leading-6 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm() {
  const t = useTranslations("ContactPage");
  const subjects = t.raw("subjects") as string[];

  const [values, setValues] = useState<ContactInput>({
    name: "",
    email: "",
    phone: "",
    subject: subjects[0],
    message: "",
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const set = (field: ContactField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
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
    setValues({ name: "", email: "", phone: "", subject: subjects[0], message: "" });
    setErrors({});
    setSent(false);
  };

  useGSAP(
    () => {
      if (!sent || prefersReducedMotion()) return;
      gsap.from("[data-done-badge]", {
        scale: 0.4,
        autoAlpha: 0,
        duration: 0.8,
        ease: "back.out(2)",
      });
      gsap.from("[data-done-item]", {
        y: 18,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.2,
        ease: "power3.out",
      });
    },
    { scope: doneRef, dependencies: [sent] },
  );

  return (
    <div className="relative">
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
        <div className="surface relative w-full rounded-[inherit] border-0 p-6 sm:p-10">
          {sent ? (
            <div
              ref={doneRef}
              role="status"
              className="flex min-h-96 flex-col items-center justify-center text-center"
            >
              <span
                data-done-badge
                className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary-300 shadow-glow ring-1 ring-primary/40"
              >
                <Check className="h-9 w-9" strokeWidth={2.5} />
              </span>
              <h2
                data-done-item
                className="mt-7 text-2xl font-extrabold text-foreground sm:text-3xl"
              >
                {t("success.title")}
              </h2>
              <p
                data-done-item
                className="mt-3 max-w-[40ch] text-sm leading-8 text-muted-foreground sm:text-base"
              >
                {t("success.description")}
              </p>
              <Button
                data-done-item
                type="button"
                variant="outline"
                onClick={reset}
                className="mt-8 h-11 rounded-full px-7"
              >
                {t("success.again")}
              </Button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6">
              <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
                {t("form.title")}
              </h2>

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
                <p className="mb-2.5 text-sm font-bold text-foreground">
                  {t("form.subject")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => {
                    const active = values.subject === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={pending}
                        onClick={() => set("subject", s)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-glow"
                            : "border-border/70 text-muted-foreground hover:border-primary/60 hover:text-foreground",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
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

              <Field
                id="contact-phone"
                label={t("form.phone")}
                optionalLabel={t("form.optional")}
                error={message("phone")}
              >
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

              <Field id="contact-message" label={t("form.message")} error={message("message")}>
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
