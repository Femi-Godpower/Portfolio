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

/** Static heading text; *asterisks* mark the crimson accent, as in RevealText. */
export function AccentText({ text }: { text: string }) {
  return text.split(/\*([^*]+)\*/).map((part, index) =>
    index % 2 === 1 ? <em key={index} className="italic text-spark-crimson">{part}</em> : part,
  );
}

export { LogisticsButton } from "@/components/ui/logistics-button";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs uppercase tracking-[0.25em] text-spark-slate", className)}>{children}</p>
  );
}

/** Sections the nav and footer link to on the logistics page, in page order. */
export const LOGISTICS_SECTIONS = ["studies", "about", "searching", "contact"] as const;
