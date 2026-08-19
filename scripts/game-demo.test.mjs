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
    assert.match(game, /tryAddItem/);
    assert.match(game, /捡不了/);
    assert.match(game, /function throwSelected/);
    assert.match(game, /setCell\(tiles, 62, ground - 1, "D"\)/);
    assert.match(html, /扔掉快捷栏/);
    assert.match(game, /tryOpenTable|craftingOpen/);
    assert.match(game, /function tryOpenChest/);
    assert.match(game, /chestOpen/);
    assert.match(game, /function tryOpenFurnace/);
    assert.match(game, /furnaceOpen/);
    assert.match(game, /furnaceTick/);
    assert.match(game, /function tryToggleDoor/);
    assert.match(game, /doorOpen/);
    assert.match(game, /function tryBucket/);
    assert.match(game, /function tryShear/);
    assert.match(game, /function tryFlint/);
    assert.match(game, /function refreshArmor/);
    assert.match(game, /steve-sprites\/armor-/);
    assert.match(game, /blocks\/chest-open\.svg/);
    assert.match(game, /blocks\/door-oak-open\.svg/);
    assert.match(game, /flint-and-steel/);
    assert.match(game, /makeMob\("chicken"/);
    assert.match(game, /makeMob\("sheep"/);
    assert.match(game, /makeMob\("wolf"/);
    assert.match(game, /makeMob\("slime"/);
    assert.match(game, /makeMob\("rabbit"/);
    assert.match(game, /makeMob\("villager"/);
    assert.match(game, /makeMob\("cat"/);
    assert.match(game, /makeMob\("bat"/);
    assert.match(game, /makeMob\("squid"/);
    assert.match(game, /makeMob\("witch"/);
    assert.match(game, /makeMob\("iron-golem"/);
    assert.match(game, /makeMob\("horse"/);
    assert.match(game, /makeMob\("boat"/);
    assert.match(game, /makeMob\("blaze"/);
    assert.match(game, /makeMob\("magma-cube"/);
    assert.match(game, /function buildNether/);
    assert.match(game, /function swapDimension/);
    assert.match(game, /function tryMount/);
    assert.match(game, /function trySaddle/);
    assert.match(game, /function tryPlaceBoat/);
    assert.match(game, /function updatePortal/);
    assert.match(game, /function tryFish/);
    assert.match(game, /function drawRain/);
    assert.match(game, /function isRaining/);
    assert.match(game, /armor-netherite/);
    assert.match(game, /function tryThrowPearl/);
    assert.match(game, /function addXp/);
    assert.match(game, /armor-gold/);
    assert.match(game, /shorn-/);
    assert.match(game, /"V"/);
    assert.match(game, /bow-pulling-/);
    assert.match(game, /hud\/bubble\.svg/);
    assert.match(game, /water-bucket/);
    assert.match(game, /function firePlayerBow/);
    assert.match(game, /function heldOverlayId/);
    assert.match(game, /from: "player"/);
    assert.match(game, /raw-porkchop/);
    assert.match(game, /"H"/);
    assert.match(game, /"R"/);
    assert.doesNotMatch(game, /holdingSword\(\) return "steve-sprites\/swing-0/);
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
    assert.doesNotMatch(game, /ctx\.filter/);
    assert.match(css, /image-rendering:\s*pixelated/);
  });

  it("preloads existing repo art instead of inventing new sprites", async () => {
    const src = await readFile(resolve(ROOT, "public/game/game.js"), "utf8");
    const rels = new Set();
    for (const match of src.matchAll(/["']((?:blocks|items|hud|steve-sprites|zombie-sprites|skeleton-sprites|spider-sprites|enderman-sprites|creeper-sprites|pig-sprites|cow-sprites|chicken-sprites|sheep-sprites|wolf-sprites|slime-sprites|rabbit-sprites|villager-sprites|cat-sprites|bat-sprites|squid-sprites|witch-sprites|iron-golem-sprites|horse-sprites|boat-sprites|blaze-sprites|magma-cube-sprites|lava-sprites|water-sprites)\/[a-z0-9-]+\.svg)["']/g)) {
      rels.add(match[1]);
    }
    const steve = ["idle-a", "idle-b", ...Array.from({ length: 8 }, (_, i) => `run-${i}`), "jump-crouch", "jump-rise", "jump-apex", "jump-fall", "jump-land"];
    for (const id of steve) rels.add(`steve-sprites/${id}.svg`);
    for (let i = 0; i < 10; i++) rels.add(`steve-sprites/swing-${i}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`steve-sprites/hurt-${i}.svg`);
    for (let i = 0; i < 12; i++) rels.add(`steve-sprites/death-${i}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`steve-sprites/sleep-${i}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`steve-sprites/eat-${i}.svg`);
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper", "pig", "cow", "chicken", "sheep", "wolf", "slime", "rabbit", "villager", "cat", "bat", "squid", "witch", "iron-golem", "horse", "boat", "blaze", "magma-cube"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/walk-${i * 2}.svg`);
    }
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper", "pig", "cow", "chicken", "sheep", "wolf", "slime", "rabbit", "villager", "cat", "bat", "squid", "witch", "iron-golem", "horse", "boat", "blaze", "magma-cube"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/idle-${i}.svg`);
    }
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper", "pig", "cow", "chicken", "sheep", "wolf", "slime", "rabbit", "villager", "cat", "bat", "squid", "witch", "iron-golem", "horse", "boat", "blaze", "magma-cube"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/hurt-${i}.svg`);
    }
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper"]) {
      for (let i = 0; i < 12; i++) rels.add(`${mob}-sprites/death-${i}.svg`);
    }
    for (let i = 0; i < 12; i++) rels.add(`skeleton-sprites/draw-${i}.svg`);
    rels.add("items/arrow.svg");
    for (const mob of ["pig", "cow", "chicken", "sheep", "wolf", "slime", "rabbit", "villager", "cat", "bat", "squid", "witch", "iron-golem", "horse", "boat", "blaze", "magma-cube"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/death-${i}.svg`);
    }
    for (const mob of ["pig", "cow", "chicken", "sheep", "wolf", "rabbit", "villager", "cat", "bat", "squid", "witch", "iron-golem", "horse", "boat", "blaze"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/rest-${i}.svg`);
    }
    for (let i = 0; i < 10; i++) rels.add(`creeper-sprites/swell-${i * 2}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`lava-sprites/boil-${i * 4}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`water-sprites/flow-${i * 4}.svg`);
    const itemIds = [...src.matchAll(/["'](diamond-sword|diamond-pickaxe|diamond-axe|diamond-hoe|bow|arrow|torch|bread|steak|apple|golden-apple|potion-heal|diamond|cooked-porkchop|raw-porkchop|raw-beef|wheat-seeds|carrot|wheat)["']/g)].map((m) => m[1]);
    for (const id of new Set(itemIds)) rels.add(`items/${id}.svg`);
    assert.ok(rels.size >= 40, `expected a full loadout, got ${rels.size}`);
    for (const rel of rels) {
      assert.ok(existsSync(resolve(ROOT, "assets", rel)), `missing ${rel}`);
    }
    assert.ok(rels.has("blocks/grass.svg"));
    assert.ok(rels.has("hud/hotbar.svg"));
    assert.ok(rels.has("items/diamond-sword.svg"));
    assert.ok(rels.has("blocks/furnace.svg") || src.includes("furnace"));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/furnace-on.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/iron-ore.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/raw-porkchop.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/diamond-hoe.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/bow-pulling-2.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/hud/bubble.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/hud/bubble-empty.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/wooden-pickaxe.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/wheat-6.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/chest-open.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/door-oak-open.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/fire.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/shield.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/leather-helmet.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/steve-sprites/armor-leather.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/chicken-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/sheep-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/wolf-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/steve-sprites/armor-gold.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/steve-sprites/armor-iron-run-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/fire-3.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/tnt-primed.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/xp-orb.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/flint.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/charcoal.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/sugar-cane.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/rabbit-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/villager-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/sheep-sprites/shorn-idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/cat-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/bat-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/squid-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/witch-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/iron-golem-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/horse-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/boat-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blaze-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/magma-cube-sprites/idle-0.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/oak-boat.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/blaze-rod.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/nether-portal.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/steve-sprites/armor-netherite.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/items/fishing-rod.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/bookshelf.svg")));
    assert.ok(existsSync(resolve(ROOT, "assets/blocks/obsidian.svg")));
  });

  it("serves those files from /repo-assets/", async () => {
    const plugin = await readFile(resolve(ROOT, "vite-plugins/repo-assets.ts"), "utf8");
    const vite = await readFile(resolve(ROOT, "vite.config.ts"), "utf8");
    assert.match(plugin, /\/repo-assets\//);
    assert.match(plugin, /Location.*\/game\//);
    assert.match(vite, /repoAssetsPlugin/);
  });
});
