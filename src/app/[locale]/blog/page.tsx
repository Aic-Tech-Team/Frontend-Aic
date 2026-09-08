import { getTranslations, setRequestLocale } from "next-intl/server";
import { Newspaper } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { getSampleBlogPosts } from "@/types/BlogSamplePost";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("BlogPage");

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          icon={Newspaper}
          title={t("title")}
          description={t("description")}
          align="center"
        />
        <BlogExplorer posts={getSampleBlogPosts(locale)} />
      </div>
    </div>
  );
}
