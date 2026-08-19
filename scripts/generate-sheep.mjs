// Sheep: side-view SVG, walk / idle / rest sprites, and three Skottie loops.
// Wool overlay cuboids paint from the separate sheep_wool skin.
//
// Usage: node scripts/generate-sheep.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSheepSkin, loadSheepWoolSkin, parseArgs } from "./lib/steve-model.mjs";
import { SHEEP_MODEL, SHEEP_WOOL } from "./lib/sheep-model.mjs";
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
} from "./lib/sheep-poses.mjs";
import { ROOT, bake, flipbook, writeFrames, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = SHEEP_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadSheepSkin(args.get("skin"));
const woolSkin = await loadSheepWoolSkin();
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 sheep texture");

const extras = SHEEP_WOOL.map((part) => ({ part, skin: woolSkin, tolerance: { default: 20 } }));

const hero = resolve(__dirname, "../assets/sheep-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-sheep.mjs",
  out: hero,
  title: "Sheep, side view",
  desc: "Voxel sheep facing right with the head turned 45 degrees so the face stays readable. Wool overlay cuboids sit on the body, head, and upper legs.",
  groupId: "sheep",
  skin,
  pose: idleA(),
  tolerance: TOLERANCE,
  model,
  extras,
  canvas: { w: 512, h: 480, pad: 20 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({ skin, pose: entry.pose, canvas: SPRITE, tolerance: TOLERANCE, model, extras });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-sheep.mjs",
  groupId: "sheep",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/sheep-sprites"),
  stillPath: resolve(__dirname, "../assets/sheep-walk.svg"),
  stillLabel: "Sheep, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

const idleSprites = Array.from({ length: IDLE_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: sampleIdle(i / IDLE_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model, extras });
  return { id: `idle-${i}`, label: `Idle ${i + 1}/${IDLE_FRAMES}`, ...baked };
});
await writeFrames({
  generator: "scripts/generate-sheep.mjs",
  groupId: "sheep",
  sprite: SPRITE,
  frames: idleSprites,
  outDir: resolve(__dirname, "../assets/sheep-sprites"),
});
const restSprites = Array.from({ length: REST_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: sampleRest(i / REST_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model, extras });
  return { id: `rest-${i}`, label: `Rest ${i + 1}/${REST_FRAMES}`, ...baked };
});
await writeFrames({
  generator: "scripts/generate-sheep.mjs",
  groupId: "sheep",
  sprite: SPRITE,
  frames: restSprites,
  outDir: resolve(__dirname, "../assets/sheep-sprites"),
});
await writeSampledClips({
  generator: "scripts/generate-sheep.mjs",
  groupId: "sheep",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/sheep-sprites"),
  skin,
  tolerance: TOLERANCE,
  model,
  sequences: [
    { prefix: "hurt", label: "Hurt", count: HURT_FRAMES, sample: sampleHurt, extras },
    { prefix: "death", label: "Death", count: DEATH_FRAMES, sample: sampleDeath, extras },
  ],
});
console.log(`Wrote ${IDLE_FRAMES} idle frames, ${REST_FRAMES} rest frames, ${HURT_FRAMES} hurt, and ${DEATH_FRAMES} death`);

const idle = idleSprites.map((frame) => ({ id: frame.id, shapes: frame.shapes }));
await writeScene(
  resolve(ROOT, "public/projects/sheep/scene-1"),
  flipbook({
    name: "Sheep — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-sheep.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model, extras });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/sheep/scene-2"),
  flipbook({
    name: "Sheep — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-sheep.mjs",
  }),
);

const rest = restSprites.map((frame) => ({ id: frame.id, shapes: frame.shapes }));
await writeScene(
  resolve(ROOT, "public/projects/sheep/scene-3"),
  flipbook({
    name: "Sheep — Rest",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: rest,
    fps: 6,
    hold: 1,
    loop: true,
    generator: "scripts/generate-sheep.mjs",
  }),
);
