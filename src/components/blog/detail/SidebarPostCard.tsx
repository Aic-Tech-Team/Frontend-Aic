import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SidebarPost } from "@/types/blog";

interface SidebarPostCardProps {
  post: SidebarPost;
  showDivider?: boolean;
}

export function SidebarPostCard({ post, showDivider }: SidebarPostCardProps) {
  return (
    <div className="w-full">
      <Link
        href={`/blog/${post.id}`}
        className="group flex items-start gap-3"
        dir="rtl"
      >
        <span className="relative h-[68px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="76px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </span>

        <span className="min-w-0 flex-1 text-right">
          <span className="block text-[13px] font-semibold leading-[1.9] text-card-foreground transition-colors line-clamp-2 group-hover:text-primary-300">
            {post.title}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-normal text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />
              {post.date}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.8} />
              {post.readTime}
            </span>
          </span>
          <span className="mt-0.5 block text-[11.5px] font-normal text-muted-foreground">
            {post.source}
          </span>
        </span>
      </Link>
      {showDivider ? (
        <div className="my-4 border-t border-border/60" aria-hidden />
      ) : null}
    </div>
  );
}
