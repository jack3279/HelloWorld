import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { apply, loadCatSkin, rotX } from "./lib/steve-model.mjs";
import { CAT_MODEL } from "./lib/cat-model.mjs";
import { BODY_REST_PITCH, FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, sampleRest, walkFrame } from "./lib/cat-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function pitchedSpan(part, pitch, axis) {
  const m = rotX(pitch);
  const values = [];
  for (const x of [part.min[0], part.max[0]]) {
    for (const y of [part.min[1], part.max[1]]) {
      for (const z of [part.min[2], part.max[2]]) {
        const spun = apply(m, [x - part.pivot[0], y - part.pivot[1], z - part.pivot[2]]);
        const world = [spun[0] + part.pivot[0], spun[1] + part.pivot[1], spun[2] + part.pivot[2]];
        values.push(world[axis]);
      }
    }
  }
  return [Math.min(...values), Math.max(...values)];
}

function overlap(a, b) {
  return Math.min(a[1], b[1]) - Math.max(a[0], b[0]);
}

describe("cat model", () => {
  it("is a head, muzzle, ears, body, four legs, and a two-segment tail", () => {
    const ids = CAT_MODEL.map((p) => p.id);
    assert.ok(ids.includes("head"));
    assert.ok(ids.includes("snout"));
    assert.ok(ids.includes("ear-left"));
    assert.ok(ids.includes("tail1"));
    assert.ok(ids.includes("tail2"));
    assert.equal(CAT_MODEL.find((p) => p.id === "snout").parent, "head");
    assert.equal(CAT_MODEL.find((p) => p.id === "tail2").parent, "tail1");
    const front = CAT_MODEL.find((p) => p.id === "leg-front-right");
    assert.ok(front.max[1] - front.min[1] >= 9.5, "front legs are 10 tall");
    const body = CAT_MODEL.find((p) => p.id === "body");
    assert.equal(body.pivot[1], 7);
  });

  it("loads the official red-tabby skin", async () => {
    const skin = await loadCatSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("cat pose", () => {
  it("keeps the body at the vanilla rest pitch and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(pose.parts.body.pitch >= BODY_REST_PITCH);
    assert.ok(pose.parts.tail1);
  });

  it("idles without leaving the 45° head turn", () => {
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.head.yaw, FACE.yaw);
    }
  });

  it("tucks the head when resting", () => {
    const rest = sampleRest(0);
    assert.ok(rest.parts.head.pitch > idleA().parts.head.pitch);
  });

  it("keeps the pitched torso overlapping the head and front legs", () => {
    const pose = idleA();
    const body = CAT_MODEL.find((p) => p.id === "body");
    const head = CAT_MODEL.find((p) => p.id === "head");
    const front = CAT_MODEL.find((p) => p.id === "leg-front-right");
    const bodyZ = pitchedSpan(body, pose.parts.body.pitch, 2);
    const headZ = pitchedSpan(head, pose.parts.head.pitch ?? 0, 2);
    const bodyY = pitchedSpan(body, pose.parts.body.pitch, 1);
    const frontY = pitchedSpan(front, pose.parts["leg-front-right"].pitch ?? 0, 1);
    assert.ok(overlap(bodyZ, headZ) > 0, `body z ${bodyZ} vs head ${headZ}`);
    assert.ok(overlap(bodyY, frontY) > 0, `body y ${bodyY} vs front leg ${frontY}`);
  });
});

describe("generated cat assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/cat-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="tail1"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/cat-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/cat-sprites", `${clip}-${i}.svg`), "utf8");
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
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/cat", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
