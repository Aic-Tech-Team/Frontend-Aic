import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { iranYekan } from "@/app/fonts";
import "../globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeInitScript } from "@/components/layout/ThemeInitScript";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BootLoader } from "@/components/layout/BootLoader";
import { AnimatedBackground } from "@/components/animations/AnimatedBackground";
import { ThemeAwareParticles } from "@/components/animations/ThemeAwareParticles";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { ScrollTriggerRefresh } from "@/components/animations/ScrollTriggerRefresh";
import { ScrollChoreography } from "@/components/animations/ScrollChoreography";
import { SurfaceSpotlight } from "@/components/animations/SurfaceSpotlight";
import { HashScroll } from "@/components/common/HashScroll";
import { NavigationProgress } from "@/components/common/NavigationProgress";
import { cn } from "@/lib/utils";

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
    icons: {
      icon: "/logo/AIC_logo_notext.svg",
    },
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
  const brand = (await getTranslations({ locale, namespace: "Meta" }))("title");
  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(iranYekan.variable, dir === "rtl" ? "font-fa" : "font-en")}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <BootLoader brand={brand} />
        </NextIntlClientProvider>
        <ThemeProvider>
          <AnimatedBackground />

          <div className="pointer-events-none fixed inset-0 -z-10">
            <ThemeAwareParticles
              particleSpread={3.6}
              depth={9}
              speed={0.12}
              particleBaseSize={130}
              sizeRandomness={1.5}
              opacity={0.85}
              moveParticlesOnHover={false}
              alphaParticles
              disableRotation
              pixelRatio={1}
            />
          </div>

          <ScrollProgress />
          <SurfaceSpotlight />

          <NextIntlClientProvider messages={messages}>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <ScrollTriggerRefresh />
            <HashScroll />
            <ScrollChoreography />
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
