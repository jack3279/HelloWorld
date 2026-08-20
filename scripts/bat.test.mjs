import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadBatSkin } from "./lib/steve-model.mjs";
import { BAT_MODEL } from "./lib/bat-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, restA, walkFrame } from "./lib/bat-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("bat model", () => {
  it("is a head, ears, body, feet, and two-segment wings", () => {
    const ids = BAT_MODEL.map((p) => p.id);
    assert.ok(ids.includes("head"));
    assert.ok(ids.includes("wing-right"));
    assert.ok(ids.includes("wing-right-tip"));
    assert.ok(ids.includes("feet"));
    assert.equal(BAT_MODEL.find((p) => p.id === "wing-left-tip").parent, "wing-left");
  });

  it("loads the official bat skin", async () => {
    const skin = await loadBatSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("bat pose", () => {
  it("flaps the wings on the walk clip and hangs upside-down at rest", () => {
    const idle = idleA();
    assert.equal(idle.view.yaw, 90);
    assert.equal(idle.parts.head.yaw, FACE.yaw);
    const flap = walkFrame(0.25);
    assert.ok(Math.abs(flap.parts["wing-right"].yaw) > Math.abs(idle.parts["wing-right"].yaw));
    const hang = restA();
    assert.ok(hang.parts.body.pitch > 90);
  });
});

describe("generated bat assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/bat-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="wing-right"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/bat-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/bat-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, flap, and hang flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/bat", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
