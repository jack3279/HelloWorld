import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { SNOW_GOLEM_MODEL } from "./lib/snow-golem-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, walkFrame } from "./lib/snow-golem-poses.mjs";
import { loadSnowGolemSkin } from "./lib/steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("snow golem model", () => {
  it("is two snow lumps, a head, and two stick arms", () => {
    const ids = SNOW_GOLEM_MODEL.map((p) => p.id);
    assert.deepEqual(ids, ["piece2", "piece1", "head", "arm-right", "arm-left"]);
  });

  it("loads the official 64×64 snow golem skin", async () => {
    const skin = await loadSnowGolemSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 64);
  });
});

describe("snow golem pose", () => {
  it("keeps the head at 45° and swings the arms on walk", () => {
    assert.equal(idleA().parts.head.yaw, FACE.yaw);
    const drift = walkFrame(0.25);
    assert.ok(drift.parts["arm-right"].pitch !== idleA().parts["arm-right"].pitch);
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.head.yaw, FACE.yaw);
    }
  });
});

describe("generated snow golem assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/snow-golem-side.svg"), "utf8");
    assert.match(svg, /id="piece2"/);
    assert.match(svg, /id="head"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/snow-golem-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/snow-golem-sprites", `${clip}-${i}.svg`), "utf8");
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
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/snow-golem", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
