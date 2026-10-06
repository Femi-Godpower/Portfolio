"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

import { WORDMARK_FONT_FAMILY } from "@/lib/fonts";
import { useSvgTextDashScale } from "@/lib/svg-text-dash";

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Entrance fade as a CSS animation, not JS: it plays even when the browser
 * throttles script and animation frames (Opera GX limiter, battery saver),
 * and the server-rendered HTML is never stuck at opacity 0.
 */
function entrance(durationSec: number, delaySec: number, from?: string): CSSProperties {
  return {
    "--path-drawing-duration": `${durationSec}s`,
    "--path-drawing-delay": `${delaySec}s`,
    ...(from ? { "--path-drawing-from": from } : {}),
  } as CSSProperties;
}

type SvgPathDrawingTextAnimationProps = {
  text: string;
  /** Small text pinned to the top-left corner of the drawn name */
  greeting?: string;
  fromColor?: string;
  toColor?: string;
  strokeWidth?: number;
  /** Seconds to draw every letter in (and, mirrored, to chase them out) */
  durationSec?: number;
  /** Seconds the finished name stays fully drawn before it disappears */
  holdSec?: number;
  /** Seconds of empty canvas before the next cycle */
  restSec?: number;
  /** Keep cycling; when false the name draws once and stays */
  loop?: boolean;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  fontSize?: number;
  className?: string;
};

type Letter = { char: string; x: number };

/** How long the name may stay hidden while measuring before it is shown fully drawn. */
const STATIC_FALLBACK_MS = 2500;

/** The drawing surface of the name, in viewBox units. */
type LetterBox = {
  width: number;
  height: number;
  /** CSS font shorthand, the same face the SVG renders. */
  font: string;
  baselineY: number;
  strokeWidth: number;
};

/**
 * Strokes `letters` in white on a canvas the size of the viewBox (times `scale`)
 * and returns its pixels. `dash` null draws the full outline.
 *
 * A canvas, not a picture of the SVG: an SVG turned into an image cannot use the
 * page's web fonts (it rendered before an inlined copy of the font had loaded),
 * so it measured a fallback font's letters and the I never closed. The canvas
 * draws with the same loaded font, and in Chromium its dash lengths match the
 * SVG stroke exactly (the F: 457 on both).
 */
function strokeLetters(
  box: LetterBox,
  letters: ReadonlyArray<Letter>,
  dash: number | null,
  scale: number,
): { data: Uint8ClampedArray; width: number; height: number } | null {
  const width = Math.max(1, Math.round(box.width * scale));
  const height = Math.max(1, Math.round(box.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.scale(scale, scale);
  ctx.font = box.font;
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.lineWidth = box.strokeWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#ffffff";
  ctx.setLineDash(dash === null ? [] : [dash, 100000]);
  for (const letter of letters) {
    ctx.strokeText(letter.char, letter.x, box.baselineY);
  }

  try {
    return { data: ctx.getImageData(0, 0, width, height).data, width, height };
  } catch {
    // Blocked canvas readback: the caller falls back to an estimate.
    return null;
  }
}

const isInk = (data: Uint8ClampedArray, pixel: number) => data[pixel * 4 + 3]! > 12;

function countLetterInk(box: LetterBox, letter: Letter, dash: number | null): number {
  const raster = strokeLetters(box, [letter], dash, 0.45);
  if (!raster) return 0;
  let n = 0;
  for (let p = 0; p < raster.width * raster.height; p += 1) {
    if (isInk(raster.data, p)) n += 1;
  }
  return n;
}

/** Smallest dash length that renders the same ink as the finished letter. */
function measureLetterDashLength(box: LetterBox, letter: Letter): number {
  const full = countLetterInk(box, letter, null);
  if (full <= 0) {
    throw new Error("empty ink");
  }

  // Strict threshold: a looser one leaves the last few units of the outline undrawn,
  // which shows as a gap where the line should close.
  const covered = (dash: number) => countLetterInk(box, letter, dash) >= full * 0.9995;

  let hi = 64;
  while (hi < 24000 && !covered(hi)) {
    hi *= 2;
  }

  let lo = 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (covered(mid)) hi = mid;
    else lo = mid + 1;
  }

  // Small overshoot so the outline always closes; the raster is only 45% scale,
  // so its answer can be a few units short of the true path length.
  return Math.max(1, Math.ceil(lo * 1.03) + 4);
}

/** Top-left corner of the finished letters, as % of the viewBox. */
function measureInkCorner(box: LetterBox, letters: ReadonlyArray<Letter>): { left: number; top: number } | null {
  const raster = strokeLetters(box, letters, null, 1);
  if (!raster) return null;

  const { data, width, height } = raster;
  let top = height;
  let left = width;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isInk(data, y * width + x)) {
        if (y < top) top = y;
        if (x < left) left = x;
      }
    }
  }
  if (top === height) return null;
  return { left: (left / width) * 100, top: (top / height) * 100 };
}

const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Draws each letter's outline via stroke-dashoffset. Every letter gets its
 * own measured length, so they all start and finish on the same frame:
 * draw in → hold → the line's tail chases it out along the same path → rest.
 */
function SvgPathDrawingTextAnimation({
  text,
  greeting,
  fromColor = "#f093fb",
  toColor = "#f5576c",
  strokeWidth = 2,
  durationSec = 3.2,
  holdSec = 0,
  restSec = 0.5,
  loop = true,
  viewBoxWidth = 800,
  viewBoxHeight = 160,
  fontSize = 88,
  className,
}: SvgPathDrawingTextAnimationProps) {
  const reactId = useId().replace(/:/g, "");
  const gradientId = `pathGradient-${reactId}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const letterRefs = useRef<Array<SVGTextElement | null>>([]);
  const hoverRef = useRef(false);
  const [letters, setLetters] = useState<Letter[] | null>(null);
  const [span, setSpan] = useState<{ start: number; end: number } | null>(null);
  const [dashLengths, setDashLengths] = useState<number[] | null>(null);
  const [glyphBox, setGlyphBox] = useState<{ left: number; top: number } | null>(null);
  // Measuring can be slow (CPU-limited browsers such as Opera GX) or never finish;
  // after a short wait the finished name is shown statically instead of nothing.
  const [staticFallback, setStaticFallback] = useState(false);
  const shownStaticRef = useRef(false);
  const reduceMotion = useReducedMotion();
  // WebKit counts dash lengths in device pixels; see src/lib/svg-text-dash.ts.
  const dashScale = useSvgTextDashScale(svgRef);
  const dashScaleRef = useRef(dashScale);
  useEffect(() => {
    dashScaleRef.current = dashScale;
  }, [dashScale]);
  const display = text.trim();
  const baselineY = viewBoxHeight / 2 + fontSize * 0.358;

  useEffect(() => {
    const timer = window.setTimeout(() => setStaticFallback(true), STATIC_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // 1. Split the centred word into letters at their exact rendered x positions.
  useEffect(() => {
    if (!display) return;
    let cancelled = false;
    const split = async () => {
      // Positions and outline lengths are only right in the wordmark font itself.
      await document.fonts.load(`bold ${fontSize}px ${WORDMARK_FONT_FAMILY}`).catch(() => undefined);
      await document.fonts.ready;
      const el = measureRef.current;
      if (!el || cancelled) return;
      const chars = Array.from(display);
      if (el.getNumberOfChars() !== chars.length) return;
      const next = chars
        .map((char, index) => ({ char, x: el.getStartPositionOfChar(index).x }))
        .filter((letter) => letter.char.trim().length > 0);
      setLetters(next);
      setSpan({
        start: el.getStartPositionOfChar(0).x,
        end: el.getEndPositionOfChar(chars.length - 1).x,
      });
    };
    void split();
    return () => {
      cancelled = true;
    };
  }, [display, fontSize, viewBoxWidth, viewBoxHeight]);

  // 2. Measure every letter's outline length, plus the greeting anchor.
  useEffect(() => {
    if (!letters) return;
    let cancelled = false;
    const measure = async () => {
      // One frame first, so the split letters are on screen before the canvas work.
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      if (cancelled) return;
      const box: LetterBox = {
        width: viewBoxWidth,
        height: viewBoxHeight,
        font: `bold ${fontSize}px ${WORDMARK_FONT_FAMILY}`,
        baselineY,
        strokeWidth,
      };

      if (greeting) {
        const corner = measureInkCorner(box, letters);
        if (corner) setGlyphBox(corner);
      }

      if (reduceMotion) return;
      const lengths = letters.map((letter) => {
        try {
          return measureLetterDashLength(box, letter);
        } catch {
          return fontSize * 4;
        }
      });
      if (cancelled) return;
      setDashLengths(lengths);
    };
    void measure();
    return () => {
      cancelled = true;
    };
  }, [letters, greeting, reduceMotion, fontSize, strokeWidth, viewBoxWidth, viewBoxHeight, baselineY]);

  // 3. One shared timeline drives every letter.
  useEffect(() => {
    const els = letterRefs.current;
    if (reduceMotion || !dashLengths) {
      els.forEach((el) => {
        if (!el) return;
        el.style.strokeDasharray = "none";
        el.style.strokeDashoffset = "0";
      });
      return;
    }

    // Dashes are applied on the first frame, not here: if the browser never runs
    // animation frames (throttled or background tab), the letters stay fully drawn.
    // The scale follows the rendered size on WebKit, so it is re-applied whenever
    // it changes instead of restarting the animation on every resize.
    let dashedScale = 0;
    const applyDashes = (scale: number) => {
      // Gap twice the dash, so "empty" (offset ±L) never shows a stray segment.
      dashLengths.forEach((length, index) => {
        const el = els[index];
        if (el) el.style.strokeDasharray = `${length * scale} ${length * scale * 2}`;
      });
      dashedScale = scale;
    };

    const drawMs = Math.max(0.4, durationSec) * 1000;
    const holdMs = Math.max(0, holdSec) * 1000;
    const restMs = Math.max(0, restSec) * 1000;
    const cycleMs = drawMs * 2 + holdMs + restMs;
    // Own clock instead of wall time, so hovering can stop it and leaving resumes
    // from the same frame. If the finished name is already on screen (static
    // fallback), start at that frame so the animation picks up without a jump.
    let elapsed = shownStaticRef.current ? drawMs : 0;
    // ...and keep that finished name up a moment, instead of erasing it at once.
    let pauseMs = shownStaticRef.current ? 1200 : 0;
    let last = performance.now();
    let raf = 0;

    /** Earliest moment at or after `at` where the name is fully drawn. */
    const nextFullyDrawn = (at: number) => {
      const t = at % cycleMs;
      if (t >= drawMs && t <= drawMs + holdMs) return at;
      if (t < drawMs) return at - t + drawMs;
      return at - t + cycleMs + drawMs;
    };

    const tick = (now: number) => {
      // Cap only real stalls (tab switches). A low cap would stretch the whole
      // animation on low-frame-rate browsers (e.g. Opera GX's FPS/CPU limiter).
      const dt = Math.min(250, Math.max(0, now - last));
      last = now;
      const scale = dashScaleRef.current;
      if (dashedScale !== scale) applyDashes(scale);
      if (pauseMs > 0) {
        pauseMs -= dt;
        dashLengths.forEach((_, index) => {
          const el = els[index];
          if (el) el.style.strokeDashoffset = "0";
        });
        raf = window.requestAnimationFrame(tick);
        return;
      }
      // While hovered, play on until the outline is complete, then hold that frame.
      elapsed = hoverRef.current
        ? Math.min(elapsed + dt, nextFullyDrawn(elapsed))
        : elapsed + dt;

      if (!loop && elapsed >= drawMs) {
        els.forEach((el) => {
          if (el) el.style.strokeDashoffset = "0";
        });
        return;
      }

      const t = elapsed % cycleMs;
      // Fraction of each letter's length to shift: 1 = empty before, 0 = full, -1 = chased out.
      let shift: number;
      if (t < drawMs) shift = 1 - easeInOut(t / drawMs);
      else if (t < drawMs + holdMs) shift = 0;
      else if (t < drawMs * 2 + holdMs) shift = -easeInOut((t - drawMs - holdMs) / drawMs);
      else shift = -1;

      dashLengths.forEach((length, index) => {
        const el = els[index];
        if (el) el.style.strokeDashoffset = String(length * scale * shift);
      });
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [dashLengths, durationSec, holdSec, restSec, loop, reduceMotion]);

  useEffect(() => {
    if (staticFallback && !dashLengths) shownStaticRef.current = true;
  }, [staticFallback, dashLengths]);

  if (!display) return null;

  const ready = Boolean(reduceMotion) || dashLengths !== null || staticFallback;

  const textProps = {
    y: baselineY,
    fill: "none",
    stroke: `url(#${gradientId})`,
    strokeWidth,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    fontSize,
    fontWeight: "bold",
    // One font everywhere, with clean outlines: see src/lib/fonts.ts.
    fontFamily: WORDMARK_FONT_FAMILY,
    letterSpacing: "0.02em",
  };

  return (
    <div
      className={cn(
        "flex min-h-[200px] w-full items-center justify-center",
        className,
      )}
    >
      <div className="relative w-full">
        {greeting && glyphBox ? (
          <p
            className="absolute -translate-y-full whitespace-nowrap pb-1 text-left text-base text-white sm:pb-2 sm:text-xl md:text-2xl"
            style={{ left: `${glyphBox.left}%`, top: `${glyphBox.top}%` }}
          >
            {greeting}
          </p>
        ) : null}
        <svg
          ref={svgRef}
          // Same aspect as the viewBox: no letterboxing, so the greeting's % position lines up.
          width={viewBoxWidth}
          height={viewBoxHeight}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="h-auto w-full max-w-full"
          role="img"
          aria-label={display}
          style={{ visibility: ready ? "visible" : "hidden" }}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") hoverRef.current = true;
          }}
          onPointerLeave={() => {
            hoverRef.current = false;
          }}
        >
          <defs>
            {/* One gradient across the whole word, not restarted per letter. */}
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1={span?.start ?? 0}
              y1={0}
              x2={span?.end ?? viewBoxWidth}
              y2={0}
            >
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          </defs>

          {/* Measuring copy: gives the per-letter positions, only painted until split. */}
          <text
            ref={measureRef}
            x="50%"
            textAnchor="middle"
            visibility={letters ? "hidden" : "visible"}
            {...textProps}
          >
            {display}
          </text>

          {letters?.map((letter, index) => (
            <text
              key={`${letter.char}-${index}`}
              ref={(el) => {
                letterRefs.current[index] = el;
              }}
              data-letter={index}
              x={letter.x}
              aria-hidden
              {...textProps}
            >
              {letter.char}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

export type PathDrawingPortfolioHeroProps = {
  /** Display name (brand / person) drawn large as an SVG path */
  brand: string;
  /** Small text above the name, e.g. "Hey I'm" */
  greeting?: string;
  /** Short role or tagline under the name */
  tagline?: string;
  /** Small label above the name (e.g. Portfolio) */
  eyebrow?: string;
  /** Gradient start color */
  fromColor?: string;
  /** Gradient end color */
  toColor?: string;
  /** Label of the scroll cue; empty hides the cue */
  scrollLabel?: string;
  /** Where the scroll cue links to */
  scrollHref?: string;
  /** Extra slot (for follow-up sections) */
  children?: ReactNode;
  className?: string;
};

/**
 * Portfolio hero: path-drawn name on loop + soft entrance fade.
 * Transparent background — place it over your own page backdrop.
 */
export default function PathDrawingPortfolioHero({
  brand,
  greeting,
  tagline,
  eyebrow,
  fromColor,
  toColor,
  scrollLabel = "Scroll",
  scrollHref = "#works",
  children,
  className,
}: PathDrawingPortfolioHeroProps) {
  const name = brand.trim();

  if (!name) return null;

  return (
    <section
      data-path-drawing-hero
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center",
        "bg-transparent text-white",
        className,
      )}
    >
      <div className="relative z-10 flex w-full max-w-7xl flex-col items-center px-6 pb-24 pt-20 text-center sm:px-10 sm:pb-28">
        {eyebrow ? (
          <p
            className="path-drawing-in mb-6 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-white/55 sm:mb-8 sm:text-xs"
            style={entrance(0.7, 0, "translateY(12px)")}
          >
            {eyebrow}
          </p>
        ) : null}

        <h1 className="sr-only">{greeting ? `${greeting} ${name}` : name}</h1>
        <div className="path-drawing-in w-full" style={entrance(0.9, 0.12, "scale(0.985)")}>
          <SvgPathDrawingTextAnimation
            text={name}
            {...(greeting ? { greeting } : {})}
            {...(fromColor ? { fromColor } : {})}
            {...(toColor ? { toColor } : {})}
            className="w-full min-h-[120px] sm:min-h-[200px] md:min-h-[260px]"
            // Tight viewBox around the glyphs so the name fills most of the width.
            fontSize={name.length > 12 ? 72 : name.length > 8 ? 96 : 148}
            viewBoxWidth={name.length > 8 ? 1100 : Math.max(420, name.length * 118)}
            viewBoxHeight={name.length > 8 ? 200 : 130}
            strokeWidth={name.length > 8 ? 2.4 : 1.4}
            loop
          />
        </div>

        {tagline ? (
          <p
            className="path-drawing-in mt-4 max-w-md text-sm leading-relaxed text-white/65 sm:mt-6 sm:text-base"
            style={entrance(0.75, 0.55, "translateY(16px)")}
          >
            {tagline}
          </p>
        ) : null}
      </div>

      {scrollLabel ? (
        <a
          href={scrollHref}
          aria-label={scrollLabel}
          className="path-drawing-in absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40 transition-colors hover:text-white/70"
          style={entrance(0.6, 1.1)}
        >
          <span className="text-[0.65rem] uppercase tracking-[0.28em]">{scrollLabel}</span>
          <span
            aria-hidden
            className="path-drawing-scroll-cue block h-8 w-px origin-top bg-gradient-to-b from-white/55 to-transparent"
          />
        </a>
      ) : null}

      {children}
      <style>{`
        @keyframes path-drawing-in {
          from { opacity: 0; transform: var(--path-drawing-from, none); }
        }
        [data-path-drawing-hero] .path-drawing-in {
          animation: path-drawing-in var(--path-drawing-duration, 0.7s)
            cubic-bezier(0.22, 1, 0.36, 1) var(--path-drawing-delay, 0s) both;
        }
        @keyframes path-drawing-scroll-cue {
          0%, 100% { transform: scaleY(1); opacity: 0.55; }
          50% { transform: scaleY(0.55); opacity: 0.2; }
        }
        [data-path-drawing-hero] .path-drawing-scroll-cue {
          animation: path-drawing-scroll-cue 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-path-drawing-hero] .path-drawing-in {
            animation: none;
          }
          [data-path-drawing-hero] .path-drawing-scroll-cue {
            animation: none;
            opacity: 0.45;
          }
        }
      `}</style>
    </section>
  );
}
