import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
// Vlak tot de rand en alles binnen de maskable safe zone: één bron voor alle varianten.
const source = path.join(root, "assets", "vvh-app-icon.svg");

const outputs = [
  { file: "public/icons/favicon-16.png", size: 16 },
  { file: "public/icons/favicon-32.png", size: 32 },
  { file: "public/icons/icon-16.png", size: 16 },
  { file: "public/icons/icon-32.png", size: 32 },
  { file: "public/icons/apple-touch-icon.png", size: 180 },
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/icons/icon-maskable-512.png", size: 512 },
  { file: "app/icon.png", size: 512 },
  { file: "app/apple-icon.png", size: 180 },
];

const svg = await readFile(source);

async function writeIcon(file, size) {
  const out = path.join(root, file);
  await mkdir(path.dirname(out), { recursive: true });
  // Hoge density zodat ook grote formaten scherp gerasterd worden.
  await sharp(svg, { density: Math.max(72, (72 * size) / 512) * 2 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`Wrote ${file} (${size}x${size})`);
}

await Promise.all(outputs.map(({ file, size }) => writeIcon(file, size)));

// iOS-splash screens: zelfde verloop als de icon, beeldmerk gecentreerd.
// Formaten staan in lib/constants/splash-devices.json (ook gebruikt door app/layout.tsx).
const devices = JSON.parse(
  await readFile(path.join(root, "lib/constants/splash-devices.json"), "utf8")
);
const artwork = Buffer.from(
  svg.toString("utf8").replace(/<rect width="512" height="512" fill="url\(#bg\)"\/>/, "")
);

async function writeSplash(width, height) {
  const out = path.join(root, "public/splash", `splash-${width}x${height}.png`);
  const artSize = Math.round(Math.min(width, height) * 0.55);
  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a4a9c"/><stop offset="1" stop-color="#0b2257"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
    </svg>`
  );
  const art = await sharp(artwork, { density: (72 * artSize) / 512 * 2 })
    .resize(artSize, artSize)
    .png()
    .toBuffer();
  await sharp(background)
    .composite([{ input: art, gravity: "centre" }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(out);
}

await mkdir(path.join(root, "public/splash"), { recursive: true });
const splashSizes = new Set();
for (const { width, height, ratio } of devices) {
  splashSizes.add(`${width * ratio}x${height * ratio}`);
  splashSizes.add(`${height * ratio}x${width * ratio}`);
}
await Promise.all(
  [...splashSizes].map((size) => writeSplash(...size.split("x").map(Number)))
);
console.log(`Wrote ${splashSizes.size} splash screens in public/splash`);
console.log("Done.");
