import type { ReactNode } from "react";
import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import { asRecordArray, asString } from "./helpers";

/**
 * Plain text from the CMS: a blank line starts a new paragraph, and a run of
 * lines starting with "- " becomes a bullet list.
 */
function renderText(text: string): ReactNode[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.every((line) => line.startsWith("- "))) {
        return (
          <ul key={index} className="list-disc space-y-2 pl-5 marker:text-[#f093fb]">
            {lines.map((line, lineIndex) => (
              <li key={lineIndex}>{line.slice(2)}</li>
            ))}
          </ul>
        );
      }
      return <p key={index}>{lines.join(" ")}</p>;
    });
}

export function LegalDocumentBlock({ component }: CmsComponentRenderProps<StarterRenderContext>) {
  const title = asString(component.fields.title).trim();
  const updated = asString(component.fields.updated).trim();
  const intro = asString(component.fields.intro).trim();
  const tocLabel = asString(component.fields.toc_label).trim();
  const sections = asRecordArray(component.fields.sections)
    .map((entry) => ({ heading: asString(entry.heading).trim(), body: asString(entry.body).trim() }))
    .filter((section) => section.heading.length > 0);

  return (
    // pt clears the fixed header (h-20); side padding matches the header.
    <article className="mx-auto w-full max-w-3xl px-[7vw] pb-24 pt-32 sm:px-6 sm:pt-40">
      <header className="mb-12">
        {title ? (
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
        ) : null}
        {updated ? <p className="mt-4 text-sm text-white/50">{updated}</p> : null}
        {intro ? (
          <div className="mt-8 space-y-4 text-base leading-relaxed text-white/70">{renderText(intro)}</div>
        ) : null}
      </header>

      {tocLabel && sections.length > 0 ? (
        <nav aria-label={tocLabel} className="mb-16 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-white/50">{tocLabel}</h2>
          <ol className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={index}>
                <a
                  href={`#section-${index + 1}`}
                  className="text-white/70 transition-colors hover:text-[#f093fb]"
                >
                  <span className="mr-2 tabular-nums text-white/40">{index + 1}.</span>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="space-y-12">
        {sections.map((section, index) => (
          <section key={index} id={`section-${index + 1}`} className="scroll-mt-28">
            <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">
              <span className="mr-3 tabular-nums text-[#f093fb]">{index + 1}.</span>
              {section.heading}
            </h2>
            <div className="space-y-4 leading-relaxed text-white/70">{renderText(section.body)}</div>
          </section>
        ))}
      </div>
    </article>
  );
}
