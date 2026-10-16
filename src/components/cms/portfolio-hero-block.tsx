import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import PathDrawingPortfolioHero from "@/components/ui/path-drawing-portfolio-hero";

import { asHexColor, asString } from "./helpers";

export function PortfolioHeroBlock({
  component,
}: CmsComponentRenderProps<StarterRenderContext>) {
  const name = asString(component.fields.name).trim();
  if (!name) {
    return null;
  }

  return (
    <div id="top" className="w-full">
      <PathDrawingPortfolioHero
        className="w-full"
        brand={name}
        greeting={asString(component.fields.greeting)}
        eyebrow={asString(component.fields.eyebrow)}
        tagline={asString(component.fields.tagline)}
        scrollLabel={asString(component.fields.scroll_label)}
        // Matches the default "anchor" of the case-reveal block.
        scrollHref="#works"
        fromColor={asHexColor(component.fields.color_from, "#f093fb")}
        toColor={asHexColor(component.fields.color_to, "#f5576c")}
      />
    </div>
  );
}
