import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function repoPath(url) {
  return resolve(ROOT, "assets", url.replace(/^\/repo-assets\//, ""));
}

describe("html game demo", () => {
  it("ships a standalone page that loads vanilla JS", async () => {
    const html = await readFile(resolve(ROOT, "public/game/index.html"), "utf8");
    const game = await readFile(resolve(ROOT, "public/game/game.js"), "utf8");
    const css = await readFile(resolve(ROOT, "public/game/style.css"), "utf8");
    assert.match(html, /id="game"/);
    assert.match(html, /id="start"/);
    assert.match(html, /id="demo"/);
    assert.match(html, /src="\/game\/game\.js"/);
    assert.match(html, /href="\/game\/style\.css"/);
    assert.match(html, /type="module"/);
    assert.match(game, /from "\.\/recipes\.js"/);
    assert.match(game, /from "\.\/levels\.js"/);
    assert.match(game, /function startLevel/);
    assert.match(game, /function checkQuest/);
    assert.match(game, /function questHud/);
    assert.match(game, /function nextLevel/);
    assert.match(game, /WORLD_BUILDERS/);
    assert.match(game, /buildFarmWorld/);
    assert.match(game, /buildFishWorld/);
    assert.match(game, /buildNetherWorld/);
    assert.match(html, /id="level-list"/);
    assert.match(html, /七个关卡/);
    assert.match(html, /通关后按/);
    assert.match(css, /\.level-btn/);
    assert.match(game, /tryAddItem/);
    assert.match(game, /捡不了/);
    assert.match(game, /function throwSelected/);
    assert.match(game, /setCell\(tiles, 62, ground - 1, "D"\)/);
    assert.match(html, /扔掉快捷栏/);
    assert.match(game, /tryOpenTable|craftingOpen/);
    assert.match(game, /function tryOpenChest/);
    assert.match(game, /chestOpen/);
    assert.match(game, /transferStack/);
    assert.match(game, /放进了箱子/);
    assert.doesNotMatch(game, /player\.atChest && !win/);
    assert.match(game, /imageSmoothingEnabled = false/);
    assert.match(game, /BLOCK_SRC_PAD = 56/);
    assert.match(game, /BLOCK_SRC_FACE = 400/);
    assert.match(game, /function drawTile/);
    assert.match(game, /function supportedByFloor/);
    assert.match(game, /function swimBody/);
    assert.match(game, /water-sprites\/flow-/);
    assert.match(game, /body\.air/);
    assert.match(game, /body\.drownT/);
    assert.match(game, /TILE \+ 1/);
    assert.match(game, /player\.knockT/);
    assert.match(game, /requestAnimationFrame\(frame\)/);
    assert.match(game, /netherrack/);
    assert.match(game, /soul-sand/);
    assert.match(game, /function trySmelt/);
    assert.match(game, /function tryShoot/);
    assert.match(game, /function explodeAt/);
    assert.match(game, /function tryTill/);
    assert.match(game, /function tryBoneMeal/);
    assert.match(game, /function tryFish/);
    assert.match(game, /player\.level/);
    assert.match(html, /冲刺/);
    assert.match(html, /骨粉/);
    assert.match(game, /furnace-on/);
    assert.match(game, /heart-flash/);
    assert.match(html, /27 格背包/);
    assert.match(html, /床边重生/);
    assert.match(game, /function respawnPlayer/);
    assert.match(game, /function dropInventory/);
    assert.match(game, /PLAYER_SLOTS/);
    assert.match(game, /bedSpawn/);
    assert.match(game, /function wearHeld/);
    assert.match(game, /canHarvest/);
    assert.match(game, /按 R 重生/);
    assert.match(html, /按住挖掘/);
    assert.match(game, /function finishMineCell/);
    assert.match(game, /function fireBow/);
    assert.match(game, /function drawBubbles/);
    assert.match(game, /function drawActionProgress/);
    assert.match(game, /hud\/bubble\.svg/);
    assert.match(game, /hud\/progress-bar\.svg/);
    assert.match(game, /items\/bow-0\.svg/);
    assert.match(game, /blocks\/destroy-\$\{/);
    assert.doesNotMatch(game, /ctx\.filter/);
    assert.match(css, /image-rendering:\s*pixelated/);
  });

  it("preloads existing repo art instead of inventing new sprites", async () => {
    const src = await readFile(resolve(ROOT, "public/game/game.js"), "utf8");
    const rels = new Set();
    for (const match of src.matchAll(/["']((?:blocks|items|hud|steve-sprites|zombie-sprites|skeleton-sprites|spider-sprites|enderman-sprites|creeper-sprites|pig-sprites|cow-sprites|chicken-sprites|sheep-sprites|slime-sprites|lava-sprites|water-sprites)\/[a-z0-9-]+\.svg)["']/g)) {
      rels.add(match[1]);
    }
    const steve = ["idle-a", "idle-b", ...Array.from({ length: 8 }, (_, i) => `run-${i}`), "jump-crouch", "jump-rise", "jump-apex", "jump-fall", "jump-land"];
    for (const id of steve) rels.add(`steve-sprites/${id}.svg`);
    for (let i = 0; i < 10; i++) rels.add(`steve-sprites/swing-${i}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`steve-sprites/hurt-${i}.svg`);
    for (let i = 0; i < 12; i++) rels.add(`steve-sprites/death-${i}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`steve-sprites/sleep-${i}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`steve-sprites/eat-${i}.svg`);
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper", "pig", "cow", "chicken", "sheep", "slime"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/walk-${i * 2}.svg`);
    }
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper", "pig", "cow", "chicken", "sheep", "slime"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/idle-${i}.svg`);
    }
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper", "pig", "cow", "chicken", "sheep", "slime"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/hurt-${i}.svg`);
    }
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper"]) {
      for (let i = 0; i < 12; i++) rels.add(`${mob}-sprites/death-${i}.svg`);
    }
    for (let i = 0; i < 12; i++) rels.add(`skeleton-sprites/draw-${i}.svg`);
    rels.add("items/arrow.svg");
    for (const mob of ["pig", "cow", "chicken", "sheep", "slime"]) {
      for (let i = 0; i < 8; i++) {
        if (mob !== "slime") rels.add(`${mob}-sprites/rest-${i}.svg`);
        rels.add(`${mob}-sprites/death-${i}.svg`);
      }
    }
    for (let i = 0; i < 10; i++) rels.add(`creeper-sprites/swell-${i * 2}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`lava-sprites/boil-${i * 4}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`water-sprites/flow-${i * 4}.svg`);
    const itemIds = [...src.matchAll(/["'](diamond-sword|diamond-pickaxe|torch|bread|steak|apple|golden-apple|potion-heal|diamond|cooked-porkchop|wheat-seeds|carrot|wheat)["']/g)].map((m) => m[1]);
    for (const id of new Set(itemIds)) rels.add(`items/${id}.svg`);
    assert.ok(rels.size >= 40, `expected a full loadout, got ${rels.size}`);
    for (const rel of rels) {
      assert.ok(existsSync(resolve(ROOT, "assets", rel)), `missing ${rel}`);
    }
    assert.ok(rels.has("blocks/grass.svg"));
    assert.ok(rels.has("hud/hotbar.svg"));
    assert.ok(rels.has("items/diamond-sword.svg"));
  });

  it("serves those files from /repo-assets/", async () => {
    const plugin = await readFile(resolve(ROOT, "vite-plugins/repo-assets.ts"), "utf8");
    const vite = await readFile(resolve(ROOT, "vite.config.ts"), "utf8");
    assert.match(plugin, /\/repo-assets\//);
    assert.match(plugin, /Location.*\/game\//);
    assert.match(vite, /repoAssetsPlugin/);
  });
});
