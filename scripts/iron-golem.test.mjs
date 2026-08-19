import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadIronGolemSkin } from "./lib/steve-model.mjs";
import { IRON_GOLEM_MODEL } from "./lib/iron-golem-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, SPRITE, WALK_FRAMES, idleA, walkFrame } from "./lib/iron-golem-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("iron golem model", () => {
  it("is a torso, waist, head, nose, hanging arms, and two legs", () => {
    const ids = IRON_GOLEM_MODEL.map((p) => p.id);
    assert.ok(ids.includes("torso"));
    assert.ok(ids.includes("waist"));
    assert.ok(ids.includes("nose"));
    assert.ok(ids.includes("arm-right"));
    assert.equal(IRON_GOLEM_MODEL.find((p) => p.id === "head").parent, "torso");
    const arm = IRON_GOLEM_MODEL.find((p) => p.id === "arm-right");
    assert.ok(arm.max[1] - arm.min[1] >= 28);
  });

  it("loads the official 128×128 iron golem skin", async () => {
    const skin = await loadIronGolemSkin();
    assert.equal(skin.width, 128);
    assert.ok(skin.height >= 128);
  });
});

describe("iron golem pose", () => {
  it("keeps a 45° head turn and stomps opposite arms and legs", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(SPRITE.h >= 560);
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["arm-right"].pitch !== passing.parts["arm-left"].pitch);
    assert.ok(passing.parts["leg-right"].pitch !== passing.parts["leg-left"].pitch);
  });
});

describe("generated iron golem assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/iron-golem-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="torso"/);
    assert.match(svg, /id="arm-right"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/iron-golem-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/iron-golem-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, walk, and rest flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/iron-golem", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
