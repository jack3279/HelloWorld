import { loadBatSkin } from "./lib/steve-model.mjs";
import { BAT_MODEL } from "./lib/bat-model.mjs";
import * as poses from "./lib/bat-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-bat.mjs",
  name: "Bat",
  title: "Bat, side view",
  desc: "Voxel bat facing right with the head turned 45 degrees. Wings fold and flap; the rest pose hangs upside-down.",
  groupId: "bat",
  loadSkin: loadBatSkin,
  model: BAT_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 20 },
  walkName: "Flap",
  walkFps: 14,
  restName: "Hang",
  restFps: 4,
});
