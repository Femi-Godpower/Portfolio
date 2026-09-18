"use client";

import { useRef } from "react";

import { useLineReveal } from "@/components/ui/use-line-reveal";

export interface AboutSectionProps {
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  availability?: string;
  /** Section id, used as the menu/footer anchor. */
  id?: string;
}

/**
 * About section: eyebrow, heading, the story and the contact details beside it.
 * Heading, paragraphs and contact lines reveal line by line on scroll; the
 * eyebrow is there from the start.
 */
export default function AboutSection({
  eyebrow,
  heading,
  paragraphs,
  name,
  phone,
  email,
  location,
  availability,
  id = "about",
}: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useLineReveal(sectionRef, [heading, paragraphs]);

  const contactItems = [
    name ? { key: "name", content: name } : null,
    phone ? { key: "phone", content: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` } : null,
    email ? { key: "email", content: email, href: `mailto:${email}` } : null,
    location ? { key: "location", content: location } : null,
  ].filter((item): item is { key: string; content: string; href?: string } => item !== null);

  return (
    // Fills the screen, so the footer cannot peek in and snap away while this
    // section is being read.
    <section
      ref={sectionRef}
      id={id}
      className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-14 px-6 py-24 text-white sm:px-14 md:gap-20 md:py-32"
    >
      <header className="flex flex-col gap-6">
        {eyebrow ? (
          <div className="inline-flex w-fit items-center text-xs uppercase tracking-[0.4em] text-white/80">
            {eyebrow}
          </div>
        ) : null}
        {heading ? (
          <h2
            data-line-reveal
            className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white opacity-0 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {heading}
          </h2>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-16">
        <div className="flex flex-col gap-8">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              data-line-reveal
                className="text-lg leading-relaxed text-white/80 opacity-0 md:text-xl"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {contactItems.length > 0 || availability ? (
          <aside className="flex flex-col gap-6">
            {contactItems.map((item) => (
              <div key={item.key} data-line-reveal className="text-lg text-white opacity-0 md:text-xl">
                {item.href ? (
                  <a href={item.href} className="transition-colors duration-300 hover:text-[#f093fb]">
                    {item.content}
                  </a>
                ) : (
                  item.content
                )}
              </div>
            ))}
            {availability ? (
              <p
                data-line-reveal
                    className="max-w-xs text-sm leading-relaxed text-white/60 opacity-0"
              >
                {availability}
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
