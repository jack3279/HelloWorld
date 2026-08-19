import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadBlazeSkin } from "./lib/steve-model.mjs";
import { BLAZE_MODEL } from "./lib/blaze-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, walkFrame } from "./lib/blaze-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("blaze model", () => {
  it("is a head plus eight rods", () => {
    const ids = BLAZE_MODEL.map((p) => p.id);
    assert.ok(ids.includes("head"));
    assert.equal(ids.filter((id) => id.startsWith("rod-")).length, 8);
  });

  it("loads the official blaze skin", async () => {
    const skin = await loadBlazeSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("blaze pose", () => {
  it("keeps the head at 45° and orbits the rods on walk", () => {
    assert.equal(idleA().parts.head.yaw, FACE.yaw);
    const spin = walkFrame(0.25);
    assert.ok(spin.parts["rod-0"].yaw !== idleA().parts["rod-0"].yaw);
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.head.yaw, FACE.yaw);
    }
  });
});

describe("generated blaze assets", () => {
  it("writes spin, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/blaze-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="rod-0"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/blaze-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/blaze-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, spin, and hover flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/blaze", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
