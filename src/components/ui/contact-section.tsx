"use client";

import { useRef, useState, type ComponentProps } from "react";
import { ClockIcon, MailIcon, MapPinIcon } from "lucide-react";

import {
  FormRenderer,
  createShadcnFormComponents,
  type FormInputAdapterProps,
  type FormRendererProps,
  type FormTextareaAdapterProps,
  type FormTheme,
} from "@ominity/next/forms";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLineReveal } from "@/components/ui/use-line-reveal";
import { resolveUiDictionary } from "@/lib/i18n/ui-dictionary";

type OminityForm = FormRendererProps["form"];

const ICONS = {
  email: MailIcon,
  location: MapPinIcon,
  response: ClockIcon,
} as const;

export type ContactDetail = {
  /** Which icon and dictionary label to use. */
  kind: keyof typeof ICONS;
  value: string;
  href?: string;
};

export interface ContactSectionProps {
  eyebrow?: string;
  heading: string;
  description?: string;
  details: ContactDetail[];
  form: OminityForm | null;
  locale: string;
  /** Section id, used as the menu/footer anchor. */
  id?: string;
}

// `invalid` is the renderer's own flag, not a DOM attribute; React warns if it
// reaches the input, so it is dropped in favour of aria-invalid.
function FormInput({ inputMode, invalid, ...props }: FormInputAdapterProps) {
  return (
    <Input
      {...props}
      aria-invalid={invalid ?? props["aria-invalid"]}
      inputMode={inputMode as ComponentProps<typeof Input>["inputMode"]}
    />
  );
}

function FormTextarea({ invalid, ...props }: FormTextareaAdapterProps) {
  return <Textarea {...props} aria-invalid={invalid ?? props["aria-invalid"]} />;
}

const formComponents = createShadcnFormComponents({
  Input: FormInput,
  Textarea: FormTextarea,
  Button,
});

/** The package's default theme is light; this is the same form in brand colors. */
const brandFormTheme: FormTheme = {
  form: "ominity-forms flex w-full flex-col gap-5",
  "field.wrapper": "flex flex-col gap-2",
  "field.label": "text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/55",
  "field.labelHidden": "sr-only",
  "field.input":
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f093fb]/60 focus:ring-2 focus:ring-[#f093fb]/25",
  "field.textarea":
    "min-h-[120px] w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f093fb]/60 focus:ring-2 focus:ring-[#f093fb]/25",
  "field.select":
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f093fb]/60 focus:ring-2 focus:ring-[#f093fb]/25",
  "field.checkbox": "h-4 w-4 rounded border-white/20 bg-white/[0.04] text-[#f093fb] focus:ring-[#f093fb]/40",
  "field.multicheckbox": "h-4 w-4 border-white/20 bg-white/[0.04] text-[#f093fb] focus:ring-[#f093fb]/40",
  // Same as the nav buttons: clean at rest, brand gradient on hover and focus.
  // A gradient cannot be animated, so it sits in a layer behind the label
  // (`after`) that fades in over the dark base (`before`).
  "field.button":
    "relative isolate inline-flex w-full items-center justify-center overflow-hidden rounded-full border border-white/15 bg-transparent px-6 py-3 text-sm font-medium text-white backdrop-blur transition-[color,border-color] duration-300 before:absolute before:inset-0 before:-z-10 before:bg-[#0c0a0f]/80 after:absolute after:inset-0 after:-z-10 after:bg-gradient-to-r after:from-[#f093fb] after:to-[#f5576c] after:opacity-0 after:transition-opacity after:duration-300 hover:border-transparent hover:text-[#0c0a0f] hover:after:opacity-100 focus-visible:border-transparent focus-visible:text-[#0c0a0f] focus-visible:outline-none focus-visible:after:opacity-100 disabled:cursor-not-allowed disabled:opacity-60",
  "field.helper": "text-xs text-white/45",
  "field.error": "text-xs font-medium text-[#f5576c]",
  "field.optionWrapper": "flex items-center gap-2 text-sm text-white/80",
  "field.optionLabel": "text-sm text-white/80",
  "field.optionInput": "h-4 w-4 border-white/20 bg-white/[0.04] text-[#f093fb] focus:ring-[#f093fb]/40",
  "field.recaptcha": "min-h-[78px]",
  "field.phoneWrapper":
    "relative flex w-full min-w-0 items-stretch rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white transition focus-within:border-[#f093fb]/60 focus-within:ring-2 focus-within:ring-[#f093fb]/25",
  "field.phoneCountryButton":
    "flex items-center gap-2 border-r border-white/10 bg-transparent pr-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f093fb]/40 disabled:cursor-not-allowed disabled:opacity-60",
  "field.phoneDropdown":
    "absolute left-0 top-full z-30 mt-2 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-2xl border border-white/10 bg-[#141018] p-3 shadow-xl",
  "field.phoneSearch":
    "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f093fb]/60 focus:ring-2 focus:ring-[#f093fb]/25",
  "field.phoneOption":
    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 focus:bg-white/10 focus:outline-none data-[selected=true]:bg-[#f093fb] data-[selected=true]:text-[#0c0a0f]",
  "field.phoneNumberInput":
    "min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60",
};

/**
 * Contact section: heading, story and contact details on one side, the Ominity
 * form on the other. Text reveals line by line on scroll, like the sections
 * above it. Without a form (Forms module off), the details carry the section.
 */
export default function ContactSection({
  eyebrow,
  heading,
  description,
  details,
  form,
  locale,
  id = "contact",
}: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [submitted, setSubmitted] = useState(false);
  useLineReveal(sectionRef, [heading, description]);
  const dictionary = resolveUiDictionary(locale);

  return (
    // Fills the screen, so the footer cannot peek in and snap away mid-message.
    // The card sits near the top: centring it left a big gap above.
    <section
      ref={sectionRef}
      id={id}
      className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-start px-6 pb-24 pt-20 text-white sm:px-14 md:pt-24"
    >
      <div className="relative grid w-full rounded-[28px] border border-white/10 bg-white/[0.03] md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col justify-between gap-8 p-6 sm:p-10 lg:col-span-2">
          <header className="flex flex-col gap-5">
            {eyebrow ? (
              <div className="inline-flex w-fit items-center text-xs uppercase tracking-[0.4em] text-white/80">
                {eyebrow}
              </div>
            ) : null}
            <h2
              data-line-reveal
              className="max-w-2xl text-3xl font-semibold leading-[1.05] tracking-tight opacity-0 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {heading}
            </h2>
            {description ? (
              <p
                data-line-reveal
                className="max-w-xl text-base leading-relaxed text-white/60 opacity-0 md:text-lg"
              >
                {description}
              </p>
            ) : null}
          </header>

          {details.length > 0 ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              {details.map((detail) => {
                const Icon = ICONS[detail.kind];
                const label = dictionary.contact[detail.kind];
                return (
                  <div key={detail.kind} className="flex items-center gap-3">
                    <span className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-white/45">{label}</dt>
                      <dd className="truncate text-sm text-white/90">
                        {detail.href ? (
                          <a
                            href={detail.href}
                            className="transition-colors hover:text-[#f093fb]"
                          >
                            {detail.value}
                          </a>
                        ) : (
                          detail.value
                        )}
                      </dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          ) : null}
        </div>

        <div className="flex w-full items-center border-t border-white/10 bg-white/[0.02] p-6 sm:p-8 md:col-span-1 md:border-l md:border-t-0">
          {form ? (
            <div className="w-full">
              {submitted ? (
                <p className="mb-4 rounded-xl border border-[#f093fb]/30 bg-[#f093fb]/10 px-4 py-3 text-sm text-white">
                  {dictionary.forms.status.submitSuccess}
                </p>
              ) : null}
              <FormRenderer
                form={form}
                submitUrl="/api/forms/submit"
                locale={locale}
                messages={dictionary.forms}
                styled
                themeOverride={brandFormTheme}
                components={formComponents}
                onSubmitSuccess={() => setSubmitted(true)}
                onSubmitError={() => setSubmitted(false)}
              />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-white/55">
              {dictionary.contact.formUnavailable}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
