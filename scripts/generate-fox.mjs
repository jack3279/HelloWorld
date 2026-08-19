import { loadFoxSkin } from "./lib/steve-model.mjs";
import { FOX_MODEL } from "./lib/fox-model.mjs";
import * as poses from "./lib/fox-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-fox.mjs",
  name: "Fox",
  title: "Fox, side view",
  desc: "Voxel fox facing right with the head turned 45 degrees so the face, ears, and muzzle stay readable. Four thin legs and a bushy tail.",
  groupId: "fox",
  loadSkin: loadFoxSkin,
  model: FOX_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 20 },
  walkFps: 10,
});
