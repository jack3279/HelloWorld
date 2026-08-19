import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { WITHER_MODEL } from "./lib/wither-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, walkFrame } from "./lib/wither-poses.mjs";
import { loadWitherSkin } from "./lib/steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("wither model", () => {
  it("is shoulders, spine, three ribs, and three heads", () => {
    const ids = WITHER_MODEL.map((p) => p.id);
    assert.deepEqual(ids, ["shoulders", "spine", "rib-top", "rib-mid", "rib-low", "head", "head-right", "head-left"]);
  });

  it("loads the official 64×64 wither skin", async () => {
    const skin = await loadWitherSkin();
    assert.equal(skin.width, 64);
    assert.equal(skin.height, 64);
  });
});

describe("wither pose", () => {
  it("keeps the center head at 45° and bobs on walk", () => {
    assert.equal(idleA().parts.head.yaw, FACE.yaw);
    const drift = walkFrame(0.25);
    assert.ok((drift.root?.y ?? 0) > 0);
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.ok(Math.abs(sampleIdle(i / IDLE_FRAMES).parts.head.yaw - FACE.yaw) < 8);
    }
  });
});

describe("generated wither assets", () => {
  it("writes drift, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/wither-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="head-left"/);
    assert.match(svg, /id="shoulders"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/wither-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/wither-sprites", `${clip}-${i}.svg`), "utf8");
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
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/wither", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
