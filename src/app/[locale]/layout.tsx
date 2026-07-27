import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { ThemeInitializer } from "@/components/theme-initializer";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import Particles from "@/components/Particles";

export const metadata: Metadata = {
  title: "انجمن علمی هوش مصنوعی ",
  description:
    "بستری علمی برای یادگیری، پژوهش و همکاری دانشجویان علاقه‌مند به هوش مصنوعی.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme="navy"
      suppressHydrationWarning
      className={dir === "rtl" ? "font-fa" : "font-en"}
    >
      <body className="min-h-screen antialiased">
        <ThemeInitializer />
        <AnimatedBackground />

        {/* Fixed full-viewport particle background, sits behind all content */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <Particles
            particleColors={["#ffffff"]}
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

        <NextIntlClientProvider messages={messages}>
          <div className="relative z-0 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}