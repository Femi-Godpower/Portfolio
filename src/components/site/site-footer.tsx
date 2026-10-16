import type { CmsRoutingConfig } from "@ominity/next/cms";
import { localePrefixSegments, normalizeLocaleCode, parseLocaleCode } from "@ominity/next/cms";

import { asRecordArray, asString } from "@/components/cms/helpers";
import PortfolioFooter, {
  type FooterLinkColumn,
  type PortfolioFooterData,
  type SocialPlatform,
} from "@/components/ui/portfolio-footer";
import { LOGISTICS_SECTIONS } from "@/components/ui/logistics";
import { resolveUiDictionary } from "@/lib/i18n/ui-dictionary";
import { getLogisticsHomePaths } from "@/lib/ominity/logistics-home";
import { getChannelAwareCmsRouting } from "@/lib/ominity/site";
import { getSiteFooterFields, type SiteFooterFields } from "@/lib/ominity/site-footer";

const PLATFORMS: ReadonlyArray<SocialPlatform> = ["linkedin", "instagram", "x", "facebook", "ominity", "website"];

const asPlatform = (value: unknown): SocialPlatform =>
  PLATFORMS.find((platform) => platform === asString(value)) ?? "website";

/** "/en", "/be/nl" or "/" — the home page for this locale. */
function homePathFor(locale: string, routing: CmsRoutingConfig): string {
  const prefix = localePrefixSegments(locale, routing);
  const segments = [...routing.basePath.replace(/^\/|\/$/g, "").split("/").filter(Boolean), ...prefix];
  const path = segments.length > 0 ? `/${segments.join("/")}` : "/";
  return routing.trailingSlash && path !== "/" ? `${path}/` : path;
}

function toFooterData(
  fields: SiteFooterFields,
  locale: string,
  routing: CmsRoutingConfig,
  sectionPagePath?: string,
): PortfolioFooterData {
  // Links with the same column title become one column, in CMS order.
  const columns: FooterLinkColumn[] = [];
  for (const entry of asRecordArray(fields.links)) {
    const title = asString(entry.column).trim();
    const label = asString(entry.label).trim();
    if (!title || !label) continue;

    let column = columns.find((existing) => existing.title === title);
    if (!column) {
      column = { title, links: [] };
      columns.push(column);
    }
    column.links.push({ label, href: asString(entry.url, "#").trim() || "#" });
  }

  // On a page with its own sections (logistics), the column of #section links
  // points at that page's sections instead of the home page's.
  if (sectionPagePath) {
    const labels = resolveUiDictionary(locale).nav.logistics;
    const sectionColumn = columns.find((column) => column.links.some((link) => link.href.startsWith("#")));
    if (sectionColumn) {
      sectionColumn.links = LOGISTICS_SECTIONS.map((id) => ({ label: labels[id], href: `#${id}` }));
    }
  }

  return {
    bigText: asString(fields.big_text).trim() || "FEMI",
    columns,
    contactTitle: asString(fields.contact_title),
    // sectionPagePath is only set on the logistics pages, which have their own address.
    email: (sectionPagePath && asString(fields.logistics_email).trim()) || asString(fields.email).trim(),
    phone: asString(fields.phone).trim(),
    location: asString(fields.location).trim(),
    // "Show on site" off hides an entry; entries saved before the switch existed stay visible.
    socials: asRecordArray(fields.socials)
      .filter((entry) => entry.visible !== false && entry.visible !== "false" && entry.visible !== 0)
      .map((entry) => ({ platform: asPlatform(entry.platform), href: asString(entry.url).trim() }))
      .filter((social) => social.href.length > 0),
    copyright: asString(fields.copyright).trim(),
    legalTitle: asString(fields.legal_title).trim(),
    homePath: sectionPagePath ?? homePathFor(locale, routing),
    legalLinks: asRecordArray(fields.legal_links)
      .map((entry) => ({ label: asString(entry.label).trim(), href: asString(entry.url).trim() }))
      .filter((link) => link.label.length > 0 && link.href.length > 0),
  };
}

/**
 * The one footer under every page. Its content is the single entry of the
 * "Site Footer" content type in Ominity — not a block on a page — so there is
 * one place to edit it and no per-page copies to keep in sync.
 */
export async function SiteFooter({
  locale,
  logistics = false,
}: {
  readonly locale: string;
  /** On the logistics side, the section links point at the logistics home instead of the portfolio. */
  readonly logistics?: boolean;
}) {
  const [routing, fields, logisticsHomePaths] = await Promise.all([
    getChannelAwareCmsRouting(),
    getSiteFooterFields(locale),
    getLogisticsHomePaths(),
  ]);
  const logisticsHomePath = logistics
    ? logisticsHomePaths[parseLocaleCode(normalizeLocaleCode(locale)).language]
    : undefined;
  const sectionPagePath = logisticsHomePath
    ? `${homePathFor(locale, routing).replace(/\/+$/, "")}${logisticsHomePath}`
    : undefined;

  if (!fields) {
    return null;
  }

  return <PortfolioFooter data={toFooterData(fields, locale, routing, sectionPagePath)} />;
}
