import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  ATLAS,
  ITEMS,
  PAGE_SIZE,
  SINGLE,
  TILE,
  itemPages,
  layoutAtlas,
  layoutSingle,
  loadItem,
  runsOf,
} from "./lib/minecraft-items.mjs";

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

describe("minecraft item catalog", () => {
  it("has two pages of tools including swords and pickaxes", () => {
    const ids = ITEMS.map((it) => it.id);
    assert.equal(ITEMS.length, PAGE_SIZE * 2);
    assert.equal(itemPages().length, 2);
    for (const id of ["diamond-sword", "iron-sword", "diamond-pickaxe", "wood-pickaxe", "bow"]) {
      assert.ok(ids.includes(id), id);
    }
  });

  it("loads official 16×16 sprites", async () => {
    for (const item of ITEMS) {
      const png = await loadItem(item.id);
      assert.ok(png.width >= TILE, item.id);
      assert.ok(png.height >= TILE, item.id);
    }
  });
});

describe("item sprites", () => {
  it("keeps transparent corners on a diamond sword", async () => {
    const png = await loadItem("diamond-sword");
    assert.equal(png.rgba[3], 0);
    const runs = runsOf(png);
    const painted = runs.reduce((n, r) => n + (r.x1 - r.x0), 0);
    assert.ok(painted < TILE * TILE * 0.6, "sword is a silhouette, not a full tile");
    assert.ok(painted > 20);
  });

  it("paints diamond teal, iron gray, and a brown pickaxe handle", async () => {
    const sword = runsOf(await loadItem("diamond-sword"));
    const iron = runsOf(await loadItem("iron-sword"));
    const pick = runsOf(await loadItem("diamond-pickaxe"));
    assert.ok(
      coverage(sword, ([r, g, b]) => g > 40 && b > 40 && r < 80) > 8,
      "diamond sword is teal",
    );
    assert.ok(
      coverage(iron, ([r, g, b]) => Math.abs(r - g) < 16 && Math.abs(g - b) < 16 && r > 40) > 8,
      "iron sword is gray",
    );
    assert.ok(
      coverage(pick, ([r, g, b]) => r > 80 && g > 40 && g > b && r > b) > 4,
      "pickaxe has a wood handle",
    );
  });
});

describe("square layout", () => {
  it("centers a single square sprite", () => {
    const box = layoutSingle();
    assert.ok(Math.abs(box.size - (SINGLE.w - SINGLE.pad * 2)) < 1e-9);
    assert.equal(box.texel * TILE, box.size);
  });

  it("lays out a 4×4 atlas with gaps, no overlap", () => {
    const atlas = layoutAtlas(itemPages()[0]);
    assert.equal(atlas.cells.length, PAGE_SIZE);
    for (const cell of atlas.cells) {
      const right = atlas.cells.find((c) => c.row === cell.row && c.col === cell.col + 1);
      if (right) {
        assert.equal(cell.x + cell.size + ATLAS.gap, right.x);
        assert.equal(cell.y, right.y);
      }
    }
  });
});

describe("generated item assets", () => {
  it("writes a square SVG for every catalog sprite", async () => {
    for (const item of ITEMS) {
      const svg = await readFile(resolve(ROOT, `assets/items/${item.id}.svg`), "utf8");
      assert.match(svg, /<svg /);
      assert.match(svg, new RegExp(`id="${item.id}"`));
      assert.match(svg, /viewBox="0 0 512 512"/);
      assert.doesNotMatch(svg, /NaN|undefined|<rect[^>]+fill="#fff"/);
    }
  });

  it("ships a static atlas scene per page", async () => {
    const pages = [
      ["scene-1", "Items — Tools"],
      ["scene-2", "Items — More"],
    ];
    for (const [slug, name] of pages) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, `public/projects/items/${slug}/lottie.json`), "utf8"),
      );
      assert.equal(lottie.ip, 0);
      assert.equal(lottie.op, 1);
      assert.equal(lottie.w, lottie.h);
      assert.equal(lottie.nm, name);
      const shapes = lottie.layers.filter((l) => l.ty === 4);
      assert.equal(shapes.length, 1);
      assert.ok(shapes[0].shapes.length > 0);
    }
  });
});
