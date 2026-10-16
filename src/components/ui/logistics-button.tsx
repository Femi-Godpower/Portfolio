"use client";

import type { MouseEvent, ReactNode } from "react";

import { RadialGlowLink } from "@/components/ui/radial-glow-button";
import { openSectionDialog, scrollToSection, sectionFromHref } from "@/lib/section-navigation";

export function LogisticsButton({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
}) {
  // A #section link scrolls like the nav does; a plain jump lets the footer snap hijack it.
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const section = sectionFromHref(href);
    if (section && (openSectionDialog(section) || scrollToSection(section))) event.preventDefault();
  };

  if (variant === "primary") {
    return (
      <RadialGlowLink href={href} onClick={onClick} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spark-crimson">
        {children}
      </RadialGlowLink>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full border border-spark-indigo/25 px-6 py-3 text-sm text-spark-indigo transition-colors hover:border-spark-crimson hover:text-spark-crimson focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spark-crimson"
    >
      {children}
    </a>
  );
}
