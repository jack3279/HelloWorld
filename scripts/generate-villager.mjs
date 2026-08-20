// Villager: side-view SVG, walk / idle / rest sprites, and three Skottie loops.
//
// Usage: node scripts/generate-villager.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadVillagerSkin, parseArgs } from "./lib/steve-model.mjs";
import { VILLAGER_MODEL } from "./lib/villager-model.mjs";
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
} from "./lib/villager-poses.mjs";
import { ROOT, bake, flipbook, writeFrames, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = VILLAGER_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadVillagerSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 64) throw new Error("expected a 64×64 villager texture");

const hero = resolve(__dirname, "../assets/villager-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-villager.mjs",
  out: hero,
  title: "Villager, side view",
  desc: "Voxel villager facing right with the head turned 45 degrees so the face and nose stay readable. Arms folded in front of the robe.",
  groupId: "villager",
  skin,
  pose: idleA(),
  tolerance: TOLERANCE,
  model,
  canvas: { w: 512, h: 520, pad: 16 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({ skin, pose: entry.pose, canvas: SPRITE, tolerance: TOLERANCE, model });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-villager.mjs",
  groupId: "villager",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/villager-sprites"),
  stillPath: resolve(__dirname, "../assets/villager-walk.svg"),
  stillLabel: "Villager, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

const idleSprites = Array.from({ length: IDLE_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: sampleIdle(i / IDLE_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `idle-${i}`, label: `Idle ${i + 1}/${IDLE_FRAMES}`, ...baked };
});
await writeFrames({
  generator: "scripts/generate-villager.mjs",
  groupId: "villager",
  sprite: SPRITE,
  frames: idleSprites,
  outDir: resolve(__dirname, "../assets/villager-sprites"),
});
const restSprites = Array.from({ length: REST_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: sampleRest(i / REST_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `rest-${i}`, label: `Rest ${i + 1}/${REST_FRAMES}`, ...baked };
});
await writeFrames({
  generator: "scripts/generate-villager.mjs",
  groupId: "villager",
  sprite: SPRITE,
  frames: restSprites,
  outDir: resolve(__dirname, "../assets/villager-sprites"),
});
await writeSampledClips({
  generator: "scripts/generate-villager.mjs",
  groupId: "villager",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/villager-sprites"),
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
  resolve(ROOT, "public/projects/villager/scene-1"),
  flipbook({
    name: "Villager — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-villager.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/villager/scene-2"),
  flipbook({
    name: "Villager — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-villager.mjs",
  }),
);

const rest = restSprites.map((frame) => ({ id: frame.id, shapes: frame.shapes }));
await writeScene(
  resolve(ROOT, "public/projects/villager/scene-3"),
  flipbook({
    name: "Villager — Rest",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: rest,
    fps: 6,
    hold: 1,
    loop: true,
    generator: "scripts/generate-villager.mjs",
  }),
);
