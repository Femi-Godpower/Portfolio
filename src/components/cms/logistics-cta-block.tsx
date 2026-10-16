import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import { LogisticsButton, logisticsHeading, logisticsSection } from "@/components/ui/logistics";
import { LogisticsContactDialog } from "@/components/ui/logistics-contact-dialog";
import { RevealText } from "@/components/ui/reveal-text";
import { getOminityForm } from "@/lib/ominity/forms";
import { cn } from "@/lib/utils";

import { asString } from "./helpers";

export async function LogisticsCtaBlock({ component, context }: CmsComponentRenderProps<StarterRenderContext>) {
  const heading = asString(component.fields.heading).trim();
  if (!heading) {
    return null;
  }

  const body = asString(component.fields.body).trim();
  const buttons = (["primary", "secondary"] as const)
    .map((variant) => ({
      variant,
      label: asString(component.fields[`${variant}_label`]).trim(),
      href: asString(component.fields[`${variant}_href`]).trim(),
    }))
    .filter((button) => button.label && button.href);

  // The contact card every Contact link on the logistics side opens. Without a
  // form id the links scroll to this section instead.
  const formId = Number.parseInt(asString(component.fields.form_id), 10);
  const form = formId > 0 ? await getOminityForm(formId, context.locale) : null;

  return (
    // Full screen: shorter, the footer peeks in under it and snaps over it when a
    // #contact link scrolls here.
    <section id="contact" className={cn(logisticsSection, "flex min-h-svh items-center px-4 py-32 sm:py-44")}>
      {/* Soft indigo, slate and crimson light, fading out before the section edges. */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_25%_55%,rgba(44,43,78,0.14),transparent),radial-gradient(ellipse_35%_30%_at_75%_40%,rgba(94,122,145,0.18),transparent),radial-gradient(ellipse_30%_25%_at_60%_70%,rgba(255,45,75,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-2xl text-center">
        <h2 className={cn(logisticsHeading, "text-4xl leading-tight sm:text-6xl")}>
          <RevealText text={heading} />
        </h2>
        {body ? <p className="mx-auto mt-6 max-w-lg leading-relaxed">{body}</p> : null}
        {buttons.length > 0 ? (
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {buttons.map((button) => (
              <LogisticsButton key={button.variant} href={button.href} variant={button.variant}>
                {button.label}
              </LogisticsButton>
            ))}
          </div>
        ) : null}
      </div>
      {formId > 0 ? <LogisticsContactDialog form={form} locale={context.locale} /> : null}
    </section>
  );
}
