import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadSlimeSkin } from "./lib/steve-model.mjs";
import { SLIME_MODEL } from "./lib/slime-model.mjs";
import { FACE, IDLE_FRAMES, WALK_FRAMES, idleA, sampleIdle, walkFrame } from "./lib/slime-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("slime model", () => {
  it("is an outer cube, inner cube, two eyes, and a mouth — no limbs", () => {
    const ids = SLIME_MODEL.map((p) => p.id);
    assert.deepEqual(ids.sort(), ["body", "eye-left", "eye-right", "inner", "mouth"]);
    assert.equal(SLIME_MODEL.find((p) => p.id === "inner").parent, "body");
    assert.equal(SLIME_MODEL.find((p) => p.id === "eye-left").parent, "body");
    assert.ok(!ids.some((id) => id.startsWith("leg-") || id.startsWith("arm-")));
  });

  it("loads the official green skin", async () => {
    const skin = await loadSlimeSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2]];
    };
    const [r, g, b] = px(12, 12);
    assert.ok(g > r && g > 80, `outer skin should be green, got ${r},${g},${b}`);
  });
});

describe("slime pose", () => {
  it("turns the cube 45° so both eyes read", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.body.yaw, -45);
    assert.equal(FACE.yaw, -45);
  });

  it("hops by lifting the root and stretching", () => {
    const apex = walkFrame(0.25);
    const land = walkFrame(0.75);
    assert.ok((apex.root?.y ?? 0) > (land.root?.y ?? 0), "apex is off the ground");
    assert.ok((apex.swell ?? 0) > (land.swell ?? 0), "apex stretches");
  });

  it("idles without losing the 45° turn", () => {
    for (let i = 0; i < 8; i++) {
      const pose = sampleIdle(i / 8);
      assert.equal(pose.parts.body.yaw, -45);
    }
  });
});

describe("generated slime assets", () => {
  it("writes a side-view SVG with eyes and no arms", async () => {
    const svg = await readFile(resolve(ROOT, "assets/slime-side.svg"), "utf8");
    assert.match(svg, /<svg /);
    assert.match(svg, /id="body"/);
    assert.match(svg, /id="eye-left"/);
    assert.match(svg, /id="slime"/);
    assert.doesNotMatch(svg, /id="arm-/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("ships idle and hop flipbooks", async () => {
    const scenes = [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
    ];
    for (const [scene, minLayers] of scenes) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/slime", scene, "lottie.json"), "utf8"),
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

  it("writes hop, idle, hurt, and death SVG frames", async () => {
    const walk = await readFile(resolve(ROOT, "assets/slime-walk.svg"), "utf8");
    assert.match(walk, /<svg /);
    assert.doesNotMatch(walk, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/slime-sprites", `walk-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (let i = 0; i < IDLE_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/slime-sprites", `idle-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (const clip of ["hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const svg = await readFile(resolve(ROOT, "assets/slime-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(svg, /<svg /);
      }
    }
  });
});
