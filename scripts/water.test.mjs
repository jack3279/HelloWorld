import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  FLOOR,
  SINGLE,
  TILE,
  frameCount,
  frameSignature,
  layoutFloor,
  layoutSingle,
  loadWaterStrip,
  runsOf,
  runsOfTiled,
  tileGrid,
} from "./lib/water-block.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("water strip", () => {
  it("loads the official still-water ripple as a square tile strip", async () => {
    const strip = await loadWaterStrip();
    assert.equal(strip.width, TILE);
    assert.ok(frameCount(strip) >= 16, "enough frames to ripple");
    assert.equal(strip.height % TILE, 0);
  });

  it("changes from frame to frame like moving water", async () => {
    const strip = await loadWaterStrip();
    const n = frameCount(strip);
    const a = frameSignature(strip, 0);
    const b = frameSignature(strip, Math.floor(n / 3));
    const c = frameSignature(strip, Math.floor((2 * n) / 3));
    assert.notEqual(a, b);
    assert.notEqual(b, c);
    assert.notEqual(a, c);
  });

  it("stays water-colored: cool blue, not lava orange", async () => {
    const strip = await loadWaterStrip();
    const runs = runsOf(strip, 0);
    assert.ok(runs.length > 8);
    let wet = 0;
    for (const run of runs) {
      const r = parseInt(run.hex.slice(1, 3), 16);
      const g = parseInt(run.hex.slice(3, 5), 16);
      const b = parseInt(run.hex.slice(5, 7), 16);
      if (b > 200 && b > g && g > r && r < 180) wet += run.x1 - run.x0;
    }
    assert.ok(wet > TILE * TILE * 0.5, "most texels are water blue");
  });
});

describe("water tiles", () => {
  it("lays out a centered square for one block", () => {
    const box = layoutSingle();
    assert.ok(Math.abs(box.size - (SINGLE.w - SINGLE.pad * 2)) < 1e-9);
    assert.ok(Math.abs(box.x - box.y) < 1e-9);
    assert.equal(box.texel * TILE, box.size);
  });

  it("abuts floor tiles with no gap and no overlap", () => {
    const floor = layoutFloor();
    assert.equal(floor.tiles.length, FLOOR.cols * FLOOR.rows);
    assert.equal(floor.texel * TILE * FLOOR.cols, floor.size);
    for (const tile of floor.tiles) {
      if (tile.col + 1 < floor.cols) {
        const right = floor.tiles.find((t) => t.row === tile.row && t.col === tile.col + 1);
        assert.equal(tile.x + tile.size, right.x);
        assert.equal(tile.y, right.y);
      }
      if (tile.row + 1 < floor.rows) {
        const below = floor.tiles.find((t) => t.col === tile.col && t.row === tile.row + 1);
        assert.equal(tile.y + tile.size, below.y);
        assert.equal(tile.x, below.x);
      }
    }
  });

  it("repeats the same 16px period so neighbors share an edge", async () => {
    const strip = await loadWaterStrip();
    const grid = tileGrid(strip, 0, 2, 2);
    assert.equal(grid.length, 32);
    assert.equal(grid[0].length, 32);
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        assert.deepEqual(grid[y][x], grid[y][x + 16]);
        assert.deepEqual(grid[y][x], grid[y + 16][x]);
        assert.deepEqual(grid[y][x], grid[y + 16][x + 16]);
      }
  });

  it("merges color runs across the tile seam", async () => {
    const strip = await loadWaterStrip();
    const runs = runsOfTiled(strip, 0, 2, 2);
    assert.ok(
      runs.some((r) => r.x0 < TILE && r.x1 > TILE),
      "at least one ripple continues past the vertical join",
    );
  });
});

describe("generated water assets", () => {
  it("writes a square face and a seamless floor SVG", async () => {
    const side = await readFile(resolve(ROOT, "assets/water-side.svg"), "utf8");
    const tiles = await readFile(resolve(ROOT, "assets/water-tiles.svg"), "utf8");
    assert.match(side, /id="water-block"/);
    assert.match(tiles, /id="water-floor"/);
    assert.match(side, /viewBox="0 0 512 512"/);
    assert.match(tiles, /viewBox="0 0 512 512"/);
    assert.doesNotMatch(side, /NaN|undefined|<rect[^>]+stroke/);
    assert.doesNotMatch(tiles, /NaN|undefined|<rect[^>]+stroke/);
  });

  it("ships a single-tile ripple flipbook", async () => {
    const lottie = JSON.parse(
      await readFile(resolve(ROOT, "public/projects/water/scene-1/lottie.json"), "utf8"),
    );
    assert.equal(lottie.ip, 0);
    assert.ok(lottie.op >= 16);
    assert.equal(lottie.w, lottie.h);
    assert.equal(lottie.assets.length, 0);
    const shapes = lottie.layers.filter((l) => l.ty === 4);
    assert.equal(shapes.length, lottie.op);
  });

  it("instances one tile precomp across a 3×3 floor", async () => {
    const lottie = JSON.parse(
      await readFile(resolve(ROOT, "public/projects/water/scene-2/lottie.json"), "utf8"),
    );
    assert.equal(lottie.w, lottie.h);
    assert.equal(lottie.assets.length, 1);
    assert.equal(lottie.assets[0].id, "water-tile");
    const refs = lottie.layers.filter((l) => l.ty === 0);
    assert.equal(refs.length, FLOOR.cols * FLOOR.rows);
    assert.ok(refs.every((l) => l.refId === "water-tile"));
    const xs = [...new Set(refs.map((l) => l.ks.p.k[0]))].sort((a, b) => a - b);
    const ys = [...new Set(refs.map((l) => l.ks.p.k[1]))].sort((a, b) => a - b);
    assert.equal(xs.length, FLOOR.cols);
    assert.equal(ys.length, FLOOR.rows);
    const tile = refs[0].w;
    for (let i = 1; i < xs.length; i++) assert.equal(xs[i] - xs[i - 1], tile);
    for (let i = 1; i < ys.length; i++) assert.equal(ys[i] - ys[i - 1], tile);
  });
});
