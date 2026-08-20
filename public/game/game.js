import {
  ARMOR,
  CHEST_SLOTS,
  FOOD,
  ITEM_LABELS,
  RECIPES,
  SMELT,
  canCraft,
  countOwned,
  craftOnce,
  emptySlots,
  itemAsset,
  smeltOnce,
  takeNeed,
  transferStack,
  tryAddItem,
} from "./recipes.js";

const ROOT = "/repo-assets";
const TILE = 48;
// Catalog block SVGs are 512×512 with SINGLE.pad empty margin; the painted face is 400×400.
const BLOCK_SRC_PAD = 56;
const BLOCK_SRC_FACE = 400;
const GOAL_DIAMONDS = 5;
const GRAVITY = 2100;
const MOVE = 210;
const JUMP = 680;
const MAX_FALL = 980;
const DAY_LENGTH = 90;
const FEED = { pig: "carrot", cow: "wheat" };
const WHEAT_STAGE = { 0: { next: "1", wait: 9 }, 1: { next: "2", wait: 11 } };
const PICK = "diamond-pickaxe";
const MINEABLE = {
  s: { drop: "cobblestone", tool: PICK },
  c: { drop: "cobblestone", tool: PICK },
  x: { drop: "coal", tool: PICK, remain: "s" },
  i: { drop: "diamond", tool: PICK, remain: "s" },
  io: { drop: "iron-ore", tool: PICK, remain: "s" },
  go: { drop: "gold-ore", tool: PICK, remain: "s" },
  co: { drop: "copper-ore", tool: PICK, remain: "s" },
  ro: { drop: "redstone-dust", tool: PICK, remain: "s", count: 4 },
  lo: { drop: "lapis-ore", tool: PICK, remain: "s" },
  eo: { drop: "emerald", tool: PICK, remain: "s" },
  d: { drop: "dirt" },
  a: { drop: "sand" },
  gv: { drop: "gravel" },
  o: { drop: "oak-log" },
  L: { drop: "oak-sapling", chance: 0.35 },
  bl: { drop: "oak-sapling", chance: 0.3 },
  sl: { drop: "oak-sapling", chance: 0.3 },
  u: { drop: "pumpkin" },
  e: { drop: "melon-slice", count: 2 },
  y: { drop: "wheat", count: 3 },
  p: { drop: "oak-planks" },
  bp: { drop: "birch-planks" },
  sp: { drop: "spruce-planks" },
  ap: { drop: "acacia-planks" },
  dk: { drop: "dark-oak-planks" },
  b: { drop: "bricks", tool: PICK },
  m: { drop: "mossy-cobblestone", tool: PICK },
  j: { drop: "glass" },
  I: { drop: "ice" },
  bi: { drop: "blue-ice" },
  q: { drop: "clay" },
  n: { drop: "dirt" },
  k: { drop: "cactus" },
  ww: { drop: "white-wool" },
  sd: { drop: "sandstone", tool: PICK },
  sb: { drop: "stone-bricks", tool: PICK },
  gt: { drop: "granite", tool: PICK },
  ad: { drop: "andesite", tool: PICK },
  dr: { drop: "diorite", tool: PICK },
  nr: { drop: "netherrack", tool: PICK },
  ss: { drop: "soul-sand" },
  mg: { drop: "magma", tool: PICK },
  nk: { drop: "nether-bricks", tool: PICK },
  ob: { drop: "obsidian", tool: PICK },
  gl: { drop: "glowstone", tool: PICK },
  sn: { drop: "snowball", count: 4 },
  tn: { drop: "tnt" },
  bk: { drop: "bookshelf" },
  nt: { drop: "noteblock" },
  jk: { drop: "jukebox" },
  hp: { drop: "hopper" },
  dp: { drop: "dispenser", tool: PICK },
  pi: { drop: "piston", tool: PICK },
  et: { drop: "enchanting-table", tool: PICK },
  ib: { drop: "iron-block", tool: PICK },
  gb: { drop: "gold-block", tool: PICK },
  db: { drop: "diamond-block", tool: PICK },
  eb: { drop: "emerald-block", tool: PICK },
  sg: { drop: "sponge" },
  sa: { drop: "oak-sapling" },
  rm: { drop: "red-mushroom" },
  bm: { drop: "brown-mushroom" },
  vi: { drop: "vine" },
  lp: { drop: "lily-pad" },
  gs: { drop: "dirt" },
  F: { drop: "furnace", tool: PICK },
  T: { drop: "crafting-table" },
  C: { drop: "chest" },
  z: { drop: "bed" },
  Z: { drop: "bed" },
  h: { drop: "ladder" },
  ov: { drop: "observer", tool: PICK },
};
const PLACEABLE = {
  torch: "t",
  dirt: "d",
  cobblestone: "c",
  "oak-planks": "p",
  "crafting-table": "T",
  furnace: "F",
  chest: "C",
  tnt: "tn",
  ladder: "h",
  glass: "j",
  sand: "a",
  gravel: "gv",
  stone: "s",
  bricks: "b",
  "oak-log": "o",
  "white-wool": "ww",
  sandstone: "sd",
  "stone-bricks": "sb",
  hay: "y",
  "oak-sapling": "sa",
  cactus: "k",
  snow: "sn",
  ice: "I",
  "blue-ice": "bi",
  sponge: "sg",
  glowstone: "gl",
  obsidian: "ob",
  netherrack: "nr",
  "soul-sand": "ss",
  magma: "mg",
  "nether-bricks": "nk",
  "birch-planks": "bp",
  "spruce-planks": "sp",
  "acacia-planks": "ap",
  "dark-oak-planks": "dk",
  bookshelf: "bk",
  noteblock: "nt",
  jukebox: "jk",
  hopper: "hp",
  dispenser: "dp",
  piston: "pi",
  "enchanting-table": "et",
  "iron-block": "ib",
  "gold-block": "gb",
  "diamond-block": "db",
  "emerald-block": "eb",
  "lily-pad": "lp",
  vine: "vi",
  "red-mushroom": "rm",
  "brown-mushroom": "bm",
  "mossy-cobblestone": "m",
  granite: "gt",
  andesite: "ad",
  diorite: "dr",
  "door-iron": "di",
};

const STEVE = {
  loco: { w: 256, h: 320, ax: 128, ay: 300, scale: 0.3 },
  combat: { w: 384, h: 336, ax: 168, ay: 308, scale: 0.3 },
};

const BLOCKS = {
  g: "blocks/grass.svg",
  d: "blocks/dirt.svg",
  s: "blocks/stone.svg",
  c: "blocks/cobblestone.svg",
  o: "blocks/oak-log.svg",
  L: "blocks/oak-leaves.svg",
  p: "blocks/oak-planks.svg",
  a: "blocks/sand.svg",
  w: "blocks/water.svg",
  k: "blocks/cactus.svg",
  t: "blocks/torch.svg",
  C: "blocks/chest.svg",
  T: "blocks/crafting-table.svg",
  F: "blocks/furnace.svg",
  b: "blocks/bricks.svg",
  B: "blocks/bedrock.svg",
  D: "blocks/door-oak.svg",
  U: "blocks/door-oak-upper.svg",
  f: "blocks/dandelion.svg",
  P: "blocks/poppy.svg",
  G: "blocks/tall-grass.svg",
  i: "blocks/diamond-ore.svg",
  x: "blocks/coal-ore.svg",
  h: "blocks/ladder.svg",
  m: "blocks/mossy-cobblestone.svg",
  j: "blocks/glass.svg",
  I: "blocks/ice.svg",
  u: "blocks/pumpkin.svg",
  y: "blocks/hay.svg",
  e: "blocks/melon.svg",
  n: "blocks/farmland.svg",
  q: "blocks/clay.svg",
  z: "blocks/bed.svg",
  Z: "blocks/bed-head.svg",
  0: "blocks/wheat-0.svg",
  1: "blocks/wheat-3.svg",
  2: "blocks/wheat-7.svg",
  io: "blocks/iron-ore.svg",
  go: "blocks/gold-ore.svg",
  co: "blocks/copper-ore.svg",
  ro: "blocks/redstone-ore.svg",
  lo: "blocks/lapis-ore.svg",
  eo: "blocks/emerald-ore.svg",
  gv: "blocks/gravel.svg",
  nr: "blocks/netherrack.svg",
  ss: "blocks/soul-sand.svg",
  gl: "blocks/glowstone.svg",
  mg: "blocks/magma.svg",
  nk: "blocks/nether-bricks.svg",
  ob: "blocks/obsidian.svg",
  gt: "blocks/granite.svg",
  ad: "blocks/andesite.svg",
  dr: "blocks/diorite.svg",
  sn: "blocks/snow.svg",
  di: "blocks/door-iron.svg",
  dO: "blocks/door-iron.svg",
  tn: "blocks/tnt.svg",
  bk: "blocks/bookshelf.svg",
  nt: "blocks/noteblock.svg",
  jk: "blocks/jukebox.svg",
  dp: "blocks/dispenser.svg",
  pi: "blocks/piston.svg",
  et: "blocks/enchanting-table.svg",
  hp: "blocks/hopper.svg",
  ov: "blocks/observer.svg",
  bl: "blocks/birch-leaves.svg",
  sl: "blocks/spruce-leaves.svg",
  sa: "blocks/oak-sapling.svg",
  gs: "blocks/grass-side.svg",
  vi: "blocks/vine.svg",
  rm: "blocks/red-mushroom.svg",
  bm: "blocks/brown-mushroom.svg",
  lp: "blocks/lily-pad.svg",
  bi: "blocks/blue-ice.svg",
  ib: "blocks/iron-block.svg",
  gb: "blocks/gold-block.svg",
  db: "blocks/diamond-block.svg",
  eb: "blocks/emerald-block.svg",
  ww: "blocks/white-wool.svg",
  sd: "blocks/sandstone.svg",
  sb: "blocks/stone-bricks.svg",
  sg: "blocks/sponge.svg",
  sp: "blocks/spruce-planks.svg",
  bp: "blocks/birch-planks.svg",
  ap: "blocks/acacia-planks.svg",
  dk: "blocks/dark-oak-planks.svg",
};

const NON_SOLID = new Set([
  ".",
  "w",
  "v",
  "t",
  "h",
  "vi",
  "f",
  "P",
  "G",
  "sa",
  "rm",
  "bm",
  "D",
  "U",
  "z",
  "Z",
  "0",
  "1",
  "2",
  "k",
  "C",
  "dO",
  "F",
  "T",
  "bk",
  "hp",
  "et",
  "jk",
  "nt",
  "dp",
  "pi",
  "ov",
]);

function isSolid(t) {
  return Boolean(t) && t !== "." && !NON_SOLID.has(t);
}

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start");
const demoBtn = document.getElementById("demo");
const loadStatus = document.getElementById("load-status");
const ctx = canvas.getContext("2d");

const images = new Map();
const keys = new Set();
const hold = { left: false, right: false, jump: false, use: false };

let viewW = 960;
let viewH = 540;
let last = 0;
let mode = "boot";
let world;
let player;
let mobs = [];
let drops = [];
let arrows = [];
let particles = [];
let craftingOpen = false;
let chestOpen = false;
let chestItems = emptySlots(CHEST_SLOTS);
let craftScroll = 0;
const CRAFT_VISIBLE = 6;
let cam = { x: 0, y: 0 };
let time = 0;
let clock = 8;
let message = "";
let messageT = 0;
let win = false;
let demo = null;

function asset(rel) {
  return `${ROOT}/${rel}`;
}

function range(n, map) {
  return Array.from({ length: n }, (_, i) => map(i));
}

const MANIFEST = [
  ...Object.values(BLOCKS),
  ...range(8, (i) => `lava-sprites/boil-${i * 4}.svg`),
  ...range(8, (i) => `water-sprites/flow-${i * 4}.svg`),
  ...["idle-a", "idle-b", ...range(8, (i) => `run-${i}`), "jump-crouch", "jump-rise", "jump-apex", "jump-fall", "jump-land"].map(
    (id) => `steve-sprites/${id}.svg`,
  ),
  ...range(10, (i) => `steve-sprites/swing-${i}.svg`),
  ...range(8, (i) => `steve-sprites/hurt-${i}.svg`),
  ...range(12, (i) => `steve-sprites/death-${i}.svg`),
  ...range(8, (i) => `steve-sprites/sleep-${i}.svg`),
  ...range(8, (i) => `steve-sprites/eat-${i}.svg`),
  ...range(8, (i) => `zombie-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `zombie-sprites/idle-${i}.svg`),
  ...range(8, (i) => `zombie-sprites/hurt-${i}.svg`),
  ...range(12, (i) => `zombie-sprites/death-${i}.svg`),
  ...range(8, (i) => `skeleton-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `skeleton-sprites/idle-${i}.svg`),
  ...range(8, (i) => `skeleton-sprites/hurt-${i}.svg`),
  ...range(12, (i) => `skeleton-sprites/draw-${i}.svg`),
  ...range(12, (i) => `skeleton-sprites/death-${i}.svg`),
  ...range(8, (i) => `spider-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `spider-sprites/idle-${i}.svg`),
  ...range(8, (i) => `spider-sprites/hurt-${i}.svg`),
  ...range(12, (i) => `spider-sprites/death-${i}.svg`),
  ...range(8, (i) => `enderman-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `enderman-sprites/idle-${i}.svg`),
  ...range(8, (i) => `enderman-sprites/hurt-${i}.svg`),
  ...range(12, (i) => `enderman-sprites/death-${i}.svg`),
  ...range(8, (i) => `creeper-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `creeper-sprites/idle-${i}.svg`),
  ...range(8, (i) => `creeper-sprites/hurt-${i}.svg`),
  ...range(12, (i) => `creeper-sprites/death-${i}.svg`),
  ...range(10, (i) => `creeper-sprites/swell-${i * 2}.svg`),
  ...range(8, (i) => `pig-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `pig-sprites/idle-${i}.svg`),
  ...range(8, (i) => `pig-sprites/rest-${i}.svg`),
  ...range(8, (i) => `pig-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `pig-sprites/death-${i}.svg`),
  ...range(8, (i) => `cow-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `cow-sprites/idle-${i}.svg`),
  ...range(8, (i) => `cow-sprites/rest-${i}.svg`),
  ...range(8, (i) => `cow-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `cow-sprites/death-${i}.svg`),
  ...Object.keys(ITEM_LABELS).map((id) => itemAsset(id)),
  "hud/heart.svg",
  "hud/heart-half.svg",
  "hud/heart-empty.svg",
  "hud/heart-flash.svg",
  "blocks/furnace-on.svg",
  "hud/hunger-full.svg",
  "hud/hunger-half.svg",
  "hud/hunger-empty.svg",
  "hud/armor-full.svg",
  "hud/armor-half.svg",
  "hud/armor-empty.svg",
  "hud/hotbar.svg",
  "hud/selected-slot.svg",
  "hud/hotbar-slot.svg",
  "hud/xp-bar.svg",
  "hud/crosshair.svg",
];

export function listGameAssets() {
  return MANIFEST.map(asset);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

async function loadAll() {
  let done = 0;
  await Promise.all(
    MANIFEST.map(async (rel) => {
      const src = asset(rel);
      const img = await loadImage(src);
      images.set(rel, img);
      done += 1;
      loadStatus.textContent = `正在载入素材… ${done}/${MANIFEST.length}`;
    }),
  );
}

function img(rel) {
  return images.get(rel);
}

function setCell(tiles, x, y, t) {
  if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) tiles[y][x] = t;
}

function fillRow(tiles, y, x0, x1, t) {
  for (let x = x0; x <= x1; x++) setCell(tiles, x, y, t);
}

function tree(tiles, x, ground, trunk = "o", leaf = "L") {
  setCell(tiles, x, ground - 1, trunk);
  setCell(tiles, x, ground - 2, trunk);
  setCell(tiles, x, ground - 3, trunk);
  for (let dy = 4; dy <= 6; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + (6 - dy) < 4) setCell(tiles, x + dx, ground - dy, leaf);
    }
  }
}

function spruceTree(tiles, x, ground) {
  setCell(tiles, x, ground - 1, "sp");
  setCell(tiles, x, ground - 2, "sp");
  setCell(tiles, x, ground - 3, "sp");
  setCell(tiles, x, ground - 4, "sp");
  for (const [dy, r] of [[3, 2], [4, 2], [5, 1], [6, 1]]) {
    for (let dx = -r; dx <= r; dx++) setCell(tiles, x + dx, ground - dy, "sl");
  }
}

function portal(tiles, x, ground) {
  for (let y = ground - 4; y < ground; y++) {
    setCell(tiles, x, y, "ob");
    setCell(tiles, x + 4, y, "ob");
  }
  fillRow(tiles, ground - 5, x, x + 4, "ob");
}

function scanChests(tiles) {
  const chests = {};
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      if (tiles[y][x] === "C") chests[`${x},${y}`] = emptySlots(CHEST_SLOTS);
    }
  }
  return chests;
}

function fillChest(chests, x, y, loot) {
  const slots = chests[`${x},${y}`];
  if (!slots) return;
  for (const [id, n] of loot) tryAddItem(slots, id, n, CHEST_SLOTS);
}

function buildWorld() {
  const W = 128;
  const H = 20;
  const tiles = Array.from({ length: H }, () => Array(W).fill("."));
  const ground = 10;

  for (let x = 0; x < W; x++) {
    setCell(tiles, x, H - 1, "B");
    for (let y = ground + 1; y < H - 1; y++) {
      let t = "s";
      if (y <= ground + 2) t = "d";
      else if (y === ground + 4 && x % 11 === 3) t = "gt";
      else if (y === ground + 5 && x % 13 === 5) t = "ad";
      else if (y === ground + 6 && x % 17 === 8) t = "dr";
      else if (y === ground + 5 && x % 9 === 2) t = "gv";
      setCell(tiles, x, y, t);
    }
    setCell(tiles, x, ground, "g");
  }

  fillRow(tiles, ground, 14, 17, ".");
  fillRow(tiles, ground + 1, 14, 17, "w");
  fillRow(tiles, ground + 2, 14, 17, "w");
  fillRow(tiles, ground + 3, 14, 17, "s");
  setCell(tiles, 15, ground, "lp");
  setCell(tiles, 16, ground, "lp");
  setCell(tiles, 13, ground + 1, "gs");
  setCell(tiles, 18, ground + 1, "gs");

  fillRow(tiles, ground, 32, 35, ".");
  fillRow(tiles, ground + 1, 32, 35, "v");
  fillRow(tiles, ground + 2, 32, 35, "v");
  fillRow(tiles, ground + 3, 32, 35, "s");

  fillRow(tiles, ground - 2, 22, 26, "p");
  fillRow(tiles, ground - 2, 40, 44, "p");
  fillRow(tiles, ground - 4, 41, 43, "p");
  setCell(tiles, 43, ground - 5, "t");
  setCell(tiles, 26, ground - 3, "t");
  setCell(tiles, 14, ground, "h");
  setCell(tiles, 17, ground, "h");
  setCell(tiles, 32, ground, "h");
  setCell(tiles, 35, ground, "h");

  tree(tiles, 8, ground);
  tree(tiles, 48, ground);
  tree(tiles, 52, ground, "bp", "bl");

  fillRow(tiles, ground, 2, 4, "n");
  setCell(tiles, 6, ground - 1, "u");
  setCell(tiles, 9, ground - 1, "u");
  setCell(tiles, 13, ground, "I");
  setCell(tiles, 18, ground, "I");
  setCell(tiles, 15, ground + 3, "q");
  setCell(tiles, 16, ground + 3, "sg");
  setCell(tiles, 47, ground - 1, "e");
  setCell(tiles, 49, ground - 1, "u");
  setCell(tiles, 60, ground - 1, "y");
  setCell(tiles, 61, ground - 1, "y");
  setCell(tiles, 60, ground - 2, "y");

  setCell(tiles, 2, ground - 1, "0");
  setCell(tiles, 3, ground - 1, "1");
  setCell(tiles, 4, ground - 1, "2");

  setCell(tiles, 11, ground - 1, "f");
  setCell(tiles, 12, ground - 1, "G");
  setCell(tiles, 20, ground - 1, "P");
  setCell(tiles, 21, ground - 1, "sa");
  setCell(tiles, 29, ground - 1, "k");
  setCell(tiles, 38, ground - 1, "k");
  setCell(tiles, 28, ground, "sd");
  setCell(tiles, 29, ground, "sd");
  setCell(tiles, 30, ground, "a");
  setCell(tiles, 37, ground, "a");
  setCell(tiles, 38, ground, "sd");
  setCell(tiles, 50, ground - 1, "rm");
  setCell(tiles, 51, ground - 1, "bm");
  setCell(tiles, 53, ground - 2, "vi");
  setCell(tiles, 53, ground - 3, "vi");

  setCell(tiles, 19, ground + 3, "x");
  setCell(tiles, 36, ground + 3, "i");
  setCell(tiles, 54, ground + 3, "x");
  setCell(tiles, 7, ground + 4, "io");
  setCell(tiles, 8, ground + 4, "io");
  setCell(tiles, 23, ground + 5, "go");
  setCell(tiles, 24, ground + 4, "co");
  setCell(tiles, 41, ground + 6, "ro");
  setCell(tiles, 42, ground + 6, "ro");
  setCell(tiles, 58, ground + 5, "lo");
  setCell(tiles, 73, ground + 4, "eo");
  setCell(tiles, 88, ground + 5, "i");
  setCell(tiles, 89, ground + 6, "go");
  setCell(tiles, 104, ground + 4, "io");
  setCell(tiles, 25, ground, ".");
  setCell(tiles, 25, ground + 1, "h");
  setCell(tiles, 25, ground + 2, "h");
  setCell(tiles, 25, ground + 3, "h");
  fillRow(tiles, ground + 4, 24, 28, "p");
  setCell(tiles, 26, ground + 4, "x");
  setCell(tiles, 27, ground + 4, "io");

  fillRow(tiles, ground, 62, 70, "p");
  for (let y = ground - 3; y < ground; y++) {
    setCell(tiles, 62, y, "p");
    setCell(tiles, 70, y, "p");
  }
  fillRow(tiles, ground - 4, 62, 70, "p");
  setCell(tiles, 62, ground - 1, "D");
  setCell(tiles, 62, ground - 2, "U");
  setCell(tiles, 70, ground - 2, "j");
  setCell(tiles, 63, ground - 1, "F");
  setCell(tiles, 64, ground - 1, "T");
  setCell(tiles, 65, ground - 1, "bk");
  setCell(tiles, 68, ground - 1, "C");
  setCell(tiles, 66, ground - 1, "z");
  setCell(tiles, 67, ground - 1, "Z");
  setCell(tiles, 69, ground - 1, "hp");
  setCell(tiles, 66, ground - 2, "t");
  setCell(tiles, 69, ground - 5, "t");
  setCell(tiles, 63, ground - 3, "nt");
  setCell(tiles, 69, ground - 3, "jk");
  setCell(tiles, 67, ground - 3, "et");
  setCell(tiles, 61, ground - 1, "vi");
  setCell(tiles, 61, ground - 2, "vi");
  setCell(tiles, 65, ground - 3, "ww");
  setCell(tiles, 71, ground - 1, "nt");

  fillRow(tiles, ground, 71, 80, "m");
  fillRow(tiles, ground - 1, 74, 78, "sb");
  fillRow(tiles, ground - 2, 74, 78, "sb");
  fillRow(tiles, ground - 3, 74, 78, "sb");
  setCell(tiles, 73, ground - 1, "di");
  setCell(tiles, 73, ground - 2, "di");
  setCell(tiles, 75, ground - 1, "dp");
  setCell(tiles, 76, ground - 1, "pi");
  setCell(tiles, 77, ground - 2, "ov");
  setCell(tiles, 78, ground - 1, "tn");
  setCell(tiles, 79, ground - 1, "C");
  setCell(tiles, 74, ground - 4, "t");
  setCell(tiles, 80, ground - 1, "ib");

  for (let x = 81; x <= 96; x++) setCell(tiles, x, ground, "sn");
  fillRow(tiles, ground, 86, 89, "I");
  setCell(tiles, 87, ground, "bi");
  setCell(tiles, 88, ground, "bi");
  spruceTree(tiles, 84, ground);
  spruceTree(tiles, 92, ground);
  setCell(tiles, 81, ground - 1, "bm");
  setCell(tiles, 96, ground - 1, "rm");

  for (let x = 97; x <= 108; x++) setCell(tiles, x, ground, x % 2 ? "a" : "sd");
  setCell(tiles, 99, ground - 1, "k");
  setCell(tiles, 103, ground - 1, "k");
  setCell(tiles, 105, ground - 1, "k");
  fillRow(tiles, ground - 2, 101, 104, "ap");
  setCell(tiles, 101, ground - 3, "dk");
  setCell(tiles, 104, ground - 3, "dk");
  setCell(tiles, 102, ground - 1, "gb");

  for (let x = 109; x < W - 1; x++) {
    setCell(tiles, x, ground, x % 5 === 0 ? "ss" : x % 7 === 2 ? "mg" : "nr");
  }
  fillRow(tiles, ground, 118, 122, "nk");
  for (let y = ground - 3; y < ground; y++) {
    setCell(tiles, 118, y, "nk");
    setCell(tiles, 122, y, "nk");
  }
  fillRow(tiles, ground - 4, 118, 122, "nk");
  setCell(tiles, 119, ground - 1, "t");
  setCell(tiles, 121, ground - 1, "C");
  setCell(tiles, 120, ground - 1, "et");
  setCell(tiles, 118, ground - 2, "gl");
  setCell(tiles, 122, ground - 5, "gl");
  portal(tiles, 112, ground);
  fillRow(tiles, ground + 1, 124, 126, "v");
  setCell(tiles, 124, ground, ".");
  setCell(tiles, 125, ground, ".");
  setCell(tiles, 126, ground, ".");
  setCell(tiles, 123, ground, "h");
  setCell(tiles, 110, ground - 1, "rm");
  setCell(tiles, 111, ground - 1, "bm");
  setCell(tiles, 117, ground - 1, "db");
  setCell(tiles, 109, ground - 1, "eb");

  setCell(tiles, 0, ground, "B");
  setCell(tiles, W - 1, ground, "B");

  const chests = scanChests(tiles);
  fillChest(chests, 68, ground - 1, [
    ["potato", 6],
    ["egg", 2],
    ["feather", 4],
    ["sugar-cane", 4],
    ["saddle", 1],
    ["cookie", 4],
    ["cooked-chicken", 2],
    ["cooked-mutton", 2],
  ]);
  fillChest(chests, 79, ground - 1, [
    ["chainmail-helmet", 1],
    ["chainmail-chestplate", 1],
    ["chainmail-leggings", 1],
    ["chainmail-boots", 1],
    ["bone", 6],
    ["string", 6],
    ["spider-eye", 2],
    ["redstone-dust", 8],
    ["gold-ingot", 4],
    ["bow", 1],
    ["arrow", 12],
  ]);
  fillChest(chests, 121, ground - 1, [
    ["netherite-helmet", 1],
    ["netherite-chestplate", 1],
    ["netherite-leggings", 1],
    ["netherite-boots", 1],
    ["gold-ingot", 8],
    ["flint-and-steel", 1],
    ["glowstone", 4],
    ["potion-heal", 2],
  ]);

  return {
    w: W,
    h: H,
    tiles,
    ground,
    nightSpawned: false,
    cropT: 0,
    chests,
    lit: {},
    bombs: [],
    portalLit: false,
    portalCd: 0,
  };
}

function tileAt(px, py) {
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  if (y < 0 || y >= world.h || x < 0 || x >= world.w) return "B";
  return world.tiles[y][x];
}

function solidAt(px, py) {
  return isSolid(tileAt(px, py));
}

function rectHitsSolid(x, y, w, h) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return true;
  const x0 = Math.floor(x / TILE);
  const x1 = Math.floor((x + w - 1) / TILE);
  const y0 = Math.floor(y / TILE);
  const y1 = Math.floor((y + h - 1) / TILE);
  if (x1 < x0 || y1 < y0 || x1 - x0 > 8 || y1 - y0 > 8) return true;
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = tx < 0 || tx >= world.w || ty < 0 || ty >= world.h ? "B" : world.tiles[ty][tx];
      if (isSolid(t)) return true;
    }
  }
  return false;
}

function supportedByFloor(body) {
  return rectHitsSolid(body.x - body.hw, body.y, body.hw * 2, 3);
}

function snapToFloor(body) {
  body.y = Math.floor((body.y + 2) / TILE) * TILE;
  body.vy = 0;
  body.grounded = true;
}

function unstick(body) {
  if (!rectHitsSolid(body.x - body.hw, body.y - body.hh, body.hw * 2, body.hh)) return;
  if (body.vy >= 0) {
    const lifted = Math.floor((body.y + 2) / TILE) * TILE;
    if (!rectHitsSolid(body.x - body.hw, lifted - body.hh, body.hw * 2, body.hh)) {
      body.y = lifted;
      body.vy = 0;
      body.grounded = true;
      return;
    }
  }
  for (const dy of [-1, -2, -4]) {
    if (!rectHitsSolid(body.x - body.hw, body.y - body.hh + dy, body.hw * 2, body.hh)) {
      body.y += dy;
      return;
    }
  }
  for (const dx of [2, -2, 4, -4]) {
    if (!rectHitsSolid(body.x - body.hw + dx, body.y - body.hh, body.hw * 2, body.hh)) {
      body.x += dx;
      return;
    }
  }
}

function waterSurfaceY(px, py) {
  const x = Math.floor(px / TILE);
  if (x < 0 || x >= world.w) return null;
  let y = Math.floor(py / TILE);
  if (y < 0) y = 0;
  if (y >= world.h) y = world.h - 1;
  if (world.tiles[y][x] !== "w") {
    let found = -1;
    for (let dy = -4; dy <= 2; dy++) {
      const ty = y + dy;
      if (ty >= 0 && ty < world.h && world.tiles[ty][x] === "w") {
        found = ty;
        break;
      }
    }
    if (found < 0) return null;
    y = found;
  }
  while (y > 0 && world.tiles[y - 1][x] === "w") y -= 1;
  return y * TILE;
}

function inWaterAt(body) {
  return tileAt(body.x, body.y - 4) === "w" || tileAt(body.x, body.y - 16) === "w" || tileAt(body.x, body.y - body.hh + 6) === "w";
}

function swimBody(body, dt) {
  const surface = waterSurfaceY(body.x, body.y - 4);
  if (surface == null) return;
  const floatY = surface + 8;
  body.grounded = false;
  if (body.y > floatY + 6) body.vy = Math.min(body.vy - 1600 * dt, -40);
  else if (body.y < floatY - 10) body.vy = Math.min(MAX_FALL, body.vy + GRAVITY * 0.35 * dt);
  else {
    body.vy *= 0.55;
    body.y += (floatY - body.y) * Math.min(1, dt * 8);
  }
  if ((body.knockT ?? 0) <= 0) body.vx *= 0.9;
  const headWet = tileAt(body.x, body.y - body.hh + 6) === "w";
  if (headWet) {
    body.air = (body.air ?? 12) - dt;
    if (body.air <= 0) {
      body.drownT = (body.drownT ?? 0) + dt;
      if (body.drownT >= 0.7) {
        body.drownT = 0;
        hurt(body, 1, 0);
      }
    }
  } else {
    body.air = 12;
    body.drownT = 0;
  }
}

function moveBody(body, dt) {
  unstick(body);
  const wet = inWaterAt(body);
  const prevVy = body.vy;
  if (wet) {
    body.vy = Math.min(MAX_FALL, body.vy + GRAVITY * 0.35 * dt);
  } else if (body.grounded && body.vy >= 0 && supportedByFloor(body)) {
    body.vy = 0;
    snapToFloor(body);
  } else {
    body.vy = Math.min(MAX_FALL, body.vy + GRAVITY * dt);
  }

  const nx = body.x + body.vx * dt;
  if (rectHitsSolid(nx - body.hw, body.y - body.hh, body.hw * 2, body.hh)) body.vx = 0;
  else body.x = nx;

  const ny = body.y + body.vy * dt;
  if (rectHitsSolid(body.x - body.hw, ny - body.hh, body.hw * 2, body.hh)) {
    if (wet) {
      const headHit = rectHitsSolid(body.x - body.hw, ny - body.hh, body.hw * 2, 6);
      if (headHit && body.vy < 0) {
        body.y = Math.ceil((ny - body.hh) / TILE) * TILE + body.hh + 0.05;
        body.vy = 0;
      } else if (body.vy > 0) {
        body.y = Math.floor((body.y + 2) / TILE) * TILE;
        body.vy = 0;
      } else {
        body.y = ny;
      }
      body.grounded = false;
    } else if (body.vy > 0) {
      body.y = ny;
      snapToFloor(body);
      if (prevVy > 860 && body === player) hurt(player, 2, Math.sign(body.vx) || -1);
    } else {
      body.y = Math.ceil((ny - body.hh) / TILE) * TILE + body.hh + 0.05;
      body.grounded = false;
      body.vy = 0;
    }
  } else {
    body.y = ny;
    body.grounded = !wet && supportedByFloor(body);
    if (body.grounded && body.vy >= 0) snapToFloor(body);
  }

  const mid = tileAt(body.x, body.y - 2);
  const chest = tileAt(body.x, body.y - 8);
  const left = tileAt(body.x - 16, body.y - 8);
  const right = tileAt(body.x + 16, body.y - 8);
  const around = [chest, left, right];
  body.inWater = inWaterAt(body);
  body.inLava = mid === "v" || tileAt(body.x, body.y - 16) === "v";
  body.atChest = around.includes("C") || around.includes("hp");
  body.atTable = around.includes("T");
  body.atFurnace = around.includes("F");
  body.atEnchant = around.includes("et");
  body.atJukebox = around.includes("jk") || around.includes("nt");
  body.atHopper = around.includes("hp");
  const bed = chest;
  body.atBed = bed === "z" || bed === "Z" || left === "z" || right === "Z" || left === "Z" || right === "z";
  body.onIce = ["I", "bi"].includes(tileAt(body.x, body.y + 2));
  body.onSoul = tileAt(body.x, body.y + 2) === "ss";
  body.onMagma = tileAt(body.x, body.y + 2) === "mg";
  if (body.inWater) swimBody(body, dt);
  else {
    body.air = 12;
    body.drownT = 0;
  }
}

function makePlayer() {
  return {
    x: TILE * 3.5,
    y: TILE * 10,
    vx: 0,
    vy: 0,
    hw: 10,
    hh: 46,
    face: 1,
    grounded: false,
    health: 20,
    hunger: 18,
    invuln: 0,
    anim: "idle",
    frame: 0,
    age: 0,
    swingT: 0,
    hurtT: 0,
    knockT: 0,
    dropCd: 0,
    eatT: 0,
    dead: false,
    air: 12,
    drownT: 0,
    inWater: false,
    inLava: false,
    atBed: false,
    atTable: false,
    atFurnace: false,
    atEnchant: false,
    atJukebox: false,
    armor: 0,
    selected: 0,
    sleeping: 0,
    hungerT: 0,
    shootCd: 0,
    powerT: 0,
    mount: null,
    equipped: { head: "", chest: "", legs: "", feet: "" },
    items: [
      { id: "diamond-sword", count: 1 },
      { id: "diamond-pickaxe", count: 1 },
      { id: "torch", count: 8 },
      { id: "wheat-seeds", count: 8 },
      { id: "carrot", count: 4 },
      { id: "wheat", count: 4 },
      { id: "bread", count: 2 },
      { id: "oak-log", count: 8 },
    ],
  };
}

function makeMob(kind, tx, ty) {
  const specs = {
    zombie: { hp: 8, speed: 70, dmg: 2, hw: 12, hh: 50, scale: 0.17, sheet: "zombie-sprites", h: 520 },
    skeleton: { hp: 6, speed: 90, dmg: 1, hw: 11, hh: 50, scale: 0.17, sheet: "skeleton-sprites", h: 520 },
    spider: { hp: 6, speed: 130, dmg: 1, hw: 18, hh: 28, scale: 0.14, sheet: "spider-sprites", h: 400 },
    enderman: { hp: 12, speed: 100, dmg: 3, hw: 10, hh: 70, scale: 0.16, sheet: "enderman-sprites", h: 640 },
    creeper: { hp: 10, speed: 75, dmg: 8, hw: 12, hh: 44, scale: 0.18, sheet: "creeper-sprites", h: 480 },
    pig: { hp: 6, speed: 55, dmg: 0, hw: 14, hh: 28, scale: 0.16, sheet: "pig-sprites", h: 480, passive: true },
    cow: { hp: 8, speed: 50, dmg: 0, hw: 16, hh: 40, scale: 0.17, sheet: "cow-sprites", h: 480, passive: true },
  };
  return {
    kind,
    ...specs[kind],
    x: tx * TILE + TILE / 2,
    y: ty * TILE,
    vx: 0,
    vy: 0,
    face: -1,
    grounded: false,
    health: specs[kind].hp,
    age: Math.random(),
    hitT: 0,
    deathT: 0,
    dead: false,
    air: 12,
    drownT: 0,
    inWater: false,
    inLava: false,
    fuse: 0,
    exploded: false,
    drawT: 0,
    shootCd: 0,
    hurtFlee: 0,
    stillT: Math.random() * 3,
    followT: 0,
    loveT: 0,
  };
}

function makeDrop(id, x, y, count = 1) {
  return { id, x, y, vy: -180, count, bob: Math.random() * Math.PI * 2, gone: false };
}

function resetGame() {
  world = buildWorld();
  player = makePlayer();
  mobs = [
    makeMob("pig", 7, 10),
    makeMob("pig", 10, 10),
    makeMob("zombie", 18, 10),
    makeMob("skeleton", 27, 10),
    makeMob("creeper", 33, 10),
    makeMob("spider", 43, 10),
    makeMob("cow", 51, 10),
    makeMob("cow", 54, 10),
    makeMob("enderman", 56, 10),
    makeMob("zombie", 50, 10),
    makeMob("spider", 76, 10),
    makeMob("skeleton", 82, 10),
    makeMob("pig", 90, 10),
    makeMob("creeper", 107, 10),
    makeMob("enderman", 114, 10),
    makeMob("zombie", 120, 10),
  ];
  drops = [
    makeDrop("diamond", TILE * 13.5, TILE * 9),
    makeDrop("diamond", TILE * 24, TILE * 7.5),
    makeDrop("diamond", TILE * 42, TILE * 5.5),
    makeDrop("golden-apple", TILE * 21, TILE * 9),
    makeDrop("potion-heal", TILE * 39, TILE * 9),
    makeDrop("iron-chestplate", TILE * 67, TILE * 9),
    makeDrop("coal", TILE * 63.5, TILE * 9, 6),
    makeDrop("iron-ingot", TILE * 64.2, TILE * 9, 4),
    makeDrop("apple", TILE * 69, TILE * 9, 2),
    makeDrop("slimeball", TILE * 15.5, TILE * 9, 2),
    makeDrop("snowball", TILE * 86, TILE * 9, 6),
  ];
  particles = [];
  arrows = [];
  craftingOpen = false;
  chestOpen = false;
  chestItems = world.chests["68,9"] ?? emptySlots(CHEST_SLOTS);
  craftScroll = 0;
  cam = { x: 0, y: 0 };
  time = 0;
  clock = 8;
  win = false;
  demo = null;
  hold.left = hold.right = hold.jump = hold.use = false;
  message = "向东探索农场、矿洞、雪原和下界。工作台合成，熔炉烧矿，箱子能存东西。把 5 颗钻石放进箱子通关。";
  messageT = 6;
}

function selectedItem() {
  return player.items[player.selected];
}

function throwSelected() {
  if (!player || player.dead || win || craftingOpen || chestOpen) return;
  const item = selectedItem();
  if (!item || item.count <= 0) {
    say("这一格是空的。");
    return;
  }
  item.count -= 1;
  const toss = makeDrop(item.id, player.x + player.face * 42, player.y - 30);
  toss.vy = -240;
  drops.push(toss);
  player.dropCd = 0.55;
  say(`扔掉了${ITEM_LABELS[item.id] ?? item.id}`);
}

function addItem(id, count) {
  if (!tryAddItem(player.items, id, count)) return false;
  return true;
}

function refreshArmor() {
  const eq = player.equipped ?? {};
  player.armor = Math.min(
    20,
    Object.values(eq).reduce((sum, id) => sum + (ARMOR[id]?.value ?? 0), 0),
  );
}

function spillItem(id, count, x = player.x + player.face * 36, y = player.y - 28) {
  drops.push(makeDrop(id, x, y, count));
  say(`背包满了，${ITEM_LABELS[id] ?? id}掉在地上。`);
}

function diamonds() {
  return player.items.find((it) => it.id === "diamond")?.count ?? 0;
}

function say(text, secs = 2.4) {
  message = text;
  messageT = secs;
}

function isNight() {
  return clock >= 19 || clock < 6;
}

function hourLabel() {
  const h = Math.floor(clock) % 24;
  return `${String(h).padStart(2, "0")}:00`;
}

function hostilesNear(who, range) {
  return mobs.some((mob) => !mob.dead && !mob.passive && Math.hypot(mob.x - who.x, mob.y - who.y) < range);
}

function burstHearts(x, y) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      kind: "heart",
      x: x + (Math.random() - 0.5) * 18,
      y: y - 24,
      vx: (Math.random() - 0.5) * 36,
      vy: -70 - Math.random() * 50,
      life: 0.7 + Math.random() * 0.4,
    });
  }
}

function burstBits(x, y, color) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      kind: "bit",
      x,
      y,
      vx: (Math.random() - 0.5) * 120,
      vy: -80 - Math.random() * 80,
      life: 0.35 + Math.random() * 0.25,
      color,
    });
  }
}

function frontCell() {
  const tx = Math.floor((player.x + player.face * 28) / TILE);
  const cells = [
    { x: tx, y: Math.floor((player.y - 12) / TILE) },
    { x: tx, y: Math.floor((player.y - 36) / TILE) },
    { x: Math.floor(player.x / TILE), y: Math.floor((player.y - 12) / TILE) },
  ];
  return cells;
}

function findTileNear(px, py, ids) {
  const want = new Set(ids);
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  for (const dy of [0, -1, -2, 1]) {
    for (const dx of [0, 1, -1, 2, -2]) {
      const t = world.tiles[y + dy]?.[x + dx];
      if (want.has(t)) return { x: x + dx, y: y + dy, t };
    }
  }
  return null;
}

function tryOpenTable() {
  if (!player.atTable) return false;
  chestOpen = false;
  craftingOpen = !craftingOpen;
  craftScroll = 0;
  say(craftingOpen ? "打开了工作台。点击配方合成。" : "关上了工作台。", 3);
  return true;
}

function tryOpenChest() {
  if (!player.atChest) return false;
  craftingOpen = false;
  if (chestOpen) {
    chestOpen = false;
    say("关上了箱子。", 3);
    return true;
  }
  const hit = findTileNear(player.x, player.y - 8, ["C", "hp"]);
  if (!hit) return false;
  let key = `${hit.x},${hit.y}`;
  if (!world.chests[key]) {
    const near = findTileNear(hit.x * TILE + 24, hit.y * TILE + 24, ["C"]);
    key = near ? `${near.x},${near.y}` : key;
    if (!world.chests[key]) world.chests[key] = emptySlots(CHEST_SLOTS);
  }
  chestItems = world.chests[key];
  chestOpen = true;
  say(hit.t === "hp" ? "漏斗连着箱子。点击格子存入或取出。" : "打开了箱子。点击格子存入或取出。", 3);
  return true;
}

function chestDiamonds() {
  return Object.values(world?.chests ?? {}).reduce((n, slots) => n + countOwned(slots, "diamond"), 0);
}

function checkChestWin() {
  if (win) return;
  if (chestDiamonds() >= GOAL_DIAMONDS) {
    win = true;
    chestOpen = false;
    say("钻石放进箱子了。试玩通关！", 10);
  }
}

function visibleRecipes() {
  const max = Math.max(0, RECIPES.length - CRAFT_VISIBLE);
  craftScroll = Math.max(0, Math.min(max, craftScroll));
  return RECIPES.slice(craftScroll, craftScroll + CRAFT_VISIBLE);
}

function doCraft(recipe) {
  if (!recipe) return;
  if (!canCraft(player.items, recipe)) {
    say(`还缺材料，做不了${ITEM_LABELS[recipe.id] ?? recipe.id}。`);
    return;
  }
  const made = craftOnce(player.items, recipe);
  if (!made) return;
  if (addItem(made.id, made.count)) say(`合成了${ITEM_LABELS[made.id] ?? made.id} ×${made.count}。`);
  else spillItem(made.id, made.count);
  burstBits(player.x, player.y - 20, "#c6a15b");
}

function trySleep() {
  if (!player.atBed) return false;
  if (!isNight()) return false;
  if (hostilesNear(player, 220)) {
    say("附近有怪物，睡不着。");
    return true;
  }
  player.sleeping = 1.7;
  player.vx = 0;
  say("你躺下休息了。");
  return true;
}

function tryFeed() {
  const item = selectedItem();
  if (!item || item.count <= 0) return false;
  for (const mob of mobs) {
    if (mob.dead || !mob.passive) continue;
    if (FEED[mob.kind] !== item.id) continue;
    if (Math.hypot(mob.x - player.x, mob.y - player.y) > 52) continue;
    item.count -= 1;
    mob.followT = 8;
    mob.loveT = 1.2;
    mob.stillT = 0;
    mob.hurtFlee = 0;
    burstHearts(mob.x, mob.y);
    say(`喂了${mob.kind === "pig" ? "猪" : "牛"}。它跟着你。`);
    return true;
  }
  return false;
}

function tryFarm() {
  const item = selectedItem();
  const tx = Math.floor((player.x + player.face * 22) / TILE);
  const groundY = Math.floor((player.y + 4) / TILE);
  const cropY = groundY - 1;
  const soil = world.tiles[groundY]?.[tx];
  const above = world.tiles[cropY]?.[tx];
  if (item?.id === "wheat-seeds" && item.count > 0 && soil === "n" && (above === "." || above === "G" || above === "f" || above === "P")) {
    setCell(world.tiles, tx, cropY, "0");
    item.count -= 1;
    say("种下了小麦。");
    return true;
  }
  if (item?.id === "oak-sapling" && item.count > 0 && (soil === "g" || soil === "d") && (above === "." || above === "G")) {
    setCell(world.tiles, tx, cropY, "sa");
    item.count -= 1;
    say("种下了树苗。");
    return true;
  }
  if (above === "2") {
    setCell(world.tiles, tx, cropY, ".");
    if (!addItem("wheat", 1)) spillItem("wheat", 1);
    if (Math.random() < 0.7 && !addItem("wheat-seeds", 1)) spillItem("wheat-seeds", 1);
    burstBits(tx * TILE + 24, cropY * TILE + 24, "#c6b34a");
    say("收割了小麦。");
    return true;
  }
  return false;
}

function dropMined(spec, x, y, shears) {
  if (spec.chance != null && !shears && Math.random() > spec.chance) return;
  const id = shears && spec.shearsDrop ? spec.shearsDrop : spec.drop;
  const n = spec.count ?? 1;
  drops.push(makeDrop(id, x * TILE + 24, y * TILE + 8, n));
}

function tryMineOrPlace() {
  const item = selectedItem();
  const shears = item?.id === "shears";
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (!t || t === ".") continue;
    const spec = MINEABLE[t];
    if (spec) {
      if (spec.tool && item?.id !== spec.tool) {
        say("需要镐才能挖这个。");
        return true;
      }
      if (spec.tool) {
        if (player.swingT > 0) return true;
        player.swingT = 10 / 12;
        player.anim = "swing";
        player.frame = 0;
      }
      if (t === "z" || t === "Z") {
        const ox = t === "z" ? 1 : -1;
        setCell(world.tiles, cell.x, cell.y, ".");
        if (world.tiles[cell.y]?.[cell.x + ox] === (t === "z" ? "Z" : "z")) setCell(world.tiles, cell.x + ox, cell.y, ".");
        drops.push(makeDrop("bed", cell.x * TILE + 24, cell.y * TILE + 8));
        return true;
      }
      if (t === "C") {
        const key = `${cell.x},${cell.y}`;
        const leftover = world.chests[key];
        if (leftover) {
          leftover.forEach((it) => {
            if (it.count > 0) drops.push(makeDrop(it.id, cell.x * TILE + 24, cell.y * TILE + 8, it.count));
          });
          delete world.chests[key];
        }
      }
      setCell(world.tiles, cell.x, cell.y, spec.remain ?? ".");
      dropMined({ ...spec, shearsDrop: t === "L" || t === "bl" || t === "sl" ? "oak-leaves" : spec.shearsDrop }, cell.x, cell.y, shears);
      if (t === "gv" && Math.random() < 0.25) drops.push(makeDrop("flint-and-steel", cell.x * TILE + 16, cell.y * TILE + 4));
      burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#bbb");
      return true;
    }
  }
  if (item?.id === "bed" && item.count > 0) {
    const tx = Math.floor((player.x + player.face * 28) / TILE);
    const ty = Math.floor((player.y - 12) / TILE);
    if (world.tiles[ty]?.[tx] === "." && world.tiles[ty]?.[tx + player.face] === "." && isSolid(world.tiles[ty + 1]?.[tx])) {
      setCell(world.tiles, tx, ty, player.face > 0 ? "z" : "Z");
      setCell(world.tiles, tx + player.face, ty, player.face > 0 ? "Z" : "z");
      item.count -= 1;
      say("放下了床。");
      return true;
    }
  }
  if (item && PLACEABLE[item.id] && item.count > 0) {
    const tx = Math.floor((player.x + player.face * 28) / TILE);
    const ty = Math.floor((player.y - 12) / TILE);
    const dest = world.tiles[ty]?.[tx];
    if (item.id === "lily-pad" && dest === "w") {
      setCell(world.tiles, tx, ty, "lp");
      item.count -= 1;
      say("放下了睡莲。");
      return true;
    }
    if (dest === ".") {
      const below = world.tiles[ty + 1]?.[tx];
      if (below && (isSolid(below) || below === "n" || below === "w")) {
        setCell(world.tiles, tx, ty, PLACEABLE[item.id]);
        item.count -= 1;
        if (item.id === "chest") world.chests[`${tx},${ty}`] = emptySlots(CHEST_SLOTS);
        say(`放下了${ITEM_LABELS[item.id] ?? item.id}`);
        return true;
      }
    }
  }
  return false;
}

function hurt(who, amount, dir) {
  if (who.dead) return;
  if (who === player) {
    if (player.invuln > 0) return;
    const soaked = Math.min(amount - 1, Math.floor(player.armor / 4));
    const taken = Math.max(1, amount - soaked);
    player.health = Math.max(0, player.health - taken);
    player.invuln = 0.9;
    player.hurtT = 8 / 12;
    if (dir) {
      player.knockT = 0.2;
      player.vx = dir * 220;
      player.vy = -220;
    }
    if (player.health <= 0) {
      player.dead = true;
      player.anim = "death";
      player.frame = 0;
      player.age = 0;
      say("你死了。按 R 重来。", 8);
    }
    return;
  }
  who.health -= amount;
  who.hitT = 8 / 12;
  if (dir) {
    who.vx = dir * 260;
    who.vy = -160;
  }
  if (who.passive) who.hurtFlee = 1.6;
  if (who.health <= 0) {
    who.dead = true;
    who.deathT = 0;
    const loot = {
      zombie: "rotten-flesh",
      skeleton: "bone",
      spider: "string",
      creeper: "gunpowder",
      enderman: "ender-pearl",
      pig: "cooked-porkchop",
      cow: "steak",
    };
    drops.push(makeDrop(loot[who.kind] ?? "apple", who.x, who.y - 20));
    if (who.kind === "skeleton") drops.push(makeDrop("arrow", who.x - 8, who.y - 18));
    if (who.kind === "spider") drops.push(makeDrop("spider-eye", who.x + 6, who.y - 16));
    if (who.kind === "cow") drops.push(makeDrop("leather", who.x + 8, who.y - 18));
    if (who.kind === "enderman" || Math.random() < 0.2) drops.push(makeDrop("diamond", who.x + 8, who.y - 24));
    if (who.kind === "zombie" && Math.random() < 0.12) drops.push(makeDrop("iron-ingot", who.x - 6, who.y - 22));
  }
}

function trySmelt() {
  if (!player.atFurnace) return false;
  const item = selectedItem();
  if (!item || item.count <= 0 || !SMELT[item.id]) return false;
  const made = smeltOnce(player.items, item.id);
  if (!made) {
    say("还缺煤炭当燃料。");
    return true;
  }
  const hit = findTileNear(player.x, player.y - 8, ["F"]);
  if (hit) world.lit[`${hit.x},${hit.y}`] = 2.2;
  if (addItem(made.id, made.count)) say(`烧出了${ITEM_LABELS[made.id] ?? made.id}。`);
  else spillItem(made.id, made.count);
  burstBits(player.x, player.y - 18, "#ffb347");
  return true;
}

function tryEnchant() {
  if (!player.atEnchant) return false;
  if ((player.powerT ?? 0) > 0) {
    say("附魔还在生效。");
    return true;
  }
  if (countOwned(player.items, "lapis-ore") < 1 && countOwned(player.items, "redstone-dust") < 3) {
    say("附魔台需要青金石矿或 3 个红石。");
    return true;
  }
  if (countOwned(player.items, "lapis-ore") >= 1) takeNeed(player.items, { "lapis-ore": 1 });
  else takeNeed(player.items, { "redstone-dust": 3 });
  player.powerT = 25;
  burstBits(player.x, player.y - 24, "#7c5cff");
  say("剑锋发出紫光。25 秒内伤害更高。");
  return true;
}

function tryJukebox() {
  if (!player.atJukebox) return false;
  for (let i = 0; i < 10; i++) {
    particles.push({
      kind: "bit",
      x: player.x + (Math.random() - 0.5) * 20,
      y: player.y - 36,
      vx: (Math.random() - 0.5) * 40,
      vy: -50 - Math.random() * 40,
      life: 0.8,
      color: ["#ff5c8a", "#ffe566", "#7cf37c", "#7ecbff"][i % 4],
    });
  }
  say(Math.random() < 0.5 ? "唱片机响起方块音符。" : "音符盒叮了一声。");
  return true;
}

function tryDoor() {
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (t === "di") {
      setCell(world.tiles, cell.x, cell.y, "dO");
      if (world.tiles[cell.y - 1]?.[cell.x] === "di") setCell(world.tiles, cell.x, cell.y - 1, "dO");
      if (world.tiles[cell.y + 1]?.[cell.x] === "di") setCell(world.tiles, cell.x, cell.y + 1, "dO");
      say("铁门打开了。");
      return true;
    }
    if (t === "dO") {
      setCell(world.tiles, cell.x, cell.y, "di");
      if (world.tiles[cell.y - 1]?.[cell.x] === "dO") setCell(world.tiles, cell.x, cell.y - 1, "di");
      if (world.tiles[cell.y + 1]?.[cell.x] === "dO") setCell(world.tiles, cell.x, cell.y + 1, "di");
      say("铁门关上了。");
      return true;
    }
  }
  return false;
}

function trySaddle() {
  const item = selectedItem();
  if (item?.id !== "saddle" || item.count <= 0) return false;
  for (const mob of mobs) {
    if (mob.dead || mob.kind !== "pig") continue;
    if (Math.hypot(mob.x - player.x, mob.y - player.y) > 52) continue;
    item.count -= 1;
    player.mount = mob;
    mob.followT = 0;
    say("骑上了猪。再按跳下来。");
    return true;
  }
  return false;
}

function tryBucket() {
  const item = selectedItem();
  if (!item || item.count <= 0) return false;
  const tx = Math.floor((player.x + player.face * 28) / TILE);
  const ty = Math.floor((player.y - 12) / TILE);
  if (item.id === "bucket" && world.tiles[ty]?.[tx] === "w") {
    setCell(world.tiles, tx, ty, ".");
    item.count -= 1;
    if (!addItem("water-bucket", 1)) spillItem("water-bucket", 1);
    say("装满了水。");
    return true;
  }
  if (item.id === "water-bucket" && world.tiles[ty]?.[tx] === ".") {
    setCell(world.tiles, tx, ty, "w");
    item.count -= 1;
    if (!addItem("bucket", 1)) spillItem("bucket", 1);
    say("把水倒了出来。");
    return true;
  }
  return false;
}

function trySponge() {
  const item = selectedItem();
  if (item?.id !== "sponge" || item.count <= 0) return false;
  const tx = Math.floor((player.x + player.face * 22) / TILE);
  const ty = Math.floor((player.y - 12) / TILE);
  let n = 0;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (world.tiles[ty + dy]?.[tx + dx] === "w") {
        setCell(world.tiles, tx + dx, ty + dy, ".");
        n += 1;
      }
    }
  }
  if (n <= 0) return false;
  item.count -= 1;
  say(`海绵吸掉了 ${n} 格水。`);
  return true;
}

function tryFlint() {
  const item = selectedItem();
  if (item?.id !== "flint-and-steel" || item.count <= 0) return false;
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (t === "tn") {
      world.bombs.push({ x: cell.x, y: cell.y, t: 1.15 });
      say("TNT 点燃了！");
      return true;
    }
    if (t === "ob") {
      world.portalLit = true;
      burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#a45cff");
      say("下界门发出紫光。走进门框就能传送回家。");
      return true;
    }
  }
  return false;
}

function tryArmor() {
  const item = selectedItem();
  const spec = item?.count > 0 ? ARMOR[item.id] : null;
  if (!spec) return false;
  const prev = player.equipped[spec.slot];
  player.equipped[spec.slot] = item.id;
  item.count -= 1;
  if (prev) {
    if (!addItem(prev, 1)) spillItem(prev, 1);
  }
  refreshArmor();
  say(`装备了${ITEM_LABELS[item.id] ?? item.id}。`);
  return true;
}

function tryShoot() {
  const item = selectedItem();
  if (item?.id !== "bow") return false;
  if (player.shootCd > 0) return true;
  if (countOwned(player.items, "arrow") < 1) {
    say("没有箭。");
    return true;
  }
  takeNeed(player.items, { arrow: 1 });
  player.shootCd = 0.45;
  player.swingT = 10 / 12;
  player.anim = "swing";
  const speed = 460;
  arrows.push({
    x: player.x + player.face * 22,
    y: player.y - 28,
    vx: player.face * speed,
    vy: -20,
    life: 2.2,
    gone: false,
    friendly: true,
  });
  say("射了一箭。");
  return true;
}

function tryThrow() {
  const item = selectedItem();
  if (!item || item.count <= 0) return false;
  if (item.id === "ender-pearl") {
    item.count -= 1;
    player.x += player.face * TILE * 8;
    player.y -= 8;
    hurt(player, 2, -player.face);
    burstBits(player.x, player.y - 20, "#3d8c5a");
    say("末影珍珠把你甩了过去。");
    return true;
  }
  if (item.id !== "snowball" && item.id !== "slimeball" && item.id !== "egg") return false;
  item.count -= 1;
  arrows.push({
    x: player.x + player.face * 20,
    y: player.y - 24,
    vx: player.face * (item.id === "slimeball" ? 280 : 340),
    vy: -80,
    life: 1.6,
    gone: false,
    friendly: true,
    pebble: item.id,
  });
  say(`扔出了${ITEM_LABELS[item.id]}。`);
  return true;
}

function explodeAt(tx, ty, radius = 2.2) {
  for (let y = ty - 3; y <= ty + 3; y++) {
    for (let x = tx - 3; x <= tx + 3; x++) {
      if (Math.hypot(x - tx, y - ty) > radius) continue;
      const t = world.tiles[y]?.[x];
      if (!t || t === "B" || t === "ob") continue;
      if (t === "C") {
        const key = `${x},${y}`;
        (world.chests[key] ?? []).forEach((it) => {
          if (it.count > 0) drops.push(makeDrop(it.id, x * TILE + 24, y * TILE + 8, it.count));
        });
        delete world.chests[key];
      }
      if (t !== ".") setCell(world.tiles, x, y, ".");
      burstBits(x * TILE + 24, y * TILE + 24, "#f5c16c");
    }
  }
  const px = tx * TILE + 24;
  const py = ty * TILE + 24;
  if (!player.dead && Math.hypot(player.x - px, player.y - py) < radius * TILE + 20) {
    hurt(player, 8, Math.sign(player.x - px) || -1);
  }
  for (const mob of mobs) {
    if (mob.dead) continue;
    if (Math.hypot(mob.x - px, mob.y - py) < radius * TILE + 20) hurt(mob, 10, Math.sign(mob.x - px) || 1);
  }
}

function useSelected() {
  if (player.dead || win) return;
  if (player.sleeping > 0 || player.eatT > 0) return;
  if (craftingOpen) {
    craftingOpen = false;
    say("关上了工作台。");
    return;
  }
  if (chestOpen) {
    chestOpen = false;
    say("关上了箱子。");
    return;
  }
  if (tryOpenChest()) return;
  if (tryOpenTable()) return;
  if (trySmelt()) return;
  if (tryEnchant()) return;
  if (tryJukebox()) return;
  if (tryDoor()) return;
  if (trySleep()) return;
  if (tryFeed()) return;
  if (trySaddle()) return;
  if (tryFarm()) return;
  if (tryBucket()) return;
  if (trySponge()) return;
  if (tryFlint()) return;
  if (tryMineOrPlace()) return;
  const item = selectedItem();
  if (!item || item.count <= 0) return;
  if (tryShoot()) return;
  if (tryThrow()) return;
  if (tryArmor()) return;
  if (item.id === "diamond-sword") {
    if (player.swingT > 0) return;
    player.swingT = 10 / 12;
    player.anim = "swing";
    player.frame = 0;
    player.age = 0;
    return;
  }
  const food = FOOD[item.id];
  if (food) {
    if (player.health >= 20 && player.hunger >= 20) {
      say("已经吃饱了。");
      return;
    }
    player.health = Math.min(20, Math.max(0, player.health + food.health));
    player.hunger = Math.min(20, player.hunger + food.hunger);
    item.count -= 1;
    player.eatT = 8 / 10;
    player.anim = "eat";
    player.frame = 0;
    say(`使用了${ITEM_LABELS[item.id]}`);
  }
}

function swingHit() {
  const t = 1 - player.swingT / (10 / 12);
  if (t < 0.28 || t > 0.72) return;
  const reach = 46;
  const x = player.x + player.face * 18;
  for (const mob of mobs) {
    if (mob.dead || mob.hitT > 0) continue;
    if (Math.abs(mob.x - x) < reach + mob.hw && Math.abs(mob.y - player.y) < player.hh + 8) {
      hurt(mob, (player.powerT ?? 0) > 0 ? 5 : 3, player.face);
    }
  }
}

function updatePlayer(dt) {
  if (player.dead) {
    player.age += dt;
    player.frame = Math.min(11, Math.floor(player.age * 10));
    return;
  }

  if (craftingOpen || chestOpen) {
    player.vx = 0;
    player.vy = 0;
    player.anim = "idle";
    player.frame = 0;
    player.age += dt;
    if (craftingOpen && !player.atTable) craftingOpen = false;
    if (chestOpen && !player.atChest) chestOpen = false;
    return;
  }

  if (player.sleeping > 0) {
    player.sleeping -= dt;
    player.vx = 0;
    player.vy = 0;
    player.anim = "sleep";
    player.frame = Math.min(7, Math.floor((1 - player.sleeping / 1.7) * 8));
    if (player.sleeping <= 0) {
      clock = 6.2;
      player.health = Math.min(20, player.health + 8);
      player.hunger = Math.min(20, player.hunger + 6);
      say("早上好。你休息好了。", 3);
    }
    moveBody(player, dt);
    return;
  }

  const left = keys.has("a") || keys.has("arrowleft") || hold.left;
  const right = keys.has("d") || keys.has("arrowright") || hold.right;
  const jump = keys.has(" ") || keys.has("w") || keys.has("arrowup") || hold.jump;
  if (player.shootCd > 0) player.shootCd -= dt;
  if (player.powerT > 0) player.powerT -= dt;

  if (player.mount && !player.mount.dead) {
    const pig = player.mount;
    if (jump) {
      player.mount = null;
      player.vy = -JUMP * 0.6;
      say("从猪背上下来了。");
    } else {
      pig.face = left ? -1 : right ? 1 : pig.face;
      pig.vx = ((right ? 1 : 0) - (left ? 1 : 0)) * pig.speed * 1.35;
      player.face = pig.face;
      player.x = pig.x;
      player.y = pig.y - 10;
      player.vx = pig.vx;
      player.vy = 0;
      player.anim = Math.abs(pig.vx) > 12 ? "run" : "idle";
      player.age += dt;
      player.frame = player.anim === "run" ? Math.floor(player.age * 12) % 8 : 0;
      return;
    }
  } else {
    player.mount = null;
  }

  let speed = player.inWater ? MOVE * 0.55 : MOVE;
  if (player.onSoul) speed *= 0.45;
  if (player.onIce) speed *= 1.25;

  if (player.knockT > 0) {
    player.knockT -= dt;
  } else if (player.swingT <= 0 && player.eatT <= 0) {
    const target = (right ? speed : 0) - (left ? speed : 0);
    if (player.onIce) player.vx += (target - player.vx) * 0.08;
    else player.vx = target;
    if (left) player.face = -1;
    if (right) player.face = 1;
  } else {
    player.vx *= 0.85;
  }

  const onLadder =
    tileAt(player.x, player.y - 8) === "h" ||
    tileAt(player.x, player.y - 24) === "h" ||
    tileAt(player.x, player.y - 8) === "vi" ||
    tileAt(player.x, player.y - 24) === "vi";
  if (jump && player.eatT <= 0 && (player.grounded || player.inWater || onLadder)) {
    player.vy = player.inWater || onLadder ? -420 : -JUMP;
    player.grounded = false;
  }

  moveBody(player, dt);

  if (player.inLava) hurt(player, 3, -player.face);
  if (player.onMagma) hurt(player, 2, -player.face);
  if (tileAt(player.x, player.y - 8) === "k") hurt(player, 1, -player.face);

  if (player.swingT > 0) {
    player.swingT -= dt;
    swingHit();
    if (player.swingT <= 0) player.anim = "idle";
  }
  if (player.hurtT > 0) player.hurtT -= dt;
  if (player.invuln > 0) player.invuln -= dt;
  if (player.dropCd > 0) player.dropCd -= dt;

  player.hungerT += dt;
  if (player.hungerT > 9) {
    player.hungerT = 0;
    if (Math.abs(player.vx) > 20 || !player.grounded) player.hunger = Math.max(0, player.hunger - 1);
    if (player.hunger <= 0) hurt(player, 1, -player.face);
  }

  player.age += dt;
  if (player.eatT > 0) player.eatT -= dt;

  if (player.swingT > 0) {
    player.anim = "swing";
    player.frame = Math.min(9, Math.floor((1 - player.swingT / (10 / 12)) * 10));
  } else if (player.hurtT > 0) {
    player.anim = "hurt";
    player.frame = Math.min(7, Math.floor((1 - player.hurtT / (8 / 12)) * 8));
  } else if (player.eatT > 0) {
    player.anim = "eat";
    player.frame = Math.min(7, Math.floor((1 - player.eatT / (8 / 10)) * 8));
  } else if (!player.grounded) {
    player.anim = "jump";
    player.frame = player.vy < -80 ? 1 : player.vy > 120 ? 3 : 2;
  } else if (Math.abs(player.vx) > 20) {
    player.anim = "run";
    player.frame = Math.floor(player.age * 12) % 8;
  } else {
    player.anim = "idle";
    player.frame = 0;
  }

}

function updateMobs(dt) {
  for (const mob of mobs) {
    if (mob.dead) {
      mob.deathT = (mob.deathT ?? 0) + dt;
      continue;
    }
    mob.age += dt;
    if (mob.hitT > 0) mob.hitT -= dt;
    const dx = player.x - mob.x;
    const close = !player.dead && Math.abs(dx) < 420;
    if (mob.passive) {
      if (mob.loveT > 0) mob.loveT -= dt;
      if (mob.hurtFlee > 0) {
        mob.hurtFlee -= dt;
        mob.stillT = 0;
        mob.face = Math.sign(mob.x - player.x) || mob.face;
        mob.vx = mob.face * mob.speed * (mob.inWater ? 0.9 : 1.6);
      } else if (mob.followT > 0 && !player.dead) {
        mob.followT -= dt;
        const gap = player.x - mob.x;
        if (Math.abs(gap) > 36) {
          mob.face = Math.sign(gap) || mob.face;
          mob.vx = mob.face * mob.speed * (mob.inWater ? 0.5 : 0.95);
          mob.stillT = 0;
        } else {
          mob.vx = 0;
          mob.stillT += dt;
        }
      } else if ((mob.grounded || mob.inWater) && Math.random() < 0.012) {
        mob.face = Math.random() < 0.5 ? -1 : 1;
        mob.vx = mob.face * mob.speed * (0.35 + Math.random() * 0.45) * (mob.inWater ? 0.55 : 1);
        mob.stillT = 0;
      } else if (Math.random() < 0.01) {
        mob.vx = 0;
      }
      if (Math.abs(mob.vx) < 12) mob.stillT += dt;
      else mob.stillT = 0;
      moveBody(mob, dt);
      if (mob.inLava) hurt(mob, 4, -mob.face);
      continue;
    }
    if (mob.kind === "creeper" && close && Math.abs(dx) < 72 && Math.abs(mob.y - player.y) < 56) {
      mob.face = Math.sign(dx) || mob.face;
      mob.vx = 0;
      mob.fuse += dt;
      if (mob.fuse >= 1.35) {
        mob.dead = true;
        mob.deathT = 0;
        mob.exploded = true;
        explodeAt(Math.floor(mob.x / TILE), Math.floor((mob.y - 8) / TILE), 1.7);
        drops.push(makeDrop("gunpowder", mob.x, mob.y - 20));
        say("苦力怕爆炸了！");
        continue;
      }
    } else if (mob.kind === "skeleton") {
      steerSkeleton(mob, dt, dx, close);
    } else {
      if (mob.kind === "creeper") mob.fuse = Math.max(0, mob.fuse - dt * 1.8);
      if (close) {
        mob.face = Math.sign(dx) || mob.face;
        mob.vx = mob.face * mob.speed * (mob.inWater ? 0.55 : 1);
        if (mob.kind === "spider" && mob.grounded && Math.abs(dx) < 90 && Math.random() < 0.02) mob.vy = -520;
      } else {
        mob.vx *= 0.8;
      }
    }
    moveBody(mob, dt);
    if (mob.inLava) hurt(mob, 4, -mob.face);
    if (mob.kind !== "creeper" && mob.kind !== "skeleton" && !player.dead && Math.abs(mob.x - player.x) < mob.hw + player.hw + 4 && Math.abs(mob.y - player.y) < mob.hh) {
      hurt(player, mob.dmg, Math.sign(player.x - mob.x) || -1);
    }
  }
}

function steerSkeleton(mob, dt, dx, close) {
  if (mob.shootCd > 0) mob.shootCd -= dt;
  if (mob.hitT > 0) mob.drawT = 0;
  const linedUp = close && Math.abs(mob.y - player.y) < 80;
  if (!linedUp) {
    mob.drawT = 0;
    mob.vx *= 0.8;
    return;
  }
  mob.face = Math.sign(dx) || mob.face;
  const dist = Math.abs(dx);
  if (dist < 72) {
    mob.vx = -mob.face * mob.speed * (mob.inWater ? 0.55 : 1);
    mob.drawT = 0;
    return;
  }
  if (dist < 300 && mob.shootCd <= 0 && mob.hitT <= 0) {
    mob.vx = 0;
    mob.drawT = Math.min(1, mob.drawT + dt / 1.05);
    if (mob.drawT >= 1) {
      fireArrow(mob);
      mob.drawT = 0;
      mob.shootCd = 1.15;
    }
    return;
  }
  mob.vx = mob.face * mob.speed * (mob.inWater ? 0.4 : 0.75);
  mob.drawT = 0;
}

function fireArrow(from) {
  const tx = player.x - from.x;
  const ty = player.y - 24 - (from.y - 28);
  const dist = Math.hypot(tx, ty) || 1;
  const speed = 390;
  arrows.push({
    x: from.x + from.face * 20,
    y: from.y - 28,
    vx: (tx / dist) * speed,
    vy: (ty / dist) * speed - 36,
    life: 2.4,
    gone: false,
  });
}

function updateArrows(dt) {
  for (const shot of arrows) {
    if (shot.gone) continue;
    shot.life -= dt;
    shot.vy += (shot.pebble ? 420 : 260) * dt;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    if (shot.life <= 0 || solidAt(shot.x, shot.y)) {
      shot.gone = true;
      continue;
    }
    if (shot.friendly) {
      for (const mob of mobs) {
        if (mob.dead) continue;
        if (Math.abs(shot.x - mob.x) < 16 && Math.abs(shot.y - (mob.y - 18)) < 28) {
          const dmg = shot.pebble === "slimeball" ? 2 : shot.pebble ? 1 : 4;
          hurt(mob, dmg, Math.sign(shot.vx) || 1);
          if (shot.pebble === "slimeball") {
            mob.vx += Math.sign(shot.vx) * 220;
            mob.vy = -240;
          }
          shot.gone = true;
          break;
        }
      }
      continue;
    }
    if (!player.dead && Math.abs(shot.x - player.x) < 14 && Math.abs(shot.y - (player.y - 22)) < 28) {
      hurt(player, 2, Math.sign(shot.vx) || -1);
      shot.gone = true;
    }
  }
  arrows = arrows.filter((shot) => !shot.gone);
}

function hopperTake(drop) {
  const x = Math.floor(drop.x / TILE);
  const y = Math.floor(drop.y / TILE);
  for (const dy of [0, 1, -1]) {
    for (const dx of [0, 1, -1]) {
      if (world.tiles[y + dy]?.[x + dx] !== "hp") continue;
      let key = `${x + dx},${y + dy}`;
      if (!world.chests[key]) {
        const near = findTileNear((x + dx) * TILE + 24, (y + dy) * TILE + 24, ["C"]);
        key = near ? `${near.x},${near.y}` : key;
        if (!world.chests[key]) world.chests[key] = emptySlots(CHEST_SLOTS);
      }
      if (tryAddItem(world.chests[key], drop.id, drop.count, CHEST_SLOTS)) {
        drop.gone = true;
        checkChestWin();
        return true;
      }
    }
  }
  return false;
}

function updateDrops(dt) {
  const n = drops.length;
  for (let i = 0; i < n; i++) {
    const drop = drops[i];
    if (drop.gone) continue;
    drop.vy = Math.min(420, drop.vy + 1400 * dt);
    drop.y += drop.vy * dt;
    if (solidAt(drop.x, drop.y + 8)) {
      drop.y = Math.floor((drop.y + 8) / TILE) * TILE - 8;
      drop.vy = 0;
    }
    drop.bob += dt * 3;
    if (hopperTake(drop)) continue;
    if (player.dead || player.dropCd > 0 || Math.hypot(drop.x - player.x, drop.y - (player.y - 20)) >= 28) continue;
    if (addItem(drop.id, drop.count)) {
      drop.gone = true;
      say(`捡到 ${ITEM_LABELS[drop.id] ?? drop.id}`);
    } else if (messageT <= 0.2) {
      say(`背包满了，捡不了${ITEM_LABELS[drop.id] ?? drop.id}。`);
    }
  }
  if (drops.some((drop) => drop.gone)) drops = drops.filter((drop) => !drop.gone);
}

function updateClock(dt) {
  const wasNight = isNight();
  clock = (clock + dt * (24 / DAY_LENGTH)) % 24;
  if (!wasNight && isNight()) {
    say("天黑了。回房子里的床上睡觉。", 4);
    if (world && !world.nightSpawned) {
      world.nightSpawned = true;
      mobs.push(makeMob("zombie", 22, 10));
      mobs.push(makeMob("spider", 38, 10));
      mobs.push(makeMob("skeleton", 72, 10));
      mobs.push(makeMob("creeper", 98, 10));
    }
  }
}

function updateCrops(dt) {
  world.cropT = (world.cropT ?? 0) + dt;
  if (world.cropT < 1) return;
  world.cropT = 0;
  for (let y = 0; y < world.h; y++) {
    for (let x = 0; x < world.w; x++) {
      const spec = WHEAT_STAGE[world.tiles[y][x]];
      if (spec && Math.random() < 1 / spec.wait) setCell(world.tiles, x, y, spec.next);
      if (world.tiles[y][x] === "sa" && Math.random() < 1 / 16) {
        setCell(world.tiles, x, y, ".");
        tree(world.tiles, x, y + 1);
      }
    }
  }
}

function updateLit(dt) {
  for (const key of Object.keys(world.lit ?? {})) {
    world.lit[key] -= dt;
    if (world.lit[key] <= 0) delete world.lit[key];
  }
}

function updateBombs(dt) {
  for (const bomb of world.bombs ?? []) {
    bomb.t -= dt;
    if (bomb.t <= 0 && !bomb.done) {
      bomb.done = true;
      explodeAt(bomb.x, bomb.y, 2.4);
    }
  }
  world.bombs = (world.bombs ?? []).filter((bomb) => !bomb.done);
}

function updateTraps(dt) {
  world.trapCd = (world.trapCd ?? 0) - dt;
  if (world.trapCd > 0 || player.dead) return;
  for (let y = 0; y < world.h; y++) {
    for (let x = 0; x < world.w; x++) {
      if (world.tiles[y][x] !== "dp") continue;
      const px = x * TILE + 24;
      const py = y * TILE + 24;
      if (Math.abs(player.y - py) < 48 && Math.abs(player.x - px) < 260) {
        const dir = Math.sign(player.x - px) || -1;
        arrows.push({ x: px + dir * 18, y: py - 10, vx: dir * 360, vy: -12, life: 2, gone: false });
        world.trapCd = 2.4;
        return;
      }
    }
  }
}

function updatePortal(dt) {
  if ((world.portalCd ?? 0) > 0) world.portalCd -= dt;
  if (!world.portalLit || world.portalCd > 0 || player.dead) return;
  const x = Math.floor(player.x / TILE);
  const y = Math.floor((player.y - 8) / TILE);
  if (x >= 113 && x <= 115 && y <= world.ground && y >= world.ground - 4) {
    player.x = TILE * 4;
    player.y = TILE * world.ground;
    world.portalCd = 4;
    say("传送回了出生点。");
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.kind === "heart" ? -24 : 480 * dt;
  }
  particles = particles.filter((p) => p.life > 0);
}

function updateCamera() {
  const targetX = Math.round(player.x) - viewW * 0.38;
  const targetY = Math.round(player.y) - viewH * 0.68;
  let nextX = cam.x + (targetX - cam.x) * 0.14;
  let nextY = cam.y + (targetY - cam.y) * 0.12;
  if (Math.abs(targetX - nextX) < 1) nextX = targetX;
  if (Math.abs(targetY - nextY) < 1) nextY = targetY;
  const maxX = world.w * TILE - viewW;
  const maxY = world.h * TILE - viewH;
  cam.x = Math.round(Math.max(0, Math.min(maxX, nextX)));
  cam.y = Math.round(Math.max(0, Math.min(Math.max(0, maxY), nextY)));
}

function viewX(wx) {
  return Math.round(wx - cam.x);
}

function viewY(wy) {
  return Math.round(wy - cam.y);
}

function drawImage(rel, x, y, w, h) {
  const pic = img(rel);
  if (!pic) return;
  ctx.drawImage(pic, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawTile(rel, x, y) {
  const pic = img(rel);
  if (!pic) return;
  const dest = TILE + 1;
  ctx.drawImage(pic, BLOCK_SRC_PAD, BLOCK_SRC_PAD, BLOCK_SRC_FACE, BLOCK_SRC_FACE, Math.round(x), Math.round(y), dest, dest);
}

function drawAnchored(rel, spec, x, y, face) {
  const pic = img(rel);
  if (!pic) return;
  const dw = Math.round(spec.w * spec.scale);
  const dh = Math.round(spec.h * spec.scale);
  const ox = Math.round(spec.ax * spec.scale);
  const oy = Math.round(spec.ay * spec.scale);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(face, 1);
  ctx.drawImage(pic, -ox, -oy, dw, dh);
  ctx.restore();
}

function holdingSword() {
  return selectedItem()?.id === "diamond-sword" && selectedItem()?.count > 0;
}

function steveFrame() {
  if (player.anim === "idle") {
    if (holdingSword()) return "steve-sprites/swing-0.svg";
    return `steve-sprites/${player.frame === 0 ? "idle-a" : "idle-b"}.svg`;
  }
  if (player.anim === "run") return `steve-sprites/run-${player.frame}.svg`;
  if (player.anim === "jump") return `steve-sprites/${["jump-crouch", "jump-rise", "jump-apex", "jump-fall", "jump-land"][player.frame]}.svg`;
  if (player.anim === "swing") return `steve-sprites/swing-${player.frame}.svg`;
  if (player.anim === "hurt") return `steve-sprites/hurt-${player.frame}.svg`;
  if (player.anim === "sleep") return `steve-sprites/sleep-${player.frame}.svg`;
  if (player.anim === "eat") return `steve-sprites/eat-${player.frame}.svg`;
  return `steve-sprites/death-${player.frame}.svg`;
}

function deathFrames(kind) {
  return kind === "pig" || kind === "cow" ? 8 : 12;
}

function mobGone(mob) {
  const t = mob.deathT ?? 0;
  if (mob.kind === "creeper" && mob.exploded) return t > 0.28;
  return t > deathFrames(mob.kind) / 10 + 0.08;
}

function mobSprite(mob) {
  if (mob.dead) {
    if (mob.kind === "creeper" && mob.exploded) return "creeper-sprites/swell-18.svg";
    const n = deathFrames(mob.kind);
    return `${mob.sheet}/death-${Math.min(n - 1, Math.floor((mob.deathT ?? 0) * 10))}.svg`;
  }
  if (mob.kind === "creeper" && mob.fuse > 0.12) {
    const frame = Math.min(18, Math.floor((mob.fuse / 1.35) * 10) * 2);
    return `creeper-sprites/swell-${frame}.svg`;
  }
  if (mob.kind === "skeleton" && mob.drawT > 0) {
    return `skeleton-sprites/draw-${Math.min(11, Math.floor(mob.drawT * 12))}.svg`;
  }
  if (mob.hitT > 0) {
    const frame = Math.min(7, Math.floor((1 - mob.hitT / (8 / 12)) * 8));
    return `${mob.sheet}/hurt-${frame}.svg`;
  }
  if (mob.passive && Math.abs(mob.vx) < 14 && mob.hurtFlee <= 0) {
    const frame = Math.floor(mob.age * (mob.stillT > 4 ? 4 : 6)) % 8;
    return `${mob.sheet}/${mob.stillT > 4 ? "rest" : "idle"}-${frame}.svg`;
  }
  if (Math.abs(mob.vx) < 14 && (mob.fuse ?? 0) <= 0.12) {
    if (mob.kind === "skeleton") return "skeleton-sprites/draw-0.svg";
    return `${mob.sheet}/idle-${Math.floor(mob.age * 6) % 8}.svg`;
  }
  return `${mob.sheet}/walk-${(Math.floor(mob.age * 10) % 8) * 2}.svg`;
}

function drawSky() {
  const night = isNight();
  const dusk = clock >= 17 && clock < 19 ? (clock - 17) / 2 : clock >= 5 && clock < 7 ? 1 - (clock - 5) / 2 : night ? 1 : 0;
  const g = ctx.createLinearGradient(0, 0, 0, viewH);
  g.addColorStop(0, mixHex("#8ec5ff", "#0b1630", dusk));
  g.addColorStop(0.55, mixHex("#c7e4ff", "#1a2744", dusk));
  g.addColorStop(1, mixHex("#e7f4c8", "#1c2a18", dusk));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, viewW, viewH);
}

function mixHex(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const mix = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${mix.join(",")})`;
}

function drawWorld() {
  const x0 = Math.max(0, Math.floor(cam.x / TILE) - 1);
  const x1 = Math.min(world.w - 1, Math.ceil((cam.x + viewW) / TILE) + 1);
  const y0 = Math.max(0, Math.floor(cam.y / TILE) - 1);
  const y1 = Math.min(world.h - 1, Math.ceil((cam.y + viewH) / TILE) + 1);
  const lavaFrame = `lava-sprites/boil-${Math.floor(time * 8) % 8 * 4}.svg`;
  const waterFrame = `water-sprites/flow-${(Math.floor(time * 8) % 8) * 4}.svg`;

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const t = world.tiles[y][x];
      if (t === ".") continue;
      const dx = viewX(x * TILE);
      const dy = viewY(y * TILE);
      if (t === "v") drawTile(lavaFrame, dx, dy);
      else if (t === "w") drawTile(waterFrame, dx, dy);
      else if (t === "F" && (world.lit?.[`${x},${y}`] ?? 0) > 0) drawTile("blocks/furnace-on.svg", dx, dy);
      else if (BLOCKS[t]) {
        drawTile(BLOCKS[t], dx, dy);
        if (t === "ob" && world.portalLit) {
          ctx.globalAlpha = 0.28 + Math.sin(time * 6) * 0.1;
          ctx.fillStyle = "#b07cff";
          ctx.fillRect(dx, dy, TILE + 1, TILE + 1);
          ctx.globalAlpha = 1;
        }
      }
    }
  }
}

function drawDrops() {
  for (const drop of drops) {
    if (drop.gone) continue;
    const bob = Math.sin(drop.bob) * 4;
    drawImage(itemAsset(drop.id), viewX(drop.x - 14), viewY(drop.y - 14 + bob), 28, 28);
  }
}

function drawArrows() {
  for (const shot of arrows) {
    const rel =
      shot.pebble === "snowball"
        ? "items/snowball.svg"
        : shot.pebble === "slimeball"
          ? "items/slimeball.svg"
          : shot.pebble === "egg"
            ? "items/egg.svg"
            : "items/arrow.svg";
    const pic = img(rel);
    if (!pic) continue;
    ctx.save();
    ctx.translate(viewX(shot.x), viewY(shot.y));
    ctx.rotate(Math.atan2(shot.vy, shot.vx));
    ctx.drawImage(pic, -16, -5, 32, 10);
    ctx.restore();
  }
}

function drawMobs() {
  for (const mob of mobs) {
    if (mob.dead && mobGone(mob)) continue;
    const spec = { w: 512, h: mob.h, ax: 256, ay: mob.h - 16, scale: mob.scale };
    const flash = mob.hitT > 0 || (mob.kind === "creeper" && mob.fuse > 0.4 && Math.floor(time * 16) % 2 === 0);
    if (flash) ctx.globalAlpha = 0.55;
    drawAnchored(mobSprite(mob), spec, viewX(mob.x), viewY(mob.y), mob.face);
    ctx.globalAlpha = 1;
  }
}

function drawParticles() {
  for (const p of particles) {
    const alpha = Math.max(0, Math.min(1, p.life * 1.6));
    ctx.globalAlpha = alpha;
    if (p.kind === "heart") drawImage("hud/heart.svg", viewX(p.x - 6), viewY(p.y - 6), 12, 12);
    else {
      ctx.fillStyle = p.color ?? "#ccc";
      ctx.fillRect(viewX(p.x), viewY(p.y), 4, 4);
    }
    ctx.globalAlpha = 1;
  }
}

function drawPlayer() {
  if (player.invuln > 0 && Math.floor(time * 16) % 2 === 0 && !player.dead) ctx.globalAlpha = 0.45;
  const combat =
    player.anim === "swing" ||
    player.anim === "hurt" ||
    player.anim === "death" ||
    player.anim === "sleep" ||
    (player.anim === "idle" && holdingSword());
  drawAnchored(steveFrame(), combat ? STEVE.combat : STEVE.loco, viewX(player.x), viewY(player.y), player.face);
  ctx.globalAlpha = 1;
}

function drawHearts(x, y, value, full, half, empty, flash = false) {
  const on = flash && player.hurtT > 0;
  for (let i = 0; i < 10; i++) {
    const v = value - i * 2;
    const rel = v >= 2 ? (on ? "hud/heart-flash.svg" : full) : v === 1 ? half : empty;
    drawImage(rel, x + i * 18, y, 16, 16);
  }
}

function craftPanelBox() {
  const w = Math.min(560, viewW - 32);
  const h = Math.min(392, viewH - 120);
  return { x: (viewW - w) / 2, y: 48, w, h };
}

function drawCraftPanel() {
  const box = craftPanelBox();
  ctx.fillStyle = "rgba(8, 10, 16, 0.78)";
  ctx.fillRect(0, 0, viewW, viewH);
  ctx.fillStyle = "rgba(22, 18, 14, 0.96)";
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = "#c6a15b";
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x + 1.5, box.y + 1.5, box.w - 3, box.h - 3);

  ctx.textAlign = "left";
  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = "#ffe566";
  ctx.fillText("工作台", box.x + 18, box.y + 32);
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#ddd";
  ctx.fillText("点击配方合成  ·  1–6 快捷  ·  W/S 翻页  ·  Esc 关闭", box.x + 18, box.y + 54);

  const rows = visibleRecipes();
  const rowH = 48;
  const top = box.y + 70;
  rows.forEach((recipe, i) => {
    const y = top + i * rowH;
    const ready = canCraft(player.items, recipe);
    ctx.fillStyle = ready ? "rgba(70, 90, 48, 0.85)" : "rgba(28, 24, 20, 0.9)";
    ctx.fillRect(box.x + 12, y, box.w - 24, rowH - 6);
    let x = box.x + 20;
    for (const [id, n] of Object.entries(recipe.need)) {
      drawImage(itemAsset(id), x, y + 6, 28, 28);
      ctx.fillStyle = countOwnedSafe(id) >= n ? "#fff" : "#ff8a8a";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`×${n}`, x + 30, y + 36);
      x += 44;
    }
    ctx.fillStyle = "#ffe566";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("→", x + 4, y + 28);
    drawImage(itemAsset(recipe.id), x + 32, y + 6, 28, 28);
    ctx.fillStyle = "#fff";
    ctx.font = "13px sans-serif";
    ctx.fillText(`×${recipe.count}`, x + 62, y + 36);
    ctx.fillStyle = ready ? "#ffe566" : "#aaa";
    ctx.font = "16px sans-serif";
    ctx.fillText(`${i + 1}  ${ITEM_LABELS[recipe.id] ?? recipe.id}`, x + 96, y + 28);
  });
}

function countOwnedSafe(id) {
  return countOwned(player.items, id);
}

function drawItemSlot(it, x, y, size = 32) {
  ctx.fillStyle = "rgba(18, 16, 14, 0.95)";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#6b5a3a";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  if (it && it.count > 0) {
    drawImage(itemAsset(it.id), x + 2, y + 2, size - 4, size - 4);
    if (it.count > 1) {
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "#111";
      ctx.fillText(String(it.count), x + size - 2, y + size - 2);
      ctx.fillStyle = "#fff";
      ctx.fillText(String(it.count), x + size - 3, y + size - 3);
    }
  }
}

function chestPanelBox() {
  const w = Math.min(420, viewW - 32);
  const h = Math.min(320, viewH - 120);
  return { x: (viewW - w) / 2, y: 56, w, h };
}

function chestSlotAt(mx, my) {
  const box = chestPanelBox();
  const originX = box.x + 18;
  const chestY = box.y + 64;
  const barY = box.y + box.h - 58;
  const gap = 38;
  if (my >= chestY && my < chestY + 3 * gap) {
    const col = Math.floor((mx - originX) / gap);
    const row = Math.floor((my - chestY) / gap);
    if (col >= 0 && col < 9 && row >= 0 && row < 3) return { kind: "chest", index: row * 9 + col };
  }
  if (my >= barY && my < barY + 36) {
    const col = Math.floor((mx - originX) / gap);
    if (col >= 0 && col < 9) return { kind: "hotbar", index: col };
  }
  return null;
}

function clickChestSlot(hit) {
  if (!hit) return;
  if (hit.kind === "chest") {
    if (transferStack(chestItems, hit.index, player.items, 9)) say("取出了物品。");
    else if (chestItems[hit.index]?.count > 0) say("快捷栏满了。");
  } else {
    if (transferStack(player.items, hit.index, chestItems, CHEST_SLOTS)) {
      say("放进了箱子。");
      checkChestWin();
    } else if (player.items[hit.index]?.count > 0) say("箱子满了。");
  }
}

function drawChestPanel() {
  const box = chestPanelBox();
  ctx.fillStyle = "rgba(8, 10, 16, 0.78)";
  ctx.fillRect(0, 0, viewW, viewH);
  ctx.fillStyle = "rgba(22, 18, 14, 0.96)";
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = "#c6a15b";
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x + 1.5, box.y + 1.5, box.w - 3, box.h - 3);

  ctx.textAlign = "left";
  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = "#ffe566";
  ctx.fillText("箱子", box.x + 18, box.y + 32);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#ddd";
  ctx.fillText("点击箱子格子取出  ·  点击快捷栏存入  ·  Esc 关闭", box.x + 18, box.y + 52);

  const originX = box.x + 18;
  const chestY = box.y + 64;
  const gap = 38;
  for (let i = 0; i < CHEST_SLOTS; i++) {
    const col = i % 9;
    const row = Math.floor(i / 9);
    drawItemSlot(chestItems[i], originX + col * gap, chestY + row * gap, 34);
  }

  ctx.fillStyle = "#ffe566";
  ctx.font = "14px sans-serif";
  ctx.fillText("快捷栏", originX, box.y + box.h - 68);
  const barY = box.y + box.h - 58;
  for (let i = 0; i < 9; i++) {
    drawItemSlot(player.items[i], originX + i * gap, barY, 34);
  }
}

function craftRowAt(mx, my) {
  const box = craftPanelBox();
  const top = box.y + 70;
  const rowH = 48;
  if (mx < box.x + 12 || mx > box.x + box.w - 12) return -1;
  const i = Math.floor((my - top) / rowH);
  if (i < 0 || i >= visibleRecipes().length) return -1;
  return i;
}

function drawHud() {
  const barW = 364;
  const barX = (viewW - barW) / 2;
  const barY = viewH - 86;
  drawHearts(barX + 8, barY - 28, player.health, "hud/heart.svg", "hud/heart-half.svg", "hud/heart-empty.svg", true);
  drawHearts(barX + barW - 8 - 180, barY - 28, player.hunger, "hud/hunger-full.svg", "hud/hunger-half.svg", "hud/hunger-empty.svg");
  if (player.armor > 0) {
    drawHearts(barX + 8, barY - 48, player.armor, "hud/armor-full.svg", "hud/armor-half.svg", "hud/armor-empty.svg");
  }

  drawImage("hud/xp-bar.svg", barX, barY - 8, barW, 28);
  const progress = Math.min(1, chestDiamonds() / GOAL_DIAMONDS);
  ctx.fillStyle = "#7cf37c";
  ctx.fillRect(barX + 28, barY + 4, (barW - 56) * progress, 6);

  drawImage("hud/hotbar.svg", barX, barY + 10, barW, 72);
  const slot = 36;
  const origin = barX + 22;
  for (let i = 0; i < 9; i++) {
    const it = player.items[i];
    const sx = origin + i * 38;
    const sy = barY + 26;
    if (it && it.count > 0) drawImage(itemAsset(it.id), sx, sy, 28, 28);
    if (it && it.count > 1) {
      ctx.fillStyle = "#111";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(it.count), sx + 29, sy + 29);
      ctx.fillStyle = "#fff";
      ctx.fillText(String(it.count), sx + 28, sy + 28);
    }
  }
  drawImage("hud/selected-slot.svg", origin + player.selected * 38 - 8, barY + 18, slot + 8, slot + 8);

  const label = ITEM_LABELS[selectedItem()?.id] ?? "";
  if (label && selectedItem()?.count > 0) {
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(16,16,16,0.72)";
    const tw = ctx.measureText(label).width + 24;
    ctx.fillRect(viewW / 2 - tw / 2, barY - 58, tw, 26);
    ctx.fillStyle = "#ffe566";
    ctx.fillText(label, viewW / 2, barY - 40);
  }

  drawImage("hud/crosshair.svg", viewW / 2 - 10, viewH / 2 - 10, 20, 20);

  ctx.textAlign = "left";
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(`箱子钻石 ${chestDiamonds()} / ${GOAL_DIAMONDS}   ${hourLabel()}${player.powerT > 0 ? "   附魔" : ""}`, 16, 28);
  if (craftingOpen) drawCraftPanel();
  if (chestOpen) drawChestPanel();
  if (player.sleeping > 0) {
    ctx.fillStyle = `rgba(8,10,24,${1 - player.sleeping / 1.7})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }
  if (messageT > 0) {
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(viewW / 2 - 220, 40, 440, 32);
    ctx.fillStyle = "#fff";
    ctx.fillText(message, viewW / 2, 62);
  }
  if (player.dead || win) {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.textAlign = "center";
    ctx.fillStyle = win ? "#ffe566" : "#ff6b6b";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText(win ? "试玩通关" : "你死了", viewW / 2, viewH / 2 - 10);
    ctx.fillStyle = "#fff";
    ctx.font = "18px sans-serif";
    ctx.fillText("按 R 重新开始", viewW / 2, viewH / 2 + 28);
  }
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  viewW = Math.max(640, canvas.clientWidth);
  viewH = Math.max(360, canvas.clientHeight);
  canvas.width = Math.floor(viewW * dpr);
  canvas.height = Math.floor(viewH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

function frame(ts) {
  const dt = Math.min(0.033, Math.max(0, (ts - last) / 1000 || 0.016));
  last = ts;
  try {
    if (mode === "play") {
      time += dt;
      if (messageT > 0) messageT -= dt;
      updateDemo(dt);
      updateClock(dt);
      updatePlayer(dt);
      updateMobs(dt);
      updateArrows(dt);
      updateDrops(dt);
      updateCrops(dt);
      updateLit(dt);
      updateBombs(dt);
      updateTraps(dt);
      updatePortal(dt);
      updateParticles(dt);
      updateCamera();
    }
    drawSky();
    if (world) {
      drawWorld();
      drawDrops();
      drawArrows();
      drawMobs();
      drawParticles();
      drawPlayer();
      drawHud();
    }
  } catch (err) {
    console.error(err);
    message = "战斗时出错，已跳过这一帧。";
    messageT = 3;
  }
  requestAnimationFrame(frame);
}

const CODE_KEYS = {
  KeyA: "a",
  KeyD: "d",
  KeyW: "w",
  KeyJ: "j",
  KeyE: "e",
  KeyR: "r",
  Space: " ",
  ArrowLeft: "arrowleft",
  ArrowRight: "arrowright",
  ArrowUp: "arrowup",
  ArrowDown: "arrowdown",
  Escape: "escape",
  KeyQ: "q",
};

function bindKey(e) {
  if (CODE_KEYS[e.code]) return CODE_KEYS[e.code];
  const key = e.key.toLowerCase();
  if (key === "right") return "arrowright";
  if (key === "left") return "arrowleft";
  if (key === "down") return "arrowdown";
  if (key === "escape") return "escape";
  return key;
}

function handleCraftKey(key) {
  if (chestOpen && mode === "play") {
    if (key === "escape" || key === "q" || key === "e" || key === "j") {
      chestOpen = false;
      say("关上了箱子。");
      return true;
    }
    return ["w", "s", "arrowup", "arrowdown", "a", "d", "arrowleft", "arrowright", " "].includes(key);
  }
  if (!craftingOpen || mode !== "play") return false;
  if (key === "escape" || key === "q") {
    craftingOpen = false;
    say("关上了工作台。");
    return true;
  }
  if (key === "w" || key === "arrowup") {
    craftScroll -= 1;
    visibleRecipes();
    return true;
  }
  if (key === "s" || key === "arrowdown") {
    craftScroll += 1;
    visibleRecipes();
    return true;
  }
  if (key >= "1" && key <= "6") {
    doCraft(visibleRecipes()[Number(key) - 1]);
    return true;
  }
  return false;
}

function canvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * viewW,
    y: ((e.clientY - rect.top) / rect.height) * viewH,
  };
}

function pulse(t, a, b) {
  return t >= a && t < b;
}

function updateDemo(dt) {
  if (!demo) return;
  demo.t += dt;
  const t = demo.t;
  hold.right = t < 9;
  hold.left = false;
  hold.jump = pulse(t, 1.15, 1.35) || pulse(t, 3.1, 3.3) || pulse(t, 5.4, 5.6);
  if (pulse(t, 2.2, 2.28) || pulse(t, 4.4, 4.48) || pulse(t, 6.2, 6.28) || pulse(t, 7.1, 7.18)) {
    useSelected();
  }
  if (t > 12) {
    demo = null;
    hold.right = hold.jump = false;
    say("可以接着自己玩，或按 R 重来。", 4);
  }
}

function startGame(asDemo = false) {
  resetGame();
  mode = "play";
  overlay.hidden = true;
  document.getElementById("hud-layer").hidden = false;
  startBtn.blur();
  demoBtn.blur();
  canvas.focus();
  if (asDemo) {
    demo = { t: 0 };
    say("自动演示：向东走、跳跃、挥剑。", 3);
  }
}

window.addEventListener("keydown", (e) => {
  const key = bindKey(e);
  keys.add(key);
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) e.preventDefault();
  if (handleCraftKey(key)) {
    e.preventDefault();
    return;
  }
  if (e.code.startsWith("Digit")) {
    const n = Number(e.code.slice(5));
    if (n >= 1 && n <= 9 && player) player.selected = n - 1;
  } else if (key >= "1" && key <= "9" && player) {
    player.selected = Number(key) - 1;
  }
  if (key === "j" || key === "e") useSelected();
  if (key === "q" && mode === "play" && !craftingOpen && !chestOpen) throwSelected();
  if (key === "r" && mode === "play") resetGame();
});

window.addEventListener("keyup", (e) => {
  keys.delete(bindKey(e));
});

window.addEventListener("blur", () => keys.clear());

canvas.addEventListener("mousedown", (e) => {
  if (mode !== "play") return;
  if (e.button !== 0) return;
  if (craftingOpen) {
    const pos = canvasPos(e);
    const row = craftRowAt(pos.x, pos.y);
    if (row >= 0) doCraft(visibleRecipes()[row]);
    else {
      const box = craftPanelBox();
      if (pos.x < box.x || pos.x > box.x + box.w || pos.y < box.y || pos.y > box.y + box.h) {
        craftingOpen = false;
        say("关上了工作台。");
      }
    }
    return;
  }
  if (chestOpen) {
    const pos = canvasPos(e);
    const hit = chestSlotAt(pos.x, pos.y);
    if (hit) clickChestSlot(hit);
    else {
      const box = chestPanelBox();
      if (pos.x < box.x || pos.x > box.x + box.w || pos.y < box.y || pos.y > box.y + box.h) {
        chestOpen = false;
        say("关上了箱子。");
      }
    }
    return;
  }
  useSelected();
});

window.addEventListener("resize", resize);

for (const btn of document.querySelectorAll("#touch button")) {
  const press = (on) => {
    const dir = btn.dataset.dir;
    const act = btn.dataset.act;
    if (dir) hold[dir] = on;
    if (act === "jump") hold.jump = on;
    if (act === "use" && on) useSelected();
    if (act === "drop" && on) throwSelected();
  };
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    press(true);
  });
  btn.addEventListener("pointerup", () => press(false));
  btn.addEventListener("pointerleave", () => press(false));
}

startBtn.addEventListener("click", () => startGame(false));
demoBtn.addEventListener("click", () => startGame(true));

resize();
requestAnimationFrame(frame);

loadAll()
  .then(() => {
    loadStatus.textContent = "素材已就绪。";
    startBtn.disabled = false;
    demoBtn.disabled = false;
    const boot = new URLSearchParams(location.search);
    if (boot.has("autostart")) startGame(boot.get("autostart") === "demo");
  })
  .catch((err) => {
    loadStatus.textContent = err.message;
    startBtn.disabled = true;
    demoBtn.disabled = true;
  });

window.__GAME = {
  get time() {
    return time;
  },
  get player() {
    return player;
  },
  get mobs() {
    return mobs;
  },
  get message() {
    return message;
  },
};

startBtn.disabled = true;
demoBtn.disabled = true;
