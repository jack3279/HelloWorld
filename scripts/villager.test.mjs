import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadVillagerSkin } from "./lib/steve-model.mjs";
import { VILLAGER_MODEL } from "./lib/villager-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, walkFrame } from "./lib/villager-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("villager model", () => {
  it("is a robe, 10-tall head with a nose, folded arms, and two legs", () => {
    const ids = VILLAGER_MODEL.map((p) => p.id).sort();
    assert.ok(ids.includes("torso"));
    assert.ok(ids.includes("robe"));
    assert.ok(ids.includes("nose"));
    assert.ok(ids.includes("arms"));
    assert.ok(ids.includes("arm-left"));
    assert.equal(VILLAGER_MODEL.find((p) => p.id === "nose").parent, "head");
    assert.equal(VILLAGER_MODEL.find((p) => p.id === "head").max[1] - VILLAGER_MODEL.find((p) => p.id === "head").min[1], 10);
    assert.deepEqual(VILLAGER_MODEL.find((p) => p.id === "arm-right").pivot, VILLAGER_MODEL.find((p) => p.id === "arm-left").pivot);
  });

  it("loads the official villager skin", async () => {
    const skin = await loadVillagerSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 64);
  });
});

describe("villager pose", () => {
  it("keeps arms folded in front and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(pose.parts.arms.pitch < -60);
    const passing = walkFrame(0.25);
    assert.equal(passing.parts.head.yaw, FACE.yaw);
    assert.ok(passing.parts["leg-right"].pitch !== passing.parts["leg-left"].pitch);
  });

  it("idles without unfolding the arms", () => {
    for (let i = 0; i < IDLE_FRAMES; i++) {
      const pose = sampleIdle(i / IDLE_FRAMES);
      assert.ok(pose.parts.arms.pitch < -50);
    }
  });
});

describe("generated villager assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/villager-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="nose"/);
    assert.match(svg, /id="robe"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/villager-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/villager-sprites", `${clip}-${i}.svg`), "utf8");
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
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/villager", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
