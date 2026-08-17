// Enderman: side-view SVG, walk sprites, and three Skottie loops
// (idle, walk, teleport flicker).
//
// Usage: node scripts/generate-enderman.mjs [--skin=<tga>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEndermanSkin, parseArgs } from "./lib/steve-model.mjs";
import { ENDERMAN_MODEL } from "./lib/enderman-model.mjs";
import {
  DEATH_FRAMES,
  HURT_FRAMES,
  SPRITE,
  TELEPORT_FRAMES,
  TOLERANCE,
  WALK_FRAMES,
  catalog,
  idleA,
  sampleDeath,
  sampleHurt,
  sampleIdle,
  teleportFrame,
  walkFrame,
} from "./lib/enderman-poses.mjs";
import { ROOT, bake, flipbook, writeHeroSvg, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = ENDERMAN_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadEndermanSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 enderman texture");

const hero = resolve(__dirname, "../assets/enderman-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-enderman.mjs",
  out: hero,
  title: "Enderman, side view",
  desc: "Voxel enderman facing right with the head turned 45 degrees so the purple eyes stay readable.",
  groupId: "enderman",
  skin,
  pose: idleA(),
  tolerance: TOLERANCE,
  model,
  canvas: { w: 512, h: 640, pad: 18 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({ skin, pose: entry.pose, canvas: SPRITE, tolerance: TOLERANCE, model });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-enderman.mjs",
  groupId: "enderman",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/enderman-sprites"),
  stillPath: resolve(__dirname, "../assets/enderman-walk.svg"),
  stillLabel: "Enderman, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

const idle = Array.from({ length: 8 }, (_, i) => {
  const baked = bake({ skin, pose: sampleIdle(i / 8), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `idle-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/enderman/scene-1"),
  flipbook({
    name: "Enderman — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-enderman.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/enderman/scene-2"),
  flipbook({
    name: "Enderman — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-enderman.mjs",
  }),
);

const teleport = Array.from({ length: TELEPORT_FRAMES }, (_, i) => {
  const pose = teleportFrame(i / TELEPORT_FRAMES);
  const baked = bake({ skin, pose, canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `teleport-${i}`, shapes: baked.shapes, opacity: pose.opacity };
});
await writeScene(
  resolve(ROOT, "public/projects/enderman/scene-3"),
  flipbook({
    name: "Enderman — Teleport",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: teleport,
    fps: 12,
    hold: 1,
    loop: true,
    generator: "scripts/generate-enderman.mjs",
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
  resolve(ROOT, "public/projects/enderman/scene-4"),
  flipbook({
    name: "Enderman — Hurt",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: hurt,
    fps: 12,
    hold: 1,
    loop: true,
    generator: "scripts/generate-enderman.mjs",
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
  resolve(ROOT, "public/projects/enderman/scene-5"),
  flipbook({
    name: "Enderman — Death",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: death,
    fps: 10,
    hold: 1,
    loop: false,
    generator: "scripts/generate-enderman.mjs",
  }),
);
