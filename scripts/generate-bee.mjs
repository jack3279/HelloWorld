import { loadBeeSkin } from "./lib/steve-model.mjs";
import { BEE_MODEL } from "./lib/bee-model.mjs";
import * as poses from "./lib/bee-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-bee.mjs",
  name: "Bee",
  title: "Bee, side view",
  desc: "Voxel bee facing right with the body yawed so the stripes and antennae stay readable. Thin wings flap on the hover clip.",
  groupId: "bee",
  loadSkin: loadBeeSkin,
  model: BEE_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 24 },
  walkFps: 14,
  walkName: "Hover",
  restName: "Land",
});
