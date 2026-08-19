// Slime: side-view SVG, hop / idle sprites, and Skottie loops.
//
// Usage: node scripts/generate-slime.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSlimeSkin, parseArgs } from "./lib/steve-model.mjs";
import { SLIME_MODEL } from "./lib/slime-model.mjs";
import {
  DEATH_FRAMES,
  HURT_FRAMES,
  IDLE_FRAMES,
  SPRITE,
  TOLERANCE,
  WALK_FRAMES,
  catalog,
  idleA,
  sampleDeath,
  sampleHurt,
  sampleIdle,
  swellCanvas,
  walkFrame,
} from "./lib/slime-poses.mjs";
import { ROOT, bake, flipbook, writeFrames, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = SLIME_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadSlimeSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 slime texture");

const hero = resolve(__dirname, "../assets/slime-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-slime.mjs",
  out: hero,
  title: "Slime, side view",
  desc: "Voxel slime facing right with the inner cube turned 45 degrees so both eyes and the mouth stay readable. Outer gel cube plus inner cube.",
  groupId: "slime",
  skin,
  pose: idleA(),
  tolerance: TOLERANCE,
  model,
  canvas: { w: 512, h: 480, pad: 20 },
});
console.log(`Wrote ${hero}`);

const walkSprites = catalog().map((entry) => {
  const baked = bake({ skin, pose: entry.pose, canvas: swellCanvas(entry.pose), tolerance: TOLERANCE, model });
  return { ...entry, ...baked };
});
const sprites = await writeSpriteKit({
  generator: "scripts/generate-slime.mjs",
  groupId: "slime",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/slime-sprites"),
  stillPath: resolve(__dirname, "../assets/slime-walk.svg"),
  stillLabel: "Slime, hopping, facing right",
});
console.log(`Wrote ${sprites.length} hop frames plus sheet.svg`);

const idleSprites = Array.from({ length: IDLE_FRAMES }, (_, i) => {
  const pose = sampleIdle(i / IDLE_FRAMES);
  const baked = bake({ skin, pose, canvas: swellCanvas(pose), tolerance: TOLERANCE, model });
  return { id: `idle-${i}`, label: `Idle ${i + 1}/${IDLE_FRAMES}`, ...baked };
});
await writeFrames({
  generator: "scripts/generate-slime.mjs",
  groupId: "slime",
  sprite: SPRITE,
  frames: idleSprites,
  outDir: resolve(__dirname, "../assets/slime-sprites"),
});
await writeSampledClips({
  generator: "scripts/generate-slime.mjs",
  groupId: "slime",
  sprite: SPRITE,
  outDir: resolve(__dirname, "../assets/slime-sprites"),
  skin,
  tolerance: TOLERANCE,
  model,
  sequences: [
    { prefix: "hurt", label: "Hurt", count: HURT_FRAMES, sample: sampleHurt },
    { prefix: "death", label: "Death", count: DEATH_FRAMES, sample: sampleDeath },
  ],
});
console.log(`Wrote ${IDLE_FRAMES} idle frames, ${HURT_FRAMES} hurt, and ${DEATH_FRAMES} death`);

const idle = idleSprites.map((frame) => ({ id: frame.id, shapes: frame.shapes }));
await writeScene(
  resolve(ROOT, "public/projects/slime/scene-1"),
  flipbook({
    name: "Slime — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-slime.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const pose = walkFrame(i / WALK_FRAMES);
  const baked = bake({ skin, pose, canvas: swellCanvas(pose), tolerance: TOLERANCE, model });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/slime/scene-2"),
  flipbook({
    name: "Slime — Hop",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-slime.mjs",
  }),
);
