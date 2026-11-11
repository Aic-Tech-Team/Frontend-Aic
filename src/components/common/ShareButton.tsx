"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

/**
 * Shares the page: the system share sheet where there is one, otherwise the address goes to the
 * clipboard and the label says so for two seconds.
 */
export function ShareButton({
  title,
  label,
  copiedLabel,
  className,
}: {
  title: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // the share sheet was dismissed: nothing to do
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "h-11 w-full gap-2 rounded-full border-border/60 bg-background/30",
        className,
      )}
    >
      {copied ? (
        <Check className="size-4 text-emerald-300" />
      ) : (
        <Share2 className="size-4" />
      )}
      {copied ? copiedLabel : label}
    </button>
  );
}
