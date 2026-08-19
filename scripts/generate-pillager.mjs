// Pillager: villager/illager layout with a crossbow.
//
// Usage: node scripts/generate-pillager.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPillagerSkin, parseArgs } from "./lib/steve-model.mjs";
import { VILLAGER_MODEL } from "./lib/villager-model.mjs";
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
} from "./lib/villager-poses.mjs";
import { crossbowExtra } from "./lib/held-item.mjs";
import { ROOT, bake, flipbook, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = VILLAGER_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadPillagerSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 64) throw new Error("expected a 64×64 pillager texture");

const crossbow = [await crossbowExtra()];
const withCrossbow = (pose) => ({
  ...pose,
  parts: { ...pose.parts, "held-crossbow": { pitch: 0, roll: 0, yaw: 0 } },
});

const hero = resolve(__dirname, "../assets/pillager-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-pillager.mjs",
  out: hero,
  title: "Pillager, side view",
  desc: "Voxel pillager facing right with the head turned 45 degrees so the face and nose stay readable. Holds a crossbow.",
  groupId: "pillager",
  skin,
  pose: withCrossbow(idleA()),
  tolerance: TOLERANCE,
  model,
  extras: crossbow,
  canvas: { w: 512, h: 520, pad: 16 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({
    skin,
    pose: withCrossbow(entry.pose),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: crossbow,
  });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-pillager.mjs",
  groupId: "pillager",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/pillager-sprites"),
  stillPath: resolve(__dirname, "../assets/pillager-walk.svg"),
  stillLabel: "Pillager, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

await writeSampledClips({
  generator: "scripts/generate-pillager.mjs",
  groupId: "pillager",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/pillager-sprites"),
  skin,
  tolerance: TOLERANCE,
  model,
  extras: crossbow,
  sequences: [
    { prefix: "idle", label: "Idle", count: 8, sample: (t) => withCrossbow(sampleIdle(t)), loop: true, extras: crossbow },
    { prefix: "hurt", label: "Hurt", count: HURT_FRAMES, sample: (t) => withCrossbow(sampleHurt(t)), extras: crossbow },
    { prefix: "death", label: "Death", count: DEATH_FRAMES, sample: (t) => withCrossbow(sampleDeath(t)), extras: crossbow },
  ],
});
console.log(`Wrote 8 idle, ${HURT_FRAMES} hurt, and ${DEATH_FRAMES} death frames`);

const idle = Array.from({ length: 8 }, (_, i) => {
  const baked = bake({
    skin,
    pose: withCrossbow(sampleIdle(i / 8)),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: crossbow,
  });
  return { id: `idle-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/pillager/scene-1"),
  flipbook({
    name: "Pillager — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-pillager.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({
    skin,
    pose: withCrossbow(walkFrame(i / WALK_FRAMES)),
    canvas: SPRITE,
    tolerance: TOLERANCE,
    model,
    extras: crossbow,
  });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/pillager/scene-2"),
  flipbook({
    name: "Pillager — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-pillager.mjs",
  }),
);
