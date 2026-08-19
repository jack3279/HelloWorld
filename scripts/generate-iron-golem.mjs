import { loadIronGolemSkin } from "./lib/steve-model.mjs";
import { IRON_GOLEM_MODEL } from "./lib/iron-golem-model.mjs";
import * as poses from "./lib/iron-golem-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-iron-golem.mjs",
  name: "Iron golem",
  title: "Iron golem, side view",
  desc: "Voxel iron golem facing right with the head turned 45 degrees so the face and nose stay readable. Long hanging arms, 128×128 skin.",
  groupId: "iron-golem",
  loadSkin: loadIronGolemSkin,
  minWidth: 128,
  minHeight: 128,
  model: IRON_GOLEM_MODEL,
  poses,
  canvas: { w: 512, h: 560, pad: 12 },
  walkFps: 8,
});
