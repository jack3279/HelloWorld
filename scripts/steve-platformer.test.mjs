import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { MODEL, isHair } from "./lib/steve-model.mjs";
import { ANIMATIONS, catalog, lerpPose, runFrame } from "./lib/steve-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("hair vs face colors", () => {
  it("treats the skin's near-black brown as hair, not the mustache", () => {
    assert.equal(isHair([0x2a, 0x1d, 0x0d]), true);
    assert.equal(isHair([0x24, 0x18, 0x08]), true);
    assert.equal(isHair([0x6a, 0x40, 0x30]), false);
    assert.equal(isHair([0xb6, 0x89, 0x6c]), false);
    assert.equal(isHair([0xff, 0xff, 0xff]), false);
  });
});

describe("steve pose catalog", () => {
  it("names every animation frame", () => {
    const ids = new Set(catalog().map((f) => f.id));
    for (const [name, spec] of Object.entries(ANIMATIONS)) {
      for (const id of spec.frames) {
        assert.ok(ids.has(id), `${name} references missing frame ${id}`);
      }
    }
  });

  it("splits each limb into two hinged segments", () => {
    const byId = Object.fromEntries(MODEL.map((p) => [p.id, p]));
    assert.equal(byId["forearm-right"].parent, "arm-right");
    assert.equal(byId["forearm-left"].parent, "arm-left");
    assert.equal(byId["shin-right"].parent, "leg-right");
    assert.equal(byId["shin-left"].parent, "leg-left");
    assert.ok(byId["arm-right"].min[1] > byId["forearm-right"].max[1] - 0.01);
    assert.ok(byId["leg-right"].min[1] > byId["shin-right"].max[1] - 0.01);
  });

  it("loops the run cycle: phase 0 matches phase 1", () => {
    const a = runFrame(0);
    const b = runFrame(1);
    assert.equal(a.parts["arm-right"].pitch, b.parts["arm-right"].pitch);
    assert.equal(a.parts["forearm-right"].pitch, b.parts["forearm-right"].pitch);
    assert.equal(a.parts["leg-left"].pitch, b.parts["leg-left"].pitch);
    assert.equal(a.parts["shin-left"].pitch, b.parts["shin-left"].pitch);
    assert.equal(a.root.y, b.root.y);
  });

  it("bends the trailing elbow and knee during the run", () => {
    const mid = runFrame(0.25);
    assert.ok(mid.parts["arm-right"].pitch > 40, "right shoulder is back");
    assert.ok(mid.parts["forearm-right"].pitch < -40, "right elbow folds on the backswing");
    assert.ok(mid.parts["leg-right"].pitch < -20, "right hip is forward");
    assert.ok(mid.parts["shin-left"].pitch > 30, "left knee folds on the trail");
  });

  it("interpolates root height between crouch and apex", async () => {
    const { jumpCrouch, jumpApex } = await import("./lib/steve-poses.mjs");
    const mid = lerpPose(jumpCrouch(), jumpApex(), 0.5);
    assert.ok(mid.root.y > 0);
    assert.ok(mid.root.y < jumpApex().root.y);
  });
});

describe("hero svg", () => {
  it("names the split limb groups", async () => {
    const svg = await readFile(resolve(ROOT, "assets/steve.svg"), "utf8");
    for (const part of ["arm-right", "forearm-right", "arm-left", "forearm-left", "leg-right", "shin-right", "leg-left", "shin-left"]) {
      assert.match(svg, new RegExp(`id="${part}"`));
    }
  });
});

describe("generated sprite kit", () => {
  it("atlas matches the files on disk", async () => {
    const atlas = JSON.parse(await readFile(resolve(ROOT, "assets/steve-sprites/atlas.json"), "utf8"));
    assert.equal(atlas.meta.facing, "right");
    for (const [id, frame] of Object.entries(atlas.frames)) {
      const svg = await readFile(resolve(ROOT, "assets/steve-sprites", frame.file), "utf8");
      assert.match(svg, /<svg /);
      assert.doesNotMatch(svg, /NaN|undefined/);
      assert.ok(svg.includes(`id="${id}"`) || svg.includes(`id="steve"`), id);
      for (const part of ["forearm-right", "forearm-left", "shin-right", "shin-left"]) {
        assert.ok(svg.includes(`id="${part}"`) || svg.includes(`id="${id}-${part}"`), `${id} ${part}`);
      }
    }
  });

  it("lottie scenes are self-contained shape flipbooks", async () => {
    const scenes = [
      ["steve-platformer", "scene-1", 256, 320],
      ["steve-platformer", "scene-2", 256, 320],
      ["steve-platformer", "scene-3", 256, 320],
      ["steve", "scene-1", 512, 640],
      ["steve", "scene-2", 512, 640],
    ];
    for (const [project, scene, w, h] of scenes) {
      const dir = resolve(ROOT, "public/projects", project, scene);
      const lottie = JSON.parse(await readFile(resolve(dir, "lottie.json"), "utf8"));
      assert.ok(lottie.fr > 0, `${project}/${scene} fps`);
      assert.equal(lottie.ip, 0);
      assert.ok(lottie.op > lottie.ip, `${project}/${scene} duration`);
      assert.equal(lottie.w, w);
      assert.equal(lottie.h, h);
      assert.equal(lottie.assets.length, 0);
      const shapes = lottie.layers.filter((l) => l.ty === 4);
      assert.ok(shapes.length >= 2, `${project}/${scene} layers`);
      for (const layer of shapes) {
        assert.ok(layer.shapes.length > 0, layer.nm);
        assert.ok(layer.ip < layer.op, layer.nm);
      }
    }
  });
});
