import { loadHorseSkin } from "./lib/steve-model.mjs";
import { HORSE_MODEL } from "./lib/horse-model.mjs";
import * as poses from "./lib/horse-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-horse.mjs",
  name: "Horse",
  title: "Horse, side view",
  desc: "Voxel brown horse facing right with the head turned 45 degrees. Upright body, two-segment legs, thin saddle plate.",
  groupId: "horse",
  loadSkin: loadHorseSkin,
  minWidth: 128,
  minHeight: 128,
  model: HORSE_MODEL,
  poses,
  canvas: { w: 512, h: 520, pad: 20 },
  walkFps: 12,
});
