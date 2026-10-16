import type { ReactNode } from "react";

import { inter, plexSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Root class of every logistics-* block: Inter body text, no background of its own
 * (the page background runs through all blocks). theme-logistics turns the whole
 * page light, header and footer included (globals.css).
 */
export const logisticsSection = cn(inter.className, "theme-logistics relative w-full overflow-hidden text-spark-asphalt");

/** Heading face: IBM Plex Sans Bold. */
export const logisticsHeading = cn(plexSans.className, "font-bold tracking-tight text-spark-indigo");

/**
 * Words wrapped in *asterisks* in a CMS heading become the italic crimson accent,
 * so editors pick the accent word themselves: "I want *discover* it all".
 */
export function AccentText({ text }: { text: string }) {
  return text.split(/\*([^*]+)\*/).map((part, index) =>
    index % 2 === 1 ? (
      <em key={index} className="italic text-spark-crimson">
        {part}
      </em>
    ) : (
      part
    ),
  );
}

export function LogisticsButton({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spark-crimson",
        variant === "primary"
          ? "bg-spark-indigo text-white hover:bg-spark-crimson"
          : "border border-spark-indigo/25 text-spark-indigo hover:border-spark-crimson hover:text-spark-crimson",
      )}
    >
      {children}
    </a>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs uppercase tracking-[0.25em] text-spark-slate", className)}>{children}</p>
  );
}
