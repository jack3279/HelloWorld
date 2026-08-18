// Cow: side-view SVG, walk / idle / rest sprites, and three Skottie loops.
//
// Usage: node scripts/generate-cow.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCowSkin, parseArgs } from "./lib/steve-model.mjs";
import { COW_MODEL } from "./lib/cow-model.mjs";
import {
  DEATH_FRAMES,
  HURT_FRAMES,
  IDLE_FRAMES,
  REST_FRAMES,
  SPRITE,
  TOLERANCE,
  WALK_FRAMES,
  catalog,
  idleA,
  sampleDeath,
  sampleHurt,
  sampleIdle,
  sampleRest,
  walkFrame,
} from "./lib/cow-poses.mjs";
import { ROOT, bake, flipbook, writeFrames, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = COW_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadCowSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 cow texture");

const hero = resolve(__dirname, "../assets/cow-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-cow.mjs",
  out: hero,
  title: "Cow, side view",
  desc: "Voxel cow facing right with the head turned 45 degrees so the face and horns stay readable. Four legs, no arms.",
  groupId: "cow",
  skin,
  pose: idleA(),
  tolerance: TOLERANCE,
  model,
  canvas: { w: 512, h: 480, pad: 20 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({ skin, pose: entry.pose, canvas: SPRITE, tolerance: TOLERANCE, model });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-cow.mjs",
  groupId: "cow",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/cow-sprites"),
  stillPath: resolve(__dirname, "../assets/cow-walk.svg"),
  stillLabel: "Cow, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

const idleSprites = Array.from({ length: IDLE_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: sampleIdle(i / IDLE_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `idle-${i}`, label: `Idle ${i + 1}/${IDLE_FRAMES}`, ...baked };
});
await writeFrames({
  generator: "scripts/generate-cow.mjs",
  groupId: "cow",
  sprite: SPRITE,
  frames: idleSprites,
  outDir: resolve(__dirname, "../assets/cow-sprites"),
});
const restSprites = Array.from({ length: REST_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: sampleRest(i / REST_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `rest-${i}`, label: `Rest ${i + 1}/${REST_FRAMES}`, ...baked };
});
await writeFrames({
  generator: "scripts/generate-cow.mjs",
  groupId: "cow",
  sprite: SPRITE,
  frames: restSprites,
  outDir: resolve(__dirname, "../assets/cow-sprites"),
});
await writeSampledClips({
  generator: "scripts/generate-cow.mjs",
  groupId: "cow",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/cow-sprites"),
  skin,
  tolerance: TOLERANCE,
  model,
  sequences: [
    { prefix: "hurt", label: "Hurt", count: HURT_FRAMES, sample: sampleHurt },
    { prefix: "death", label: "Death", count: DEATH_FRAMES, sample: sampleDeath },
  ],
});
console.log(`Wrote ${IDLE_FRAMES} idle frames, ${REST_FRAMES} rest frames, ${HURT_FRAMES} hurt, and ${DEATH_FRAMES} death`);

const idle = idleSprites.map((frame) => ({ id: frame.id, shapes: frame.shapes }));
await writeScene(
  resolve(ROOT, "public/projects/cow/scene-1"),
  flipbook({
    name: "Cow — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-cow.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/cow/scene-2"),
  flipbook({
    name: "Cow — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-cow.mjs",
  }),
);

const rest = restSprites.map((frame) => ({ id: frame.id, shapes: frame.shapes }));
await writeScene(
  resolve(ROOT, "public/projects/cow/scene-3"),
  flipbook({
    name: "Cow — Rest",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: rest,
    fps: 6,
    hold: 1,
    loop: true,
    generator: "scripts/generate-cow.mjs",
  }),
);
