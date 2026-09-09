interface BlogContentProps {
  paragraphs: string[];
}

export function BlogContent({ paragraphs }: BlogContentProps) {
  return (
    <div dir="rtl" className="w-full text-right">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="mb-5 text-[15px] font-normal leading-[2.1] text-card-foreground/90 last:mb-0 sm:text-[15.5px]"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
