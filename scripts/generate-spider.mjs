// Spider: side-view SVG, crawl sprites, and three Skottie loops
// (idle, walk, rear-up).
//
// Usage: node scripts/generate-spider.mjs [--skin=<tga>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSpiderSkin, parseArgs } from "./lib/steve-model.mjs";
import { SPIDER_MODEL } from "./lib/spider-model.mjs";
import {
  DEATH_FRAMES,
  HURT_FRAMES,
  REAR_FRAMES,
  SPRITE,
  TOLERANCE,
  WALK_FRAMES,
  catalog,
  idleA,
  rearFrame,
  sampleDeath,
  sampleHurt,
  sampleIdle,
  walkFrame,
} from "./lib/spider-poses.mjs";
import { ROOT, bake, flipbook, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = SPIDER_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadSpiderSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 spider texture");

const hero = resolve(__dirname, "../assets/spider-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-spider.mjs",
  out: hero,
  title: "Spider, side view",
  desc: "Voxel spider facing right with the head turned 45 degrees so the red eyes stay readable.",
  groupId: "spider",
  skin,
  pose: idleA(),
  tolerance: TOLERANCE,
  model,
  canvas: { w: 512, h: 400, pad: 16 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({ skin, pose: entry.pose, canvas: SPRITE, tolerance: TOLERANCE, model });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-spider.mjs",
  groupId: "spider",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/spider-sprites"),
  stillPath: resolve(__dirname, "../assets/spider-walk.svg"),
  stillLabel: "Spider, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

await writeSampledClips({
  generator: "scripts/generate-spider.mjs",
  groupId: "spider",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/spider-sprites"),
  skin,
  tolerance: TOLERANCE,
  model,
  sequences: [
    { prefix: "idle", label: "Idle", count: 8, sample: sampleIdle, loop: true },
    { prefix: "hurt", label: "Hurt", count: HURT_FRAMES, sample: sampleHurt },
    { prefix: "death", label: "Death", count: DEATH_FRAMES, sample: sampleDeath },
  ],
});
console.log(`Wrote 8 idle, ${HURT_FRAMES} hurt, and ${DEATH_FRAMES} death frames`);

const idle = Array.from({ length: 8 }, (_, i) => {
  const baked = bake({ skin, pose: sampleIdle(i / 8), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `idle-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/spider/scene-1"),
  flipbook({
    name: "Spider — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-spider.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/spider/scene-2"),
  flipbook({
    name: "Spider — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-spider.mjs",
  }),
);

const rear = Array.from({ length: REAR_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: rearFrame(i / REAR_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `rear-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/spider/scene-3"),
  flipbook({
    name: "Spider — Rear up",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: rear,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-spider.mjs",
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
  resolve(ROOT, "public/projects/spider/scene-4"),
  flipbook({
    name: "Spider — Hurt",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: hurt,
    fps: 12,
    hold: 1,
    loop: true,
    generator: "scripts/generate-spider.mjs",
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
  resolve(ROOT, "public/projects/spider/scene-5"),
  flipbook({
    name: "Spider — Death",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: death,
    fps: 10,
    hold: 1,
    loop: false,
    generator: "scripts/generate-spider.mjs",
  }),
);
