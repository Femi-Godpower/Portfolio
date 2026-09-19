import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import { getStarterOminityConfig } from "@/lib/ominity/env";

import { CookieDeclarationClient } from "./cookie-declaration-block-client";
import { asString } from "./helpers";

/**
 * Cookiebot's cookie declaration: the live cookie list plus the "change or
 * withdraw consent" controls. Lives on the cookie policy page, which the
 * footer links to under Legal.
 */
export function CookieDeclarationBlock({ component, context }: CmsComponentRenderProps<StarterRenderContext>) {
  const { cookiebotId } = getStarterOminityConfig();
  const title = asString(component.fields.title).trim();
  const intro = asString(component.fields.intro).trim();
  const language = context.locale.split(/[-_]/)[0]?.toLowerCase() || "en";

  return (
    // Same container as the legal document block. pt clears the fixed header (h-20).
    <article className="mx-auto w-full max-w-7xl px-6 pb-24 pt-32 sm:px-14 sm:pt-40">
      <header className="mb-12 max-w-3xl">
        {title ? <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1> : null}
        {intro ? <p className="mt-8 text-base leading-relaxed text-white/70">{intro}</p> : null}
      </header>

      {cookiebotId ? (
        <CookieDeclarationClient cookiebotId={cookiebotId} language={language} />
      ) : (
        <p className="max-w-3xl rounded-2xl border border-dashed border-amber-300/40 px-4 py-3 text-sm text-amber-200">
          Cookie declaration unavailable: <code>COOKIEBOT_ID</code> is not set.
        </p>
      )}
    </article>
  );
}
