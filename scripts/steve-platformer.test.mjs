import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { MODEL, bendBlend, buildFigure, isHair, loadSkin } from "./lib/steve-model.mjs";
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

  it("skins each limb as one bendy tube", () => {
    const limbs = MODEL.filter((p) => p.kind === "bendy");
    assert.equal(limbs.length, 4);
    const byId = Object.fromEntries(MODEL.map((p) => [p.id, p]));
    assert.equal(byId["arm-right"].jointPart, "forearm-right");
    assert.equal(byId["arm-left"].jointPart, "forearm-left");
    assert.equal(byId["leg-right"].jointPart, "shin-right");
    assert.equal(byId["leg-left"].jointPart, "shin-left");
    for (const part of limbs) {
      assert.equal(part.max[1] - part.min[1], 12);
      assert.ok(part.joint);
      assert.ok(part.joint[1] > part.min[1]);
      assert.ok(part.joint[1] < part.max[1]);
    }
    assert.equal(bendBlend(24, 18, 4), 0);
    assert.equal(bendBlend(12, 18, 4), 1);
    assert.ok(Math.abs(bendBlend(18, 18, 4) - 0.5) < 1e-9);
  });

  it("bends a limb as a continuous tube", async () => {
    const skin = await loadSkin();
    const view = { yaw: 90, pitch: 0 };
    const straight = buildFigure({ skin, pose: { view, parts: {} } });
    const bent = buildFigure({
      skin,
      pose: { view, parts: { "forearm-right": { pitch: -80 } } },
    });
    const ids = new Set(bent.parts.map((p) => p.id));
    assert.ok(ids.has("arm-right"));
    assert.ok(ids.has("forearm-right"));
    const pts = (figure, id) =>
      figure.parts
        .find((p) => p.id === id)
        .faces.flatMap((f) => f.points);
    const handY = (figure) => Math.min(...pts(figure, "forearm-right").map((p) => p[1]));
    assert.ok(handY(bent) > handY(straight) + 1, "elbow fold lifts the hand in profile");
    for (const part of bent.parts) {
      for (const face of part.faces) {
        for (const p of face.points) {
          assert.ok(p.every((n) => Number.isFinite(n)), `${part.id} ${face.faceName}`);
        }
      }
    }
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
