"use client";

import {
  FormRenderer,
  type FormButtonAdapterProps,
  type FormRendererProps,
  type FormTheme,
} from "@ominity/next/forms";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  RecaptchaNotice,
  formComponents,
} from "@/components/ui/contact-section";
import { GlassShineCard } from "@/components/ui/glass-shine-card";
import { RadialGlowButton } from "@/components/ui/radial-glow-button";
import { TiltCard } from "@/components/ui/tilt-card";
import { resolveUiDictionary } from "@/lib/i18n/ui-dictionary";
import { registerSectionDialog } from "@/lib/section-navigation";

type OminityForm = FormRendererProps["form"];

/** The send button looks like the other buttons on the logistics side. */
function GlowSubmitButton({
  children,
  type = "submit",
  disabled,
  onClick,
}: FormButtonAdapterProps) {
  return (
    <RadialGlowButton
      type={type}
      disabled={disabled}
      onClick={(event) => onClick?.(event)}
      wrapperClassName="block"
      className="w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </RadialGlowButton>
  );
}

const glassFormComponents = { ...formComponents, Button: GlowSubmitButton };

// Underlined fields on clear glass, crimson focus (the logistics accent).
const glassFormTheme: Partial<FormTheme> = {
  form: "ominity-forms flex w-full flex-col gap-6",
  "field.wrapper": "flex flex-col gap-1.5",
  "field.label": "text-xs font-medium text-spark-indigo/75",
  "field.labelHidden": "sr-only",
  "field.input":
    "block h-auto w-full rounded-none border-0 border-b-2 border-spark-indigo/25 bg-transparent px-0 py-2 text-sm shadow-none text-spark-indigo outline-none transition-colors placeholder:text-spark-indigo/40 focus:border-spark-crimson focus:ring-0",
  "field.textarea":
    "block min-h-[110px] w-full resize-y rounded-none border-0 shadow-none border-b-2 border-spark-indigo/25 bg-transparent px-0 py-2 text-sm text-spark-indigo outline-none transition-colors placeholder:text-spark-indigo/40 focus:border-spark-crimson focus:ring-0",
  "field.helper": "text-xs text-spark-indigo/60",
  "field.error": "text-xs font-medium text-spark-crimson",
  "field.recaptcha": "min-h-[78px]",
};

/**
 * The contact card of the logistics side: liquid glass floating over the page, with
 * the Ominity form (email, company, role, message). It registers itself as the
 * "contact" section, so the menu, the footer and the buttons open it instead of
 * scrolling down.
 */
export function LogisticsContactDialog({
  form,
  locale,
}: {
  form: OminityForm | null;
  locale: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const dictionary = resolveUiDictionary(locale);
  const copy = dictionary.logisticsContact;

  useEffect(() => registerSectionDialog("contact", () => setOpen(true)), []);

  // The native dialog brings Escape, focus trapping and the top layer.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!savedNotice) return;
    const timer = window.setTimeout(() => setSavedNotice(false), 4000);
    return () => window.clearTimeout(timer);
  }, [savedNotice]);

  // The form stays mounted while the card is closed, so a half-written message
  // is still there when it opens again; the notice says so.
  const close = () => {
    if (!open) return;
    setOpen(false);
    const fields = cardRef.current?.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >("input:not([type=hidden]), textarea");
    if (
      Array.from(fields ?? []).some((field) => field.value.trim().length > 0)
    ) {
      setSavedNotice(true);
    }
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-labelledby="logistics-contact-title"
        onClose={close}
        // A click on the backdrop lands on the dialog itself; the card fills the rest.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-visible bg-transparent p-0 text-spark-indigo [perspective:1000px] backdrop:bg-transparent"
      >
        {/* The dialog is the perspective the card tilts in. */}
        <TiltCard>
          <GlassShineCard
            ref={cardRef}
            className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
          >
            <div className="relative space-y-6 p-8">
              <button
                type="button"
                onClick={close}
                aria-label={copy.close}
                className="absolute right-4 top-4 rounded-full p-2 text-spark-indigo/60 transition-colors hover:bg-white/40 hover:text-spark-indigo"
              >
                <X size={18} aria-hidden />
              </button>

              <div className="pr-8">
                <h2
                  id="logistics-contact-title"
                  className="text-3xl font-bold text-spark-indigo"
                >
                  {copy.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-spark-asphalt">
                  {copy.intro}
                </p>
              </div>

              {form ? (
                <>
                  {submitted ? (
                    <p className="rounded-xl border border-spark-indigo/15 bg-white/50 px-4 py-3 text-sm text-spark-indigo">
                      {dictionary.forms.status.submitSuccess}
                    </p>
                  ) : null}
                  <FormRenderer
                    form={form}
                    submitUrl="/api/forms/submit"
                    locale={locale}
                    messages={dictionary.forms}
                    styled
                    themeOverride={glassFormTheme}
                    components={glassFormComponents}
                    onSubmitSuccess={() => setSubmitted(true)}
                    onSubmitError={() => setSubmitted(false)}
                  />
                  <RecaptchaNotice
                    contact={dictionary.contact}
                    className="text-spark-indigo/50"
                  />
                </>
              ) : (
                <p className="text-sm leading-relaxed text-spark-asphalt">
                  {dictionary.contact.formUnavailable}
                </p>
              )}
            </div>
          </GlassShineCard>
        </TiltCard>
      </dialog>

      {/* Bottom left: the cookie button sits bottom right. */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-4 left-4 z-[60] max-w-xs rounded-xl border border-spark-indigo/10 bg-white px-4 py-3 text-sm text-spark-indigo shadow-lg transition-all duration-300 ${
          savedNotice
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {savedNotice ? copy.saved : null}
      </div>
    </>
  );
}
