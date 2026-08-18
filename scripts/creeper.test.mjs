import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadCreeperSkin } from "./lib/steve-model.mjs";
import { CREEPER_MODEL } from "./lib/creeper-model.mjs";
import { DEATH_FRAMES, FACE, HURT_FRAMES, SWELL_FRAMES, WALK_FRAMES, idleA, sampleDeath, sampleHurt, sampleIdle, swellFrame, walkFrame } from "./lib/creeper-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("creeper model", () => {
  it("is a head, a body, and four legs — no arms", () => {
    const ids = CREEPER_MODEL.map((p) => p.id);
    assert.deepEqual(ids.sort(), [
      "body",
      "head",
      "leg-front-left",
      "leg-front-right",
      "leg-hind-left",
      "leg-hind-right",
    ]);
    assert.equal(CREEPER_MODEL.find((p) => p.id === "head").parent, "body");
    for (const id of ids.filter((x) => x.startsWith("leg-"))) {
      const leg = CREEPER_MODEL.find((p) => p.id === id);
      assert.equal(leg.max[1] - leg.min[1], 6);
    }
  });

  it("loads the official face: green skin, black eyes, frown", async () => {
    const skin = await loadCreeperSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2]];
    };
    const [r, g, b] = px(8, 8);
    assert.ok(g > r && g > b, `face skin should be green, got ${r},${g},${b}`);
    const eye = px(10, 11);
    assert.ok(eye[0] < 20 && eye[1] < 20 && eye[2] < 20, `eye should be black, got ${eye}`);
    const mouth = px(11, 14);
    assert.ok(mouth[0] < 20 && mouth[1] < 20 && mouth[2] < 20, `frown should be black, got ${mouth}`);
  });
});

describe("creeper pose", () => {
  it("keeps the body in profile and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, -45);
    assert.equal(FACE.yaw, -45);
  });

  it("idles and walks without leaving the 45° head turn", () => {
    for (let i = 0; i < 8; i++) assert.equal(sampleIdle(i / 8).parts.head.yaw, -45);
    for (let i = 0; i < WALK_FRAMES; i++) assert.equal(walkFrame(i / WALK_FRAMES).parts.head.yaw, -45);
  });

  it("loops the walk and swings opposite corners together", () => {
    const a = walkFrame(0);
    const b = walkFrame(1);
    assert.equal(a.parts["leg-front-right"].pitch, b.parts["leg-front-right"].pitch);
    assert.equal(a.root.y, b.root.y);
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-front-right"].pitch < 0, "front-right steps forward");
    assert.ok(passing.parts["leg-hind-left"].pitch < 0, "hind-left matches front-right");
    assert.ok(passing.parts["leg-front-left"].pitch > 0, "front-left goes back");
    assert.ok(passing.parts["leg-hind-right"].pitch > 0, "hind-right matches front-left");
  });

  it("swells then flashes toward white", () => {
    const mid = swellFrame(0.5);
    const start = swellFrame(0);
    assert.ok(mid.swell > start.swell);
    assert.ok(mid.flash > start.flash);
    assert.equal(swellFrame(0).swell, swellFrame(1).swell);
    assert.ok(swellFrame((SWELL_FRAMES - 1) / SWELL_FRAMES).swell < 0.35);
  });

  it("flashes on hurt and tips over on a sword death", () => {
    const flashes = Array.from({ length: HURT_FRAMES }, (_, i) => sampleHurt(i / 7).flash);
    assert.ok(flashes.some((f) => f > 0.5));
    assert.ok(flashes.some((f) => f === 0));
    const dead = sampleDeath(1);
    assert.ok(dead.root.y < -1.5);
    assert.ok(dead.parts.body.pitch > 50);
    assert.ok(dead.roll > 10);
  });
});

describe("generated creeper assets", () => {
  it("writes a side-view SVG with a head and no arms", async () => {
    const svg = await readFile(resolve(ROOT, "assets/creeper-side.svg"), "utf8");
    assert.match(svg, /<svg /);
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="creeper"/);
    assert.match(svg, /id="leg-front-right"/);
    assert.doesNotMatch(svg, /id="arm-/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    const front = svg.split('data-face="front"')[1] ?? "";
    const base = front.match(/<path fill="(#[0-9a-fA-F]+)" d="/);
    assert.ok(base, "front face has a base fill");
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(base[1].slice(i, i + 2), 16));
    assert.ok(g > r && g > 40, `front base should be green field, got ${base[1]}`);
  });

  it("ships idle, walk, and swell flipbooks", async () => {
    const scenes = [
      ["scene-1", 8],
      ["scene-2", WALK_FRAMES],
      ["scene-3", SWELL_FRAMES],
      ["scene-4", HURT_FRAMES],
      ["scene-5", DEATH_FRAMES],
    ];
    for (const [scene, minLayers] of scenes) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/creeper", scene, "lottie.json"), "utf8"),
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

  it("writes walk and swell SVG frames", async () => {
    const walk = await readFile(resolve(ROOT, "assets/creeper-walk.svg"), "utf8");
    assert.match(walk, /<svg /);
    assert.doesNotMatch(walk, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/creeper-sprites", `walk-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (let i = 0; i < SWELL_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/creeper-sprites", `swell-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (let i = 0; i < 8; i++) {
      const svg = await readFile(resolve(ROOT, "assets/creeper-sprites", `idle-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (let i = 0; i < HURT_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/creeper-sprites", `hurt-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (let i = 0; i < DEATH_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/creeper-sprites", `death-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
  });
});
