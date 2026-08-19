import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { FACE, DEATH_FRAMES, idleA, walkFrame } from "./lib/villager-poses.mjs";
import { loadPillagerSkin } from "./lib/steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("pillager skin", () => {
  it("loads the official illager face", async () => {
    const skin = await loadPillagerSkin();
    assert.ok(skin.width >= 64);
    assert.ok(skin.height >= 64);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2], skin.rgba[i + 3]];
    };
    const [r, g, b] = px(10, 11);
    assert.ok(r + g + b > 180, `face should be pale grey-brown, got ${r},${g},${b}`);
    assert.ok(Math.abs(r - g) < 80, `face should not be a villager nose pink, got ${r},${g},${b}`);
  });
});

describe("pillager pose", () => {
  it("reuses the villager profile with a 45° head", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-right"].pitch !== idleA().parts["leg-right"].pitch);
  });
});

describe("generated pillager assets", () => {
  it("writes walk, idle, hurt, and death frames with a crossbow", async () => {
    const svg = await readFile(resolve(ROOT, "assets/pillager-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="held-crossbow"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < 16; i++) {
      const frame = await readFile(resolve(ROOT, "assets/pillager-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "hurt"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/pillager-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
    for (let i = 0; i < DEATH_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/pillager-sprites", `death-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
  });

  it("ships idle and walk flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", 8],
      ["scene-2", 16],
    ]) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/pillager", scene, "lottie.json"), "utf8"),
      );
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
