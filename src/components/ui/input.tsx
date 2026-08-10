import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;


/**
 * Safe-by-default text input:
 * - hard length cap (maxLength) unless the caller overrides it
 * - autoComplete/autoCorrect/spellCheck/autoCapitalize off by default,
 *   since this is used for search/filter fields, not personal data entry
 * - 1Password/LastPass-style browser extensions ignored via data-1p-ignore /
 *   data-lpignore so they don't inject their own UI into a search box
 * Callers can still override any of these via props.
 */


const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      maxLength = 200,
      autoComplete = "off",
      autoCorrect = "off",
      autoCapitalize = "off",
      spellCheck = false,
      ...props
    },
    ref
  ) => {
    return (
      <input
        type={type}
        ref={ref}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        spellCheck={spellCheck}
        data-1p-ignore
        data-lpignore="true"
        className={cn(
          "flex h-11 w-full rounded-xl border border-border/70 bg-transparent px-4 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
