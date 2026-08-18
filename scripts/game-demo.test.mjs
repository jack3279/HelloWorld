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
    assert.match(html, /id="game"/);
    assert.match(html, /id="start"/);
    assert.match(html, /id="demo"/);
    assert.match(html, /src="\/game\/game\.js"/);
    assert.match(html, /href="\/game\/style\.css"/);
    assert.match(html, /type="module"/);
  });

  it("preloads existing repo art instead of inventing new sprites", async () => {
    const src = await readFile(resolve(ROOT, "public/game/game.js"), "utf8");
    const rels = new Set();
    for (const match of src.matchAll(/["']((?:blocks|items|hud|steve-sprites|zombie-sprites|skeleton-sprites|spider-sprites|enderman-sprites|creeper-sprites|pig-sprites|cow-sprites|lava-sprites)\/[a-z0-9-]+\.svg)["']/g)) {
      rels.add(match[1]);
    }
    const steve = ["idle-a", "idle-b", ...Array.from({ length: 8 }, (_, i) => `run-${i}`), "jump-crouch", "jump-rise", "jump-apex", "jump-fall", "jump-land"];
    for (const id of steve) rels.add(`steve-sprites/${id}.svg`);
    for (let i = 0; i < 10; i++) rels.add(`steve-sprites/swing-${i}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`steve-sprites/hurt-${i}.svg`);
    for (let i = 0; i < 12; i++) rels.add(`steve-sprites/death-${i}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`steve-sprites/sleep-${i}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`steve-sprites/eat-${i}.svg`);
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper", "pig", "cow"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/walk-${i * 2}.svg`);
    }
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper", "pig", "cow"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/idle-${i}.svg`);
    }
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper", "pig", "cow"]) {
      for (let i = 0; i < 8; i++) rels.add(`${mob}-sprites/hurt-${i}.svg`);
    }
    for (const mob of ["zombie", "skeleton", "spider", "enderman", "creeper"]) {
      for (let i = 0; i < 12; i++) rels.add(`${mob}-sprites/death-${i}.svg`);
    }
    for (let i = 0; i < 12; i++) rels.add(`skeleton-sprites/draw-${i}.svg`);
    rels.add("items/arrow.svg");
    for (const mob of ["pig", "cow"]) {
      for (let i = 0; i < 8; i++) {
        rels.add(`${mob}-sprites/rest-${i}.svg`);
        rels.add(`${mob}-sprites/death-${i}.svg`);
      }
    }
    for (let i = 0; i < 10; i++) rels.add(`creeper-sprites/swell-${i * 2}.svg`);
    for (let i = 0; i < 8; i++) rels.add(`lava-sprites/boil-${i * 4}.svg`);
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
