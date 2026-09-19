import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import PortfolioFooter, {
  type FooterLinkColumn,
  type PortfolioFooterData,
  type SocialPlatform,
} from "@/components/ui/portfolio-footer";

import { localePrefixSegments } from "@ominity/next/cms";

import { getChannelAwareCmsRouting } from "@/lib/ominity/site";

import { asRecordArray, asString } from "./helpers";

const PLATFORMS: ReadonlyArray<SocialPlatform> = ["linkedin", "instagram", "x", "facebook", "ominity", "website"];

/** "/en", "/be/nl" or "/" — the home page for this locale. */
function homePathFor(locale: string, routing: { basePath: string; trailingSlash: boolean }, prefix: ReadonlyArray<string>): string {
  const segments = [...(routing.basePath.replace(/^\/|\/$/g, "").split("/").filter(Boolean)), ...prefix];
  const path = segments.length > 0 ? `/${segments.join("/")}` : "/";
  return routing.trailingSlash && path !== "/" ? `${path}/` : path;
}

const asPlatform = (value: unknown): SocialPlatform =>
  PLATFORMS.find((platform) => platform === asString(value)) ?? "website";

export async function SiteFooterBlock({
  component,
  context,
}: CmsComponentRenderProps<StarterRenderContext>) {
  const routing = await getChannelAwareCmsRouting();
  // Links with the same column title become one column, in CMS order.
  const columns: FooterLinkColumn[] = [];
  for (const entry of asRecordArray(component.fields.links)) {
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

  const data: PortfolioFooterData = {
    bigText: asString(component.fields.big_text).trim() || "FEMI",
    columns,
    contactTitle: asString(component.fields.contact_title),
    email: asString(component.fields.email).trim(),
    phone: asString(component.fields.phone).trim(),
    location: asString(component.fields.location).trim(),
    // "Show on site" off hides an entry; entries saved before the switch existed stay visible.
    socials: asRecordArray(component.fields.socials)
      .filter((entry) => entry.visible !== false && entry.visible !== "false" && entry.visible !== 0)
      .map((entry) => ({ platform: asPlatform(entry.platform), href: asString(entry.url).trim() }))
      .filter((social) => social.href.length > 0),
    copyright: asString(component.fields.copyright).trim(),
    legalTitle: asString(component.fields.legal_title).trim(),
    homePath: homePathFor(context.locale, routing, localePrefixSegments(context.locale, routing)),
    legalLinks: asRecordArray(component.fields.legal_links)
      .map((entry) => ({ label: asString(entry.label).trim(), href: asString(entry.url).trim() }))
      .filter((link) => link.label.length > 0 && link.href.length > 0),
  };

  return <PortfolioFooter data={data} />;
}
