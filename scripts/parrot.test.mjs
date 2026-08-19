import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadParrotSkin } from "./lib/steve-model.mjs";
import { PARROT_MODEL } from "./lib/parrot-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, walkFrame } from "./lib/parrot-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("parrot model", () => {
  it("is a head, crest, beak, body, wings, tail, and two legs", () => {
    const ids = PARROT_MODEL.map((p) => p.id);
    assert.ok(ids.includes("head"));
    assert.ok(ids.includes("beak"));
    assert.ok(ids.includes("crest"));
    assert.ok(ids.includes("wing-left"));
    assert.ok(ids.includes("tail"));
    assert.equal(PARROT_MODEL.find((p) => p.id === "beak").parent, "head");
    assert.equal(PARROT_MODEL.find((p) => p.id === "head").parent, undefined);
  });

  it("loads the official red macaw skin", async () => {
    const skin = await loadParrotSkin();
    assert.ok(skin.width >= 32);
    assert.ok(skin.height >= 32);
  });
});

describe("parrot pose", () => {
  it("keeps the body upright and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(pose.parts.body.pitch < 40);
  });

  it("walks with opposite legs and flapping wings", () => {
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-right"].pitch < 0, "right leg steps forward");
    assert.ok(passing.parts["leg-left"].pitch > 0, "left leg steps back");
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.head.yaw, FACE.yaw);
    }
  });
});

describe("generated parrot assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/parrot-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="beak"/);
    assert.match(svg, /id="wing-right"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/parrot-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/parrot-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, walk, and rest flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/parrot", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
