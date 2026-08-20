import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadSheepSkin } from "./lib/steve-model.mjs";
import { SHEEP_MODEL } from "./lib/sheep-model.mjs";
import { BODY_REST_PITCH, FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle, sampleRest, walkFrame } from "./lib/sheep-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("sheep model", () => {
  it("is a head, body, and four legs — no arms", () => {
    const ids = SHEEP_MODEL.map((p) => p.id);
    assert.deepEqual(ids.sort(), [
      "body",
      "head",
      "leg-front-left",
      "leg-front-right",
      "leg-hind-left",
      "leg-hind-right",
    ]);
    assert.equal(SHEEP_MODEL.find((p) => p.id === "head").parent, undefined);
    for (const id of ids.filter((x) => x.startsWith("leg-"))) {
      const leg = SHEEP_MODEL.find((p) => p.id === id);
      assert.equal(leg.max[1] - leg.min[1], 12);
    }
  });

  it("loads the official wool skin", async () => {
    const skin = await loadSheepSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2], skin.rgba[i + 3]];
    };
    const [r, g, b, a] = px(8, 8);
    assert.ok(a > 200, "face texel should be opaque");
    assert.ok(r + g + b > 120, `face skin should be pale wool or flesh, got ${r},${g},${b}`);
  });
});

describe("sheep pose", () => {
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
  });

  it("droops the head and tucks the legs when resting", () => {
    const rest = sampleRest(0);
    const idle = idleA();
    assert.ok(rest.parts.head.pitch > idle.parts.head.pitch);
    assert.ok(rest.root.y < (idle.root?.y ?? 0));
  });
});

describe("generated sheep assets", () => {
  it("writes a side-view SVG with a head and no arms", async () => {
    const svg = await readFile(resolve(ROOT, "assets/sheep-side.svg"), "utf8");
    assert.match(svg, /<svg /);
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="sheep"/);
    assert.match(svg, /id="leg-front-right"/);
    assert.doesNotMatch(svg, /id="arm-/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("ships idle, walk, and rest flipbooks", async () => {
    const scenes = [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ];
    for (const [scene, minLayers] of scenes) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/sheep", scene, "lottie.json"), "utf8"),
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

  it("writes walk, idle, and rest SVG frames", async () => {
    const walk = await readFile(resolve(ROOT, "assets/sheep-walk.svg"), "utf8");
    assert.match(walk, /<svg /);
    assert.doesNotMatch(walk, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/sheep-sprites", `walk-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (let i = 0; i < IDLE_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/sheep-sprites", `idle-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (let i = 0; i < REST_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/sheep-sprites", `rest-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (const clip of ["hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const svg = await readFile(resolve(ROOT, "assets/sheep-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(svg, /<svg /);
      }
    }
  });
});
