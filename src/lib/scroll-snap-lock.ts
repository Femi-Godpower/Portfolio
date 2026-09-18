/**
 * Shared guard between the menu/footer anchor links and the footer's snap.
 *
 * A smooth anchor scroll is a downward scroll like any other, so the footer's
 * "glide once I peek in" would hijack it and skip the section the link points
 * at. Anchor links lock the snap for the length of their scroll.
 */

let lockedUntil = 0;

export const lockFooterSnap = (durationMs = 1200): void => {
  lockedUntil = Date.now() + durationMs;
};

export const isFooterSnapLocked = (): boolean => Date.now() < lockedUntil;
