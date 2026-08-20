import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  ARMOR,
  CHEST_SLOTS,
  FOOD,
  ITEM_LABELS,
  PLAYER_SLOTS,
  RECIPES,
  SMELT,
  TOOL_DUR,
  canCraft,
  canHarvest,
  countOwned,
  craftOnce,
  emptyFurnace,
  emptySlots,
  furnaceTick,
  itemAsset,
  pickSpeed,
  smeltOnce,
  takeNeed,
  transferStack,
  tryAddItem,
} from "../public/game/recipes.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("crafting recipes", () => {
  it("only asks for icons that already ship", () => {
    const ids = new Set();
    for (const recipe of RECIPES) {
      ids.add(recipe.id);
      for (const id of Object.keys(recipe.need)) ids.add(id);
    }
    assert.ok(RECIPES.length >= 8, "enough recipes to use a table");
    for (const id of ids) {
      assert.ok(existsSync(resolve(ROOT, "assets", itemAsset(id))), `missing ${itemAsset(id)}`);
    }
    assert.equal(itemAsset("dispenser"), "blocks/dispenser.svg");
    assert.equal(itemAsset("cloud"), "blocks/cloud.svg");
    assert.equal(itemAsset("door-iron"), "blocks/door-iron.svg");
    assert.equal(itemAsset("beacon"), "blocks/beacon.svg");
    assert.equal(itemAsset("anvil"), "blocks/anvil.svg");
    assert.equal(itemAsset("beehive"), "blocks/beehive.svg");
    assert.equal(itemAsset("netherite-sword"), "items/netherite-sword.svg");
    assert.equal(itemAsset("firework"), "items/firework.svg");
  });

  it("turns a log into planks then sticks", () => {
    const items = [
      { id: "oak-log", count: 1 },
      { id: "oak-planks", count: 0 },
    ];
    const planks = RECIPES.find((r) => r.id === "oak-planks");
    assert.ok(canCraft(items, planks));
    assert.deepEqual(craftOnce(items, planks), { id: "oak-planks", count: 4 });
    assert.equal(countOwned(items, "oak-log"), 0);
    items[1].id = "oak-planks";
    items[1].count = 4;
    const sticks = RECIPES.find((r) => r.id === "stick");
    assert.ok(canCraft(items, sticks));
    assert.deepEqual(craftOnce(items, sticks), { id: "stick", count: 4 });
    assert.equal(countOwned(items, "oak-planks"), 2);
  });

  it("refuses a diamond sword without the stick", () => {
    const items = [{ id: "diamond", count: 8 }];
    const sword = RECIPES.find((r) => r.id === "diamond-sword");
    assert.equal(canCraft(items, sword), false);
    assert.equal(takeNeed(items, sword.need), false);
    assert.equal(countOwned(items, "diamond"), 8);
  });

  it("leaves a tenth unique item on the ground instead of growing the bag", () => {
    const items = Array.from({ length: 9 }, (_, i) => ({ id: `slot-${i}`, count: 1 }));
    assert.equal(tryAddItem(items, "golden-apple", 1), false);
    assert.equal(items.length, 9);
    assert.equal(tryAddItem(items, "slot-0", 2), true);
    assert.equal(items[0].count, 3);
  });

  it("does not spawn another pickup while iterating a full bag", () => {
    const items = Array.from({ length: 9 }, (_, i) => ({ id: `n${i}`, count: 1 }));
    const drops = [{ id: "golden-apple", count: 1, gone: false }];
    const n = drops.length;
    for (let i = 0; i < n; i++) {
      const drop = drops[i];
      if (tryAddItem(items, drop.id, drop.count)) drop.gone = true;
    }
    assert.equal(drops.length, 1);
    assert.equal(drops[0].gone, false);
  });

  it("moves a stack from the hotbar into a chest", () => {
    const bar = [{ id: "diamond", count: 3 }, { id: "apple", count: 1 }];
    const chest = emptySlots(CHEST_SLOTS);
    assert.equal(transferStack(bar, 0, chest, CHEST_SLOTS), true);
    assert.equal(countOwned(bar, "diamond"), 0);
    assert.equal(countOwned(chest, "diamond"), 3);
    assert.equal(transferStack(chest, 0, bar, 9), true);
    assert.equal(countOwned(bar, "diamond"), 3);
  });

  it("gives the player 27 slots matching a chest", () => {
    assert.equal(PLAYER_SLOTS, CHEST_SLOTS);
    assert.equal(PLAYER_SLOTS, 27);
    const pack = emptySlots(PLAYER_SLOTS);
    for (let i = 0; i < 26; i++) assert.equal(tryAddItem(pack, `n${i}`, 1, PLAYER_SLOTS), true);
    assert.equal(tryAddItem(pack, "golden-apple", 1, PLAYER_SLOTS), true);
    assert.equal(tryAddItem(pack, "apple", 1, PLAYER_SLOTS), false);
    assert.equal(pack.length, 27);
  });

  it("keeps wooden picks off diamond ore and makes iron slower than diamond", () => {
    assert.equal(canHarvest("wooden-pickaxe", "i"), false);
    assert.equal(canHarvest("wooden-pickaxe", "ob"), false);
    assert.equal(canHarvest("iron-pickaxe", "i"), true);
    assert.equal(canHarvest("stone-pickaxe", "io"), true);
    assert.equal(canHarvest("wooden-pickaxe", "io"), false);
    assert.ok(pickSpeed("iron-pickaxe") > pickSpeed("diamond-pickaxe"));
    assert.ok(4.6 * pickSpeed("iron-pickaxe") > 1.5);
  });

  it("does not stack tools and stamps durability", () => {
    const items = emptySlots(PLAYER_SLOTS);
    assert.equal(tryAddItem(items, "wooden-pickaxe", 1, PLAYER_SLOTS), true);
    assert.equal(tryAddItem(items, "wooden-pickaxe", 1, PLAYER_SLOTS), true);
    assert.equal(items[0].dur, TOOL_DUR["wooden-pickaxe"]);
    assert.equal(items[1].id, "wooden-pickaxe");
    assert.equal(items[0].count, 1);
    const worn = { dur: 12 };
    assert.equal(tryAddItem(items, "iron-pickaxe", 1, PLAYER_SLOTS, worn), true);
    assert.equal(items[2].dur, 12);
  });

  it("every labeled item and recipe has an icon on disk", () => {
    const ids = new Set(Object.keys(ITEM_LABELS));
    for (const recipe of RECIPES) {
      ids.add(recipe.id);
      for (const id of Object.keys(recipe.need)) ids.add(id);
    }
    for (const id of Object.keys(SMELT)) ids.add(id);
    for (const spec of Object.values(SMELT)) ids.add(spec.out);
    for (const id of Object.keys(ARMOR)) ids.add(id);
    for (const id of Object.keys(FOOD)) ids.add(id);
    assert.ok(RECIPES.length >= 30, "enough recipes to fill the table");
    assert.ok(Object.keys(ARMOR).length >= 16);
    for (const id of ids) {
      assert.ok(existsSync(resolve(ROOT, "assets", itemAsset(id))), `missing ${itemAsset(id)}`);
    }
  });

  it("smelts iron ore with coal", () => {
    const items = [
      { id: "iron-ore", count: 1 },
      { id: "coal", count: 1 },
    ];
    assert.deepEqual(smeltOnce(items, "iron-ore"), { id: "iron-ingot", count: 1 });
    assert.equal(countOwned(items, "iron-ore"), 0);
    assert.equal(countOwned(items, "coal"), 0);
  });

  it("smelts oak logs into charcoal with coal or charcoal as fuel", () => {
    const items = [
      { id: "oak-log", count: 2 },
      { id: "coal", count: 1 },
    ];
    assert.deepEqual(smeltOnce(items, "oak-log"), { id: "charcoal", count: 1 });
    assert.equal(countOwned(items, "charcoal"), 0);
    items.push({ id: "charcoal", count: 1 });
    assert.deepEqual(smeltOnce(items, "oak-log"), { id: "charcoal", count: 1 });
  });

  it("crafts a wooden hoe from planks and sticks", () => {
    const items = [
      { id: "oak-planks", count: 2 },
      { id: "stick", count: 2 },
    ];
    const hoe = RECIPES.find((r) => r.id === "wooden-hoe");
    assert.ok(canCraft(items, hoe));
    assert.deepEqual(craftOnce(items, hoe), { id: "wooden-hoe", count: 1 });
  });

  it("refuses to smelt without fuel", () => {
    const items = [{ id: "sand", count: 2 }];
    assert.equal(smeltOnce(items, "sand"), null);
    assert.equal(countOwned(items, "sand"), 2);
  });
});
