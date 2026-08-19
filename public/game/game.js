import {
  CHEST_SLOTS,
  COOK_TIME,
  FURNACE_FUEL,
  HOE_IDS,
  RECIPES,
  SMELT,
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
const FEED = { pig: "carrot", cow: "wheat", chicken: "wheat-seeds", sheep: "wheat", wolf: "bone", rabbit: "carrot" };
const WHEAT_STAGE = {
  0: { next: "1", wait: 5 },
  1: { next: "2", wait: 5 },
  2: { next: "3", wait: 5 },
  3: { next: "4", wait: 5 },
  4: { next: "5", wait: 6 },
  5: { next: "6", wait: 6 },
  6: { next: "7", wait: 6 },
};
const MINEABLE = {
  s: { drop: "cobblestone", tool: "pickaxe" },
  c: { drop: "cobblestone", tool: "pickaxe" },
  x: { drop: "coal", tool: "pickaxe" },
  i: { drop: "diamond", tool: "pickaxe" },
  H: { drop: "iron-ore", tool: "pickaxe" },
  R: { drop: "gold-ore", tool: "pickaxe" },
  J: { drop: "copper-ore", tool: "pickaxe" },
  K: { drop: "redstone-dust", tool: "pickaxe" },
  M: { drop: "lapis-ore", tool: "pickaxe" },
  O: { drop: "emerald", tool: "pickaxe" },
  Q: { drop: "granite", tool: "pickaxe" },
  8: { drop: "diorite", tool: "pickaxe" },
  X: { drop: "andesite", tool: "pickaxe" },
  A: { drop: "sandstone", tool: "pickaxe" },
  E: { drop: "stone-bricks", tool: "pickaxe" },
  b: { drop: "bricks", tool: "pickaxe" },
  m: { drop: "cobblestone", tool: "pickaxe" },
  d: { drop: "dirt" },
  a: { drop: "sand", tool: "shovel" },
  V: { drop: "gravel", tool: "shovel" },
  "~": { drop: "snowball", tool: "shovel" },
  q: { drop: "clay", tool: "shovel" },
  o: { drop: "oak-log", tool: "axe" },
  L: { drop: "oak-sapling" },
  G: { drop: "wheat-seeds" },
  S: { drop: "oak-sapling" },
  u: { drop: "pumpkin" },
  e: { drop: "melon-slice" },
  y: { drop: "wheat" },
  W: { drop: "white-wool" },
  p: { drop: "oak-planks" },
  j: { drop: "glass" },
  Y: { drop: "sugar-cane" },
  r: { drop: "wheat-seeds" },
  9: { drop: "wheat-seeds" },
  l: { drop: "lily-pad" },
  h: { drop: "ladder" },
  I: { drop: "ice" },
};
const PLACEABLE = {
  torch: "t",
  dirt: "d",
  cobblestone: "c",
  "oak-planks": "p",
  "crafting-table": "T",
  "oak-sapling": "S",
  tnt: "N",
  sand: "a",
  gravel: "V",
  glass: "j",
  bricks: "b",
  ladder: "h",
  chest: "C",
  furnace: "F",
  "white-wool": "W",
  "sugar-cane": "Y",
  sandstone: "A",
  "stone-bricks": "E",
  granite: "Q",
  diorite: "8",
  andesite: "X",
  snow: "~",
  clay: "q",
  ice: "I",
  "door-oak": "D",
  bed: "z",
};
const PICK_TOOLS = new Set(["diamond-pickaxe", "iron-pickaxe", "wooden-pickaxe"]);
const AXE_TOOLS = new Set(["diamond-axe", "iron-axe", "wooden-axe"]);
const SHOVEL_TOOLS = new Set(["wooden-shovel", "iron-shovel", "diamond-shovel"]);
const SWORD_IDS = new Set(["diamond-sword", "iron-sword", "wooden-sword"]);
const HELD_TOOLS = new Set([
  ...SWORD_IDS,
  "bow",
  "shield",
  "shears",
  "flint-and-steel",
  ...PICK_TOOLS,
  ...AXE_TOOLS,
  ...HOE_IDS,
  "wooden-shovel",
  "iron-shovel",
  "diamond-shovel",
]);

const ARMOR_GEAR = {
  "leather-helmet": { slot: "helmet", pts: 1, mat: "leather" },
  "leather-chestplate": { slot: "chest", pts: 3, mat: "leather" },
  "leather-leggings": { slot: "legs", pts: 2, mat: "leather" },
  "leather-boots": { slot: "boots", pts: 1, mat: "leather" },
  "iron-helmet": { slot: "helmet", pts: 2, mat: "iron" },
  "iron-chestplate": { slot: "chest", pts: 6, mat: "iron" },
  "iron-leggings": { slot: "legs", pts: 5, mat: "iron" },
  "iron-boots": { slot: "boots", pts: 2, mat: "iron" },
  "diamond-helmet": { slot: "helmet", pts: 3, mat: "diamond" },
  "diamond-chestplate": { slot: "chest", pts: 8, mat: "diamond" },
  "diamond-leggings": { slot: "legs", pts: 6, mat: "diamond" },
  "diamond-boots": { slot: "boots", pts: 3, mat: "diamond" },
  "gold-helmet": { slot: "helmet", pts: 2, mat: "gold" },
  "gold-chestplate": { slot: "chest", pts: 5, mat: "gold" },
  "gold-leggings": { slot: "legs", pts: 3, mat: "gold" },
  "gold-boots": { slot: "boots", pts: 1, mat: "gold" },
  "chainmail-helmet": { slot: "helmet", pts: 2, mat: "chainmail" },
  "chainmail-chestplate": { slot: "chest", pts: 5, mat: "chainmail" },
  "chainmail-leggings": { slot: "legs", pts: 4, mat: "chainmail" },
  "chainmail-boots": { slot: "boots", pts: 1, mat: "chainmail" },
};

const STEVE = {
  loco: { w: 256, h: 320, ax: 128, ay: 300, scale: 0.3 },
  combat: { w: 384, h: 336, ax: 168, ay: 308, scale: 0.3 },
};

const ITEM_LABELS = {
  "diamond-sword": "钻石剑",
  "diamond-pickaxe": "钻石镐",
  torch: "火把",
  bread: "面包",
  steak: "熟牛排",
  apple: "苹果",
  "golden-apple": "金苹果",
  "potion-heal": "治疗药水",
  diamond: "钻石",
  "iron-chestplate": "铁胸甲",
  "rotten-flesh": "腐肉",
  bone: "骨头",
  arrow: "箭",
  string: "线",
  gunpowder: "火药",
  "spider-eye": "蜘蛛眼",
  "ender-pearl": "末影珍珠",
  "cooked-porkchop": "熟猪排",
  "cooked-chicken": "熟鸡肉",
  carrot: "胡萝卜",
  wheat: "小麦",
  "wheat-seeds": "小麦种子",
  leather: "皮革",
  emerald: "绿宝石",
  saddle: "鞍",
  coal: "煤炭",
  cobblestone: "圆石",
  dirt: "泥土",
  pumpkin: "南瓜",
  "melon-slice": "西瓜片",
  "oak-log": "橡木原木",
  "oak-planks": "橡木木板",
  stick: "木棍",
  "crafting-table": "工作台",
  bow: "弓",
  "diamond-axe": "钻石斧",
  "diamond-hoe": "钻石锄",
  "wooden-hoe": "木锄",
  "iron-hoe": "铁锄",
  "wooden-sword": "木剑",
  "wooden-pickaxe": "木镐",
  "wooden-axe": "木斧",
  "wooden-shovel": "木铲",
  "iron-sword": "铁剑",
  "iron-pickaxe": "铁镐",
  "iron-axe": "铁斧",
  "iron-shovel": "铁铲",
  "diamond-shovel": "钻石铲",
  "water-bucket": "水桶",
  "lava-bucket": "熔岩桶",
  "raw-chicken": "生鸡肉",
  "raw-mutton": "生羊肉",
  "cooked-mutton": "熟羊肉",
  shears: "剪刀",
  "flint-and-steel": "打火石",
  shield: "盾",
  "leather-helmet": "皮革头盔",
  "leather-chestplate": "皮革胸甲",
  "leather-leggings": "皮革裤子",
  "leather-boots": "皮革靴子",
  "iron-helmet": "铁头盔",
  "iron-leggings": "铁护腿",
  "iron-boots": "铁靴子",
  "diamond-helmet": "钻石头盔",
  "diamond-leggings": "钻石护腿",
  "diamond-boots": "钻石靴子",
  feather: "羽毛",
  slimeball: "粘液球",
  "white-wool": "白色羊毛",
  tnt: "TNT",
  sand: "沙子",
  bucket: "桶",
  "iron-ingot": "铁锭",
  "gold-ingot": "金锭",
  "iron-ore": "铁矿石",
  "gold-ore": "金矿石",
  "oak-sapling": "橡树树苗",
  "raw-porkchop": "生猪排",
  "raw-beef": "生牛肉",
  "baked-potato": "烤马铃薯",
  potato: "马铃薯",
  sugar: "糖",
  egg: "鸡蛋",
  "pumpkin-pie": "南瓜派",
  "diamond-chestplate": "钻石胸甲",
  cookie: "曲奇",
  flint: "燧石",
  charcoal: "木炭",
  glass: "玻璃",
  gravel: "沙砾",
  clay: "粘土",
  ladder: "梯子",
  chest: "箱子",
  furnace: "熔炉",
  "door-oak": "橡木门",
  bed: "床",
  "sugar-cane": "甘蔗",
  "copper-ore": "铜矿石",
  "redstone-dust": "红石粉",
  "lapis-ore": "青金石矿",
  "emerald-ore": "绿宝石矿",
  sandstone: "砂岩",
  "stone-bricks": "石砖",
  granite: "花岗岩",
  diorite: "闪长岩",
  andesite: "安山岩",
  snow: "雪块",
  ice: "冰",
  snowball: "雪球",
  bricks: "砖块",
  "lily-pad": "睡莲",
  "gold-helmet": "金头盔",
  "gold-chestplate": "金胸甲",
  "gold-leggings": "金护腿",
  "gold-boots": "金靴子",
  "chainmail-helmet": "锁链头盔",
  "chainmail-chestplate": "锁链胸甲",
  "chainmail-leggings": "锁链护腿",
  "chainmail-boots": "锁链靴子",
};

const FOOD = {
  bread: { hunger: 5, health: 2 },
  steak: { hunger: 8, health: 4 },
  apple: { hunger: 4, health: 2 },
  "golden-apple": { hunger: 10, health: 10 },
  "potion-heal": { hunger: 0, health: 8 },
  "cooked-porkchop": { hunger: 8, health: 4 },
  "cooked-chicken": { hunger: 6, health: 3 },
  carrot: { hunger: 3, health: 1 },
  "rotten-flesh": { hunger: 4, health: -2 },
  "pumpkin-pie": { hunger: 8, health: 3 },
  "raw-porkchop": { hunger: 3, health: 1 },
  "raw-beef": { hunger: 3, health: 1 },
  "baked-potato": { hunger: 5, health: 2 },
  "raw-chicken": { hunger: 2, health: 0 },
  "raw-mutton": { hunger: 2, health: 0 },
  "cooked-mutton": { hunger: 6, health: 3 },
  "melon-slice": { hunger: 2, health: 1 },
  cookie: { hunger: 2, health: 1 },
  potato: { hunger: 1, health: 0 },
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
  1: "blocks/wheat-1.svg",
  2: "blocks/wheat-2.svg",
  3: "blocks/wheat-3.svg",
  4: "blocks/wheat-4.svg",
  5: "blocks/wheat-5.svg",
  6: "blocks/wheat-6.svg",
  7: "blocks/wheat-7.svg",
  V: "blocks/gravel.svg",
  A: "blocks/sandstone.svg",
  E: "blocks/stone-bricks.svg",
  J: "blocks/copper-ore.svg",
  K: "blocks/redstone-ore.svg",
  M: "blocks/lapis-ore.svg",
  O: "blocks/emerald-ore.svg",
  Q: "blocks/granite.svg",
  8: "blocks/diorite.svg",
  X: "blocks/andesite.svg",
  "~": "blocks/snow.svg",
  W: "blocks/white-wool.svg",
  9: "blocks/vine.svg",
  r: "blocks/red-mushroom.svg",
  l: "blocks/lily-pad.svg",
  Y: "blocks/sugar-cane.svg",
};

const SOLID = new Set("gdscpLabBTFimxIjuyenqHRNVAEKJMOQ8X~Wl".split(""));

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
let furnaceOpen = false;
let chestItems = emptySlots(CHEST_SLOTS);
let furnace = emptyFurnace();
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
  ...range(8, (i) => `wolf-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `wolf-sprites/idle-${i}.svg`),
  ...range(8, (i) => `wolf-sprites/rest-${i}.svg`),
  ...range(8, (i) => `wolf-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `wolf-sprites/death-${i}.svg`),
  ...range(8, (i) => `slime-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `slime-sprites/idle-${i}.svg`),
  ...range(8, (i) => `slime-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `slime-sprites/death-${i}.svg`),
  ...range(8, (i) => `rabbit-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `rabbit-sprites/idle-${i}.svg`),
  ...range(8, (i) => `rabbit-sprites/rest-${i}.svg`),
  ...range(8, (i) => `rabbit-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `rabbit-sprites/death-${i}.svg`),
  ...range(8, (i) => `villager-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `villager-sprites/idle-${i}.svg`),
  ...range(8, (i) => `villager-sprites/rest-${i}.svg`),
  ...range(8, (i) => `villager-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `villager-sprites/death-${i}.svg`),
  ...range(8, (i) => `sheep-sprites/shorn-walk-${i * 2}.svg`),
  ...range(8, (i) => `sheep-sprites/shorn-idle-${i}.svg`),
  ...range(8, (i) => `sheep-sprites/shorn-rest-${i}.svg`),
  ...range(8, (i) => `sheep-sprites/shorn-hurt-${i}.svg`),
  ...range(8, (i) => `sheep-sprites/shorn-death-${i}.svg`),
  ...Object.keys(ITEM_LABELS).map((id) => itemAsset(id)),
  "hud/heart.svg",
  "hud/heart-half.svg",
  "hud/heart-empty.svg",
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
  "hud/bubble.svg",
  "hud/bubble-empty.svg",
  "blocks/furnace-on.svg",
  "items/bow-pulling-0.svg",
  "items/bow-pulling-1.svg",
  "items/bow-pulling-2.svg",
  "steve-sprites/armor-leather.svg",
  "steve-sprites/armor-iron.svg",
  "steve-sprites/armor-diamond.svg",
  "steve-sprites/armor-gold.svg",
  "steve-sprites/armor-chainmail.svg",
  ...["leather", "iron", "diamond", "gold", "chainmail"].flatMap((kind) => range(8, (i) => `steve-sprites/armor-${kind}-run-${i}.svg`)),
  ...range(7, (i) => `blocks/fire-${i + 1}.svg`),
  "blocks/tnt-primed.svg",
  "items/xp-orb.svg",
  "blocks/chest-open.svg",
  "blocks/door-oak-open.svg",
  "blocks/door-oak-upper-open.svg",
  "items/shield.svg",
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

function tree(tiles, x, ground) {
  setCell(tiles, x, ground - 1, "o");
  setCell(tiles, x, ground - 2, "o");
  setCell(tiles, x, ground - 3, "o");
  for (let dy = 4; dy <= 6; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + (6 - dy) < 4) setCell(tiles, x + dx, ground - dy, "L");
    }
  }
}

function oreAt(x, y, ground) {
  if (y <= ground + 2) return "d";
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  const h = n - Math.floor(n);
  if (h < 0.04) return "x";
  if (h < 0.08) return "H";
  if (h < 0.11) return "R";
  if (h < 0.125) return "i";
  if (h < 0.145) return "J";
  if (h < 0.16) return "K";
  if (h < 0.17) return "M";
  if (h < 0.178) return "O";
  if (h < 0.22) return "Q";
  if (h < 0.26) return "8";
  if (h < 0.3) return "X";
  if (h < 0.34) return "V";
  return "s";
}

function buildWorld() {
  const W = 78;
  const H = 16;
  const tiles = Array.from({ length: H }, () => Array(W).fill("."));
  const ground = 10;

  for (let x = 0; x < W; x++) {
    setCell(tiles, x, H - 1, "B");
    for (let y = ground + 1; y < H - 1; y++) setCell(tiles, x, y, oreAt(x, y, ground));
    setCell(tiles, x, ground, "g");
  }

  fillRow(tiles, ground, 14, 17, ".");
  fillRow(tiles, ground + 1, 14, 17, "w");
  fillRow(tiles, ground + 2, 14, 17, "w");
  fillRow(tiles, ground + 3, 14, 17, "s");

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

  fillRow(tiles, ground, 2, 4, "n");
  setCell(tiles, 6, ground - 1, "u");
  setCell(tiles, 9, ground - 1, "u");
  setCell(tiles, 13, ground, "I");
  setCell(tiles, 18, ground, "I");
  setCell(tiles, 15, ground + 3, "q");
  setCell(tiles, 47, ground - 1, "e");
  setCell(tiles, 49, ground - 1, "u");
  setCell(tiles, 61, ground - 1, "y");
  setCell(tiles, 61, ground - 2, "y");

  setCell(tiles, 2, ground - 1, "0");
  setCell(tiles, 3, ground - 1, "3");
  setCell(tiles, 4, ground - 1, "7");

  setCell(tiles, 11, ground - 1, "f");
  setCell(tiles, 12, ground - 1, "G");
  setCell(tiles, 20, ground - 1, "P");
  setCell(tiles, 29, ground - 1, "k");
  setCell(tiles, 38, ground - 1, "k");
  for (const gx of [5, 10, 21, 24, 27, 39, 45, 51, 58, 73]) setCell(tiles, gx, ground - 1, "G");

  fillRow(tiles, ground, 28, 31, "a");
  setCell(tiles, 28, ground - 1, "Y");
  setCell(tiles, 28, ground - 2, "Y");
  setCell(tiles, 30, ground - 1, "Y");
  setCell(tiles, 16, ground - 1, "l");
  setCell(tiles, 8, ground - 4, "9");
  setCell(tiles, 48, ground - 4, "9");
  setCell(tiles, 25, ground - 1, "r");
  setCell(tiles, 72, ground, "~");
  setCell(tiles, 73, ground, "~");
  fillRow(tiles, ground - 1, 71, 73, "A");
  setCell(tiles, 74, ground - 1, "E");
  setCell(tiles, 69, ground - 1, "W");
  fillRow(tiles, ground + 3, 8, 11, "V");

  setCell(tiles, 19, ground + 3, "x");
  setCell(tiles, 21, ground + 4, "H");
  setCell(tiles, 23, ground + 3, "H");
  setCell(tiles, 36, ground + 3, "i");
  setCell(tiles, 37, ground + 4, "R");
  setCell(tiles, 39, ground + 3, "R");
  setCell(tiles, 52, ground + 4, "H");
  setCell(tiles, 54, ground + 3, "x");
  setCell(tiles, 55, ground + 4, "R");

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
  setCell(tiles, 68, ground - 1, "C");
  setCell(tiles, 66, ground - 1, "z");
  setCell(tiles, 67, ground - 1, "Z");
  setCell(tiles, 66, ground - 2, "t");
  setCell(tiles, 69, ground - 5, "t");
  setCell(tiles, 60, ground - 1, "N");

  fillRow(tiles, ground, 71, W - 1, "m");
  setCell(tiles, 0, ground, "B");
  setCell(tiles, W - 1, ground, "B");

  return { w: W, h: H, tiles, ground, nightSpawned: false, cropT: 0, doorOpen: new Set(), tntFuse: new Map(), fireT: new Map() };
}

function tileAt(px, py) {
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  if (y < 0 || y >= world.h || x < 0 || x >= world.w) return "B";
  return world.tiles[y][x];
}

function doorClosedAt(tx) {
  return world && !world.doorOpen.has(tx);
}

function tileIsSolid(t, tx) {
  if (t === "D" || t === "U") return doorClosedAt(tx);
  return SOLID.has(t);
}

function solidAt(px, py) {
  const t = tileAt(px, py);
  return tileIsSolid(t, Math.floor(px / TILE));
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
      if (tileIsSolid(t, tx)) return true;
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
  body.inWater = inWaterAt(body);
  body.inLava = mid === "v" || tileAt(body.x, body.y - 16) === "v";
  body.atChest = chest === "C" || tileAt(body.x + 16, body.y - 8) === "C" || tileAt(body.x - 16, body.y - 8) === "C";
  body.atTable = chest === "T" || tileAt(body.x + 16, body.y - 8) === "T" || tileAt(body.x - 16, body.y - 8) === "T";
  body.atFurnace = chest === "F" || tileAt(body.x + 16, body.y - 8) === "F" || tileAt(body.x - 16, body.y - 8) === "F";
  const bed = tileAt(body.x, body.y - 8);
  body.atBed = bed === "z" || bed === "Z" || tileAt(body.x + 16, body.y - 8) === "z" || tileAt(body.x - 16, body.y - 8) === "Z";
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
    armor: 0,
    armorMat: null,
    selected: 0,
    sleeping: 0,
    hungerT: 0,
    drawT: 0,
    bowHeld: false,
    shieldHeld: false,
    xp: 0,
    level: 0,
    swingKind: "sword",
    items: [
      { id: "diamond-sword", count: 1 },
      { id: "bow", count: 1 },
      { id: "arrow", count: 16 },
      { id: "diamond-pickaxe", count: 1 },
      { id: "diamond-axe", count: 1 },
      { id: "diamond-hoe", count: 1 },
      { id: "torch", count: 8 },
      { id: "wheat-seeds", count: 4 },
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
    chicken: { hp: 4, speed: 70, dmg: 0, hw: 8, hh: 18, scale: 0.14, sheet: "chicken-sprites", h: 480, passive: true },
    sheep: { hp: 6, speed: 52, dmg: 0, hw: 14, hh: 36, scale: 0.16, sheet: "sheep-sprites", h: 480, passive: true },
    wolf: { hp: 8, speed: 95, dmg: 2, hw: 12, hh: 28, scale: 0.16, sheet: "wolf-sprites", h: 480, passive: true },
    slime: { hp: 6, speed: 40, dmg: 2, hw: 16, hh: 22, scale: 0.14, sheet: "slime-sprites", h: 480 },
    rabbit: { hp: 3, speed: 88, dmg: 0, hw: 8, hh: 16, scale: 0.14, sheet: "rabbit-sprites", h: 480, passive: true },
    villager: { hp: 10, speed: 48, dmg: 0, hw: 10, hh: 50, scale: 0.17, sheet: "villager-sprites", h: 520, passive: true },
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
    sheared: false,
    angry: false,
  };
}

function spawnXp(x, y, n = 2) {
  for (let i = 0; i < n; i++) {
    drops.push({
      id: "xp-orb",
      x: x + (Math.random() - 0.5) * 18,
      y: y,
      vy: -140 - Math.random() * 80,
      count: 1,
      bob: Math.random() * Math.PI * 2,
      gone: false,
      xp: 4 + Math.floor(Math.random() * 5),
    });
  }
}

function addXp(amount) {
  player.xp += amount;
  while (player.xp >= 20) {
    player.xp -= 20;
    player.level += 1;
    player.health = Math.min(20, player.health + 2);
    say(`升级了！现在是 ${player.level} 级。`);
  }
}

function resetGame() {
  world = buildWorld();
  player = makePlayer();
  mobs = [
    makeMob("pig", 7, 10),
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
    makeMob("villager", 65, 10),
    makeMob("zombie", 50, 10),
  ];
  drops = [
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
    makeDrop("carrot", TILE * 8, TILE * 9, 4),
    makeDrop("bread", TILE * 4.5, TILE * 9, 2),
  ];
  particles = [];
  arrows = [];
  craftingOpen = false;
  chestOpen = false;
  furnaceOpen = false;
  chestItems = emptySlots(CHEST_SLOTS);
  furnace = emptyFurnace();
  craftScroll = 0;
  cam = { x: 0, y: 0 };
  time = 0;
  clock = 8;
  win = false;
  demo = null;
  hold.left = hold.right = hold.jump = hold.use = false;
  message = "向东走。剪羊毛、点火、举盾。锄地种田，熔炉烧矿，关门挡怪。把 5 颗钻石放进箱子。";
  messageT = 5;
}

function selectedItem() {
  return player.items[player.selected];
}

function throwSelected() {
  if (!player || player.dead || win || craftingOpen || chestOpen || furnaceOpen) return;
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
  if (ARMOR_GEAR[item.id]) refreshArmor();
  say(`扔掉了${ITEM_LABELS[item.id] ?? item.id}`);
}

function refreshArmor() {
  const worn = {};
  const mats = { leather: 0, iron: 0, gold: 0, chainmail: 0, diamond: 0 };
  let pts = 0;
  for (const it of player.items) {
    const gear = ARMOR_GEAR[it.id];
    if (!gear || it.count <= 0 || worn[gear.slot]) continue;
    worn[gear.slot] = gear;
    pts += gear.pts;
    mats[gear.mat] += 1;
  }
  player.armor = Math.min(20, pts);
  player.armorMat = mats.diamond
    ? "diamond"
    : mats.iron
      ? "iron"
      : mats.gold
        ? "gold"
        : mats.chainmail
          ? "chainmail"
          : mats.leather
            ? "leather"
            : null;
}

function addItem(id, count) {
  if (!tryAddItem(player.items, id, count)) return false;
  if (ARMOR_GEAR[id]) refreshArmor();
  return true;
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

function uiOpen() {
  return craftingOpen || chestOpen || furnaceOpen;
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
    if (t !== "D" && t !== "U") continue;
    if (world.doorOpen.has(cell.x)) world.doorOpen.delete(cell.x);
    else world.doorOpen.add(cell.x);
    say(world.doorOpen.has(cell.x) ? "打开了门。" : "关上了门。");
    return true;
  }
  return false;
}

function tryOpenTable() {
  if (!player.atTable) return false;
  chestOpen = false;
  furnaceOpen = false;
  craftingOpen = !craftingOpen;
  craftScroll = 0;
  say(craftingOpen ? "打开了工作台。点击配方合成。" : "关上了工作台。", 3);
  return true;
}

function tryOpenChest() {
  if (!player.atChest) return false;
  craftingOpen = false;
  furnaceOpen = false;
  chestOpen = !chestOpen;
  say(chestOpen ? "打开了箱子。点击格子存入或取出。" : "关上了箱子。", 3);
  return true;
}

function tryOpenFurnace() {
  if (!player.atFurnace) return false;
  craftingOpen = false;
  chestOpen = false;
  furnaceOpen = !furnaceOpen;
  say(furnaceOpen ? "打开了熔炉。上面放矿或生肉，下面放煤炭。" : "关上了熔炉。", 3);
  return true;
}

function chestDiamonds() {
  return countOwned(chestItems, "diamond");
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
    const names = { pig: "猪", cow: "牛", chicken: "鸡", sheep: "羊", wolf: "狼", rabbit: "兔子", villager: "村民" };
    say(`喂了${names[mob.kind] ?? mob.kind}。它跟着你。`);
    return true;
  }
  return false;
}

function tryBucket() {
  const item = selectedItem();
  if (!item || item.count <= 0) return false;
  if (item.id === "bucket") {
    for (const cell of frontCell()) {
      const t = world.tiles[cell.y]?.[cell.x];
      if (t !== "w" && t !== "v") continue;
      setCell(world.tiles, cell.x, cell.y, ".");
      item.id = t === "v" ? "lava-bucket" : "water-bucket";
      say(t === "v" ? "装满了熔岩。" : "装满了水。");
      return true;
    }
    return false;
  }
  if (item.id !== "water-bucket" && item.id !== "lava-bucket") return false;
  const tx = Math.floor((player.x + player.face * 28) / TILE);
  const ty = Math.floor((player.y - 12) / TILE);
  if (world.tiles[ty]?.[tx] !== ".") return false;
  setCell(world.tiles, tx, ty, item.id === "lava-bucket" ? "v" : "w");
  item.id = "bucket";
  say("倒了出来。");
  return true;
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
  if (above === "7") {
    setCell(world.tiles, tx, cropY, ".");
    if (!addItem("wheat", 1)) spillItem("wheat", 1);
    if (Math.random() < 0.7 && !addItem("wheat-seeds", 1)) spillItem("wheat-seeds", 1);
    burstBits(tx * TILE + 24, cropY * TILE + 24, "#c6b34a");
    say("收割了小麦。");
    return true;
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
    startToolSwing("tool");
    drops.push(makeDrop("white-wool", mob.x, mob.y - 18, 2));
    say("剪下了羊毛。");
    return true;
  }
  return false;
}

function lightTnt(tx, ty) {
  const key = `${tx},${ty}`;
  if (world.tntFuse.has(key)) return;
  world.tntFuse.set(key, 1.35);
  say("点燃了 TNT。");
}

function tryFlint() {
  const item = selectedItem();
  if (item?.id !== "flint-and-steel" || item.count <= 0) return false;
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (t === "N") {
      startToolSwing("tool");
      lightTnt(cell.x, cell.y);
      return true;
    }
  }
  const tx = Math.floor((player.x + player.face * 28) / TILE);
  const ty = Math.floor((player.y - 12) / TILE);
  if (world.tiles[ty]?.[tx] === "." && world.tiles[ty + 1]?.[tx] && world.tiles[ty + 1][tx] !== ".") {
    startToolSwing("tool");
    setCell(world.tiles, tx, ty, "*");
    world.fireT.set(`${tx},${ty}`, 3.6);
    say("点燃了火。");
    return true;
  }
  return false;
}

function explodeTnt(tx, ty) {
  setCell(world.tiles, tx, ty, ".");
  world.tntFuse.delete(`${tx},${ty}`);
  const cx = tx * TILE + TILE / 2;
  const cy = ty * TILE + TILE / 2;
  burstBits(cx, cy, "#f4a54a");
  if (Math.hypot(player.x - cx, player.y - cy) < 96) hurt(player, 8, Math.sign(player.x - cx) || -1);
  for (const mob of mobs) {
    if (mob.dead) continue;
    if (Math.hypot(mob.x - cx, mob.y - cy) < 96) hurt(mob, 8, Math.sign(mob.x - cx) || 1);
  }
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > 3) continue;
      const x = tx + dx;
      const y = ty + dy;
      const t = world.tiles[y]?.[x];
      if (!t || t === "." || t === "B") continue;
      setCell(world.tiles, x, y, ".");
    }
  }
  say("TNT 爆炸了！");
}

function updateHazards(dt) {
  for (const [key, left] of [...world.tntFuse]) {
    const next = left - dt;
    if (next <= 0) {
      const [x, y] = key.split(",").map(Number);
      explodeTnt(x, y);
    } else world.tntFuse.set(key, next);
  }
  for (const [key, left] of [...world.fireT]) {
    const next = left - dt;
    const [x, y] = key.split(",").map(Number);
    if (world.tiles[y]?.[x] !== "*") {
      world.fireT.delete(key);
      continue;
    }
    if (next <= 0) {
      setCell(world.tiles, x, y, ".");
      world.fireT.delete(key);
      const below = world.tiles[y + 1]?.[x];
      if (below === "o" || below === "p" || below === "L") setCell(world.tiles, x, y + 1, ".");
    } else world.fireT.set(key, next);
  }
}

function hasTool(spec, item) {
  if (!spec.tool) return true;
  if (spec.tool === "pickaxe") return PICK_TOOLS.has(item?.id);
  if (spec.tool === "axe") return AXE_TOOLS.has(item?.id) || item?.id === "shears";
  if (spec.tool === "shovel") return SHOVEL_TOOLS.has(item?.id);
  return item?.id === spec.tool;
}

function tryHoe() {
  const item = selectedItem();
  if (!HOE_IDS.has(item?.id) || item.count <= 0) return false;
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (t !== "g" && t !== "d") continue;
    setCell(world.tiles, cell.x, cell.y, "n");
    startToolSwing("tool");
    if (t === "g" && Math.random() < 0.45) {
      drops.push(makeDrop("wheat-seeds", cell.x * TILE + 24, cell.y * TILE - 8));
    }
    say("锄成了耕地。");
    return true;
  }
  return false;
}

function tryMineOrPlace() {
  const item = selectedItem();
  for (const cell of frontCell()) {
    const t = world.tiles[cell.y]?.[cell.x];
    if (!t || t === ".") continue;
    const spec = MINEABLE[t];
    if (spec) {
      if (!hasTool(spec, item)) {
        say(spec.tool === "axe" ? "需要斧才能砍这个。" : spec.tool === "shovel" ? "需要铲才能挖这个。" : "需要镐才能挖这个。");
        return true;
      }
      if (spec.tool || HELD_TOOLS.has(item?.id)) {
        if (player.swingT > 0) return true;
        startToolSwing(item?.id === "diamond-sword" ? "sword" : "tool");
      }
      setCell(world.tiles, cell.x, cell.y, "xiHRJKMO".includes(t) ? "s" : ".");
      const extra = t === "L" && item?.id === "shears" ? 1 : 0;
      drops.push(makeDrop(spec.drop, cell.x * TILE + 24, cell.y * TILE + 8, 1 + extra));
      if (t === "V" && Math.random() < 0.35) drops.push(makeDrop("flint", cell.x * TILE + 18, cell.y * TILE));
      burstBits(cell.x * TILE + 24, cell.y * TILE + 24, "#bbb");
      return true;
    }
  }
  if (item && PLACEABLE[item.id] && item.count > 0) {
    const tx = Math.floor((player.x + player.face * 28) / TILE);
    const ty = Math.floor((player.y - 12) / TILE);
    if (world.tiles[ty]?.[tx] === ".") {
      const below = world.tiles[ty + 1]?.[tx];
      if (below && (SOLID.has(below) || below === "n" || below === "g" || below === "d" || below === "a")) {
        if (item.id === "door-oak") {
          if (world.tiles[ty - 1]?.[tx] !== ".") {
            say("上面没有空间装门。");
            return true;
          }
          setCell(world.tiles, tx, ty, "D");
          setCell(world.tiles, tx, ty - 1, "U");
        } else if (item.id === "bed") {
          const nx = tx + player.face;
          if (world.tiles[ty]?.[nx] !== ".") {
            say("旁边没有空间放床。");
            return true;
          }
          setCell(world.tiles, tx, ty, "z");
          setCell(world.tiles, nx, ty, "Z");
        } else if (item.id === "sugar-cane") {
          if (below !== "a" && below !== "d" && below !== "g") {
            say("甘蔗要种在沙或土上。");
            return true;
          }
          setCell(world.tiles, tx, ty, "Y");
        } else {
          setCell(world.tiles, tx, ty, PLACEABLE[item.id]);
        }
        item.count -= 1;
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
    const soaked = Math.min(amount - 1, Math.floor(player.armor / 4) + (player.shieldHeld ? 3 : 0));
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
  if (who.kind === "wolf" && who.health > 0) {
    who.angry = true;
    who.passive = false;
    who.hurtFlee = 0;
  }
  if (who.health <= 0) {
    who.dead = true;
    who.deathT = 0;
    const loot = {
      zombie: "rotten-flesh",
      skeleton: "bone",
      spider: "string",
      creeper: "gunpowder",
      enderman: "ender-pearl",
      pig: "raw-porkchop",
      cow: "raw-beef",
      chicken: "raw-chicken",
      sheep: "raw-mutton",
      wolf: "bone",
      slime: "slimeball",
      rabbit: "raw-mutton",
      villager: "emerald",
    };
    drops.push(makeDrop(loot[who.kind] ?? "apple", who.x, who.y - 20));
    if (who.kind === "cow") drops.push(makeDrop("leather", who.x + 6, who.y - 16));
    if (who.kind === "skeleton") drops.push(makeDrop("arrow", who.x - 8, who.y - 18));
    if (who.kind === "chicken") drops.push(makeDrop("feather", who.x + 6, who.y - 16));
    if (who.kind === "sheep" && !who.sheared) drops.push(makeDrop("white-wool", who.x + 6, who.y - 16));
    if (who.kind === "spider" && Math.random() < 0.4) drops.push(makeDrop("spider-eye", who.x + 6, who.y - 16));
    if (who.kind === "enderman" || Math.random() < 0.25) drops.push(makeDrop("diamond", who.x + 8, who.y - 24));
    spawnXp(who.x, who.y - 18, who.kind === "villager" ? 3 : who.passive ? 2 : 4);
  }
}

function holdingBow() {
  return selectedItem()?.id === "bow" && selectedItem()?.count > 0;
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

function firePlayerBow() {
  const charge = player.drawT;
  player.drawT = 0;
  player.bowHeld = false;
  if (charge < 0.18) return;
  if (!takeNeed(player.items, { arrow: 1 })) {
    say("没有箭。");
    return;
  }
  const speed = 260 + charge * 240;
  arrows.push({
    x: player.x + player.face * 22,
    y: player.y - 28,
    vx: player.face * speed,
    vy: -36 - charge * 40,
    life: 2.5,
    gone: false,
    from: "player",
    dmg: 2 + Math.round(charge * 4),
  });
  say("射出一支箭。");
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
  if (furnaceOpen) {
    furnaceOpen = false;
    say("关上了熔炉。");
    return;
  }
  if (player.sleeping > 0 || player.eatT > 0) return;
  if (tryToggleDoor()) return;
  if (tryOpenFurnace()) return;
  if (tryOpenChest()) return;
  if (tryOpenTable()) return;
  if (trySleep()) return;
  if (holdingBow()) {
    player.bowHeld = true;
    return;
  }
  if (selectedItem()?.id === "shield") {
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
  if (tryFlint()) return;
  if (tryHoe()) return;
  if (tryBucket()) return;
  if (tryFarm()) return;
  if (tryThrowPearl()) return;
  if (tryThrowSnowball()) return;
  if (tryMineOrPlace()) return;
  const item = selectedItem();
  if (!item || item.count <= 0) return;
  if (SWORD_IDS.has(item.id)) {
    if (player.swingT > 0) return;
    startToolSwing(item.id === "diamond-sword" ? "sword" : "tool");
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
  if (player.swingKind !== "sword") return;
  const t = 1 - player.swingT / (10 / 12);
  if (t < 0.28 || t > 0.72) return;
  const reach = 46;
  const x = player.x + player.face * 18;
  for (const mob of mobs) {
    if (mob.dead || mob.hitT > 0) continue;
    if (Math.abs(mob.x - x) < reach + mob.hw && Math.abs(mob.y - player.y) < player.hh + 8) {
      hurt(mob, 3, player.face);
    }
  }
}

function updatePlayer(dt) {
  if (player.dead) {
    player.age += dt;
    player.frame = Math.min(11, Math.floor(player.age * 10));
    return;
  }

  if (craftingOpen || chestOpen || furnaceOpen) {
    player.vx = 0;
    player.vy = 0;
    player.anim = "idle";
    player.frame = 0;
    player.age += dt;
    if (craftingOpen && !player.atTable) craftingOpen = false;
    if (chestOpen && !player.atChest) chestOpen = false;
    if (furnaceOpen && !player.atFurnace) furnaceOpen = false;
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
  const sneak = keys.has("shift");
  const sprint = keys.has("control") && !sneak;
  const speed = player.inWater ? MOVE * 0.55 : sneak ? MOVE * 0.45 : sprint ? MOVE * 1.45 : MOVE;

  if (player.knockT > 0) {
    player.knockT -= dt;
  } else if (player.swingT <= 0 && player.eatT <= 0) {
    player.vx = (right ? speed : 0) - (left ? speed : 0);
    if (left) player.face = -1;
    if (right) player.face = 1;
  } else {
    player.vx *= 0.85;
  }

  const onLadder = tileAt(player.x, player.y - 8) === "h" || tileAt(player.x, player.y - 24) === "h";
  if (jump && player.eatT <= 0 && (player.grounded || player.inWater || onLadder)) {
    player.vy = player.inWater || onLadder ? -420 : -JUMP;
    player.grounded = false;
  }

  moveBody(player, dt);

  if (player.inLava) hurt(player, 3, -player.face);
  const foot = tileAt(player.x, player.y - 4);
  if (foot === "*") hurt(player, 2, -player.face);
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

  if (player.bowHeld && holdingBow() && player.swingT <= 0 && player.eatT <= 0) {
    player.drawT = Math.min(1, player.drawT + dt / 0.7);
  } else if (!player.bowHeld) {
    player.drawT = 0;
  }
  if (!holdingBow()) {
    player.bowHeld = false;
    player.drawT = 0;
  }
  if (selectedItem()?.id !== "shield") player.shieldHeld = false;

  if (player.swingT > 0 && player.swingKind === "sword") {
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
      if (mob.kind === "chicken" && mob.grounded && Math.abs(mob.vx) > 20 && Math.random() < 0.04) mob.vy = -220;
      if (mob.kind === "rabbit" && mob.grounded && Math.abs(mob.vx) > 16 && Math.random() < 0.08) mob.vy = -280;
      if (mob.kind === "chicken" && Math.random() < dt * 0.08) {
        drops.push(makeDrop("egg", mob.x, mob.y - 12));
        say("鸡下蛋了。", 1.5);
      }
      moveBody(mob, dt);
      if (mob.inLava) hurt(mob, 4, -mob.face);
      continue;
    }
    if (mob.kind === "creeper" && close && Math.abs(dx) < 72 && Math.abs(mob.y - player.y) < 56) {
      mob.face = Math.sign(dx) || mob.face;
      mob.vx = 0;
      mob.fuse += dt;
      if (mob.fuse >= 1.35) {
        hurt(player, 10, Math.sign(player.x - mob.x) || -1);
        mob.dead = true;
        mob.deathT = 0;
        mob.exploded = true;
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
        if (mob.kind === "slime" && mob.grounded && Math.random() < 0.06) mob.vy = -420;
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
    from: "mob",
    dmg: 2,
  });
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
    shot.vy += 260 * dt;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    const stuck = shot.life <= 0 || solidAt(shot.x, shot.y);
    if (shot.from === "player") {
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
    if (!player.dead && Math.abs(shot.x - player.x) < 14 && Math.abs(shot.y - (player.y - 22)) < 28) {
      hurt(player, shot.dmg ?? 2, Math.sign(shot.vx) || -1);
      shot.gone = true;
    }
  }
  arrows = arrows.filter((shot) => !shot.gone);
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
    if (player.dead || player.dropCd > 0 || Math.hypot(drop.x - player.x, drop.y - (player.y - 20)) >= 28) continue;
    if (drop.id === "xp-orb") {
      drop.gone = true;
      addXp(drop.xp ?? 5);
      continue;
    }
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
    say("天黑了。关上门，回房子里睡觉。", 4);
    if (world && !world.nightSpawned) {
      world.nightSpawned = true;
      mobs.push(makeMob("zombie", 22, 10));
      mobs.push(makeMob("spider", 38, 10));
    }
  }
}

function updateCrops(dt) {
  world.cropT = (world.cropT ?? 0) + dt;
  if (world.cropT < 1) return;
  world.cropT = 0;
  for (let y = 0; y < world.h; y++) {
    for (let x = 0; x < world.w; x++) {
      const t = world.tiles[y][x];
      const spec = WHEAT_STAGE[t];
      if (spec && Math.random() < 1 / spec.wait) setCell(world.tiles, x, y, spec.next);
      if (t === "S" && Math.random() < 1 / 16) tree(world.tiles, x, y + 1);
      if (t === "Y" && y > 0 && world.tiles[y - 1][x] === "." && Math.random() < 1 / 18) {
        const below = world.tiles[y + 1]?.[x];
        if (below === "a" || below === "d" || below === "g" || below === "Y") setCell(world.tiles, x, y - 1, "Y");
      }
    }
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
  return SWORD_IDS.has(selectedItem()?.id) && selectedItem()?.count > 0;
}

function heldOverlayId() {
  const item = selectedItem();
  if (!item || item.count <= 0 || !HELD_TOOLS.has(item.id)) return null;
  if (player.dead || player.anim === "sleep" || player.anim === "eat" || player.anim === "death") return null;
  if (player.anim === "swing" && item.id === "diamond-sword") return null;
  return item.id;
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
  return kind === "pig" || kind === "cow" || kind === "chicken" || kind === "sheep" || kind === "wolf" || kind === "slime" || kind === "rabbit" || kind === "villager" ? 8 : 12;
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
    return `${prefix}${mob.stillT > 4 ? "rest" : "idle"}-${frame}.svg`;
  }
  if (Math.abs(mob.vx) < 14 && (mob.fuse ?? 0) <= 0.12) {
    if (mob.kind === "skeleton") return "skeleton-sprites/draw-0.svg";
    return `${prefix}idle-${Math.floor(mob.age * 6) % 8}.svg`;
  }
  return `${prefix}walk-${(Math.floor(mob.age * 10) % 8) * 2}.svg`;
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
      else if (t === "F" && furnace.burn > 0) drawTile("blocks/furnace-on.svg", dx, dy);
      else if ((t === "D" || t === "U") && world.doorOpen.has(x)) {
        drawTile(t === "U" ? "blocks/door-oak-upper-open.svg" : "blocks/door-oak-open.svg", dx, dy);
      } else if (t === "C" && chestOpen && player.atChest && Math.abs(x * TILE + 24 - player.x) < 80) {
        drawTile("blocks/chest-open.svg", dx, dy);
      } else if (t === "N" && world.tntFuse.has(`${x},${y}`)) {
        const primed = Math.floor(time * 16) % 2 === 0;
        drawTile(primed ? "blocks/tnt-primed.svg" : BLOCKS[t], dx, dy);
      } else if (t === "*") {
        const f = 1 + (Math.floor(time * 10) % 7);
        drawTile(`blocks/fire-${f}.svg`, dx, dy);
      } else if (BLOCKS[t]) drawTile(BLOCKS[t], dx, dy);
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
    const rel = shot.pearl ? "items/ender-pearl.svg" : shot.snowball ? "items/snowball.svg" : "items/arrow.svg";
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
  const id = heldOverlayId();
  if (!id) return;
  let rel = itemAsset(id);
  if (id === "bow" && player.drawT > 0) {
    const frame = player.drawT < 0.4 ? 0 : player.drawT < 0.75 ? 1 : 2;
    rel = `items/bow-pulling-${frame}.svg`;
  }
  const pic = img(rel);
  if (!pic) return;
  const swing = player.swingT > 0 && player.swingKind === "tool";
  const drawing = id === "bow" && player.drawT > 0;
  let rot = id === "bow" ? -0.15 : id === "shield" ? -0.05 : 0.35;
  if (swing) rot = -1.15 * Math.sin((1 - player.swingT / (10 / 12)) * Math.PI);
  if (drawing) rot = -0.4 - player.drawT * 0.5;
  if (id === "shield" && player.shieldHeld) rot = -0.35;
  ctx.save();
  ctx.translate(viewX(player.x), viewY(player.y));
  ctx.scale(player.face, 1);
  ctx.translate(id === "bow" ? 10 : id === "shield" ? 16 : 12, id === "bow" ? -26 : id === "shield" ? -24 : -22);
  ctx.rotate(rot);
  const size = id === "bow" ? 36 : 30;
  ctx.drawImage(pic, -size * 0.2, -size * 0.85, size, size);
  if (drawing) {
    const arrow = img("items/arrow.svg");
    if (arrow) ctx.drawImage(arrow, 8, -18, 22, 8);
  }
  ctx.restore();
}

function drawHearts(x, y, value, full, half, empty) {
  for (let i = 0; i < 10; i++) {
    const v = value - i * 2;
    const rel = v >= 2 ? full : v === 1 ? half : empty;
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
    if (transferStack(chestItems, hit.index, player.items, 9)) {
      refreshArmor();
      say("取出了物品。");
    }
    else if (chestItems[hit.index]?.count > 0) say("快捷栏满了。");
  } else {
    if (transferStack(player.items, hit.index, chestItems, CHEST_SLOTS)) {
      refreshArmor();
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
  drawHearts(barX + 8, barY - 28, player.health, "hud/heart.svg", "hud/heart-half.svg", "hud/heart-empty.svg");
  drawHearts(barX + barW - 8 - 180, barY - 28, player.hunger, "hud/hunger-full.svg", "hud/hunger-half.svg", "hud/hunger-empty.svg");
  if (player.inWater) {
    const filled = Math.max(0, Math.min(10, Math.ceil((player.air / 12) * 10)));
    for (let i = 0; i < 10; i++) {
      drawImage(i < filled ? "hud/bubble.svg" : "hud/bubble-empty.svg", barX + 8 + i * 18, barY - 48, 16, 16);
    }
  } else if (player.armor > 0) {
    drawHearts(barX + 8, barY - 48, player.armor, "hud/armor-full.svg", "hud/armor-half.svg", "hud/armor-empty.svg");
  }

  drawImage("hud/xp-bar.svg", barX, barY - 8, barW, 28);
  const xpFill = Math.min(1, (player.xp ?? 0) / 20);
  ctx.fillStyle = "#7cf37c";
  ctx.fillRect(barX + 28, barY + 4, (barW - 56) * xpFill, 6);

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
  ctx.fillText(`箱子钻石 ${chestDiamonds()} / ${GOAL_DIAMONDS}   ${hourLabel()}   Lv ${player.level ?? 0}`, 16, 28);
  if (craftingOpen) drawCraftPanel();
  if (chestOpen) drawChestPanel();
  if (furnaceOpen) drawFurnacePanel();
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
      updateHazards(dt);
      furnaceTick(furnace, dt);
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
  if (chestOpen && mode === "play") {
    if (key === "escape" || key === "q" || key === "e" || key === "j") {
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
  if ((key === "j" || key === "e") && !e.repeat) pressUse(true);
  if (key === "q" && mode === "play" && !uiOpen()) throwSelected();
  if (key === "r" && mode === "play") resetGame();
});

window.addEventListener("keyup", (e) => {
  const key = bindKey(e);
  keys.delete(key);
  if (key === "j" || key === "e") pressUse(false);
});

window.addEventListener("blur", () => {
  keys.clear();
  if (player?.bowHeld) {
    player.bowHeld = false;
    player.drawT = 0;
  }
  if (player) player.shieldHeld = false;
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
  if (furnaceOpen) {
    const pos = canvasPos(e);
    const hit = furnaceSlotAt(pos.x, pos.y);
    if (hit) clickFurnaceSlot(hit);
    else {
      const box = furnacePanelBox();
      if (pos.x < box.x || pos.x > box.x + box.w || pos.y < box.y || pos.y > box.y + box.h) {
        furnaceOpen = false;
        say("关上了熔炉。");
      }
    }
    return;
  }
  pressUse(true);
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 0) pressUse(false);
});

window.addEventListener("resize", resize);

for (const btn of document.querySelectorAll("#touch button")) {
  const press = (on) => {
    const dir = btn.dataset.dir;
    const act = btn.dataset.act;
    if (dir) hold[dir] = on;
    if (act === "jump") hold.jump = on;
    if (act === "use") pressUse(on);
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
