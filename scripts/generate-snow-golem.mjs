import { loadSnowGolemSkin } from "./lib/steve-model.mjs";
import { SNOW_GOLEM_MODEL } from "./lib/snow-golem-model.mjs";
import * as poses from "./lib/snow-golem-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-snow-golem.mjs",
  name: "Snow golem",
  title: "Snow golem, side view",
  desc: "Voxel snow golem facing right with the head turned 45 degrees so the coal face stays readable. Two snow lumps and stick arms from Bedrock geometry.snowgolem.",
  groupId: "snow-golem",
  loadSkin: loadSnowGolemSkin,
  minWidth: 64,
  minHeight: 64,
  model: SNOW_GOLEM_MODEL,
  poses,
  canvas: { w: 512, h: 480, pad: 16 },
  walkFps: 8,
});
