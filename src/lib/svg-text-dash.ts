"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * How long a dash on a stroked SVG <text> is, in the engine's eyes.
 *
 * Chromium and Firefox measure `stroke-dasharray` on text in the SVG's own
 * units, so a length measured there is the length to use. WebKit measures it in
 * device pixels instead: the same number covers less of the letter the bigger
 * the name is drawn and the denser the screen, which is why the outlines on an
 * iPhone started and stopped in the wrong place. Multiplying by the element's
 * device scale puts both engines back in agreement.
 *
 * Which engine does which is measured, not guessed from the browser name: the
 * quirk shows up inside an SVG image too, so rendering one test letter at two
 * sizes tells us whether the dash follows the scale.
 */

let probe: Promise<boolean> | null = null;

const testSvg = (dash: number, size: number) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">` +
      `<text x="10" y="80" font-size="90" font-weight="bold" font-family="Arial, Helvetica, sans-serif"` +
      ` fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="${dash} 100000" stroke-dashoffset="0">I</text></svg>`,
  )}`;

async function inkAt(dash: number, size: number): Promise<number> {
  const image = new Image();
  image.src = testSvg(dash, size);
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  let n = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! > 12) n += 1;
  }
  return n;
}

/** Same dash, twice the size: a fraction that halves means device pixels. */
async function runProbe(): Promise<boolean> {
  const [small, smallFull, large, largeFull] = await Promise.all([
    inkAt(60, 100),
    inkAt(100000, 100),
    inkAt(60, 200),
    inkAt(100000, 200),
  ]);
  if (smallFull <= 0 || largeFull <= 0) return false;
  return large / largeFull < (small / smallFull) * 0.75;
}

function dashScaleOf(svg: SVGSVGElement): number {
  const ctm = svg.getScreenCTM();
  const unitsToCssPixels = ctm && ctm.a ? Math.abs(ctm.a) : 1;
  return Math.max(0.01, unitsToCssPixels * (window.devicePixelRatio || 1));
}

/**
 * Multiplier to turn outline lengths measured in SVG units into the numbers this
 * engine wants for `stroke-dasharray` on the given <svg>. 1 everywhere except
 * WebKit; it follows the element's size, so it is kept up to date on resize.
 */
export function useSvgTextDashScale(ref: RefObject<SVGSVGElement | null>): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let cancelled = false;
    let deviceUnits = false;

    const update = () => {
      const svg = ref.current;
      if (cancelled || !svg) return;
      setScale(deviceUnits ? dashScaleOf(svg) : 1);
    };

    void probeOnce().then((result) => {
      if (cancelled) return;
      deviceUnits = result;
      update();
    });

    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    if (ref.current) observer.observe(ref.current);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [ref]);

  return scale;
}

function probeOnce(): Promise<boolean> {
  if (!probe) {
    probe = runProbe().catch(() => false);
  }
  return probe;
}
