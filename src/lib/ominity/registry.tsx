import type { CmsRendererOptions } from "@ominity/next/cms/rendering";
import { createCmsRegistry, defineCmsComponent } from "@ominity/next/cms/rendering";

import { AboutBlock } from "@/components/cms/about-block";
import { ApproachBlock } from "@/components/cms/approach-block";
import { CaseRevealBlock } from "@/components/cms/case-reveal-block";
import { FormBlock } from "@/components/cms/form-block";
import { LegalDocumentBlock } from "@/components/cms/legal-document-block";
import { PortfolioHeroBlock } from "@/components/cms/portfolio-hero-block";
import { SiteFooterBlock } from "@/components/cms/site-footer-block";

import { getStarterOminityConfig } from "./env";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

const config = getStarterOminityConfig();

export const cmsRegistry = createCmsRegistry<StarterRenderContext>([
  // Keys match the Ominity blueprint slugs.
  defineCmsComponent("portfolio-hero", PortfolioHeroBlock),
  defineCmsComponent("case-reveal", CaseRevealBlock),
  defineCmsComponent("approach", ApproachBlock),
  defineCmsComponent("about-me", AboutBlock),
  defineCmsComponent("site-footer", SiteFooterBlock),
  defineCmsComponent("legal-document", LegalDocumentBlock),
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
