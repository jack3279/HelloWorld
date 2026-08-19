import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadHorseSkin } from "./lib/steve-model.mjs";
import { HORSE_MODEL } from "./lib/horse-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, sampleRest, walkFrame } from "./lib/horse-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("horse model", () => {
  it("is an upright body, neck, head, saddle, tail, and two-segment legs", () => {
    const ids = HORSE_MODEL.map((p) => p.id);
    assert.ok(ids.includes("body"));
    assert.ok(ids.includes("saddle"));
    assert.ok(ids.includes("neck"));
    assert.ok(ids.includes("head"));
    assert.ok(ids.includes("hoof-front-left"));
    assert.equal(HORSE_MODEL.find((p) => p.id === "head").parent, "neck");
    assert.equal(HORSE_MODEL.find((p) => p.id === "saddle").parent, "body");
    assert.equal(HORSE_MODEL.find((p) => p.id === "hoof-hind-right").parent, "leg-hind-right");
  });

  it("loads the official 128×128 brown horse skin", async () => {
    const skin = await loadHorseSkin();
    assert.equal(skin.width, 128);
    assert.ok(skin.height >= 128);
  });
});

describe("horse pose", () => {
  it("keeps the body upright and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(pose.parts.body.pitch < 20, "horse body is not a pig-style 90° rest");
    assert.ok(walkFrame(0.25).root.y >= 0);
  });

  it("idles without leaving the 45° head turn", () => {
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.head.yaw, FACE.yaw);
    }
  });

  it("tucks the neck when resting", () => {
    const rest = sampleRest(0);
    assert.ok(rest.parts.neck.pitch > idleA().parts.neck.pitch);
  });
});

describe("generated horse assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/horse-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="saddle"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/horse-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/horse-sprites", `${clip}-${i}.svg`), "utf8");
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
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/horse", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
