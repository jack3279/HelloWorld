// Skottie scenes for hotbar item icons and world drops.
//   public/projects/items/scene-1  4×4 icon atlas
//   public/projects/items/scene-2  four items drop, bounce, bob
//   public/projects/items/scene-3  diamond sword drops, then flies into the hotbar
//
// Transparent background — icons and overlays, not a full-frame card.
//
// Usage:
//   node scripts/generate-items-lottie.mjs
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ATLAS,
  DROP,
  DROP_LOADOUT,
  HOTBAR_LOADOUT,
  PICKUP,
  centeredItemBox,
  dropPositionKeys,
  dropScaleKeys,
  itemLayer,
  itemPages,
  layoutAtlas,
  loadItem,
  loadItemPixels,
  lottieShapesFromRuns,
  pickupPositionKeys,
  pickupScaleKeys,
  runsOf,
  staticLayer,
} from "./lib/minecraft-items.mjs";
import {
  HOTBAR_CAP,
  HOTBAR_SLOT_H,
  HOTBAR_SLOT_W,
  composeHotbar,
  layoutCentered,
  runsOf as hudRuns,
} from "./lib/minecraft-hud.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const GEN = "scripts/generate-items-lottie.mjs";

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
    layers: [staticLayer({ ind: 1, name: "atlas", shapes, op: 1 })],
    meta: { loop: false, g: GEN },
  };
}

async function writeScene(dir, lottie) {
  await mkdir(dir, { recursive: true });
  for (const name of await readdir(dir).catch(() => [])) {
    if (name.endsWith(".svg")) await rm(resolve(dir, name));
  }
  await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie) + "\n");
  const kb = (Buffer.byteLength(JSON.stringify(lottie)) / 1024).toFixed(1);
  console.log(`${dir.replace(`${ROOT}/`, "")}  ${lottie.nm}  ${lottie.op} ticks  ${kb} kB`);
}

for (const [index, page] of itemPages().entries()) {
  const atlas = layoutAtlas(page);
  const shapes = [];
  for (const cell of atlas.cells) {
    shapes.push(...lottieShapesFromRuns(runsOf(await loadItem(cell.item.id)), cell));
  }
  await writeScene(
    resolve(ROOT, `public/projects/items/scene-${index + 1}`),
    atlasScene(index === 0 ? "Items — Hotbar" : `Items — Page ${index + 1}`, shapes),
  );
}

const dropLayers = [];
const dropXs = [80, 192, 304, 416];
for (const [i, id] of DROP_LOADOUT.entries()) {
  const delay = i * 3;
  const shapes = lottieShapesFromRuns(runsOf(await loadItem(id)), centeredItemBox(DROP.size));
  dropLayers.push(
    itemLayer({
      ind: DROP_LOADOUT.length - i,
      name: id,
      shapes,
      op: DROP.op,
      p: dropPositionKeys({
        x: dropXs[i],
        startY: DROP.startY,
        groundY: DROP.ground,
        delay,
        op: DROP.op,
      }),
      s: dropScaleKeys({ delay, op: DROP.op }),
    }),
  );
}
const ground = {
  ty: "gr",
  nm: "ground",
  it: [
    {
      ty: "rc",
      d: 1,
      p: { a: 0, k: [256, DROP.ground + 18] },
      s: { a: 0, k: [420, 8] },
      r: { a: 0, k: 0 },
    },
    { ty: "fl", o: { a: 0, k: 100 }, c: { a: 0, k: [0.42, 0.3, 0.18, 1] }, r: 1 },
    {
      ty: "tr",
      p: { a: 0, k: [0, 0] },
      a: { a: 0, k: [0, 0] },
      s: { a: 0, k: [100, 100] },
      r: { a: 0, k: 0 },
      o: { a: 0, k: 100 },
    },
  ],
};
await writeScene(resolve(ROOT, "public/projects/items/scene-2"), {
  v: "5.7.0",
  fr: DROP.fr,
  ip: 0,
  op: DROP.op,
  w: DROP.w,
  h: DROP.h,
  nm: "Items — Drop",
  ddd: 0,
  assets: [],
  layers: [...dropLayers, staticLayer({ ind: dropLayers.length + 1, name: "ground", shapes: [ground], op: DROP.op })],
  meta: { loop: true, g: GEN },
});

const kit = [];
for (const id of HOTBAR_LOADOUT) kit.push(await loadItemPixels(id));
const pickupBar = await composeHotbar({
  selected: 0,
  items: kit.map((item, i) => (i === 0 ? null : item)),
});
const barBox = layoutCentered(pickupBar, { w: PICKUP.w, h: PICKUP.h, padX: 24, padY: 16, maxTexel: 3 });
const slotPad = 1;
const slotCenter = {
  x: barBox.x + (slotPad + HOTBAR_CAP + HOTBAR_SLOT_W / 2) * barBox.texel,
  y: barBox.y + (slotPad + HOTBAR_SLOT_H / 2) * barBox.texel,
};
const dropFrom = { x: PICKUP.w / 2, y: 70 };
await writeScene(resolve(ROOT, "public/projects/items/scene-3"), {
  v: "5.7.0",
  fr: PICKUP.fr,
  ip: 0,
  op: PICKUP.op,
  w: PICKUP.w,
  h: PICKUP.h,
  nm: "Items — Pickup",
  ddd: 0,
  assets: [],
  layers: [
    itemLayer({
      ind: 1,
      name: "diamond-sword",
      shapes: lottieShapesFromRuns(runsOf(await loadItem("diamond-sword")), centeredItemBox(72)),
      op: PICKUP.op,
      p: pickupPositionKeys({
        from: [dropFrom.x, dropFrom.y],
        to: [slotCenter.x, slotCenter.y],
      }),
      s: pickupScaleKeys({ end: 48 }),
    }),
    staticLayer({
      ind: 2,
      name: "hotbar",
      shapes: lottieShapesFromRuns(hudRuns(pickupBar), barBox),
      op: PICKUP.op,
    }),
  ],
  meta: { loop: true, g: GEN },
});
