import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { ANIMATIONS, catalog, lerpPose, runFrame } from "./lib/steve-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("steve pose catalog", () => {
  it("names every animation frame", () => {
    const ids = new Set(catalog().map((f) => f.id));
    for (const [name, spec] of Object.entries(ANIMATIONS)) {
      for (const id of spec.frames) {
        assert.ok(ids.has(id), `${name} references missing frame ${id}`);
      }
    }
  });

  it("loops the run cycle: phase 0 matches phase 1", () => {
    const a = runFrame(0);
    const b = runFrame(1);
    assert.equal(a.parts["arm-right"].pitch, b.parts["arm-right"].pitch);
    assert.equal(a.parts["leg-left"].pitch, b.parts["leg-left"].pitch);
    assert.equal(a.root.y, b.root.y);
  });

  it("interpolates root height between crouch and apex", async () => {
    const { jumpCrouch, jumpApex } = await import("./lib/steve-poses.mjs");
    const mid = lerpPose(jumpCrouch(), jumpApex(), 0.5);
    assert.ok(mid.root.y > 0);
    assert.ok(mid.root.y < jumpApex().root.y);
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
    }
  });

  it("lottie scenes are self-contained shape flipbooks", async () => {
    for (const scene of ["scene-1", "scene-2", "scene-3"]) {
      const dir = resolve(ROOT, "public/projects/steve-platformer", scene);
      const lottie = JSON.parse(await readFile(resolve(dir, "lottie.json"), "utf8"));
      assert.ok(lottie.fr > 0);
      assert.equal(lottie.ip, 0);
      assert.ok(lottie.op > lottie.ip);
      assert.equal(lottie.w, 256);
      assert.equal(lottie.h, 320);
      assert.equal(lottie.assets.length, 0);
      const shapes = lottie.layers.filter((l) => l.ty === 4);
      assert.ok(shapes.length >= 2);
      for (const layer of shapes) {
        assert.ok(layer.shapes.length > 0, layer.nm);
        assert.ok(layer.ip < layer.op, layer.nm);
      }
    }
  });
});
