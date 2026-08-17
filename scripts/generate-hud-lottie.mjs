// Skottie scenes for official Minecraft HUD chrome.
//
//   public/projects/hud/scene-1  icon atlas
//   public/projects/hud/scene-2  survival HUD
//   public/projects/hud/scene-3  hearts take damage
//   public/projects/hud/scene-4  button press
//   public/projects/hud/scene-5  health bar fill
//
// Transparent background — these are UI overlays, not a full-frame card.
//
// Usage:
//   node scripts/generate-hud-lottie.mjs
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadItemTexture } from "./lib/held-item.mjs";
import {
  ATLAS,
  BAR_CANVAS,
  BUTTON_CANVAS,
  HEARTS_CANVAS,
  SURVIVAL,
  composeBar,
  composeButton,
  composeHearts,
  composeSurvival,
  fitSprite,
  flipbookScene,
  itemPixelsFromRgba,
  layoutAtlas,
  layoutCentered,
  loadAtlasSprite,
  lottieShapesFromRuns,
  runsOf,
  staticScene,
} from "./lib/minecraft-hud.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const GEN = "scripts/generate-hud-lottie.mjs";

async function writeScene(dir, lottie) {
  await mkdir(dir, { recursive: true });
  for (const name of await readdir(dir).catch(() => [])) {
    if (name.endsWith(".svg")) await rm(resolve(dir, name));
  }
  await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie) + "\n");
  const kb = (Buffer.byteLength(JSON.stringify(lottie)) / 1024).toFixed(1);
  console.log(`${dir.replace(`${ROOT}/`, "")}  ${lottie.nm}  ${lottie.op} ticks  ${kb} kB`);
}

async function maybeSword() {
  try {
    return itemPixelsFromRgba(await loadItemTexture("diamond_sword.png"));
  } catch {
    return null;
  }
}

const atlas = layoutAtlas();
const atlasShapes = [];
for (const cell of atlas.cells) {
  const src = await loadAtlasSprite(cell);
  const fit = fitSprite(src, cell.cell);
  atlasShapes.push(
    ...lottieShapesFromRuns(runsOf(src), {
      x: cell.cellX + fit.x,
      y: cell.cellY + fit.y,
      texel: fit.texel,
    }),
  );
}
await writeScene(
  resolve(ROOT, "public/projects/hud/scene-1"),
  staticScene({
    name: "HUD — Chrome",
    w: ATLAS.w,
    h: ATLAS.h,
    shapes: atlasShapes,
    generator: GEN,
  }),
);

const sword = await maybeSword();
const survival = await composeSurvival({ item: sword, selected: 0, xp: 0.45, armor: 10 });
await writeScene(
  resolve(ROOT, "public/projects/hud/scene-2"),
  staticScene({
    name: "HUD — Survival",
    w: SURVIVAL.w,
    h: SURVIVAL.h,
    shapes: lottieShapesFromRuns(runsOf(survival), layoutCentered(survival, SURVIVAL)),
    generator: GEN,
  }),
);

const heartFrames = [];
for (let hp = 20; hp >= 0; hp--) {
  const src = await composeHearts(hp, 20, { flashIndex: hp < 20 ? Math.floor(hp / 2) : -1 });
  heartFrames.push({
    id: `hearts-${hp}`,
    shapes: lottieShapesFromRuns(runsOf(src), layoutCentered(src, HEARTS_CANVAS)),
  });
}
await writeScene(
  resolve(ROOT, "public/projects/hud/scene-3"),
  flipbookScene({
    name: "HUD — Hearts",
    w: HEARTS_CANVAS.w,
    h: HEARTS_CANVAS.h,
    frames: heartFrames,
    fps: 8,
    hold: 1,
    loop: true,
    generator: GEN,
  }),
);

const buttonFrames = [];
for (const [state, hold] of [
  ["idle", 10],
  ["hover", 8],
  ["pressed", 10],
  ["hover", 6],
  ["idle", 10],
]) {
  const src = await composeButton({ state });
  buttonFrames.push({
    id: `button-${state}-${hold}`,
    hold,
    shapes: lottieShapesFromRuns(runsOf(src), layoutCentered(src, BUTTON_CANVAS)),
  });
}
await writeScene(
  resolve(ROOT, "public/projects/hud/scene-4"),
  flipbookScene({
    name: "HUD — Button",
    w: BUTTON_CANVAS.w,
    h: BUTTON_CANVAS.h,
    frames: buttonFrames,
    fps: 12,
    loop: true,
    generator: GEN,
  }),
);

const barFrames = [];
for (let i = 0; i <= 10; i++) {
  const src = await composeBar({ fill: i / 10, kind: "health" });
  barFrames.push({
    id: `bar-${i}`,
    shapes: lottieShapesFromRuns(runsOf(src), layoutCentered(src, BAR_CANVAS)),
  });
}
await writeScene(
  resolve(ROOT, "public/projects/hud/scene-5"),
  flipbookScene({
    name: "HUD — Health bar",
    w: BAR_CANVAS.w,
    h: BAR_CANVAS.h,
    frames: barFrames,
    fps: 10,
    hold: 2,
    loop: true,
    generator: GEN,
  }),
);
