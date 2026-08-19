import { loadMinecartSkin } from "./lib/steve-model.mjs";
import { MINECART_MODEL } from "./lib/minecart-model.mjs";
import * as poses from "./lib/minecart-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-minecart.mjs",
  name: "Minecart",
  title: "Minecart, side view",
  desc: "Voxel minecart facing right on the rails. Hull from Bedrock geometry.minecart, official 64×32 sheet.",
  groupId: "minecart",
  loadSkin: loadMinecartSkin,
  minWidth: 64,
  minHeight: 32,
  model: MINECART_MODEL,
  poses,
  canvas: { w: 512, h: 400, pad: 16 },
  walkName: "Roll",
  walkFps: 10,
  restName: "Rock",
  restFps: 6,
});
