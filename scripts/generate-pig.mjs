// Pig: side-view SVG, walk sprites, and two Skottie loops (idle, walk).
//
// Usage: node scripts/generate-pig.mjs [--skin=<png>]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPigSkin, parseArgs } from "./lib/steve-model.mjs";
import { PIG_MODEL } from "./lib/pig-model.mjs";
import { SPRITE, TOLERANCE, WALK_FRAMES, catalog, idleA, sampleIdle, walkFrame } from "./lib/pig-poses.mjs";
import { ROOT, bake, flipbook, writeHeroSvg, writeScene, writeSpriteKit } from "./lib/mob-pipeline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const model = PIG_MODEL;
const args = parseArgs(process.argv.slice(2));
const skin = await loadPigSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 32) throw new Error("expected a 64×32 pig texture");

const hero = resolve(__dirname, "../assets/pig-side.svg");
await writeHeroSvg({
  generator: "scripts/generate-pig.mjs",
  out: hero,
  title: "Pig, side view",
  desc: "Voxel pig facing right with the head turned 45 degrees so the face and snout stay readable. Four legs, no arms.",
  groupId: "pig",
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
  generator: "scripts/generate-pig.mjs",
  groupId: "pig",
  sprite: SPRITE,
  frames: walkSprites,
  outDir: resolve(__dirname, "../assets/pig-sprites"),
  stillPath: resolve(__dirname, "../assets/pig-walk.svg"),
  stillLabel: "Pig, walking, facing right",
});
console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

const idle = Array.from({ length: 8 }, (_, i) => {
  const baked = bake({ skin, pose: sampleIdle(i / 8), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `idle-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/pig/scene-1"),
  flipbook({
    name: "Pig — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idle,
    fps: 8,
    hold: 1,
    loop: true,
    generator: "scripts/generate-pig.mjs",
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
  const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
  return { id: `walk-${i}`, shapes: baked.shapes };
});
await writeScene(
  resolve(ROOT, "public/projects/pig/scene-2"),
  flipbook({
    name: "Pig — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
    generator: "scripts/generate-pig.mjs",
  }),
);
