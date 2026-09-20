"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { motion, useInView } from "motion/react";

import { cn } from "@/lib/utils";

const FONT_SIZE = 72;
// Helvetica/Arial capitals are ~0.72em tall; the viewBox hugs them so the word
// can span the full width without empty bands above or below.
const CAP_HEIGHT = FONT_SIZE * 0.72;
// Padding is only half the outline stroke, so the box hugs the letters on every
// side: they touch the content edges, and spacing above/below is set by the parent.
const PAD = 0.15;
const PAD_X = 0.15;
// A dash on <text> restarts at every glyph outline, so it only has to cover the
// longest single letter, not the whole word. The widest capitals measure ~5.6x
// the font size; this leaves headroom for other fonts.
const DASH = FONT_SIZE * 7;

interface InkBox {
  /** Distance from the anchor to the ink's left edge, positive to the left. */
  left: number;
  width: number;
  ascent: number;
  descent: number;
}

/**
 * The ink box of `text`, found by painting it once and reading the pixels back.
 *
 * measureText's actualBoundingBox* would be the obvious way, but Safari returns
 * the advance box there (left 0, right = the advance width), side bearings and
 * all. The box then hugs the font's spacing instead of the letters, and the word
 * ends up visibly narrower than the column above it. Pixels agree everywhere.
 */
function measureInk(text: string, font: string): InkBox | null {
  const canvas = document.createElement("canvas");
  const probe = canvas.getContext("2d");
  if (!probe) return null;

  probe.font = font;
  const advance = probe.measureText(text).width;
  if (!(advance > 0)) return null;

  // Room for side bearings, overshoot and any descender, whichever way they fall.
  const margin = FONT_SIZE;
  const originX = margin;
  const baselineY = margin + FONT_SIZE;
  canvas.width = Math.ceil(advance) + margin * 2;
  canvas.height = FONT_SIZE * 2 + margin * 2;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font = font;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, originX, baselineY);

  const { width: w, height: h } = canvas;
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    // Blocked canvas readback: keep whatever the box already had.
    return null;
  }

  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3]! > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;

  return {
    left: originX - minX,
    width: maxX - minX + 1,
    ascent: baselineY - minY,
    descent: Math.max(0, maxY - baselineY + 1),
  };
}

/** Big outlined word; a pink → red gradient follows the cursor over it. */
export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  className?: string;
}) => {
  const uid = useId().replace(/:/g, "");
  const gradientId = `footerTextGradient-${uid}`;
  const revealId = `footerRevealMask-${uid}`;
  const maskId = `footerTextMask-${uid}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  // Watch the <svg>, not the <text>: whileInView on an SVG child never fired,
  // which left the word stuck at its starting dash offset — outlines with gaps
  // instead of finished letters.
  const inView = useInView(svgRef, { once: true, amount: 0.4 });
  // Once the outline is drawn the dash is dropped entirely, so every letter is
  // guaranteed to close however long its glyph outline turns out to be.
  const [drawn, setDrawn] = useState(false);
  // Ink box of the word: the first letter's left edge to the last letter's right edge.
  const [ink, setInk] = useState({ left: 0, width: 296, ascent: CAP_HEIGHT, descent: 0 });
  const width = ink.width + PAD_X * 2;
  const height = ink.ascent + ink.descent + PAD * 2;
  const baseline = PAD + ink.ascent;

  // Fit the viewBox to the visible letters (not the font's advance widths, which
  // add side bearings), so the word lines up with the footer edges exactly.
  useEffect(() => {
    let cancelled = false;
    const fit = async () => {
      await document.fonts.ready;
      const el = measureRef.current;
      if (!el || cancelled) return;
      const style = getComputedStyle(el);
      const next = measureInk(text.toUpperCase(), `${style.fontWeight} ${FONT_SIZE}px ${style.fontFamily}`);
      if (next && !cancelled) {
        setInk(next);
      }
    };
    void fit();
    return () => {
      cancelled = true;
    };
  }, [text]);

  const trackCursor = (event: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setMaskPosition({
      cx: `${((event.clientX - rect.left) / rect.width) * 100}%`,
      cy: `${((event.clientY - rect.top) / rect.height) * 100}%`,
    });
  };

  const textProps = {
    x: PAD_X + ink.left,
    y: baseline,
    textAnchor: "start" as const,
    fontSize: FONT_SIZE,
    strokeWidth: 0.3,
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={trackCursor}
      // overflow-visible: the box hugs the letters exactly, so the outer half of
      // the stroke (and the miter at every corner) sits right on the viewport
      // edge and would otherwise be shaved off.
      className={cn("block h-auto w-full select-none overflow-visible uppercase", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={width} y2="0">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#f093fb" />
              <stop offset="50%" stopColor="#f78ca0" />
              <stop offset="100%" stopColor="#f5576c" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id={revealId}
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={maskId}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${revealId})`} />
        </mask>
      </defs>
      <text
        ref={measureRef}
        {...textProps}
        className="fill-transparent stroke-white/15 font-[helvetica] font-bold"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        {...textProps}
        className="fill-transparent stroke-[#f093fb99] font-[helvetica] font-bold"
        strokeDasharray={drawn ? "none" : DASH}
        initial={{ strokeDashoffset: DASH }}
        animate={{ strokeDashoffset: inView ? 0 : DASH }}
        transition={{ duration: 4, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (inView) setDrawn(true);
        }}
      >
        {text}
      </motion.text>
      <text
        {...textProps}
        stroke={`url(#${gradientId})`}
        mask={`url(#${maskId})`}
        className="fill-transparent font-[helvetica] font-bold"
      >
        {text}
      </text>
    </svg>
  );
};
