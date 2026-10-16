import type { CmsRendererOptions } from "@ominity/next/cms/rendering";
import { createCmsRegistry, defineCmsComponent } from "@ominity/next/cms/rendering";

import { AboutBlock } from "@/components/cms/about-block";
import { ApproachBlock } from "@/components/cms/approach-block";
import { CaseRevealBlock } from "@/components/cms/case-reveal-block";
import { ContactBlock } from "@/components/cms/contact-block";
import { CookieDeclarationBlock } from "@/components/cms/cookie-declaration-block";
import { FormBlock } from "@/components/cms/form-block";
import { LegalDocumentBlock } from "@/components/cms/legal-document-block";
import { LogisticsCtaBlock } from "@/components/cms/logistics-cta-block";
import { LogisticsFeaturesBlock } from "@/components/cms/logistics-features-block";
import { LogisticsHeroBlock } from "@/components/cms/logistics-hero-block";
import { LogisticsStatementBlock } from "@/components/cms/logistics-statement-block";
import { LogisticsTimelineBlock } from "@/components/cms/logistics-timeline-block";
import { PortfolioHeroBlock } from "@/components/cms/portfolio-hero-block";
import { TableBlock } from "@/components/cms/table-block";

import { getStarterOminityConfig } from "./env";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

const config = getStarterOminityConfig();

export const cmsRegistry = createCmsRegistry<StarterRenderContext>([
  // Keys match the Ominity blueprint slugs.
  defineCmsComponent("portfolio-hero", PortfolioHeroBlock),
  defineCmsComponent("case-reveal", CaseRevealBlock),
  defineCmsComponent("approach", ApproachBlock),
  defineCmsComponent("about-me", AboutBlock),
  defineCmsComponent("contact", ContactBlock),
  // No "site-footer": the footer is site-wide now and comes from the
  // Site Footer content type, rendered once in app/layout.tsx.
  defineCmsComponent("legal-document", LegalDocumentBlock),
  defineCmsComponent("cookie-declaration", CookieDeclarationBlock),
  defineCmsComponent("table", TableBlock),
  // Logistics page.
  defineCmsComponent("logistics-hero", LogisticsHeroBlock),
  defineCmsComponent("logistics-features", LogisticsFeaturesBlock),
  defineCmsComponent("logistics-statement", LogisticsStatementBlock),
  defineCmsComponent("logistics-cta", LogisticsCtaBlock),
  defineCmsComponent("logistics-timeline", LogisticsTimelineBlock),
  // Contact form (starter block, kept for a future contact form).
  defineCmsComponent("form_block", FormBlock),
]);

export const cmsRendererOptions: CmsRendererOptions<StarterRenderContext> = {
  missingComponent: config.strictMissingComponents
    ? "throw"
    : (component) => (
      <div className="rounded-md border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Unknown CMS block key: <strong>{component.key}</strong>
      </div>
    ),
  unsupportedValue: "ignore",
};
