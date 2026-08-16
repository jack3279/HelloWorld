import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CANVAS,
  TILE,
  frameCount,
  frameSignature,
  layout,
  loadLavaStrip,
  runsOf,
} from "./lib/lava-block.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("lava strip", () => {
  it("loads the official still-lava boil as a square tile strip", async () => {
    const strip = await loadLavaStrip();
    assert.equal(strip.width, TILE);
    assert.ok(frameCount(strip) >= 16, "enough frames to boil");
    assert.equal(strip.height % TILE, 0);
  });

  it("changes from frame to frame like boiling water", async () => {
    const strip = await loadLavaStrip();
    const n = frameCount(strip);
    const a = frameSignature(strip, 0);
    const b = frameSignature(strip, Math.floor(n / 3));
    const c = frameSignature(strip, Math.floor((2 * n) / 3));
    assert.notEqual(a, b);
    assert.notEqual(b, c);
    assert.notEqual(a, c);
  });

  it("stays lava-colored: hot red-orange, not green or blue", async () => {
    const strip = await loadLavaStrip();
    const runs = runsOf(strip, 0);
    assert.ok(runs.length > 8);
    let hot = 0;
    for (const run of runs) {
      const r = parseInt(run.hex.slice(1, 3), 16);
      const g = parseInt(run.hex.slice(3, 5), 16);
      const b = parseInt(run.hex.slice(5, 7), 16);
      if (r > 140 && r > g && g > b) hot += run.x1 - run.x0;
    }
    assert.ok(hot > TILE * TILE * 0.5, "most texels are lava orange");
  });
});

describe("lava square", () => {
  it("lays out a centered square", () => {
    const box = layout();
    assert.equal(box.size, box.size);
    assert.ok(Math.abs(box.size - (CANVAS.w - CANVAS.pad * 2)) < 1e-9);
    assert.ok(Math.abs(box.x - box.y) < 1e-9);
    assert.equal(box.texel * TILE, box.size);
  });
});

describe("generated lava assets", () => {
  it("writes a square side-view SVG", async () => {
    const svg = await readFile(resolve(ROOT, "assets/lava-side.svg"), "utf8");
    assert.match(svg, /<svg /);
    assert.match(svg, /id="lava-block"/);
    assert.match(svg, /viewBox="0 0 512 512"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("ships a looping boil flipbook", async () => {
    const lottie = JSON.parse(
      await readFile(resolve(ROOT, "public/projects/lava/scene-1/lottie.json"), "utf8"),
    );
    assert.equal(lottie.ip, 0);
    assert.ok(lottie.op >= 16);
    assert.equal(lottie.w, lottie.h);
    assert.equal(lottie.assets.length, 0);
    const shapes = lottie.layers.filter((l) => l.ty === 4);
    assert.equal(shapes.length, lottie.op);
    for (const layer of shapes) {
      assert.ok(layer.shapes.length > 0, layer.nm);
      assert.ok(layer.ip < layer.op, layer.nm);
    }
  });
});
