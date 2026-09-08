import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { BlogDetailLabels, SidebarPost } from "@/types/blog";
import { SidebarPostCard } from "./SidebarPostCard";

interface SidebarCardShellProps {
  title: string;
  linkLabel: string;
  children: React.ReactNode;
}

function SidebarCardShell({
  title,
  linkLabel,
  children,
}: SidebarCardShellProps) {
  return (
    <section dir="rtl" className="surface w-full rounded-[18px] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-card-foreground">{title}</h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-primary-300"
        >
          {linkLabel}
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
      {children}
    </section>
  );
}

export function LatestPosts({
  posts,
  labels,
}: {
  posts: SidebarPost[];
  labels: BlogDetailLabels;
}) {
  return (
    <SidebarCardShell
      title={labels.latestPostsTitle}
      linkLabel={labels.viewAll}
    >
      <div className="flex flex-col">
        {posts.map((post, index) => (
          <SidebarPostCard
            key={post.id}
            post={post}
            showDivider={index < posts.length - 1}
          />
        ))}
      </div>
    </SidebarCardShell>
  );
}
