import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadRabbitSkin } from "./lib/steve-model.mjs";
import { RABBIT_MODEL } from "./lib/rabbit-model.mjs";
import { FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, sampleRest, walkFrame } from "./lib/rabbit-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("rabbit model", () => {
  it("is a head, ears, nose, body, front legs, haunches, feet, and tail", () => {
    const ids = RABBIT_MODEL.map((p) => p.id).sort();
    assert.ok(ids.includes("head"));
    assert.ok(ids.includes("ear-left"));
    assert.ok(ids.includes("haunch-right"));
    assert.ok(ids.includes("foot-left"));
    assert.ok(ids.includes("tail"));
    assert.equal(RABBIT_MODEL.find((p) => p.id === "nose").parent, "head");
    assert.equal(RABBIT_MODEL.find((p) => p.id === "head").parent, undefined);
  });

  it("loads the official brown rabbit skin", async () => {
    const skin = await loadRabbitSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("rabbit pose", () => {
  it("keeps a 45° head turn and hops off the ground mid-stride", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    const hop = walkFrame(0.25);
    assert.ok((hop.root?.y ?? 0) > 1, "hop lifts the root");
    assert.ok(hop.parts["ear-right"].pitch > pose.parts["ear-right"].pitch);
  });

  it("idles without leaving the 45° head turn", () => {
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.head.yaw, FACE.yaw);
    }
  });

  it("tucks the ears when resting", () => {
    const rest = sampleRest(0);
    assert.ok(rest.parts.head.pitch > idleA().parts.head.pitch);
    assert.ok(rest.parts["ear-right"].pitch > idleA().parts["ear-right"].pitch);
  });
});

describe("generated rabbit assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/rabbit-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="ear-right"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/rabbit-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/rabbit-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, hop, and rest flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/rabbit", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
