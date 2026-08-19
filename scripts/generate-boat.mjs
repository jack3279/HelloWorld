import { loadBoatSkin } from "./lib/steve-model.mjs";
import { BOAT_MODEL } from "./lib/boat-model.mjs";
import * as poses from "./lib/boat-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-boat.mjs",
  name: "Boat",
  title: "Oak boat, side view",
  desc: "Voxel oak boat facing right on the waterline. Hull, gunwales, and paddles stroke on the walk clip.",
  groupId: "boat",
  loadSkin: loadBoatSkin,
  minWidth: 64,
  minHeight: 64,
  model: BOAT_MODEL,
  poses,
  canvas: { w: 512, h: 400, pad: 16 },
  walkName: "Paddle",
  walkFps: 10,
  restName: "Bob",
  restFps: 6,
});
