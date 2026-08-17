// Skeleton: side-view SVG, walk sprites, and three Skottie loops
// (idle, walk, draw bow).
//
// Usage: node scripts/generate-skeleton.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSkeletonSkin, parseArgs } from "./lib/steve-model.mjs";
import { SKELETON_MODEL } from "./lib/skeleton-model.mjs";
import {
  DRAW_FRAMES,
  SPRITE,
  TOLERANCE,
  WALK_FRAMES,
  catalog,
  drawFrame,
  idleA,
  sampleIdle,
  walkFrame,
} from "./lib/skeleton-poses.mjs";
import { ROOT, bake, flipbook, writeHeroSvg, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = SKELETON_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadSkeletonSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 skeleton texture");

const hero = resolve(__dirname, "../assets/skeleton-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-skeleton.mjs",
  out: hero,
  title: "Skeleton, side view",
  desc: "Voxel skeleton facing right with the head turned 45 degrees so both eye sockets stay readable.",
  groupId: "skeleton",
  skin,
  pose: idleA(),
  tolerance: TOLERANCE,
  model,
  canvas: { w: 512, h: 520, pad: 18 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({ skin, pose: entry.pose, canvas: SPRITE, tolerance: TOLERANCE, model });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-skeleton.mjs",
  groupId: "skeleton",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/skeleton-sprites"),
  stillPath: resolve(__dirname, "../assets/skeleton-walk.svg"),
  stillLabel: "Skeleton, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

const idle = Array.from({ length: 8 }, (_, i) => {
  const baked = bake({ skin, pose: sampleIdle(i / 8), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `idle-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/skeleton/scene-1"),
  flipbook({
    name: "Skeleton — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-skeleton.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/skeleton/scene-2"),
  flipbook({
    name: "Skeleton — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-skeleton.mjs",
  }),
);

const draw = Array.from({ length: DRAW_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: drawFrame(i / DRAW_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `draw-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/skeleton/scene-3"),
  flipbook({
    name: "Skeleton — Draw bow",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: draw,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-skeleton.mjs",
  }),
);
