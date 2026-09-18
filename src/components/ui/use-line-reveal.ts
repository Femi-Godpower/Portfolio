"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, type DependencyList, type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Reveals text line by line on scroll — the same masked SplitText animation the
 * case studies use. Mark each element with `data-line-reveal` and give it
 * `opacity-0`; the hook makes it visible once gsap has taken over.
 */
export function useLineReveal(ref: RefObject<HTMLElement | null>, deps: DependencyList = []) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    // `always` keeps the callback running even when reduced motion is off; with
    // only the reduce-motion query, gsap never runs it and the text stays hidden.
    mm.add({ always: "all", reduceMotion: "(prefers-reduced-motion: reduce)" }, (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean };
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-line-reveal]"), { opacity: 1 });

      if (reduceMotion) return;

      q("[data-line-reveal]").forEach((element) => {
        const split = new SplitText(element, { type: "lines", mask: "lines" });
        gsap.from(split.lines, {
          yPercent: 100,
          stagger: 0.08,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    });

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass the content their text depends on
  }, deps);
}
