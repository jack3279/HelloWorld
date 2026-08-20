import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { COOKED_MEAT, LEVELS, levelById, overlayGoal } from "../public/game/levels.js";
import { itemAsset } from "../public/game/recipes.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const QUEST_TYPES = new Set(["chest", "kills", "fish", "portal", "sleep", "and"]);

function walkQuest(part, visit) {
  visit(part);
  if (part?.type === "and") for (const child of part.parts) walkQuest(child, visit);
}

describe("campaign levels", () => {
  it("ships at least six unique stages with quests and loadouts", () => {
    assert.ok(LEVELS.length >= 6, `expected a campaign, got ${LEVELS.length}`);
    const ids = LEVELS.map((level) => level.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const level of LEVELS) {
      assert.ok(level.id && level.title && level.subtitle && level.brief && level.goal);
      assert.ok(level.quest?.type);
      assert.ok(Array.isArray(level.spawn) && level.spawn.length === 2);
      assert.ok(Array.isArray(level.items) && level.items.length >= 3);
      walkQuest(level.quest, (part) => {
        assert.ok(QUEST_TYPES.has(part.type), `unknown quest ${part.type} on ${level.id}`);
        assert.ok(part.label, `${level.id} quest needs a HUD label`);
        if (part.type === "chest") {
          assert.ok(part.count >= 1);
          assert.ok(part.item || (part.any && part.any.length));
        }
        if (part.type === "kills" || part.type === "fish") assert.ok(part.count >= 1);
        if (part.type === "and") assert.ok(part.parts.length >= 2);
      });
    }
  });

  it("covers farm, hunt, fish, mine, night, overworld, and nether beats", () => {
    assert.equal(levelById("farm").quest.item, "bread");
    assert.equal(levelById("farm").quest.count, 3);
    assert.deepEqual(levelById("hunt").quest.any, COOKED_MEAT);
    assert.equal(levelById("fish").quest.type, "fish");
    assert.equal(levelById("mine").quest.item, "iron-ingot");
    assert.equal(levelById("night").quest.type, "kills");
    assert.equal(levelById("overworld").quest.item, "diamond");
    assert.equal(levelById("overworld").quest.count, 5);
    const nether = levelById("nether");
    assert.equal(nether.quest.type, "and");
    assert.ok(nether.quest.parts.some((p) => p.type === "portal"));
    assert.ok(nether.quest.parts.some((p) => p.item === "quartz"));
    assert.throws(() => levelById("missing-level"));
  });

  it("only starts players with icons that already ship", () => {
    const ids = new Set(COOKED_MEAT);
    for (const level of LEVELS) {
      for (const it of level.items) ids.add(it.id);
      walkQuest(level.quest, (part) => {
        if (part.item) ids.add(part.item);
        for (const id of part.any ?? []) ids.add(id);
      });
    }
    for (const id of ids) {
      assert.ok(existsSync(resolve(ROOT, "assets", itemAsset(id))), `missing ${itemAsset(id)}`);
    }
  });

  it("writes overlay copy from the level brief", () => {
    const farm = levelById("farm");
    const text = overlayGoal(farm);
    assert.match(text, /开垦/);
    assert.match(text, /第一关/);
    assert.match(text, /面包/);
  });
});
