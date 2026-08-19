// Skeleton: side-view SVG, walk sprites, and Skottie loops
// (idle, walk, draw bow with a real bow, hurt, death).
//
// Usage: node scripts/generate-skeleton.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSkeletonSkin, parseArgs } from "./lib/steve-model.mjs";
import { SKELETON_MODEL } from "./lib/skeleton-model.mjs";
import {
  DRAW_FRAMES,
  DEATH_FRAMES,
  HURT_FRAMES,
  SPRITE,
  TOLERANCE,
  WALK_FRAMES,
  catalog,
  aimFrame,
  drawFrame,
  idleA,
  sampleDeath,
  sampleHurt,
  sampleIdle,
  walkFrame,
} from "./lib/skeleton-poses.mjs";
import { skeletonDrawExtras } from "./lib/held-item.mjs";
import { ROOT, bake, flipbook, writeFrames, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

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

const idleBow = await skeletonDrawExtras(0);
const walkSprites = catalog().map((entry) => {
  const baked = bake({
    skin,
    pose: { ...entry.pose, parts: { ...entry.pose.parts, "held-bow": { pitch: 0, roll: 0, yaw: 0 } } },
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: idleBow,
  });
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

await writeSampledClips({
  generator: "scripts/generate-skeleton.mjs",
  groupId: "skeleton",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/skeleton-sprites"),
  skin,
  tolerance: TOLERANCE,
  model,
  sequences: [
    { prefix: "idle", label: "Idle", count: 8, sample: sampleIdle, loop: true, extras: idleBow },
    { prefix: "hurt", label: "Hurt", count: HURT_FRAMES, sample: sampleHurt },
    { prefix: "death", label: "Death", count: DEATH_FRAMES, sample: sampleDeath },
  ],
});
console.log(`Wrote 8 idle, ${HURT_FRAMES} hurt, and ${DEATH_FRAMES} death frames`);

const drawSprites = [];
for (let i = 0; i < DRAW_FRAMES; i++) {
  const pose = aimFrame(i / Math.max(1, DRAW_FRAMES - 1));
  const extras = await skeletonDrawExtras(pose.bowPull ?? 0);
  const baked = bake({ skin, pose, canvas: SPRITE, tolerance: TOLERANCE, model, extras });
  drawSprites.push({ id: `draw-${i}`, label: `Draw ${i + 1}/${DRAW_FRAMES}`, ...baked });
}
await writeFrames({
  generator: "scripts/generate-skeleton.mjs",
  groupId: "skeleton",
  sprite: SPRITE,
  frames: drawSprites,
  outDir: resolve(__dirname, "../assets/skeleton-sprites"),
});
console.log(`Wrote ${DRAW_FRAMES} draw frames`);

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

const draw = [];
for (let i = 0; i < DRAW_FRAMES; i++) {
  const pose = drawFrame(i / DRAW_FRAMES);
  const extras = await skeletonDrawExtras(pose.bowPull ?? 0);
  const baked = bake({ skin, pose, canvas: SPRITE, tolerance: TOLERANCE, model, extras });
  draw.push({ id: `draw-${i}`, shapes: baked.shapes });
}
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

const hurt = Array.from({ length: HURT_FRAMES }, (_, i) => {
  const baked = bake({
    skin,
    pose: sampleHurt(i / (HURT_FRAMES - 1)),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
  });
  return { id: `hurt-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/skeleton/scene-4"),
  flipbook({
    name: "Skeleton — Hurt",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: hurt,
    fps: 12,
    hold: 1,
    loop: true,
    generator: "scripts/generate-skeleton.mjs",
  }),
);

const death = Array.from({ length: DEATH_FRAMES }, (_, i) => {
  const baked = bake({
    skin,
    pose: sampleDeath(i / (DEATH_FRAMES - 1)),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
  });
  return { id: `death-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/skeleton/scene-5"),
  flipbook({
    name: "Skeleton — Death",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: death,
    fps: 10,
    hold: 1,
    loop: false,
    generator: "scripts/generate-skeleton.mjs",
  }),
);
