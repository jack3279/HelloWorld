// Wither skeleton: charcoal skeleton with a stone sword instead of a bow.
//
// Usage: node scripts/generate-wither-skeleton.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadWitherSkeletonSkin, parseArgs } from "./lib/steve-model.mjs";
import { SKELETON_MODEL } from "./lib/skeleton-model.mjs";
import {
  DEATH_FRAMES,
  HURT_FRAMES,
  SPRITE,
  TOLERANCE,
  WALK_FRAMES,
  catalog,
  idleA,
  sampleDeath,
  sampleHurt,
  sampleIdle,
  walkFrame,
} from "./lib/skeleton-poses.mjs";
import { stoneSwordExtra } from "./lib/held-item.mjs";
import { ROOT, bake, flipbook, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = SKELETON_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadWitherSkeletonSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 wither skeleton texture");

const sword = [await stoneSwordExtra()];
const withSword = (pose) => ({
  ...pose,
  parts: { ...pose.parts, "held-sword": { pitch: 0, roll: 0, yaw: 0 } },
});

const hero = resolve(__dirname, "../assets/wither-skeleton-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-wither-skeleton.mjs",
  out: hero,
  title: "Wither skeleton, side view",
  desc: "Voxel wither skeleton facing right with the head turned 45 degrees so both eye sockets stay readable. Holds a stone sword.",
  groupId: "wither-skeleton",
  skin,
  pose: withSword(idleA()),
  tolerance: TOLERANCE,
  model,
  extras: sword,
  canvas: { w: 512, h: 520, pad: 18 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({
    skin,
    pose: withSword(entry.pose),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: sword,
  });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-wither-skeleton.mjs",
  groupId: "wither-skeleton",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/wither-skeleton-sprites"),
  stillPath: resolve(__dirname, "../assets/wither-skeleton-walk.svg"),
  stillLabel: "Wither skeleton, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

await writeSampledClips({
  generator: "scripts/generate-wither-skeleton.mjs",
  groupId: "wither-skeleton",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/wither-skeleton-sprites"),
  skin,
  tolerance: TOLERANCE,
  model,
  extras: sword,
  sequences: [
    { prefix: "idle", label: "Idle", count: 8, sample: (t) => withSword(sampleIdle(t)), loop: true, extras: sword },
    { prefix: "hurt", label: "Hurt", count: HURT_FRAMES, sample: (t) => withSword(sampleHurt(t)), extras: sword },
    { prefix: "death", label: "Death", count: DEATH_FRAMES, sample: (t) => withSword(sampleDeath(t)), extras: sword },
  ],
});
console.log(`Wrote 8 idle, ${HURT_FRAMES} hurt, and ${DEATH_FRAMES} death frames`);

const idle = Array.from({ length: 8 }, (_, i) => {
  const baked = bake({
    skin,
    pose: withSword(sampleIdle(i / 8)),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: sword,
  });
  return { id: `idle-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/wither-skeleton/scene-1"),
  flipbook({
    name: "Wither skeleton — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-wither-skeleton.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({
    skin,
    pose: withSword(walkFrame(i / WALK_FRAMES)),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: sword,
  });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/wither-skeleton/scene-2"),
  flipbook({
    name: "Wither skeleton — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-wither-skeleton.mjs",
  }),
);
