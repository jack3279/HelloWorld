import { loadSquidSkin } from "./lib/steve-model.mjs";
import { SQUID_MODEL } from "./lib/squid-model.mjs";
import * as poses from "./lib/squid-poses.mjs";
import { runMobGenerator } from "./lib/run-mob-generator.mjs";

await runMobGenerator({
  generator: "scripts/generate-squid.mjs",
  name: "Squid",
  title: "Squid, side view",
  desc: "Voxel squid facing right with eight hanging tentacles. Swim is a pulsing bob.",
  groupId: "squid",
  loadSkin: loadSquidSkin,
  model: SQUID_MODEL,
  poses,
  canvas: { w: 512, h: 520, pad: 16 },
  walkName: "Swim",
  walkFps: 10,
});
