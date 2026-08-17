import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadSkeletonSkin } from "./lib/steve-model.mjs";
import { FACE, WALK_FRAMES, drawFrame, idleA, sampleDeath, sampleHurt, sampleIdle, walkFrame } from "./lib/skeleton-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("skeleton skin", () => {
  it("loads the official bone-white face with dark sockets", async () => {
    const skin = await loadSkeletonSkin();
    assert.ok(skin.width >= 64);
    assert.ok(skin.height >= 32);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2], skin.rgba[i + 3]];
    };
    const [r, g, b] = px(10, 10);
    assert.ok(r > 140 && g > 140 && b > 140, `face should be bone, got ${r},${g},${b}`);
    const eye = px(9, 12);
    assert.ok(eye[0] < 90 && eye[1] < 90 && eye[2] < 90 && eye[0] < r / 2, `eye socket should be dark, got ${eye}`);
  });
});

describe("skeleton pose", () => {
  it("keeps the body in profile and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, -45);
    assert.equal(FACE.yaw, -45);
  });

  it("loops the walk and swings opposite arm and leg", () => {
    const a = walkFrame(0);
    const b = walkFrame(1);
    assert.equal(a.parts["leg-right"].pitch, b.parts["leg-right"].pitch);
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-right"].pitch < passing.parts["leg-left"].pitch);
    const other = walkFrame(0.75);
    assert.ok(other.parts["leg-left"].pitch < other.parts["leg-right"].pitch);
    for (let i = 0; i < 8; i++) assert.equal(sampleIdle(i / 8).parts.head.yaw, -45);
  });

  it("raises the bow arm on the draw cycle", () => {
    const idle = idleA();
    const drawn = drawFrame(0.5);
    assert.ok(drawn.parts["arm-left"].pitch < idle.parts["arm-left"].pitch - 40);
    assert.equal(drawn.parts.head.yaw, -45);
    assert.ok(drawn.bowPull > 0.8);
    assert.ok(drawn.parts["held-bow"]);
  });

  it("flashes on hurt and collapses on death", () => {
    const flashes = Array.from({ length: 8 }, (_, i) => sampleHurt(i / 7).flash);
    assert.ok(flashes.some((f) => f > 0.5));
    assert.ok(sampleDeath(1).root.y < -2);
  });
});

describe("generated skeleton assets", () => {
  it("writes a side-view SVG", async () => {
    const svg = await readFile(resolve(ROOT, "assets/skeleton-side.svg"), "utf8");
    assert.match(svg, /<svg /);
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="skeleton"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    assert.match(svg, /fill="#([b-fB-F][0-9a-fA-F]{5}|[9a-fA-F]{2}[9a-fA-F]{4})"/);
  });

  it("ships idle, walk, draw, hurt, and death flipbooks", async () => {
    const scenes = [
      ["scene-1", 8],
      ["scene-2", WALK_FRAMES],
      ["scene-3", 12],
      ["scene-4", 8],
      ["scene-5", 8],
    ];
    for (const [scene, minLayers] of scenes) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/skeleton", scene, "lottie.json"), "utf8"),
      );
      assert.equal(lottie.ip, 0, scene);
      assert.ok(lottie.op > lottie.ip, scene);
      assert.equal(lottie.assets.length, 0, scene);
      const shapes = lottie.layers.filter((l) => l.ty === 4);
      assert.ok(shapes.length >= minLayers, `${scene} layers`);
    }
    const draw = await readFile(resolve(ROOT, "public/projects/skeleton/scene-3/lottie.json"), "utf8");
    assert.match(draw, /held-bow/);
  });
});
