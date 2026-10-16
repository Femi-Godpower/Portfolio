"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { tokenize } from "./reveal-text-tokens";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  // !important beats motion's inline opacity, so reduced motion shows the text at once.
  return <motion.span style={{ opacity }} className="motion-reduce:!opacity-100">{word}</motion.span>;
}

/**
 * Text that lights up word by word while it scrolls through the screen. Words
 * wrapped in *asterisks* become the italic crimson accent ("I want to *discover* it all").
 * Put it inside the heading or paragraph that carries the font and size.
 */
export function RevealText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  const words = tokenize(text);

  return (
    <span ref={ref} className="block">
      {words.map(({ word, accent, space }, index) => {
        const reveal = (
          <Word word={word} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]} />
        );
        return (
          <span key={index}>
            {accent ? <em className="italic text-spark-crimson">{reveal}</em> : reveal}
            {space ? " " : null}
          </span>
        );
      })}
    </span>
  );
}
