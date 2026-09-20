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
  const [ink, setInk] = useState({ left: 0, width: 296, ascent: CAP_HEIGHT });
  const width = ink.width + PAD_X * 2;
  const height = ink.ascent + PAD * 2;
  const baseline = PAD + ink.ascent;

  // Fit the viewBox to the visible letters (not the font's advance widths, which
  // add side bearings), so the word lines up with the footer edges exactly.
  useEffect(() => {
    let cancelled = false;
    const fit = async () => {
      await document.fonts.ready;
      const el = measureRef.current;
      if (!el || cancelled) return;
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      const style = getComputedStyle(el);
      ctx.font = `${style.fontWeight} ${FONT_SIZE}px ${style.fontFamily}`;
      const metrics = ctx.measureText(text.toUpperCase());
      const inkWidth = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
      if (inkWidth > 0) {
        setInk({
          left: metrics.actualBoundingBoxLeft,
          width: inkWidth,
          ascent: metrics.actualBoundingBoxAscent || CAP_HEIGHT,
        });
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
