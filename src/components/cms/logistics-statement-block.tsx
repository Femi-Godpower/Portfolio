import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";

import { logisticsHeading, logisticsSection } from "@/components/ui/logistics";
import { RevealText } from "@/components/ui/reveal-text";
import { TiltedGridHero, type TiltedGridTile } from "@/components/ui/tilted-grid-hero";
import { cn } from "@/lib/utils";

import { asImageUrl, asRecordArray, asString } from "./helpers";

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** A curved row of tiles streaming past, then a large statement that lights up word by word on scroll. */
export function LogisticsStatementBlock({ component }: CmsComponentRenderProps<StarterRenderContext>) {
  const statement = asString(component.fields.statement).trim();
  if (!statement) {
    return null;
  }

  // A tile shows its image, or its colour until an image is added.
  const tiles: TiltedGridTile[] = asRecordArray(component.fields.tiles)
    .map((entry) => {
      const color = asString(entry.color).trim();
      return {
        src: asImageUrl(entry.image) || undefined,
        color: HEX_COLOR.test(color) ? color : undefined,
        alt: asString(entry.image_alt).trim(),
      };
    })
    .filter((tile) => tile.src || tile.color);
  const body = asString(component.fields.body).trim();

  return (
    <section id="about" className={cn(logisticsSection, "py-24 sm:py-32")}>
      {tiles.length > 0 ? (
        <TiltedGridHero images={tiles} tileHeight={42} axis={50} className="mb-16 h-[340px] w-full sm:h-[460px]" />
      ) : null}

      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className={cn(logisticsHeading, "text-3xl leading-tight sm:text-5xl")}>
          <RevealText text={statement} />
        </p>
        {body ? <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed">{body}</p> : null}
      </div>
    </section>
  );
}
