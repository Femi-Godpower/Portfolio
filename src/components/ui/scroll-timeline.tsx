"use client";

import { useEffect, useRef, useState } from "react";

import { logisticsHeading } from "@/components/ui/logistics";
import { cn } from "@/lib/utils";

export interface Milestone {
  id: string;
  title: string;
  /** Where: company or organisation. */
  place: string;
  description: string;
  date: string;
}

export interface TimelineProps {
  milestones: Milestone[];
}

/**
 * Vertical timeline whose line draws itself as you scroll; each milestone lights
 * up when the line reaches it. Alternates sides on desktop, one column on phones.
 */
export default function ScrollTimeline({ milestones }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      // Progress is how far the middle of the screen has travelled through the list.
      const rect = containerRef.current.getBoundingClientRect();
      const progress = (window.innerHeight / 2 - rect.top) / rect.height;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12" ref={containerRef}>
      <div className="relative">
        <div className="absolute bottom-0 left-4 top-0 w-[2px] -translate-x-1/2 bg-spark-indigo/10 md:left-1/2" />
        <div
          className="absolute left-4 top-0 z-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-spark-indigo via-spark-slate to-spark-crimson transition-all duration-100 ease-out md:left-1/2"
          style={{ height: `${scrollProgress * 100}%` }}
        />

        <ol className="relative z-10 flex flex-col gap-16 md:gap-24">
          {milestones.map((milestone, index) => {
            const itemThreshold = index / (milestones.length - 1 || 1);
            const isActive = scrollProgress >= itemThreshold - 0.05;
            const isEven = index % 2 === 0;

            return (
              <li
                key={milestone.id}
                className={cn("relative flex w-full flex-col items-start md:flex-row", isEven && "md:flex-row-reverse")}
              >
                <div
                  className={cn(
                    "absolute left-4 top-0 z-20 mt-1.5 size-4 -translate-x-1/2 rounded-full border-2 transition-all duration-500 md:left-1/2",
                    isActive
                      ? "scale-125 border-spark-crimson bg-white"
                      : "scale-100 border-spark-indigo/20 bg-spark-indigo/20",
                  )}
                  aria-hidden
                />

                <div className="hidden w-1/2 md:block" />

                <div
                  className={cn(
                    "w-full pl-12 transition-all duration-700 ease-out md:w-1/2 md:pl-0",
                    isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left",
                    isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-30",
                  )}
                >
                  <p className="mb-3 inline-block rounded-full border border-spark-indigo/10 bg-white/70 px-3 py-1 text-xs tracking-widest text-spark-slate">
                    {milestone.date}
                  </p>
                  <h3 className={cn(logisticsHeading, "text-2xl")}>{milestone.title}</h3>
                  {milestone.place ? <p className="mt-1 text-sm text-spark-crimson">{milestone.place}</p> : null}
                  {milestone.description ? (
                    <p className="mt-3 text-base leading-relaxed">{milestone.description}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
