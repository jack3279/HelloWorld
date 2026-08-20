import { loadWitchSkin } from "./lib/steve-model.mjs";
import { WITCH_MODEL } from "./lib/witch-model.mjs";
import * as poses from "./lib/witch-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-witch.mjs",
  name: "Witch",
  title: "Witch, side view",
  desc: "Voxel witch facing right with the villager robe, nose wart, and crooked hat from the 64×128 witch sheet.",
  groupId: "witch",
  loadSkin: loadWitchSkin,
  minHeight: 64,
  model: WITCH_MODEL,
  poses,
  canvas: { w: 512, h: 540, pad: 14 },
  walkFps: 10,
});
