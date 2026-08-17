// Static Skottie atlases of official Minecraft block faces.
//   public/projects/blocks/scene-1  terrain and ores
//   public/projects/blocks/scene-2  wood, nether, stone
//   public/projects/blocks/scene-3  interactives: table, furnace, chest, door, TNT
//
// Usage:
//   node scripts/generate-blocks-lottie.mjs
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ATLAS,
  blockPages,
  layoutAtlas,
  loadBlock,
  lottieShapesFromRuns,
  runsOf,
} from "./lib/minecraft-blocks.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const TITLES = ["Blocks — Faces", "Blocks — More", "Blocks — Interact"];

function atlasScene(name, shapes) {
  return {
    v: "5.7.0",
    fr: 1,
    ip: 0,
    op: 1,
    w: ATLAS.w,
    h: ATLAS.h,
    nm: name,
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
}

async function writeScene(dir, lottie) {
  await mkdir(dir, { recursive: true });
  for (const name of await readdir(dir).catch(() => [])) {
    if (name.endsWith(".svg")) await rm(resolve(dir, name));
  }
  await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie) + "\n");
  const kb = (Buffer.byteLength(JSON.stringify(lottie)) / 1024).toFixed(1);
  console.log(`${dir.replace(`${ROOT}/`, "")}  ${lottie.nm}  ${kb} kB`);
}

for (const [index, page] of blockPages().entries()) {
  const atlas = layoutAtlas(page);
  const shapes = [];
  for (const cell of atlas.cells) {
    shapes.push(...lottieShapesFromRuns(runsOf(await loadBlock(cell.block.id)), cell));
  }
  const lottie = atlasScene(TITLES[index] ?? `Blocks — Page ${index + 1}`, shapes);
  await writeScene(resolve(ROOT, `public/projects/blocks/scene-${index + 1}`), lottie);
}
