import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import ApproachSection, { type ApproachStep } from "@/components/ui/approach-section";

import { asRecordArray, asString } from "./helpers";

export function ApproachBlock({
  component,
}: CmsComponentRenderProps<StarterRenderContext>) {
  const heading = asString(component.fields.heading).trim();

  const steps: ApproachStep[] = asRecordArray(component.fields.cards)
    .map((entry) => ({
      title: asString(entry.title).trim(),
      description: asString(entry.description),
    }))
    .filter((entry) => entry.title.length > 0);

  if (!heading && steps.length === 0) {
    return null;
  }

  return (
    // Anchor for the menu and footer "Approach" links.
    <div id="approach">
      <ApproachSection
        eyebrow={asString(component.fields.eyebrow)}
        heading={heading}
        intro={asString(component.fields.intro)}
        steps={steps}
      />
    </div>
  );
}
