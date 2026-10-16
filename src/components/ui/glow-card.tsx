"use client";

import type { ComponentProps, MouseEvent } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const setGlow = (event: MouseEvent<HTMLDivElement>) => {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  target.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
  target.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
};

/** A Card with a soft crimson glow that follows the mouse, like the approach cards on the portfolio. */
export function GlowCard({ className, children, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card className={cn("relative overflow-hidden", className)} onMouseMove={setGlow} {...props}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255, 45, 75, 0.1), transparent 70%)",
        }}
      />
      {children}
    </Card>
  );
}
