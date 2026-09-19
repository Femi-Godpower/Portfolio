import type { CmsRoute } from "@ominity/next/cms";
import { buildCmsSitemap } from "@ominity/next/next";

import { getStarterOminityConfig } from "@/lib/ominity/env";
import { getChannelAwareCmsRouting, getCmsRoutes } from "@/lib/ominity/site";

// Built per request: prerendered, the GitHub build's CMS lookup came back empty
// and the sitemap was cached with zero URLs.
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(value: Date | string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// The routes API answers in one language per request (the Accept-Language) and
// its routes carry no locale, so a single call only yields the default language.
// Fetch each channel locale separately and tag the routes with it: that gives one
// entry per page per language, with hreflang alternates between them.
async function getRoutesForAllLocales(
  locales: ReadonlyArray<{ readonly code: string; readonly language: string }>,
): Promise<CmsRoute[]> {
  const perLocale = await Promise.all(
    locales.map(async (locale) => {
      const routes = await getCmsRoutes({ locale: locale.code });
      return routes.map((route) => ({
        ...route,
        id: `${route.id}:${locale.language}`,
        locale: locale.language,
        translations: {},
      }));
    }),
  );

  return perLocale.flat();
}

export async function GET(): Promise<Response> {
  const config = getStarterOminityConfig();
  const routing = await getChannelAwareCmsRouting();
  const routes = await getRoutesForAllLocales(routing.locales);

  const entries = buildCmsSitemap({
    routes,
    routing,
    baseUrl: config.siteUrl,
    includeAlternates: true,
  });

  const urls = entries.map((entry) => {
    const lines = [`<url>`, `<loc>${escapeXml(entry.url)}</loc>`];

    const lastModified = toIsoDate(entry.lastModified);
    if (lastModified) {
      lines.push(`<lastmod>${lastModified}</lastmod>`);
    }

    for (const [hreflang, href] of Object.entries(entry.alternates?.languages ?? {})) {
      lines.push(
        `<xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`,
      );
    }

    lines.push(`</url>`);
    return lines.join("\n");
  });

  // The stylesheet only affects browsers; crawlers read the XML as-is.
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...urls,
    `</urlset>`,
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
