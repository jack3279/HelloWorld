import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadBeeSkin } from "./lib/steve-model.mjs";
import { BEE_MODEL } from "./lib/bee-model.mjs";
import { IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, walkFrame } from "./lib/bee-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("bee model", () => {
  it("is a body with antennae, wings, legs, and a stinger", () => {
    const ids = BEE_MODEL.map((p) => p.id);
    assert.ok(ids.includes("body"));
    assert.ok(ids.includes("antenna-left"));
    assert.ok(ids.includes("wing-right"));
    assert.ok(ids.includes("stinger"));
    assert.ok(ids.includes("leg-front"));
  });

  it("loads the official bee skin", async () => {
    const skin = await loadBeeSkin();
    assert.ok(skin.width >= 64);
    assert.ok(skin.height >= 64);
  });
});

describe("bee pose", () => {
  it("faces the camera a little and flaps on the hover clip", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    const hover = walkFrame(0.125);
    assert.ok(Math.abs(hover.parts["wing-right"].roll) > Math.abs(pose.parts["wing-right"].roll));
  });
});

describe("generated bee assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/bee-side.svg"), "utf8");
    assert.match(svg, /id="body"/);
    assert.match(svg, /id="wing-right"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/bee-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/bee-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, hover, and land flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/bee", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
