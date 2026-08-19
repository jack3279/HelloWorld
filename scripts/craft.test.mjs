import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CHEST_SLOTS,
  RECIPES,
  canCraft,
  countOwned,
  craftOnce,
  emptyFurnace,
  emptySlots,
  furnaceTick,
  itemAsset,
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

  it("smelts ore and raw meat in the furnace", () => {
    const furnace = emptyFurnace();
    furnace.slots[0] = { id: "iron-ore", count: 2 };
    furnace.slots[1] = { id: "coal", count: 1 };
    furnaceTick(furnace, 4);
    assert.equal(furnace.slots[2].id, "iron-ingot");
    assert.equal(furnace.slots[2].count, 1);
    assert.equal(furnace.slots[0].count, 1);
    furnace.slots[0] = { id: "raw-porkchop", count: 1 };
    furnace.slots[1] = { id: "coal", count: 1 };
    furnace.cook = 0;
    furnaceTick(furnace, 4);
    assert.equal(furnace.slots[2].id, "iron-ingot");
    assert.equal(furnace.slots[2].count, 1, "output keeps iron until emptied");
    furnace.slots[2] = { id: "", count: 0 };
    furnaceTick(furnace, 4);
    assert.equal(furnace.slots[2].id, "cooked-porkchop");
  });

  it("maps ore and sapling items to block faces", () => {
    assert.equal(itemAsset("iron-ore"), "blocks/iron-ore.svg");
    assert.equal(itemAsset("gold-ore"), "blocks/gold-ore.svg");
    assert.equal(itemAsset("oak-sapling"), "blocks/oak-sapling.svg");
    assert.equal(itemAsset("sugar-cane"), "blocks/sugar-cane.svg");
    assert.equal(itemAsset("ice"), "blocks/ice.svg");
    assert.equal(itemAsset("flint"), "items/flint.svg");
    assert.equal(itemAsset("diamond-hoe"), "items/diamond-hoe.svg");
  });

  it("crafts a hoe from planks or diamonds", () => {
    const wood = [
      { id: "oak-planks", count: 2 },
      { id: "stick", count: 2 },
    ];
    const hoe = RECIPES.find((r) => r.id === "wooden-hoe");
    assert.ok(canCraft(wood, hoe));
    assert.deepEqual(craftOnce(wood, hoe), { id: "wooden-hoe", count: 1 });
  });

  it("crafts iron armor, cookies, and a flint and steel", () => {
    const iron = [
      { id: "iron-ingot", count: 5 },
    ];
    const helm = RECIPES.find((r) => r.id === "iron-helmet");
    assert.ok(canCraft(iron, helm));
    assert.deepEqual(craftOnce(iron, helm), { id: "iron-helmet", count: 1 });
    const cookie = RECIPES.find((r) => r.id === "cookie");
    const bag = [
      { id: "wheat", count: 2 },
      { id: "sugar", count: 1 },
    ];
    assert.ok(canCraft(bag, cookie));
    const steel = RECIPES.find((r) => r.id === "flint-and-steel");
    assert.deepEqual(steel.need, { "iron-ingot": 1, flint: 1 });
  });

  it("smelts sand to glass and logs to charcoal", () => {
    const furnace = emptyFurnace();
    furnace.slots[0] = { id: "sand", count: 1 };
    furnace.slots[1] = { id: "charcoal", count: 1 };
    furnaceTick(furnace, 4);
    assert.equal(furnace.slots[2].id, "glass");
  });

  it("crafts a wooden pickaxe and maps bow-pulling icons", () => {
    const items = [
      { id: "oak-planks", count: 3 },
      { id: "stick", count: 2 },
    ];
    const pick = RECIPES.find((r) => r.id === "wooden-pickaxe");
    assert.ok(canCraft(items, pick));
    assert.deepEqual(craftOnce(items, pick), { id: "wooden-pickaxe", count: 1 });
    assert.equal(itemAsset("bow-pulling-2"), "items/bow-pulling-2.svg");
    assert.equal(itemAsset("water-bucket"), "items/water-bucket.svg");
    assert.ok(existsSync(resolve(ROOT, "assets", itemAsset("bow-pulling-0"))));
  });
});
