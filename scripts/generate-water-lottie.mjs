// Builds Skottie scenes of official still-water:
//   public/projects/water/scene-1  one square tile, looping ripple
//   public/projects/water/scene-2  3×3 floor of the same tile, in sync
//
// Scene 2 instances one precomp so every block plays the same frame.
// The official strip wraps, so the floor reads as one continuous surface.
//
// Usage:
//   node scripts/generate-water-lottie.mjs [--skin=<png>]
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FLOOR,
  FPS,
  SINGLE,
  TILE,
  frameCount,
  layoutFloor,
  layoutSingle,
  loadWaterStrip,
  lottieShapesFromRuns,
  parseArgs,
  precompLayer,
  runsOf,
  shapeLayer,
} from "./lib/water-block.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function flipbookLayers(strip, n, box) {
  return Array.from({ length: n }, (_, i) =>
    shapeLayer({
      ind: n - i,
      name: `still-${i}`,
      ip: i,
      op: i + 1,
      shapes: lottieShapesFromRuns(runsOf(strip, i), box),
    }),
  );
}

function writeScene(dir, lottie) {
  return mkdir(dir, { recursive: true }).then(async () => {
    for (const name of await readdir(dir).catch(() => [])) {
      if (name.endsWith(".svg")) await rm(resolve(dir, name));
    }
    await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie) + "\n");
    const kb = (Buffer.byteLength(JSON.stringify(lottie)) / 1024).toFixed(1);
    console.log(`${dir.replace(`${ROOT}/`, "")}  ${lottie.nm}  ${lottie.op} ticks @ ${lottie.fr} fps  ${kb} kB`);
  });
}

const args = parseArgs(process.argv.slice(2));
const strip = await loadWaterStrip(args.get("skin"));
const n = frameCount(strip);

const singleBox = layoutSingle();
const single = {
  v: "5.7.0",
  fr: FPS,
  ip: 0,
  op: n,
  w: SINGLE.w,
  h: SINGLE.h,
  nm: "Water — Still",
  ddd: 0,
  assets: [],
  layers: flipbookLayers(strip, n, singleBox),
  meta: { loop: true, g: "scripts/generate-water-lottie.mjs" },
};

const floor = layoutFloor();
const tilePx = TILE * floor.texel;
const tileBox = { x: 0, y: 0, size: tilePx, texel: floor.texel };
const tiles = floor.tiles.map((tile, i) =>
  precompLayer({
    ind: floor.tiles.length - i,
    name: `tile-${tile.col}-${tile.row}`,
    refId: "water-tile",
    x: tile.x,
    y: tile.y,
    w: tilePx,
    h: tilePx,
    ip: 0,
    op: n,
  }),
);

const tiled = {
  v: "5.7.0",
  fr: FPS,
  ip: 0,
  op: n,
  w: FLOOR.w,
  h: FLOOR.h,
  nm: "Water — Tiles",
  ddd: 0,
  assets: [
    {
      id: "water-tile",
      nm: "Water tile",
      w: tilePx,
      h: tilePx,
      layers: flipbookLayers(strip, n, tileBox),
    },
  ],
  layers: tiles,
  meta: { loop: true, g: "scripts/generate-water-lottie.mjs" },
};

await writeScene(resolve(ROOT, "public/projects/water/scene-1"), single);
await writeScene(resolve(ROOT, "public/projects/water/scene-2"), tiled);
