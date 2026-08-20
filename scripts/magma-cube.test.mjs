import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadMagmaCubeSkin } from "./lib/steve-model.mjs";
import { MAGMA_CUBE_MODEL } from "./lib/magma-cube-model.mjs";
import { FACE, IDLE_FRAMES, WALK_FRAMES, idleA, sampleIdle, walkFrame } from "./lib/magma-cube-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("magma cube model", () => {
  it("is an inner cube plus eight stacked slices", () => {
    const ids = MAGMA_CUBE_MODEL.map((p) => p.id);
    assert.ok(ids.includes("inside"));
    assert.equal(ids.filter((id) => id.startsWith("cube-")).length, 8);
    assert.equal(MAGMA_CUBE_MODEL.find((p) => p.id === "cube-0").parent, "inside");
  });

  it("loads the official magma cube skin", async () => {
    const skin = await loadMagmaCubeSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("magma cube pose", () => {
  it("turns the inner cube 45° and hops on the walk", () => {
    assert.equal(idleA().parts.inside.yaw, FACE.yaw);
    const hop = walkFrame(0.25);
    assert.ok(hop.root.y > (idleA().root?.y ?? 0));
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.inside.yaw, FACE.yaw);
    }
  });
});

describe("generated magma cube assets", () => {
  it("writes hop, idle, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/magma-cube-side.svg"), "utf8");
    assert.match(svg, /id="inside"/);
    assert.match(svg, /id="cube-0"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/magma-cube-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/magma-cube-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle and hop flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/magma-cube", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.filter((l) => l.ty === 4).length >= minLayers, scene);
    }
  });
});
