import { loadWitherSkin } from "./lib/steve-model.mjs";
import { WITHER_MODEL } from "./lib/wither-model.mjs";
import * as poses from "./lib/wither-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-wither.mjs",
  name: "Wither",
  title: "Wither, side view",
  desc: "Voxel wither facing right with three heads turned 45 degrees. Shoulders, spine, and ribs from Bedrock geometry.witherBoss.",
  groupId: "wither",
  loadSkin: loadWitherSkin,
  minWidth: 64,
  minHeight: 64,
  model: WITHER_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 18 },
  walkName: "Drift",
  walkFps: 10,
  restName: "Hover",
  restFps: 6,
});
