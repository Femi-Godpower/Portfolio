import type { CmsRendererOptions } from "@ominity/next/cms/rendering";
import { createCmsRegistry, defineCmsComponent } from "@ominity/next/cms/rendering";

import { ApproachBlock } from "@/components/cms/approach-block";
import { ButtonLinkBlock } from "@/components/cms/button-link-block";
import { CaseRevealBlock } from "@/components/cms/case-reveal-block";
import { FormBlock } from "@/components/cms/form-block";
import { HeroBlock } from "@/components/cms/hero-block";
import { PortfolioHeroBlock } from "@/components/cms/portfolio-hero-block";
import { RichTextBlock } from "@/components/cms/rich-text-block";
import { SiteFooterBlock } from "@/components/cms/site-footer-block";
import { SliderBlock } from "@/components/cms/slider-block";
import { TextBlock } from "@/components/cms/text-block";
import { TwoColumnSection } from "@/components/cms/two-column-section";

import { getStarterOminityConfig } from "./env";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

const config = getStarterOminityConfig();

export const cmsRegistry = createCmsRegistry<StarterRenderContext>([
  defineCmsComponent("hero", HeroBlock),
  defineCmsComponent("button_link", ButtonLinkBlock),
  defineCmsComponent("rich_text", RichTextBlock),
  defineCmsComponent("text-block", TextBlock),
  defineCmsComponent("slider", SliderBlock),
  defineCmsComponent("form_block", FormBlock),
  defineCmsComponent("2-column-section", TwoColumnSection),
  // Portfolio blocks — keys match the Ominity blueprint slugs.
  defineCmsComponent("portfolio-hero", PortfolioHeroBlock),
  defineCmsComponent("case-reveal", CaseRevealBlock),
  defineCmsComponent("approach", ApproachBlock),
  defineCmsComponent("site-footer", SiteFooterBlock),
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
