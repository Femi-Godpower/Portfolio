"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("svg raster failed"));
    img.src = url;
  });
}

/**
 * Rasterises a prepared copy of the SVG (white strokes) and returns its pixels.
 * `prepare` gets the clone and decides which texts are drawn and how.
 */
async function rasterize(
  source: SVGSVGElement,
  prepare: (clone: SVGSVGElement) => void,
  scale: number,
): Promise<{ data: Uint8ClampedArray; width: number; height: number } | null> {
  const clone = source.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  prepare(clone);
  clone.querySelectorAll("text").forEach((text) => {
    text.setAttribute("stroke", "#ffffff");
    text.style.stroke = "#ffffff";
  });

  const vb = source.viewBox.baseVal;
  const w = Math.max(1, Math.round(vb.width || 800));
  const h = Math.max(1, Math.round(vb.height || 160));
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));
  clone.style.visibility = "visible";

  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await loadImage(url);
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, cw, ch);
    return { data: ctx.getImageData(0, 0, cw, ch).data, width: cw, height: ch };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const isInk = (data: Uint8ClampedArray, pixel: number) => data[pixel * 4 + 3]! > 12;

/** Only the letter at `index` stays, with the given dash. */
function isolateLetter(clone: SVGSVGElement, index: number, dash: string) {
  clone.querySelectorAll("text").forEach((text) => {
    if (text.getAttribute("data-letter") !== String(index)) {
      text.remove();
      return;
    }
    text.style.strokeDasharray = dash;
    text.style.strokeDashoffset = "0";
  });
}

async function countLetterInk(source: SVGSVGElement, index: number, dash: string): Promise<number> {
  const raster = await rasterize(source, (clone) => isolateLetter(clone, index, dash), 0.45);
  if (!raster) return 0;
  let n = 0;
  for (let p = 0; p < raster.width * raster.height; p += 1) {
    if (isInk(raster.data, p)) n += 1;
  }
  return n;
}

/** Smallest dash length that renders the same ink as the finished letter. */
async function measureLetterDashLength(svg: SVGSVGElement, index: number): Promise<number> {
  const full = await countLetterInk(svg, index, "none");
  if (full <= 0) {
    throw new Error("empty ink");
  }

  // Strict threshold: a looser one leaves the last few units of the outline undrawn,
  // which shows as a gap where the line should close.
  const covered = async (dash: number) =>
    (await countLetterInk(svg, index, `${dash} 100000`)) >= full * 0.9995;

  let hi = 64;
  while (hi < 24000 && !(await covered(hi))) {
    hi *= 2;
  }

  let lo = 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (await covered(mid)) hi = mid;
    else lo = mid + 1;
  }

  // Small overshoot so the outline always closes; the raster is only 45% scale,
  // so its answer can be a few units short of the true path length.
  return Math.max(1, Math.ceil(lo * 1.03) + 4);
}

/** Top-left corner of the finished letters, as % of the viewBox. */
async function measureInkCorner(source: SVGSVGElement): Promise<{ left: number; top: number } | null> {
  const raster = await rasterize(
    source,
    (clone) => {
      clone.querySelectorAll("text").forEach((text) => {
        if (!text.hasAttribute("data-letter")) {
          text.remove();
          return;
        }
        text.style.strokeDasharray = "none";
        text.style.strokeDashoffset = "0";
      });
    },
    1,
  );
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
  const reduceMotion = useReducedMotion();
  const display = text.trim();
  const baselineY = viewBoxHeight / 2 + fontSize * 0.358;

  // 1. Split the centred word into letters at their exact rendered x positions.
  useEffect(() => {
    if (!display) return;
    let cancelled = false;
    const split = async () => {
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
      const svg = svgRef.current;
      if (!svg) return;

      if (greeting) {
        const corner = await measureInkCorner(svg).catch(() => null);
        if (cancelled) return;
        if (corner) setGlyphBox(corner);
      }

      if (reduceMotion) return;
      const lengths: number[] = [];
      for (let index = 0; index < letters.length; index += 1) {
        const length = await measureLetterDashLength(svg, index).catch(() => fontSize * 4);
        if (cancelled) return;
        lengths.push(length);
      }
      setDashLengths(lengths);
    };
    void measure();
    return () => {
      cancelled = true;
    };
  }, [letters, greeting, reduceMotion, fontSize, strokeWidth]);

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

    // Gap twice the dash, so "empty" (offset ±L) never shows a stray segment.
    dashLengths.forEach((length, index) => {
      const el = els[index];
      if (!el) return;
      el.style.strokeDasharray = `${length} ${length * 2}`;
      el.style.strokeDashoffset = String(length);
    });

    const drawMs = Math.max(0.4, durationSec) * 1000;
    const holdMs = Math.max(0, holdSec) * 1000;
    const restMs = Math.max(0, restSec) * 1000;
    const cycleMs = drawMs * 2 + holdMs + restMs;
    // Own clock instead of wall time, so hovering can stop it and leaving resumes
    // from the same frame.
    let elapsed = 0;
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
      const dt = Math.min(48, now - last);
      last = now;
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
        if (el) el.style.strokeDashoffset = String(length * shift);
      });
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [dashLengths, durationSec, holdSec, restSec, loop, reduceMotion]);

  if (!display) return null;

  const ready = Boolean(reduceMotion) || dashLengths !== null;

  const textProps = {
    y: baselineY,
    fill: "none",
    stroke: `url(#${gradientId})`,
    strokeWidth,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    fontSize,
    fontWeight: "bold",
    fontFamily: "Arial, Helvetica, sans-serif",
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
  const reduceMotion = useReducedMotion();

  if (!name) return null;

  const instant = Boolean(reduceMotion);

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
          <motion.p
            className="mb-6 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-white/55 sm:mb-8 sm:text-xs"
            initial={instant ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {eyebrow}
          </motion.p>
        ) : null}

        <h1 className="sr-only">{greeting ? `${greeting} ${name}` : name}</h1>
        <motion.div
          className="w-full"
          initial={instant ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
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
        </motion.div>

        {tagline ? (
          <motion.p
            className="mt-4 max-w-md text-sm leading-relaxed text-white/65 sm:mt-6 sm:text-base"
            initial={instant ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {tagline}
          </motion.p>
        ) : null}
      </div>

      {scrollLabel ? (
        <motion.a
          href={scrollHref}
          aria-label={scrollLabel}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40 transition-colors hover:text-white/70"
          initial={instant ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <span className="text-[0.65rem] uppercase tracking-[0.28em]">{scrollLabel}</span>
          <span
            aria-hidden
            className="path-drawing-scroll-cue block h-8 w-px origin-top bg-gradient-to-b from-white/55 to-transparent"
          />
        </motion.a>
      ) : null}

      {children}
      <style>{`
        @keyframes path-drawing-scroll-cue {
          0%, 100% { transform: scaleY(1); opacity: 0.55; }
          50% { transform: scaleY(0.55); opacity: 0.2; }
        }
        [data-path-drawing-hero] .path-drawing-scroll-cue {
          animation: path-drawing-scroll-cue 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-path-drawing-hero] .path-drawing-scroll-cue {
            animation: none;
            opacity: 0.45;
          }
        }
      `}</style>
    </section>
  );
}
