import {
  ARMOR,
  CAMPFIRE_COOK,
  CHEST_SLOTS,
  COMPOST,
  FOOD,
  HOTBAR_SLOTS,
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
} from "./recipes.js";
import { LEVELS, overlayGoal } from "./levels.js";

const ROOT = "/repo-assets";
const TILE = 48;
// Catalog block SVGs are 512×512 with SINGLE.pad empty margin; the painted face is 400×400.
const BLOCK_SRC_PAD = 56;
const BLOCK_SRC_FACE = 400;
const GOAL_DIAMONDS = 5;
const OVERWORLD_INDEX = LEVELS.findIndex((lv) => lv.id === "overworld");
const GRAVITY = 2100;
const MOVE = 210;
const JUMP = 680;
const MAX_FALL = 980;
const DAY_LENGTH = 90;
const FEED = { pig: "carrot", cow: "wheat", chicken: "wheat-seeds", sheep: "wheat" };
const MOB_NAME = { pig: "猪", cow: "牛", chicken: "鸡", sheep: "羊", slime: "史莱姆" };
const CROP_STAGE = {
  0: { next: "1", wait: 9 },
  1: { next: "2", wait: 11 },
  p0: { next: "p1", wait: 9 },
  p1: { next: "p2", wait: 11 },
  c0: { next: "c1", wait: 10 },
  c1: { next: "c2", wait: 12 },
  r0: { next: "r1", wait: 9 },
  r1: { next: "r2", wait: 11 },
  w0: { next: "w1", wait: 10 },
  w1: { next: "w2", wait: 12 },
};
const PICKS = new Set(["wooden-pickaxe", "stone-pickaxe", "iron-pickaxe", "diamond-pickaxe"]);
const HOES = new Set(["wooden-hoe", "stone-hoe", "iron-hoe", "diamond-hoe"]);
const SHOVELS = new Set(["wooden-shovel", "stone-shovel", "iron-shovel", "diamond-shovel"]);
const AXES = new Set(["wooden-axe", "stone-axe", "iron-axe", "diamond-axe"]);
const SWORDS = { "wooden-sword": 2, "stone-sword": 3, "iron-sword": 3, "diamond-sword": 4 };
const PICK = "diamond-pickaxe";
const AIR_MAX = 12;
const XP_ORE = { x: 1, i: 5, io: 1, go: 2, co: 1, ro: 2, lo: 3, eo: 5, qo: 3, gl: 2 };
const XP_KILL = { zombie: 5, skeleton: 5, spider: 5, creeper: 5, enderman: 5, slime: 4, pig: 2, cow: 2, chicken: 1, sheep: 2 };
const MINEABLE = {
  s: { drop: "cobblestone", tool: PICK },
  c: { drop: "cobblestone", tool: PICK },
  x: { drop: "coal", tool: PICK, remain: "s" },
  i: { drop: "diamond", tool: PICK, remain: "s" },
  io: { drop: "iron-ore", tool: PICK, remain: "s" },
  go: { drop: "gold-ore", tool: PICK, remain: "s" },
  co: { drop: "copper-ore", tool: PICK, remain: "s" },
  ro: { drop: "redstone-dust", tool: PICK, remain: "s", count: 4 },
  lo: { drop: "lapis", tool: PICK, remain: "s", count: 4 },
  eo: { drop: "emerald", tool: PICK, remain: "s" },
  d: { drop: "dirt" },
  g: { drop: "dirt" },
  a: { drop: "sand" },
  gv: { drop: "gravel" },
  o: { drop: "oak-log" },
  bo: { drop: "birch-log" },
  so: { drop: "spruce-log" },
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
  gl: { drop: "glowstone-dust", tool: PICK, count: 4 },
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
  cb: { drop: "copper-block", tool: PICK },
  qo: { drop: "quartz", tool: PICK, remain: "nr" },
  sg: { drop: "sponge" },
  sa: { drop: "oak-sapling" },
  rm: { drop: "red-mushroom" },
  bm: { drop: "brown-mushroom" },
  vi: { drop: "vine" },
  lp: { drop: "lily-pad" },
  gs: { drop: "dirt" },
  gp: { drop: "dirt" },
  cf: { drop: "campfire" },
  ln: { drop: "lantern" },
  td: { drop: "oak-trapdoor" },
  to: { drop: "oak-trapdoor" },
  cp: { drop: "composter" },
  ba: { drop: "iron-bars" },
  F: { drop: "furnace", tool: PICK },
  T: { drop: "crafting-table" },
  C: { drop: "chest" },
  z: { drop: "bed" },
  Z: { drop: "bed" },
  h: { drop: "ladder" },
  ov: { drop: "observer", tool: PICK },
  sc: { drop: "sugar-cane" },
  p0: {},
  p1: {},
  p2: { drop: "potato", count: 2 },
  c0: { drop: "cocoa-beans" },
  c1: { drop: "cocoa-beans" },
  c2: { drop: "cocoa-beans", count: 3 },
  r0: { drop: "carrot" },
  r1: { drop: "carrot" },
  r2: { drop: "carrot", count: 2 },
  w0: { drop: "nether-wart" },
  w1: { drop: "nether-wart" },
  w2: { drop: "nether-wart", count: 2 },
  fi: {},
};

function mineSeconds(tile, itemId) {
  const spec = MINEABLE[tile];
  if (!spec) return 0;
  if (
    [
      "0",
      "1",
      "2",
      "p0",
      "p1",
      "p2",
      "c0",
      "c1",
      "c2",
      "r0",
      "r1",
      "r2",
      "w0",
      "w1",
      "w2",
      "sc",
      "t",
      "f",
      "P",
      "G",
      "fi",
      "lp",
      "vi",
      "sa",
      "rm",
      "bm",
      "ln",
    ].includes(tile)
  ) {
    return 0;
  }
  let hard = 0.5;
  if (spec.tool) hard = 1.55;
  if (["d", "a", "gv", "sn", "gp", "gs", "n", "g"].includes(tile)) hard = 0.45;
  if (["o", "bo", "so", "p", "bp", "sp", "ap", "dk", "bk"].includes(tile)) hard = 1.05;
  if (["L", "bl", "sl"].includes(tile)) hard = 0.28;
  if (["io", "lo"].includes(tile)) hard = 2.2;
  if (["i", "go", "eo", "ro"].includes(tile)) hard = 4.6;
  if (tile === "ob") hard = 9.4;
  if (["C", "T", "F", "z", "Z"].includes(tile)) hard = 0.7;
  if (spec.tool) {
    if (!canHarvest(itemId, tile)) return Infinity;
    hard *= pickSpeed(itemId);
  } else if (SHOVELS.has(itemId) && ["d", "a", "gv", "sn", "gp", "gs", "n", "g"].includes(tile)) hard *= 0.38;
  else if (AXES.has(itemId) && ["o", "bo", "so", "p", "bp", "sp", "ap", "dk", "bk"].includes(tile)) hard *= 0.38;
  else if (itemId === "shears" && ["L", "bl", "sl", "ww"].includes(tile)) hard *= 0.15;
  return Math.max(0.16, hard);
}

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
  "birch-log": "bo",
  "spruce-log": "so",
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
  "oak-door": "D",
  "grass-path": "gp",
  campfire: "cf",
  lantern: "ln",
  "oak-trapdoor": "td",
  composter: "cp",
  "copper-block": "cb",
  "iron-bars": "ba",
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
  bo: "blocks/birch-log.svg",
  so: "blocks/spruce-log.svg",
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
  H: "blocks/iron-ore.svg",
  R: "blocks/gold-ore.svg",
  S: "blocks/oak-sapling.svg",
  h: "blocks/ladder.svg",
  m: "blocks/mossy-cobblestone.svg",
  j: "blocks/glass.svg",
  I: "blocks/ice.svg",
  u: "blocks/pumpkin.svg",
  y: "blocks/hay.svg",
  e: "blocks/melon.svg",
  n: "blocks/farmland.svg",
  N: "blocks/tnt.svg",
  "*": "blocks/fire.svg",
  q: "blocks/clay.svg",
  z: "blocks/bed.svg",
  Z: "blocks/bed-head.svg",
  0: "blocks/wheat-0.svg",
  1: "blocks/wheat-3.svg",
  2: "blocks/wheat-7.svg",
  p0: "blocks/potato-0.svg",
  p1: "blocks/potato-3.svg",
  p2: "blocks/potato-7.svg",
  c0: "blocks/cocoa-0.svg",
  c1: "blocks/cocoa-1.svg",
  c2: "blocks/cocoa-2.svg",
  sc: "blocks/sugar-cane.svg",
  fi: "blocks/fire.svg",
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
  gp: "blocks/grass-path.svg",
  cf: "blocks/campfire.svg",
  ln: "blocks/lantern.svg",
  td: "blocks/oak-trapdoor.svg",
  to: "blocks/oak-trapdoor.svg",
  cp: "blocks/composter.svg",
  r0: "blocks/carrot-0.svg",
  r1: "blocks/carrot-3.svg",
  r2: "blocks/carrot-7.svg",
  w0: "blocks/nether-wart-0.svg",
  w1: "blocks/nether-wart-1.svg",
  w2: "blocks/nether-wart-2.svg",
  qo: "blocks/nether-quartz-ore.svg",
  cb: "blocks/copper-block.svg",
  ba: "blocks/iron-bars.svg",
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
  "p0",
  "p1",
  "p2",
  "c0",
  "c1",
  "c2",
  "sc",
  "fi",
  "r0",
  "r1",
  "r2",
  "w0",
  "w1",
  "w2",
  "ln",
  "cf",
  "to",
  "cp",
  "ba",
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
let dimension = "overworld";
const dimKeep = { overworld: null, nether: null, end: null };
let player;
let mobs = [];
let drops = [];
let arrows = [];
let particles = [];
let craftingOpen = false;
let chestOpen = false;
let packOpen = false;
let packPick = -1;
let chestItems = emptySlots(CHEST_SLOTS);
let enderItems = emptySlots(CHEST_SLOTS);
let furnace = emptyFurnace();
let brew = emptyFurnace();
let craftScroll = 0;
const CRAFT_VISIBLE = 6;
let cam = { x: 0, y: 0 };
let time = 0;
let clock = 8;
let message = "";
let messageT = 0;
let win = false;
let demo = null;
let levelIndex = 0;
let stats = { kills: 0, fish: 0, portal: false, slept: false };

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
  ...range(8, (i) => `chicken-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `chicken-sprites/idle-${i}.svg`),
  ...range(8, (i) => `chicken-sprites/rest-${i}.svg`),
  ...range(8, (i) => `chicken-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `chicken-sprites/death-${i}.svg`),
  ...range(8, (i) => `sheep-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `sheep-sprites/idle-${i}.svg`),
  ...range(8, (i) => `sheep-sprites/rest-${i}.svg`),
  ...range(8, (i) => `sheep-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `sheep-sprites/death-${i}.svg`),
  ...range(8, (i) => `slime-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `slime-sprites/idle-${i}.svg`),
  ...range(8, (i) => `slime-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `slime-sprites/death-${i}.svg`),
  ...Object.keys(ITEM_LABELS).map((id) => itemAsset(id)),
  "hud/heart.svg",
  "hud/heart-half.svg",
  "hud/heart-empty.svg",
  "hud/heart-flash.svg",
  "blocks/furnace-on.svg",
  "blocks/fire-1.svg",
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
  "hud/progress-bar.svg",
  "hud/crosshair.svg",
  "hud/bubble.svg",
  "hud/bubble-empty.svg",
  "hud/bubble-pop.svg",
  "items/bow-0.svg",
  "items/bow-1.svg",
  "items/bow-2.svg",
  ...range(10, (i) => `blocks/destroy-${i}.svg`),
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
  setCell(tiles, x, ground - 1, "so");
  setCell(tiles, x, ground - 2, "so");
  setCell(tiles, x, ground - 3, "so");
  setCell(tiles, x, ground - 4, "so");
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
  fillRow(tiles, ground - 3, 22, 25, "═");
  setCell(tiles, 22, ground - 3, "╪");
  setCell(tiles, 23, ground - 3, "╪");
  setCell(tiles, 26, ground - 3, "†");
  fillRow(tiles, ground - 2, 40, 44, "p");
  fillRow(tiles, ground - 4, 41, 43, "p");
  setCell(tiles, 43, ground - 5, "t");
  setCell(tiles, 14, ground, "h");
  setCell(tiles, 17, ground, "h");
  setCell(tiles, 32, ground, "h");
  setCell(tiles, 35, ground, "h");

  tree(tiles, 8, ground);
  tree(tiles, 48, ground);
  tree(tiles, 52, ground, "bo", "bl");

  fillRow(tiles, ground, 2, 5, "n");
  setCell(tiles, 1, ground, "n");
  setCell(tiles, 1, ground - 1, "r0");
  setCell(tiles, 6, ground - 1, "u");
  setCell(tiles, 9, ground - 1, "u");
  setCell(tiles, 13, ground, "I");
  setCell(tiles, 18, ground, "❄");
  setCell(tiles, 15, ground + 3, "q");
  setCell(tiles, 16, ground + 3, "sg");
  setCell(tiles, 47, ground - 1, "e");
  setCell(tiles, 49, ground - 1, "u");
  setCell(tiles, 61, ground - 1, "y");
  setCell(tiles, 61, ground - 2, "y");

  setCell(tiles, 2, ground - 1, "0");
  setCell(tiles, 3, ground - 1, "1");
  setCell(tiles, 4, ground - 1, "2");
  setCell(tiles, 5, ground - 1, "p0");
  setCell(tiles, 5, ground, "n");

  setCell(tiles, 18, ground, "a");
  setCell(tiles, 18, ground - 1, "sc");
  setCell(tiles, 18, ground - 2, "sc");
  setCell(tiles, 9, ground - 2, "c0");
  setCell(tiles, 9, ground - 3, "c1");

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
  setCell(tiles, 21, ground + 4, "H");
  setCell(tiles, 23, ground + 3, "H");
  setCell(tiles, 36, ground + 3, "i");
  setCell(tiles, 37, ground + 4, "R");
  setCell(tiles, 39, ground + 3, "R");
  setCell(tiles, 52, ground + 4, "H");
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
  setCell(tiles, 70, ground - 1, "⌊");
  setCell(tiles, 70, ground - 2, "⌈");
  setCell(tiles, 63, ground - 1, "F");
  setCell(tiles, 63, ground - 2, ")");
  setCell(tiles, 64, ground - 1, "T");
  setCell(tiles, 65, ground - 1, "bk");
  setCell(tiles, 68, ground - 1, "C");
  setCell(tiles, 68, ground - 2, "▽");
  setCell(tiles, 66, ground - 1, "z");
  setCell(tiles, 67, ground - 1, "Z");
  setCell(tiles, 69, ground - 1, "hp");
  setCell(tiles, 66, ground - 2, "t");
  setCell(tiles, 64, ground - 2, "[");
  setCell(tiles, 69, ground - 5, "t");
  setCell(tiles, 64, ground - 3, "ln");
  setCell(tiles, 59, ground - 1, "cf");
  setCell(tiles, 7, ground - 1, "cp");
  for (let x = 55; x <= 61; x++) setCell(tiles, x, ground, "gp");
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
  setCell(tiles, 72, ground - 1, "ba");
  setCell(tiles, 80, ground - 2, "td");

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
  setCell(tiles, 110, ground - 1, "w0");
  setCell(tiles, 111, ground - 1, "bm");
  setCell(tiles, 115, ground - 1, "w1");
  setCell(tiles, 117, ground - 1, "db");
  setCell(tiles, 109, ground - 1, "eb");
  setCell(tiles, 113, ground + 4, "qo");
  setCell(tiles, 116, ground + 5, "qo");
  setCell(tiles, 119, ground + 4, "cb");

  setCell(tiles, 0, ground, "B");
  setCell(tiles, W - 1, ground, "B");

  const chests = scanChests(tiles);
  fillChest(chests, 68, ground - 1, [
    ["potato", 6],
    ["egg", 2],
    ["sugar-cane", 6],
    ["cocoa-beans", 4],
    ["saddle", 1],
    ["music-disc", 1],
    ["leather", 4],
    ["fishing-rod", 1],
    ["wooden-hoe", 1],
    ["bone-meal", 4],
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
    ["flint", 3],
  ]);
  fillChest(chests, 121, ground - 1, [
    ["netherite-helmet", 1],
    ["netherite-chestplate", 1],
    ["netherite-leggings", 1],
    ["netherite-boots", 1],
    ["gold-ingot", 8],
    ["flint-and-steel", 1],
    ["netherite-scrap", 8],
    ["glowstone", 4],
    ["potion-heal", 2],
    ["nether-wart", 6],
    ["quartz", 4],
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
    portalBox: { x0: 113, x1: 115, y0: ground - 4, y1: ground },
    compost: {},
  };
}

function makeWorldShell(W, H, ground, cover = "g") {
  const tiles = Array.from({ length: H }, () => Array(W).fill("."));
  for (let x = 0; x < W; x++) {
    setCell(tiles, x, H - 1, "B");
    for (let y = ground + 1; y < H - 1; y++) {
      let t = "s";
      if (y <= ground + 2) t = "d";
      else if (y === ground + 5 && x % 7 === 2) t = "gv";
      setCell(tiles, x, y, t);
    }
    setCell(tiles, x, ground, typeof cover === "function" ? cover(x) : cover);
  }
  setCell(tiles, 0, ground, "B");
  setCell(tiles, W - 1, ground, "B");
  return tiles;
}

function finishWorld(tiles, extra = {}) {
  const ground = extra.ground ?? 10;
  const chests = extra.chests ?? scanChests(tiles);
  return {
    w: tiles[0].length,
    h: tiles.length,
    tiles,
    ground,
    nightSpawned: extra.nightSpawned ?? true,
    cropT: 0,
    chests,
    lit: {},
    bombs: [],
    portalLit: extra.portalLit ?? false,
    portalCd: 0,
    portalBox: extra.portalBox ?? null,
    compost: {},
  };
}

function hut(tiles, x, ground) {
  fillRow(tiles, ground, x, x + 6, "p");
  for (let y = ground - 3; y < ground; y++) {
    setCell(tiles, x, y, "p");
    setCell(tiles, x + 6, y, "p");
  }
  fillRow(tiles, ground - 4, x, x + 6, "p");
  setCell(tiles, x, ground - 1, "D");
  setCell(tiles, x, ground - 2, "U");
  setCell(tiles, x + 6, ground - 2, "j");
}

function buildFarmWorld() {
  const W = 48;
  const H = 20;
  const ground = 10;
  const tiles = makeWorldShell(W, H, ground);
  fillRow(tiles, ground, 2, 9, "n");
  setCell(tiles, 2, ground - 1, "0");
  setCell(tiles, 3, ground - 1, "1");
  setCell(tiles, 4, ground - 1, "2");
  setCell(tiles, 5, ground - 1, "2");
  setCell(tiles, 6, ground - 1, "2");
  setCell(tiles, 7, ground - 1, "1");
  setCell(tiles, 8, ground - 1, "p0");
  fillRow(tiles, ground, 12, 16, ".");
  fillRow(tiles, ground + 1, 12, 16, "w");
  fillRow(tiles, ground + 2, 12, 16, "w");
  fillRow(tiles, ground + 3, 12, 16, "s");
  setCell(tiles, 13, ground, "lp");
  setCell(tiles, 12, ground, "h");
  setCell(tiles, 16, ground, "h");
  tree(tiles, 18, ground);
  tree(tiles, 34, ground);
  hut(tiles, 22, ground);
  setCell(tiles, 23, ground - 1, "F");
  setCell(tiles, 24, ground - 1, "T");
  setCell(tiles, 25, ground - 1, "C");
  setCell(tiles, 26, ground - 1, "z");
  setCell(tiles, 27, ground - 1, "Z");
  setCell(tiles, 24, ground - 3, "t");
  setCell(tiles, 21, ground - 1, "cf");
  setCell(tiles, 20, ground - 1, "cp");
  const chests = scanChests(tiles);
  fillChest(chests, 25, ground - 1, [
    ["wheat-seeds", 8],
    ["bone-meal", 2],
  ]);
  return finishWorld(tiles, { ground, chests });
}

function buildHuntWorld() {
  const W = 56;
  const H = 20;
  const ground = 10;
  const tiles = makeWorldShell(W, H, ground);
  tree(tiles, 8, ground);
  tree(tiles, 16, ground);
  tree(tiles, 24, ground, "bo", "bl");
  tree(tiles, 32, ground);
  setCell(tiles, 11, ground - 1, "cf");
  setCell(tiles, 12, ground - 1, "cf");
  hut(tiles, 40, ground);
  setCell(tiles, 41, ground - 1, "F");
  setCell(tiles, 42, ground - 1, "T");
  setCell(tiles, 43, ground - 1, "C");
  setCell(tiles, 44, ground - 1, "z");
  setCell(tiles, 45, ground - 1, "Z");
  setCell(tiles, 42, ground - 3, "t");
  setCell(tiles, 6, ground - 1, "u");
  setCell(tiles, 28, ground - 1, "e");
  const chests = scanChests(tiles);
  fillChest(chests, 43, ground - 1, [
    ["coal", 6],
    ["wheat", 4],
  ]);
  return finishWorld(tiles, { ground, chests });
}

function buildFishWorld() {
  const W = 52;
  const H = 20;
  const ground = 10;
  const tiles = makeWorldShell(W, H, ground);
  fillRow(tiles, ground, 10, 22, ".");
  fillRow(tiles, ground + 1, 10, 22, "w");
  fillRow(tiles, ground + 2, 10, 22, "w");
  fillRow(tiles, ground + 3, 10, 22, "s");
  setCell(tiles, 11, ground, "lp");
  setCell(tiles, 16, ground, "lp");
  setCell(tiles, 20, ground, "lp");
  setCell(tiles, 10, ground, "h");
  setCell(tiles, 22, ground, "h");
  tree(tiles, 6, ground);
  tree(tiles, 26, ground);
  hut(tiles, 34, ground);
  setCell(tiles, 35, ground - 1, "F");
  setCell(tiles, 36, ground - 1, "T");
  setCell(tiles, 37, ground - 1, "C");
  setCell(tiles, 38, ground - 1, "z");
  setCell(tiles, 39, ground - 1, "Z");
  setCell(tiles, 36, ground - 3, "t");
  const chests = scanChests(tiles);
  fillChest(chests, 37, ground - 1, [
    ["string", 4],
    ["bread", 2],
  ]);
  return finishWorld(tiles, { ground, chests });
}

function buildMineWorld() {
  const W = 64;
  const H = 20;
  const ground = 10;
  const tiles = makeWorldShell(W, H, ground);
  hut(tiles, 4, ground);
  setCell(tiles, 5, ground - 1, "F");
  setCell(tiles, 6, ground - 1, "T");
  setCell(tiles, 7, ground - 1, "C");
  setCell(tiles, 8, ground - 1, "z");
  setCell(tiles, 9, ground - 1, "Z");
  setCell(tiles, 6, ground - 3, "t");
  tree(tiles, 14, ground);
  setCell(tiles, 20, ground, ".");
  setCell(tiles, 20, ground + 1, "h");
  setCell(tiles, 20, ground + 2, "h");
  setCell(tiles, 20, ground + 3, "h");
  fillRow(tiles, ground + 4, 18, 28, "p");
  setCell(tiles, 19, ground + 3, "t");
  setCell(tiles, 21, ground + 4, "x");
  setCell(tiles, 22, ground + 4, "io");
  setCell(tiles, 23, ground + 4, "io");
  setCell(tiles, 24, ground + 4, "x");
  setCell(tiles, 25, ground + 4, "io");
  setCell(tiles, 26, ground + 4, "co");
  setCell(tiles, 22, ground + 5, "io");
  setCell(tiles, 23, ground + 5, "io");
  setCell(tiles, 24, ground + 5, "x");
  setCell(tiles, 27, ground + 4, "C");
  setCell(tiles, 18, ground + 4, "t");
  setCell(tiles, 36, ground + 3, "io");
  setCell(tiles, 37, ground + 4, "io");
  setCell(tiles, 48, ground + 3, "x");
  const chests = scanChests(tiles);
  fillChest(chests, 7, ground - 1, [
    ["coal", 8],
    ["torch", 8],
  ]);
  fillChest(chests, 27, ground + 4, [
    ["coal", 6],
    ["iron-ore", 2],
  ]);
  return finishWorld(tiles, { ground, chests });
}

function buildNightWorld() {
  const W = 60;
  const H = 20;
  const ground = 10;
  const tiles = makeWorldShell(W, H, ground, "g");
  fillRow(tiles, ground, 16, 28, "sb");
  fillRow(tiles, ground - 1, 18, 26, "sb");
  fillRow(tiles, ground - 2, 18, 26, "sb");
  fillRow(tiles, ground - 3, 18, 26, "sb");
  setCell(tiles, 18, ground - 1, "D");
  setCell(tiles, 18, ground - 2, "U");
  setCell(tiles, 20, ground - 1, "C");
  setCell(tiles, 21, ground - 1, "z");
  setCell(tiles, 22, ground - 1, "Z");
  setCell(tiles, 24, ground - 1, "T");
  setCell(tiles, 23, ground - 3, "t");
  setCell(tiles, 27, ground - 1, "tn");
  tree(tiles, 8, ground);
  tree(tiles, 36, ground);
  spruceTree(tiles, 44, ground);
  fillRow(tiles, ground, 40, 48, "sn");
  const chests = scanChests(tiles);
  fillChest(chests, 20, ground - 1, [
    ["arrow", 12],
    ["bread", 2],
  ]);
  return finishWorld(tiles, { ground, chests });
}

function buildNetherWorld() {
  const W = 56;
  const H = 20;
  const ground = 10;
  const tiles = makeWorldShell(W, H, ground, (x) => (x % 5 === 0 ? "ss" : x % 7 === 2 ? "mg" : "nr"));
  fillRow(tiles, ground, 28, 36, "nk");
  for (let y = ground - 3; y < ground; y++) {
    setCell(tiles, 28, y, "nk");
    setCell(tiles, 36, y, "nk");
  }
  fillRow(tiles, ground - 4, 28, 36, "nk");
  setCell(tiles, 29, ground - 1, "F");
  setCell(tiles, 30, ground - 1, "T");
  setCell(tiles, 31, ground - 1, "C");
  setCell(tiles, 32, ground - 1, "et");
  setCell(tiles, 33, ground - 1, "gl");
  setCell(tiles, 30, ground - 3, "t");
  portal(tiles, 8, ground);
  setCell(tiles, 4, ground - 1, "w0");
  setCell(tiles, 5, ground - 1, "w1");
  setCell(tiles, 6, ground, "ss");
  setCell(tiles, 4, ground, "ss");
  setCell(tiles, 5, ground, "ss");
  setCell(tiles, 18, ground + 3, "qo");
  setCell(tiles, 19, ground + 4, "qo");
  setCell(tiles, 20, ground + 3, "qo");
  setCell(tiles, 21, ground + 5, "qo");
  setCell(tiles, 22, ground + 4, "qo");
  setCell(tiles, 40, ground + 3, "qo");
  setCell(tiles, 42, ground + 4, "qo");
  setCell(tiles, 16, ground, ".");
  setCell(tiles, 16, ground + 1, "h");
  setCell(tiles, 16, ground + 2, "h");
  setCell(tiles, 16, ground + 3, "h");
  fillRow(tiles, ground + 4, 16, 23, "nk");
  setCell(tiles, 17, ground + 4, "qo");
  setCell(tiles, 18, ground + 4, "t");
  fillRow(tiles, ground + 1, 48, 52, "v");
  setCell(tiles, 48, ground, ".");
  setCell(tiles, 49, ground, ".");
  const chests = scanChests(tiles);
  fillChest(chests, 31, ground - 1, [
    ["nether-wart", 4],
    ["coal", 6],
  ]);
  return finishWorld(tiles, {
    ground,
    chests,
    portalBox: { x0: 9, x1: 11, y0: ground - 4, y1: ground },
  });
}

const WORLD_BUILDERS = {
  farm: buildFarmWorld,
  hunt: buildHuntWorld,
  fish: buildFishWorld,
  mine: buildMineWorld,
  night: buildNightWorld,
  overworld: buildWorld,
  nether: buildNetherWorld,
};

function tileAt(px, py) {
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  if (y < 0 || y >= world.h || x < 0 || x >= world.w) return "B";
  return world.tiles[y][x];
}

function nearTile(body, ch) {
  return tileAt(body.x, body.y - 8) === ch || tileAt(body.x + 16, body.y - 8) === ch || tileAt(body.x - 16, body.y - 8) === ch;
}

function doorState(tx) {
  if (!world.doorOpen.has(tx)) world.doorOpen.set(tx, { open: false, t: 0 });
  return world.doorOpen.get(tx);
}

function doorClosedAt(tx) {
  return (world?.doorOpen.get(tx)?.t ?? 0) < 0.55;
}

function isOakDoor(ch) {
  return ch === "D" || ch === "U";
}

function isIronDoor(ch) {
  return ch === "⌊" || ch === "⌈";
}

function tileIsSolid(t, tx) {
  if (isOakDoor(t) || isIronDoor(t)) return doorClosedAt(tx);
  return SOLID.has(t);
}

function doorFrame(t) {
  const u = t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
  return Math.min(DOOR_SWING - 1, Math.max(0, Math.round(u * (DOOR_SWING - 1))));
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
    body.air = (body.air ?? AIR_MAX) - dt;
    if (body.air <= 0) {
      body.air = 0;
      body.drownT = (body.drownT ?? 0) + dt;
      if (body.drownT >= 0.7) {
        body.drownT = 0;
        hurt(body, 1, 0);
      }
    }
  } else {
    body.air = Math.min(AIR_MAX, (body.air ?? AIR_MAX) + dt * 4);
    body.drownT = 0;
  }
}

function moveBody(body, dt) {
  unstick(body);
  if (body.fly) {
    body.grounded = false;
    const home = body.homeY ?? TILE * 6;
    body.vy += (home - body.y) * 4 * dt;
    body.vy *= 0.9;
    const nx = body.x + body.vx * dt;
    if (rectHitsSolid(nx - body.hw, body.y - body.hh, body.hw * 2, body.hh)) body.vx *= -1;
    else body.x = nx;
    const ny = body.y + body.vy * dt;
    if (!rectHitsSolid(body.x - body.hw, ny - body.hh, body.hw * 2, body.hh)) body.y = ny;
    body.inWater = false;
    body.inLava = false;
    body.air = 12;
    body.drownT = 0;
    return;
  }
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
  body.onPath = tileAt(body.x, body.y + 2) === "gp";
  body.atCampfire = around.includes("cf");
  body.atComposter = around.includes("cp");
  if (body.inWater) swimBody(body, dt);
  else {
    body.air = AIR_MAX;
    body.drownT = 0;
  }
}

function makePlayer() {
  return {
    x: TILE * (currentLevel().spawn?.[0] ?? 3.5),
    y: TILE * (currentLevel().spawn?.[1] ?? 10),
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
    tridentCd: 0,
    eatT: 0,
    dead: false,
    air: AIR_MAX,
    drownT: 0,
    inWater: false,
    inLava: false,
    atBed: false,
    atTable: false,
    atFurnace: false,
    atEnchant: false,
    atJukebox: false,
    armor: 0,
    armorMat: null,
    selected: 0,
    lastHotbar: 0,
    sleeping: 0,
    hungerT: 0,
    regenT: 0,
    shootCd: 0,
    powerT: 0,
    xp: 0,
    level: 0,
    fishT: 0,
    fishNeed: 0,
    mining: null,
    smelt: null,
    bowDraw: false,
    bowT: 0,
    lastAir: AIR_MAX,
    popT: 0,
    mount: null,
    equipped: { head: "", chest: "", legs: "", feet: "" },
    bedSpawn: null,
    items: loadoutItems(currentLevel().items),
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
    chicken: { hp: 4, speed: 70, dmg: 0, hw: 10, hh: 22, scale: 0.14, sheet: "chicken-sprites", h: 480, passive: true },
    sheep: { hp: 8, speed: 52, dmg: 0, hw: 14, hh: 36, scale: 0.16, sheet: "sheep-sprites", h: 480, passive: true },
    slime: { hp: 6, speed: 48, dmg: 1, hw: 14, hh: 24, scale: 0.16, sheet: "slime-sprites", h: 480 },
  };
  return {
    kind,
    ...specs[kind],
    x: tx * TILE + TILE / 2,
    y: ty * TILE,
    homeY: ty * TILE,
    vx: 0,
    vy: 0,
    face: -1,
    grounded: false,
    health: specs[kind].hp,
    age: Math.random(),
    hitT: 0,
    deathT: 0,
    dead: false,
    air: AIR_MAX,
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
    breedCd: 0,
    baby: false,
    growT: 0,
  };
}

function makeDrop(id, x, y, count = 1, extra = null) {
  return { id, x, y, vy: -180, count, bob: Math.random() * Math.PI * 2, gone: false, dur: extra?.dur };
}

function currentLevel() {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, levelIndex))] ?? LEVELS[0];
}

function loadoutItems(list) {
  const slots = emptySlots(PLAYER_SLOTS);
  (list ?? []).forEach((it, i) => {
    if (i >= PLAYER_SLOTS) return;
    slots[i] = { id: it.id, count: it.count };
    if (TOOL_DUR[it.id]) slots[i].dur = TOOL_DUR[it.id];
  });
  return slots;
}

function emptyStats() {
  return { kills: 0, fish: 0, portal: false, slept: false };
}

function levelMobs() {
  const id = currentLevel().id;
  if (id === "farm") return [makeMob("pig", 10, 10), makeMob("chicken", 8, 10), makeMob("cow", 32, 10)];
  if (id === "hunt") {
    return [
      makeMob("pig", 10, 10),
      makeMob("pig", 14, 10),
      makeMob("cow", 20, 10),
      makeMob("cow", 26, 10),
      makeMob("chicken", 12, 10),
      makeMob("chicken", 18, 10),
      makeMob("sheep", 30, 10),
      makeMob("sheep", 34, 10),
    ];
  }
  if (id === "fish") return [makeMob("chicken", 8, 10), makeMob("pig", 28, 10), makeMob("cow", 44, 10)];
  if (id === "mine") return [makeMob("zombie", 22, 14), makeMob("spider", 26, 14), makeMob("zombie", 40, 10)];
  if (id === "night") {
    return [
      makeMob("zombie", 10, 10),
      makeMob("skeleton", 14, 10),
      makeMob("spider", 32, 10),
      makeMob("creeper", 38, 10),
      makeMob("zombie", 48, 10),
      makeMob("skeleton", 52, 10),
      makeMob("spider", 6, 10),
    ];
  }
  if (id === "nether") {
    return [
      makeMob("zombie", 18, 10),
      makeMob("skeleton", 22, 10),
      makeMob("enderman", 40, 10),
      makeMob("creeper", 34, 10),
    ];
  }
  return [
    makeMob("pig", 7, 10),
    makeMob("chicken", 4, 10),
    makeMob("chicken", 12, 10),
    makeMob("pig", 10, 10),
    makeMob("chicken", 12, 10),
    makeMob("chicken", 14, 10),
    makeMob("rabbit", 21, 10),
    makeMob("zombie", 18, 10),
    makeMob("skeleton", 27, 10),
    makeMob("slime", 31, 10),
    makeMob("creeper", 33, 10),
    makeMob("wolf", 40, 10),
    makeMob("spider", 43, 10),
    makeMob("sheep", 47, 10),
    makeMob("sheep", 49, 10),
    makeMob("cow", 51, 10),
    makeMob("cow", 54, 10),
    makeMob("enderman", 56, 10),
    makeMob("villager", 66, 10),
    makeMob("cat", 63, 10),
    makeMob("iron-golem", 67, 10),
    makeMob("witch", 58, 10),
    makeMob("bat", 45, 6),
    makeMob("squid", 16, 12),
    makeMob("zombie", 50, 10),
    makeMob("spider", 76, 10),
    makeMob("skeleton", 82, 10),
    makeMob("sheep", 85, 10),
    makeMob("sheep", 93, 10),
    makeMob("pig", 90, 10),
    makeMob("creeper", 107, 10),
    makeMob("enderman", 114, 10),
    makeMob("zombie", 120, 10),
    makeMob("slime", 15, 10),
    makeMob("slime", 34, 10),
  ];
}

function levelDrops() {
  if (currentLevel().id !== "overworld") return [];
  return [
    makeDrop("diamond", TILE * 13.5, TILE * 9),
    makeDrop("diamond", TILE * 24, TILE * 7.5),
    makeDrop("diamond", TILE * 42, TILE * 5.5),
    makeDrop("golden-apple", TILE * 21, TILE * 9),
    makeDrop("potion-heal", TILE * 39, TILE * 9),
    makeDrop("iron-chestplate", TILE * 67, TILE * 9),
    makeDrop("gold-helmet", TILE * 67.8, TILE * 9),
    makeDrop("chainmail-boots", TILE * 64.8, TILE * 9),
    makeDrop("leather-helmet", TILE * 66.2, TILE * 9),
    makeDrop("leather-boots", TILE * 65.4, TILE * 9),
    makeDrop("shears", TILE * 61.5, TILE * 9),
    makeDrop("flint-and-steel", TILE * 60.6, TILE * 9),
    makeDrop("shield", TILE * 59.8, TILE * 9),
    makeDrop("coal", TILE * 63.5, TILE * 9, 6),
    makeDrop("iron-ingot", TILE * 64.2, TILE * 9, 4),
    makeDrop("apple", TILE * 69, TILE * 9, 2),
    makeDrop("snowball", TILE * 86, TILE * 9, 6),
  ];
}

function resetGame() {
  startLevel(levelIndex);
}

function startLevel(index, asDemo = false) {
  levelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
  const level = currentLevel();
  const build = WORLD_BUILDERS[level.id] ?? buildWorld;
  world = build();
  player = makePlayer();
  mobs = levelMobs();
  drops = levelDrops();
  stats = emptyStats();
  particles = [];
  arrows = [];
  craftingOpen = false;
  chestOpen = false;
  packOpen = false;
  packPick = -1;
  const chestKeys = Object.keys(world.chests ?? {});
  chestItems = world.chests[chestKeys[0]] ?? emptySlots(CHEST_SLOTS);
  craftScroll = 0;
  cam = { x: 0, y: 0 };
  time = 0;
  clock = level.clock ?? 8;
  win = false;
  demo = asDemo ? { t: 0 } : null;
  hold.left = hold.right = hold.jump = hold.use = false;
  message = overlayGoal(level);
  messageT = 6;
}

function showMenu() {
  mode = "boot";
  demo = null;
  overlay.hidden = false;
  document.getElementById("hud-layer").hidden = true;
  fillLevelList();
}

function nextLevel() {
  if (levelIndex >= LEVELS.length - 1) {
    win = "campaign";
    say("全部关卡通关！按 R 回选关。", 8);
    return;
  }
  startLevel(levelIndex + 1);
}

function chestHas(id) {
  return Object.values(world?.chests ?? {}).reduce((n, slots) => n + countOwned(slots, id), 0);
}

function evalQuest(part = currentLevel().quest) {
  if (!part) return { n: 0, need: 1, ok: false, label: "" };
  if (part.type === "chest") {
    const n = part.any ? part.any.reduce((sum, id) => sum + chestHas(id), 0) : chestHas(part.item);
    return { n, need: part.count, ok: n >= part.count, label: part.label };
  }
  if (part.type === "kills") return { n: stats.kills, need: part.count, ok: stats.kills >= part.count, label: part.label };
  if (part.type === "fish") return { n: stats.fish, need: part.count, ok: stats.fish >= part.count, label: part.label };
  if (part.type === "portal") return { n: stats.portal ? 1 : 0, need: 1, ok: Boolean(stats.portal), label: part.label };
  if (part.type === "sleep") return { n: stats.slept ? 1 : 0, need: 1, ok: Boolean(stats.slept), label: part.label };
  if (part.type === "and") {
    const parts = part.parts.map((p) => evalQuest(p));
    return {
      n: parts.filter((p) => p.ok).length,
      need: parts.length,
      ok: parts.every((p) => p.ok),
      label: part.label,
      parts,
    };
  }
  return { n: 0, need: 1, ok: false, label: part.label ?? "" };
}

function questHud() {
  const part = evalQuest();
  if (part.parts) return part.parts.map((p) => `${p.label} ${p.n}/${p.need}`).join("  ·  ");
  return `${part.label} ${part.n}/${part.need}`;
}

function checkQuest() {
  if (!player || win || player.dead) return;
  if (!evalQuest().ok) return;
  const last = levelIndex >= LEVELS.length - 1;
  win = last ? "campaign" : "stage";
  closeMenus();
  say(last ? "全部关卡通关！按 R 回选关。" : `${currentLevel().title}完成！按 N 下一关，R 重玩本关。`, 8);
}

function fillLevelList() {
  const root = document.getElementById("level-list");
  if (!root) return;
  root.hidden = false;
  root.innerHTML = "";
  LEVELS.forEach((level, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "level-btn";
    btn.style.setProperty("--i", String(i));
    btn.innerHTML = `<strong>${level.subtitle} · ${level.title}</strong><span>${level.goal}</span>`;
    btn.addEventListener("click", () => startGame(false, i));
    root.appendChild(btn);
  });
}

function menusOpen() {
  return craftingOpen || chestOpen || packOpen;
}

function closeMenus(msg) {
  craftingOpen = false;
  chestOpen = false;
  packOpen = false;
  packPick = -1;
  if (msg) say(msg);
}

function togglePack() {
  if (!player || player.dead || win) return;
  if (packOpen) {
    closeMenus("关上了背包。");
    return;
  }
  craftingOpen = false;
  chestOpen = false;
  packOpen = true;
  packPick = -1;
  say("打开了背包。点击两格交换。", 3);
}

function selectedItem() {
  if (player.selected === OFFHAND_SLOT) return player.offhand;
  return player.items[player.selected];
}

function hasShield() {
  const main = player.selected === OFFHAND_SLOT ? null : player.items[player.selected];
  const off = player.offhand;
  return (main?.id === "shield" && main.count > 0) || (off?.id === "shield" && off.count > 0);
}

function swapOffhand() {
  if (!player || player.dead || win || uiOpen()) return;
  const i = player.selected === OFFHAND_SLOT ? (player.lastHotbar ?? 0) : player.selected;
  const hand = player.items[i] ?? { id: "", count: 0 };
  const off = player.offhand ?? { id: "", count: 0 };
  player.items[i] = { id: off.id, count: off.count };
  player.offhand = { id: hand.id, count: hand.count };
  if (ARMOR_GEAR[hand.id] || ARMOR_GEAR[off.id]) refreshArmor();
  say("切换了副手。");
}

function throwSelected() {
  if (!player || player.dead || win || menusOpen()) return;
  const item = selectedItem();
  if (!item || item.count <= 0) {
    say("这一格是空的。");
    return;
  }
  const toss = makeDrop(item.id, player.x + player.face * 42, player.y - 30, 1, item);
  toss.vy = -240;
  drops.push(toss);
  item.count -= 1;
  if (item.count <= 0) {
    item.id = "";
    delete item.dur;
  }
  player.dropCd = 0.55;
  say(`扔掉了${ITEM_LABELS[toss.id] ?? toss.id}`);
}

function addItem(id, count, extra = null) {
  return tryAddItem(player.items, id, count, PLAYER_SLOTS, extra);
}

function wearHeld(n = 1) {
  const it = selectedItem();
  if (!it || it.count <= 0 || !TOOL_DUR[it.id]) return false;
  if (it.dur == null) it.dur = TOOL_DUR[it.id];
  it.dur -= n;
  if (it.dur > 0) return false;
  const name = ITEM_LABELS[it.id] ?? it.id;
  it.count = 0;
  it.id = "";
  delete it.dur;
  player.mining = null;
  player.bowDraw = false;
  say(`${name}用坏了。`);
  return true;
}

function dropInventory() {
  if (!player) return;
  const ox = player.x;
  const oy = player.y - 18;
  player.items.forEach((it, i) => {
    if (!it || it.count <= 0) return;
    const drop = makeDrop(it.id, ox + ((i % 9) - 4) * 6, oy - Math.floor(i / 9) * 8, it.count, it);
    drop.vy = -120 - Math.random() * 80;
    drops.push(drop);
    it.id = "";
    it.count = 0;
    delete it.dur;
  });
  for (const slot of ["head", "chest", "legs", "feet"]) {
    const id = player.equipped[slot];
    if (!id) continue;
    drops.push(makeDrop(id, ox + (Math.random() - 0.5) * 24, oy));
    player.equipped[slot] = "";
  }
  refreshArmor();
}

function bedSpawnValid() {
  const spawn = player?.bedSpawn;
  if (!spawn || !world) return false;
  const tx = Math.floor(spawn.x / TILE);
  const ty = Math.floor(spawn.y / TILE);
  for (const dy of [-1, 0, 1, -2]) {
    for (const dx of [-1, 0, 1, 2, -2]) {
      const t = world.tiles[ty + dy]?.[tx + dx];
      if (t === "z" || t === "Z") return true;
    }
  }
  return false;
}

function respawnPlayer() {
  if (!player || !player.dead) return;
  const atBed = bedSpawnValid();
  const spawn = atBed ? player.bedSpawn : { x: TILE * (currentLevel().spawn?.[0] ?? 3.5), y: TILE * (currentLevel().spawn?.[1] ?? 10) };
  player.dead = false;
  player.health = 20;
  player.hunger = 18;
  player.air = AIR_MAX;
  player.lastAir = AIR_MAX;
  player.drownT = 0;
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.invuln = 3;
  player.hurtT = 0;
  player.knockT = 0;
  player.swingT = 0;
  player.eatT = 0;
  player.anim = "idle";
  player.frame = 0;
  player.age = 0;
  player.mining = null;
  player.bowDraw = false;
  player.bowT = 0;
  player.sleeping = 0;
  player.mount = null;
  player.dropCd = 0.8;
  closeMenus();
  say(atBed ? "你在床边醒来。掉落的东西还在。" : "你在出生点醒来。掉落的东西还在。", 4);
}

function refreshArmor() {
  const eq = player.equipped ?? {};
  player.armor = Math.min(
    20,
    Object.values(eq).reduce((sum, id) => sum + (ARMOR[id]?.value ?? 0), 0),
  );
}

function spillItem(id, count, x = player.x + player.face * 36, y = player.y - 28, extra = null) {
  drops.push(makeDrop(id, x, y, count, extra));
  say(`背包满了，${ITEM_LABELS[id] ?? id}掉在地上。`);
}

function diamonds() {
  return player.items.find((it) => it.id === "diamond")?.count ?? 0;
}

function say(text, secs = 2.4) {
  message = text;
  messageT = secs;
}

function xpNeed(level) {
  return 7 + level * 5;
}

function addXp(n) {
  if (!player || n <= 0) return;
  player.xp += n;
  let need = xpNeed(player.level);
  let leveled = 0;
  while (player.xp >= need) {
    player.xp -= need;
    player.level += 1;
    leveled += 1;
    need = xpNeed(player.level);
  }
  if (leveled) say(`升级了！现在是 ${player.level} 级。`, 3);
}

function isNight() {
  return clock >= 19 || clock < 6;
}

function hourLabel() {
  const h = Math.floor(clock) % 24;
  return `${String(h).padStart(2, "0")}:00`;
}

function hostilesNear(who, range) {
  return mobs.some((mob) => !mob.dead && !mob.passive && !mob.ally && Math.hypot(mob.x - who.x, mob.y - who.y) < range);
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

function uiOpen() {
  return craftingOpen || chestOpen || furnaceOpen || brewOpen;
}

function frontCell() {
  const fx = Math.floor((player.x + player.face * 28) / TILE);
  const px = Math.floor(player.x / TILE);
  const midY = Math.floor((player.y - 12) / TILE);
  const headY = Math.floor((player.y - 36) / TILE);
  const footY = Math.floor((player.y + 4) / TILE);
  return [
    { x: fx, y: midY },
    { x: fx, y: headY },
    { x: fx, y: footY },
    { x: px, y: midY },
    { x: px, y: footY },
  ];
}

function startToolSwing(kind) {
  if (player.swingT > 0) return;
  player.swingT = 10 / 12;
  player.swingKind = kind;
  player.age = 0;
}

function tryToggleDoor() {
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (isIronDoor(t)) {
      say("铁门要用拉杆、红石火把或红石信号才能开。");
      return true;
    }
    if (!isOakDoor(t)) continue;
    const st = doorState(cell.x);
    st.open = !st.open;
    say(st.open ? "打开了门。" : "关上了门。");
    return true;
  }
  return false;
}

const PISTON_STUCK = new Set([..."B$@▓DU⌊⌈⇨➤▷◉▽CTF{})N☼⊓▣⊞Ω", "☁"]);

function gadgetKey(x, y) {
  return `${x},${y}`;
}

function ensureGadgetMaps() {
  if (!world.deviceFace) world.deviceFace = new Map();
  if (!world.power) world.power = new Map();
  if (!world.gadgetCd) world.gadgetCd = new Map();
  if (!world.pistonOut) world.pistonOut = new Map();
  if (!world.leverOn) world.leverOn = new Set();
  if (!world.beaconLit) world.beaconLit = new Set();
}

function isPowered(tx, ty) {
  ensureGadgetMaps();
  if ((world.power.get(gadgetKey(tx, ty)) ?? 0) > 0) return true;
  if (world.leverOn.has(gadgetKey(tx, ty))) return true;
  if (world.tiles[ty]?.[tx] === "†") return true;
  return false;
}

function deviceFacing(tx, ty) {
  ensureGadgetMaps();
  return world.deviceFace.get(gadgetKey(tx, ty)) ?? 1;
}

function playerTouchesTile(tx, ty) {
  const x0 = tx * TILE;
  const y0 = ty * TILE;
  return player.x + 10 > x0 && player.x - 10 < x0 + TILE && player.y > y0 && player.y - 40 < y0 + TILE;
}

function fireDispenser(tx, ty) {
  const face = deviceFacing(tx, ty);
  arrows.push({
    x: tx * TILE + 24 + face * 26,
    y: ty * TILE + 24,
    vx: face * 320,
    vy: -8,
    life: 2.2,
    gone: false,
    from: "mob",
    dmg: 2,
  });
}

function extendPiston(tx, ty) {
  ensureGadgetMaps();
  const key = gadgetKey(tx, ty);
  if (world.pistonOut.get(key)) return;
  const face = deviceFacing(tx, ty);
  const nx = tx + face;
  const beyond = nx + face;
  const ch = world.tiles[ty]?.[nx];
  if (!ch || ch === ".") {
    setCell(world.tiles, nx, ty, "➤");
    world.pistonOut.set(key, true);
    return;
  }
  if (PISTON_STUCK.has(ch) || isOakDoor(ch) || isIronDoor(ch)) return;
  if (world.tiles[ty]?.[beyond] !== ".") return;
  setCell(world.tiles, beyond, ty, ch);
  setCell(world.tiles, nx, ty, "➤");
  world.pistonOut.set(key, true);
}

function retractPiston(tx, ty) {
  ensureGadgetMaps();
  const key = gadgetKey(tx, ty);
  if (!world.pistonOut.get(key)) return;
  const face = deviceFacing(tx, ty);
  const hx = tx + face;
  if (world.tiles[ty]?.[hx] === "➤") setCell(world.tiles, hx, ty, ".");
  world.pistonOut.delete(key);
}

function floodDust(tx, ty, ttl = 0.2) {
  const q = [[tx, ty]];
  const seen = new Set([gadgetKey(tx, ty)]);
  stampPower(tx, ty, ttl);
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      stampPower(nx, ny, ttl);
      const key = gadgetKey(nx, ny);
      const ch = world.tiles[ny]?.[nx];
      if ((ch === "※" || ch === "╪" || ch === "═") && !seen.has(key)) {
        seen.add(key);
        q.push([nx, ny]);
      }
    }
  }
}

function pulseFrom(tx, ty, msg) {
  ensureGadgetMaps();
  const key = gadgetKey(tx, ty);
  if ((world.gadgetCd.get(key) ?? 0) > 0) return false;
  world.gadgetCd.set(key, 0.8);
  floodDust(tx, ty, 0.45);
  const t = world.tiles[ty]?.[tx];
  if (t === "▷") fireDispenser(tx, ty);
  if (t === "⇨") extendPiston(tx, ty);
  if (msg) say(msg);
  return true;
}

function tryGadget() {
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (t === "⌐") {
      ensureGadgetMaps();
      const key = gadgetKey(cell.x, cell.y);
      if (world.leverOn.has(key)) {
        world.leverOn.delete(key);
        say("拉下了拉杆。");
      } else {
        world.leverOn.add(key);
        say("推上了拉杆。");
      }
      return true;
    }
    if (t === "◉") {
      pulseFrom(cell.x, cell.y, "观察者发出了信号。");
      return true;
    }
    if (t === "⇨") {
      pulseFrom(cell.x, cell.y, "活塞动了一下。");
      return true;
    }
    if (t === "▷") {
      pulseFrom(cell.x, cell.y, "发射器射出一支箭。");
      return true;
    }
  }
  return false;
}

function soakSponge(sx, sy) {
  let n = 0;
  for (let y = sy - 2; y <= sy + 2; y++) {
    for (let x = sx - 2; x <= sx + 2; x++) {
      if (world.tiles[y]?.[x] === "w") {
        setCell(world.tiles, x, y, ".");
        n += 1;
      }
    }
  }
  if (n) say("海绵吸干了附近的水。");
}

function suckHopper(tx, ty) {
  const cx = tx * TILE + 24;
  const cy = ty * TILE + 24;
  for (const drop of drops) {
    if (drop.gone) continue;
    if (Math.hypot(drop.x - cx, drop.y - cy) > 44) continue;
    if (tryAddItem(chestItems, drop.id, drop.count, CHEST_SLOTS)) drop.gone = true;
  }
}

function tickMap(map, dt) {
  for (const [key, t] of [...map]) {
    const next = t - dt;
    if (next <= 0) map.delete(key);
    else map.set(key, next);
  }
}

function ironDoorPowered(tx) {
  for (let y = 0; y < world.h; y++) {
    const t = world.tiles[y]?.[tx];
    if (!isIronDoor(t)) continue;
    if (isPowered(tx, y) || isPowered(tx - 1, y) || isPowered(tx + 1, y) || isPowered(tx, y - 1) || isPowered(tx, y + 1)) return true;
  }
  return false;
}

function stampPower(tx, ty, ttl = 0.2) {
  ensureGadgetMaps();
  const key = gadgetKey(tx, ty);
  world.power.set(key, Math.max(world.power.get(key) ?? 0, ttl));
}

function conductRedstone() {
  ensureGadgetMaps();
  for (let y = 0; y < world.h; y++) {
    for (let x = 0; x < world.w; x++) {
      const t = world.tiles[y][x];
      if (t === "†" || (t === "⌐" && world.leverOn.has(gadgetKey(x, y)))) floodDust(x, y, 0.2);
    }
  }
}

function updateGadgets(dt) {
  if (!world) return;
  ensureGadgetMaps();
  tickMap(world.gadgetCd, dt);
  tickMap(world.power, dt);
  conductRedstone();
  const doorXs = new Set();
  for (let y = 0; y < world.h; y++) {
    for (let x = 0; x < world.w; x++) {
      const t = world.tiles[y][x];
      const powered = isPowered(x, y) || isPowered(x - 1, y) || isPowered(x + 1, y) || isPowered(x, y - 1) || isPowered(x, y + 1);
      if (t === "⇨") {
        if (powered) extendPiston(x, y);
        else if (world.pistonOut.get(gadgetKey(x, y))) retractPiston(x, y);
      }
      if (t === "▷" && powered) pulseFrom(x, y);
      if (t === "◉" && playerTouchesTile(x + deviceFacing(x, y), y)) pulseFrom(x, y);
      if (t === "▽") suckHopper(x, y);
      if (isIronDoor(t)) doorXs.add(x);
    }
  }
  for (const tx of doorXs) doorState(tx).open = ironDoorPowered(tx);
}

function tryHive() {
  const item = selectedItem();
  for (const cell of frontCell()) {
    if (world.tiles[cell.y]?.[cell.x] !== "⏣") continue;
    if (item?.id === "shears" && item.count > 0) {
      if (!addItem("honeycomb", 3)) spillItem("honeycomb", 3);
      say("从蜂箱剪下了蜜脾。");
      burstBits(cell.x * TILE + 24, cell.y * TILE + 8, "#f2c94c");
      return true;
    }
    if (item?.id === "glass-bottle" && item.count > 0) {
      item.count -= 1;
      if (!addItem("honey-bottle", 1)) spillItem("honey-bottle", 1);
      say("从蜂箱装满了蜂蜜瓶。");
      return true;
    }
    say("拿剪刀剪蜜脾，或拿玻璃瓶装蜂蜜。");
    return true;
  }
  return false;
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
  packOpen = false;
  packPick = -1;
  craftingOpen = !craftingOpen;
  craftScroll = 0;
  say(craftingOpen ? "打开了工作台。点击配方合成。" : "关上了工作台。", 3);
  return true;
}

function tryOpenChest() {
  if (player.atEnder) {
    craftingOpen = false;
    furnaceOpen = false;
    brewOpen = false;
    if (chestOpen && chestKind === "ender") {
      chestOpen = false;
      say("关上了末影箱。", 3);
    } else {
      chestOpen = true;
      chestKind = "ender";
      say("打开了末影箱。格子在所有世界共用。", 3);
    }
    return true;
  }
  if (!player.atChest) return false;
  craftingOpen = false;
  packOpen = false;
  packPick = -1;
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

function tryOpenFurnace() {
  if (!player.atFurnace) return false;
  craftingOpen = false;
  chestOpen = false;
  brewOpen = false;
  furnaceOpen = !furnaceOpen;
  say(furnaceOpen ? "打开了熔炉。上面放矿或生肉，下面放煤炭。" : "关上了熔炉。", 3);
  return true;
}

function tryOpenBrew() {
  if (!player.atBrew) return false;
  craftingOpen = false;
  chestOpen = false;
  furnaceOpen = false;
  brewOpen = !brewOpen;
  say(brewOpen ? "打开了酿造台。上面放玻璃瓶，下面放烈焰粉、下界疣或恶魂之泪。" : "关上了酿造台。", 3);
  return true;
}

function tryEnchant() {
  if (!player.atEnchant) return false;
  if ((player.sharpness ?? 0) >= 3) {
    say("锋利已经满级了。");
    return true;
  }
  if ((player.level ?? 0) < 3) {
    say("需要 3 级经验才能附魔。");
    return true;
  }
  player.level -= 3;
  player.sharpness = (player.sharpness ?? 0) + 1;
  say(`附魔了锋利 ${player.sharpness}。挥剑更痛。`);
  return true;
}

function tryAnvil() {
  if (!player.atAnvil) return false;
  if ((player.sharpness ?? 0) >= 5) {
    say("铁砧已经不能再强化了。");
    return true;
  }
  if ((player.level ?? 0) < 2) {
    say("铁砧强化需要 2 级经验。");
    return true;
  }
  player.level -= 2;
  player.sharpness = (player.sharpness ?? 0) + 1;
  say(`铁砧强化了装备。锋利 ${player.sharpness}。`);
  return true;
}

function trySmith() {
  if (!player.atSmith) return false;
  const item = selectedItem();
  const next = SMITH_UP[item?.id];
  if (!next || item.count <= 0) {
    say("锻造台要把钻石装备拿在手里，并准备下界合金锭。");
    return true;
  }
  const barHas = countOwned(player.items, "netherite-ingot") > 0;
  const offHas = player.offhand?.id === "netherite-ingot" && player.offhand.count > 0;
  if (!barHas && !offHas) {
    say("需要下界合金锭。");
    return true;
  }
  if (barHas) takeNeed(player.items, { "netherite-ingot": 1 });
  else player.offhand.count -= 1;
  item.id = next;
  say(`锻造成了${ITEM_LABELS[next] ?? next}。`);
  refreshArmor();
  return true;
}

function mineralBelow(tx, ty) {
  const b = world.tiles[ty + 1]?.[tx];
  return b === "★" || b === "◆" || b === "❖" || b === "(";
}

function tryBeacon() {
  if (!player.atBeacon) return false;
  ensureGadgetMaps();
  for (const cell of frontCell()) {
    if (world.tiles[cell.y]?.[cell.x] !== "☼") continue;
    const key = gadgetKey(cell.x, cell.y);
    if (world.beaconLit.has(key)) {
      say("信标已经亮着。站在附近会回血、跑得更快。");
      return true;
    }
    if (!mineralBelow(cell.x, cell.y)) {
      say("信标要放在铁块、金块、钻石块或绿宝石块上。");
      return true;
    }
    const star = selectedItem();
    if (star?.id !== "nether-star" || star.count <= 0) {
      say("激活信标需要下界之星。");
      return true;
    }
    star.count -= 1;
    world.beaconLit.add(key);
    say("信标亮起来了！");
    burstBits(cell.x * TILE + 24, cell.y * TILE, "#9ee7ff");
    return true;
  }
  return false;
}

function tryTrade() {
  const item = selectedItem();
  if (!item || item.count <= 0) return false;
  for (const mob of mobs) {
    if (mob.dead || mob.kind !== "villager") continue;
    if (Math.hypot(mob.x - player.x, mob.y - player.y) > 52) continue;
    if (item.id === "emerald") {
      item.count -= 1;
      if (!addItem("bread", 4)) spillItem("bread", 4);
      say("村民用面包换了你的绿宝石。");
      return true;
    }
    if (item.id === "wheat" && item.count >= 8) {
      item.count -= 8;
      if (!addItem("emerald", 1)) spillItem("emerald", 1);
      say("村民收购了小麦，给了你一颗绿宝石。");
      return true;
    }
    say("村民要绿宝石换面包，或 8 个小麦换绿宝石。");
    return true;
  }
  return false;
}

function tryFirework() {
  const item = selectedItem();
  if (item?.id !== "firework" || item.count <= 0) return false;
  item.count -= 1;
  burstBits(player.x, player.y - 24, "#ff6b6b");
  burstBits(player.x + 8, player.y - 36, "#ffe566");
  burstBits(player.x - 8, player.y - 30, "#6bcbff");
  if (hasElytra() && !player.grounded && !player.mount) {
    player.vy = -520;
    player.vx += player.face * 280;
    say("烟花推进了鞘翅。");
  } else say("放了一朵烟花。");
  return true;
}

function chorusTeleport() {
  for (let i = 0; i < 12; i++) {
    const nx = player.x + (Math.random() * 8 - 4) * TILE;
    const ny = player.y - Math.random() * 3 * TILE;
    if (!rectHitsSolid(nx - player.hw, ny - player.hh, player.hw * 2, player.hh)) {
      player.x = nx;
      player.y = ny;
      burstBits(nx, ny - 20, "#c57be8");
      return true;
    }
  }
  return false;
}

function tryEatCake() {
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (t !== "[") continue;
    if (player.health >= 20 && player.hunger >= 20) {
      say("已经吃饱了。");
      return true;
    }
    const key = `${cell.x},${cell.y}`;
    if (!world.cakeBites) world.cakeBites = new Map();
    const bites = (world.cakeBites.get(key) ?? 0) + 1;
    player.health = Math.min(20, player.health + 1);
    player.hunger = Math.min(20, player.hunger + 2);
    player.eatT = 8 / 10;
    player.anim = "eat";
    player.frame = 0;
    if (bites >= 7) {
      world.cakeBites.delete(key);
      setCell(world.tiles, cell.x, cell.y, ".");
      say("把蛋糕吃完了。");
    } else {
      world.cakeBites.set(key, bites);
      say(`吃了一口蛋糕。还剩 ${7 - bites} 口。`);
    }
    return true;
  }
  return false;
}

function tryBuildGolem(tx, ty) {
  const at = (x, y) => world.tiles[y]?.[x];
  const clear = (x, y) => setCell(world.tiles, x, y, ".");
  const below = at(tx, ty + 1);
  const below2 = at(tx, ty + 2);
  if (below === "~" && below2 === "~") {
    clear(tx, ty);
    clear(tx, ty + 1);
    clear(tx, ty + 2);
    mobs.push(makeMob("snow-golem", tx, ty + 2));
    say("堆出了雪傀儡。");
    return true;
  }
  if (below === "(" && below2 === "(" && at(tx - 1, ty + 1) === "(" && at(tx + 1, ty + 1) === "(") {
    clear(tx, ty);
    clear(tx, ty + 1);
    clear(tx, ty + 2);
    clear(tx - 1, ty + 1);
    clear(tx + 1, ty + 1);
    mobs.push(makeMob("iron-golem", tx, ty + 2));
    say("堆出了铁傀儡。");
    return true;
  }
  return false;
}

function tryBuildWither(tx, ty) {
  const at = (x, y) => world.tiles[y]?.[x];
  const clear = (x, y) => setCell(world.tiles, x, y, ".");
  const skull = (x, y) => at(x, y) === "☠";
  const sand = (x, y) => at(x, y) === "^";
  for (const cx of [tx - 1, tx, tx + 1]) {
    if (!skull(cx - 1, ty) || !skull(cx, ty) || !skull(cx + 1, ty)) continue;
    if (!sand(cx - 1, ty + 1) || !sand(cx, ty + 1) || !sand(cx + 1, ty + 1)) continue;
    if (!sand(cx, ty + 2)) continue;
    clear(cx - 1, ty);
    clear(cx, ty);
    clear(cx + 1, ty);
    clear(cx - 1, ty + 1);
    clear(cx, ty + 1);
    clear(cx + 1, ty + 1);
    clear(cx, ty + 2);
    mobs.push(makeMob("wither", cx, ty + 2));
    say("凋灵苏醒了！");
    return true;
  }
  return false;
}

function chestDiamonds() {
  return Object.values(world?.chests ?? {}).reduce((n, slots) => n + countOwned(slots, "diamond"), 0);
}

function checkChestWin() {
  checkQuest();
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
  const hit = findTileNear(player.x, player.y - 8, ["z", "Z"]);
  player.bedSpawn = hit
    ? { x: hit.x * TILE + TILE / 2, y: (hit.y + 1) * TILE }
    : { x: player.x, y: player.y };
  if (!isNight()) {
    say("重生点已设在床边。白天睡不着。");
    return true;
  }
  if (hostilesNear(player, 220)) {
    say("附近有怪物，睡不着。重生点还是记下了。");
    return true;
  }
  player.sleeping = 1.7;
  player.vx = 0;
  stats.slept = true;
  say("你躺下休息了。以后会死在床边醒来。");
  checkQuest();
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
    if (tryBreed(mob)) return true;
    say(`喂了${MOB_NAME[mob.kind] ?? mob.kind}。它跟着你。`);
    return true;
  }
  return false;
}

function nearWater(tx, ty) {
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, 1],
  ]) {
    if (world.tiles[ty + dy]?.[tx + dx] === "w") return true;
  }
  return false;
}

function isLog(t) {
  return t === "o" || t === "bo" || t === "so" || t === "dk";
}

function tryFarm() {
  const item = selectedItem();
  const tx = Math.floor((player.x + player.face * 22) / TILE);
  const groundY = Math.floor((player.y + 4) / TILE);
  const cropY = groundY - 1;
  const soil = world.tiles[groundY]?.[tx];
  const above = world.tiles[cropY]?.[tx];
  const empty = above === "." || above === "G" || above === "f" || above === "P";
  if (item?.id === "wheat-seeds" && item.count > 0 && soil === "n" && empty) {
    setCell(world.tiles, tx, cropY, "0");
    item.count -= 1;
    say("种下了小麦。");
    return true;
  }
  if (item?.id === "potato" && item.count > 0 && soil === "n" && empty) {
    setCell(world.tiles, tx, cropY, "p0");
    item.count -= 1;
    say("种下了马铃薯。");
    return true;
  }
  if (item?.id === "carrot" && item.count > 0 && soil === "n" && empty) {
    setCell(world.tiles, tx, cropY, "r0");
    item.count -= 1;
    say("种下了胡萝卜。");
    return true;
  }
  if (item?.id === "nether-wart" && item.count > 0 && soil === "ss" && empty) {
    setCell(world.tiles, tx, cropY, "w0");
    item.count -= 1;
    say("种下了地狱疣。");
    return true;
  }
  if (item?.id === "sugar-cane" && item.count > 0 && empty && (soil === "a" || soil === "d" || soil === "g" || soil === "n") && nearWater(tx, groundY)) {
    setCell(world.tiles, tx, cropY, "sc");
    item.count -= 1;
    say("种下了甘蔗。");
    return true;
  }
  if (item?.id === "cocoa-beans" && item.count > 0) {
    for (const cell of frontCell()) {
      const t = world.tiles[cell.y]?.[cell.x];
      if (t !== "." && t !== "G") continue;
      const beside = world.tiles[cell.y]?.[cell.x + player.face] ?? world.tiles[cell.y]?.[cell.x - player.face];
      const left = world.tiles[cell.y]?.[cell.x - 1];
      const right = world.tiles[cell.y]?.[cell.x + 1];
      if (!isLog(left) && !isLog(right) && !isLog(beside)) continue;
      setCell(world.tiles, cell.x, cell.y, "c0");
      item.count -= 1;
      say("种下了可可豆。");
      return true;
    }
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
  if (above === "p2") {
    setCell(world.tiles, tx, cropY, ".");
    const n = 1 + Math.floor(Math.random() * 3);
    if (!addItem("potato", n)) spillItem("potato", n);
    burstBits(tx * TILE + 24, cropY * TILE + 24, "#d4b46a");
    say("收割了马铃薯。");
    return true;
  }
  if (above === "c2") {
    setCell(world.tiles, tx, cropY, ".");
    const n = 2 + Math.floor(Math.random() * 2);
    if (!addItem("cocoa-beans", n)) spillItem("cocoa-beans", n);
    burstBits(tx * TILE + 24, cropY * TILE + 24, "#6b3a1a");
    say("收了可可豆。");
    return true;
  }
  if (above === "r2") {
    setCell(world.tiles, tx, cropY, ".");
    const n = 1 + Math.floor(Math.random() * 3);
    if (!addItem("carrot", n)) spillItem("carrot", n);
    burstBits(tx * TILE + 24, cropY * TILE + 24, "#e67e22");
    say("收割了胡萝卜。");
    return true;
  }
  if (above === "w2") {
    setCell(world.tiles, tx, cropY, ".");
    const n = 2 + Math.floor(Math.random() * 2);
    if (!addItem("nether-wart", n)) spillItem("nether-wart", n);
    burstBits(tx * TILE + 24, cropY * TILE + 24, "#8a2d4a");
    say("收了地狱疣。");
    return true;
  }
  return false;
}

function tryTill() {
  const item = selectedItem();
  if (!item || !HOES.has(item.id)) return false;
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (t === "g" || t === "d" || t === "gp") {
      setCell(world.tiles, cell.x, cell.y, "n");
      burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#8a6239");
      say("锄成了耕地。");
      wearHeld(1);
      return true;
    }
  }
  return false;
}

function tryPath() {
  const item = selectedItem();
  if (!item || !SHOVELS.has(item.id)) return false;
  for (const cell of frontCell()) {
    if (world.tiles[cell.y]?.[cell.x] !== "g") continue;
    setCell(world.tiles, cell.x, cell.y, "gp");
    burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#c4a574");
    say("铲出了草径。");
    wearHeld(1);
    return true;
  }
  return false;
}

function tryBoneMeal() {
  const item = selectedItem();
  if (item?.id !== "bone-meal" || item.count <= 0) return false;
  const tx = Math.floor((player.x + player.face * 22) / TILE);
  const ty = Math.floor((player.y - 8) / TILE);
  for (const cell of [{ x: tx, y: ty }, { x: tx, y: ty + 1 }, ...frontCell()]) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (CROP_STAGE[t]) {
      setCell(world.tiles, cell.x, cell.y, CROP_STAGE[t].next);
      item.count -= 1;
      burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#f4f0dc");
      say("骨粉催熟了作物。");
      return true;
    }
    if (t === "sa") {
      setCell(world.tiles, cell.x, cell.y, ".");
      tree(world.tiles, cell.x, cell.y + 1);
      item.count -= 1;
      say("骨粉让树苗长成了树。");
      return true;
    }
    if (t === "sc") {
      if (world.tiles[cell.y - 1]?.[cell.x] === ".") {
        let height = 0;
        for (let yy = cell.y; yy < world.h && world.tiles[yy][cell.x] === "sc"; yy++) height += 1;
        if (height < 3) {
          setCell(world.tiles, cell.x, cell.y - 1, "sc");
          item.count -= 1;
          say("甘蔗往上长了一截。");
          return true;
        }
      }
    }
  }
  return false;
}

function tryFish() {
  const item = selectedItem();
  if (item?.id !== "fishing-rod" || item.count <= 0) return false;
  if ((player.fishT ?? 0) > 0) {
    say("鱼线还在水里。");
    return true;
  }
  const tx = Math.floor((player.x + player.face * 28) / TILE);
  const ty = Math.floor((player.y - 12) / TILE);
  const wet = world.tiles[ty]?.[tx] === "w" || world.tiles[ty + 1]?.[tx] === "w" || nearWater(tx, ty);
  if (!wet) return false;
  const need = 2.2 + Math.random() * 1.6;
  player.fishT = need;
  player.fishNeed = need;
  say("甩出了鱼竿。等一会儿…");
  return true;
}

function finishFishing() {
  const roll = Math.random();
  let id = "raw-cod";
  if (roll > 0.92) id = "lily-pad";
  else if (roll > 0.82) id = "leather";
  else if (roll > 0.68) id = "bone";
  if (!addItem(id, 1)) spillItem(id, 1);
  addXp(1);
  burstBits(player.x + player.face * 24, player.y - 8, "#7ecbff");
  say(`钓到了${ITEM_LABELS[id] ?? id}。`);
  wearHeld(1);
  stats.fish += 1;
  checkQuest();
}

function tryMilk() {
  const item = selectedItem();
  if (item?.id !== "bucket" || item.count <= 0) return false;
  for (const mob of mobs) {
    if (mob.dead || mob.kind !== "cow" || mob.baby) continue;
    if (Math.hypot(mob.x - player.x, mob.y - player.y) > 52) continue;
    item.count -= 1;
    if (!addItem("milk-bucket", 1)) spillItem("milk-bucket", 1);
    say("从牛身上挤到了奶。");
    return true;
  }
  return false;
}

function tryDrinkMilk() {
  const item = selectedItem();
  if (item?.id !== "milk-bucket" || item.count <= 0) return false;
  item.count -= 1;
  if (!addItem("bucket", 1)) spillItem("bucket", 1);
  player.hunger = Math.min(20, player.hunger + 2);
  player.powerT = 0;
  say("喝了牛奶。");
  return true;
}

function tryCampfire() {
  if (!player.atCampfire) return false;
  const item = selectedItem();
  const out = item?.count > 0 ? CAMPFIRE_COOK[item.id] : null;
  if (!out) return false;
  item.count -= 1;
  if (!addItem(out, 1)) spillItem(out, 1);
  burstBits(player.x, player.y - 16, "#ff9a3c");
  say(`营火烤出了${ITEM_LABELS[out] ?? out}。`);
  return true;
}

function tryCompost() {
  if (!player.atComposter) return false;
  const item = selectedItem();
  if (!item || item.count <= 0 || !COMPOST.has(item.id)) return false;
  const hit = findTileNear(player.x, player.y - 8, ["cp"]);
  if (!hit) return false;
  const key = `${hit.x},${hit.y}`;
  world.compost[key] = (world.compost[key] ?? 0) + 1;
  item.count -= 1;
  if (world.compost[key] >= 7) {
    world.compost[key] = 0;
    if (!addItem("bone-meal", 1)) spillItem("bone-meal", 1);
    burstBits(hit.x * TILE + 24, hit.y * TILE + 8, "#f4f0dc");
    say("堆肥桶产出了骨粉。");
  } else {
    say(`堆肥 ${world.compost[key]} / 7。`);
  }
  return true;
}

function tryBreed(fed) {
  if (!fed.passive || fed.baby || (fed.breedCd ?? 0) > 0) return false;
  for (const other of mobs) {
    if (other === fed || other.dead || other.kind !== fed.kind || other.baby) continue;
    if ((other.loveT ?? 0) <= 0 || (other.breedCd ?? 0) > 0) continue;
    if (Math.hypot(other.x - fed.x, other.y - fed.y) > 64) continue;
    const baby = makeMob(fed.kind, Math.floor(fed.x / TILE), Math.floor(fed.y / TILE));
    baby.baby = true;
    baby.scale *= 0.55;
    baby.hh *= 0.62;
    baby.hw *= 0.7;
    baby.health = Math.max(2, Math.floor(baby.health * 0.5));
    baby.growT = 28;
    baby.x = (fed.x + other.x) / 2;
    baby.y = fed.y;
    mobs.push(baby);
    fed.loveT = 0;
    other.loveT = 0;
    fed.breedCd = 20;
    other.breedCd = 20;
    burstHearts(baby.x, baby.y);
    say(`${MOB_NAME[fed.kind] ?? fed.kind}生出了幼崽。`);
    addXp(2);
    return true;
  }
  return false;
}

function dropMined(spec, x, y, shears) {
  if (spec.chance != null && !shears && Math.random() > spec.chance) return;
  const id = shears && spec.shearsDrop ? spec.shearsDrop : spec.drop;
  if (!id) return;
  const n = spec.count ?? 1;
  drops.push(makeDrop(id, x * TILE + 24, y * TILE + 8, n));
}

function beginMine(opts = {}) {
  const item = selectedItem();
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (!t || t === ".") continue;
    if (isOakDoor(t) || isIronDoor(t)) {
      if (player.swingT > 0) return true;
      startToolSwing("tool");
      const drop = isIronDoor(t) ? "door-iron" : "door-oak";
      for (let y = 0; y < world.h; y++) {
        const ch = world.tiles[y]?.[cell.x];
        if (isOakDoor(ch) || isIronDoor(ch)) setCell(world.tiles, cell.x, y, ".");
      }
      world.doorOpen.delete(cell.x);
      drops.push(makeDrop(drop, cell.x * TILE + 24, cell.y * TILE + 8));
      burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#bbb");
      return true;
    }
    if (t === "➤") {
      if (player.swingT > 0) return true;
      startToolSwing("tool");
      for (const face of [-1, 1]) {
        const bx = cell.x - face;
        if (world.tiles[cell.y]?.[bx] === "⇨") {
          world.pistonOut?.delete(gadgetKey(bx, cell.y));
          break;
        }
      }
      setCell(world.tiles, cell.x, cell.y, ".");
      burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#bbb");
      return true;
    }
    const spec = MINEABLE[t];
    if (!spec) continue;
    const need = mineSeconds(t, item?.id);
    if (!Number.isFinite(need)) {
      if (messageT <= 0.2) say("需要更好的镐才能挖这个。木镐挖不了钻石和黑曜石。");
      return true;
    }
    if (player.mining && player.mining.x === cell.x && player.mining.y === cell.y && player.mining.tile === t) {
      return true;
    }
    if (need <= 0) {
      if (opts.timedOnly) continue;
      finishMineCell({ x: cell.x, y: cell.y, tile: t });
      return true;
    }
    player.mining = { x: cell.x, y: cell.y, t: 0, need, tile: t };
    player.swingT = 10 / 12;
    player.anim = "swing";
    player.frame = 0;
    return true;
  }
  return false;
}

function finishMineCell(cell) {
  if (!player || !world) return;
  const { x, y, tile: t } = cell;
  const spec = MINEABLE[t];
  player.mining = null;
  if (!spec || world.tiles[y]?.[x] !== t) return;
  const shears = selectedItem()?.id === "shears";
  if (t === "z" || t === "Z") {
    const ox = t === "z" ? 1 : -1;
    setCell(world.tiles, x, y, ".");
    if (world.tiles[y]?.[x + ox] === (t === "z" ? "Z" : "z")) setCell(world.tiles, x + ox, y, ".");
    drops.push(makeDrop("bed", x * TILE + 24, y * TILE + 8));
    burstBits(x * TILE + 24, y * TILE + 24, "#bbb");
    return;
  }
  if (t === "C") {
    const key = `${x},${y}`;
    const leftover = world.chests[key];
    if (leftover) {
    leftover.forEach((it) => {
      if (it.count > 0) drops.push(makeDrop(it.id, x * TILE + 24, y * TILE + 8, it.count, it));
    });
      delete world.chests[key];
    }
  }
  setCell(world.tiles, x, y, spec.remain ?? ".");
  dropMined(
    { ...spec, shearsDrop: t === "L" || t === "bl" || t === "sl" ? "oak-leaves" : spec.shearsDrop },
    x,
    y,
    shears,
  );
  if (t === "gv" && Math.random() < 0.15) drops.push(makeDrop("flint", x * TILE + 16, y * TILE + 4));
  if (XP_ORE[t]) addXp(XP_ORE[t]);
  burstBits(x * TILE + 24, y * TILE + 24, "#bbb");
  if (mineSeconds(t, selectedItem()?.id) > 0 && TOOL_DUR[selectedItem()?.id]) wearHeld(1);
}

function usingHeld() {
  return Boolean(hold.use || keys.has("j"));
}

function releaseUse() {
  if (!player) return;
  if (player.bowDraw) fireBow();
  player.mining = null;
}

function updateMining(dt) {
  if (!player) return;
  if (player.dead || player.bowDraw || menusOpen() || !usingHeld()) {
    player.mining = null;
    return;
  }
  let job = player.mining;
  if (job) {
    if (world.tiles[job.y]?.[job.x] !== job.tile) job = player.mining = null;
    else {
      const reach = Math.hypot(player.x - (job.x * TILE + TILE / 2), player.y - 20 - (job.y * TILE + TILE / 2));
      if (reach > 96) job = player.mining = null;
    }
  }
  if (!job) {
    beginMine({ timedOnly: true });
    job = player.mining;
    if (!job) return;
  }
  job.t += dt;
  if (player.swingT <= 0) {
    player.swingT = 10 / 12;
    player.anim = "swing";
    player.frame = 0;
  }
  if (job.t >= job.need) finishMineCell(job);
}

function tryMineOrPlace() {
  if (beginMine()) return true;
  const item = selectedItem();
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
        if (item.id === "oak-door") {
          if (world.tiles[ty - 1]?.[tx] !== ".") {
            say("上面没有空间放门。");
            return true;
          }
          setCell(world.tiles, tx, ty, "D");
          setCell(world.tiles, tx, ty - 1, "U");
        } else if (item.id === "door-iron") {
          if (world.tiles[ty - 1]?.[tx] !== ".") {
            say("上面没有空间放门。");
            return true;
          }
          setCell(world.tiles, tx, ty, "di");
          setCell(world.tiles, tx, ty - 1, "di");
        } else {
          setCell(world.tiles, tx, ty, PLACEABLE[item.id]);
        }
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
    const sneak = keys.has("control") || keys.has("c") || keys.has("arrowdown");
    const soaked = Math.min(amount - 1, Math.floor(player.armor / 4));
    let taken = Math.max(1, amount - soaked);
    if (sneak) taken = Math.max(1, Math.ceil(taken * 0.65));
    player.health = Math.max(0, player.health - taken);
    player.invuln = 0.9;
    player.hurtT = 8 / 12;
    if (dir) {
      player.knockT = 0.2;
      player.vx = dir * 220;
      player.vy = -220;
    }
    if (player.health <= 0) {
      if (consumeTotem()) {
        player.health = 10;
        player.invuln = 2.5;
        burstBits(player.x, player.y - 24, "#e8c44a");
        burstBits(player.x, player.y - 18, "#5ad15a");
        say("不死图腾救了你！", 4);
        return;
      }
      player.dead = true;
      player.anim = "death";
      player.frame = 0;
      player.age = 0;
      player.mining = null;
      player.bowDraw = false;
      closeMenus();
      dropInventory();
      say(bedSpawnValid() ? "你死了。东西掉在地上。按 R 在床边重生。" : "你死了。东西掉在地上。按 R 重生。", 8);
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
  if (who.kind === "wolf" && who.health > 0) {
    who.angry = true;
    who.passive = false;
    who.hurtFlee = 0;
  }
  if (who.health <= 0) {
    who.dead = true;
    who.deathT = 0;
    const cooked = who.inLava || inFire(who);
    const loot = {
      zombie: "rotten-flesh",
      skeleton: "bone",
      spider: "string",
      creeper: "gunpowder",
      enderman: "ender-pearl",
      pig: cooked ? "cooked-porkchop" : "porkchop",
      cow: cooked ? "steak" : "beef",
      chicken: cooked ? "cooked-chicken" : "raw-chicken",
      sheep: cooked ? "cooked-mutton" : "raw-mutton",
      slime: "slimeball",
    };
    if (who.kind !== "bat") drops.push(makeDrop(loot[who.kind] ?? "apple", who.x, who.y - 20));
    if (who.kind === "cow") drops.push(makeDrop("leather", who.x + 6, who.y - 16));
    if (who.kind === "skeleton") drops.push(makeDrop("arrow", who.x - 8, who.y - 18));
    if (who.kind === "spider") drops.push(makeDrop("spider-eye", who.x + 6, who.y - 16));
    if (who.kind === "cow") drops.push(makeDrop("leather", who.x + 8, who.y - 18));
    if (who.kind === "chicken") {
      drops.push(makeDrop("feather", who.x + 8, who.y - 18));
      if (Math.random() < 0.5) drops.push(makeDrop("egg", who.x - 6, who.y - 16));
    }
    if (who.kind === "sheep" && !who.sheared) drops.push(makeDrop("white-wool", who.x + 8, who.y - 18));
    if (who.kind === "slime") drops.push(makeDrop("slimeball", who.x + 6, who.y - 16));
    if (who.kind === "enderman" || Math.random() < 0.2) drops.push(makeDrop("diamond", who.x + 8, who.y - 24));
    if (who.kind === "zombie" && Math.random() < 0.12) drops.push(makeDrop("iron-ingot", who.x - 6, who.y - 22));
    addXp(XP_KILL[who.kind] ?? 3);
    if (!who.passive) {
      stats.kills += 1;
      checkQuest();
    }
  }
}

function trySmelt() {
  if (!player.atFurnace) return false;
  const item = selectedItem();
  if (!item || item.count <= 0 || !SMELT[item.id]) return false;
  if (player.smelt) {
    say("炉子还在烧。");
    return true;
  }
  const made = smeltOnce(player.items, item.id);
  if (!made) {
    say("还缺煤炭或木炭当燃料。");
    return true;
  }
  const hit = findTileNear(player.x, player.y - 8, ["F"]);
  player.smelt = { t: 0, need: 2.4, out: made, x: hit?.x, y: hit?.y };
  if (hit) world.lit[`${hit.x},${hit.y}`] = 2.6;
  say(`正在烧${ITEM_LABELS[made.id] ?? made.id}…`);
  return true;
}

function updateSmelt(dt) {
  if (!player?.smelt) return;
  const job = player.smelt;
  job.t += dt;
  if (job.x != null) world.lit[`${job.x},${job.y}`] = Math.max(world.lit[`${job.x},${job.y}`] ?? 0, 0.45);
  if (job.t < job.need) return;
  if (addItem(job.out.id, job.out.count)) say(`烧出了${ITEM_LABELS[job.out.id] ?? job.out.id}。`);
  else spillItem(job.out.id, job.out.count);
  burstBits(player.x, player.y - 18, "#ffb347");
  player.smelt = null;
}

function tryEnchant() {
  if (!player.atEnchant) return false;
  if ((player.powerT ?? 0) > 0) {
    say("附魔还在生效。");
    return true;
  }
  if ((player.level ?? 0) < 3) {
    say("附魔需要 3 级经验。挖矿、杀怪或钓鱼来升级。");
    return true;
  }
  if (countOwned(player.items, "lapis") < 1 && countOwned(player.items, "redstone-dust") < 3) {
    say("附魔台需要青金石或 3 个红石。");
    return true;
  }
  if (countOwned(player.items, "lapis") >= 1) takeNeed(player.items, { lapis: 1 });
  else takeNeed(player.items, { "redstone-dust": 3 });
  player.level -= 3;
  player.powerT = 25;
  burstBits(player.x, player.y - 24, "#7c5cff");
  say("剑锋发出紫光。25 秒内伤害更高。");
  return true;
}

function tryJukebox() {
  if (!player.atJukebox) return false;
  const box = findTileNear(player.x, player.y - 8, ["jk", "nt"]);
  if (box?.t === "jk") {
    const item = selectedItem();
    if (item?.id !== "music-disc" || item.count <= 0) {
      say("唱片机需要一张唱片。");
      return true;
    }
  }
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
  say(box?.t === "jk" ? "唱片机响起 13。" : "音符盒叮了一声。");
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
    if (t === "td") {
      setCell(world.tiles, cell.x, cell.y, "to");
      say("打开了活板门。");
      return true;
    }
    if (t === "to") {
      setCell(world.tiles, cell.x, cell.y, "td");
      say("关上了活板门。");
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
  if (item.id === "bucket" && world.tiles[ty]?.[tx] === "v") {
    setCell(world.tiles, tx, ty, ".");
    item.count -= 1;
    if (!addItem("lava-bucket", 1)) spillItem("lava-bucket", 1);
    say("装满了熔岩。");
    return true;
  }
  if (item.id === "water-bucket" && world.tiles[ty]?.[tx] === ".") {
    setCell(world.tiles, tx, ty, "w");
    item.count -= 1;
    if (!addItem("bucket", 1)) spillItem("bucket", 1);
    say("把水倒了出来。");
    return true;
  }
  if (item.id === "lava-bucket" && world.tiles[ty]?.[tx] === ".") {
    setCell(world.tiles, tx, ty, "v");
    item.count -= 1;
    if (!addItem("bucket", 1)) spillItem("bucket", 1);
    say("把熔岩倒了出来。");
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
      wearHeld(1);
      return true;
    }
    if (t === "ob") {
      world.portalLit = true;
      burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#a45cff");
      say("下界门发出紫光。走进门框就能传送回家。");
      wearHeld(1);
      return true;
    }
    if (t === ".") {
      const below = world.tiles[cell.y + 1]?.[cell.x];
      if (below && (isSolid(below) || below === "n")) {
        setCell(world.tiles, cell.x, cell.y, "fi");
        burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#ff7a18");
        say("点燃了火焰。");
        wearHeld(1);
        return true;
      }
    }
  }
  return false;
}

function tryShear() {
  const item = selectedItem();
  if (item?.id !== "shears" || item.count <= 0) return false;
  for (const mob of mobs) {
    if (mob.dead || mob.kind !== "sheep" || mob.sheared) continue;
    if (Math.hypot(mob.x - player.x, mob.y - player.y) > 52) continue;
    mob.sheared = true;
    drops.push(makeDrop("white-wool", mob.x, mob.y - 18, 2));
    say("剪下了羊毛。");
    wearHeld(1);
    return true;
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

function bowIcon(charge) {
  if (charge >= 0.72) return "bow-2";
  if (charge >= 0.36) return "bow-1";
  return "bow-0";
}

function tryShoot() {
  const item = selectedItem();
  if (item?.id !== "bow") return false;
  if (player.bowDraw) return true;
  if (countOwned(player.items, "arrow") < 1) {
    say("没有箭。合成：燧石 + 木棍 + 羽毛。");
    return true;
  }
  if (!usingHeld()) {
    player.bowDraw = true;
    player.bowT = 0.55;
    fireBow();
    return true;
  }
  player.bowDraw = true;
  player.bowT = 0;
  say("拉开弓……");
  return true;
}

function fireBow() {
  if (!player || !player.bowDraw) return;
  const charge = player.bowT;
  player.bowDraw = false;
  player.bowT = 0;
  if (charge < 0.2) {
    say("松手太早，箭没射出去。");
    return;
  }
  if (countOwned(player.items, "arrow") < 1) {
    say("没有箭。");
    return;
  }
  takeNeed(player.items, { arrow: 1 });
  const power = Math.min(1, charge);
  const speed = 280 + power * 240;
  arrows.push({
    x: player.x + player.face * 22,
    y: player.y - 28,
    vx: player.face * speed,
    vy: -20 - power * 36,
    life: 1.2 + power * 1,
    gone: false,
    friendly: true,
    dmg: 2 + Math.round(power * 3),
  });
  player.swingT = 0.18;
  player.anim = "swing";
  player.frame = 0;
  say(power >= 0.95 ? "满弦射出！" : "射出一支箭。");
  wearHeld(1);
}

function updateBow(dt) {
  if (!player?.bowDraw) return;
  if (!usingHeld() || player.dead || selectedItem()?.id !== "bow") {
    fireBow();
    return;
  }
  player.bowT = Math.min(1, player.bowT + dt);
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
          if (it.count > 0) drops.push(makeDrop(it.id, x * TILE + 24, y * TILE + 8, it.count, it));
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

function holdingBow() {
  const id = selectedItem()?.id;
  return (id === "bow" || id === "crossbow") && selectedItem()?.count > 0;
}

function tryThrowPearl() {
  const item = selectedItem();
  if (item?.id !== "ender-pearl" || item.count <= 0) return false;
  item.count -= 1;
  arrows.push({
    x: player.x + player.face * 18,
    y: player.y - 28,
    vx: player.face * 420,
    vy: -80,
    life: 1.6,
    gone: false,
    from: "player",
    dmg: 0,
    pearl: true,
  });
  say("扔出了末影珍珠。");
  return true;
}

function tryThrowSnowball() {
  const item = selectedItem();
  if (item?.id !== "snowball" || item.count <= 0) return false;
  item.count -= 1;
  arrows.push({
    x: player.x + player.face * 18,
    y: player.y - 28,
    vx: player.face * 380,
    vy: -40,
    life: 1.4,
    gone: false,
    from: "player",
    dmg: 0,
    snowball: true,
  });
  say("扔出了雪球。");
  return true;
}

function tryThrowTrident() {
  const item = selectedItem();
  if (item?.id !== "trident" || item.count <= 0) return false;
  if ((player.tridentCd ?? 0) > 0) {
    say("三叉戟还没收回来。");
    return true;
  }
  player.tridentCd = 1.15;
  arrows.push({
    x: player.x + player.face * 18,
    y: player.y - 28,
    vx: player.face * 440,
    vy: -50,
    life: 1.8,
    gone: false,
    from: "player",
    dmg: 5,
    trident: true,
  });
  say("掷出了三叉戟。");
  return true;
}

function facingWater() {
  const fx = player.x + player.face * 40;
  return tileAt(fx, player.y - 8) === "w" || tileAt(fx, player.y + 8) === "w" || tileAt(player.x, player.y + 10) === "w";
}

function tryFish() {
  if (selectedItem()?.id !== "fishing-rod") return false;
  if (player.fishT > 0) return true;
  if (!facingWater()) {
    say("面朝水才能钓鱼。");
    return true;
  }
  player.fishT = 2.2 + Math.random() * 1.8;
  say("甩出了鱼竿。等鱼上钩…", 3);
  return true;
}

function tryNoteblock() {
  for (const cell of frontCell()) {
    if (world.tiles[cell.y]?.[cell.x] !== "!") continue;
    burstBits(cell.x * TILE + 24, cell.y * TILE + 8, "#f2d36b");
    say("叮。");
    return true;
  }
  return false;
}

function tryJukebox() {
  for (const cell of frontCell()) {
    if (world.tiles[cell.y]?.[cell.x] !== ")") continue;
    if (!world.jukebox) world.jukebox = new Map();
    const key = `${cell.x},${cell.y}`;
    const playing = world.jukebox.get(key);
    if (playing) {
      if (!addItem(playing, 1)) spillItem(playing, 1);
      world.jukebox.delete(key);
      say("取出了唱片。");
      return true;
    }
    const item = selectedItem();
    if (item && DISC_SONGS[item.id] && item.count > 0) {
      world.jukebox.set(key, item.id);
      item.count -= 1;
      burstBits(cell.x * TILE + 24, cell.y * TILE + 8, "#8ec8e8");
      say(`正在播放《${DISC_SONGS[item.id]}》。`, 4);
      return true;
    }
    return false;
  }
  return false;
}

function nearMob(pred, range = 52) {
  for (const mob of mobs) {
    if (mob.dead) continue;
    if (pred && !pred(mob)) continue;
    if (Math.hypot(mob.x - player.x, mob.y - player.y) <= range) return mob;
  }
  return null;
}

function mountOnto(mob) {
  player.mount = mob;
  mob.mounted = true;
  mob.stillT = 0;
  mob.hurtFlee = 0;
  mob.followT = 0;
  say(mob.kind === "boat" ? "坐上了船。A/D 划，空格下来。" : mob.kind === "minecart" ? "坐上了矿车。A/D 开，空格下来。" : "骑上了马。A/D 跑，空格跳，Shift 下来。", 3);
}

function dismount() {
  const mount = player.mount;
  if (!mount) return;
  mount.mounted = false;
  mount.vx = 0;
  player.mount = null;
  player.y = mount.y - 4;
  player.vy = -80;
  say("下来了。");
}

function trySaddle() {
  const item = selectedItem();
  if (item?.id !== "saddle" || item.count <= 0) return false;
  const horse = nearMob((mob) => mob.kind === "horse" && !mob.saddled);
  if (!horse) return false;
  item.count -= 1;
  horse.saddled = true;
  say("给马上了鞍。再用一次就能骑。");
  return true;
}

function tryMount() {
  if (player.mount) return false;
  const blocking = frontCell().some((cell) => {
    const t = world.tiles[cell.y]?.[cell.x];
    return t && t !== "." && (MINEABLE[t] || t === "C" || t === "T" || t === "F" || t === "D" || t === "U");
  });
  if (blocking) return false;
  const boat = nearMob((mob) => mob.kind === "boat" && !mob.mounted, 56);
  if (boat) {
    mountOnto(boat);
    return true;
  }
  const cart = nearMob((mob) => mob.kind === "minecart" && !mob.mounted, 56);
  if (cart) {
    mountOnto(cart);
    return true;
  }
  const horse = nearMob((mob) => mob.kind === "horse" && mob.saddled && !mob.mounted, 56);
  if (horse) {
    mountOnto(horse);
    return true;
  }
  return false;
}

function tryPlaceBoat() {
  const item = selectedItem();
  if (item?.id !== "oak-boat" || item.count <= 0) return false;
  if (!facingWater() && tileAt(player.x, player.y + 8) !== "w") {
    say("船要放在水上。");
    return true;
  }
  const tx = Math.floor((player.x + player.face * 36) / TILE);
  const ty = Math.floor((player.y + 8) / TILE);
  const boat = makeMob("boat", tx, ty);
  boat.y = player.y;
  boat.x = player.x + player.face * 40;
  mobs.push(boat);
  item.count -= 1;
  say("放下了橡木船。靠近再用就能坐上去。");
  return true;
}

function facingRail() {
  return railAt(player.x + player.face * 36, player.y - 8) || railAt(player.x, player.y - 8) || railAt(player.x + player.face * 28, player.y + 4);
}

function tryPlaceMinecart() {
  const item = selectedItem();
  if (item?.id !== "minecart" || item.count <= 0) return false;
  if (!facingRail()) {
    say("矿车要放在铁轨上。");
    return true;
  }
  const tx = Math.floor((player.x + player.face * 36) / TILE);
  const ty = Math.floor((player.y + 8) / TILE);
  const cart = makeMob("minecart", tx, ty);
  cart.x = player.x + player.face * 40;
  cart.y = player.y;
  mobs.push(cart);
  item.count -= 1;
  say("放下了矿车。靠近再用就能坐上去。");
  return true;
}

const LEASHABLE = new Set(["pig", "cow", "sheep", "chicken", "wolf", "rabbit", "cat", "horse", "fox", "parrot"]);

function tryLead() {
  const item = selectedItem();
  const leashed = nearMob((mob) => mob.leashed, 80);
  if (leashed && (item?.id === "lead" || item?.count <= 0)) {
    leashed.leashed = false;
    leashed.followT = 0;
    if (!addItem("lead", 1)) spillItem("lead", 1);
    say("解开了拴绳。");
    return true;
  }
  if (item?.id !== "lead" || item.count <= 0) return false;
  const target = nearMob((mob) => LEASHABLE.has(mob.kind) && !mob.leashed, 56);
  if (!target) return false;
  item.count -= 1;
  target.leashed = true;
  target.followT = 12;
  const names = { pig: "猪", cow: "牛", chicken: "鸡", sheep: "羊", wolf: "狼", rabbit: "兔子", cat: "猫", horse: "马" };
  say(`拴住了${names[target.kind] ?? target.kind}。`);
  return true;
}

function consumeTotem() {
  for (const slot of [selectedItem(), player.offhand]) {
    if (slot?.id === "totem" && slot.count > 0) {
      slot.count -= 1;
      return true;
    }
  }
  return false;
}

function hasElytra() {
  const main = player.selected === OFFHAND_SLOT ? null : player.items[player.selected];
  const off = player.offhand;
  return (main?.id === "elytra" && main.count > 0) || (off?.id === "elytra" && off.count > 0);
}

function tryGlide(dt, jump) {
  if (!hasElytra() || player.mount || player.grounded || player.inWater || player.inLava) return;
  if (player.vy <= 40) return;
  player.vy = Math.min(player.vy, 150);
  player.vy *= 0.88;
  if (jump) player.vx += player.face * 260 * dt;
  player.vx = Math.max(-400, Math.min(400, player.vx));
}

function railAt(px, py) {
  const t = tileAt(px, py);
  return t === "═" || t === "╪";
}

function railPoweredAt(px, py) {
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  if (tileAt(px, py) !== "╪") return false;
  return isPowered(x, y) || isPowered(x, y + 1) || isPowered(x - 1, y) || isPowered(x + 1, y);
}

function moveMinecart(body, dt) {
  const on = railAt(body.x, body.y - 4) || railAt(body.x, body.y + 2);
  if (!on) {
    moveBody(body, dt);
    return;
  }
  const ty = Math.floor((body.y - 4) / TILE);
  body.y = (ty + 1) * TILE;
  body.vy = 0;
  body.grounded = true;
  body.inWater = false;
  const nx = body.x + body.vx * dt;
  if ((railAt(nx, body.y - 4) || railAt(nx, ty * TILE + 8)) && !rectHitsSolid(nx - body.hw, body.y - body.hh, body.hw * 2, Math.max(4, body.hh - 6))) {
    body.x = nx;
    if (railPoweredAt(body.x, body.y - 4) || railPoweredAt(body.x, body.y + 2)) {
      const dir = Math.sign(body.vx) || body.face || 1;
      body.vx = dir * Math.max(Math.abs(body.vx), 360);
    }
  } else body.vx = 0;
}

function captureDim() {
  return {
    world,
    mobs,
    drops,
    arrows,
    particles,
    chestItems,
    furnace,
    brew,
  };
}

function applyDim(snap) {
  world = snap.world;
  mobs = snap.mobs;
  drops = snap.drops;
  arrows = snap.arrows;
  particles = snap.particles;
  chestItems = snap.chestItems;
  furnace = snap.furnace;
  brew = snap.brew ?? emptyFurnace();
}

function swapDimension(next) {
  if (player.mount) dismount();
  dimKeep[dimension] = captureDim();
  if (!dimKeep[next]) {
    if (next === "nether") {
      world = buildNether();
      mobs = [
        makeMob("blaze", 48, 6),
        makeMob("blaze", 28, 7),
        makeMob("ghast", 18, 5),
        makeMob("wither-skeleton", 58, 10),
        makeMob("wither-skeleton", 64, 10),
        makeMob("magma-cube", 22, 10),
        makeMob("magma-cube", 42, 10),
      ];
      drops = [
        makeDrop("glowstone", TILE * 64.5, TILE * 8, 2),
        makeDrop("nether-wart", TILE * 22.5, TILE * 8, 3),
        makeDrop("wither-skull", TILE * 21.5, TILE * 8, 3),
        makeDrop("ancient-debris", TILE * 30.5, TILE * 8, 2),
      ];
      arrows = [];
      particles = [];
      chestItems = emptySlots(CHEST_SLOTS);
      furnace = emptyFurnace();
      brew = emptyFurnace();
    } else if (next === "end") {
      world = buildEnd();
      mobs = [
        makeMob("ender-dragon", 40, 5),
        makeMob("enderman", 24, 10),
        makeMob("enderman", 50, 10),
        makeMob("enderman", 56, 10),
      ];
      drops = [makeDrop("ender-pearl", TILE * 26, TILE * 8, 2), makeDrop("chorus-fruit", TILE * 52, TILE * 8, 4)];
      arrows = [];
      particles = [];
      chestItems = emptySlots(CHEST_SLOTS);
      furnace = emptyFurnace();
      brew = emptyFurnace();
    }
  } else applyDim(dimKeep[next]);
  dimension = next;
  player.x = TILE * 38.5;
  player.y = TILE * 10;
  player.vx = 0;
  player.vy = 0;
  player.portalT = 0;
  craftingOpen = false;
  chestOpen = false;
  furnaceOpen = false;
  brewOpen = false;
  say(dimension === "nether" ? "穿过了传送门。这里是下界。" : dimension === "end" ? "穿过了传送门。这里是末地。" : "回到了主世界。", 4);
}

function standingPortal() {
  const tiles = [tileAt(player.x, player.y - 16), tileAt(player.x, player.y - 8), tileAt(player.x, player.y - 28)];
  if (tiles.includes("@")) return "nether";
  if (tiles.includes("▓")) return "end";
  return null;
}

function updatePortal(dt) {
  const kind = standingPortal();
  if (!kind) {
    player.portalT = 0;
    return;
  }
  player.portalT += dt;
  if (player.portalT >= 1.35) {
    const dest = dimension === kind ? "overworld" : kind;
    swapDimension(dest);
  }
}

function firePlayerBow() {
  const charge = player.drawT;
  player.drawT = 0;
  player.bowHeld = false;
  if (charge < 0.18) return;
  if (!takeNeed(player.items, { arrow: 1 })) {
    say("没有箭。");
    return;
  }
  const cross = selectedItem()?.id === "crossbow";
  const speed = 260 + charge * 240;
  arrows.push({
    x: player.x + player.face * 22,
    y: player.y - 28,
    vx: player.face * speed,
    vy: -36 - charge * 40,
    life: 2.5,
    gone: false,
    from: "player",
    dmg: cross ? 3 + Math.round(charge * 5) : 2 + Math.round(charge * 4),
  });
  say(cross ? "弩射出一支箭。" : "射出一支箭。");
}

function pressUse(down) {
  if (!player || player.dead || win || mode !== "play") return;
  if (!down) {
    if (player.bowHeld) firePlayerBow();
    player.shieldHeld = false;
    return;
  }
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
  if (packOpen) {
    packOpen = false;
    packPick = -1;
    say("关上了背包。");
    return;
  }
  if (tryOpenChest()) return;
  if (tryOpenTable()) return;
  if (trySmelt()) return;
  if (tryEnchant()) return;
  if (tryJukebox()) return;
  if (tryDoor()) return;
  if (trySleep()) return;
  if (holdingBow()) {
    player.bowHeld = true;
    return;
  }
  const using = selectedItem();
  const busy = using?.count > 0 && using.id !== "shield" && !SWORD_IDS.has(using.id);
  if (hasShield() && !busy) {
    player.shieldHeld = true;
    say("举起了盾。");
    return;
  }
  useSelected();
}

function useSelected() {
  if (player.dead || win) return;
  if (player.sleeping > 0 || player.eatT > 0) return;
  if (uiOpen()) return;
  if (tryFeed()) return;
  if (tryShear()) return;
  if (trySaddle()) return;
  if (tryMilk()) return;
  if (tryDrinkMilk()) return;
  if (tryFarm()) return;
  if (tryTill()) return;
  if (tryPath()) return;
  if (tryBoneMeal()) return;
  if (tryFish()) return;
  if (tryCampfire()) return;
  if (tryCompost()) return;
  if (tryBucket()) return;
  if (trySponge()) return;
  if (tryFlint()) return;
  if (tryMineOrPlace()) return;
  const item = selectedItem();
  if (!item || item.count <= 0) return;
  if (tryShoot()) return;
  if (tryThrow()) return;
  if (tryArmor()) return;
  if (SWORDS[item.id]) {
    if (player.swingT > 0) return;
    startToolSwing("sword");
    return;
  }
  if (item.id === "potion-fire") {
    item.count -= 1;
    player.fireRes = Math.max(player.fireRes ?? 0, 45);
    player.eatT = 8 / 10;
    player.anim = "eat";
    player.frame = 0;
    say("喝下了抗火药水。岩浆暂时伤不到你。");
    return;
  }
  if (item.id === "chorus-fruit") {
    item.count -= 1;
    player.health = Math.min(20, player.health + 2);
    player.hunger = Math.min(20, player.hunger + 4);
    player.eatT = 8 / 10;
    player.anim = "eat";
    player.frame = 0;
    chorusTeleport();
    say("吃了紫颂果，被传送了。");
    return;
  }
  const food = FOOD[item.id];
  if (food) {
    const canHeal = (food.health ?? 0) !== 0 && (food.health > 0 ? player.health < 20 : true);
    if (player.hunger >= 20 && !canHeal) {
      say("已经吃饱了。");
      return;
    }
    player.health = Math.min(20, Math.max(0, player.health + (food.health ?? 0)));
    player.hunger = Math.min(20, player.hunger + food.hunger);
    item.count -= 1;
    if (item.id === "mushroom-stew" && !addItem("bowl", 1)) spillItem("bowl", 1);
    player.eatT = 8 / 10;
    player.anim = "eat";
    player.frame = 0;
    if (item.id === "chorus-fruit") {
      chorusTeleport();
      say("吃了紫颂果，被传送了。");
    } else say(`使用了${ITEM_LABELS[item.id]}`);
  }
}

function swingHit() {
  if (player.swingKind !== "sword") return;
  const t = 1 - player.swingT / (10 / 12);
  if (t < 0.28 || t > 0.72) return;
  const reach = 46;
  const x = player.x + player.face * 18;
  for (const mob of mobs) {
    if (mob.dead || mob.hitT > 0) continue;
    if (Math.abs(mob.x - x) < reach + mob.hw && Math.abs(mob.y - player.y) < player.hh + 8) {
      hurt(mob, ((player.powerT ?? 0) > 0 ? 2 : 0) + (SWORDS[selectedItem()?.id] ?? 3), player.face);
      if (SWORDS[selectedItem()?.id]) wearHeld(1);
    }
  }
}

function updatePlayer(dt) {
  if (player.dead) {
    player.age += dt;
    player.frame = Math.min(11, Math.floor(player.age * 10));
    return;
  }
  if (win) {
    player.vx = 0;
    player.vy = 0;
    return;
  }

  if (craftingOpen || chestOpen || packOpen) {
    player.vx = 0;
    player.vy = 0;
    player.anim = "idle";
    player.frame = 0;
    player.age += dt;
    if (craftingOpen && !player.atTable) craftingOpen = false;
    if (chestOpen && chestKind === "ender" && !player.atEnder) chestOpen = false;
    if (chestOpen && chestKind !== "ender" && !player.atChest) chestOpen = false;
    if (furnaceOpen && !player.atFurnace) furnaceOpen = false;
    if (brewOpen && !player.atBrew) brewOpen = false;
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
  if (player.popT > 0) player.popT -= dt;
  const prevAir = player.lastAir ?? player.air;
  if (player.air < prevAir) {
    const before = Math.ceil((prevAir / AIR_MAX) * 10 - 1e-9);
    const after = Math.ceil((player.air / AIR_MAX) * 10 - 1e-9);
    if (after < before) player.popT = 0.18;
  }
  player.lastAir = player.air;
  updateMining(dt);
  updateSmelt(dt);
  updateBow(dt);

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
  if (player.onPath) speed *= 1.12;
  const sneak = keys.has("control") || keys.has("c") || keys.has("arrowdown");
  const moving = left || right;
  const sprint = !sneak && player.hunger >= 6 && keys.has("shift") && moving;
  if (sneak) speed *= 0.35;
  else if (sprint) speed *= 1.38;
  player.sprinting = sprint;

  if (mount) {
    if (sneak) {
      dismount();
    } else {
      if (player.knockT > 0) player.knockT -= dt;
      else {
        mount.vx = (right ? speed : 0) - (left ? speed : 0);
        if (left) mount.face = player.face = -1;
        if (right) mount.face = player.face = 1;
      }
      if (jump && player.eatT <= 0) {
        if (mount.kind === "horse" && mount.grounded) {
          mount.vy = -JUMP * 0.9;
          mount.grounded = false;
        } else if (mount.kind === "boat" || mount.kind === "minecart") dismount();
      }
      if (mount.kind === "minecart") moveMinecart(mount, dt);
      else moveBody(mount, dt);
      player.x = mount.x;
      player.y = mount.y - (mount.kind === "boat" || mount.kind === "minecart" ? 10 : 22);
      player.vx = mount.vx;
      player.vy = mount.vy;
      player.grounded = mount.grounded;
      player.inWater = mount.inWater;
      player.inLava = mount.inLava;
      player.face = mount.face;
    }
  } else if (player.knockT > 0) {
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

  if (!player.mount) moveBody(player, dt);
  tryGlide(dt, jump);

  if (player.inLava) hurt(player, 3, -player.face);
  if (player.onMagma) hurt(player, 2, -player.face);
  if (inFire(player)) hurt(player, 2, -player.face);
  if (tileAt(player.x, player.y - 8) === "k") hurt(player, 1, -player.face);
  updatePortal(dt);

  if (player.swingT > 0) {
    player.swingT -= dt;
    swingHit();
    if (player.swingT <= 0) player.anim = "idle";
  }
  if (player.hurtT > 0) player.hurtT -= dt;
  if (player.invuln > 0) player.invuln -= dt;
  if (player.dropCd > 0) player.dropCd -= dt;
  if (player.tridentCd > 0) player.tridentCd -= dt;

  player.hungerT += dt;
  const drain = player.sprinting ? 5.5 : 9;
  if (player.hungerT > drain) {
    player.hungerT = 0;
    if (Math.abs(player.vx) > 20 || !player.grounded || player.sprinting) player.hunger = Math.max(0, player.hunger - 1);
    if (player.hunger <= 0) hurt(player, 1, -player.face);
  }
  if (player.hunger >= 18 && player.health < 20) {
    player.regenT = (player.regenT ?? 0) + dt;
    if (player.regenT > 4) {
      player.regenT = 0;
      player.health = Math.min(20, player.health + 1);
    }
  } else player.regenT = 0;

  if ((player.fishT ?? 0) > 0) {
    player.fishT -= dt;
    if (Math.abs(player.vx) > 80) {
      player.fishT = 0;
      say("鱼跑了。");
    } else if (player.fishT <= 0) finishFishing();
  }

  player.age += dt;
  if (player.eatT > 0) player.eatT -= dt;

  if (player.bowDraw) {
    player.anim = "swing";
    player.frame = Math.min(9, Math.floor(player.bowT * 10));
  } else if (player.swingT > 0) {
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
      if (mob.mounted) continue;
      if (mob.leashed && !player.dead) mob.followT = Math.max(mob.followT, 1.2);
      if (mob.loveT > 0) mob.loveT -= dt;
      if (mob.breedCd > 0) mob.breedCd -= dt;
      if (mob.baby && mob.growT > 0) {
        mob.growT -= dt;
        if (mob.growT <= 0) {
          mob.baby = false;
          const grown = makeMob(mob.kind, 0, 0);
          mob.scale = grown.scale;
          mob.hh = grown.hh;
          mob.hw = grown.hw;
          mob.health = grown.hp;
          say(`${MOB_NAME[mob.kind] ?? mob.kind}长大了。`);
        }
      }
      if (mob.loveT > 0) tryBreed(mob);
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
      if (mob.kind === "chicken" && mob.grounded && Math.abs(mob.vx) > 20 && Math.random() < 0.04) mob.vy = -220;
      if (mob.kind === "rabbit" && mob.grounded && Math.abs(mob.vx) > 16 && Math.random() < 0.08) mob.vy = -280;
      if (mob.kind === "parrot" && mob.grounded && Math.abs(mob.vx) > 20 && Math.random() < 0.05) mob.vy = -260;
      if (mob.kind === "squid" && !mob.inWater) {
        const pond = 15.5 * TILE;
        mob.face = Math.sign(pond - mob.x) || mob.face;
        mob.vx = mob.face * mob.speed;
      }
      if (mob.kind === "boat" && !mob.inWater) {
        const pond = 15.5 * TILE;
        mob.face = Math.sign(pond - mob.x) || mob.face;
        mob.vx = mob.face * mob.speed;
      }
      if (mob.kind === "minecart") {
        if (!mob.mounted) mob.vx *= 0.96;
        moveMinecart(mob, dt);
        continue;
      }
      if (mob.kind === "chicken" && Math.random() < dt * 0.08) {
        drops.push(makeDrop("egg", mob.x, mob.y - 12));
        say("鸡下蛋了。", 1.5);
      }
      moveBody(mob, dt);
      if (mob.inLava) hurt(mob, 4, -mob.face);
      if (inFire(mob)) hurt(mob, 2, -mob.face);
      if (mob.kind === "slime" && mob.grounded && Math.abs(mob.vx) > 12 && Math.random() < 0.08) mob.vy = -320;
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
        addXp(5);
        say("苦力怕爆炸了！");
        continue;
      }
    } else if (mob.kind === "skeleton" || mob.kind === "pillager") {
      steerSkeleton(mob, dt, dx, close);
    } else if (mob.kind === "drowned") {
      steerDrowned(mob, dt, dx, close);
    } else if (mob.kind === "witch") {
      steerWitch(mob, dt, dx, close);
    } else if (mob.kind === "blaze") {
      steerBlaze(mob, dt, dx, close);
    } else if (mob.kind === "ghast") {
      steerGhast(mob, dt, dx, close);
    } else if (mob.kind === "wither") {
      steerWither(mob, dt, dx, close);
    } else if (mob.kind === "ender-dragon") {
      steerDragon(mob, dt, dx, close);
    } else if (mob.kind === "iron-golem") {
      steerGolem(mob, dt);
    } else if (mob.kind === "snow-golem") {
      steerSnowGolem(mob, dt);
    } else {
      if (mob.kind === "creeper") mob.fuse = Math.max(0, mob.fuse - dt * 1.8);
      if (close) {
        mob.face = Math.sign(dx) || mob.face;
        mob.vx = mob.face * mob.speed * (mob.inWater ? 0.55 : 1);
        if (mob.kind === "spider" && mob.grounded && Math.abs(dx) < 90 && Math.random() < 0.02) mob.vy = -520;
        if (mob.kind === "slime" && mob.grounded && Math.abs(dx) < 180 && Math.random() < 0.08) mob.vy = -360;
      } else {
        mob.vx *= 0.8;
      }
    }
    moveBody(mob, dt);
    if (mob.inLava) hurt(mob, 4, -mob.face);
    if (inFire(mob)) hurt(mob, 2, -mob.face);
    if (mob.kind !== "creeper" && mob.kind !== "skeleton" && !player.dead && Math.abs(mob.x - player.x) < mob.hw + player.hw + 4 && Math.abs(mob.y - player.y) < mob.hh) {
      hurt(player, mob.dmg, Math.sign(player.x - mob.x) || -1);
      if (mob.kind === "wither-skeleton") player.wither = Math.max(player.wither ?? 0, 5);
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
      fireArrow(mob, mob.kind === "pillager" ? 3 : 2);
      mob.drawT = 0;
      mob.shootCd = 1.15;
    }
    return;
  }
  mob.vx = mob.face * mob.speed * (mob.inWater ? 0.4 : 0.75);
  mob.drawT = 0;
}

function fireArrow(from, dmg = 2) {
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
    from: "mob",
    dmg,
  });
}

function fireTrident(from) {
  const tx = player.x - from.x;
  const ty = player.y - 24 - (from.y - 28);
  const dist = Math.hypot(tx, ty) || 1;
  const speed = 420;
  arrows.push({
    x: from.x + from.face * 18,
    y: from.y - 28,
    vx: (tx / dist) * speed,
    vy: (ty / dist) * speed - 28,
    life: 2.2,
    gone: false,
    from: "mob",
    dmg: 4,
    trident: true,
  });
}

function steerDrowned(mob, dt, dx, close) {
  if (mob.shootCd > 0) mob.shootCd -= dt;
  if (!close) {
    mob.vx *= 0.8;
    return;
  }
  mob.face = Math.sign(dx) || mob.face;
  const dist = Math.abs(dx);
  if (dist < 70) {
    mob.vx = mob.face * mob.speed * (mob.inWater ? 0.7 : 1);
    return;
  }
  if (dist < 260 && mob.shootCd <= 0 && mob.hitT <= 0 && Math.abs(mob.y - player.y) < 90) {
    mob.vx = 0;
    fireTrident(mob);
    mob.shootCd = 1.8;
    return;
  }
  mob.vx = mob.face * mob.speed * (mob.inWater ? 0.65 : 0.85);
}

function firePotion(from) {
  const tx = player.x - from.x;
  const ty = player.y - 24 - (from.y - 28);
  const dist = Math.hypot(tx, ty) || 1;
  const speed = 300;
  arrows.push({
    x: from.x + from.face * 16,
    y: from.y - 36,
    vx: (tx / dist) * speed,
    vy: (ty / dist) * speed - 50,
    life: 2.2,
    gone: false,
    from: "mob",
    dmg: 3,
    potion: true,
  });
}

function steerWitch(mob, dt, dx, close) {
  if (mob.shootCd > 0) mob.shootCd -= dt;
  const linedUp = close && Math.abs(mob.y - player.y) < 90;
  if (!linedUp) {
    mob.vx *= 0.8;
    return;
  }
  mob.face = Math.sign(dx) || mob.face;
  const dist = Math.abs(dx);
  if (dist < 70) {
    mob.vx = -mob.face * mob.speed;
    return;
  }
  if (dist < 280 && mob.shootCd <= 0 && mob.hitT <= 0) {
    mob.vx = 0;
    firePotion(mob);
    mob.shootCd = 1.6;
    return;
  }
  mob.vx = mob.face * mob.speed * 0.7;
}

function steerBlaze(mob, dt, dx, close) {
  if (mob.shootCd > 0) mob.shootCd -= dt;
  const linedUp = close && Math.abs(mob.y - player.y) < 120;
  if (!linedUp) {
    mob.vx *= 0.85;
    return;
  }
  mob.face = Math.sign(dx) || mob.face;
  const dist = Math.abs(dx);
  if (dist < 70) {
    mob.vx = -mob.face * mob.speed;
    return;
  }
  if (dist < 320 && mob.shootCd <= 0 && mob.hitT <= 0) {
    mob.vx = 0;
    fireArrow(mob);
    mob.shootCd = 1.25;
    return;
  }
  mob.vx = mob.face * mob.speed * 0.65;
}

function steerGhast(mob, dt, dx, close) {
  if (mob.shootCd > 0) mob.shootCd -= dt;
  const linedUp = close && Math.abs(mob.y - player.y) < 160;
  if (!linedUp) {
    mob.vx *= 0.85;
    return;
  }
  mob.face = Math.sign(dx) || mob.face;
  const dist = Math.abs(dx);
  if (dist < 110) {
    mob.vx = -mob.face * mob.speed;
    return;
  }
  if (dist < 380 && mob.shootCd <= 0 && mob.hitT <= 0) {
    mob.vx = 0;
    fireFireball(mob);
    mob.shootCd = 2.1;
    return;
  }
  mob.vx = mob.face * mob.speed * 0.5;
}

function fireFireball(from) {
  const tx = player.x - from.x;
  const ty = player.y - 24 - (from.y - 36);
  const dist = Math.hypot(tx, ty) || 1;
  const speed = 220;
  arrows.push({
    x: from.x + from.face * 18,
    y: from.y - 36,
    vx: (tx / dist) * speed,
    vy: (ty / dist) * speed - 10,
    life: 3.2,
    gone: false,
    from: "mob",
    dmg: 5,
    fireball: true,
  });
}

function fireWitherSkull(from) {
  const tx = player.x - from.x;
  const ty = player.y - 24 - (from.y - 36);
  const dist = Math.hypot(tx, ty) || 1;
  const speed = 200;
  arrows.push({
    x: from.x + from.face * 16,
    y: from.y - 32,
    vx: (tx / dist) * speed,
    vy: (ty / dist) * speed - 8,
    life: 3.4,
    gone: false,
    from: "mob",
    dmg: 6,
    fireball: true,
    witherSkull: true,
  });
}

function steerWither(mob, dt, dx, close) {
  if (mob.shootCd > 0) mob.shootCd -= dt;
  const linedUp = close && Math.abs(mob.y - player.y) < 180;
  if (!linedUp) {
    mob.vx *= 0.85;
    return;
  }
  mob.face = Math.sign(dx) || mob.face;
  const dist = Math.abs(dx);
  if (dist < 100) {
    mob.vx = -mob.face * mob.speed;
    return;
  }
  if (dist < 400 && mob.shootCd <= 0 && mob.hitT <= 0) {
    mob.vx = 0;
    fireWitherSkull(mob);
    mob.shootCd = 1.7;
    return;
  }
  mob.vx = mob.face * mob.speed * 0.55;
}

function steerDragon(mob, dt, dx, close) {
  if (mob.shootCd > 0) mob.shootCd -= dt;
  const linedUp = close && Math.abs(mob.y - player.y) < 200;
  if (!linedUp) {
    mob.vx *= 0.88;
    return;
  }
  mob.face = Math.sign(dx) || mob.face;
  const dist = Math.abs(dx);
  if (dist < 120) {
    mob.vx = -mob.face * mob.speed;
    return;
  }
  if (dist < 420 && mob.shootCd <= 0 && mob.hitT <= 0) {
    mob.vx = 0;
    fireFireball(mob);
    mob.shootCd = 1.9;
    return;
  }
  mob.vx = mob.face * mob.speed * 0.6;
}

function steerGolem(mob, dt) {
  if (mob.shootCd > 0) mob.shootCd -= dt;
  let target = null;
  let best = 300;
  for (const other of mobs) {
    if (other.dead || other.passive || other.ally || other === mob) continue;
    const d = Math.hypot(other.x - mob.x, other.y - mob.y);
    if (d < best) {
      best = d;
      target = other;
    }
  }
  if (!target) {
    if ((mob.grounded || mob.inWater) && Math.random() < 0.008) {
      mob.face = Math.random() < 0.5 ? -1 : 1;
      mob.vx = mob.face * mob.speed * 0.35;
    } else if (Math.random() < 0.01) mob.vx = 0;
    return;
  }
  const gap = target.x - mob.x;
  mob.face = Math.sign(gap) || mob.face;
  if (Math.abs(gap) < mob.hw + target.hw + 8 && Math.abs(target.y - mob.y) < mob.hh) {
    mob.vx = 0;
    if (mob.shootCd <= 0) {
      hurt(target, mob.dmg, mob.face);
      mob.shootCd = 0.85;
    }
  } else {
    mob.vx = mob.face * mob.speed;
  }
}

function steerSnowGolem(mob, dt) {
  if (mob.shootCd > 0) mob.shootCd -= dt;
  let target = null;
  let best = 260;
  for (const other of mobs) {
    if (other.dead || other.passive || other.ally || other === mob) continue;
    const d = Math.hypot(other.x - mob.x, other.y - mob.y);
    if (d < best) {
      best = d;
      target = other;
    }
  }
  if (!target) {
    if ((mob.grounded || mob.inWater) && Math.random() < 0.01) {
      mob.face = Math.random() < 0.5 ? -1 : 1;
      mob.vx = mob.face * mob.speed * 0.35;
    } else if (Math.random() < 0.012) mob.vx = 0;
    return;
  }
  const gap = target.x - mob.x;
  mob.face = Math.sign(gap) || mob.face;
  if (Math.abs(gap) < 48) mob.vx = -mob.face * mob.speed * 0.4;
  else if (Math.abs(gap) > 160) mob.vx = mob.face * mob.speed * 0.7;
  else mob.vx = 0;
  if (mob.shootCd <= 0 && Math.abs(gap) < 220 && Math.abs(target.y - mob.y) < 80) {
    arrows.push({
      x: mob.x + mob.face * 16,
      y: mob.y - 28,
      vx: mob.face * 340,
      vy: -30,
      life: 1.6,
      gone: false,
      from: "ally",
      dmg: 0,
      snowball: true,
    });
    mob.shootCd = 1.35;
  }
}

function landPearl(shot) {
  player.x = shot.x;
  player.y = shot.y + 28;
  unstick(player);
  hurt(player, 5, 0);
  burstBits(player.x, player.y - 24, "#5b2d82");
  say("传送了。");
}

function updateArrows(dt) {
  for (const shot of arrows) {
    if (shot.gone) continue;
    shot.life -= dt;
    shot.vy += (shot.pebble ? 420 : 260) * dt;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    const stuck = shot.life <= 0 || solidAt(shot.x, shot.y);
    if (shot.from === "player" || shot.from === "ally") {
      for (const mob of mobs) {
        if (mob.dead) continue;
        if (Math.abs(shot.x - mob.x) < mob.hw + 8 && Math.abs(shot.y - (mob.y - mob.hh * 0.5)) < mob.hh * 0.6) {
          if (shot.pearl) landPearl(shot);
          else if (shot.snowball) {
            mob.vx = Math.sign(shot.vx) * 180;
            mob.vy = -80;
          } else hurt(mob, shot.dmg ?? 3, Math.sign(shot.vx) || player.face);
          shot.gone = true;
          break;
        }
      }
      if (shot.gone) continue;
      if (stuck) {
        if (shot.pearl) landPearl(shot);
        shot.gone = true;
      }
      continue;
    }
    if (stuck) {
      shot.gone = true;
      continue;
    }
    if (shot.friendly) {
      for (const mob of mobs) {
        if (mob.dead) continue;
        if (Math.abs(shot.x - mob.x) < 16 && Math.abs(shot.y - (mob.y - 18)) < 28) {
          const dmg = shot.pebble === "slimeball" ? 2 : shot.pebble ? 1 : (shot.dmg ?? 4);
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
      if (tryAddItem(world.chests[key], drop.id, drop.count, CHEST_SLOTS, drop)) {
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
    if (addItem(drop.id, drop.count, drop)) {
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
    say("天黑了。关上门，回房子里睡觉。", 4);
    if (world && !world.nightSpawned && dimension === "overworld") {
      world.nightSpawned = true;
      mobs.push(makeMob("zombie", 22, 10));
      mobs.push(makeMob("spider", 38, 10));
      mobs.push(makeMob("skeleton", 72, 10));
      mobs.push(makeMob("creeper", 98, 10));
    }
  }
}

function inFire(body) {
  return tileAt(body.x, body.y - 8) === "fi" || tileAt(body.x, body.y - 2) === "fi" || tileAt(body.x, body.y + 2) === "fi";
}

function updateCrops(dt) {
  world.cropT = (world.cropT ?? 0) + dt;
  if (world.cropT < 1) return;
  world.cropT = 0;
  for (let y = 0; y < world.h; y++) {
    for (let x = 0; x < world.w; x++) {
      const spec = CROP_STAGE[world.tiles[y][x]];
      if (spec && Math.random() < 1 / spec.wait) setCell(world.tiles, x, y, spec.next);
      if (world.tiles[y][x] === "sa" && Math.random() < 1 / 16) {
        setCell(world.tiles, x, y, ".");
        tree(world.tiles, x, y + 1);
      }
      if (world.tiles[y][x] === "sc" && world.tiles[y - 1]?.[x] === "." && Math.random() < 1 / 14) {
        let height = 0;
        for (let yy = y; yy < world.h && world.tiles[yy][x] === "sc"; yy++) height += 1;
        if (height < 3) setCell(world.tiles, x, y - 1, "sc");
      }
      if (world.tiles[y][x] === "fi") {
        if (Math.random() < 0.18) setCell(world.tiles, x, y, ".");
        else if (Math.random() < 0.08) {
          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, -1],
          ]) {
            if (world.tiles[y + dy]?.[x + dx] !== ".") continue;
            const below = world.tiles[y + dy + 1]?.[x + dx];
            if (below && isSolid(below)) {
              setCell(world.tiles, x + dx, y + dy, "fi");
              break;
            }
          }
        }
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
  const box = world.portalBox;
  if (!box) return;
  const x = Math.floor(player.x / TILE);
  const y = Math.floor((player.y - 8) / TILE);
  if (x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1) {
    const spawn = currentLevel().spawn ?? [3.5, 10];
    player.x = TILE * spawn[0];
    player.y = TILE * spawn[1];
    world.portalCd = 4;
    stats.portal = true;
    say("穿过了传送门。");
    checkQuest();
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
  const id = selectedItem()?.id;
  return Boolean(SWORDS[id] && selectedItem()?.count > 0);
}

function steveFrame() {
  if (player.anim === "idle") return `steve-sprites/${player.frame === 0 ? "idle-a" : "idle-b"}.svg`;
  if (player.anim === "run") return `steve-sprites/run-${player.frame}.svg`;
  if (player.anim === "jump") return `steve-sprites/${["jump-crouch", "jump-rise", "jump-apex", "jump-fall", "jump-land"][player.frame]}.svg`;
  if (player.anim === "swing") return `steve-sprites/swing-${player.frame}.svg`;
  if (player.anim === "hurt") return `steve-sprites/hurt-${player.frame}.svg`;
  if (player.anim === "sleep") return `steve-sprites/sleep-${player.frame}.svg`;
  if (player.anim === "eat") return `steve-sprites/eat-${player.frame}.svg`;
  return `steve-sprites/death-${player.frame}.svg`;
}

function deathFrames(kind) {
  return kind === "pig" || kind === "cow" || kind === "chicken" || kind === "sheep" || kind === "slime" ? 8 : 12;
}

function mobGone(mob) {
  const t = mob.deathT ?? 0;
  if (mob.kind === "creeper" && mob.exploded) return t > 0.28;
  return t > deathFrames(mob.kind) / 10 + 0.08;
}

function mobSprite(mob) {
  const prefix = mob.kind === "sheep" && mob.sheared ? `${mob.sheet}/shorn-` : `${mob.sheet}/`;
  if (mob.dead) {
    if (mob.kind === "creeper" && mob.exploded) return "creeper-sprites/swell-18.svg";
    const n = deathFrames(mob.kind);
    return `${prefix}death-${Math.min(n - 1, Math.floor((mob.deathT ?? 0) * 10))}.svg`;
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
    return `${prefix}hurt-${frame}.svg`;
  }
  if (mob.passive && Math.abs(mob.vx) < 14 && mob.hurtFlee <= 0) {
    const frame = Math.floor(mob.age * (mob.stillT > 4 ? 4 : 6)) % 8;
    const clip = mob.stillT > 4 && mob.kind !== "slime" ? "rest" : "idle";
    return `${mob.sheet}/${clip}-${frame}.svg`;
  }
  if (Math.abs(mob.vx) < 14 && (mob.fuse ?? 0) <= 0.12) {
    if (mob.kind === "skeleton") return "skeleton-sprites/draw-0.svg";
    return `${prefix}idle-${Math.floor(mob.age * 6) % 8}.svg`;
  }
  return `${prefix}walk-${(Math.floor(mob.age * 10) % 8) * 2}.svg`;
}

function isRaining() {
  return dimension === "overworld" && ((clock >= 11 && clock < 15) || (clock >= 20 && clock < 23));
}

function drawSky() {
  const night = isNight();
  const dusk = clock >= 17 && clock < 19 ? (clock - 17) / 2 : clock >= 5 && clock < 7 ? 1 - (clock - 5) / 2 : night ? 1 : 0;
  const rain = isRaining();
  const g = ctx.createLinearGradient(0, 0, 0, viewH);
  if (dimension === "nether") {
    g.addColorStop(0, "#4a1810");
    g.addColorStop(0.55, "#6a2414");
    g.addColorStop(1, "#2a1008");
  } else if (dimension === "end") {
    g.addColorStop(0, "#1a0828");
    g.addColorStop(0.55, "#2a1040");
    g.addColorStop(1, "#0c0618");
  } else {
    g.addColorStop(0, mixHex(rain ? "#6a8aaa" : "#8ec5ff", "#0b1630", dusk));
    g.addColorStop(0.55, mixHex(rain ? "#8aa3b8" : "#c7e4ff", "#1a2744", dusk));
    g.addColorStop(1, mixHex(rain ? "#c5d4b0" : "#e7f4c8", "#1c2a18", dusk));
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, viewW, viewH);
}

function drawClouds() {
  if (dimension !== "overworld") return;
  const night = isNight();
  const dusk = clock >= 17 && clock < 19 ? (clock - 17) / 2 : clock >= 5 && clock < 7 ? 1 - (clock - 5) / 2 : night ? 1 : 0;
  ctx.save();
  ctx.globalAlpha = 0.88 - dusk * 0.25;
  ctx.fillStyle = mixHex("#f7fbff", "#8b93b0", dusk);
  const drift = time * 14 + cam.x * 0.22;
  const puffs = [
    { x: 80, y: 42, w: 160, h: 26 },
    { x: 320, y: 70, w: 110, h: 22 },
    { x: 540, y: 36, w: 180, h: 28 },
    { x: 780, y: 88, w: 96, h: 20 },
    { x: 980, y: 54, w: 140, h: 24 },
  ];
  const span = viewW + 280;
  for (const puff of puffs) {
    let x = ((puff.x - drift) % span + span) % span - 120;
    ctx.fillRect(x, puff.y, puff.w, puff.h);
    ctx.fillRect(x + 22, puff.y - 14, puff.w * 0.58, 16);
    ctx.fillRect(x + puff.w * 0.42, puff.y + puff.h - 8, puff.w * 0.4, 14);
  }
  ctx.restore();
}

function drawRain() {
  if (!isRaining()) return;
  ctx.save();
  ctx.strokeStyle = "rgba(190, 214, 240, 0.55)";
  ctx.lineWidth = 1;
  const seed = Math.floor(time * 70);
  for (let i = 0; i < 80; i++) {
    const x = (i * 97 + seed * 13) % viewW;
    const y = (i * 53 + seed * 17) % viewH;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3, y + 16);
    ctx.stroke();
  }
  ctx.restore();
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
      else if (t === "fi") drawTile(Math.floor(time * 10) % 2 ? "blocks/fire-1.svg" : "blocks/fire.svg", dx, dy);
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
      const job = player?.mining;
      if (job && job.x === x && job.y === y && job.need > 0) {
        const p = Math.max(0, Math.min(1, job.t / job.need));
        if (p >= 0.05) drawTile(`blocks/destroy-${Math.min(9, Math.floor(p * 10))}.svg`, dx, dy);
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

function drawLeads() {
  ctx.save();
  ctx.strokeStyle = "#c6a15b";
  ctx.lineWidth = 2;
  for (const mob of mobs) {
    if (!mob.leashed || mob.dead) continue;
    ctx.beginPath();
    ctx.moveTo(viewX(player.x), viewY(player.y - 24));
    ctx.lineTo(viewX(mob.x), viewY(mob.y - mob.hh * 0.45));
    ctx.stroke();
  }
  ctx.restore();
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
    player.anim === "sleep";
  drawAnchored(steveFrame(), combat ? STEVE.combat : STEVE.loco, viewX(player.x), viewY(player.y), player.face);
  if (!combat && player.armorMat) {
    const rel =
      player.anim === "run"
        ? `steve-sprites/armor-${player.armorMat}-run-${player.frame}.svg`
        : `steve-sprites/armor-${player.armorMat}.svg`;
    drawAnchored(rel, STEVE.loco, viewX(player.x), viewY(player.y), player.face);
  }
  ctx.globalAlpha = 1;
  drawHeldItem();
}

function drawHeldItem() {
  const combat = player.anim === "swing" || player.anim === "hurt" || player.anim === "death" || player.anim === "sleep";
  if (hasShield() && !player.dead && !combat && player.anim !== "eat") {
    const rel = player.shieldHeld
      ? "steve-sprites/shield-block.svg"
      : player.anim === "run"
        ? `steve-sprites/shield-hold-run-${player.frame}.svg`
        : "steve-sprites/shield-hold.svg";
    drawAnchored(rel, STEVE.loco, viewX(player.x), viewY(player.y), player.face);
  }
  const id = heldOverlayId();
  if (!id || id === "shield") return;
  let rel = itemAsset(id);
  if (id === "bow" && player.drawT > 0) {
    const frame = player.drawT < 0.4 ? 0 : player.drawT < 0.75 ? 1 : 2;
    rel = `items/bow-pulling-${frame}.svg`;
  }
  const pic = img(rel);
  if (!pic) return;
  const swing = player.swingT > 0 && player.swingKind === "tool";
  const ranged = id === "bow" || id === "crossbow";
  const drawing = ranged && player.drawT > 0;
  let rot = ranged ? -0.15 : 0.35;
  if (swing) rot = -1.15 * Math.sin((1 - player.swingT / (10 / 12)) * Math.PI);
  if (drawing) rot = -0.4 - player.drawT * 0.5;
  ctx.save();
  ctx.translate(viewX(player.x), viewY(player.y));
  ctx.scale(player.face, 1);
  ctx.translate(ranged ? 10 : 12, ranged ? -26 : -22);
  ctx.rotate(rot);
  const size = ranged ? 36 : 30;
  ctx.drawImage(pic, -size * 0.2, -size * 0.85, size, size);
  if (drawing && id === "bow") {
    const arrow = img("items/arrow.svg");
    if (arrow) ctx.drawImage(arrow, 8, -18, 22, 8);
  }
  ctx.restore();
}

function drawHearts(x, y, value, full, half, empty, flash = false) {
  const on = flash && player.hurtT > 0;
  for (let i = 0; i < 10; i++) {
    const v = value - i * 2;
    const rel = v >= 2 ? (on ? "hud/heart-flash.svg" : full) : v === 1 ? half : empty;
    drawImage(rel, x + i * 18, y, 16, 16);
  }
}

function drawBubbles(x, y) {
  if (!player) return;
  if (!player.inWater && player.air >= AIR_MAX - 0.05) return;
  const filled = Math.max(0, Math.min(10, Math.ceil((player.air / AIR_MAX) * 10 - 1e-9)));
  for (let i = 0; i < 10; i++) {
    const bob = player.inWater ? Math.sin(time * 4 + i * 0.7) * 1.2 : 0;
    let rel = "hud/bubble-empty.svg";
    if (i < filled) rel = "hud/bubble.svg";
    else if (i === filled && player.popT > 0) rel = "hud/bubble-pop.svg";
    drawImage(rel, x + i * 18, y + bob, 16, 16);
  }
}

function actionProgress() {
  if (!player) return null;
  if (player.mining?.need) return Math.max(0, Math.min(1, player.mining.t / player.mining.need));
  if (player.smelt) return Math.max(0, Math.min(1, player.smelt.t / player.smelt.need));
  if ((player.fishT ?? 0) > 0 && player.fishNeed) return Math.max(0, Math.min(1, 1 - player.fishT / player.fishNeed));
  if (player.bowDraw) return player.bowT;
  return null;
}

function drawActionProgress(x, y, w) {
  const t = actionProgress();
  if (t == null) return;
  const h = 22;
  const pic = img("hud/progress-bar.svg");
  if (!pic) return;
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.drawImage(pic, Math.round(x), Math.round(y), Math.round(w), h);
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.rect(Math.round(x), Math.round(y), Math.round(w * t), h);
  ctx.clip();
  ctx.drawImage(pic, Math.round(x), Math.round(y), Math.round(w), h);
  ctx.restore();
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

function drawDurabilityBar(it, x, y, w) {
  const max = TOOL_DUR[it?.id];
  if (!max || it.dur == null || it.dur >= max) return;
  const t = Math.max(0, it.dur / max);
  const barW = Math.max(8, w - 4);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x + 2, y + w - 5, barW, 3);
  ctx.fillStyle = t > 0.45 ? "#6ce05c" : t > 0.2 ? "#e0d14a" : "#e05c5c";
  ctx.fillRect(x + 2, y + w - 5, Math.max(1, Math.round(barW * t)), 3);
}

function drawItemSlot(it, x, y, size = 32, picked = false) {
  ctx.fillStyle = picked ? "rgba(70, 90, 48, 0.95)" : "rgba(18, 16, 14, 0.95)";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = picked ? "#c6e56b" : "#6b5a3a";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  if (it && it.count > 0) {
    drawImage(itemAsset(it.id), x + 2, y + 2, size - 4, size - 4);
    drawDurabilityBar(it, x, y, size);
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
  const w = Math.min(400, viewW - 24);
  const h = Math.min(430, viewH - 12);
  return { x: (viewW - w) / 2, y: Math.max(6, (viewH - h) / 2 - 8), w, h };
}

function packPanelBox() {
  const w = Math.min(400, viewW - 24);
  const h = Math.min(220, viewH - 24);
  return { x: (viewW - w) / 2, y: Math.max(24, (viewH - h) / 2), w, h };
}

function playerGridIndex(row, col) {
  if (row === 2) return col;
  return HOTBAR_SLOTS + row * 9 + col;
}

function chestLayout() {
  const box = chestPanelBox();
  const originX = box.x + 18;
  const gap = 36;
  const chestY = box.y + 56;
  const packY = chestY + 3 * gap + 22;
  return { box, originX, gap, chestY, packY };
}

function chestSlotAt(mx, my) {
  const { originX, gap, chestY, packY } = chestLayout();
  if (my >= chestY && my < chestY + 3 * gap) {
    const col = Math.floor((mx - originX) / gap);
    const row = Math.floor((my - chestY) / gap);
    if (col >= 0 && col < 9 && row >= 0 && row < 3) return { kind: "chest", index: row * 9 + col };
  }
  if (my >= packY && my < packY + 3 * gap) {
    const col = Math.floor((mx - originX) / gap);
    const row = Math.floor((my - packY) / gap);
    if (col >= 0 && col < 9 && row >= 0 && row < 3) return { kind: "player", index: playerGridIndex(row, col) };
  }
  return null;
}

function packSlotAt(mx, my) {
  const box = packPanelBox();
  const originX = box.x + 18;
  const gap = 36;
  const packY = box.y + 56;
  if (my >= packY && my < packY + 3 * gap) {
    const col = Math.floor((mx - originX) / gap);
    const row = Math.floor((my - packY) / gap);
    if (col >= 0 && col < 9 && row >= 0 && row < 3) return playerGridIndex(row, col);
  }
  return -1;
}

function clickChestSlot(hit) {
  if (!hit) return;
  const bag = activeChestItems();
  if (hit.kind === "chest") {
    if (transferStack(chestItems, hit.index, player.items, PLAYER_SLOTS)) say("取出了物品。");
    else if (chestItems[hit.index]?.count > 0) say("背包满了。");
  } else if (transferStack(player.items, hit.index, chestItems, CHEST_SLOTS)) {
    say("放进了箱子。");
    checkChestWin();
  } else if (player.items[hit.index]?.count > 0) say("箱子满了。");
}

function clickPackSlot(index) {
  if (index < 0) return;
  const a = player.items[index];
  if (packPick < 0) {
    if (!a || a.count <= 0) return;
    packPick = index;
    return;
  }
  if (packPick === index) {
    packPick = -1;
    return;
  }
  const b = player.items[index];
  player.items[packPick] = b;
  player.items[index] = a;
  packPick = -1;
}

function drawPlayerGrid(originX, packY, gap) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      const index = playerGridIndex(row, col);
      drawItemSlot(player.items[index], originX + col * gap, packY + row * gap, 32, packPick === index);
    }
  }
}

function drawChestPanel() {
  const { box, originX, gap, chestY, packY } = chestLayout();
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
  ctx.fillText(chestKind === "ender" ? "末影箱" : "箱子", box.x + 18, box.y + 32);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#ddd";
  ctx.fillText("点击箱子取出  ·  点击背包存入  ·  Esc 关闭", box.x + 18, box.y + 50);

  for (let i = 0; i < CHEST_SLOTS; i++) {
    const col = i % 9;
    const row = Math.floor(i / 9);
    drawItemSlot(chestItems[i], originX + col * gap, chestY + row * gap, 32);
  }

  ctx.fillStyle = "#ffe566";
  ctx.font = "14px sans-serif";
  ctx.fillText("背包", originX, packY - 8);
  drawPlayerGrid(originX, packY, gap);
}

function drawPackPanel() {
  const box = packPanelBox();
  const originX = box.x + 18;
  const gap = 36;
  const packY = box.y + 56;
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
  ctx.fillText("背包", box.x + 18, box.y + 32);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#ddd";
  ctx.fillText("上两排是背包，底下一排是快捷栏  ·  点击两格交换  ·  Esc 关闭", box.x + 18, box.y + 50);
  drawPlayerGrid(originX, packY, gap);
}

function furnacePanelBox() {
  const w = Math.min(420, viewW - 32);
  const h = Math.min(260, viewH - 140);
  return { x: (viewW - w) / 2, y: 72, w, h };
}

function furnaceSlotAt(mx, my) {
  const box = furnacePanelBox();
  const originX = box.x + 18;
  const gap = 38;
  const top = box.y + 88;
  const barY = box.y + box.h - 58;
  const slots = [
    { kind: "furnace", index: 0, x: originX + 24, y: top },
    { kind: "furnace", index: 1, x: originX + 24, y: top + 52 },
    { kind: "furnace", index: 2, x: originX + 140, y: top + 26 },
  ];
  for (const slot of slots) {
    if (mx >= slot.x && mx < slot.x + 34 && my >= slot.y && my < slot.y + 34) return slot;
  }
  if (my >= barY && my < barY + 36) {
    const col = Math.floor((mx - originX) / gap);
    if (col >= 0 && col < 9) return { kind: "hotbar", index: col };
  }
  return null;
}

function clickFurnaceSlot(hit) {
  if (!hit) return;
  if (hit.kind === "furnace") {
    if (transferStack(furnace.slots, hit.index, player.items, 9)) say("取出了物品。");
    else if (furnace.slots[hit.index]?.count > 0) say("快捷栏满了。");
    return;
  }
  const src = player.items[hit.index];
  if (!src || src.count <= 0) return;
  const dest = SMELT[src.id] ? 0 : FURNACE_FUEL[src.id] ? 1 : -1;
  if (dest < 0) {
    say("这不能放进熔炉。");
    return;
  }
  const slot = furnace.slots[dest];
  if (slot.count > 0 && slot.id !== src.id) {
    say("这一格放不下。");
    return;
  }
  if (!slot.id) slot.id = src.id;
  slot.count += src.count;
  src.count = 0;
  src.id = "";
  say(dest === 0 ? "放进了原料。" : "加了燃料。");
}

function drawFurnacePanel() {
  const box = furnacePanelBox();
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
  ctx.fillText("熔炉", box.x + 18, box.y + 32);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#ddd";
  ctx.fillText("矿石/生肉/沙子/粘土/原木放上面，煤炭或木炭放下面  ·  Esc 关闭", box.x + 18, box.y + 52);

  const originX = box.x + 18;
  const top = box.y + 88;
  ctx.fillStyle = "#aaa";
  ctx.font = "12px sans-serif";
  ctx.fillText("原料", originX + 24, top - 6);
  ctx.fillText("燃料", originX + 24, top + 46);
  ctx.fillText("产物", originX + 140, top + 20);
  drawItemSlot(furnace.slots[0], originX + 24, top, 34);
  drawItemSlot(furnace.slots[1], originX + 24, top + 52, 34);
  drawItemSlot(furnace.slots[2], originX + 140, top + 26, 34);

  const cookW = 72;
  const cookX = originX + 64;
  const cookY = top + 36;
  ctx.fillStyle = "#2a241c";
  ctx.fillRect(cookX, cookY, cookW, 8);
  ctx.fillStyle = furnace.burn > 0 ? "#ffb347" : "#555";
  ctx.fillRect(cookX, cookY, cookW * Math.min(1, furnace.cook / COOK_TIME), 8);
  ctx.fillStyle = "#ffe566";
  ctx.font = "14px sans-serif";
  ctx.fillText("快捷栏", originX, box.y + box.h - 68);
  const barY = box.y + box.h - 58;
  for (let i = 0; i < 9; i++) drawItemSlot(player.items[i], originX + i * 38, barY, 34);
}

function clickBrewSlot(hit) {
  if (!hit) return;
  if (hit.kind === "furnace") {
    if (transferStack(brew.slots, hit.index, player.items, 9)) say("取出了物品。");
    else if (brew.slots[hit.index]?.count > 0) say("快捷栏满了。");
    return;
  }
  const src = player.items[hit.index];
  if (!src || src.count <= 0) return;
  const dest = src.id === "glass-bottle" ? 0 : BREW[src.id] ? 1 : -1;
  if (dest < 0) {
    say("这不能放进酿造台。");
    return;
  }
  const slot = brew.slots[dest];
  if (slot.count > 0 && slot.id !== src.id) {
    say("这一格放不下。");
    return;
  }
  if (!slot.id) slot.id = src.id;
  slot.count += src.count;
  src.count = 0;
  src.id = "";
  say(dest === 0 ? "放进了玻璃瓶。" : "加了材料。");
}

function drawBrewPanel() {
  const box = furnacePanelBox();
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
  ctx.fillText("酿造台", box.x + 18, box.y + 32);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#ddd";
  ctx.fillText("玻璃瓶放上面，烈焰粉/下界疣/恶魂之泪放下面  ·  Esc 关闭", box.x + 18, box.y + 52);

  const originX = box.x + 18;
  const top = box.y + 88;
  ctx.fillStyle = "#aaa";
  ctx.font = "12px sans-serif";
  ctx.fillText("瓶子", originX + 24, top - 6);
  ctx.fillText("材料", originX + 24, top + 46);
  ctx.fillText("产物", originX + 140, top + 20);
  drawItemSlot(brew.slots[0], originX + 24, top, 34);
  drawItemSlot(brew.slots[1], originX + 24, top + 52, 34);
  drawItemSlot(brew.slots[2], originX + 140, top + 26, 34);

  const cookW = 72;
  const cookX = originX + 64;
  const cookY = top + 36;
  ctx.fillStyle = "#2a241c";
  ctx.fillRect(cookX, cookY, cookW, 8);
  ctx.fillStyle = "#7ad7ff";
  ctx.fillRect(cookX, cookY, cookW * Math.min(1, (brew.cook ?? 0) / 3), 8);
  ctx.fillStyle = "#ffe566";
  ctx.font = "14px sans-serif";
  ctx.fillText("快捷栏", originX, box.y + box.h - 68);
  const barY = box.y + box.h - 58;
  for (let i = 0; i < 9; i++) drawItemSlot(player.items[i], originX + i * 38, barY, 34);
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
  if (player.inWater) {
    const filled = Math.max(0, Math.min(10, Math.ceil((player.air / 12) * 10)));
    for (let i = 0; i < 10; i++) {
      drawImage(i < filled ? "hud/bubble.svg" : "hud/bubble-empty.svg", barX + 8 + i * 18, barY - 48, 16, 16);
    }
  } else if (player.armor > 0) {
    drawHearts(barX + 8, barY - 48, player.armor, "hud/armor-full.svg", "hud/armor-half.svg", "hud/armor-empty.svg");
  }
  drawBubbles(barX + barW - 8 - 180, player.armor > 0 ? barY - 68 : barY - 48);

  drawImage("hud/xp-bar.svg", barX, barY - 8, barW, 28);
  const need = xpNeed(player.level ?? 0);
  const progress = need > 0 ? Math.min(1, (player.xp ?? 0) / need) : 0;
  ctx.fillStyle = "#7cf37c";
  ctx.fillRect(barX + 28, barY + 4, (barW - 56) * progress, 6);
  ctx.fillStyle = "#16380f";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(player.level ?? 0), viewW / 2, barY + 11);

  drawImage("hud/hotbar.svg", barX, barY + 10, barW, 72);
  const slot = 36;
  const origin = barX + 22;
  const offX = origin - 50;
  const offY = barY + 26;
  drawImage("hud/hotbar-slot.svg", offX - 4, barY + 22, 36, 36);
  const off = player.offhand;
  if (off && off.count > 0) drawImage(itemAsset(off.id), offX, offY, 28, 28);
  if (off && off.count > 1) {
    ctx.fillStyle = "#111";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(off.count), offX + 29, offY + 29);
    ctx.fillStyle = "#fff";
    ctx.fillText(String(off.count), offX + 28, offY + 28);
  }
  for (let i = 0; i < 9; i++) {
    const it = player.items[i];
    const sx = origin + i * 38;
    const sy = barY + 26;
    if (it && it.count > 0) {
      const id =
        i === player.selected && player.bowDraw && it.id === "bow" ? bowIcon(player.bowT) : it.id;
      drawImage(itemAsset(id), sx, sy, 28, 28);
      drawDurabilityBar(it, sx, sy, 28);
    }
    if (it && it.count > 1) {
      ctx.fillStyle = "#111";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(it.count), sx + 29, sy + 29);
      ctx.fillStyle = "#fff";
      ctx.fillText(String(it.count), sx + 28, sy + 28);
    }
  }
  if (player.selected === OFFHAND_SLOT) drawImage("hud/selected-slot.svg", offX - 8, barY + 18, slot + 8, slot + 8);
  else drawImage("hud/selected-slot.svg", origin + player.selected * 38 - 8, barY + 18, slot + 8, slot + 8);

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

  drawActionProgress(barX, barY - 78, barW);
  drawImage("hud/crosshair.svg", viewW / 2 - 10, viewH / 2 - 10, 20, 20);

  ctx.textAlign = "left";
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(`${currentLevel().subtitle} ${currentLevel().title}   ${questHud()}   ${hourLabel()}   ${player.level ?? 0} 级${player.powerT > 0 ? "   附魔" : ""}${player.sprinting ? "   冲刺" : ""}`, 16, 28);
  if (craftingOpen) drawCraftPanel();
  if (chestOpen) drawChestPanel();
  if (packOpen && !chestOpen) drawPackPanel();
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
    const title = player.dead && !win ? "你死了" : win === "campaign" ? "全部通关" : "关卡完成";
    const hint =
      player.dead && !win
        ? "按 R 重生（世界还在）"
        : win === "campaign"
          ? "按 R 回选关"
          : "按 N 下一关 · 按 R 重玩本关";
    ctx.fillStyle = win ? "#ffe566" : "#ff6b6b";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText(title, viewW / 2, viewH / 2 - 10);
    ctx.fillStyle = "#fff";
    ctx.font = "18px sans-serif";
    ctx.fillText(hint, viewW / 2, viewH / 2 + 28);
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
    drawClouds();
    if (world) {
      drawWorld();
      drawRain();
      drawDrops();
      drawArrows();
      drawMobs();
      drawLeads();
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
  KeyI: "i",
  KeyE: "e",
  KeyN: "n",
  KeyR: "r",
  Space: " ",
  ArrowLeft: "arrowleft",
  ArrowRight: "arrowright",
  ArrowUp: "arrowup",
  ArrowDown: "arrowdown",
  Escape: "escape",
  KeyQ: "q",
  KeyC: "c",
  ShiftLeft: "shift",
  ShiftRight: "shift",
  ControlLeft: "control",
  ControlRight: "control",
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
  if (packOpen && !chestOpen && mode === "play") {
    if (key === "escape" || key === "q" || key === "e" || key === "i") {
      packOpen = false;
      packPick = -1;
      say("关上了背包。");
      return true;
    }
    return ["w", "s", "arrowup", "arrowdown", "a", "d", "arrowleft", "arrowright", " "].includes(key);
  }
  if (chestOpen && mode === "play") {
    if (key === "escape" || key === "q" || key === "e" || key === "j" || key === "i") {
      chestOpen = false;
      say("关上了箱子。");
      return true;
    }
    return ["w", "s", "arrowup", "arrowdown", "a", "d", "arrowleft", "arrowright", " "].includes(key);
  }
  if (furnaceOpen && mode === "play") {
    if (key === "escape" || key === "q" || key === "e" || key === "j") {
      furnaceOpen = false;
      say("关上了熔炉。");
      return true;
    }
    return ["w", "s", "arrowup", "arrowdown", "a", "d", "arrowleft", "arrowright", " "].includes(key);
  }
  if (brewOpen && mode === "play") {
    if (key === "escape" || key === "q" || key === "e" || key === "j") {
      brewOpen = false;
      say("关上了酿造台。");
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

function startGame(asDemo = false, index) {
  if (asDemo) startLevel(OVERWORLD_INDEX, true);
  else startLevel(index == null ? 0 : index, false);
  mode = "play";
  overlay.hidden = true;
  document.getElementById("hud-layer").hidden = false;
  startBtn.blur();
  demoBtn.blur();
  canvas.focus();
  if (asDemo) say("自动演示：向东走、跳跃、挥剑。", 3);
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
    if (n >= 1 && n <= 9 && player) {
      player.selected = n - 1;
      player.lastHotbar = n - 1;
    } else if (n === 0 && player) player.selected = OFFHAND_SLOT;
  } else if (key >= "1" && key <= "9" && player) {
    player.selected = Number(key) - 1;
    player.lastHotbar = player.selected;
  } else if (key === "0" && player) {
    player.selected = OFFHAND_SLOT;
  }
  if ((key === "j" || key === "e") && !e.repeat) useSelected();
  if (key === "i" && mode === "play" && !e.repeat) togglePack();
  if (key === "q" && mode === "play" && !menusOpen()) throwSelected();
  if (key === "n" && mode === "play" && win === "stage") {
    nextLevel();
    return;
  }
  if (key === "r" && mode === "play") {
    if (player?.dead && !win) respawnPlayer();
    else if (win === "campaign") showMenu();
    else startLevel(levelIndex, Boolean(demo));
  }
});

window.addEventListener("keyup", (e) => {
  const key = bindKey(e);
  keys.delete(key);
  if (key === "j") releaseUse();
});

window.addEventListener("blur", () => {
  keys.clear();
  if (hold.use) {
    hold.use = false;
    releaseUse();
  }
});

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
  if (packOpen) {
    const pos = canvasPos(e);
    const index = packSlotAt(pos.x, pos.y);
    if (index >= 0) clickPackSlot(index);
    else {
      const box = packPanelBox();
      if (pos.x < box.x || pos.x > box.x + box.w || pos.y < box.y || pos.y > box.y + box.h) {
        packOpen = false;
        packPick = -1;
        say("关上了背包。");
      }
    }
    return;
  }
  hold.use = true;
  useSelected();
});

window.addEventListener("mouseup", () => {
  if (!hold.use) return;
  hold.use = false;
  releaseUse();
});

window.addEventListener("resize", resize);

for (const btn of document.querySelectorAll("#touch button")) {
  const press = (on) => {
    const dir = btn.dataset.dir;
    const act = btn.dataset.act;
    if (dir) hold[dir] = on;
    if (act === "jump") hold.jump = on;
    if (act === "use") {
      hold.use = on;
      if (on) useSelected();
      else releaseUse();
    }
    if (act === "drop" && on) throwSelected();
  };
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    press(true);
  });
  btn.addEventListener("pointerup", () => press(false));
  btn.addEventListener("pointerleave", () => press(false));
}

  startBtn.addEventListener("click", () => startGame(false, 0));
  demoBtn.addEventListener("click", () => startGame(true, OVERWORLD_INDEX));

resize();
requestAnimationFrame(frame);

loadAll()
  .then(() => {
    loadStatus.textContent = "素材已就绪。";
    startBtn.disabled = false;
    demoBtn.disabled = false;
    const boot = new URLSearchParams(location.search);
    fillLevelList();
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
