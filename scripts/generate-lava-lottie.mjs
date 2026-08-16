// Builds a Skottie scene of a side-view Minecraft lava block.
// The square face is the official still-lava strip, played as a flipbook
// so the surface keeps boiling. Transparent background.
//
//   public/projects/lava/scene-1
//
// Usage:
//   node scripts/generate-lava-lottie.mjs [--skin=<png>]
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANVAS,
  FPS,
  frameCount,
  loadLavaStrip,
  lottieShapesFromRuns,
  parseArgs,
  runsOf,
} from "./lib/lava-block.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function shapeLayer({ ind, name, ip, op, shapes }) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
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
    ip,
    op,
    st: ip,
    bm: 0,
  };
}

const args = parseArgs(process.argv.slice(2));
const strip = await loadLavaStrip(args.get("skin"));
const n = frameCount(strip);
const frames = Array.from({ length: n }, (_, i) => ({
  id: `boil-${i}`,
  shapes: lottieShapesFromRuns(runsOf(strip, i)),
}));

const layers = frames.map((frame, i) =>
  shapeLayer({
    ind: frames.length - i,
    name: frame.id,
    ip: i,
    op: i + 1,
    shapes: frame.shapes,
  }),
);

const lottie = {
  v: "5.7.0",
  fr: FPS,
  ip: 0,
  op: n,
  w: CANVAS.w,
  h: CANVAS.h,
  nm: "Lava — Boil",
  ddd: 0,
  assets: [],
  layers,
  meta: { loop: true, g: "scripts/generate-lava-lottie.mjs" },
};

const dir = resolve(ROOT, "public/projects/lava/scene-1");
await mkdir(dir, { recursive: true });
for (const name of await readdir(dir).catch(() => [])) {
  if (name.endsWith(".svg")) await rm(resolve(dir, name));
}
await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie) + "\n");
const kb = (Buffer.byteLength(JSON.stringify(lottie)) / 1024).toFixed(1);
console.log(`public/projects/lava/scene-1  ${lottie.nm}  ${n} frames  ${n} ticks @ ${FPS} fps  ${kb} kB`);
