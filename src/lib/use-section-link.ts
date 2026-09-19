"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import {
  consumeSection,
  rememberSection,
  scrollToSection,
  scrollToSectionWhenSettled,
  sectionFromHref,
} from "@/lib/section-navigation";

/**
 * Turns a section link into: scroll (already on the home page) or go home and
 * scroll there (any other page). Used by the header menu and the footer, so
 * both behave the same and neither leaves a `#works` in the address bar.
 */
export function useSectionLink(homePath: string) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const isHome = pathname.replace(/\/+$/, "") === homePath.replace(/\/+$/, "");

  // Arriving from another page: finish the scroll the link started. The sections
  // mount and grow as the page hydrates, so try again until it sticks.
  useEffect(() => {
    if (!isHome) return;
    const id = consumeSection();
    if (!id) return;

    return scrollToSectionWhenSettled(id);
  }, [isHome]);

  /** Returns true when it handled the click, so the caller can stop the link. */
  return useCallback((href: string): boolean => {
    const id = sectionFromHref(href);
    if (!id) return false;

    if (isHome && scrollToSection(id)) return true;

    rememberSection(id);
    // scroll: false — Next would otherwise jump back to the top after ours.
    router.push(homePath as Route, { scroll: false });
    return true;
  }, [homePath, isHome, router]);
}
