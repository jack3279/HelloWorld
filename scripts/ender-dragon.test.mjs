import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { ENDER_DRAGON_MODEL } from "./lib/ender-dragon-model.mjs";
import { IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, walkFrame } from "./lib/ender-dragon-poses.mjs";
import { loadEnderDragonSkin } from "./lib/steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("ender dragon model", () => {
  it("is a body, neck, head, snout, jaw, and two wings", () => {
    const ids = ENDER_DRAGON_MODEL.map((p) => p.id);
    assert.deepEqual(ids, ["body", "neck", "head", "snout", "jaw", "wing-right", "wing-left"]);
  });

  it("loads the official 256×256 dragon sheet without downscaling", async () => {
    const skin = await loadEnderDragonSkin();
    assert.equal(skin.width, 256);
    assert.equal(skin.height, 256);
  });
});

describe("ender dragon pose", () => {
  it("beats the wings on the fly clip", () => {
    const idle = idleA().parts["wing-right"].roll;
    const fly = walkFrame(0.25).parts["wing-right"].roll;
    assert.ok(Math.abs(fly - idle) > 4);
  });
});

describe("generated ender dragon assets", () => {
  it("writes fly, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/ender-dragon-side.svg"), "utf8");
    assert.match(svg, /id="body"/);
    assert.match(svg, /id="wing-left"/);
    assert.match(svg, /id="jaw"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/ender-dragon-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/ender-dragon-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, fly, and glide flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/ender-dragon", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
