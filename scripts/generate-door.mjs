import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBlock } from "./lib/minecraft-blocks.mjs";
import { DOOR_MODEL, DOOR_SPRITE, DOOR_SWING_FRAMES, DOOR_TOLERANCE, doorSwingPose, easeInOut, stackDoorSkin } from "./lib/door-model.mjs";
import { bake, flipbook, writeFrames, writeHeroSvg, writeScene } from "./lib/mob-pipeline.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const generator = "scripts/generate-door.mjs";

async function bakeSwing(skin) {
  return Array.from({ length: DOOR_SWING_FRAMES }, (_, i) => {
    const t = i / Math.max(1, DOOR_SWING_FRAMES - 1);
    const baked = bake({
      skin,
      pose: doorSwingPose(easeInOut(t)),
      canvas: DOOR_SPRITE,
      tolerance: DOOR_TOLERANCE,
      model: DOOR_MODEL,
    });
    return { id: `swing-${i}`, label: `Swing ${i + 1}/${DOOR_SWING_FRAMES}`, ...baked };
  });
}

const oakSkin = stackDoorSkin(await loadBlock("door-oak-upper"), await loadBlock("door-oak"));

await writeHeroSvg({
  generator,
  out: resolve(ROOT, "assets/door-side.svg"),
  title: "Oak door, closed",
  desc: "Voxel oak door facing the camera, hinged on the left.",
  groupId: "door",
  skin: oakSkin,
  pose: doorSwingPose(0),
  tolerance: DOOR_TOLERANCE,
  model: DOOR_MODEL,
  canvas: { w: 256, h: 512, pad: 24 },
});

const oakFrames = await bakeSwing(oakSkin);

await writeFrames({
  generator,
  groupId: "door",
  sprite: DOOR_SPRITE,
  frames: oakFrames,
  outDir: resolve(ROOT, "assets/door-sprites"),
});

await writeScene(
  resolve(ROOT, "public/projects/door/scene-1"),
  flipbook({
    name: "Oak door — Swing",
    w: DOOR_SPRITE.w,
    h: DOOR_SPRITE.h,
    frames: oakFrames.map((frame) => ({ id: frame.id, shapes: frame.shapes })),
    fps: 16,
    hold: 1,
    loop: true,
    generator,
  }),
);

const ironSkin = stackDoorSkin(await loadBlock("door-iron-upper"), await loadBlock("door-iron"));
const ironFrames = await bakeSwing(ironSkin);

await writeFrames({
  generator,
  groupId: "iron-door",
  sprite: DOOR_SPRITE,
  frames: ironFrames,
  outDir: resolve(ROOT, "assets/iron-door-sprites"),
});

console.log(`Wrote ${DOOR_SWING_FRAMES} oak and iron door swing frames`);
