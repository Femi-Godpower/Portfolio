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

export async function GET(): Promise<Response> {
  const config = getStarterOminityConfig();
  const routes = await getCmsRoutes();
  const routing = await getChannelAwareCmsRouting();

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
