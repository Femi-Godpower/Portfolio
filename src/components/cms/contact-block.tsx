import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import ContactSection, { type ContactDetail } from "@/components/ui/contact-section";
import { getOminityForm } from "@/lib/ominity/forms";

import { asString, isOminityForm } from "./helpers";

const asFormId = (value: unknown): number => {
  const id = typeof value === "number" ? value : Number.parseInt(asString(value), 10);
  return Number.isFinite(id) && id > 0 ? id : 0;
};

export async function ContactBlock({
  component,
  context,
}: CmsComponentRenderProps<StarterRenderContext>) {
  const heading = asString(component.fields.heading).trim();
  if (!heading) {
    return null;
  }

  const email = asString(component.fields.email).trim();
  const location = asString(component.fields.location).trim();
  const responseTime = asString(component.fields.response_time).trim();

  const details: Array<ContactDetail | null> = [
    email ? { kind: "email", value: email, href: `mailto:${email}` } : null,
    location ? { kind: "location", value: location } : null,
    responseTime ? { kind: "response", value: responseTime } : null,
  ];

  // The CMS sends the form itself once the Forms module fills this field; until
  // then a form id is enough, and the form is fetched server-side.
  const field = component.fields.form;
  const form = isOminityForm(field)
    ? field
    : await getOminityForm(asFormId(component.fields.form_id), context.locale);

  const anchor = asString(component.fields.anchor, "contact").replace(/^#/, "") || "contact";

  return (
    <ContactSection
      id={anchor}
      eyebrow={asString(component.fields.eyebrow)}
      heading={heading}
      description={asString(component.fields.description)}
      details={details.filter((detail) => detail !== null)}
      form={form}
      locale={context.locale}
    />
  );
}
