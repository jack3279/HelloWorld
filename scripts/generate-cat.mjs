import { loadCatSkin } from "./lib/steve-model.mjs";
import { CAT_MODEL } from "./lib/cat-model.mjs";
import * as poses from "./lib/cat-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-cat.mjs",
  name: "Cat",
  title: "Cat, side view",
  desc: "Voxel red-tabby cat facing right with the head turned 45 degrees so the face, muzzle, and ears stay readable. Long tail in two segments.",
  groupId: "cat",
  loadSkin: loadCatSkin,
  model: CAT_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 24 },
  walkFps: 12,
});
