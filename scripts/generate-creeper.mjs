// Creeper: side-view SVG, walk + swell sprites, and three Skottie loops
// (idle, walk, fuse swell).
//
// Usage: node scripts/generate-creeper.mjs [--skin=<png>]
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCreeperSkin, parseArgs } from "./lib/steve-model.mjs";
import { CREEPER_MODEL } from "./lib/creeper-model.mjs";
import {
  SPRITE,
  SWELL_FRAMES,
  TOLERANCE,
  WALK_FRAMES,
  catalog,
  idleA,
  sampleIdle,
  swellCanvas,
  swellFrame,
  walkFrame,
} from "./lib/creeper-poses.mjs";
import { ROOT, bake, flipbook, frameSvg, writeHeroSvg, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = CREEPER_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadCreeperSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 creeper texture");

const hero = resolve(__dirname, "../assets/creeper-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-creeper.mjs",
  out: hero,
  title: "Creeper, side view",
  desc: "Voxel creeper facing right with the head turned 45 degrees so the face — both eyes and the frown — stays readable. Four legs, no arms.",
  groupId: "creeper",
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
  generator: "scripts/generate-creeper.mjs",
  groupId: "creeper",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/creeper-sprites"),
  stillPath: resolve(__dirname, "../assets/creeper-walk.svg"),
  stillLabel: "Creeper, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

const swellDir = resolve(__dirname, "../assets/creeper-sprites");
for (let i = 0; i < SWELL_FRAMES; i++) {
  const pose = swellFrame(i / SWELL_FRAMES);
  const baked = bake({ skin, pose, canvas: swellCanvas(pose), tolerance: TOLERANCE, model });
  const svg = frameSvg({
    generator: "scripts/generate-creeper.mjs",
    id: `swell-${i}`,
    label: `Swell ${i + 1}/${SWELL_FRAMES}`,
    groupId: "creeper",
    w: SPRITE.w,
    h: SPRITE.h,
    parts: baked.parts,
    project: baked.project,
  });
  await writeFile(resolve(swellDir, `swell-${i}.svg`), svg);
}
console.log(`Wrote ${SWELL_FRAMES} swell frames`);

const idle = Array.from({ length: 8 }, (_, i) => {
  const baked = bake({ skin, pose: sampleIdle(i / 8), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `idle-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/creeper/scene-1"),
  flipbook({
    name: "Creeper — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-creeper.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/creeper/scene-2"),
  flipbook({
    name: "Creeper — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-creeper.mjs",
  }),
);

const swell = Array.from({ length: SWELL_FRAMES }, (_, i) => {
  const pose = swellFrame(i / SWELL_FRAMES);
  const baked = bake({ skin, pose, canvas: swellCanvas(pose), tolerance: TOLERANCE, model });
  return { id: `swell-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/creeper/scene-3"),
  flipbook({
    name: "Creeper — Swell",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: swell,
    fps: 12,
    hold: 1,
    loop: true,
    generator: "scripts/generate-creeper.mjs",
  }),
);
