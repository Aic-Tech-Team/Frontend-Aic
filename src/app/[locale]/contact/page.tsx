import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CONTACT_TOPICS, type ContactTopic } from "@/components/contact/intents";
import { param, type SearchParams } from "@/lib/search-params";
import { ContactStudio } from "@/components/contact/ContactStudio";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  return { title: t("title"), description: t("lede") };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const topic = param(await searchParams, "topic");
  const initialIndex = topic in CONTACT_TOPICS ? CONTACT_TOPICS[topic as ContactTopic] : 0;

  return <ContactStudio initialIndex={initialIndex} />;
}
