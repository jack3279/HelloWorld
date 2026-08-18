import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { RECIPES, canCraft, countOwned, craftOnce, itemAsset, takeNeed } from "../public/game/recipes.js";

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
});
