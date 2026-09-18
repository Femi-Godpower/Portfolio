"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, type CSSProperties } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

export interface CaseRevealItem {
  image?: string;
  imageAlt?: string;
  title: string;
  client?: string;
  problem?: string;
  outcome?: string;
}

export interface CaseRevealLabels {
  client: string;
  problem: string;
  outcome: string;
}

export interface HorizontalFeatureRevealProps {
  cases: CaseRevealItem[];
  labels: CaseRevealLabels;
  /** Section id, used as the hero's scroll target. */
  id?: string;
  /** Optional background colour. Default: transparent, so the page-wide gradient shows through. */
  bgColor?: string;
  /** Horizontal parallax travel of each image, in %. */
  imageParallaxRange?: number;
  /** Gap between cards, in vw. */
  cardGap?: number;
}

const DESKTOP_QUERY = "(min-width: 1026px)";

export default function HorizontalFeatureReveal({
  cases,
  labels,
  id = "works",
  bgColor,
  imageParallaxRange = 30,
  cardGap = 15,
}: HorizontalFeatureRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia(section);

    mm.add(
      {
        desktop: DESKTOP_QUERY,
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, reduceMotion } = context.conditions as {
          desktop: boolean;
          reduceMotion: boolean;
        };
        if (!desktop) return;

        const q = gsap.utils.selector(section);
        gsap.set(q("[data-reveal]"), { opacity: 1 });

        const scroll = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        if (reduceMotion) return;

        q("[data-case-card]").forEach((card, index) => {
          // Trigger on the text column, not the card: the card's left edge is the
          // image, so triggering on it played the text animation while the text
          // was still off-screen.
          const text = card.querySelector("[data-case-text]") ?? card;
          // The first card is on screen before the horizontal scroll starts,
          // so it reveals on the vertical approach instead, once it is mostly in view.
          const reveal: ScrollTrigger.Vars = index === 0
            ? { trigger: section, start: "top 15%", toggleActions: "play none none reverse" }
            : {
              trigger: text,
              containerAnimation: scroll,
              start: "left 70%",
              toggleActions: "play none none reverse",
            };

          const number = card.querySelector("[data-case-number]");
          if (number) {
            const split = new SplitText(number, { type: "chars,lines", mask: "lines" });
            gsap.from(split.chars, {
              y: 150,
              rotate: 10,
              stagger: 0.1,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: reveal,
            });
          }

          const title = card.querySelector("[data-case-title]");
          if (title) {
            const split = new SplitText(title, { type: "lines", mask: "lines" });
            gsap.set([title, split.lines], { lineHeight: 1.2 });
            gsap.from(split.lines, {
              yPercent: 100,
              stagger: 0.08,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: reveal,
            });
          }

          card.querySelectorAll("[data-case-body]").forEach((body) => {
            const split = new SplitText(body, { type: "lines", mask: "lines" });
            gsap.from(split.lines, {
              yPercent: 100,
              stagger: 0.08,
              delay: 0.3,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: reveal,
            });
          });

          const image = card.querySelector("[data-case-image]");
          if (image) {
            gsap.fromTo(
              image,
              { xPercent: -imageParallaxRange },
              {
                xPercent: imageParallaxRange,
                ease: "none",
                scrollTrigger: index === 0
                  ? { trigger: section, start: "top top", end: "20% top", scrub: true }
                  : {
                    trigger: card,
                    containerAnimation: scroll,
                    start: "left right",
                    end: "right left",
                    scrub: true,
                  },
              },
            );
          }
        });
      },
    );

    return () => mm.revert();
  }, [cases, imageParallaxRange]);

  if (cases.length === 0) return null;

  // Vertical scroll distance per card sets the horizontal speed: 225vh per card
  // (was 150, the original 600vh for 4), so the cards move 1.5x slower. The extra
  // 75vh covers the run-out space after the last card at the same speed.
  const sectionHeight = `${Math.max(300, cases.length * 225 + 75)}vh`;

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative z-10 w-full text-foreground min-[1026px]:h-(--section-height) max-[1025px]:py-[15%] max-[1025px]:px-[7vw]`}
      style={{
        "--section-height": sectionHeight,
        ...(bgColor ? { backgroundColor: bgColor } : {}),
      } as CSSProperties}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden max-[1025px]:static max-[1025px]:h-fit">
        <div
          ref={trackRef}
          // pr keeps the last card on screen for a moment before the page
          // carries on scrolling down.
          className="flex w-fit flex-nowrap gap-(--card-gap) pl-[5vw] pr-[25vw] max-[1025px]:w-full max-[1025px]:flex-col max-[1025px]:gap-[10vw] max-[1025px]:pl-0 max-[1025px]:pr-0 max-md:gap-[15vw]"
          style={{ "--card-gap": `${cardGap}vw` } as CSSProperties}
        >
          {cases.map((item, index) => (
            <article
              key={index}
              data-case-card
              className="flex h-screen w-[80vw] gap-[5vw] max-[1025px]:h-fit max-[1025px]:w-full max-[1025px]:flex-col-reverse"
            >
              <div className="h-screen w-[40vw] shrink-0 overflow-hidden bg-white/5 max-[1025px]:h-[80vw] max-[1025px]:w-full max-[1025px]:rounded-[2vw] max-md:h-[110vw] max-md:rounded-[4vw]">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- CMS media host is not known to next/image
                  <img
                    src={item.image}
                    alt={item.imageAlt || item.title}
                    data-case-image
                    data-reveal
                    className="h-full w-full scale-[1.6] object-cover opacity-0 max-[1025px]:scale-100 max-[1025px]:opacity-100"
                    width={500}
                    height={1080}
                  />
                ) : (
                  <div
                    aria-hidden
                    className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_30%_20%,rgba(240,147,251,0.18),transparent_60%),radial-gradient(ellipse_at_70%_90%,rgba(245,87,108,0.14),transparent_60%)] text-xs uppercase tracking-[0.35em] text-white/30"
                  >
                    {item.imageAlt || item.title}
                  </div>
                )}
              </div>

              <div data-case-text className="flex w-[60%] flex-col gap-[5vh] pt-[7%] max-[1025px]:w-full max-[1025px]:gap-[4vw] max-md:gap-[7vw] max-md:pt-0">
                <p
                  data-case-number
                  data-reveal
                  className="text-[6em] font-medium leading-none text-muted-foreground opacity-0 max-[1025px]:text-[10vw] max-[1025px]:opacity-100"
                >
                  {String(index + 1).padStart(2, "0")}
                </p>

                <div className="flex h-fit w-full flex-col gap-[4vh] max-md:gap-[7vw]">
                  <h3
                    data-case-title
                    data-reveal
                    className="text-[4em] leading-[1.3] opacity-0 max-[1025px]:text-[7.5vw] max-[1025px]:opacity-100 max-md:text-[9vw]"
                  >
                    {item.title}
                  </h3>

                  <dl className="space-y-[1.5vw] max-[1025px]:text-[2.5vw] max-md:text-[4.2vw]">
                    {[
                      { label: labels.client, value: item.client },
                      { label: labels.problem, value: item.problem },
                      { label: labels.outcome, value: item.outcome },
                    ]
                      .filter((row) => row.value)
                      .map((row) => (
                        <div key={row.label} data-case-body data-reveal className="opacity-0 max-[1025px]:opacity-100">
                          <dt className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{row.label}</dt>
                          <dd className="mt-1">{row.value}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
