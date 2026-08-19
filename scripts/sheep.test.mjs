import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadSheepSkin, loadSheepWoolSkin } from "./lib/steve-model.mjs";
import { SHEEP_MODEL, SHEEP_WOOL } from "./lib/sheep-model.mjs";
import { BODY_REST_PITCH, FACE, IDLE_FRAMES, WALK_FRAMES, idleA, walkFrame } from "./lib/sheep-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("sheep model", () => {
  it("is a quadruped with a wool overlay", () => {
    const ids = SHEEP_MODEL.map((p) => p.id).sort();
    assert.deepEqual(ids, ["body", "head", "leg-front-left", "leg-front-right", "leg-hind-left", "leg-hind-right"]);
    assert.equal(SHEEP_WOOL.find((p) => p.id === "wool-head").parent, "head");
    assert.equal(SHEEP_WOOL.find((p) => p.id === "wool-body").parent, "body");
  });

  it("loads the official sheep and wool skins", async () => {
    const skin = await loadSheepSkin();
    const wool = await loadSheepWoolSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
    assert.equal(wool.width, 64);
    assert.ok(wool.height >= 32);
  });
});

describe("sheep pose", () => {
  it("keeps the body at the vanilla rest pitch and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(pose.parts.body.pitch >= BODY_REST_PITCH);
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-front-right"].pitch < 0);
  });
});

describe("generated sheep assets", () => {
  it("writes a woolly side-view SVG", async () => {
    const svg = await readFile(resolve(ROOT, "assets/sheep-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="wool-body"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("writes walk, idle, rest, hurt, and death frames", async () => {
    for (let i = 0; i < WALK_FRAMES; i++) {
      const svg = await readFile(resolve(ROOT, "assets/sheep-sprites", `walk-${i}.svg`), "utf8");
      assert.match(svg, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const svg = await readFile(resolve(ROOT, "assets/sheep-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(svg, /<svg /);
      }
    }
  });

  it("ships idle, walk, and rest flipbooks", async () => {
    for (const [scene, minLayers] of [["scene-1", IDLE_FRAMES], ["scene-2", WALK_FRAMES], ["scene-3", 8]]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/sheep", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.filter((l) => l.ty === 4).length >= minLayers, scene);
    }
  });
});
