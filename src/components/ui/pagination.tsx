import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import type { ComponentProps } from "react";

// One look for every control: a rounded square with a hairline border; the current page is filled
// with the brand colour and glows; previous / next are the same square, wider, with a word beside
// the arrow from `sm` up. Plain class strings so the anchors work in server components.
const BTN_BASE =
  "inline-flex h-10 min-w-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 text-sm font-bold tabular-nums transition-[color,background-color,border-color,box-shadow,opacity] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring";
const BTN_IDLE =
  "border-border/50 bg-card/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-foreground";
const BTN_ACTIVE =
  "border-primary bg-primary text-primary-foreground shadow-glow";
const BTN_OFF = "pointer-events-none opacity-40";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1.5", className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn(className)} {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<"button">;

function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "ghost",
          size: "icon",
        }),
        "h-9 w-9 text-sm",
        isActive && "shadow-glow",
        className,
      )}
      {...props}
    />
  );
}

/** Anchor-based page link for SSR / URL-driven pagination. */
type PaginationNavLinkProps = {
  isActive?: boolean;
} & ComponentProps<"a">;

function PaginationNavLink({
  className,
  isActive,
  ...props
}: PaginationNavLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(BTN_BASE, isActive ? BTN_ACTIVE : BTN_IDLE, className)}
      {...props}
    />
  );
}

type PaginationNavPreviousProps = ComponentProps<"a"> & { label?: string };

function PaginationNavPrevious({
  className,
  label,
  children,
  ...props
}: PaginationNavPreviousProps) {
  const disabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
  return (
    <a
      aria-label={label ?? "Go to previous page"}
      className={cn(
        BTN_BASE,
        BTN_IDLE,
        "px-3 sm:px-4",
        disabled && BTN_OFF,
        className,
      )}
      {...props}
    >
      <ChevronRight className="h-4 w-4 ltr:rotate-180" />
      <span className="max-sm:hidden">{children}</span>
    </a>
  );
}

type PaginationNavNextProps = ComponentProps<"a"> & { label?: string };

function PaginationNavNext({
  className,
  label,
  children,
  ...props
}: PaginationNavNextProps) {
  const disabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
  return (
    <a
      aria-label={label ?? "Go to next page"}
      className={cn(
        BTN_BASE,
        BTN_IDLE,
        "px-3 sm:px-4",
        disabled && BTN_OFF,
        className,
      )}
      {...props}
    >
      <span className="max-sm:hidden">{children}</span>
      <ChevronLeft className="h-4 w-4 ltr:rotate-180" />
    </a>
  );
}

function PaginationPrevious({
  className,
  label,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  return (
    <PaginationLink
      aria-label={label ?? "Go to previous page"}
      className={cn("w-9 gap-1 px-0", className)}
      {...props}
    >
      <ChevronRight className="h-4 w-4 ltr:rotate-180" />
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  label,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  return (
    <PaginationLink
      aria-label={label ?? "Go to next page"}
      className={cn("w-9 gap-1 px-0", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4 ltr:rotate-180" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-8 items-center justify-center text-muted-foreground",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationNavLink,
  PaginationNavPrevious,
  PaginationNavNext,
};
