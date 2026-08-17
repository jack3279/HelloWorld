// Static Skottie atlas of official Minecraft block faces.
//   public/projects/blocks/scene-1
//
// Usage:
//   node scripts/generate-blocks-lottie.mjs
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ATLAS,
  BLOCKS,
  layoutAtlas,
  loadBlock,
  lottieShapesFromRuns,
  runsOf,
} from "./lib/minecraft-blocks.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const atlas = layoutAtlas();
const shapes = [];
for (const cell of atlas.cells) {
  const png = await loadBlock(cell.block.id);
  shapes.push(...lottieShapesFromRuns(runsOf(png), cell));
}

const lottie = {
  v: "5.7.0",
  fr: 1,
  ip: 0,
  op: 1,
  w: ATLAS.w,
  h: ATLAS.h,
  nm: "Blocks — Faces",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "atlas",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [0, 0, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes,
      ip: 0,
      op: 1,
      st: 0,
      bm: 0,
    },
  ],
  meta: { loop: false, g: "scripts/generate-blocks-lottie.mjs" },
};

const dir = resolve(ROOT, "public/projects/blocks/scene-1");
await mkdir(dir, { recursive: true });
for (const name of await readdir(dir).catch(() => [])) {
  if (name.endsWith(".svg")) await rm(resolve(dir, name));
}
await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie) + "\n");
const kb = (Buffer.byteLength(JSON.stringify(lottie)) / 1024).toFixed(1);
console.log(`public/projects/blocks/scene-1  ${lottie.nm}  ${BLOCKS.length} faces  ${kb} kB`);
