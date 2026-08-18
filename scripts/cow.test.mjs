import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadCowSkin } from "./lib/steve-model.mjs";
import { COW_MODEL } from "./lib/cow-model.mjs";
import { BODY_REST_PITCH, FACE, WALK_FRAMES, idleA, sampleIdle, walkFrame } from "./lib/cow-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("cow model", () => {
  it("is a head, horns, body, udder, and four legs — no arms", () => {
    const ids = COW_MODEL.map((p) => p.id);
    assert.deepEqual(ids.sort(), [
      "body",
      "head",
      "horn-left",
      "horn-right",
      "leg-front-left",
      "leg-front-right",
      "leg-hind-left",
      "leg-hind-right",
      "udder",
    ]);
    assert.equal(COW_MODEL.find((p) => p.id === "horn-left").parent, "head");
    assert.equal(COW_MODEL.find((p) => p.id === "udder").parent, "body");
    assert.equal(COW_MODEL.find((p) => p.id === "head").parent, undefined);
    for (const id of ids.filter((x) => x.startsWith("leg-"))) {
      const leg = COW_MODEL.find((p) => p.id === id);
      assert.equal(leg.max[1] - leg.min[1], 12);
    }
  });

  it("loads the official brown-and-white skin", async () => {
    const skin = await loadCowSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2]];
    };
    const [r, g, b] = px(8, 8);
    assert.ok(r > 40 && g > 25 && r >= g && b < r, `face skin should be warm brown, got ${r},${g},${b}`);
  });
});

describe("cow pose", () => {
  it("keeps the body in profile at the vanilla rest pitch and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, -45);
    assert.equal(FACE.yaw, -45);
    assert.ok(pose.parts.body.pitch >= BODY_REST_PITCH);
  });

  it("idles and walks without leaving the 45° head turn or the 90° body rest", () => {
    for (let i = 0; i < 8; i++) {
      const pose = sampleIdle(i / 8);
      assert.equal(pose.parts.head.yaw, -45);
      assert.ok(pose.parts.body.pitch >= BODY_REST_PITCH);
    }
    for (let i = 0; i < WALK_FRAMES; i++) {
      const pose = walkFrame(i / WALK_FRAMES);
      assert.equal(pose.parts.head.yaw, -45);
      assert.ok(pose.parts.body.pitch >= BODY_REST_PITCH);
    }
  });

  it("loops the walk and swings opposite corners together", () => {
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-front-right"].pitch < 0, "front-right steps forward");
    assert.ok(passing.parts["leg-hind-left"].pitch < 0, "hind-left matches front-right");
    assert.ok(passing.parts["leg-front-left"].pitch > 0, "front-left goes back");
    assert.ok(passing.parts["leg-hind-right"].pitch > 0, "hind-right matches front-left");
  });
});

describe("generated cow assets", () => {
  it("writes a side-view SVG with horns and no arms", async () => {
    const svg = await readFile(resolve(ROOT, "assets/cow-side.svg"), "utf8");
    assert.match(svg, /<svg /);
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="horn-left"/);
    assert.match(svg, /id="cow"/);
    assert.match(svg, /id="leg-front-right"/);
    assert.doesNotMatch(svg, /id="arm-/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("ships idle and walk flipbooks", async () => {
    const scenes = [
      ["scene-1", 8],
      ["scene-2", WALK_FRAMES],
    ];
    for (const [scene, minLayers] of scenes) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/cow", scene, "lottie.json"), "utf8"),
      );
      assert.equal(lottie.ip, 0, scene);
      assert.ok(lottie.op > lottie.ip, scene);
      assert.equal(lottie.assets.length, 0, scene);
      const shapes = lottie.layers.filter((l) => l.ty === 4);
      assert.ok(shapes.length >= minLayers, `${scene} layers`);
      for (const layer of shapes) {
        assert.ok(layer.shapes.length > 0, layer.nm);
        assert.ok(layer.ip < layer.op, layer.nm);
      }
    }
  });

  it("writes walk SVG frames", async () => {
    const walk = await readFile(resolve(ROOT, "assets/cow-walk.svg"), "utf8");
    assert.match(walk, /<svg /);
    assert.doesNotMatch(walk, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/cow-sprites", `walk-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
  });
});
