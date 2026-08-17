import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  ATLAS,
  BLOCKS,
  PAGE_SIZE,
  SINGLE,
  TILE,
  blockPages,
  layoutAtlas,
  layoutSingle,
  loadBlock,
  runsOf,
} from "./lib/minecraft-blocks.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function rgbOf(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function coverage(runs, pred) {
  return runs.reduce((n, run) => n + (pred(rgbOf(run.hex)) ? run.x1 - run.x0 : 0), 0);
}

describe("minecraft block catalog", () => {
  it("has two pages of square faces including grass, ores, wood, and nether", () => {
    const ids = BLOCKS.map((b) => b.id);
    assert.equal(BLOCKS.length, PAGE_SIZE * 2);
    assert.equal(blockPages().length, 2);
    for (const id of ["grass", "dirt", "stone", "iron-ore", "netherrack", "glowstone", "snow"]) {
      assert.ok(ids.includes(id), id);
    }
  });

  it("loads official 16×16 faces", async () => {
    for (const block of BLOCKS) {
      const png = await loadBlock(block.id);
      assert.ok(png.width >= TILE, block.id);
      assert.ok(png.height >= TILE, block.id);
    }
  });
});

describe("block colors", () => {
  it("keeps grass green, dirt brown, netherrack red, snow white", async () => {
    const grass = runsOf(await loadBlock("grass"));
    const dirt = runsOf(await loadBlock("dirt"));
    const stone = runsOf(await loadBlock("stone"));
    const iron = runsOf(await loadBlock("iron-ore"));
    assert.ok(
      coverage(grass, ([r, g, b]) => g > r && g > b && g > 80) > TILE * TILE * 0.5,
      "grass is green",
    );
    assert.ok(
      coverage(dirt, ([r, g, b]) => r > 90 && r > g && g > b) > TILE * TILE * 0.4,
      "dirt is brown",
    );
    assert.ok(
      coverage(stone, ([r, g, b]) => Math.abs(r - g) < 12 && Math.abs(g - b) < 12) > TILE * TILE * 0.8,
      "stone is gray",
    );
    assert.ok(
      coverage(iron, ([r, g, b]) => r > 160 && g > 130 && b < 130) > 4,
      "iron ore has tan specks",
    );
    const netherrack = runsOf(await loadBlock("netherrack"));
    const snow = runsOf(await loadBlock("snow"));
    const glow = runsOf(await loadBlock("glowstone"));
    assert.ok(
      coverage(netherrack, ([r, g, b]) => r > 80 && r > g && r > b) > TILE * TILE * 0.4,
      "netherrack is red",
    );
    assert.ok(
      coverage(snow, ([r, g, b]) => r > 200 && g > 200 && b > 200) > TILE * TILE * 0.6,
      "snow is white",
    );
    assert.ok(
      coverage(glow, ([r, g, b]) => r > 160 && g > 70 && r > b) > TILE * TILE * 0.3,
      "glowstone is amber",
    );
  });
});

describe("square layout", () => {
  it("centers a single square face", () => {
    const box = layoutSingle();
    assert.ok(Math.abs(box.size - (SINGLE.w - SINGLE.pad * 2)) < 1e-9);
    assert.ok(Math.abs(box.x - box.y) < 1e-9);
    assert.equal(box.texel * TILE, box.size);
  });

  it("lays out a 4×4 atlas of squares with gaps, no overlap", () => {
    const atlas = layoutAtlas(blockPages()[0]);
    assert.equal(atlas.cells.length, PAGE_SIZE);
    assert.equal(atlas.cols, 4);
    assert.equal(atlas.rows, 4);
    for (const cell of atlas.cells) {
      assert.equal(cell.size, cell.texel * TILE);
      const right = atlas.cells.find((c) => c.row === cell.row && c.col === cell.col + 1);
      if (right) {
        assert.equal(cell.x + cell.size + ATLAS.gap, right.x);
        assert.equal(cell.y, right.y);
      }
    }
  });
});

describe("generated block assets", () => {
  it("writes a square SVG for every catalog face", async () => {
    for (const block of BLOCKS) {
      const svg = await readFile(resolve(ROOT, `assets/blocks/${block.id}.svg`), "utf8");
      assert.match(svg, /<svg /);
      assert.match(svg, new RegExp(`id="${block.id}"`));
      assert.match(svg, /viewBox="0 0 512 512"/);
      assert.doesNotMatch(svg, /NaN|undefined/);
    }
  });

  it("ships a static atlas scene per page", async () => {
    const pages = [
      ["scene-1", "Blocks — Faces"],
      ["scene-2", "Blocks — More"],
    ];
    for (const [slug, name] of pages) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, `public/projects/blocks/${slug}/lottie.json`), "utf8"),
      );
      assert.equal(lottie.ip, 0);
      assert.equal(lottie.op, 1);
      assert.equal(lottie.w, lottie.h);
      assert.equal(lottie.nm, name);
      const shapes = lottie.layers.filter((l) => l.ty === 4);
      assert.equal(shapes.length, 1);
      assert.ok(shapes[0].shapes.length >= PAGE_SIZE);
    }
  });
});
