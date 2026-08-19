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
  it("is an outer gel, inner cube, two eyes, and a mouth", () => {
    const ids = SLIME_MODEL.map((p) => p.id).sort();
    assert.deepEqual(ids, ["cube", "eye-left", "eye-right", "mouth", "outer"]);
    assert.equal(SLIME_MODEL.find((p) => p.id === "eye-right").parent, "cube");
  });

  it("loads the official slime skin", async () => {
    const skin = await loadSlimeSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("slime pose", () => {
  it("turns the inner cube 45° and hops on the walk", () => {
    assert.equal(idleA().parts.cube.yaw, FACE.yaw);
    const hop = walkFrame(0.25);
    assert.ok(hop.root.y > (idleA().root?.y ?? 0));
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.cube.yaw, FACE.yaw);
    }
  });
});

describe("generated slime assets", () => {
  it("writes a side-view SVG with eyes and gel", async () => {
    const svg = await readFile(resolve(ROOT, "assets/slime-side.svg"), "utf8");
    assert.match(svg, /id="cube"/);
    assert.match(svg, /id="eye-right"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("writes hop, idle, hurt, and death frames", async () => {
    for (let i = 0; i < WALK_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/slime-sprites", `walk-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (const clip of ["idle", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const svg = await readFile(resolve(ROOT, "assets/slime-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(svg, /<svg /);
      }
    }
  });

  it("ships idle and hop flipbooks", async () => {
    for (const [scene, minLayers] of [["scene-1", IDLE_FRAMES], ["scene-2", WALK_FRAMES]]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/slime", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.filter((l) => l.ty === 4).length >= minLayers, scene);
    }
  });
});
