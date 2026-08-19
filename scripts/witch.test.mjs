import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadWitchSkin } from "./lib/steve-model.mjs";
import { WITCH_MODEL } from "./lib/witch-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, SPRITE, WALK_FRAMES, idleA, sampleIdle } from "./lib/witch-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("witch model", () => {
  it("is the villager robe plus a four-piece hat and a wart", () => {
    const ids = WITCH_MODEL.map((p) => p.id);
    assert.ok(ids.includes("robe"));
    assert.ok(ids.includes("hat"));
    assert.ok(ids.includes("hat4"));
    assert.ok(ids.includes("wart"));
    assert.equal(WITCH_MODEL.find((p) => p.id === "hat").parent, "head");
    assert.equal(WITCH_MODEL.find((p) => p.id === "wart").parent, "head");
  });

  it("loads the official 64×128 witch skin", async () => {
    const skin = await loadWitchSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 64);
  });
});

describe("witch pose", () => {
  it("keeps the hat stacked and the head at 45° on a taller sprite", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(pose.parts.hat);
    assert.ok(pose.parts.hat4.pitch < 0);
    assert.ok(SPRITE.h >= 560);
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.head.yaw, FACE.yaw);
    }
  });
});

describe("generated witch assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/witch-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="hat"/);
    assert.match(svg, /id="wart"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/witch-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/witch-sprites", `${clip}-${i}.svg`), "utf8");
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
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/witch", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
