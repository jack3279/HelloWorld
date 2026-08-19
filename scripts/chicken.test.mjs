import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadChickenSkin } from "./lib/steve-model.mjs";
import { CHICKEN_MODEL } from "./lib/chicken-model.mjs";
import { BODY_REST_PITCH, FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, sampleRest, walkFrame } from "./lib/chicken-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("chicken model", () => {
  it("is a head, beak, wattle, body, two legs, and two wings", () => {
    const ids = CHICKEN_MODEL.map((p) => p.id).sort();
    assert.deepEqual(ids, ["beak", "body", "comb", "head", "leg-left", "leg-right", "wing-left", "wing-right"]);
    assert.equal(CHICKEN_MODEL.find((p) => p.id === "beak").parent, "head");
    assert.equal(CHICKEN_MODEL.find((p) => p.id === "head").parent, undefined);
  });

  it("loads the official chicken skin", async () => {
    const skin = await loadChickenSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("chicken pose", () => {
  it("keeps the body at the vanilla rest pitch and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, -45);
    assert.equal(FACE.yaw, -45);
    assert.ok(pose.parts.body.pitch >= BODY_REST_PITCH);
  });

  it("walks with opposite legs and flapping wings", () => {
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-right"].pitch < 0, "right leg steps forward");
    assert.ok(passing.parts["leg-left"].pitch > 0, "left leg steps back");
    const flapping = walkFrame(0.125);
    assert.ok(flapping.parts["wing-right"].pitch > idleA().parts["wing-right"].pitch);
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.head.yaw, -45);
    }
  });

  it("pecks when resting", () => {
    const rest = sampleRest(0);
    assert.ok(rest.parts.head.pitch > idleA().parts.head.pitch);
  });
});

describe("generated chicken assets", () => {
  it("writes a side-view SVG with a beak and wings", async () => {
    const svg = await readFile(resolve(ROOT, "assets/chicken-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="beak"/);
    assert.match(svg, /id="wing-right"/);
    assert.doesNotMatch(svg, /id="arm-/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("writes walk, idle, rest, hurt, and death frames", async () => {
    for (let i = 0; i < WALK_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/chicken-sprites", `walk-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const svg = await readFile(resolve(ROOT, "assets/chicken-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(svg, /<svg /);
      }
    }
  });

  it("ships idle, walk, and peck flipbooks", async () => {
    for (const [scene, minLayers] of [["scene-1", IDLE_FRAMES], ["scene-2", WALK_FRAMES], ["scene-3", REST_FRAMES]]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/chicken", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.filter((l) => l.ty === 4).length >= minLayers, scene);
    }
  });
});
