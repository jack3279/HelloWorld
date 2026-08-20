// Rabbit: side-view SVG, walk / idle / rest sprites, and three Skottie loops.
//
// Usage: node scripts/generate-rabbit.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRabbitSkin, parseArgs } from "./lib/steve-model.mjs";
import { RABBIT_MODEL } from "./lib/rabbit-model.mjs";
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
} from "./lib/rabbit-poses.mjs";
import { ROOT, bake, flipbook, writeFrames, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = RABBIT_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadRabbitSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 rabbit texture");

const hero = resolve(__dirname, "../assets/rabbit-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-rabbit.mjs",
  out: hero,
  title: "Rabbit, side view",
  desc: "Voxel rabbit facing right with the head turned 45 degrees so the face, ears, and nose stay readable. Long hind feet, hopping gait.",
  groupId: "rabbit",
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
  generator: "scripts/generate-rabbit.mjs",
  groupId: "rabbit",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/rabbit-sprites"),
  stillPath: resolve(__dirname, "../assets/rabbit-walk.svg"),
  stillLabel: "Rabbit, hopping, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

const idleSprites = Array.from({ length: IDLE_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: sampleIdle(i / IDLE_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `idle-${i}`, label: `Idle ${i + 1}/${IDLE_FRAMES}`, ...baked };
});
await writeFrames({
  generator: "scripts/generate-rabbit.mjs",
  groupId: "rabbit",
  sprite: SPRITE,
  frames: idleSprites,
  outDir: resolve(__dirname, "../assets/rabbit-sprites"),
});
const restSprites = Array.from({ length: REST_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: sampleRest(i / REST_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `rest-${i}`, label: `Rest ${i + 1}/${REST_FRAMES}`, ...baked };
});
await writeFrames({
  generator: "scripts/generate-rabbit.mjs",
  groupId: "rabbit",
  sprite: SPRITE,
  frames: restSprites,
  outDir: resolve(__dirname, "../assets/rabbit-sprites"),
});
await writeSampledClips({
  generator: "scripts/generate-rabbit.mjs",
  groupId: "rabbit",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/rabbit-sprites"),
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
  resolve(ROOT, "public/projects/rabbit/scene-1"),
  flipbook({
    name: "Rabbit — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-rabbit.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/rabbit/scene-2"),
  flipbook({
    name: "Rabbit — Hop",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 12,
    hold: 1,
    loop: true,
    generator: "scripts/generate-rabbit.mjs",
  }),
);

const rest = restSprites.map((frame) => ({ id: frame.id, shapes: frame.shapes }));
await writeScene(
  resolve(ROOT, "public/projects/rabbit/scene-3"),
  flipbook({
    name: "Rabbit — Rest",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: rest,
    fps: 6,
    hold: 1,
    loop: true,
    generator: "scripts/generate-rabbit.mjs",
  }),
);
