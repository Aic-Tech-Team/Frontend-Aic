import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { ComponentProps } from "react";

// Base classes extracted from buttonVariants so the SSR anchor components
// below can be used in server components without calling buttonVariants().
const BTN_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
const BTN_GHOST = "hover:bg-primary/10";
const BTN_DEFAULT =
  "bg-primary text-primary-foreground hover:bg-primary-600 active:bg-primary-700";
const BTN_ICON = "h-10 w-10";

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
      className={cn(
        BTN_BASE,
        isActive ? BTN_DEFAULT : BTN_GHOST,
        BTN_ICON,
        "h-9 w-9 text-sm",
        isActive && "shadow-glow",
        className,
      )}
      {...props}
    />
  );
}

type PaginationNavPreviousProps = ComponentProps<"a"> & { label?: string };

function PaginationNavPrevious({ className, label, ...props }: PaginationNavPreviousProps) {
  return (
    <a
      aria-label={label ?? "Go to previous page"}
      className={cn(
        BTN_BASE,
        BTN_GHOST,
        BTN_ICON,
        "h-9 w-9 gap-1 px-0 text-sm",
        className,
      )}
      {...props}
    >
      <ChevronRight className="h-4 w-4 ltr:rotate-180" />
    </a>
  );
}

type PaginationNavNextProps = ComponentProps<"a"> & { label?: string };

function PaginationNavNext({ className, label, ...props }: PaginationNavNextProps) {
  return (
    <a
      aria-label={label ?? "Go to next page"}
      className={cn(
        BTN_BASE,
        BTN_GHOST,
        BTN_ICON,
        "h-9 w-9 gap-1 px-0 text-sm",
        className,
      )}
      {...props}
    >
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
        "flex h-9 w-9 items-center justify-center text-muted-foreground",
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
