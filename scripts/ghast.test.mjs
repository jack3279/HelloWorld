import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { GHAST_MODEL } from "./lib/ghast-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, walkFrame } from "./lib/ghast-poses.mjs";
import { loadGhastSkin } from "./lib/steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("ghast model", () => {
  it("is a body plus nine tentacles", () => {
    const ids = GHAST_MODEL.map((p) => p.id);
    assert.ok(ids.includes("body"));
    assert.equal(ids.filter((id) => id.startsWith("tentacle-")).length, 9);
  });

  it("loads the official ghast skin", async () => {
    const skin = await loadGhastSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("ghast pose", () => {
  it("keeps the body at 45° and pulses tentacles on walk", () => {
    assert.equal(idleA().parts.body.yaw, FACE.yaw);
    const drift = walkFrame(0.25);
    assert.ok(drift.parts["tentacle-0"].pitch !== idleA().parts["tentacle-0"].pitch);
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.body.yaw, FACE.yaw);
    }
  });
});

describe("generated ghast assets", () => {
  it("writes drift, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/ghast-side.svg"), "utf8");
    assert.match(svg, /id="body"/);
    assert.match(svg, /id="tentacle-0"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/ghast-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/ghast-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, drift, and hover flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/ghast", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
