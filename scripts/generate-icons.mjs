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
console.log("Done.");
