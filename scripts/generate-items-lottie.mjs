// Static Skottie atlases of official Minecraft item sprites.
//   public/projects/items/scene-1  swords, pickaxes, diamond tools, bow
//   public/projects/items/scene-2  axes, shovels, hoes, extras
//
// Usage:
//   node scripts/generate-items-lottie.mjs
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ATLAS,
  itemPages,
  layoutAtlas,
  loadItem,
  lottieShapesFromRuns,
  runsOf,
} from "./lib/minecraft-items.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const TITLES = ["Items — Tools", "Items — More"];

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
    meta: { loop: false, g: "scripts/generate-items-lottie.mjs" },
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

for (const [index, page] of itemPages().entries()) {
  const atlas = layoutAtlas(page);
  const shapes = [];
  for (const cell of atlas.cells) {
    shapes.push(...lottieShapesFromRuns(runsOf(await loadItem(cell.item.id)), cell));
  }
  const lottie = atlasScene(TITLES[index] ?? `Items — Page ${index + 1}`, shapes);
  await writeScene(resolve(ROOT, `public/projects/items/scene-${index + 1}`), lottie);
}
