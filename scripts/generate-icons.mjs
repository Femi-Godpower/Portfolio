// Regenerates src/app/favicon.ico and src/app/apple-icon.png from src/app/icon.svg.
// Run after editing the SVG: node scripts/generate-icons.mjs
import fs from "node:fs";
import sharp from "sharp";

const svg = fs.readFileSync("src/app/icon.svg");
const render = (size) => sharp(svg, { density: 1000 }).resize(size, size).png().toBuffer();

fs.writeFileSync("src/app/apple-icon.png", await render(180));

// ICO container holding PNG-encoded 16, 32 and 48 px images.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(render));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
fs.writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...images]));

console.log("Wrote src/app/favicon.ico and src/app/apple-icon.png");
