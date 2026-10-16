"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MouseEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

const SPRING = { damping: 15, stiffness: 150 };

/**
 * Tilts its content towards the mouse in 3D, springing back when the mouse
 * leaves. The tilt of the "3d-card" snippet (21st.dev) without its travel-card
 * layout. The parent needs a `perspective`; reduced motion turns it off.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 10.5,
}: {
  children: ReactNode;
  className?: string;
  /** Degrees at the card's edge. */
  maxTilt?: number;
}) {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, SPRING);
  const springY = useSpring(mouseY, SPRING);
  const rotateX = useTransform(springY, [-0.5, 0.5], [`${maxTilt}deg`, `${-maxTilt}deg`]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [`${-maxTilt}deg`, `${maxTilt}deg`]);

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - left) / width - 0.5);
    mouseY.set((event.clientY - top) / height - 0.5);
  };

  const onMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
