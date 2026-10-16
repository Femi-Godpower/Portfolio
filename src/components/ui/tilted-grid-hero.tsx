"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/* ── the curved row ──────────────────────────────────────────────
 * One row of tiles streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you, and the
 * ends fade into the page.
 *
 * A CSS box can't bend, so every tile is cut into SLICES vertical strips,
 * each a flat facet of the cylinder showing its share of the image. The
 * strips sit still inside their tile, each turned its own few degrees round
 * the cylinder's axis, and the tile (preserve-3d) is what moves: one rotateY
 * about that same axis carries the whole tile along the arc. Only a tile's
 * delay differs, and that sets where on the arc it sits.
 *
 * Lengths are pixels from a ResizeObserver, not container-query units:
 * Safari 15 (the iPhone 7 this site is tested on) has no cqw/cqh.
 * ─────────────────────────────────────────────────────────────── */

// Strips per tile; fewer starts to show corners along the top and bottom edges.
const SLICES = 16;

// Camera distance from the screen, as a multiple of the cylinder's radius.
const CAMERA = 1.6;

/**
 * Cylinder radius, as a share of the hero's width, that puts the frame's
 * edge `bend` radians round the arc as seen through the camera:
 * r·sinθ · CAMERA / (CAMERA − 1 + cosθ) = width / 2, solved for r.
 */
function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

// A tile is never wider than this share of the hero, so a phone still
// shows its neighbours instead of one tile edge to edge.
const MAX_WIDTH = 55;

/**
 * Lays the loop on the cylinder. Angles come back in degrees: `unit` is the
 * arc one tile-height spans, `limit` how far round a tile's centre can go
 * before the whole tile is off-screen, and `sweep` how far round the loop's
 * ends sit. The loop reaches past `limit`, so a tile only ever wraps out of
 * sight. `tile` is the tile height in px.
 */
function measure(width: number, height: number, tileHeight: number, aspect: number, gap: number, bend: number) {
  const tile = Math.min((tileHeight / 100) * height, ((MAX_WIDTH / 100) * width) / aspect);
  const radius = width * arc(bend);
  if (!(tile > 0) || !(radius > 0)) return { width, tile: 0, columns: 2, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(tile / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  // Capped so a hero squeezed to a sliver can't mount thousands of tiles.
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return { width, tile: round(tile), columns, sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
}

export type TiltedGridTile = {
  /** Image URL; without one the tile is filled with `color`. */
  src?: string | undefined;
  color?: string | undefined;
  alt?: string | undefined;
};

export type TiltedGridHeroProps = {
  /** Tiles run along the row in order and repeat. */
  images: TiltedGridTile[];
  /** Seconds for the row to advance by one tile. @default 4 */
  speed?: number;
  /** Tile height, as a percentage of the hero's height. @default 26 */
  tileHeight?: number;
  /** Tile width divided by tile height. @default 16 / 9 */
  aspectRatio?: number;
  /** Space between tiles, as a percentage of a tile's height. @default 6 */
  gap?: number;
  /** Vertical centre of the row, as a percentage of the hero's height. @default 56 */
  axis?: number;
  /** How far the row has bent round by the frame's edge, in degrees (5–85). @default 80 */
  curve?: number;
  /** Width of the fade at each end, as a percentage of the hero's width. @default 12 */
  fade?: number;
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tileClass = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  // Null until the observer has measured the hero; the band stays hidden until then.
  const [layout, setLayout] = React.useState<ReturnType<typeof measure> | null>(null);

  // The tile each slot shows, as a position in the run, keyed "columns-slot" so
  // a new slot count starts fresh. It only changes when the slot wraps, out of sight.
  const [shown, setShown] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout((prev) =>
        prev?.columns === next.columns && prev.sweep === next.sweep && prev.tile === next.tile && prev.width === next.width
          ? prev
          : next,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  // Fetch every image up front; a tile picks up its next one just before it comes back into view.
  React.useEffect(() => {
    for (const { src } of images) if (src) new Image().src = src;
  }, [images]);

  const { width, tile, columns, sweep, unit, limit } =
    layout ?? measure(1200, 560, tileHeight, aspectRatio, gap, bend);

  // Every length is a multiple of the tile's height.
  const u = (n: number) => `${+(n * tile).toFixed(3)}px`;

  const r = width * arc(bend);
  const radius = `${+r.toFixed(3)}px`;
  // Out to the axis, round it, back in: a box sits on the cylinder at the angle rotateY gives it.
  const turn = (deg: number) => `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;

  // Beyond `limit` a tile is wholly off-screen, so it is hidden there.
  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    // Paused, not removed: every tile is already placed by its negative delay, so it freezes as a still.
    `@media(prefers-reduced-motion:reduce){.${tileClass}{animation-play-state:paused}}`;

  const share = aspectRatio / SLICES;
  const duration = columns * speed;
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)`;

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
      <style>{css}</style>

      {/* Slots exist only once the hero is measured, and all remount together when
          their number changes: a slot added later would start its animation out of
          step with the others, leaving a hole on one side and an overlap on the other. */}
      <div
        key={columns}
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: layout ? 1 : 0,
          perspective: `${+(r * CAMERA).toFixed(3)}px`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: layout ? columns : 0 }, (_, t) => {
          // Slot `columns - 1` starts nearest the exit, so this numbers slots in the order they come on.
          const first = columns - 1 - t;
          const slot = `${columns}-${t}`;
          const img = images[(shown[slot] ?? first) % Math.max(images.length, 1)];
          return (
            <div
              key={t}
              className={cn(tileClass, "absolute")}
              style={{
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: "preserve-3d",
                WebkitTransformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
              onAnimationIteration={(e) => {
                // elapsedTime counts whole loops, missed events included.
                const lap = Math.round(e.elapsedTime / duration);
                setShown((prev) => {
                  const next = lap * columns + first;
                  return prev[slot] === next ? prev : { ...prev, [slot]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  className={cn(
                    "absolute top-0 overflow-hidden",
                    k === 0 && "rounded-l-lg",
                    k === SLICES - 1 && "rounded-r-lg",
                  )}
                  style={{
                    backgroundColor: img?.color,
                    left: u((aspectRatio - share) / 2),
                    // A pixel wider than its share, so neighbouring facets overlap and no hairline opens.
                    width: k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn((aspectRatio / 2 - (k + 0.5) * share) * unit),
                  }}
                >
                  {img?.src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS media host is not known to next/image
                    <img
                      src={img.src}
                      alt={k === 0 ? (img.alt ?? "") : ""}
                      draggable={false}
                      className="absolute top-0 max-w-none object-cover"
                      style={{ left: u(-k * share), width: u(aspectRatio), height: u(1) }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default TiltedGridHero;
