import type { CmsComponentRenderProps } from "@ominity/next/cms/rendering";
import type { CmsRenderContext as StarterRenderContext } from "@ominity/next/cms";
import {
  Boxes,
  Compass,
  Container,
  Forklift,
  Globe,
  GraduationCap,
  Package,
  Plane,
  Route,
  Search,
  Ship,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

import { GlowCard } from "@/components/ui/glow-card";
import { Eyebrow, logisticsHeading, logisticsSection } from "@/components/ui/logistics";
import { RevealText } from "@/components/ui/reveal-text";
import { cn } from "@/lib/utils";

import { asRecordArray, asString } from "./helpers";

/** The options of the blueprint's "icon" enumeration. */
const ICONS: Record<string, LucideIcon> = {
  boxes: Boxes,
  compass: Compass,
  container: Container,
  forklift: Forklift,
  globe: Globe,
  "graduation-cap": GraduationCap,
  package: Package,
  plane: Plane,
  route: Route,
  search: Search,
  ship: Ship,
  truck: Truck,
  warehouse: Warehouse,
};

/**
 * Left-aligned heading, intro and a row of items. "cards" shows each item as a
 * bordered card whose icon tile fills on hover; "columns" numbers the items.
 */
export function LogisticsFeaturesBlock({ component }: CmsComponentRenderProps<StarterRenderContext>) {
  const items = asRecordArray(component.fields.items)
    .map((entry) => ({
      icon: ICONS[asString(entry.icon)] ?? Package,
      title: asString(entry.title).trim(),
      text: asString(entry.text).trim(),
    }))
    .filter((item) => item.title.length > 0);

  const heading = asString(component.fields.heading).trim();
  if (!heading && items.length === 0) {
    return null;
  }

  const columns = asString(component.fields.layout) === "columns";
  const eyebrow = asString(component.fields.eyebrow).trim();
  const intro = asString(component.fields.intro).trim();
  const footnote = asString(component.fields.footnote).trim();
  // Target of the nav and footer links on this page (Studies, Searching).
  const anchor = asString(component.fields.anchor).trim() || undefined;

  return (
    <section id={anchor} className={cn(logisticsSection, "px-4 py-24 sm:py-32")}>
      <div className="mx-auto max-w-6xl">
        {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
        {heading ? (
          <h2 className={cn(logisticsHeading, "max-w-2xl text-4xl leading-tight sm:text-6xl")}>
            <RevealText text={heading} />
          </h2>
        ) : null}
        {intro ? (
          <p className="mt-6 max-w-xl leading-relaxed">{intro}</p>
        ) : null}

        {items.length > 0 ? (
          <ul
            className={cn(
              "mt-16 grid sm:grid-cols-2",
              columns ? "gap-10" : "gap-4",
              items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
            )}
          >
            {items.map(({ icon: Icon, title, text }, index) =>
              columns ? (
                <li key={title} className="border-t border-spark-indigo/10 pt-6">
                  <p className="text-xs text-spark-crimson">{String(index + 1).padStart(2, "0")}</p>
                  <Icon className="mt-6 size-8 text-spark-slate" strokeWidth={1.5} aria-hidden />
                  <h3 className={cn(logisticsHeading, "mt-6 text-lg")}>{title}</h3>
                  {text ? <p className="mt-2 text-sm leading-relaxed">{text}</p> : null}
                </li>
              ) : (
                <li key={title}>
                  <GlowCard className="group flex h-full flex-col gap-4 border-spark-indigo/10 bg-white/80 p-6 text-spark-asphalt transition-colors hover:border-spark-crimson/40">
                    <div className="flex size-11 items-center justify-center rounded-md bg-spark-crimson/10 text-spark-crimson transition-colors group-hover:bg-spark-crimson group-hover:text-white">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className={cn(logisticsHeading, "text-base")}>{title}</h3>
                      {text ? <p className="text-sm leading-relaxed">{text}</p> : null}
                    </div>
                  </GlowCard>
                </li>
              ),
            )}
          </ul>
        ) : null}

        {footnote ? <p className="mt-16 text-sm text-spark-slate">{footnote}</p> : null}
      </div>
    </section>
  );
}
