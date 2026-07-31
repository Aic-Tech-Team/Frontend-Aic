import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeInitScript } from "@/components/layout/ThemeInitScript";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/animations/AnimatedBackground";
import { ThemeAwareParticles } from "@/components/animations/ThemeAwareParticles";
import { ExperienceSplash } from "@/components/animations/ExperienceSplash";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={dir === "rtl" ? "font-fa" : "font-en"}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AnimatedBackground />

          <div className="pointer-events-none fixed inset-0 -z-10">
            <ThemeAwareParticles
              particleCount={600}
              particleSpread={20}
              speed={0.2}
              particleBaseSize={100}
              moveParticlesOnHover={false}
              alphaParticles
              disableRotation
              pixelRatio={1}
            />
          </div>

          <ExperienceSplash />

          <NextIntlClientProvider messages={messages}>
            <div className="relative z-0 flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
