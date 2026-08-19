import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  COUNT_WHITE,
  HEART_EMPTY,
  HEART_RED,
  HOTBAR_SLOTS,
  HOTBAR_W,
  composeBar,
  composeButton,
  composeCount,
  composeHearts,
  composeHotbar,
  composeOverlay,
  composeSurvival,
  composeTip,
  loadCrosshair,
  loadHud,
  runCoverage,
  runsOf,
  slice9,
} from "./lib/minecraft-hud.mjs";
import { WORLD_LOADOUT, loadItemPixels } from "./lib/minecraft-items.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("official HUD textures", () => {
  it("keeps the Bedrock heart reds", async () => {
    const heart = await loadHud("heart");
    assert.equal(heart.w, 9);
    assert.equal(heart.h, 9);
    const red = heart.pixels.filter((hex) => hex === HEART_RED).length;
    assert.ok(red >= 20, `expected a filled heart, got ${red} red texels`);
    assert.ok(heart.pixels.includes("#ffc8c8"));
    assert.ok(heart.pixels.includes("#bb1313"));
  });

  it("leaves the heart silhouette empty", async () => {
    const heart = await loadHud("heart");
    const empty = heart.pixels.filter((hex) => hex == null).length;
    assert.ok(empty >= 40, "corners stay transparent");
  });
});

describe("composed chrome", () => {
  it("lays out ten hearts across 81 texels", async () => {
    const row = await composeHearts(20);
    assert.equal(row.w, 81);
    assert.equal(row.h, 9);
    const red = row.pixels.filter((hex) => hex === HEART_RED).length;
    assert.ok(red >= 200, "all ten hearts are filled");
  });

  it("drops to the empty well when health is gone", async () => {
    const row = await composeHearts(0);
    assert.equal(row.pixels.filter((hex) => hex === HEART_RED).length, 0);
    assert.ok(row.pixels.includes(HEART_EMPTY));
  });

  it("keeps a 9-slot hotbar 182 texels wide", async () => {
    const bar = await composeHotbar();
    assert.equal(bar.w, HOTBAR_W);
    assert.equal(HOTBAR_W, 182);
    assert.equal(HOTBAR_SLOTS, 9);
    assert.equal(bar.h, 22);
    const greys = runCoverage(runsOf(bar), (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      return max - min < 40 && max < 180;
    });
    assert.ok(greys > 200, "slot frames stay stone-grey");
  });

  it("9-slices the 4×4 button wider than the source", async () => {
    const src = await loadHud("button-idle");
    assert.equal(src.w, 4);
    const button = await composeButton({ width: 80, height: 16 });
    assert.equal(button.w, 80);
    assert.equal(button.h, 16);
    assert.ok(button.w > src.w);
    assert.ok(button.pixels.includes("#c6c6c6") || button.pixels.includes("#f7f7f7"));
  });

  it("paints a red health bar from the XP 9-slice", async () => {
    const empty = await composeBar({ fill: 0, kind: "health" });
    const full = await composeBar({ fill: 1, kind: "health" });
    assert.equal(full.w, 182);
    assert.equal(full.h, 5);
    assert.equal(empty.pixels.filter((hex) => hex === HEART_RED || hex === "#bb1313").length, 0);
    assert.ok(full.pixels.filter((hex) => hex === HEART_RED).length > 80);
  });

  it("stretches a 9-slice without leaving the source size", () => {
    const src = { w: 4, h: 4, pixels: Array.from({ length: 16 }, (_, i) => (i % 2 ? "#ff0000" : "#00ff00")) };
    const dest = slice9(src, 20, 8);
    assert.equal(dest.w, 20);
    assert.equal(dest.h, 8);
    assert.equal(dest.pixels.length, 160);
  });
});

describe("survival mockup", () => {
  it("stacks armor, hearts, hunger, XP, and the hotbar", async () => {
    const hud = await composeSurvival({ hearts: 15, hunger: 18, armor: 10, selected: 0 });
    assert.ok(hud.w >= HOTBAR_W);
    assert.ok(hud.h >= 46);
    const runs = runsOf(hud);
    assert.ok(runCoverage(runs, (hex) => hex === HEART_RED) > 100);
    assert.ok(runCoverage(runs, (hex) => hex === "#b8b9c4") > 20, "armor plates");
    const heartMax = Math.max(
      ...runs.filter((run) => run.hex === HEART_RED).map((run) => run.x1),
    );
    const hungerMin = Math.min(
      ...runs.filter((run) => run.hex === "#d42a2a" || run.hex === "#b88458").map((run) => run.x0),
    );
    assert.ok(heartMax < hungerMin, "hearts stay left of hunger");
  });
});

describe("generated HUD assets", () => {
  it("writes heart and survival SVGs", async () => {
    const heart = await readFile(resolve(ROOT, "assets/hud/heart.svg"), "utf8");
    const survival = await readFile(resolve(ROOT, "assets/hud/survival.svg"), "utf8");
    assert.match(heart, /<svg /);
    assert.match(heart, /#ff1313/);
    assert.doesNotMatch(heart, /NaN|undefined/);
    assert.match(survival, /id="survival"/);
    assert.match(survival, /#ff1313/);
  });

  it("ships eight Skottie HUD scenes", async () => {
    const names = [
      "HUD — Chrome",
      "HUD — Survival",
      "HUD — Hearts",
      "HUD — Button",
      "HUD — Health bar",
      "HUD — Hotbar",
      "HUD — Stacks",
      "HUD — Crosshair",
    ];
    for (let i = 0; i < names.length; i++) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, `public/projects/hud/scene-${i + 1}/lottie.json`), "utf8"),
      );
      assert.equal(lottie.nm, names[i]);
      assert.equal(lottie.ip, 0);
      assert.ok(lottie.op >= 1);
      assert.equal(lottie.assets.length, 0);
      const shapes = lottie.layers.filter((layer) => layer.ty === 4);
      assert.ok(shapes.length > 0);
      for (const layer of shapes) {
        assert.ok(layer.shapes.length > 0, layer.nm);
        assert.ok(layer.ip < layer.op, layer.nm);
      }
    }
  });

  it("keeps heart red in the survival and health-bar scenes", async () => {
    const survival = JSON.parse(
      await readFile(resolve(ROOT, "public/projects/hud/scene-2/lottie.json"), "utf8"),
    );
    const bar = JSON.parse(
      await readFile(resolve(ROOT, "public/projects/hud/scene-5/lottie.json"), "utf8"),
    );
    const dump = (doc) => JSON.stringify(doc);
    assert.match(dump(survival), /#ff1313|0\.996/);
    assert.match(dump(bar), /#ff1313|0\.996/);
  });

  it("puts item icons in the cycling hotbar scene", async () => {
    const hotbar = JSON.parse(
      await readFile(resolve(ROOT, "public/projects/hud/scene-6/lottie.json"), "utf8"),
    );
    assert.equal(hotbar.nm, "HUD — Hotbar");
    assert.equal(hotbar.layers.filter((layer) => layer.ty === 4).length, 9);
    const dump = JSON.stringify(hotbar);
    assert.match(dump, /0\.2|0\.3/, "diamond teal survives in the loadout");
  });
});

describe("stacks, crosshair, and tip", () => {
  it("hides a count of 1 and paints 64 in white", async () => {
    const one = await composeCount(1);
    const stack = await composeCount(64);
    assert.ok(one.pixels.filter((hex) => hex === COUNT_WHITE).length > 4);
    assert.ok(stack.w > one.w, "64 is wider than 1");
    assert.ok(stack.pixels.filter((hex) => hex === COUNT_WHITE).length > one.pixels.filter((hex) => hex === COUNT_WHITE).length);
  });

  it("puts stack numerals on block slots only when count > 1", async () => {
    const items = [];
    const counts = [];
    for (const slot of WORLD_LOADOUT) {
      items.push(await loadItemPixels(slot.id));
      counts.push(slot.count);
    }
    const bare = await composeHotbar({ items, selected: 1 });
    const stacked = await composeHotbar({ items, counts, selected: 1 });
    const white = (src) => src.pixels.filter((hex) => hex === COUNT_WHITE).length;
    assert.ok(white(stacked) > white(bare) + 10, "stack counts add white glyphs");
  });

  it("keeps a white plus crosshair and a dark item tip", async () => {
    const hair = await loadCrosshair();
    assert.equal(hair.w, 16);
    assert.equal(hair.h, 16);
    assert.equal(hair.pixels[0], null, "crosshair corner is empty");
    const mid = hair.pixels[7 * 16 + 7];
    assert.ok(mid && parseInt(mid.slice(1, 3), 16) > 200, "crosshair center is white");
    const tip = await composeTip("Dirt");
    assert.ok(tip.w > 20);
    assert.ok(tip.pixels.includes("#000000") || tip.pixels.some((hex) => hex && hex.startsWith("#0")), "tip has a dark well");
    assert.ok(tip.pixels.includes(COUNT_WHITE), "tip paints the name");
  });

  it("ships air-bubble HUD icons for drowning", async () => {
    assert.ok(existsSync(resolve(ROOT, "assets/hud/bubble.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/hud/bubble-empty.svg")));
    const bubble = await loadHud("bubble");
    assert.ok(bubble.w >= 8);
    const empty = bubble.pixels.filter((hex) => hex == null).length;
    assert.ok(empty > 0, "bubble keeps a silhouette");
  });

  it("composites crosshair, tip, blocks, and stacks on the overlay", async () => {
    const items = [];
    const counts = [];
    for (const slot of WORLD_LOADOUT) {
      items.push(await loadItemPixels(slot.id));
      counts.push(slot.count);
    }
    const overlay = await composeOverlay({ items, counts, selected: 1, tip: "Dirt" });
    assert.ok(overlay.h > 300);
    assert.ok(overlay.pixels.includes(COUNT_WHITE));
    const brown = overlay.pixels.filter((hex) => {
      if (!hex) return false;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return r > 90 && r > g && g > b;
    }).length;
    assert.ok(brown > 20, "dirt block is in a slot");
  });
});
