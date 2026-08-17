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
  runCoverage,
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

describe("minecraft block catalog", () => {
  it("has four pages including terrain, interactives, and nature", () => {
    const ids = BLOCKS.map((b) => b.id);
    assert.equal(BLOCKS.length, PAGE_SIZE * 4);
    assert.equal(blockPages().length, 4);
    for (const id of [
      "grass",
      "dirt",
      "stone",
      "iron-ore",
      "netherrack",
      "crafting-table",
      "furnace",
      "chest",
      "door-oak",
      "tnt",
      "bedrock",
      "oak-leaves",
      "water",
      "torch",
      "ladder",
      "cactus",
    ]) {
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
      runCoverage(grass, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return g > r && g > b && g > 80;
      }) > TILE * TILE * 0.5,
      "grass is green",
    );
    assert.ok(
      runCoverage(dirt, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 90 && r > g && g > b;
      }) > TILE * TILE * 0.4,
      "dirt is brown",
    );
    assert.ok(
      runCoverage(stone, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return Math.abs(r - g) < 12 && Math.abs(g - b) < 12;
      }) > TILE * TILE * 0.8,
      "stone is gray",
    );
    assert.ok(
      runCoverage(iron, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 160 && g > 130 && b < 130;
      }) > 4,
      "iron ore has tan specks",
    );
    const netherrack = runsOf(await loadBlock("netherrack"));
    const snow = runsOf(await loadBlock("snow"));
    const glow = runsOf(await loadBlock("glowstone"));
    assert.ok(
      runCoverage(netherrack, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 80 && r > g && r > b;
      }) > TILE * TILE * 0.4,
      "netherrack is red",
    );
    assert.ok(
      runCoverage(snow, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 200 && g > 200 && b > 200;
      }) > TILE * TILE * 0.6,
      "snow is white",
    );
    assert.ok(
      runCoverage(glow, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 160 && g > 70 && r > b;
      }) > TILE * TILE * 0.3,
      "glowstone is amber",
    );
  });

  it("keeps crafting-table wood, furnace dark mouth, TNT red, bedrock dark", async () => {
    const table = runsOf(await loadBlock("crafting-table"));
    const furnace = runsOf(await loadBlock("furnace"));
    const tnt = runsOf(await loadBlock("tnt"));
    const bedrock = runsOf(await loadBlock("bedrock"));
    const chest = runsOf(await loadBlock("chest"));
    const door = runsOf(await loadBlock("door-oak"));
    assert.ok(
      runCoverage(table, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 90 && r > b && g > 50 && g < 180;
      }) > TILE * TILE * 0.25,
      "crafting table is wood",
    );
    assert.ok(
      runCoverage(furnace, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r < 50 && g < 50 && b < 50;
      }) > 8,
      "furnace has a dark mouth",
    );
    assert.ok(
      runCoverage(tnt, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 140 && r > g + 40 && r > b + 40;
      }) > TILE * TILE * 0.2,
      "TNT is red",
    );
    assert.ok(
      runCoverage(bedrock, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r < 90 && g < 90 && b < 90;
      }) > TILE * TILE * 0.4,
      "bedrock is dark stone",
    );
    assert.ok(
      runCoverage(chest, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 80 && r > b && g > 40;
      }) > TILE * TILE * 0.3,
      "chest is brown wood",
    );
    assert.ok(door.length > 8, "oak door has planks");
  });

  it("tints leaves green, water blue, torch warm, ladder brown, cactus green", async () => {
    const oak = runsOf(await loadBlock("oak-leaves"));
    const birch = runsOf(await loadBlock("birch-leaves"));
    const spruce = runsOf(await loadBlock("spruce-leaves"));
    const water = runsOf(await loadBlock("water"));
    const torch = runsOf(await loadBlock("torch"));
    const ladder = runsOf(await loadBlock("ladder"));
    const cactus = runsOf(await loadBlock("cactus"));
    const lily = runsOf(await loadBlock("lily-pad"));
    assert.ok(
      runCoverage(oak, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return g > r && g > b && g > 40;
      }) > TILE * TILE * 0.4,
      "oak leaves are green after foliage tint",
    );
    assert.ok(
      runCoverage(birch, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return g > r && g > 50;
      }) > TILE * TILE * 0.4,
      "birch leaves are green after foliage tint",
    );
    assert.ok(
      runCoverage(spruce, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return g > r && g > b;
      }) > TILE * TILE * 0.4,
      "spruce leaves are green after foliage tint",
    );
    assert.ok(
      runCoverage(water, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return b > r && b > 80;
      }) > TILE * TILE * 0.5,
      "water is blue",
    );
    assert.ok(
      runCoverage(torch, (hex) => {
        const [r, g] = rgbOf(hex);
        return r > 140 && g > 70;
      }) > 4,
      "torch has a warm flame",
    );
    assert.ok(torch.length > 4, "torch keeps a sparse silhouette");
    assert.ok(
      runCoverage(ladder, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 70 && r > b && g > 40;
      }) > 20,
      "ladder is brown wood",
    );
    assert.ok(ladder.length > 8, "ladder keeps a sparse silhouette");
    assert.ok(
      runCoverage(cactus, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return g > r && g > b && g > 40;
      }) > TILE * TILE * 0.3,
      "cactus is green",
    );
    assert.ok(
      runCoverage(lily, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return g > r && g > b;
      }) > TILE * TILE * 0.3,
      "lily pad is green after lily tint",
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
      ["scene-3", "Blocks — Interact"],
      ["scene-4", "Blocks — Nature"],
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
