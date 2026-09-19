"use client";

import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const CONSTANTS = {
  itemSize: 48,
  /** Distance from the trigger to the items */
  radius: 190,
  openStagger: 0.02,
  closeStagger: 0.07,
};

// The menu lives in the top-right corner, so the items fan out over a quarter
// circle from straight down (90°) to straight left (180°) instead of a full
// circle, which would put half of them off-screen. The first item sits at the
// left end and the last straight below, so the list reads top-left to bottom-right.
const ARC_START = Math.PI;
const ARC_END = Math.PI / 2;

const pointOnArc = (index: number, total: number, radius: number) => {
  const theta = total <= 1 ? ARC_START : ARC_START + ((ARC_END - ARC_START) * index) / (total - 1);
  return { x: radius * Math.cos(theta), y: radius * Math.sin(theta) };
};

const GRADIENT = "linear-gradient(90deg, #f093fb, #f5576c)";

export interface CircleMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  /** Link target. Section links keep the clean page URL and scroll via onSelectItem. */
  href?: string;
  /** Home-page section this item scrolls to, e.g. "works". */
  section?: string;
  /** Without href the item is a button reporting this value via onSelectItem (e.g. a language code) */
  value?: string;
  /** Highlight as current, e.g. the active language */
  active?: boolean;
}

interface MenuItemProps {
  item: CircleMenuItem;
  index: number;
  totalItems: number;
  isOpen: boolean;
  onSelect: (item: CircleMenuItem, event?: MouseEvent<HTMLAnchorElement>) => void;
}

const MenuItem = ({ item, index, totalItems, isOpen, onSelect }: MenuItemProps) => {
  const { x, y } = pointOnArc(index, totalItems, CONSTANTS.radius);
  const [hovering, setHovering] = useState(false);

  const shared = {
    animate: { x: isOpen ? x : 0, y: isOpen ? y : 0, opacity: isOpen ? 1 : 0 },
    whileHover: { scale: 1.1, transition: { duration: 0.1, delay: 0 } },
    transition: {
      delay: isOpen ? index * CONSTANTS.openStagger : index * CONSTANTS.closeStagger,
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
    style: {
      height: CONSTANTS.itemSize - 2,
      width: CONSTANTS.itemSize - 2,
      ...(hovering ? { backgroundImage: GRADIENT } : {}),
    },
    className: cn(
      "absolute flex items-center justify-center rounded-full border backdrop-blur",
      isOpen ? "pointer-events-auto" : "pointer-events-none",
      hovering
        ? "border-transparent text-[#0c0a0f]"
        : item.active
          ? "border-[#f093fb]/60 bg-[#0c0a0f]/80 text-[#f093fb]"
          : "border-white/15 bg-[#0c0a0f]/80 text-white",
    ),
    tabIndex: isOpen ? 0 : -1,
    "aria-hidden": !isOpen || undefined,
    "aria-label": item.label,
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
    onFocus: () => setHovering(true),
    onBlur: () => setHovering(false),
  };

  const content = (
    <>
      {item.icon}
      {hovering && (
        <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-xs text-white">
          {item.label}
        </span>
      )}
    </>
  );

  return item.href ? (
    <motion.a
      {...shared}
      href={item.href}
      onClick={(event) => {
        onSelect(item, event);
      }}
      aria-current={item.active ? "true" : undefined}
    >
      {content}
    </motion.a>
  ) : (
    <motion.button {...shared} type="button" onClick={() => onSelect(item)} aria-pressed={item.active}>
      {content}
    </motion.button>
  );
};

interface MenuTriggerProps {
  isOpen: boolean;
  itemsLength: number;
  onToggle: () => void;
  openIcon: ReactNode;
  closeIcon: ReactNode;
  openLabel: string;
  closeLabel: string;
  animate: ReturnType<typeof useAnimationControls>;
  shake: ReturnType<typeof useAnimationControls>;
}

const MenuTrigger = ({
  isOpen,
  onToggle,
  openIcon,
  closeIcon,
  openLabel,
  closeLabel,
  animate,
  shake,
}: MenuTriggerProps) => (
  <motion.div animate={shake} className="relative z-50">
    <motion.button
      type="button"
      animate={animate}
      style={{ height: CONSTANTS.itemSize, width: CONSTANTS.itemSize }}
      // Neutral: dark glass with a white icon, no brand colour.
      className="flex cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0c0a0f]/70 text-white outline-none ring-0 backdrop-blur transition-colors duration-150 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
      onClick={onToggle}
      aria-label={isOpen ? closeLabel : openLabel}
      aria-expanded={isOpen}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={isOpen ? "menu-close" : "menu-open"}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? closeIcon : openIcon}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  </motion.div>
);

/**
 * Round menu button; the items spring out around it. From the vault note "nav",
 * recoloured to the site palette and anchored for a top-right corner.
 */
export const CircleMenu = ({
  items,
  onSelectItem,
  openLabel,
  closeLabel,
  openIcon = <Menu size={18} />,
  closeIcon = <X size={18} />,
}: {
  items: CircleMenuItem[];
  onSelectItem?: (item: CircleMenuItem, event?: MouseEvent<HTMLAnchorElement>) => void;
  openLabel: string;
  closeLabel: string;
  openIcon?: ReactNode;
  closeIcon?: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const ring = useAnimationControls();
  const trigger = useAnimationControls();
  const shake = useAnimationControls();

  const close = () => {
    if (!isOpen) return;
    setIsOpen(false);

    // The ring of items spins once while they fly back in.
    void (async () => {
      await ring.start({
        rotate: -360,
        filter: "blur(1px)",
        transition: { duration: CONSTANTS.closeStagger * (items.length + 2), ease: "linear" },
      });
      await ring.start({ rotate: 0, filter: "blur(0px)", transition: { duration: 0 } });
    })();

    // The trigger shakes and swells as each item lands, then snaps back.
    void (async () => {
      shake.start({
        translateX: [0, 2, -2, 0, 2, -2, 0],
        transition: { duration: CONSTANTS.closeStagger, ease: "linear", repeat: Infinity, repeatType: "loop" },
      });
      const steps = Math.max(0, items.length - 1);
      for (let i = 0; i < steps; i += 1) {
        const size = Math.min(CONSTANTS.itemSize * (1 + i * 0.15), CONSTANTS.itemSize * 1.5);
        await trigger.start({
          height: size,
          width: size,
          filter: `brightness(${Math.max(1 - i * 0.08, 0.6)})`,
          transition: { duration: CONSTANTS.closeStagger / 2, ease: "linear" },
        });
        if (i !== steps - 1) {
          await new Promise((resolve) => setTimeout(resolve, CONSTANTS.closeStagger * 1000));
        }
      }
      shake.stop();
      shake.start({ translateX: 0, transition: { duration: 0 } });
      trigger.start({
        height: CONSTANTS.itemSize,
        width: CONSTANTS.itemSize,
        filter: "brightness(1)",
        transition: { duration: 0.1, ease: "backInOut" },
      });
    })();
  };

  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  // Close on Escape or a click outside the menu.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      style={{ width: CONSTANTS.itemSize, height: CONSTANTS.itemSize }}
      className="relative flex items-center justify-center"
    >
      <MenuTrigger
        isOpen={isOpen}
        itemsLength={items.length}
        onToggle={() => (isOpen ? close() : setIsOpen(true))}
        openIcon={openIcon}
        closeIcon={closeIcon}
        openLabel={openLabel}
        closeLabel={closeLabel}
        animate={trigger}
        shake={shake}
      />
      <motion.div
        animate={ring}
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      >
        {items.map((item, index) => (
          <MenuItem
            key={item.id}
            item={item}
            index={index}
            totalItems={items.length}
            isOpen={isOpen}
            onSelect={(selected, event) => {
              onSelectItem?.(selected, event);
              close();
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
