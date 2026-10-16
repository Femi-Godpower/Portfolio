import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import { AccentText, Eyebrow, logisticsHeading, logisticsSection } from "@/components/ui/logistics";
import ScrollTimeline, { type Milestone } from "@/components/ui/scroll-timeline";
import { cn } from "@/lib/utils";

import { asRecordArray, asString } from "./helpers";

/** Heading and a scroll-drawn timeline, e.g. work experience. Entries show in CMS order. */
export function LogisticsTimelineBlock({ component }: CmsComponentRenderProps<StarterRenderContext>) {
  const milestones: Milestone[] = asRecordArray(component.fields.items)
    .map((entry, index) => ({
      id: String(index),
      title: asString(entry.title).trim(),
      place: asString(entry.place).trim(),
      date: asString(entry.date).trim(),
      description: asString(entry.description).trim(),
    }))
    .filter((milestone) => milestone.title.length > 0);

  if (milestones.length === 0) {
    return null;
  }

  const eyebrow = asString(component.fields.eyebrow).trim();
  const heading = asString(component.fields.heading).trim();
  const intro = asString(component.fields.intro).trim();

  return (
    <section className={cn(logisticsSection, "px-4 py-24 sm:py-32")}>
      {heading ? (
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
          <h2 className={cn(logisticsHeading, "text-4xl leading-tight sm:text-6xl")}>
            <AccentText text={heading} />
          </h2>
          {intro ? <p className="mx-auto mt-6 max-w-xl leading-relaxed">{intro}</p> : null}
        </div>
      ) : null}
      <div className="mt-12">
        <ScrollTimeline milestones={milestones} />
      </div>
    </section>
  );
}
