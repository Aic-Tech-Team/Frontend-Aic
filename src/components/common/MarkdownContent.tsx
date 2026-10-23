import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
}

/**
 * Renders backend-provided markdown. Raw HTML in the source is NOT rendered
 * (react-markdown escapes it), so no sanitizer is needed. Links are limited
 * to safe protocols by react-markdown's default urlTransform.
 */
export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div
      dir="rtl"
      className="prose prose-neutral dark:prose-invert w-full max-w-none text-right text-[15px] leading-[2.1] sm:text-[15.5px]
        prose-p:my-5 prose-p:text-card-foreground/90
        prose-headings:font-extrabold prose-headings:text-foreground prose-headings:leading-snug
        prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-2xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:text-xl
        prose-strong:font-bold prose-strong:text-foreground
        prose-a:text-primary-300 prose-a:no-underline hover:prose-a:underline
        prose-ul:my-5 prose-ol:my-5 prose-li:my-1.5 prose-li:text-card-foreground/90
        prose-blockquote:border-s-4 prose-blockquote:border-e-0 prose-blockquote:border-primary/60 prose-blockquote:ps-4 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-card-foreground/80
        prose-hr:my-8 prose-hr:border-border
        prose-img:rounded-xl
        prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
        prose-pre:dir-ltr prose-pre:text-left prose-pre:rounded-xl prose-pre:bg-muted prose-pre:text-foreground
        prose-th:text-start prose-td:text-start"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = /^https?:\/\//i.test(href ?? "");
            return (
              <a
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer nofollow" }
                  : {})}
              >
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
