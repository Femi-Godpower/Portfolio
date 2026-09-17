"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

export interface ApproachStep {
  title: string;
  description?: string;
}

export interface ApproachSectionProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  steps: ApproachStep[];
}

/** Delay between letters of the heading, in ms. */
const LETTER_STAGGER = 22;

const STYLES = `
  @keyframes approach-letter-in {
    0% { opacity: 0; transform: translate3d(0, 0.55em, 0); filter: blur(8px); }
    100% { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
  }
  @keyframes approach-card-in {
    0% { opacity: 0; transform: translate3d(0, 28px, 0) scale(0.97); filter: blur(12px); }
    60% { filter: blur(0); }
    100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
  }
  .approach-letter,
  .approach-fade,
  .approach-card {
    opacity: 0;
  }
  [data-visible="true"] .approach-letter {
    animation: approach-letter-in 600ms cubic-bezier(0.22, 0.68, 0, 1) forwards;
    animation-delay: var(--approach-delay, 0ms);
  }
  [data-visible="true"] .approach-fade {
    animation: approach-letter-in 700ms cubic-bezier(0.22, 0.68, 0, 1) forwards;
    animation-delay: var(--approach-delay, 0ms);
  }
  [data-visible="true"] .approach-card {
    animation: approach-card-in 760ms cubic-bezier(0.22, 0.68, 0, 1) forwards;
    animation-delay: var(--approach-delay, 0ms);
  }
  @media (prefers-reduced-motion: reduce) {
    .approach-letter,
    .approach-fade,
    .approach-card,
    [data-visible="true"] .approach-letter,
    [data-visible="true"] .approach-fade,
    [data-visible="true"] .approach-card {
      animation: none;
      opacity: 1;
    }
  }
`;

/** Heading whose letters rise in one after another; words never break mid-letter. */
function LetterHeading({ text }: { text: string }) {
  let letterIndex = 0;
  const words = text.split(" ");

  return (
    <h2
      aria-label={text}
      className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} aria-hidden className="inline-block whitespace-nowrap">
          {Array.from(word).map((char) => {
            const delay = letterIndex * LETTER_STAGGER;
            letterIndex += 1;
            return (
              <span
                key={`${char}-${delay}`}
                className="approach-letter inline-block"
                style={{ "--approach-delay": `${delay}ms` } as CSSProperties}
              >
                {char}
              </span>
            );
          })}
          {wordIndex < words.length - 1 ? " " : null}
        </span>
      ))}
    </h2>
  );
}

function StepCard({ step, index }: { step: ApproachStep; index: number }) {
  const cardRef = useRef<HTMLElement>(null);

  const setGlow = (event: MouseEvent<HTMLElement>) => {
    const target = cardRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--approach-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--approach-y", `${event.clientY - rect.top}px`);
  };

  const clearGlow = () => {
    const target = cardRef.current;
    if (!target) return;
    target.style.removeProperty("--approach-x");
    target.style.removeProperty("--approach-y");
  };

  return (
    <article
      ref={cardRef}
      className="approach-card group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-6 transition-colors duration-500 hover:border-[#f093fb]/35 sm:p-8"
      style={{ "--approach-delay": `${400 + index * 90}ms` } as CSSProperties}
      onMouseMove={setGlow}
      onMouseLeave={clearGlow}
    >
      <div className="relative flex flex-col gap-4">
        <span className="inline-flex w-fit items-center rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium tracking-[0.3em] text-white/60">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-xl font-semibold leading-tight text-white sm:text-2xl">{step.title}</h3>
        {step.description ? (
          <p className="text-sm leading-relaxed text-white/60 sm:text-base">{step.description}</p>
        ) : null}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(200px circle at var(--approach-x, 50%) var(--approach-y, 50%), rgba(240, 147, 251, 0.16), transparent 68%)",
        }}
      />
    </article>
  );
}

/**
 * Approach section: eyebrow, letter-animated heading, intro and numbered step
 * cards. Transparent, so the page-wide gradient shows through.
 */
export default function ApproachSection({ eyebrow, heading, intro, steps }: ApproachSectionProps) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const headingDuration = Array.from(heading.replace(/\s/g, "")).length * LETTER_STAGGER;

  return (
    <section
      ref={sectionRef}
      data-visible={visible}
      className="relative mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-24 text-white sm:px-14 md:gap-20 md:py-32"
    >
      <style>{STYLES}</style>

      <header className="flex flex-col gap-6">
        {eyebrow ? (
          <div className="approach-fade inline-flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-white/80">
            <span className="h-1 w-14 rounded-full bg-gradient-to-r from-[#f093fb] to-[#f5576c]" />
            {eyebrow}
          </div>
        ) : null}
        <LetterHeading text={heading} />
        {intro ? (
          <p
            className="approach-fade max-w-2xl text-base leading-relaxed text-white/60 md:text-lg"
            style={{ "--approach-delay": `${Math.min(headingDuration, 900)}ms` } as CSSProperties}
          >
            {intro}
          </p>
        ) : null}
      </header>

      {steps.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-8">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
