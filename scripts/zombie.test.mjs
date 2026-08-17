import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadZombieSkin, normalizePlayerSkin } from "./lib/steve-model.mjs";
import { FACE, WALK_FRAMES, idleA, sampleDeath, sampleHurt, sampleIdle, walkFrame } from "./lib/zombie-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("zombie skin", () => {
  it("expands a 64x32 net and mirrors the empty left limbs", () => {
    const rgba = new Uint8Array(64 * 32 * 4);
    // Paint one opaque texel on the right-arm front so the copy is visible.
    const i = (22 * 64 + 45) * 4;
    rgba.set([10, 20, 30, 255], i);
    const skin = normalizePlayerSkin({ width: 64, height: 32, rgba });
    assert.equal(skin.height, 64);
    // (45,22) is +1 in the 4-wide front; a horizontal flip lands at +2 → (38,54).
    const left = (54 * 64 + 38) * 4;
    assert.equal(skin.rgba[left + 3], 255);
    assert.equal(skin.rgba[left], 10);
  });

  it("loads the official zombie face: green skin and dark eye sockets", async () => {
    const skin = await loadZombieSkin();
    assert.equal(skin.width, 64);
    assert.equal(skin.height, 64);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2], skin.rgba[i + 3]];
    };
    const [r, g, b] = px(10, 10);
    assert.ok(g > r + 20 && g > b + 20, `face skin should be green, got ${r},${g},${b}`);
    const eye = px(9, 12);
    assert.ok(eye[0] < 40 && eye[1] < 40 && eye[2] < 40, `eye socket should be dark, got ${eye}`);
    assert.ok(px(36, 54)[3] > 0, "left arm was mirrored");
  });
});

describe("zombie pose", () => {
  it("keeps the body in profile and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, -45);
    assert.equal(FACE.yaw, -45);
    assert.ok(pose.parts["arm-right"].pitch < -70, "right arm reaches forward");
    assert.ok(pose.parts["arm-left"].pitch < -70, "left arm reaches forward");
  });

  it("idles without leaving the 45° head turn", () => {
    for (let i = 0; i < 8; i++) {
      assert.equal(sampleIdle(i / 8).parts.head.yaw, -45);
    }
  });

  it("loops the walk cycle and keeps the zombie reach", () => {
    const a = walkFrame(0);
    const b = walkFrame(1);
    assert.equal(a.parts["arm-right"].pitch, b.parts["arm-right"].pitch);
    assert.equal(a.parts["leg-left"].pitch, b.parts["leg-left"].pitch);
    assert.equal(a.root.y, b.root.y);
    assert.equal(a.parts.head.yaw, -45);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const pose = walkFrame(i / WALK_FRAMES);
      assert.equal(pose.parts.head.yaw, -45, `walk-${i} head`);
      assert.ok(pose.parts["arm-right"].pitch < -60, `walk-${i} right arm stays forward`);
      assert.ok(pose.parts["arm-left"].pitch < -60, `walk-${i} left arm stays forward`);
    }
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-right"].pitch < passing.parts["leg-left"].pitch, "right leg leads at 1/4");
    const other = walkFrame(0.75);
    assert.ok(other.parts["leg-left"].pitch < other.parts["leg-right"].pitch, "left leg leads at 3/4");
  });

  it("flashes on hurt and collapses on death", () => {
    assert.ok(sampleHurt(0).flash > 0.5);
    assert.ok(sampleDeath(1).root.y < -2);
  });
});

describe("generated zombie assets", () => {
  it("writes a side-view SVG with a head group and no broken numbers", async () => {
    const svg = await readFile(resolve(ROOT, "assets/zombie-side.svg"), "utf8");
    assert.match(svg, /<svg /);
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="zombie"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    assert.match(svg, /45 degrees|45°/);
  });

  it("ships self-contained idle and walk flipbooks", async () => {
    const scenes = [
      ["scene-1", 8],
      ["scene-2", WALK_FRAMES],
      ["scene-3", 8],
      ["scene-4", 8],
    ];
    for (const [scene, minLayers] of scenes) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/zombie", scene, "lottie.json"), "utf8"),
      );
      assert.equal(lottie.ip, 0, scene);
      assert.ok(lottie.op > lottie.ip, scene);
      assert.equal(lottie.w, 512, scene);
      assert.equal(lottie.h, 520, scene);
      assert.equal(lottie.assets.length, 0, scene);
      const shapes = lottie.layers.filter((l) => l.ty === 4);
      assert.ok(shapes.length >= minLayers, `${scene} layers`);
      for (const layer of shapes) {
        assert.ok(layer.shapes.length > 0, layer.nm);
        assert.ok(layer.ip < layer.op, layer.nm);
      }
    }
  });

  it("writes walk SVG frames without broken numbers", async () => {
    const walk = await readFile(resolve(ROOT, "assets/zombie-walk.svg"), "utf8");
    assert.match(walk, /<svg /);
    assert.match(walk, /id="head"/);
    assert.doesNotMatch(walk, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/zombie-sprites", `walk-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
      assert.doesNotMatch(svg, /NaN|undefined/);
    }
  });
});
