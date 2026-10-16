import type { CmsRoutingConfig } from "@ominity/next/cms";
import { localePrefixSegments } from "@ominity/next/cms";

import { asRecordArray, asString } from "@/components/cms/helpers";
import PortfolioFooter, {
  type FooterLinkColumn,
  type PortfolioFooterData,
  type SocialPlatform,
} from "@/components/ui/portfolio-footer";
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

  return {
    bigText: asString(fields.big_text).trim() || "FEMI",
    columns,
    contactTitle: asString(fields.contact_title),
    email: asString(fields.email).trim(),
    phone: asString(fields.phone).trim(),
    location: asString(fields.location).trim(),
    // "Show on site" off hides an entry; entries saved before the switch existed stay visible.
    socials: asRecordArray(fields.socials)
      .filter((entry) => entry.visible !== false && entry.visible !== "false" && entry.visible !== 0)
      .map((entry) => ({ platform: asPlatform(entry.platform), href: asString(entry.url).trim() }))
      .filter((social) => social.href.length > 0),
    copyright: asString(fields.copyright).trim(),
    legalTitle: asString(fields.legal_title).trim(),
    homePath: homePathFor(locale, routing),
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
export async function SiteFooter({ locale }: { readonly locale: string }) {
  const [routing, fields] = await Promise.all([
    getChannelAwareCmsRouting(),
    getSiteFooterFields(locale),
  ]);

  if (!fields) {
    return null;
  }

  return <PortfolioFooter data={toFooterData(fields, locale, routing)} />;
}
