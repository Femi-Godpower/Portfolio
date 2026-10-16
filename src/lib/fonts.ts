import { Public_Sans } from "next/font/google";

/**
 * The face of the two big outlined names (hero and footer).
 *
 * Only their outline is drawn, so the font must be the same everywhere. Left to
 * the system, Android swapped in Roboto, a variable font whose letters are built
 * from overlapping pieces (an F is a stem plus two separate bars), and every
 * overlap showed as a line through the letter.
 *
 * Two things make Public Sans the pick. Its outlines are single and clean, and
 * every capital's outline starts at the bottom-left corner, exactly where
 * Arial's does. That start is where the drawing begins and ends, so a font that
 * starts elsewhere (Arimo starts somewhere different on every letter) changes
 * the whole animation. At weight 700 it is also Arial's size: 101% of its cap
 * height, 104% of its width. Self-hosted by next/font, not fetched from Google
 * at runtime.
 */
export const wordmarkFont = Public_Sans({
  weight: "700",
  subsets: ["latin"],
  // The names are hidden until measured anyway; never draw them in a fallback.
  display: "block",
});

/** CSS font-family value for the wordmark, fallbacks included. */
export const WORDMARK_FONT_FAMILY = wordmarkFont.style.fontFamily;
