import { loadGhastSkin } from "./lib/steve-model.mjs";
import { GHAST_MODEL } from "./lib/ghast-model.mjs";
import * as poses from "./lib/ghast-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-ghast.mjs",
  name: "Ghast",
  title: "Ghast, side view",
  desc: "Voxel ghast facing right with the body turned 45 degrees. Nine tentacles pulse on the walk clip.",
  groupId: "ghast",
  loadSkin: loadGhastSkin,
  model: GHAST_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 20 },
  walkName: "Drift",
  walkFps: 10,
  restName: "Hover",
  restFps: 6,
});
