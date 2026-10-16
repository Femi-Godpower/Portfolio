import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Liquid glass card with a light streak sweeping across it. From the
 * "glass-shine-card" snippet, whose card CSS was not included: the glass is
 * rebuilt here around its `shine` keyframe (globals.css). Put it over
 * something with detail, or there is nothing to see through.
 */
export function GlassShineCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/60 bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(255,255,255,0.25),0_24px_60px_rgba(44,43,78,0.2)] backdrop-blur-xl backdrop-saturate-150",
        className,
      )}
      {...props}
    >
      {/* Own clipping layer, so the streak never makes the card scroll. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span className="absolute h-[60%] w-[60%] -translate-y-1/2 rotate-45 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shine_5s_ease-in-out_infinite] motion-reduce:hidden" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
