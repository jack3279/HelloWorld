import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { apply, loadWolfSkin, rotX } from "./lib/steve-model.mjs";
import { WOLF_MODEL } from "./lib/wolf-model.mjs";
import { BODY_REST_PITCH, FACE, IDLE_FRAMES, WALK_FRAMES, idleA, walkFrame } from "./lib/wolf-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function pitchedZ(part, pitch) {
  const m = rotX(pitch);
  const zs = [];
  for (const y of [part.min[1], part.max[1]]) {
    for (const z of [part.min[2], part.max[2]]) {
      const spun = apply(m, [0, y - part.pivot[1], z - part.pivot[2]]);
      zs.push(spun[2] + part.pivot[2]);
    }
  }
  return [Math.min(...zs), Math.max(...zs)];
}

function overlap(a, b) {
  return Math.min(a[1], b[1]) - Math.max(a[0], b[0]);
}

describe("wolf model", () => {
  it("is a head with ears and muzzle, mane, body, four legs, and a tail", () => {
    const ids = WOLF_MODEL.map((p) => p.id).sort();
    assert.deepEqual(ids, [
      "body",
      "ear-left",
      "ear-right",
      "head",
      "leg-front-left",
      "leg-front-right",
      "leg-hind-left",
      "leg-hind-right",
      "mane",
      "muzzle",
      "tail",
    ]);
    assert.equal(WOLF_MODEL.find((p) => p.id === "muzzle").parent, "head");
    assert.equal(WOLF_MODEL.find((p) => p.id === "head").parent, undefined);
  });

  it("loads the official wolf skin", async () => {
    const skin = await loadWolfSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("wolf pose", () => {
  it("pitches the body and mane together toward the head and wags the tail", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(pose.parts.body.pitch <= -BODY_REST_PITCH + 5);
    assert.equal(pose.parts.mane.pitch, pose.parts.body.pitch);
    assert.ok(pose.parts.tail.pitch > 30);
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-front-right"].pitch < 0);
  });

  it("keeps the pitched torso overlapping the head and front legs", () => {
    const pose = idleA();
    const body = WOLF_MODEL.find((p) => p.id === "body");
    const head = WOLF_MODEL.find((p) => p.id === "head");
    const front = WOLF_MODEL.find((p) => p.id === "leg-front-right");
    const bodyZ = pitchedZ(body, pose.parts.body.pitch);
    const headZ = pitchedZ(head, pose.parts.head.pitch ?? 0);
    const frontZ = pitchedZ(front, pose.parts["leg-front-right"].pitch ?? 0);
    assert.ok(overlap(bodyZ, headZ) > 0, `body ${bodyZ} vs head ${headZ}`);
    assert.ok(overlap(bodyZ, frontZ) > 0, `body ${bodyZ} vs front leg ${frontZ}`);
  });
});


describe("generated wolf assets", () => {
  it("writes a side-view SVG with muzzle, mane, and tail", async () => {
    const svg = await readFile(resolve(ROOT, "assets/wolf-side.svg"), "utf8");
    assert.match(svg, /id="muzzle"/);
    assert.match(svg, /id="mane"/);
    assert.match(svg, /id="tail"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("keeps the pitched torso overlapping the head in the idle sprite", async () => {
    const svg = await readFile(resolve(ROOT, "assets/wolf-sprites/idle-0.svg"), "utf8");
    function box(id) {
      const start = svg.indexOf(`id="${id}"`);
      const next = svg.indexOf(`<g id="`, start + 8);
      const chunk = svg.slice(start, next === -1 ? undefined : next);
      const xs = [];
      for (const path of chunk.matchAll(/\bd="([^"]+)"/g)) {
        const nums = [...path[1].matchAll(/-?\d+(?:\.\d+)?/g)].map(Number);
        for (let i = 0; i + 1 < nums.length; i += 2) xs.push(nums[i]);
      }
      return [Math.min(...xs), Math.max(...xs)];
    }
    assert.ok(overlap(box("body"), box("head")) > 0, "body meets head");
    assert.ok(overlap(box("body"), box("leg-front-right")) > 0, "body meets front leg");
  });

  it("writes walk, idle, rest, hurt, and death frames", async () => {
    for (let i = 0; i < WALK_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/wolf-sprites", `walk-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const svg = await readFile(resolve(ROOT, "assets/wolf-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(svg, /<svg /);
      }
    }
  });

  it("ships idle, walk, and rest flipbooks", async () => {
    for (const [scene, minLayers] of [["scene-1", IDLE_FRAMES], ["scene-2", WALK_FRAMES], ["scene-3", 8]]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/wolf", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.filter((l) => l.ty === 4).length >= minLayers, scene);
    }
  });
});
