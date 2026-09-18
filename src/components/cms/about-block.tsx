import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import AboutSection from "@/components/ui/about-section";

import { asString, asStringArray } from "./helpers";

/** Body accepts a list of paragraphs or one text with blank lines between paragraphs. */
const asParagraphs = (value: unknown): string[] => {
  const paragraphs = Array.isArray(value) ? asStringArray(value) : asString(value).split(/\n\s*\n/);
  return paragraphs.map((paragraph) => paragraph.trim()).filter((paragraph) => paragraph.length > 0);
};

export function AboutBlock({
  component,
}: CmsComponentRenderProps<StarterRenderContext>) {
  const heading = asString(component.fields.heading).trim();
  const paragraphs = asParagraphs(component.fields.body);

  if (!heading && paragraphs.length === 0) {
    return null;
  }

  const anchor = asString(component.fields.anchor, "about").replace(/^#/, "") || "about";

  return (
    <AboutSection
      id={anchor}
      eyebrow={asString(component.fields.eyebrow)}
      heading={heading}
      paragraphs={paragraphs}
      name={asString(component.fields.name).trim()}
      phone={asString(component.fields.phone).trim()}
      email={asString(component.fields.email).trim()}
      location={asString(component.fields.location).trim()}
      availability={asString(component.fields.availability).trim()}
    />
  );
}
