import { loadParrotSkin } from "./lib/steve-model.mjs";
import { PARROT_MODEL } from "./lib/parrot-model.mjs";
import * as poses from "./lib/parrot-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-parrot.mjs",
  name: "Parrot",
  title: "Parrot, side view",
  desc: "Voxel red macaw facing right with the head turned 45 degrees so the face and beak stay readable. Two wings and a tail.",
  groupId: "parrot",
  loadSkin: loadParrotSkin,
  minWidth: 32,
  minHeight: 32,
  model: PARROT_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 28 },
  walkFps: 12,
  restName: "Preen",
});
