"use client";

import { useEffect, useRef } from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";

import { TextHoverEffect } from "@/components/ui/hover-footer";
import { isFooterSnapLocked } from "@/lib/scroll-snap-lock";

export type SocialPlatform = "linkedin" | "instagram" | "x" | "facebook" | "website";

export interface FooterLinkColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface PortfolioFooterData {
  bigText: string;
  columns: FooterLinkColumn[];
  contactTitle: string;
  email: string;
  phone: string;
  location: string;
  socials: Array<{ platform: SocialPlatform; href: string }>;
  copyright: string;
}

const ACCENT = "text-[#f093fb]";

// lucide-react 1.x ships no brand logos, so these are simple hand-drawn marks.
function SocialIcon({ platform }: { platform: SocialPlatform }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (platform) {
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 10.5V16.5" />
          <circle cx="8" cy="7.5" r="0.6" fill="currentColor" />
          <path d="M12 16.5V10.5M12 13c0-1.7 1-2.6 2.3-2.6s2.2.9 2.2 2.6v3.5" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14.5 21v-8h2.7l.4-3.2h-3.1V7.9c0-.9.3-1.6 1.6-1.6h1.6V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.4H8.6V13h2.7v8" />
        </svg>
      );
    default:
      return <Globe size={20} aria-hidden />;
  }
}

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
  facebook: "Facebook",
  website: "Website",
};

/** Links, contact and socials, with the big name right under the divider. */
function FooterContent({ data }: { data: PortfolioFooterData }) {
  const emailHref = data.email.includes("@") ? `mailto:${data.email.replace(/^\[TEMP\]\s*/, "")}` : undefined;
  const phoneDigits = data.phone.replace(/[^+\d]/g, "");
  const phoneHref = phoneDigits ? `tel:${phoneDigits}` : undefined;
  const hasContact = Boolean(data.email || data.phone || data.location);

  return (
    // At least one full screen, so the section above never peeks in once the footer
    // has snapped into view. justify-end puts any spare height above the links,
    // keeping FEMI close to the bottom edge.
    <div className="relative flex min-h-screen w-full flex-col justify-end overflow-hidden text-white/60">
      <div className="relative z-40 mx-auto w-full max-w-7xl px-6 pt-12 sm:px-14 sm:pt-12">
        <div className="grid grid-cols-1 gap-12 pb-8 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-16">
          {data.columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-6 text-lg font-semibold text-white">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, index) => (
                  <li key={`${link.label}-${index}`}>
                    <a href={link.href} className="transition-colors hover:text-[#f093fb]">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {hasContact ? (
            <div>
              {data.contactTitle ? (
                <h4 className="mb-6 text-lg font-semibold text-white">{data.contactTitle}</h4>
              ) : null}
              <ul className="space-y-4">
                {data.email ? (
                  <li className="flex items-center gap-3">
                    <Mail size={18} className={ACCENT} aria-hidden />
                    <a href={emailHref} className="transition-colors hover:text-[#f093fb]">
                      {data.email}
                    </a>
                  </li>
                ) : null}
                {data.phone ? (
                  <li className="flex items-center gap-3">
                    <Phone size={18} className={ACCENT} aria-hidden />
                    <a href={phoneHref} className="transition-colors hover:text-[#f093fb]">
                      {data.phone}
                    </a>
                  </li>
                ) : null}
                {data.location ? (
                  <li className="flex items-center gap-3">
                    <MapPin size={18} className={ACCENT} aria-hidden />
                    <span>{data.location}</span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <hr className="my-6 border-t border-white/10" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
          {data.socials.length > 0 ? (
            <div className="flex gap-6 text-white/50">
              {data.socials.map((social, index) => (
                <a
                  key={`${social.platform}-${index}`}
                  href={social.href}
                  aria-label={SOCIAL_LABELS[social.platform]}
                  className="transition-colors hover:text-[#f093fb]"
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <SocialIcon platform={social.platform} />
                </a>
              ))}
            </div>
          ) : (
            <span />
          )}
          {data.copyright ? (
            <p className="text-center md:text-left">
              &copy; {new Date().getFullYear()} {data.copyright}
            </p>
          ) : null}
        </div>
      </div>

      {/* Same width as the content above. mt-6 matches the divider-to-icons gap
          (hr my-6); a small bottom padding leaves a little room under the letters. */}
      <div className="relative z-40 mx-auto mt-6 w-full max-w-7xl px-6 pb-6 sm:px-14 sm:pb-8">
        <TextHoverEffect text={data.bigText} />
      </div>
    </div>
  );
}

/**
 * Full-screen footer. Once it peeks in while scrolling down, the page glides
 * the rest of the way so the footer fills the screen.
 */
export default function PortfolioFooter({ data }: { data: PortfolioFooterData }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = ref.current;
    if (!footer) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastY = window.scrollY;
    let gliding = false;
    let timer = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY;
      lastY = y;
      if (gliding || !goingDown || isFooterSnapLocked()) return;

      const top = footer.getBoundingClientRect().top;
      const peeked = top < window.innerHeight * 0.85 && top > 4;
      if (!peeked) return;

      gliding = true;
      window.scrollTo({ top: y + top, behavior: reduceMotion ? "auto" : "smooth" });
      timer = window.setTimeout(() => {
        gliding = false;
        lastY = window.scrollY;
      }, 1000);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    // "contact" is the target of the menu's Contact item.
    <footer ref={ref} id="contact" className="relative w-full">
      <FooterContent data={data} />
    </footer>
  );
}
