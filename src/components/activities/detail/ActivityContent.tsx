import { MarkdownContent } from "@/components/common/MarkdownContent";

interface ActivityContentProps {
  content: string;
}

export function ActivityContent({ content }: ActivityContentProps) {
  return <MarkdownContent content={content} />;
}
