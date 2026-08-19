import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { FACE, idleA, walkFrame } from "./lib/zombie-poses.mjs";
import { loadDrownedSkin } from "./lib/steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("drowned skin", () => {
  it("loads the official teal drowned face", async () => {
    const skin = await loadDrownedSkin();
    assert.ok(skin.width >= 64);
    assert.ok(skin.height >= 32);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2], skin.rgba[i + 3]];
    };
    const [r, g, b] = px(10, 10);
    assert.ok(b > r, `face should lean teal, got ${r},${g},${b}`);
    assert.ok(g + b > r + 40, `face should not be dry zombie green, got ${r},${g},${b}`);
  });
});

describe("drowned pose", () => {
  it("reuses the zombie reach with a 45° head", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(pose.parts["arm-right"].pitch < -60);
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-right"].pitch !== idleA().parts["leg-right"].pitch);
  });
});

describe("generated drowned assets", () => {
  it("writes walk, idle, hurt, and death frames with a trident", async () => {
    const svg = await readFile(resolve(ROOT, "assets/drowned-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="held-trident"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < 16; i++) {
      const frame = await readFile(resolve(ROOT, "assets/drowned-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "hurt"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/drowned-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
    for (let i = 0; i < 12; i++) {
      const frame = await readFile(resolve(ROOT, "assets/drowned-sprites", `death-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
  });

  it("ships idle and walk flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", 8],
      ["scene-2", 16],
    ]) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/drowned", scene, "lottie.json"), "utf8"),
      );
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
