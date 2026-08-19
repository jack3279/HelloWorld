// Drowned: zombie layout with a teal drowned skin and a trident.
//
// Usage: node scripts/generate-drowned.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MODEL, loadDrownedSkin, parseArgs } from "./lib/steve-model.mjs";
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
} from "./lib/zombie-poses.mjs";
import { tridentExtra } from "./lib/held-item.mjs";
import { ROOT, bake, flipbook, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadDrownedSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 drowned texture");

const trident = [await tridentExtra()];
const withTrident = (pose) => ({
  ...pose,
  parts: { ...pose.parts, "held-trident": { pitch: 0, roll: 0, yaw: 0 } },
});

const hero = resolve(__dirname, "../assets/drowned-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-drowned.mjs",
  out: hero,
  title: "Drowned, side view",
  desc: "Voxel drowned facing right with the head turned 45 degrees so both eye sockets stay readable. Holds a trident.",
  groupId: "drowned",
  skin,
  pose: withTrident(idleA()),
  tolerance: TOLERANCE,
  model,
  extras: trident,
  canvas: { w: 512, h: 520, pad: 18 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({
    skin,
    pose: withTrident(entry.pose),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: trident,
  });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-drowned.mjs",
  groupId: "drowned",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/drowned-sprites"),
  stillPath: resolve(__dirname, "../assets/drowned-walk.svg"),
  stillLabel: "Drowned, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

await writeSampledClips({
  generator: "scripts/generate-drowned.mjs",
  groupId: "drowned",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/drowned-sprites"),
  skin,
  tolerance: TOLERANCE,
  model,
  extras: trident,
  sequences: [
    { prefix: "idle", label: "Idle", count: 8, sample: (t) => withTrident(sampleIdle(t)), loop: true, extras: trident },
    { prefix: "hurt", label: "Hurt", count: HURT_FRAMES, sample: (t) => withTrident(sampleHurt(t)), extras: trident },
    { prefix: "death", label: "Death", count: DEATH_FRAMES, sample: (t) => withTrident(sampleDeath(t)), extras: trident },
  ],
});
console.log(`Wrote 8 idle, ${HURT_FRAMES} hurt, and ${DEATH_FRAMES} death frames`);

const idle = Array.from({ length: 8 }, (_, i) => {
  const baked = bake({
    skin,
    pose: withTrident(sampleIdle(i / 8)),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: trident,
  });
  return { id: `idle-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/drowned/scene-1"),
  flipbook({
    name: "Drowned — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-drowned.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({
    skin,
    pose: withTrident(walkFrame(i / WALK_FRAMES)),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: trident,
  });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/drowned/scene-2"),
  flipbook({
    name: "Drowned — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-drowned.mjs",
  }),
);
