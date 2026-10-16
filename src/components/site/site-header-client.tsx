"use client";

import type { CmsLocale, CmsLocaleSegmentStrategy, CmsRoutingConfig } from "@ominity/next/cms";
import {
  createRoutingConfig,
  localePrefixSegments,
  matchLocaleFromSegments,
  normalizeLocaleCode,
  parseLocaleCode,
} from "@ominity/next/cms";
import { Briefcase, Compass, House, UserRound } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { CircleMenu, type CircleMenuItem } from "@/components/ui/circle-menu";
import { resolveUiDictionary } from "@/lib/i18n/ui-dictionary";
import { useSectionLink } from "@/lib/use-section-link";

interface LanguageOption {
  readonly language: string;
  readonly label: string;
}

interface SiteHeaderClientProps {
  readonly defaultLocale: string;
  readonly locales: ReadonlyArray<CmsLocale>;
  readonly localeSegmentStrategy: CmsLocaleSegmentStrategy;
  readonly trailingSlash: boolean;
  readonly basePath: string;
}

function normalizePath(path: string): string {
  if (path.length === 0) {
    return "/";
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  if (withLeadingSlash === "/") {
    return "/";
  }

  return withLeadingSlash.replace(/\/+$/, "");
}

function splitPath(path: string): ReadonlyArray<string> {
  return normalizePath(path).split("/").filter((segment) => segment.length > 0);
}

function joinPath(segments: ReadonlyArray<string>): string {
  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

function removeBasePath(path: string, basePath: string): string {
  if (basePath.length === 0 || basePath === "/") {
    return normalizePath(path);
  }

  const normalizedPath = normalizePath(path);
  const normalizedBasePath = normalizePath(basePath);

  if (normalizedPath === normalizedBasePath) {
    return "/";
  }

  if (normalizedPath.startsWith(`${normalizedBasePath}/`)) {
    return normalizePath(normalizedPath.slice(normalizedBasePath.length));
  }

  return normalizedPath;
}

function localizeRelativePath(path: string, locale: string, routing: CmsRoutingConfig): string {
  const routeSegments = splitPath(path);
  const prefixSegments = localePrefixSegments(locale, routing);
  const localizedPath = joinPath([...prefixSegments, ...routeSegments]);

  const withBasePath = routing.basePath.length > 0
    ? normalizePath(`${routing.basePath}${localizedPath === "/" ? "" : localizedPath}`)
    : localizedPath;

  if (routing.trailingSlash && withBasePath !== "/") {
    return `${withBasePath}/`;
  }

  return withBasePath;
}

function localeLabel(locale: CmsLocale): string {
  if (typeof locale.label === "string" && locale.label.length > 0) {
    return locale.label;
  }

  return parseLocaleCode(normalizeLocaleCode(locale.code)).language.toUpperCase();
}

function buildLanguageOptions(locales: ReadonlyArray<CmsLocale>): ReadonlyArray<LanguageOption> {
  const unique = new Map<string, LanguageOption>();
  for (const locale of locales) {
    const parsed = parseLocaleCode(normalizeLocaleCode(locale.code));
    if (parsed.language.length === 0 || unique.has(parsed.language)) {
      continue;
    }

    unique.set(parsed.language, { language: parsed.language, label: localeLabel(locale) });
  }

  return Array.from(unique.values());
}

/** The channel's default locale for a language, else its first locale, else the fallback. */
function resolveLocaleForLanguage(
  locales: ReadonlyArray<CmsLocale>,
  language: string,
  fallbackLocale: string,
): string {
  const normalizedLanguage = language.trim().toLowerCase();
  const matches = locales.filter(
    (locale) => parseLocaleCode(normalizeLocaleCode(locale.code)).language === normalizedLanguage,
  );
  const match = matches.find((locale) => locale.default === true) ?? matches[0];

  return normalizeLocaleCode(match ? match.code : fallbackLocale);
}

function resolvePathContext(pathname: string, routing: CmsRoutingConfig): {
  readonly locale: string;
  readonly suffixSegments: ReadonlyArray<string>;
} {
  const segments = splitPath(removeBasePath(pathname, routing.basePath));
  const matched = matchLocaleFromSegments(segments, routing);
  const consumedSegments = routing.localeSegmentStrategy === "none"
    ? 0
    : matched?.consumedSegments ?? 0;

  return {
    locale: normalizeLocaleCode(matched ? matched.locale : routing.defaultLocale),
    suffixSegments: segments.slice(consumedSegments),
  };
}

function withQuery(path: string, query: string): string {
  return query.length > 0 ? `${path}?${query}` : path;
}

export function SiteHeaderClient(props: SiteHeaderClientProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const routing = useMemo(() => createRoutingConfig({
    defaultLocale: props.defaultLocale,
    locales: props.locales,
    localeSegmentStrategy: props.localeSegmentStrategy,
    trailingSlash: props.trailingSlash,
    basePath: props.basePath,
  }), [
    props.basePath,
    props.defaultLocale,
    props.localeSegmentStrategy,
    props.locales,
    props.trailingSlash,
  ]);

  const pathContext = useMemo(() => resolvePathContext(pathname, routing), [pathname, routing]);
  const currentLocale = pathContext.locale;
  const currentLanguage = parseLocaleCode(currentLocale).language;

  const languageOptions = useMemo(() => buildLanguageOptions(props.locales), [props.locales]);
  const activeLanguage = languageOptions.some((entry) => entry.language === currentLanguage)
    ? currentLanguage
    : languageOptions[0]?.language ?? currentLanguage;

  const dictionary = useMemo(() => resolveUiDictionary(currentLocale), [currentLocale]);
  const showLanguages = props.localeSegmentStrategy !== "none" && languageOptions.length > 1;

  // The server reads this cookie to pick the SDK language.
  useEffect(() => {
    document.cookie = `ominity_locale=${encodeURIComponent(currentLocale)}; path=/; max-age=31536000; samesite=lax`;
  }, [currentLocale]);

  const homePath = localizeRelativePath("/", currentLocale, routing);
  // Section links keep the clean home URL; the scroll happens in JS, also when
  // the visitor is on another page (cookie policy, terms…).
  const followSectionLink = useSectionLink(homePath);

  const onLanguageChange = (nextLanguage: string) => {
    const nextLocale = resolveLocaleForLanguage(props.locales, nextLanguage, currentLocale);
    const nextPath = localizeRelativePath(joinPath(pathContext.suffixSegments), nextLocale, routing);
    const currentQuery = window.location.search.replace(/^\?/, "");

    document.cookie = `ominity_locale=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000; samesite=lax`;
    router.push(withQuery(nextPath, currentQuery) as Route);
  };

  // Languages first (English, then Dutch; the current one is hidden), then the
  // portfolio sections in page order, fanned out top-left to bottom-right.
  const LANGUAGE_ORDER = ["en", "nl"];
  const languageRank = (language: string) => {
    const rank = LANGUAGE_ORDER.indexOf(language);
    return rank === -1 ? LANGUAGE_ORDER.length : rank;
  };
  const menuItems: CircleMenuItem[] = [
    ...(showLanguages
      ? languageOptions
        .filter((entry) => entry.language !== activeLanguage)
        .sort((left, right) => languageRank(left.language) - languageRank(right.language))
        .map((entry) => ({
          id: `language-${entry.language}`,
          label: entry.label,
          icon: <span className="text-xs font-semibold">{entry.language.toUpperCase()}</span>,
          value: entry.language,
        }))
      : []),
    { id: "home", label: dictionary.nav.home, icon: <House size={16} />, href: homePath, section: "top" },
    { id: "cases", label: dictionary.nav.cases, icon: <Briefcase size={16} />, href: homePath, section: "works" },
    { id: "approach", label: dictionary.nav.approach, icon: <Compass size={16} />, href: homePath, section: "approach" },
    { id: "about", label: dictionary.nav.about, icon: <UserRound size={16} />, href: homePath, section: "about" },
  ];

  return (
    // Sticks to the top of the screen; no bar, just the name and the menu button.
    // Side padding matches the first project card (5vw desktop, 7vw stacked).
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex h-20 items-center justify-between gap-3 px-[7vw] min-[1026px]:px-[5vw]">
        <Link
          href={homePath as Route}
          className="pointer-events-auto text-sm font-semibold uppercase tracking-[0.3em] text-white/80 hover:text-white"
        >
          {dictionary.brandName}
        </Link>

        <nav className="pointer-events-auto flex items-center gap-2">
          <CircleMenu
            items={menuItems}
            openLabel={dictionary.nav.menu}
            closeLabel={dictionary.nav.close}
            onSelectItem={(item, event) => {
              if (item.value && item.value !== activeLanguage) onLanguageChange(item.value);
              if (item.section && followSectionLink(`#${item.section}`)) event?.preventDefault();
            }}
          />
        </nav>
      </div>
    </header>
  );
}
