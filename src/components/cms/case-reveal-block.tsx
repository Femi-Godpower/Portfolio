import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import HorizontalFeatureReveal, { type CaseRevealItem } from "@/components/ui/horizontal-feature-reveal";
import { resolveUiDictionary } from "@/lib/i18n/ui-dictionary";

import { asImageUrl, asRecordArray, asString } from "./helpers";

export function CaseRevealBlock({
  component,
  context,
}: CmsComponentRenderProps<StarterRenderContext>) {
  const cases: CaseRevealItem[] = asRecordArray(component.fields.cases)
    .map((entry) => ({
      title: asString(entry.title).trim(),
      image: asImageUrl(entry.image),
      imageAlt: asString(entry.image_alt),
      client: asString(entry.client),
      problem: asString(entry.problem),
      outcome: asString(entry.outcome),
    }))
    .filter((entry) => entry.title.length > 0);

  if (cases.length === 0) {
    return null;
  }

  const dictionary = resolveUiDictionary(context.locale);
  const anchor = asString(component.fields.anchor, "works").replace(/^#/, "") || "works";

  return (
    <HorizontalFeatureReveal
      id={anchor}
      cases={cases}
      labels={dictionary.portfolio.cases}
      imageParallaxRange={30}
      cardGap={15}
    />
  );
}
