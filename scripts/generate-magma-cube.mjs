import { loadMagmaCubeSkin } from "./lib/steve-model.mjs";
import { MAGMA_CUBE_MODEL } from "./lib/magma-cube-model.mjs";
import * as poses from "./lib/magma-cube-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-magma-cube.mjs",
  name: "Magma cube",
  title: "Magma cube, side view",
  desc: "Voxel magma cube facing right with stacked slices parented to the inner cube. Hop on the walk clip.",
  groupId: "magma-cube",
  loadSkin: loadMagmaCubeSkin,
  model: MAGMA_CUBE_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 20 },
  walkName: "Hop",
  walkFps: 10,
});
