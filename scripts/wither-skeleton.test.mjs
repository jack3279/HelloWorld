import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { FACE, idleA, walkFrame } from "./lib/skeleton-poses.mjs";
import { loadWitherSkeletonSkin } from "./lib/steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("wither skeleton skin", () => {
  it("loads the official charcoal face with dark sockets", async () => {
    const skin = await loadWitherSkeletonSkin();
    assert.ok(skin.width >= 64);
    assert.ok(skin.height >= 32);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2], skin.rgba[i + 3]];
    };
    const [r, g, b] = px(10, 10);
    assert.ok(r + g + b < 220, `face should be dark charcoal, got ${r},${g},${b}`);
    const eye = px(9, 12);
    assert.ok(eye[0] < 80 && eye[1] < 80 && eye[2] < 80, `eye socket should be dark, got ${eye}`);
  });
});

describe("wither skeleton pose", () => {
  it("reuses the skeleton profile with a 45° head", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-right"].pitch !== idleA().parts["leg-right"].pitch);
  });
});

describe("generated wither skeleton assets", () => {
  it("writes walk, idle, hurt, and death frames with a sword", async () => {
    const svg = await readFile(resolve(ROOT, "assets/wither-skeleton-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="held-sword"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < 16; i++) {
      const frame = await readFile(resolve(ROOT, "assets/wither-skeleton-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "hurt"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/wither-skeleton-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
    for (let i = 0; i < 12; i++) {
      const frame = await readFile(resolve(ROOT, "assets/wither-skeleton-sprites", `death-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
  });

  it("ships idle and walk flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", 8],
      ["scene-2", 16],
    ]) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/wither-skeleton", scene, "lottie.json"), "utf8"),
      );
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
