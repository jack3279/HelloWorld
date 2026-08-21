import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { COOKED_MEAT, LEVELS, levelById, overlayGoal } from "../public/game/levels.js";
import { itemAsset } from "../public/game/recipes.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const QUEST_TYPES = new Set(["chest", "kills", "fish", "portal", "sleep", "and", "mine", "place"]);

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
        if (part.type === "kills" || part.type === "fish" || part.type === "mine" || part.type === "place") assert.ok(part.count >= 1);
        if (part.type === "mine" || part.type === "place") assert.ok(part.item || (part.any && part.any.length));
        if (part.type === "and") assert.ok(part.parts.length >= 2);
      });
    }
  });

  it("covers farm, hunt, fish, quarry, bridge, mine, night, overworld, and nether beats", () => {
    assert.equal(levelById("farm").quest.item, "bread");
    assert.equal(levelById("farm").quest.count, 3);
    assert.deepEqual(levelById("hunt").quest.any, COOKED_MEAT);
    assert.equal(levelById("fish").quest.type, "fish");
    assert.equal(levelById("quarry").quest.type, "and");
    assert.ok(levelById("quarry").quest.parts.some((p) => p.type === "mine" && p.item === "cobblestone" && p.count === 12));
    assert.ok(levelById("quarry").quest.parts.some((p) => p.type === "chest" && p.item === "cobblestone"));
    assert.equal(levelById("bridge").quest.type, "and");
    assert.ok(levelById("bridge").quest.parts.some((p) => p.type === "place" && p.count === 6));
    assert.ok(levelById("bridge").quest.parts.some((p) => p.item === "apple"));
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
    assert.match(text, /3 个小麦/);
    const hunt = overlayGoal(levelById("hunt"));
    assert.match(hunt, /熔炉/);
    assert.match(hunt, /煤炭/);
  });

  it("explains how to finish the later stages", () => {
    for (const level of LEVELS) {
      assert.ok(level.how, `${level.id} needs how-to copy`);
    }
    assert.match(overlayGoal(levelById("fish")), /鱼竿/);
    assert.match(overlayGoal(levelById("quarry")), /木镐/);
    assert.match(overlayGoal(levelById("bridge")), /放置/);
    assert.match(overlayGoal(levelById("mine")), /石镐/);
    assert.match(overlayGoal(levelById("night")), /铁胸甲/);
    assert.match(overlayGoal(levelById("overworld")), /矿井/);
    assert.match(overlayGoal(levelById("nether")), /打火石/);
  });

  it("keeps later maps completable without hidden ores or sealed huts", () => {
    const game = readFileSync(resolve(ROOT, "public/game/game.js"), "utf8");
    const fn = (name) => {
      const start = game.indexOf(`function ${name}(`);
      assert.ok(start >= 0, name);
      const next = game.indexOf("\nfunction ", start + 1);
      return game.slice(start, next);
    };
    const count = (src, tile) => [...src.matchAll(new RegExp(`"${tile}"`, "g"))].length;

    const quarry = fn("buildQuarryWorld");
    assert.ok(count(quarry, "s") >= 6, "quarry needs stone the player can mine");
    assert.match(quarry, /fillRow\(tiles, ground, 22, 38, "s"\)/);
    assert.match(quarry, /fillRow\(tiles, ground - 1, 24, 36, "s"\)/);
    assert.match(quarry, /setCell\(tiles, 16, ground, "h"\)/);

    const bridge = fn("buildBridgeWorld");
    assert.match(bridge, /for \(let x = 16; x <= 28; x\+\+\)/);
    assert.match(bridge, /y >= H - 3 \? "v" : "\."/);
    assert.match(bridge, /hut\(tiles, 32, ground\)/);
    assert.match(bridge, /setCell\(tiles, 33, ground - 1, "C"\)/);

    const mine = fn("buildMineWorld");
    assert.ok(count(mine, "io") >= 8, "mine shaft needs 8 iron ore on the map");
    assert.match(mine, /setCell\(tiles, 20, ground, "h"\)/);

    const nightMobs = game.slice(game.indexOf('if (id === "night")'), game.indexOf('if (id === "nether")'));
    assert.ok([...nightMobs.matchAll(/makeMob\("/g)].length >= 8, "night needs spare hostiles beyond 6 kills");
    assert.match(game, /mob\.exploded = true;[\s\S]*stats\.kills \+= 1/);

    const drops = fn("levelDrops");
    assert.ok([...drops.matchAll(/makeDrop\("diamond"/g)].length >= 5, "overworld needs 5 diamond pickups");

    const overworld = fn("buildWorld");
    assert.match(overworld, /fillRow\(tiles, ground, 32, 35, "p"\)/);
    assert.match(overworld, /setCell\(tiles, 28, ground \+ 4, "i"\)/);
    assert.match(overworld, /setCell\(tiles, 118, ground - 1, "D"\)/);
    assert.doesNotMatch(overworld, /setCell\(tiles, 118, ground - 2, "gl"\)/);

    const nether = fn("buildNetherWorld");
    const brickFloor = nether.indexOf('fillRow(tiles, ground + 4, 16, 23, "nk")');
    assert.ok(brickFloor >= 0, "nether quartz shaft floor");
    assert.ok(nether.indexOf('setCell(tiles, 19, ground + 4, "qo")') > brickFloor, "quartz must be placed after the brick fill");
    assert.ok(count(nether, "qo") >= 6);
    assert.match(nether, /setCell\(tiles, 28, ground - 1, "D"\)/);
    assert.match(nether, /fillRow\(tiles, ground, 8, 12, "nr"\)/);
  });
});
