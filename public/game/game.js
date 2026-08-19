import {
  BREW,
  CHEST_SLOTS,
  COOK_TIME,
  FURNACE_FUEL,
  HOE_IDS,
  RECIPES,
  SMELT,
  brewTick,
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
const FEED = { pig: "carrot", cow: "wheat", chicken: "wheat-seeds", sheep: "wheat", wolf: "bone", rabbit: "carrot", cat: "raw-cod", horse: "wheat" };
const WHEAT_STAGE = {
  0: { next: "1", wait: 5 },
  1: { next: "2", wait: 5 },
  2: { next: "3", wait: 5 },
  3: { next: "4", wait: 5 },
  4: { next: "5", wait: 6 },
  5: { next: "6", wait: 6 },
  6: { next: "7", wait: 6 },
};
const WART_STAGE = {
  ":": { next: ";", wait: 6 },
  ";": { next: "<", wait: 6 },
  "<": { next: ">", wait: 8 },
};
const CARROT_STAGE = {
  "-": { next: "_", wait: 5 },
  _: { next: "/", wait: 6 },
  "/": { next: ",", wait: 6 },
};
const POTATO_STAGE = {
  "'": { next: "|", wait: 5 },
  "|": { next: "]", wait: 6 },
  "]": { next: '"', wait: 6 },
};
const DISC_SONGS = {
  "music-disc-13": "13",
  "music-disc-cat": "Cat",
};
const SMITH_UP = {
  "diamond-helmet": "netherite-helmet",
  "diamond-chestplate": "netherite-chestplate",
  "diamond-leggings": "netherite-leggings",
  "diamond-boots": "netherite-boots",
};
const DOOR_SWING = 8;
const OFFHAND_SLOT = 9;
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
  9: { drop: "wheat-seeds" },
  l: { drop: "lily-pad" },
  h: { drop: "ladder" },
  I: { drop: "ice" },
  "=": { drop: "bookshelf", tool: "axe" },
  "!": { drop: "noteblock", tool: "axe" },
  $: { drop: "obsidian", tool: "pickaxe" },
  "%": { drop: "brown-mushroom" },
  r: { drop: "red-mushroom" },
  "#": { drop: "netherrack", tool: "pickaxe" },
  "&": { drop: "glowstone", tool: "pickaxe" },
  "^": { drop: "soul-sand", tool: "shovel" },
  "+": { drop: "nether-bricks", tool: "pickaxe" },
  "?": { drop: "magma", tool: "pickaxe" },
  "(": { drop: "iron-block", tool: "pickaxe" },
  "{": { drop: "brewing-stand", tool: "pickaxe" },
  "}": { drop: "enchanting-table", tool: "pickaxe" },
  "[": { drop: "cake" },
  ")": { drop: "jukebox", tool: "axe" },
  "═": { drop: "rail" },
  "░": { drop: "end-stone", tool: "pickaxe" },
  "▤": { drop: "end-portal-frame", tool: "pickaxe" },
  "♣": { drop: "chorus-fruit" },
  "☠": { drop: "wither-skull" },
  "♦": { drop: "dragon-egg" },
  "▷": { drop: "dispenser", tool: "pickaxe" },
  "⇨": { drop: "piston", tool: "pickaxe" },
  "▽": { drop: "hopper", tool: "pickaxe" },
  "◉": { drop: "observer", tool: "pickaxe" },
  "★": { drop: "gold-block", tool: "pickaxe" },
  "◆": { drop: "diamond-block", tool: "pickaxe" },
  "❖": { drop: "emerald-block", tool: "pickaxe" },
  "▒": { drop: "sponge" },
  "❄": { drop: "blue-ice", tool: "pickaxe" },
  "≡": { drop: "spruce-planks", tool: "axe" },
  "≣": { drop: "birch-planks", tool: "axe" },
  "☰": { drop: "acacia-planks", tool: "axe" },
  "☷": { drop: "dark-oak-planks", tool: "axe" },
  "♠": { drop: "spruce-leaves" },
  "♧": { drop: "birch-leaves" },
  "¦": { drop: "spruce-log", tool: "axe" },
  "┊": { drop: "birch-log", tool: "axe" },
  "┆": { drop: "acacia-log", tool: "axe" },
  "┇": { drop: "dark-oak-log", tool: "axe" },
  "☁": { drop: "cloud" },
  "☼": { drop: "beacon", tool: "pickaxe" },
  "⊓": { drop: "anvil", tool: "pickaxe" },
  "▣": { drop: "ender-chest", tool: "pickaxe" },
  "⌐": { drop: "lever" },
  "※": { drop: "redstone-dust" },
  "†": { drop: "redstone-torch" },
  "╪": { drop: "powered-rail" },
  "⊞": { drop: "smithing-table", tool: "axe" },
  "Ω": { drop: "ancient-debris", tool: "pickaxe" },
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
  bookshelf: "=",
  noteblock: "!",
  obsidian: "$",
  "red-mushroom": "r",
  "brown-mushroom": "%",
  netherrack: "#",
  "soul-sand": "^",
  glowstone: "&",
  magma: "?",
  "nether-bricks": "+",
  "iron-block": "(",
  "brewing-stand": "{",
  "enchanting-table": "}",
  cake: "[",
  jukebox: ")",
  pumpkin: "u",
  rail: "═",
  "end-stone": "░",
  "end-portal-frame": "▤",
  "chorus-plant": "♣",
  "wither-skull": "☠",
  "dragon-egg": "♦",
  dispenser: "▷",
  piston: "⇨",
  hopper: "▽",
  observer: "◉",
  "door-iron": "⌊",
  "gold-block": "★",
  "diamond-block": "◆",
  "emerald-block": "❖",
  sponge: "▒",
  "blue-ice": "❄",
  "spruce-planks": "≡",
  "birch-planks": "≣",
  "acacia-planks": "☰",
  "dark-oak-planks": "☷",
  "spruce-leaves": "♠",
  "birch-leaves": "♧",
  "spruce-log": "¦",
  "birch-log": "┊",
  "acacia-log": "┆",
  "dark-oak-log": "┇",
  cloud: "☁",
  beacon: "☼",
  anvil: "⊓",
  "ender-chest": "▣",
  lever: "⌐",
  "redstone-dust": "※",
  "redstone-torch": "†",
  "powered-rail": "╪",
  "smithing-table": "⊞",
  "ancient-debris": "Ω",
};
const PICK_TOOLS = new Set(["diamond-pickaxe", "iron-pickaxe", "wooden-pickaxe"]);
const AXE_TOOLS = new Set(["diamond-axe", "iron-axe", "wooden-axe"]);
const SHOVEL_TOOLS = new Set(["wooden-shovel", "iron-shovel", "diamond-shovel"]);
const SWORD_IDS = new Set(["diamond-sword", "iron-sword", "wooden-sword", "stone-sword"]);
const HELD_TOOLS = new Set([
  ...SWORD_IDS,
  "bow",
  "shield",
  "shears",
  "flint-and-steel",
  "fishing-rod",
  ...PICK_TOOLS,
  ...AXE_TOOLS,
  ...HOE_IDS,
  "wooden-shovel",
  "iron-shovel",
  "diamond-shovel",
  "trident",
  "crossbow",
  "lead",
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
  "netherite-helmet": { slot: "helmet", pts: 3, mat: "netherite" },
  "netherite-chestplate": { slot: "chest", pts: 8, mat: "netherite" },
  "netherite-leggings": { slot: "legs", pts: 6, mat: "netherite" },
  "netherite-boots": { slot: "boots", pts: 3, mat: "netherite" },
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
  "netherite-helmet": "下界合金头盔",
  "netherite-chestplate": "下界合金胸甲",
  "netherite-leggings": "下界合金护腿",
  "netherite-boots": "下界合金靴子",
  "fishing-rod": "钓鱼竿",
  "fishing-rod-cast": "钓鱼中",
  "raw-cod": "生鳕鱼",
  "cooked-cod": "熟鳕鱼",
  "ink-sac": "墨囊",
  bowl: "碗",
  "mushroom-stew": "蘑菇煲",
  bookshelf: "书架",
  noteblock: "音符盒",
  obsidian: "黑曜石",
  "red-mushroom": "红蘑菇",
  "brown-mushroom": "棕蘑菇",
  netherrack: "下界岩",
  "soul-sand": "灵魂沙",
  glowstone: "荧石",
  magma: "岩浆块",
  "nether-bricks": "下界砖",
  "nether-portal": "下界传送门",
  "oak-boat": "橡木船",
  "blaze-rod": "烈焰棒",
  "blaze-powder": "烈焰粉",
  "nether-wart": "下界疣",
  "ghast-tear": "恶魂之泪",
  "glass-bottle": "玻璃瓶",
  "potion-fire": "抗火药水",
  "stone-sword": "石剑",
  cake: "蛋糕",
  "iron-block": "铁块",
  "brewing-stand": "酿造台",
  "enchanting-table": "附魔台",
  jukebox: "唱片机",
  trident: "三叉戟",
  crossbow: "弩",
  "music-disc-13": "唱片 13",
  "music-disc-cat": "唱片 Cat",
  rail: "铁轨",
  minecart: "矿车",
  lead: "拴绳",
  elytra: "鞘翅",
  totem: "不死图腾",
  "nether-star": "下界之星",
  "wither-skull": "凋灵头颅",
  "end-stone": "末地石",
  "end-portal": "末地传送门",
  "end-portal-frame": "末地传送门框架",
  "chorus-plant": "紫颂植株",
  "dragon-egg": "龙蛋",
  dispenser: "发射器",
  piston: "活塞",
  hopper: "漏斗",
  observer: "观察者",
  "door-iron": "铁门",
  "gold-block": "金块",
  "diamond-block": "钻石块",
  "emerald-block": "绿宝石块",
  sponge: "海绵",
  "blue-ice": "蓝冰",
  "spruce-planks": "云杉木板",
  "birch-planks": "白桦木板",
  "acacia-planks": "金合欢木板",
  "dark-oak-planks": "深色橡木木板",
  "spruce-leaves": "云杉树叶",
  "birch-leaves": "白桦树叶",
  "spruce-log": "云杉原木",
  "birch-log": "白桦原木",
  "acacia-log": "金合欢原木",
  "dark-oak-log": "深色橡木原木",
  cloud: "云",
  beacon: "信标",
  anvil: "铁砧",
  "ender-chest": "末影箱",
  lever: "拉杆",
  "redstone-dust": "红石粉",
  "redstone-torch": "红石火把",
  "powered-rail": "动力铁轨",
  "smithing-table": "锻造台",
  "ancient-debris": "远古残骸",
  "netherite-ingot": "下界合金锭",
  "netherite-scrap": "下界合金碎片",
  paper: "纸",
  firework: "烟花火箭",
  "chorus-fruit": "紫颂果",
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
  "raw-cod": { hunger: 2, health: 0 },
  "cooked-cod": { hunger: 5, health: 2 },
  "mushroom-stew": { hunger: 6, health: 3 },
  cake: { hunger: 2, health: 1 },
  "chorus-fruit": { hunger: 4, health: 2 },
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
  "=": "blocks/bookshelf.svg",
  "!": "blocks/noteblock.svg",
  $: "blocks/obsidian.svg",
  "%": "blocks/brown-mushroom.svg",
  "#": "blocks/netherrack.svg",
  "&": "blocks/glowstone.svg",
  "^": "blocks/soul-sand.svg",
  "+": "blocks/nether-bricks.svg",
  "?": "blocks/magma.svg",
  "@": "blocks/nether-portal.svg",
  ":": "blocks/nether-wart-0.svg",
  ";": "blocks/nether-wart-1.svg",
  "<": "blocks/nether-wart-2.svg",
  ">": "blocks/nether-wart-3.svg",
  "(": "blocks/iron-block.svg",
  "{": "blocks/brewing-stand.svg",
  "}": "blocks/enchanting-table.svg",
  "[": "blocks/cake.svg",
  ")": "blocks/jukebox.svg",
  "-": "blocks/carrot-0.svg",
  _: "blocks/carrot-1.svg",
  "/": "blocks/carrot-2.svg",
  ",": "blocks/carrot-3.svg",
  "'": "blocks/potato-0.svg",
  "|": "blocks/potato-1.svg",
  "]": "blocks/potato-2.svg",
  '"': "blocks/potato-3.svg",
  "═": "blocks/rail.svg",
  "░": "blocks/end-stone.svg",
  "▓": "blocks/end-portal.svg",
  "▤": "blocks/end-portal-frame.svg",
  "♣": "blocks/chorus-plant.svg",
  "☠": "blocks/wither-skull.svg",
  "♦": "blocks/dragon-egg.svg",
  "▷": "blocks/dispenser.svg",
  "⇨": "blocks/piston.svg",
  "➤": "blocks/piston-head.svg",
  "▽": "blocks/hopper.svg",
  "◉": "blocks/observer.svg",
  "⌊": "blocks/door-iron.svg",
  "⌈": "blocks/door-iron-upper.svg",
  "★": "blocks/gold-block.svg",
  "◆": "blocks/diamond-block.svg",
  "❖": "blocks/emerald-block.svg",
  "▒": "blocks/sponge.svg",
  "❄": "blocks/blue-ice.svg",
  "≡": "blocks/spruce-planks.svg",
  "≣": "blocks/birch-planks.svg",
  "☰": "blocks/acacia-planks.svg",
  "☷": "blocks/dark-oak-planks.svg",
  "♠": "blocks/spruce-leaves.svg",
  "♧": "blocks/birch-leaves.svg",
  "¦": "blocks/spruce-log.svg",
  "┊": "blocks/birch-log.svg",
  "┆": "blocks/acacia-log.svg",
  "┇": "blocks/dark-oak-log.svg",
  "☁": "blocks/cloud.svg",
  "☼": "blocks/beacon.svg",
  "⊓": "blocks/anvil.svg",
  "▣": "blocks/ender-chest.svg",
  "⌐": "blocks/lever.svg",
  "※": "blocks/redstone-dust.svg",
  "†": "blocks/redstone-torch.svg",
  "╪": "blocks/powered-rail.svg",
  "⊞": "blocks/smithing-table.svg",
  "Ω": "blocks/ancient-debris.svg",
};

const SOLID = new Set([..."gdscpLabBTFimxIjuyenqHRNVAEKJMOQ8X~Wl=!$", "#", "&", "^", "+", "?", "(", "{", "}", ")", "░", "▤", "♦", "☠"]);
for (const ch of "▷⇨➤▽◉★◆❖▒❄≡≣☰☷♠♧¦┊┆┇☁☼⊓▣⊞Ω") SOLID.add(ch);

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
let chestKind = "chest";
let furnaceOpen = false;
let brewOpen = false;
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
  ...range(8, (i) => `cat-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `cat-sprites/idle-${i}.svg`),
  ...range(8, (i) => `cat-sprites/rest-${i}.svg`),
  ...range(8, (i) => `cat-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `cat-sprites/death-${i}.svg`),
  ...range(8, (i) => `bat-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `bat-sprites/idle-${i}.svg`),
  ...range(8, (i) => `bat-sprites/rest-${i}.svg`),
  ...range(8, (i) => `bat-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `bat-sprites/death-${i}.svg`),
  ...range(8, (i) => `squid-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `squid-sprites/idle-${i}.svg`),
  ...range(8, (i) => `squid-sprites/rest-${i}.svg`),
  ...range(8, (i) => `squid-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `squid-sprites/death-${i}.svg`),
  ...range(8, (i) => `witch-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `witch-sprites/idle-${i}.svg`),
  ...range(8, (i) => `witch-sprites/rest-${i}.svg`),
  ...range(8, (i) => `witch-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `witch-sprites/death-${i}.svg`),
  ...range(8, (i) => `iron-golem-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `iron-golem-sprites/idle-${i}.svg`),
  ...range(8, (i) => `iron-golem-sprites/rest-${i}.svg`),
  ...range(8, (i) => `iron-golem-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `iron-golem-sprites/death-${i}.svg`),
  ...range(8, (i) => `horse-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `horse-sprites/idle-${i}.svg`),
  ...range(8, (i) => `horse-sprites/rest-${i}.svg`),
  ...range(8, (i) => `horse-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `horse-sprites/death-${i}.svg`),
  ...range(8, (i) => `boat-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `boat-sprites/idle-${i}.svg`),
  ...range(8, (i) => `boat-sprites/rest-${i}.svg`),
  ...range(8, (i) => `boat-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `boat-sprites/death-${i}.svg`),
  ...range(8, (i) => `blaze-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `blaze-sprites/idle-${i}.svg`),
  ...range(8, (i) => `blaze-sprites/rest-${i}.svg`),
  ...range(8, (i) => `blaze-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `blaze-sprites/death-${i}.svg`),
  ...range(8, (i) => `magma-cube-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `magma-cube-sprites/idle-${i}.svg`),
  ...range(8, (i) => `magma-cube-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `magma-cube-sprites/death-${i}.svg`),
  ...range(8, (i) => `ghast-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `ghast-sprites/idle-${i}.svg`),
  ...range(8, (i) => `ghast-sprites/rest-${i}.svg`),
  ...range(8, (i) => `ghast-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `ghast-sprites/death-${i}.svg`),
  ...range(8, (i) => `wither-skeleton-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `wither-skeleton-sprites/idle-${i}.svg`),
  ...range(8, (i) => `wither-skeleton-sprites/hurt-${i}.svg`),
  ...range(12, (i) => `wither-skeleton-sprites/death-${i}.svg`),
  ...range(8, (i) => `snow-golem-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `snow-golem-sprites/idle-${i}.svg`),
  ...range(8, (i) => `snow-golem-sprites/rest-${i}.svg`),
  ...range(8, (i) => `snow-golem-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `snow-golem-sprites/death-${i}.svg`),
  ...range(8, (i) => `drowned-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `drowned-sprites/idle-${i}.svg`),
  ...range(8, (i) => `drowned-sprites/hurt-${i}.svg`),
  ...range(12, (i) => `drowned-sprites/death-${i}.svg`),
  ...range(8, (i) => `pillager-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `pillager-sprites/idle-${i}.svg`),
  ...range(8, (i) => `pillager-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `pillager-sprites/death-${i}.svg`),
  ...range(8, (i) => `minecart-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `minecart-sprites/idle-${i}.svg`),
  ...range(8, (i) => `minecart-sprites/rest-${i}.svg`),
  ...range(8, (i) => `minecart-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `minecart-sprites/death-${i}.svg`),
  ...range(8, (i) => `wither-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `wither-sprites/idle-${i}.svg`),
  ...range(8, (i) => `wither-sprites/rest-${i}.svg`),
  ...range(8, (i) => `wither-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `wither-sprites/death-${i}.svg`),
  ...range(8, (i) => `ender-dragon-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `ender-dragon-sprites/idle-${i}.svg`),
  ...range(8, (i) => `ender-dragon-sprites/rest-${i}.svg`),
  ...range(8, (i) => `ender-dragon-sprites/hurt-${i}.svg`),
  ...range(8, (i) => `ender-dragon-sprites/death-${i}.svg`),
  ...range(8, (i) => `door-sprites/swing-${i}.svg`),
  ...range(8, (i) => `iron-door-sprites/swing-${i}.svg`),
  "steve-sprites/shield-hold.svg",
  "steve-sprites/shield-block.svg",
  ...range(8, (i) => `steve-sprites/shield-hold-run-${i}.svg`),
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
  "steve-sprites/armor-netherite.svg",
  ...["leather", "iron", "diamond", "gold", "chainmail", "netherite"].flatMap((kind) => range(8, (i) => `steve-sprites/armor-${kind}-run-${i}.svg`)),
  ...range(7, (i) => `blocks/fire-${i + 1}.svg`),
  "blocks/tnt-primed.svg",
  "items/xp-orb.svg",
  "blocks/chest-open.svg",
  "blocks/door-oak-open.svg",
  "blocks/door-oak-upper-open.svg",
  "items/shield.svg",
  "items/fishing-rod.svg",
  "items/fishing-rod-cast.svg",
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

function tree(tiles, x, ground, log = "o", leaf = "L", trunk = 3) {
  for (let i = 1; i <= trunk; i++) setCell(tiles, x, ground - i, log);
  const leafTop = trunk + 3;
  for (let dy = trunk + 1; dy <= leafTop; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + (leafTop - dy) < 4) setCell(tiles, x + dx, ground - dy, leaf);
    }
  }
}

function worldMaps(extra = {}) {
  return {
    cropT: 0,
    doorOpen: new Map(),
    tntFuse: new Map(),
    fireT: new Map(),
    cakeBites: new Map(),
    jukebox: new Map(),
    deviceFace: new Map(),
    power: new Map(),
    gadgetCd: new Map(),
    pistonOut: new Map(),
    leverOn: new Set(),
    beaconLit: new Set(),
    ...extra,
  };
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
  tree(tiles, 27, ground, "¦", "♠", 4);
  tree(tiles, 48, ground, "┊", "♧");

  fillRow(tiles, ground, 2, 5, "n");
  setCell(tiles, 7, ground, "n");
  setCell(tiles, 6, ground - 1, "u");
  setCell(tiles, 9, ground - 1, "u");
  setCell(tiles, 13, ground, "I");
  setCell(tiles, 18, ground, "❄");
  setCell(tiles, 15, ground + 3, "q");
  setCell(tiles, 47, ground - 1, "e");
  setCell(tiles, 49, ground - 1, "u");
  setCell(tiles, 61, ground - 1, "y");
  setCell(tiles, 61, ground - 2, "y");

  setCell(tiles, 2, ground - 1, "0");
  setCell(tiles, 3, ground - 1, "3");
  setCell(tiles, 4, ground - 1, "7");
  setCell(tiles, 5, ground - 1, "-");
  setCell(tiles, 7, ground - 1, "'");

  setCell(tiles, 11, ground - 1, "f");
  setCell(tiles, 12, ground - 1, "G");
  setCell(tiles, 20, ground - 1, "P");
  setCell(tiles, 29, ground - 1, "k");
  setCell(tiles, 38, ground - 1, "k");
  for (const gx of [10, 21, 24, 27, 39, 45, 51, 58, 73]) setCell(tiles, gx, ground - 1, "G");

  fillRow(tiles, ground, 28, 31, "a");
  setCell(tiles, 28, ground - 1, "Y");
  setCell(tiles, 28, ground - 2, "Y");
  setCell(tiles, 30, ground - 1, "Y");
  setCell(tiles, 16, ground - 1, "l");
  setCell(tiles, 17, ground - 1, "▒");
  setCell(tiles, 8, ground - 4, "9");
  setCell(tiles, 48, ground - 4, "9");
  setCell(tiles, 25, ground - 1, "r");
  setCell(tiles, 26, ground - 1, "%");
  setCell(tiles, 36, ground, "s");
  setCell(tiles, 35, ground - 1, "$");
  setCell(tiles, 37, ground - 1, "$");
  setCell(tiles, 35, ground - 2, "$");
  setCell(tiles, 37, ground - 2, "$");
  setCell(tiles, 35, ground - 3, "$");
  setCell(tiles, 37, ground - 3, "$");
  setCell(tiles, 35, ground - 4, "$");
  setCell(tiles, 36, ground - 4, "$");
  setCell(tiles, 37, ground - 4, "$");
  setCell(tiles, 36, ground - 1, "@");
  setCell(tiles, 36, ground - 2, "@");
  setCell(tiles, 36, ground - 3, "@");
  setCell(tiles, 72, ground, "~");
  setCell(tiles, 73, ground, "~");
  fillRow(tiles, ground - 1, 71, 73, "A");
  setCell(tiles, 71, ground - 1, "◉");
  setCell(tiles, 72, ground - 1, "⇨");
  setCell(tiles, 73, ground - 1, "▷");
  setCell(tiles, 74, ground - 1, "E");
  setCell(tiles, 69, ground - 1, "W");
  fillRow(tiles, ground + 3, 8, 11, "V");
  for (let y = ground + 1; y <= ground + 3; y++) fillRow(tiles, y, 40, 44, ".");
  fillRow(tiles, ground + 3, 40, 44, "░");
  setCell(tiles, 40, ground + 2, "▤");
  setCell(tiles, 44, ground + 2, "▤");
  setCell(tiles, 40, ground + 1, "▤");
  setCell(tiles, 44, ground + 1, "▤");
  setCell(tiles, 41, ground + 1, "▓");
  setCell(tiles, 42, ground + 1, "▓");
  setCell(tiles, 43, ground + 1, "▓");
  setCell(tiles, 41, ground + 2, "▓");
  setCell(tiles, 42, ground + 2, "▓");
  setCell(tiles, 43, ground + 2, "▓");
  setCell(tiles, 42, ground, "h");
  setCell(tiles, 42, ground - 1, "h");
  setCell(tiles, 42, ground - 2, "h");

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
  setCell(tiles, 70, ground - 1, "⌊");
  setCell(tiles, 70, ground - 2, "⌈");
  setCell(tiles, 63, ground - 1, "F");
  setCell(tiles, 63, ground - 2, ")");
  setCell(tiles, 64, ground - 1, "T");
  setCell(tiles, 65, ground - 1, "=");
  setCell(tiles, 65, ground - 2, "}");
  setCell(tiles, 69, ground - 1, "{");
  setCell(tiles, 69, ground - 2, "!");
  setCell(tiles, 68, ground - 1, "C");
  setCell(tiles, 68, ground - 2, "▽");
  setCell(tiles, 66, ground - 1, "z");
  setCell(tiles, 67, ground - 1, "Z");
  setCell(tiles, 66, ground - 2, "t");
  setCell(tiles, 64, ground - 2, "[");
  setCell(tiles, 69, ground - 5, "t");
  setCell(tiles, 60, ground - 1, "N");
  setCell(tiles, 59, ground - 1, "⊓");
  setCell(tiles, 58, ground - 1, "⊞");
  setCell(tiles, 67, ground - 2, "▣");
  setCell(tiles, 75, ground - 2, "☼");
  setCell(tiles, 71, ground - 2, "⌐");
  setCell(tiles, 72, ground - 2, "†");
  setCell(tiles, 71, ground - 3, "※");
  setCell(tiles, 74, ground - 1, "★");
  setCell(tiles, 75, ground - 1, "◆");
  setCell(tiles, 76, ground - 1, "❖");
  setCell(tiles, 76, ground - 2, "~");
  setCell(tiles, 53, ground - 1, "≡");
  setCell(tiles, 54, ground - 1, "≣");
  setCell(tiles, 55, ground - 1, "☰");
  setCell(tiles, 56, ground - 1, "☷");
  setCell(tiles, 53, ground - 2, "¦");
  setCell(tiles, 54, ground - 2, "┊");
  setCell(tiles, 55, ground - 2, "┆");
  setCell(tiles, 56, ground - 2, "┇");
  for (let x = 8; x <= 12; x++) setCell(tiles, x, 2, "☁");
  for (let x = 9; x <= 11; x++) setCell(tiles, x, 3, "☁");
  for (let x = 32; x <= 36; x++) setCell(tiles, x, 2, "☁");
  for (let x = 50; x <= 55; x++) setCell(tiles, x, 2, "☁");

  fillRow(tiles, ground, 71, W - 1, "m");
  setCell(tiles, 0, ground, "B");
  setCell(tiles, W - 1, ground, "B");

  const gadget = worldMaps({ nightSpawned: false });
  gadget.deviceFace.set("71,9", 1);
  gadget.deviceFace.set("72,9", 1);
  gadget.deviceFace.set("73,9", 1);
  return { w: W, h: H, tiles, ground, ...gadget };
}

function portalFrame(tiles, x, ground) {
  setCell(tiles, x, ground, "#");
  setCell(tiles, x - 1, ground - 1, "$");
  setCell(tiles, x + 1, ground - 1, "$");
  setCell(tiles, x - 1, ground - 2, "$");
  setCell(tiles, x + 1, ground - 2, "$");
  setCell(tiles, x - 1, ground - 3, "$");
  setCell(tiles, x + 1, ground - 3, "$");
  setCell(tiles, x - 1, ground - 4, "$");
  setCell(tiles, x, ground - 4, "$");
  setCell(tiles, x + 1, ground - 4, "$");
  setCell(tiles, x, ground - 1, "@");
  setCell(tiles, x, ground - 2, "@");
  setCell(tiles, x, ground - 3, "@");
}

function buildNether() {
  const W = 78;
  const H = 16;
  const tiles = Array.from({ length: H }, () => Array(W).fill("."));
  const ground = 10;

  for (let x = 0; x < W; x++) {
    setCell(tiles, x, H - 1, "B");
    for (let y = ground; y < H - 1; y++) setCell(tiles, x, y, "#");
    if (x % 11 === 3) setCell(tiles, x, 1, "&");
    if (x % 13 === 7) setCell(tiles, x, 2, "&");
  }

  fillRow(tiles, ground, 12, 16, ".");
  fillRow(tiles, ground + 1, 12, 16, "v");
  fillRow(tiles, ground + 2, 12, 16, "v");
  fillRow(tiles, ground + 3, 12, 16, "#");

  fillRow(tiles, ground, 52, 56, ".");
  fillRow(tiles, ground + 1, 52, 56, "v");
  fillRow(tiles, ground + 2, 52, 56, "v");
  fillRow(tiles, ground + 3, 52, 56, "#");

  fillRow(tiles, ground, 20, 24, "^");
  fillRow(tiles, ground, 40, 44, "?");
  fillRow(tiles, ground - 1, 62, 68, "+");
  fillRow(tiles, ground - 2, 63, 67, "+");
  setCell(tiles, 64, ground - 3, "&");
  setCell(tiles, 18, ground - 1, "?");
  setCell(tiles, 48, ground - 1, "^");
  setCell(tiles, 21, ground - 1, ":");
  setCell(tiles, 22, ground - 1, ";");
  setCell(tiles, 23, ground - 1, ">");
  setCell(tiles, 30, ground - 1, "Ω");
  setCell(tiles, 50, ground - 1, "Ω");
  setCell(tiles, 31, ground + 1, "Ω");

  portalFrame(tiles, 36, ground);
  setCell(tiles, 0, ground, "B");
  setCell(tiles, W - 1, ground, "B");

  return { w: W, h: H, tiles, ground, ...worldMaps({ nightSpawned: true }) };
}

function endPortalFrame(tiles, x, ground) {
  setCell(tiles, x, ground, "░");
  setCell(tiles, x - 1, ground - 1, "▤");
  setCell(tiles, x + 1, ground - 1, "▤");
  setCell(tiles, x - 1, ground - 2, "▤");
  setCell(tiles, x + 1, ground - 2, "▤");
  setCell(tiles, x - 1, ground - 3, "▤");
  setCell(tiles, x, ground - 3, "▤");
  setCell(tiles, x + 1, ground - 3, "▤");
  setCell(tiles, x, ground - 1, "▓");
  setCell(tiles, x, ground - 2, "▓");
}

function buildEnd() {
  const W = 78;
  const H = 16;
  const tiles = Array.from({ length: H }, () => Array(W).fill("."));
  const ground = 10;

  for (let x = 0; x < W; x++) setCell(tiles, x, H - 1, "B");
  fillRow(tiles, ground, 16, 62, "░");
  fillRow(tiles, ground + 1, 18, 60, "░");
  fillRow(tiles, ground + 2, 22, 56, "░");
  setCell(tiles, 22, ground - 1, "♣");
  setCell(tiles, 23, ground - 1, "♣");
  setCell(tiles, 23, ground - 2, "♣");
  setCell(tiles, 52, ground - 1, "♣");
  setCell(tiles, 53, ground - 1, "♣");
  setCell(tiles, 54, ground - 1, "♣");
  setCell(tiles, 54, ground - 2, "♣");
  endPortalFrame(tiles, 38, ground);
  setCell(tiles, 0, ground, "B");
  setCell(tiles, W - 1, ground, "B");

  return { w: W, h: H, tiles, ground, ...worldMaps({ nightSpawned: true }) };
}

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
  body.inWater = inWaterAt(body);
  body.inLava = mid === "v" || tileAt(body.x, body.y - 16) === "v";
  body.atChest = nearTile(body, "C");
  body.atEnder = nearTile(body, "▣");
  body.atTable = nearTile(body, "T");
  body.atFurnace = nearTile(body, "F");
  body.atBrew = nearTile(body, "{");
  body.atEnchant = nearTile(body, "}");
  body.atAnvil = nearTile(body, "⊓");
  body.atSmith = nearTile(body, "⊞");
  body.atBeacon = nearTile(body, "☼");
  const bed = tileAt(body.x, body.y - 8);
  body.atBed = bed === "z" || bed === "Z" || tileAt(body.x + 16, body.y - 8) === "z" || tileAt(body.x - 16, body.y - 8) === "Z";
  if (body.inWater) {
    swimBody(body, dt);
    if (body.aquatic) {
      body.air = 12;
      body.drownT = 0;
    }
  } else {
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
    tridentCd: 0,
    eatT: 0,
    dead: false,
    air: 12,
    drownT: 0,
    inWater: false,
    inLava: false,
    atBed: false,
    atTable: false,
    atAnvil: false,
    atSmith: false,
    atBeacon: false,
    atEnder: false,
    armor: 0,
    armorMat: null,
    selected: 0,
    lastHotbar: 0,
    sleeping: 0,
    hungerT: 0,
    drawT: 0,
    bowHeld: false,
    shieldHeld: false,
    xp: 0,
    level: 0,
    swingKind: "sword",
    fishT: 0,
    portalT: 0,
    mount: null,
    fireRes: 0,
    wither: 0,
    witherTick: 0,
    sharpness: 0,
    beaconT: 0,
    beaconTick: 0,
    offhand: { id: "shield", count: 1 },
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
    cat: { hp: 5, speed: 92, dmg: 0, hw: 10, hh: 18, scale: 0.15, sheet: "cat-sprites", h: 480, passive: true },
    bat: { hp: 3, speed: 70, dmg: 0, hw: 10, hh: 16, scale: 0.13, sheet: "bat-sprites", h: 480, passive: true, fly: true },
    squid: { hp: 5, speed: 40, dmg: 0, hw: 12, hh: 28, scale: 0.14, sheet: "squid-sprites", h: 520, passive: true, aquatic: true },
    witch: { hp: 10, speed: 80, dmg: 3, hw: 11, hh: 52, scale: 0.16, sheet: "witch-sprites", h: 560 },
    "iron-golem": { hp: 20, speed: 55, dmg: 5, hw: 16, hh: 62, scale: 0.18, sheet: "iron-golem-sprites", h: 560, ally: true },
    horse: { hp: 12, speed: 130, dmg: 0, hw: 16, hh: 44, scale: 0.16, sheet: "horse-sprites", h: 520, passive: true },
    boat: { hp: 8, speed: 110, dmg: 0, hw: 22, hh: 16, scale: 0.14, sheet: "boat-sprites", h: 400, passive: true, aquatic: true },
    blaze: { hp: 10, speed: 70, dmg: 3, hw: 12, hh: 44, scale: 0.16, sheet: "blaze-sprites", h: 480, fly: true },
    ghast: { hp: 14, speed: 55, dmg: 4, hw: 22, hh: 50, scale: 0.15, sheet: "ghast-sprites", h: 480, fly: true },
    "wither-skeleton": { hp: 10, speed: 80, dmg: 4, hw: 12, hh: 54, scale: 0.18, sheet: "wither-skeleton-sprites", h: 520 },
    "snow-golem": { hp: 8, speed: 60, dmg: 0, hw: 12, hh: 44, scale: 0.16, sheet: "snow-golem-sprites", h: 480, ally: true },
    "magma-cube": { hp: 8, speed: 45, dmg: 3, hw: 16, hh: 22, scale: 0.14, sheet: "magma-cube-sprites", h: 480 },
    drowned: { hp: 10, speed: 72, dmg: 3, hw: 12, hh: 50, scale: 0.17, sheet: "drowned-sprites", h: 520, aquatic: true },
    pillager: { hp: 8, speed: 85, dmg: 2, hw: 11, hh: 50, scale: 0.17, sheet: "pillager-sprites", h: 520 },
    minecart: { hp: 8, speed: 150, dmg: 0, hw: 20, hh: 16, scale: 0.14, sheet: "minecart-sprites", h: 400, passive: true },
    wither: { hp: 30, speed: 70, dmg: 6, hw: 16, hh: 52, scale: 0.16, sheet: "wither-sprites", h: 480, fly: true },
    "ender-dragon": { hp: 40, speed: 80, dmg: 8, hw: 28, hh: 40, scale: 0.12, sheet: "ender-dragon-sprites", h: 480, fly: true },
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
    saddled: false,
    mounted: false,
  };
}

function makeDrop(id, x, y, count = 1) {
  return { id, x, y, vy: -180, count, bob: Math.random() * Math.PI * 2, gone: false };
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
  dimension = "overworld";
  dimKeep.overworld = null;
  dimKeep.nether = null;
  dimKeep.end = null;
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
    makeMob("villager", 66, 10),
    makeMob("cat", 63, 10),
    makeMob("iron-golem", 67, 10),
    makeMob("witch", 58, 10),
    makeMob("bat", 45, 6),
    makeMob("squid", 16, 12),
    makeMob("zombie", 50, 10),
    makeMob("horse", 42, 10),
    makeMob("boat", 16, 11),
    makeMob("snow-golem", 72, 10),
    makeMob("drowned", 16, 12),
    makeMob("pillager", 59, 10),
    makeMob("minecart", 23, 8),
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
    makeDrop("potato", TILE * 7.4, TILE * 9, 4),
    makeDrop("music-disc-13", TILE * 63.4, TILE * 8),
    makeDrop("music-disc-cat", TILE * 64.6, TILE * 8),
    makeDrop("trident", TILE * 15.8, TILE * 9),
    makeDrop("bread", TILE * 4.5, TILE * 9, 2),
    makeDrop("netherite-chestplate", TILE * 66.8, TILE * 9),
    makeDrop("fishing-rod", TILE * 15.2, TILE * 9),
    makeDrop("saddle", TILE * 41.4, TILE * 9),
    makeDrop("oak-boat", TILE * 14.4, TILE * 9),
    makeDrop("lead", TILE * 9.2, TILE * 9, 2),
    makeDrop("totem", TILE * 60.4, TILE * 9),
    makeDrop("rail", TILE * 22.6, TILE * 7, 8),
    makeDrop("minecart", TILE * 24.2, TILE * 7),
    makeDrop("iron-block", TILE * 74.4, TILE * 9, 2),
    makeDrop("nether-star", TILE * 75.2, TILE * 8),
    makeDrop("paper", TILE * 58.6, TILE * 9, 4),
    makeDrop("firework", TILE * 59.2, TILE * 9, 2),
    makeDrop("glass", TILE * 63.2, TILE * 9, 6),
    makeDrop("egg", TILE * 8.6, TILE * 9, 2),
  ];
  particles = [];
  arrows = [];
  craftingOpen = false;
  chestOpen = false;
  furnaceOpen = false;
  brewOpen = false;
  chestKind = "chest";
  chestItems = emptySlots(CHEST_SLOTS);
  enderItems = emptySlots(CHEST_SLOTS);
  furnace = emptyFurnace();
  brew = emptyFurnace();
  craftScroll = 0;
  cam = { x: 0, y: 0 };
  time = 0;
  clock = 8;
  win = false;
  demo = null;
  hold.left = hold.right = hold.jump = hold.use = false;
  message = "向东走。套鞍骑马、坐船、走进传送门去下界。喂猫、钓鱼、下雨天回家。把 5 颗钻石放进箱子。";
  messageT = 5;
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
  if (!player || player.dead || win || uiOpen()) return;
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
  const mats = { leather: 0, iron: 0, gold: 0, chainmail: 0, diamond: 0, netherite: 0 };
  let pts = 0;
  for (const it of player.items) {
    const gear = ARMOR_GEAR[it.id];
    if (!gear || it.count <= 0 || worn[gear.slot]) continue;
    worn[gear.slot] = gear;
    pts += gear.pts;
    mats[gear.mat] += 1;
  }
  player.armor = Math.min(20, pts);
  player.armorMat = mats.netherite
    ? "netherite"
    : mats.diamond
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

function tryOpenTable() {
  if (!player.atTable) return false;
  chestOpen = false;
  furnaceOpen = false;
  brewOpen = false;
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
  furnaceOpen = false;
  brewOpen = false;
  if (chestOpen && chestKind === "chest") {
    chestOpen = false;
    say("关上了箱子。", 3);
  } else {
    chestOpen = true;
    chestKind = "chest";
    say("打开了箱子。点击格子存入或取出。", 3);
  }
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
    say("锻造台要把钻石盔甲拿在手里，并准备下界合金锭。");
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
    const names = { pig: "猪", cow: "牛", chicken: "鸡", sheep: "羊", wolf: "狼", rabbit: "兔子", villager: "村民", cat: "猫", horse: "马" };
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
  if (item?.id === "nether-wart" && item.count > 0 && soil === "^" && (above === "." || above === "G" || above === "f" || above === "P")) {
    setCell(world.tiles, tx, cropY, ":");
    item.count -= 1;
    say("种下了下界疣。");
    return true;
  }
  if (item?.id === "carrot" && item.count > 0 && soil === "n" && (above === "." || above === "G" || above === "f" || above === "P")) {
    setCell(world.tiles, tx, cropY, "-");
    item.count -= 1;
    say("种下了胡萝卜。");
    return true;
  }
  if (item?.id === "potato" && item.count > 0 && soil === "n" && (above === "." || above === "G" || above === "f" || above === "P")) {
    setCell(world.tiles, tx, cropY, "'");
    item.count -= 1;
    say("种下了马铃薯。");
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
  if (above === ">") {
    setCell(world.tiles, tx, cropY, ".");
    const n = 2 + (Math.random() < 0.5 ? 1 : 0);
    if (!addItem("nether-wart", n)) spillItem("nether-wart", n);
    burstBits(tx * TILE + 24, cropY * TILE + 24, "#8a2a3a");
    say("收割了下界疣。");
    return true;
  }
  if (above === ",") {
    setCell(world.tiles, tx, cropY, ".");
    const n = 1 + Math.floor(Math.random() * 3);
    if (!addItem("carrot", n)) spillItem("carrot", n);
    burstBits(tx * TILE + 24, cropY * TILE + 24, "#d9782a");
    say("收割了胡萝卜。");
    return true;
  }
  if (above === '"') {
    setCell(world.tiles, tx, cropY, ".");
    const n = 1 + Math.floor(Math.random() * 3);
    if (!addItem("potato", n)) spillItem("potato", n);
    burstBits(tx * TILE + 24, cropY * TILE + 24, "#c6b34a");
    say("收割了马铃薯。");
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
      if (below === "o" || below === "p" || below === "L" || "¦┊┆┇♠♧≡≣☰☷".includes(below)) setCell(world.tiles, x, y + 1, ".");
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
    if (spec) {
      if (!hasTool(spec, item)) {
        say(spec.tool === "axe" ? "需要斧才能砍这个。" : spec.tool === "shovel" ? "需要铲才能挖这个。" : "需要镐才能挖这个。");
        return true;
      }
      if (spec.tool || HELD_TOOLS.has(item?.id)) {
        if (player.swingT > 0) return true;
        startToolSwing(item?.id === "diamond-sword" ? "sword" : "tool");
      }
      if (t === "⇨") {
        const face = deviceFacing(cell.x, cell.y);
        const hx = cell.x + face;
        if (world.tiles[cell.y]?.[hx] === "➤") setCell(world.tiles, hx, cell.y, ".");
        world.pistonOut?.delete(gadgetKey(cell.x, cell.y));
      }
      if ("▷◉⇨▽".includes(t)) world.deviceFace?.delete(gadgetKey(cell.x, cell.y));
      if (t === "⌐") world.leverOn?.delete(gadgetKey(cell.x, cell.y));
      if (t === "☼") world.beaconLit?.delete(gadgetKey(cell.x, cell.y));
      setCell(world.tiles, cell.x, cell.y, "xiHRJKMO".includes(t) ? "s" : ".");
      const extra = t === "L" && item?.id === "shears" ? 1 : 0;
      drops.push(makeDrop(spec.drop, cell.x * TILE + 24, cell.y * TILE + 8, 1 + extra));
      if (t === ")") {
        const disc = world.jukebox?.get(`${cell.x},${cell.y}`);
        if (disc) {
          drops.push(makeDrop(disc, cell.x * TILE + 18, cell.y * TILE));
          world.jukebox.delete(`${cell.x},${cell.y}`);
        }
      }
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
      if (below && (SOLID.has(below) || below === "n" || below === "g" || below === "d" || below === "a" || below === "C" || below === "☁")) {
        if (item.id === "door-oak" || item.id === "door-iron") {
          if (world.tiles[ty - 1]?.[tx] !== ".") {
            say("上面没有空间装门。");
            return true;
          }
          if (item.id === "door-iron") {
            setCell(world.tiles, tx, ty, "⌊");
            setCell(world.tiles, tx, ty - 1, "⌈");
          } else {
            setCell(world.tiles, tx, ty, "D");
            setCell(world.tiles, tx, ty - 1, "U");
          }
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
          if ("dispenser piston hopper observer".split(" ").includes(item.id)) {
            ensureGadgetMaps();
            world.deviceFace.set(gadgetKey(tx, ty), player.face < 0 ? -1 : 1);
          }
          if (item.id === "sponge") soakSponge(tx, ty);
          if (item.id === "pumpkin" && tryBuildGolem(tx, ty)) {
            item.count -= 1;
            return true;
          }
          if (item.id === "wither-skull" && tryBuildWither(tx, ty)) {
            item.count -= 1;
            return true;
          }
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
      if (player.mount) dismount();
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
      cat: "string",
      squid: "ink-sac",
      witch: "redstone-dust",
      "iron-golem": "iron-ingot",
      horse: "leather",
      boat: "oak-boat",
      blaze: "blaze-rod",
      ghast: "ghast-tear",
      "wither-skeleton": "bone",
      "magma-cube": "slimeball",
      "snow-golem": "snowball",
      drowned: "rotten-flesh",
      pillager: "arrow",
      minecart: "minecart",
      wither: "nether-star",
      "ender-dragon": "elytra",
    };
    if (who.kind !== "bat") drops.push(makeDrop(loot[who.kind] ?? "apple", who.x, who.y - 20));
    if (who.kind === "cow") drops.push(makeDrop("leather", who.x + 6, who.y - 16));
    if (who.kind === "skeleton") drops.push(makeDrop("arrow", who.x - 8, who.y - 18));
    if (who.kind === "chicken") drops.push(makeDrop("feather", who.x + 6, who.y - 16));
    if (who.kind === "sheep" && !who.sheared) drops.push(makeDrop("white-wool", who.x + 6, who.y - 16));
    if (who.kind === "spider" && Math.random() < 0.4) drops.push(makeDrop("spider-eye", who.x + 6, who.y - 16));
    if (who.kind === "enderman" || Math.random() < 0.25) drops.push(makeDrop("diamond", who.x + 8, who.y - 24));
    if (who.kind === "witch") {
      drops.push(makeDrop("sugar", who.x + 6, who.y - 16));
      drops.push(makeDrop("stick", who.x - 6, who.y - 14));
    }
    if (who.kind === "iron-golem") drops.push(makeDrop("iron-ingot", who.x + 8, who.y - 16, 2));
    if (who.kind === "magma-cube" && Math.random() < 0.5) drops.push(makeDrop("coal", who.x + 6, who.y - 16));
    if (who.kind === "ghast") drops.push(makeDrop("gunpowder", who.x + 6, who.y - 16, 2));
    if (who.kind === "wither-skeleton") {
      drops.push(makeDrop("coal", who.x + 6, who.y - 16));
      if (Math.random() < 0.15) drops.push(makeDrop("wither-skull", who.x - 8, who.y - 18));
      if (Math.random() < 0.12) drops.push(makeDrop("stone-sword", who.x - 8, who.y - 18));
    }
    if (who.kind === "ender-dragon") {
      drops.push(makeDrop("dragon-egg", who.x - 8, who.y - 18));
      say("末影龙倒下了。鞘翅和龙蛋掉了出来。", 5);
    }
    if (who.leashed) drops.push(makeDrop("lead", who.x, who.y - 14));
    if (who.kind === "snow-golem") drops.push(makeDrop("snowball", who.x + 6, who.y - 16, 4));
    if (who.kind === "drowned" && Math.random() < 0.18) drops.push(makeDrop("trident", who.x - 8, who.y - 18));
    if (who.kind === "pillager" && Math.random() < 0.22) drops.push(makeDrop("crossbow", who.x - 8, who.y - 18));
    if (player.mount === who) dismount();
    spawnXp(who.x, who.y - 18, who.kind === "villager" ? 3 : who.passive ? 2 : 4);
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

const LEASHABLE = new Set(["pig", "cow", "sheep", "chicken", "wolf", "rabbit", "cat", "horse"]);

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
  if (furnaceOpen) {
    furnaceOpen = false;
    say("关上了熔炉。");
    return;
  }
  if (brewOpen) {
    brewOpen = false;
    say("关上了酿造台。");
    return;
  }
  if (player.sleeping > 0 || player.eatT > 0) return;
  if (tryToggleDoor()) return;
  if (tryGadget()) return;
  if (tryOpenBrew()) return;
  if (tryOpenFurnace()) return;
  if (tryEnchant()) return;
  if (tryAnvil()) return;
  if (trySmith()) return;
  if (tryBeacon()) return;
  if (tryOpenChest()) return;
  if (tryOpenTable()) return;
  if (tryEatCake()) return;
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
  if (tryTrade()) return;
  if (trySaddle()) return;
  if (tryMount()) return;
  if (tryPlaceBoat()) return;
  if (tryPlaceMinecart()) return;
  if (tryLead()) return;
  if (tryShear()) return;
  if (tryFlint()) return;
  if (tryHoe()) return;
  if (tryBucket()) return;
  if (tryFarm()) return;
  if (tryThrowPearl()) return;
  if (tryThrowSnowball()) return;
  if (tryThrowTrident()) return;
  if (tryFish()) return;
  if (tryNoteblock()) return;
  if (tryJukebox()) return;
  if (tryFirework()) return;
  if (tryMineOrPlace()) return;
  const item = selectedItem();
  if (!item || item.count <= 0) return;
  if (SWORD_IDS.has(item.id)) {
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
      hurt(mob, 3 + (player.sharpness ?? 0), player.face);
    }
  }
}

function updatePlayer(dt) {
  if (player.dead) {
    player.age += dt;
    player.frame = Math.min(11, Math.floor(player.age * 10));
    return;
  }

  if (craftingOpen || chestOpen || furnaceOpen || brewOpen) {
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
  const sneak = keys.has("shift");
  const sprint = keys.has("control") && !sneak;
  const mount = player.mount && !player.mount.dead ? player.mount : null;
  if (player.mount && !mount) dismount();
  const speed = (player.inWater || mount?.kind === "boat" ? MOVE * 0.55 : sneak ? MOVE * 0.45 : sprint ? MOVE * 1.45 : mount?.kind === "horse" ? MOVE * 1.55 : mount?.kind === "minecart" ? MOVE * 1.35 : MOVE) * (player.beaconT > 0 ? 1.22 : 1);

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
    const wish = (right ? speed : 0) - (left ? speed : 0);
    const under = tileAt(player.x, player.y + 2);
    const iceGrip = under === "❄" ? 0.08 : under === "I" ? 0.16 : 1;
    if (iceGrip < 1 && player.grounded) {
      player.vx += (wish - player.vx) * iceGrip;
      if (wish === 0 && Math.abs(player.vx) < 6) player.vx = 0;
    } else player.vx = wish;
    if (left) player.face = -1;
    if (right) player.face = 1;
  } else {
    player.vx *= 0.85;
  }

  const onLadder = tileAt(player.x, player.y - 8) === "h" || tileAt(player.x, player.y - 24) === "h";
  if (!player.mount && jump && player.eatT <= 0 && (player.grounded || player.inWater || onLadder)) {
    player.vy = player.inWater || onLadder ? -420 : -JUMP;
    player.grounded = false;
  }

  if (!player.mount) moveBody(player, dt);
  tryGlide(dt, jump);

  if (player.fireRes > 0) player.fireRes = Math.max(0, player.fireRes - dt);
  if (player.beaconT > 0) {
    player.beaconT = Math.max(0, player.beaconT - dt);
    player.beaconTick = (player.beaconTick ?? 0) + dt;
    if (player.beaconTick >= 1.2) {
      player.beaconTick = 0;
      if (player.health < 20) player.health = Math.min(20, player.health + 1);
    }
  } else player.beaconTick = 0;
  if (player.atBeacon && world.beaconLit && [...world.beaconLit].length) player.beaconT = 2.5;
  if (world?.beaconLit) {
    for (const key of world.beaconLit) {
      const [bx] = key.split(",").map(Number);
      if (Math.abs(player.x - (bx * TILE + 24)) < 220) player.beaconT = 2.5;
    }
  }
  if (player.wither > 0) {
    player.wither -= dt;
    player.witherTick = (player.witherTick ?? 0) + dt;
    if (player.witherTick >= 1) {
      player.witherTick = 0;
      hurt(player, 1, 0);
    }
  } else player.witherTick = 0;

  if (player.inLava && !(player.fireRes > 0)) hurt(player, 3, -player.face);
  const foot = tileAt(player.x, player.y - 4);
  if (foot === "*" && !(player.fireRes > 0)) hurt(player, 2, -player.face);
  if (foot === "?" && !(player.fireRes > 0)) hurt(player, 2, -player.face);
  if (foot === "^") {
    player.vx *= 0.45;
    if (player.mount) player.mount.vx *= 0.45;
  }
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
  if (!hasShield()) player.shieldHeld = false;

  if (player.fishT > 0) {
    if (selectedItem()?.id !== "fishing-rod") player.fishT = 0;
    else {
      player.fishT -= dt;
      player.vx *= 0.4;
      if (player.fishT <= 0) {
        player.fishT = 0;
        const catchId = Math.random() < 0.18 ? "ink-sac" : "raw-cod";
        if (addItem(catchId, 1)) say(`钓到了${ITEM_LABELS[catchId]}。`);
        else spillItem(catchId, 1);
      }
    }
  }

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
      if (mob.mounted) continue;
      if (mob.leashed && !player.dead) mob.followT = Math.max(mob.followT, 1.2);
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
      if (mob.kind === "cat" && mob.grounded && Math.abs(mob.vx) > 20 && Math.random() < 0.05) mob.vy = -240;
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
      if (mob.inLava && mob.kind !== "blaze" && mob.kind !== "magma-cube" && mob.kind !== "ghast") hurt(mob, 4, -mob.face);
      if (mob.kind === "snow-golem" && (dimension === "nether" || isRaining())) hurt(mob, 2, 0);
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
        if (mob.kind === "slime" && mob.grounded && Math.random() < 0.06) mob.vy = -420;
        if (mob.kind === "magma-cube" && mob.grounded && Math.random() < 0.07) mob.vy = -440;
      } else {
        mob.vx *= 0.8;
      }
    }
    moveBody(mob, dt);
    if (mob.inLava && mob.kind !== "blaze" && mob.kind !== "magma-cube" && mob.kind !== "ghast" && mob.kind !== "wither" && mob.kind !== "ender-dragon") hurt(mob, 4, -mob.face);
    if (mob.kind === "snow-golem" && (dimension === "nether" || isRaining())) hurt(mob, 2, 0);
    if (mob.kind !== "creeper" && mob.kind !== "skeleton" && mob.kind !== "pillager" && mob.kind !== "witch" && mob.kind !== "blaze" && mob.kind !== "ghast" && mob.kind !== "wither" && mob.kind !== "ender-dragon" && !mob.ally && !player.dead && Math.abs(mob.x - player.x) < mob.hw + player.hw + 4 && Math.abs(mob.y - player.y) < mob.hh) {
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
    shot.vy += (shot.fireball ? 36 : 260) * dt;
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
    if (!player.dead && Math.abs(shot.x - player.x) < (shot.fireball ? 22 : 14) && Math.abs(shot.y - (player.y - 22)) < (shot.fireball ? 36 : 28)) {
      hurt(player, shot.dmg ?? 2, Math.sign(shot.vx) || -1);
      if (shot.witherSkull) player.wither = Math.max(player.wither ?? 0, 6);
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
    if (world && !world.nightSpawned && dimension === "overworld") {
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
      const spec = WHEAT_STAGE[t] ?? WART_STAGE[t] ?? CARROT_STAGE[t] ?? POTATO_STAGE[t];
      if (spec && Math.random() < 1 / spec.wait) setCell(world.tiles, x, y, spec.next);
      if (t === "S" && Math.random() < 1 / 16) tree(world.tiles, x, y + 1);
      if (t === "Y" && y > 0 && world.tiles[y - 1][x] === "." && Math.random() < 1 / 18) {
        const below = world.tiles[y + 1]?.[x];
        if (below === "a" || below === "d" || below === "g" || below === "Y") setCell(world.tiles, x, y - 1, "Y");
      }
    }
  }
}

function updateJukebox(dt) {
  if (!world?.jukebox) return;
  for (const [key, disc] of world.jukebox) {
    const [x, y] = key.split(",").map(Number);
    if (Math.random() < dt * 2.2) burstBits(x * TILE + 24, y * TILE + 8, disc === "music-disc-cat" ? "#f2a63b" : "#8ec8e8");
  }
}

function updateDoors(dt) {
  if (!world?.doorOpen) return;
  const speed = 1 / 0.32;
  for (const st of world.doorOpen.values()) {
    const target = st.open ? 1 : 0;
    if (st.t < target) st.t = Math.min(target, st.t + dt * speed);
    else if (st.t > target) st.t = Math.max(target, st.t - dt * speed);
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
  if (item.id === "fishing-rod" && player.fishT > 0) return "fishing-rod-cast";
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
  return kind === "pig" || kind === "cow" || kind === "chicken" || kind === "sheep" || kind === "wolf" || kind === "slime" || kind === "rabbit" || kind === "villager" || kind === "cat" || kind === "bat" || kind === "squid" || kind === "witch" || kind === "iron-golem" || kind === "horse" || kind === "boat" || kind === "blaze" || kind === "magma-cube" || kind === "ghast" || kind === "snow-golem" || kind === "pillager" || kind === "minecart" || kind === "wither" || kind === "ender-dragon" ? 8 : 12;
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
      else if (t === "F" && furnace.burn > 0) drawTile("blocks/furnace-on.svg", dx, dy);
      else if (t === "U" && world.tiles[y + 1]?.[x] === "D") continue;
      else if (t === "⌈" && world.tiles[y + 1]?.[x] === "⌊") continue;
      else if (t === "D") {
        const spec = { w: 256, h: 512, ax: 128, ay: 496, scale: TILE / 16 };
        drawAnchored(`door-sprites/swing-${doorFrame(world.doorOpen.get(x)?.t ?? 0)}.svg`, spec, dx + TILE / 2, dy + TILE, 1);
      } else if (t === "⌊") {
        const spec = { w: 256, h: 512, ax: 128, ay: 496, scale: TILE / 16 };
        drawAnchored(`iron-door-sprites/swing-${doorFrame(world.doorOpen.get(x)?.t ?? 0)}.svg`, spec, dx + TILE / 2, dy + TILE, 1);
      } else if (t === "C" && chestOpen && player.atChest && Math.abs(x * TILE + 24 - player.x) < 80) {
        drawTile("blocks/chest-open.svg", dx, dy);
      } else if (t === "N" && world.tntFuse.has(`${x},${y}`)) {
        const primed = Math.floor(time * 16) % 2 === 0;
        drawTile(primed ? "blocks/tnt-primed.svg" : BLOCKS[t], dx, dy);
      } else if (t === "*") {
        const f = 1 + (Math.floor(time * 10) % 7);
        drawTile(`blocks/fire-${f}.svg`, dx, dy);
      } else if (t === "╪" && (isPowered(x, y) || isPowered(x, y + 1) || isPowered(x - 1, y) || isPowered(x + 1, y))) {
        drawTile("blocks/powered-rail-on.svg", dx, dy);
      } else if (t === "☼") {
        drawTile(BLOCKS[t], dx, dy);
        if (world.beaconLit?.has(`${x},${y}`)) {
          ctx.fillStyle = "rgba(150, 230, 255, 0.3)";
          ctx.fillRect(dx + 14, 0, 20, dy);
        }
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
    if (shot.fireball) {
      if (shot.witherSkull) {
        const skull = img("items/wither-skull.svg") ?? img("blocks/wither-skull.svg");
        if (!skull) continue;
        ctx.drawImage(skull, viewX(shot.x) - 16, viewY(shot.y) - 16, 32, 32);
        continue;
      }
      const pic = img(`blocks/fire-${1 + (Math.floor(time * 10) % 7)}.svg`);
      if (!pic) continue;
      const s = 40;
      ctx.drawImage(pic, viewX(shot.x) - s / 2, viewY(shot.y) - s / 2, s, s);
      continue;
    }
    const rel = shot.pearl ? "items/ender-pearl.svg" : shot.snowball ? "items/snowball.svg" : shot.potion ? "items/potion-heal.svg" : shot.trident ? "items/trident.svg" : "items/arrow.svg";
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

function activeChestItems() {
  return chestKind === "ender" ? enderItems : chestItems;
}

function clickChestSlot(hit) {
  if (!hit) return;
  const bag = activeChestItems();
  if (hit.kind === "chest") {
    if (transferStack(bag, hit.index, player.items, 9)) {
      refreshArmor();
      say("取出了物品。");
    }
    else if (bag[hit.index]?.count > 0) say("快捷栏满了。");
  } else {
    if (transferStack(player.items, hit.index, bag, CHEST_SLOTS)) {
      refreshArmor();
      say(chestKind === "ender" ? "放进了末影箱。" : "放进了箱子。");
      if (chestKind !== "ender") checkChestWin();
    } else if (player.items[hit.index]?.count > 0) say(chestKind === "ender" ? "末影箱满了。" : "箱子满了。");
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
  ctx.fillText(chestKind === "ender" ? "末影箱" : "箱子", box.x + 18, box.y + 32);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#ddd";
  ctx.fillText("点击箱子格子取出  ·  点击快捷栏存入  ·  Esc 关闭", box.x + 18, box.y + 52);

  const originX = box.x + 18;
  const chestY = box.y + 64;
  const gap = 38;
  const bag = activeChestItems();
  for (let i = 0; i < CHEST_SLOTS; i++) {
    const col = i % 9;
    const row = Math.floor(i / 9);
    drawItemSlot(bag[i], originX + col * gap, chestY + row * gap, 34);
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

  drawImage("hud/crosshair.svg", viewW / 2 - 10, viewH / 2 - 10, 20, 20);

  ctx.textAlign = "left";
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(`箱子钻石 ${chestDiamonds()} / ${GOAL_DIAMONDS}   ${hourLabel()}   Lv ${player.level ?? 0}${player.sharpness ? `  锋利${player.sharpness}` : ""}${player.fireRes > 0 ? "  抗火" : ""}${player.wither > 0 ? "  凋零" : ""}${player.beaconT > 0 ? "  信标" : ""}`, 16, 28);
  if (craftingOpen) drawCraftPanel();
  if (chestOpen) drawChestPanel();
  if (furnaceOpen) drawFurnacePanel();
  if (brewOpen) drawBrewPanel();
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
      updateJukebox(dt);
      updateDoors(dt);
      updateGadgets(dt);
      updateHazards(dt);
      furnaceTick(furnace, dt);
      brewTick(brew, dt);
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
  KeyE: "e",
  KeyR: "r",
  Space: " ",
  ArrowLeft: "arrowleft",
  ArrowRight: "arrowright",
  ArrowUp: "arrowup",
  ArrowDown: "arrowdown",
  Escape: "escape",
  KeyQ: "q",
  KeyF: "f",
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
  if (key === "f" && mode === "play" && !uiOpen() && !e.repeat) swapOffhand();
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
  if (brewOpen) {
    const pos = canvasPos(e);
    const hit = furnaceSlotAt(pos.x, pos.y);
    if (hit) clickBrewSlot(hit);
    else {
      const box = furnacePanelBox();
      if (pos.x < box.x || pos.x > box.x + box.w || pos.y < box.y || pos.y > box.y + box.h) {
        brewOpen = false;
        say("关上了酿造台。");
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
