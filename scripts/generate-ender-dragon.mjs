import { loadEnderDragonSkin } from "./lib/steve-model.mjs";
import { ENDER_DRAGON_MODEL } from "./lib/ender-dragon-model.mjs";
import * as poses from "./lib/ender-dragon-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-ender-dragon.mjs",
  name: "Ender dragon",
  title: "Ender dragon, side view",
  desc: "Voxel ender dragon facing right. Body, neck, head, and wing bones from Bedrock geometry.dragon on the official 256×256 sheet.",
  groupId: "ender-dragon",
  loadSkin: loadEnderDragonSkin,
  minWidth: 256,
  minHeight: 256,
  model: ENDER_DRAGON_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 12 },
  walkName: "Fly",
  walkFps: 10,
  restName: "Glide",
  restFps: 6,
});
