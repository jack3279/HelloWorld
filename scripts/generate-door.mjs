import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBlock } from "./lib/minecraft-blocks.mjs";
import { DOOR_MODEL, DOOR_SPRITE, DOOR_SWING_FRAMES, DOOR_TOLERANCE, doorSwingPose, easeInOut, stackDoorSkin } from "./lib/door-model.mjs";
import { bake, flipbook, writeFrames, writeHeroSvg, writeScene } from "./lib/mob-pipeline.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const generator = "scripts/generate-door.mjs";

const upper = await loadBlock("door-oak-upper");
const lower = await loadBlock("door-oak");
const skin = stackDoorSkin(upper, lower);

await writeHeroSvg({
  generator,
  out: resolve(ROOT, "assets/door-side.svg"),
  title: "Oak door, closed",
  desc: "Voxel oak door facing the camera, hinged on the left.",
  groupId: "door",
  skin,
  pose: doorSwingPose(0),
  tolerance: DOOR_TOLERANCE,
  model: DOOR_MODEL,
  canvas: { w: 256, h: 512, pad: 24 },
});

const frames = Array.from({ length: DOOR_SWING_FRAMES }, (_, i) => {
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

await writeFrames({
  generator,
  groupId: "door",
  sprite: DOOR_SPRITE,
  frames,
  outDir: resolve(ROOT, "assets/door-sprites"),
});

await writeScene(
  resolve(ROOT, "public/projects/door/scene-1"),
  flipbook({
    name: "Oak door — Swing",
    w: DOOR_SPRITE.w,
    h: DOOR_SPRITE.h,
    frames: frames.map((frame) => ({ id: frame.id, shapes: frame.shapes })),
    fps: 16,
    hold: 1,
    loop: true,
    generator,
  }),
);

console.log(`Wrote ${DOOR_SWING_FRAMES} door swing frames`);
