/**
 * Converts the webp brand logos to PNG so pdf-lib can embed them in the
 * generated calendar PDF (pdf-lib supports PNG, not webp). The outputs are
 * committed assets under public/brand/.
 *
 * Run: npm run convert:logos   (requires the sharp devDependency)
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jobs = [
  { from: "public/brand/headlogon4.webp", to: "public/brand/headlogon4.png" },
  { from: "public/brand/logomobilefoot.webp", to: "public/brand/logomobilefoot.png" },
];

for (const job of jobs) {
  const from = join(root, job.from);
  const to = join(root, job.to);
  const info = await sharp(from).png().toFile(to);
  const meta = await sharp(to).metadata();
  console.log(`${job.from} -> ${job.to}: ${info.size} bytes, ${meta.width}x${meta.height}`);
}
