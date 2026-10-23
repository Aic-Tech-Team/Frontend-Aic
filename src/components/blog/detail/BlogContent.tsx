import { MarkdownContent } from "@/components/common/MarkdownContent";

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  return <MarkdownContent content={content} />;
}
