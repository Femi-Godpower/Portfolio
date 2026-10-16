import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import { AccentText, LogisticsButton, logisticsHeading, logisticsSection } from "@/components/ui/logistics";
import { cn } from "@/lib/utils";

import { asImageUrl, asString } from "./helpers";

const PHOTO_FADE = "linear-gradient(to bottom, black 55%, transparent)";

export function LogisticsHeroBlock({ component }: CmsComponentRenderProps<StarterRenderContext>) {
  const title = asString(component.fields.title).trim();
  if (!title) {
    return null;
  }

  const image = asImageUrl(component.fields.image) || "/logistics/airport-hero.jpg";
  const body = asString(component.fields.body).trim();
  const ctaLabel = asString(component.fields.cta_label).trim();
  const ctaHref = asString(component.fields.cta_href).trim();

  return (
    <section className={cn(logisticsSection, "flex min-h-svh items-center justify-center px-4 py-32")}>
      {/* The photo fades out at the bottom instead of ending on an edge, so the
          hero melts into the page below. */}
      <div className="absolute inset-0" style={{ maskImage: PHOTO_FADE, WebkitMaskImage: PHOTO_FADE }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS media host is not known to next/image */}
        <img src={image} alt="" fetchPriority="high" className="h-full w-full object-cover" />
        {/* White wash so the dark text stays readable on the busy photo. */}
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8),transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1 className={cn(logisticsHeading, "text-5xl leading-[1.05] sm:text-7xl")}>
          <AccentText text={title} />
        </h1>
        {body ? <p className="mt-6 max-w-xl text-base leading-relaxed text-spark-asphalt sm:text-lg">{body}</p> : null}
        {ctaLabel && ctaHref ? (
          <div className="mt-10">
            <LogisticsButton href={ctaHref}>{ctaLabel}</LogisticsButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
