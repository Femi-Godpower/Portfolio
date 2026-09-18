import type { ReactNode } from "react";
import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import { asRecordArray, asString } from "./helpers";

/**
 * Plain text from the CMS: a blank line starts a new paragraph, and a run of
 * lines starting with "- " becomes a list (no markers).
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
          <ul key={index} className="space-y-2">
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

  const hasToc = tocLabel.length > 0 && sections.length > 0;

  return (
    // Same container as the footer. pt clears the fixed header (h-20).
    <article className="mx-auto w-full max-w-7xl px-6 pb-24 pt-32 sm:px-14 sm:pt-40">
      <header className="mb-12 max-w-3xl">
        {title ? (
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
        ) : null}
        {updated ? <p className="mt-4 text-sm text-white/50">{updated}</p> : null}
        {intro ? (
          <div className="mt-8 space-y-4 text-base leading-relaxed text-white/70">{renderText(intro)}</div>
        ) : null}
      </header>

      {/* Text left, contents right. The sidebar sticks under the header and
          scrolls on its own when the list is taller than the screen. On
          narrow screens the contents sit above the text instead. */}
      <div className={hasToc ? "grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 xl:gap-24" : undefined}>
        <div className="max-w-3xl space-y-12">
          {sections.map((section, index) => (
            <section key={index} id={`section-${index + 1}`} className="scroll-mt-28">
              <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">
                <span className="mr-3 tabular-nums">{index + 1}.</span>
                {section.heading}
              </h2>
              <div className="space-y-4 leading-relaxed text-white/70">{renderText(section.body)}</div>
            </section>
          ))}
        </div>

        {hasToc ? (
          <aside className="-order-1 lg:order-none lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto [scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]">
            <nav aria-label={tocLabel} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-white/50">{tocLabel}</h2>
              <ol className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
                {sections.map((section, index) => (
                  <li key={index}>
                    <a
                      href={`#section-${index + 1}`}
                      className="flex text-white/70 transition-colors hover:text-[#f093fb]"
                    >
                      <span className="w-7 shrink-0 tabular-nums text-white/40">{index + 1}.</span>
                      <span>{section.heading}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
