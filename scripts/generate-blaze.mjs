import { loadBlazeSkin } from "./lib/steve-model.mjs";
import { BLAZE_MODEL } from "./lib/blaze-model.mjs";
import * as poses from "./lib/blaze-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-blaze.mjs",
  name: "Blaze",
  title: "Blaze, side view",
  desc: "Voxel blaze facing right with the head turned 45 degrees. Eight rods orbit on the walk clip.",
  groupId: "blaze",
  loadSkin: loadBlazeSkin,
  model: BLAZE_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 20 },
  walkName: "Spin",
  walkFps: 12,
  restName: "Hover",
  restFps: 6,
});
