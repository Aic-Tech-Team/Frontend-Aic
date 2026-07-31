import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AboutPage");
  const focusAreas = t.raw("focusAreas") as string[];

  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-6 py-16">
      <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        {t("description")}
      </p>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>{t("archTitle")}</CardTitle>
          <CardDescription>{t("archDesc")}</CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">{t("techTitle")}</h2>
        <div className="flex flex-wrap gap-3">
          {focusAreas.map((area) => (
            <span
              key={area}
              className="rounded-full border border-border bg-primary-50 px-4 py-2 text-sm text-primary-700"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      <Button asChild variant="outline" className="mt-10">
        <Link href="/">
          {t("backToHome")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </Button>
    </div>
  );
}
