import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { composeHotbar, composeSurvival, HOTBAR_SLOTS } from "./lib/minecraft-hud.mjs";
import {
  ATLAS,
  DROP,
  DROP_LOADOUT,
  HOTBAR_LOADOUT,
  BLOCK_ITEMS,
  ITEMS,
  MORE_ITEMS,
  PAGE_SIZE,
  PLAY_ITEMS,
  WORLD_LOADOUT,
  PICKUP,
  SINGLE,
  TILE,
  dropPositionKeys,
  itemPages,
  moreItemPages,
  layoutAtlas,
  layoutSingle,
  loadItem,
  loadItemPixels,
  runCoverage,
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

describe("hotbar item catalog", () => {
  it("has one page of icons the survival hotbar uses", () => {
    const ids = ITEMS.map((it) => it.id);
    assert.equal(ITEMS.length, PAGE_SIZE);
    assert.equal(itemPages().length, 1);
    assert.equal(HOTBAR_LOADOUT.length, HOTBAR_SLOTS);
    for (const id of [...HOTBAR_LOADOUT, ...DROP_LOADOUT, "coal", "shears"]) {
      assert.ok(ids.includes(id), id);
    }
  });

  it("adds armor, mob drops, extra food, and materials on three more pages", () => {
    assert.equal(MORE_ITEMS.length, PAGE_SIZE * 3);
    assert.equal(moreItemPages().length, 3);
    const ids = MORE_ITEMS.map((it) => it.id);
    for (const id of [
      "iron-chestplate",
      "diamond-helmet",
      "netherite-boots",
      "rotten-flesh",
      "bone",
      "gunpowder",
      "ender-pearl",
      "cooked-porkchop",
      "chainmail-helmet",
      "gold-ingot",
      "emerald",
      "bucket",
    ]) {
      assert.ok(ids.includes(id), id);
    }
    assert.ok(!ids.includes("leather-helmet"), "leather helmet is missing from Bedrock items");
    const play = PLAY_ITEMS.map((it) => it.id);
    assert.ok(play.includes("leather-helmet"));
    assert.ok(play.includes("leather-leggings"));
    assert.ok(play.includes("leather-boots"));
    assert.ok(play.includes("leather-chestplate"));
    assert.ok(play.includes("oak-boat"));
    assert.ok(play.includes("blaze-rod"));
    assert.ok(play.includes("blaze-powder"));
    assert.ok(play.includes("nether-wart"));
    assert.ok(play.includes("ghast-tear"));
    assert.ok(play.includes("glass-bottle"));
    assert.ok(play.includes("potion-fire"));
    assert.ok(play.includes("stone-sword"));
    assert.ok(play.includes("cake"));
    assert.ok(play.includes("iron-block"));
    assert.ok(play.includes("brewing-stand"));
    assert.ok(play.includes("enchanting-table"));
    assert.ok(play.includes("trident"));
    assert.ok(play.includes("crossbow"));
    assert.ok(play.includes("music-disc-13"));
    assert.ok(play.includes("music-disc-cat"));
    assert.ok(play.includes("rail"));
    assert.ok(play.includes("minecart"));
    assert.ok(play.includes("lead"));
    assert.ok(play.includes("elytra"));
    assert.ok(play.includes("totem"));
    assert.ok(play.includes("nether-star"));
    assert.ok(play.includes("wither-skull"));
    assert.ok(play.includes("dragon-egg"));
    assert.ok(play.includes("dispenser"));
    assert.ok(play.includes("piston"));
    assert.ok(play.includes("hopper"));
    assert.ok(play.includes("observer"));
    assert.ok(play.includes("door-iron"));
    assert.ok(play.includes("gold-block"));
    assert.ok(play.includes("cloud"));
    assert.ok(play.includes("spruce-log"));
    assert.ok(play.includes("birch-planks"));
  });

  it("loads official 16×16 sprites", async () => {
    for (const item of [...ITEMS, ...MORE_ITEMS]) {
      const png = await loadItem(item.id);
      assert.ok(png.width >= TILE, item.id);
      assert.ok(png.height >= TILE, item.id);
    }
  });

  it("loads block faces used as hotbar items", async () => {
    assert.equal(WORLD_LOADOUT.length, 9);
    for (const block of BLOCK_ITEMS) {
      const png = await loadItem(block.id);
      assert.ok(png.width >= TILE, block.id);
    }
    const dirt = runsOf(await loadItem("dirt"));
    const cobble = runsOf(await loadItem("cobblestone"));
    const torch = runsOf(await loadItem("torch"));
    assert.ok(
      runCoverage(dirt, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 90 && r > b && g > 40;
      }) > TILE * TILE * 0.4,
      "dirt is brown",
    );
    assert.ok(
      runCoverage(cobble, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
      }) > TILE * TILE * 0.4,
      "cobble is gray",
    );
    const painted = runCoverage(torch, () => true);
    assert.ok(painted < TILE * TILE * 0.5, "torch stays a silhouette");
    assert.ok(
      runCoverage(torch, (hex) => {
        const [r, g] = rgbOf(hex);
        return r > 140 && g > 70;
      }) > 4,
      "torch has a warm flame",
    );
  });
});

describe("item icons", () => {
  it("keeps the diamond sword a teal silhouette", async () => {
    const png = await loadItem("diamond-sword");
    assert.equal(png.rgba[3], 0);
    const runs = runsOf(png);
    const painted = runCoverage(runs, () => true);
    assert.ok(painted < TILE * TILE * 0.6, "sword is a silhouette, not a full tile");
    assert.ok(painted > 20);
    assert.ok(
      runCoverage(runs, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return g > 40 && b > 40 && r < 80;
      }) > 8,
      "diamond sword is teal",
    );
  });

  it("paints apple red, bread brown, potion red, diamond cyan", async () => {
    const apple = runsOf(await loadItem("apple"));
    const bread = runsOf(await loadItem("bread"));
    const potion = runsOf(await loadItem("potion-heal"));
    const gem = runsOf(await loadItem("diamond"));
    assert.ok(
      runCoverage(apple, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 140 && r > g + 20 && r > b;
      }) > 8,
      "apple is red",
    );
    assert.ok(
      runCoverage(bread, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 90 && g > 50 && r > b && g > b;
      }) > 8,
      "bread is brown",
    );
    assert.ok(
      runCoverage(potion, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 160 && g < 80 && b < 80;
      }) > 4,
      "healing potion liquid is red",
    );
    assert.ok(
      runCoverage(gem, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return b > 80 && g > 80 && r < 80;
      }) > 8,
      "diamond gem is cyan",
    );
  });

  it("paints bone pale, gunpowder dark, and rotten flesh pink", async () => {
    const bone = runsOf(await loadItem("bone"));
    const powder = runsOf(await loadItem("gunpowder"));
    const flesh = runsOf(await loadItem("rotten-flesh"));
    const helm = runsOf(await loadItem("diamond-helmet"));
    assert.ok(
      runCoverage(bone, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 180 && g > 170 && b > 150;
      }) > 8,
      "bone is pale",
    );
    assert.ok(
      runCoverage(powder, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r < 90 && g < 90 && b < 90;
      }) > 8,
      "gunpowder is dark",
    );
    assert.ok(
      runCoverage(flesh, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return r > 140 && g < 110;
      }) > 6,
      "rotten flesh is pink",
    );
    assert.ok(
      runCoverage(helm, (hex) => {
        const [r, g, b] = rgbOf(hex);
        return b > 80 && g > 80 && r < 90;
      }) > 8,
      "diamond helmet is cyan",
    );
  });
});

describe("drop motion", () => {
  it("falls down, bounces, then settles on the ground", () => {
    const keys = dropPositionKeys({
      x: 200,
      startY: DROP.startY,
      groundY: DROP.ground,
      delay: 0,
      op: DROP.op,
    }).k;
    const ys = keys.map((key) => key.s[1]);
    assert.ok(ys[0] < ys[1], "first move is a fall");
    assert.equal(ys[1], DROP.ground);
    assert.ok(ys[2] < DROP.ground, "bounce leaves the ground");
    assert.equal(ys.at(-1), DROP.ground);
    assert.ok(keys.some((key) => key.t > 22 && key.s[1] !== DROP.ground), "bob after settle");
  });
});

describe("square layout", () => {
  it("centers a single square icon", () => {
    const box = layoutSingle();
    assert.ok(Math.abs(box.size - (SINGLE.w - SINGLE.pad * 2)) < 1e-9);
    assert.ok(Math.abs(box.x - box.y) < 1e-9);
    assert.equal(box.texel * TILE, box.size);
  });

  it("lays out a 4×4 atlas of squares with gaps", () => {
    const atlas = layoutAtlas(ITEMS);
    assert.equal(atlas.cells.length, PAGE_SIZE);
    assert.equal(atlas.cols, 4);
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

describe("hotbar loadout", () => {
  it("blits nine different items into the nine slots", async () => {
    const empty = await composeHotbar({ selected: 0 });
    const items = [];
    for (const id of HOTBAR_LOADOUT) items.push(await loadItemPixels(id));
    const filled = await composeHotbar({ selected: 0, items });
    const teal = (hex) => {
      if (!hex) return false;
      const [r, g, b] = rgbOf(hex);
      return g > 80 && b > 80 && r < 70;
    };
    const red = (hex) => {
      if (!hex) return false;
      const [r, g, b] = rgbOf(hex);
      return r > 160 && g < 90 && b < 90;
    };
    assert.ok(empty.pixels.filter(teal).length < 4, "empty bar has no diamond teal");
    assert.ok(filled.pixels.filter(teal).length > empty.pixels.filter(teal).length + 8, "sword and gem paint teal");
    assert.ok(filled.pixels.filter(red).length > empty.pixels.filter(red).length + 4, "apple or potion paints red");
    const hud = await composeSurvival({ items, selected: 3 });
    assert.ok(hud.w >= filled.w);
    assert.ok(hud.pixels.filter(teal).length > 8);
  });
});

describe("generated item assets", () => {
  it("writes a square SVG for every catalog icon", async () => {
    for (const item of [...ITEMS, ...MORE_ITEMS, ...PLAY_ITEMS]) {
      const svg = await readFile(resolve(ROOT, `assets/items/${item.id}.svg`), "utf8");
      assert.match(svg, /<svg /);
      assert.match(svg, new RegExp(`id="${item.id}"`));
      assert.match(svg, /viewBox="0 0 512 512"/);
      assert.doesNotMatch(svg, /NaN|undefined/);
    }
  });

  it("ships atlas, drop, pickup, armor, drop-food, and materials Skottie scenes", async () => {
    const pages = [
      ["scene-1", "Items — Hotbar", 1],
      ["scene-2", "Items — Drop", DROP.op],
      ["scene-3", "Items — Pickup", PICKUP.op],
      ["scene-4", "Items — Armor", 1],
      ["scene-5", "Items — Drops & food", 1],
      ["scene-6", "Items — Materials", 1],
    ];
    for (const [slug, name, op] of pages) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, `public/projects/items/${slug}/lottie.json`), "utf8"),
      );
      assert.equal(lottie.ip, 0);
      assert.equal(lottie.op, op);
      assert.equal(lottie.nm, name);
      const shapes = lottie.layers.filter((layer) => layer.ty === 4);
      assert.ok(shapes.length >= 1);
    }
    const drop = JSON.parse(await readFile(resolve(ROOT, "public/projects/items/scene-2/lottie.json"), "utf8"));
    const moving = drop.layers.filter((layer) => layer.ks.p.a === 1);
    assert.equal(moving.length, DROP_LOADOUT.length);
    const pickup = JSON.parse(await readFile(resolve(ROOT, "public/projects/items/scene-3/lottie.json"), "utf8"));
    assert.equal(pickup.layers.find((layer) => layer.nm === "diamond-sword").ks.p.a, 1);
    assert.ok(pickup.layers.some((layer) => layer.nm === "hotbar"));
  });
});
