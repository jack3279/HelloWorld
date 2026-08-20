// Shapeless bag recipes for the overworld crafting table.
// Every id must already have an official SVG in assets/items or assets/blocks.

function armorSet(metal, ingot) {
  return [
    { id: `${metal}-helmet`, count: 1, need: { [ingot]: 5 } },
    { id: `${metal}-chestplate`, count: 1, need: { [ingot]: 8 } },
    { id: `${metal}-leggings`, count: 1, need: { [ingot]: 7 } },
    { id: `${metal}-boots`, count: 1, need: { [ingot]: 4 } },
  ];
}

export const RECIPES = [
  { id: "oak-planks", count: 4, need: { "oak-log": 1 } },
  { id: "birch-planks", count: 4, need: { "birch-log": 1 } },
  { id: "spruce-planks", count: 4, need: { "spruce-log": 1 } },
  { id: "stick", count: 4, need: { "oak-planks": 2 } },
  { id: "stick", count: 4, need: { "birch-planks": 2 } },
  { id: "stick", count: 4, need: { "spruce-planks": 2 } },
  { id: "crafting-table", count: 1, need: { "oak-planks": 4 } },
  { id: "chest", count: 1, need: { "oak-planks": 8 } },
  { id: "furnace", count: 1, need: { cobblestone: 8 } },
  { id: "ladder", count: 3, need: { stick: 7 } },
  { id: "torch", count: 4, need: { stick: 1, coal: 1 } },
  { id: "torch", count: 4, need: { stick: 1, charcoal: 1 } },
  { id: "white-wool", count: 1, need: { string: 4 } },
  { id: "bed", count: 1, need: { "white-wool": 3, "oak-planks": 3 } },
  { id: "tnt", count: 1, need: { gunpowder: 4, sand: 4 } },
  { id: "paper", count: 3, need: { "sugar-cane": 3 } },
  { id: "book", count: 1, need: { paper: 3, leather: 1 } },
  { id: "bookshelf", count: 1, need: { "oak-planks": 6, book: 3 } },
  { id: "noteblock", count: 1, need: { "oak-planks": 8, "redstone-dust": 1 } },
  { id: "jukebox", count: 1, need: { "oak-planks": 8, diamond: 1 } },
  { id: "hopper", count: 1, need: { "iron-ingot": 5, chest: 1 } },
  { id: "dispenser", count: 1, need: { cobblestone: 7, bow: 1, "redstone-dust": 1 } },
  { id: "piston", count: 1, need: { "oak-planks": 3, cobblestone: 4, "iron-ingot": 1, "redstone-dust": 1 } },
  { id: "sandstone", count: 1, need: { sand: 4 } },
  { id: "stone-bricks", count: 4, need: { stone: 4 } },
  { id: "hay", count: 1, need: { wheat: 9 } },
  { id: "bread", count: 1, need: { wheat: 3 } },
  { id: "cookie", count: 8, need: { wheat: 2, "cocoa-beans": 1 } },
  { id: "sugar", count: 1, need: { "sugar-cane": 1 } },
  { id: "arrow", count: 4, need: { stick: 1, feather: 1 } },
  { id: "bow", count: 1, need: { stick: 3, string: 3 } },
  { id: "wooden-sword", count: 1, need: { "oak-planks": 2, stick: 1 } },
  { id: "wooden-pickaxe", count: 1, need: { "oak-planks": 3, stick: 2 } },
  { id: "wooden-axe", count: 1, need: { "oak-planks": 3, stick: 2 } },
  { id: "wooden-hoe", count: 1, need: { "oak-planks": 2, stick: 2 } },
  { id: "wooden-shovel", count: 1, need: { "oak-planks": 1, stick: 2 } },
  { id: "stone-sword", count: 1, need: { cobblestone: 2, stick: 1 } },
  { id: "stone-pickaxe", count: 1, need: { cobblestone: 3, stick: 2 } },
  { id: "stone-axe", count: 1, need: { cobblestone: 3, stick: 2 } },
  { id: "stone-hoe", count: 1, need: { cobblestone: 2, stick: 2 } },
  { id: "stone-shovel", count: 1, need: { cobblestone: 1, stick: 2 } },
  { id: "iron-sword", count: 1, need: { "iron-ingot": 2, stick: 1 } },
  { id: "iron-pickaxe", count: 1, need: { "iron-ingot": 3, stick: 2 } },
  { id: "iron-axe", count: 1, need: { "iron-ingot": 3, stick: 2 } },
  { id: "iron-hoe", count: 1, need: { "iron-ingot": 2, stick: 2 } },
  { id: "iron-shovel", count: 1, need: { "iron-ingot": 1, stick: 2 } },
  { id: "diamond-sword", count: 1, need: { diamond: 2, stick: 1 } },
  { id: "diamond-pickaxe", count: 1, need: { diamond: 3, stick: 2 } },
  { id: "diamond-axe", count: 1, need: { diamond: 3, stick: 2 } },
  { id: "diamond-hoe", count: 1, need: { diamond: 2, stick: 2 } },
  { id: "diamond-shovel", count: 1, need: { diamond: 1, stick: 2 } },
  { id: "shears", count: 1, need: { "iron-ingot": 2 } },
  { id: "bucket", count: 1, need: { "iron-ingot": 3 } },
  { id: "flint-and-steel", count: 1, need: { flint: 1, "iron-ingot": 1 } },
  { id: "fishing-rod", count: 1, need: { stick: 3, string: 2 } },
  { id: "bowl", count: 4, need: { "oak-planks": 3 } },
  { id: "mushroom-stew", count: 1, need: { bowl: 1, "red-mushroom": 1, "brown-mushroom": 1 } },
  { id: "cake", count: 1, need: { wheat: 3, sugar: 2, egg: 1 } },
  { id: "bone-meal", count: 3, need: { bone: 1 } },
  { id: "oak-door", count: 3, need: { "oak-planks": 6 } },
  { id: "oak-trapdoor", count: 2, need: { "oak-planks": 6 } },
  { id: "campfire", count: 1, need: { stick: 3, coal: 1, "oak-log": 3 } },
  { id: "campfire", count: 1, need: { stick: 3, charcoal: 1, "oak-log": 3 } },
  { id: "lantern", count: 1, need: { torch: 1, "iron-nugget": 8 } },
  { id: "composter", count: 1, need: { "oak-planks": 7 } },
  { id: "iron-bars", count: 16, need: { "iron-ingot": 6 } },
  { id: "glowstone", count: 1, need: { "glowstone-dust": 4 } },
  { id: "golden-apple", count: 1, need: { apple: 1, "gold-ingot": 8 } },
  { id: "pumpkin-pie", count: 1, need: { pumpkin: 1, sugar: 1, egg: 1 } },
  { id: "netherite-ingot", count: 1, need: { "netherite-scrap": 4, "gold-ingot": 4 } },
  { id: "netherite-helmet", count: 1, need: { "netherite-ingot": 1, "diamond-helmet": 1 } },
  { id: "netherite-chestplate", count: 1, need: { "netherite-ingot": 1, "diamond-chestplate": 1 } },
  { id: "netherite-leggings", count: 1, need: { "netherite-ingot": 1, "diamond-leggings": 1 } },
  { id: "netherite-boots", count: 1, need: { "netherite-ingot": 1, "diamond-boots": 1 } },
  { id: "iron-block", count: 1, need: { "iron-ingot": 9 } },
  { id: "gold-block", count: 1, need: { "gold-ingot": 9 } },
  { id: "diamond-block", count: 1, need: { diamond: 9 } },
  { id: "emerald-block", count: 1, need: { emerald: 9 } },
  { id: "copper-block", count: 1, need: { "copper-ingot": 9 } },
  { id: "iron-ingot", count: 9, need: { "iron-block": 1 } },
  { id: "gold-ingot", count: 9, need: { "gold-block": 1 } },
  { id: "diamond", count: 9, need: { "diamond-block": 1 } },
  { id: "emerald", count: 9, need: { "emerald-block": 1 } },
  { id: "copper-ingot", count: 9, need: { "copper-block": 1 } },
  { id: "iron-nugget", count: 9, need: { "iron-ingot": 1 } },
  { id: "gold-nugget", count: 9, need: { "gold-ingot": 1 } },
  { id: "iron-ingot", count: 1, need: { "iron-nugget": 9 } },
  { id: "gold-ingot", count: 1, need: { "gold-nugget": 9 } },
  { id: "wheat", count: 9, need: { hay: 1 } },
  ...armorSet("leather", "leather"),
  ...armorSet("iron", "iron-ingot"),
  ...armorSet("gold", "gold-ingot"),
  ...armorSet("diamond", "diamond"),
];

export const SMELT = {
  "iron-ore": { out: "iron-ingot" },
  "gold-ore": { out: "gold-ingot" },
  "copper-ore": { out: "copper-ingot" },
  cobblestone: { out: "stone" },
  sand: { out: "glass" },
  potato: { out: "baked-potato" },
  clay: { out: "bricks" },
  "oak-log": { out: "charcoal" },
  "birch-log": { out: "charcoal" },
  "spruce-log": { out: "charcoal" },
  porkchop: { out: "cooked-porkchop" },
  beef: { out: "steak" },
  "raw-chicken": { out: "cooked-chicken" },
  "raw-mutton": { out: "cooked-mutton" },
  "raw-cod": { out: "cooked-cod" },
  netherrack: { out: "nether-bricks" },
};

export const FUELS = new Set(["coal", "charcoal"]);

export const CAMPFIRE_COOK = {
  porkchop: "cooked-porkchop",
  beef: "steak",
  "raw-chicken": "cooked-chicken",
  "raw-mutton": "cooked-mutton",
  "raw-cod": "cooked-cod",
  potato: "baked-potato",
};

export const COMPOST = new Set([
  "wheat",
  "wheat-seeds",
  "apple",
  "oak-sapling",
  "sugar-cane",
  "potato",
  "carrot",
  "nether-wart",
  "cocoa-beans",
  "brown-mushroom",
  "red-mushroom",
  "pumpkin",
  "melon-slice",
]);

export const ARMOR = {
  "leather-helmet": { slot: "head", value: 1 },
  "leather-chestplate": { slot: "chest", value: 3 },
  "leather-leggings": { slot: "legs", value: 2 },
  "leather-boots": { slot: "feet", value: 1 },
  "chainmail-helmet": { slot: "head", value: 2 },
  "chainmail-chestplate": { slot: "chest", value: 5 },
  "chainmail-leggings": { slot: "legs", value: 4 },
  "chainmail-boots": { slot: "feet", value: 1 },
  "iron-helmet": { slot: "head", value: 2 },
  "iron-chestplate": { slot: "chest", value: 6 },
  "iron-leggings": { slot: "legs", value: 5 },
  "iron-boots": { slot: "feet", value: 2 },
  "gold-helmet": { slot: "head", value: 2 },
  "gold-chestplate": { slot: "chest", value: 5 },
  "gold-leggings": { slot: "legs", value: 3 },
  "gold-boots": { slot: "feet", value: 1 },
  "diamond-helmet": { slot: "head", value: 3 },
  "diamond-chestplate": { slot: "chest", value: 8 },
  "diamond-leggings": { slot: "legs", value: 6 },
  "diamond-boots": { slot: "feet", value: 3 },
  "netherite-helmet": { slot: "head", value: 3 },
  "netherite-chestplate": { slot: "chest", value: 8 },
  "netherite-leggings": { slot: "legs", value: 6 },
  "netherite-boots": { slot: "feet", value: 3 },
};

export const FOOD = {
  bread: { hunger: 5, health: 0 },
  steak: { hunger: 8, health: 0 },
  apple: { hunger: 4, health: 0 },
  "golden-apple": { hunger: 4, health: 8 },
  "potion-heal": { hunger: 0, health: 8 },
  "cooked-porkchop": { hunger: 8, health: 0 },
  "cooked-chicken": { hunger: 6, health: 0 },
  "cooked-mutton": { hunger: 6, health: 0 },
  porkchop: { hunger: 3, health: 0 },
  beef: { hunger: 3, health: 0 },
  "raw-chicken": { hunger: 2, health: -1 },
  "raw-mutton": { hunger: 2, health: 0 },
  "raw-cod": { hunger: 2, health: 0 },
  "cooked-cod": { hunger: 5, health: 0 },
  carrot: { hunger: 3, health: 0 },
  potato: { hunger: 1, health: 0 },
  "baked-potato": { hunger: 5, health: 0 },
  cookie: { hunger: 2, health: 0 },
  "rotten-flesh": { hunger: 4, health: -2 },
  "pumpkin-pie": { hunger: 8, health: 0 },
  "melon-slice": { hunger: 2, health: 0 },
  "spider-eye": { hunger: 2, health: -3 },
  "red-mushroom": { hunger: 1, health: -1 },
  "brown-mushroom": { hunger: 1, health: -1 },
  cake: { hunger: 8, health: 0 },
  "mushroom-stew": { hunger: 6, health: 0 },
};

export const ITEM_LABELS = {
  "diamond-sword": "钻石剑",
  "diamond-pickaxe": "钻石镐",
  torch: "火把",
  bread: "面包",
  steak: "熟牛排",
  apple: "苹果",
  "golden-apple": "金苹果",
  "potion-heal": "治疗药水",
  diamond: "钻石",
  "iron-helmet": "铁头盔",
  "iron-chestplate": "铁胸甲",
  "iron-leggings": "铁护腿",
  "iron-boots": "铁靴子",
  "gold-helmet": "金头盔",
  "gold-chestplate": "金胸甲",
  "gold-leggings": "金护腿",
  "gold-boots": "金靴子",
  "diamond-helmet": "钻石头盔",
  "diamond-chestplate": "钻石胸甲",
  "diamond-leggings": "钻石护腿",
  "diamond-boots": "钻石靴子",
  "netherite-helmet": "下界合金头盔",
  "netherite-chestplate": "下界合金胸甲",
  "netherite-leggings": "下界合金护腿",
  "netherite-boots": "下界合金靴子",
  "chainmail-helmet": "锁链头盔",
  "chainmail-chestplate": "锁链胸甲",
  "chainmail-leggings": "锁链护腿",
  "chainmail-boots": "锁链靴子",
  "rotten-flesh": "腐肉",
  bone: "骨头",
  arrow: "箭",
  string: "线",
  gunpowder: "火药",
  "spider-eye": "蜘蛛眼",
  "ender-pearl": "末影珍珠",
  "cooked-porkchop": "熟猪排",
  "cooked-chicken": "熟鸡肉",
  "cooked-mutton": "熟羊肉",
  carrot: "胡萝卜",
  wheat: "小麦",
  "wheat-seeds": "小麦种子",
  leather: "皮革",
  "leather-helmet": "皮革头盔",
  "leather-chestplate": "皮革胸甲",
  "leather-leggings": "皮革护腿",
  "leather-boots": "皮革靴子",
  emerald: "绿宝石",
  saddle: "鞍",
  coal: "煤炭",
  cobblestone: "圆石",
  dirt: "泥土",
  pumpkin: "南瓜",
  "melon-slice": "西瓜片",
  "oak-log": "橡木原木",
  "birch-log": "白桦原木",
  "spruce-log": "云杉原木",
  "oak-planks": "橡木木板",
  stick: "木棍",
  "crafting-table": "工作台",
  bow: "弓",
  "wooden-sword": "木剑",
  "wooden-pickaxe": "木镐",
  "wooden-axe": "木斧",
  "wooden-hoe": "木锄",
  "wooden-shovel": "木铲",
  "stone-sword": "石剑",
  "stone-pickaxe": "石镐",
  "stone-axe": "石斧",
  "stone-hoe": "石锄",
  "stone-shovel": "石铲",
  "iron-sword": "铁剑",
  "iron-pickaxe": "铁镐",
  "iron-axe": "铁斧",
  "iron-hoe": "铁锄",
  "iron-shovel": "铁铲",
  "diamond-axe": "钻石斧",
  "diamond-hoe": "钻石锄",
  "diamond-shovel": "钻石铲",
  shears: "剪刀",
  bucket: "桶",
  "water-bucket": "水桶",
  "lava-bucket": "熔岩桶",
  "milk-bucket": "奶桶",
  "iron-ingot": "铁锭",
  "gold-ingot": "金锭",
  "copper-ingot": "铜锭",
  lapis: "青金石",
  "cocoa-beans": "可可豆",
  "netherite-scrap": "下界合金碎片",
  "netherite-ingot": "下界合金锭",
  "music-disc": "唱片",
  sugar: "糖",
  egg: "鸡蛋",
  "pumpkin-pie": "南瓜派",
  "flint-and-steel": "打火石",
  flint: "燧石",
  charcoal: "木炭",
  paper: "纸",
  book: "书",
  "bone-meal": "骨粉",
  "fishing-rod": "钓鱼竿",
  "raw-cod": "生鳕鱼",
  "cooked-cod": "熟鳕鱼",
  porkchop: "生猪排",
  beef: "生牛肉",
  "raw-chicken": "生鸡肉",
  "raw-mutton": "生羊肉",
  "glowstone-dust": "荧石粉",
  "iron-nugget": "铁粒",
  "gold-nugget": "金粒",
  quartz: "下界石英",
  cake: "蛋糕",
  "mushroom-stew": "蘑菇煲",
  "nether-wart": "地狱疣",
  bowl: "碗",
  "oak-door": "橡木门",
  snowball: "雪球",
  slimeball: "粘液球",
  feather: "羽毛",
  "redstone-dust": "红石粉",
  cookie: "曲奇",
  potato: "马铃薯",
  "baked-potato": "烤马铃薯",
  "sugar-cane": "甘蔗",
  bed: "床",
  sand: "沙子",
  stone: "石头",
  bricks: "砖块",
  furnace: "熔炉",
  chest: "箱子",
  tnt: "TNT",
  ladder: "梯子",
  bookshelf: "书架",
  noteblock: "音符盒",
  jukebox: "唱片机",
  hopper: "漏斗",
  dispenser: "发射器",
  piston: "活塞",
  "white-wool": "白色羊毛",
  sandstone: "砂岩",
  "stone-bricks": "石砖",
  hay: "干草块",
  glass: "玻璃",
  "iron-block": "铁块",
  "gold-block": "金块",
  "diamond-block": "钻石块",
  "emerald-block": "绿宝石块",
  "iron-ore": "铁矿石",
  "gold-ore": "金矿石",
  "copper-ore": "铜矿石",
  clay: "粘土",
  gravel: "沙砾",
  glowstone: "荧石",
  obsidian: "黑曜石",
  netherrack: "下界岩",
  "soul-sand": "灵魂沙",
  magma: "岩浆块",
  sponge: "海绵",
  "oak-sapling": "橡树树苗",
  "oak-leaves": "橡树树叶",
  "birch-planks": "白桦木板",
  "spruce-planks": "云杉木板",
  "acacia-planks": "金合欢木板",
  "dark-oak-planks": "深色橡木木板",
  cactus: "仙人掌",
  snow: "雪块",
  ice: "冰",
  "blue-ice": "蓝冰",
  "lily-pad": "睡莲",
  vine: "藤蔓",
  "red-mushroom": "红蘑菇",
  "brown-mushroom": "棕蘑菇",
  "enchanting-table": "附魔台",
  granite: "花岗岩",
  andesite: "安山岩",
  diorite: "闪长岩",
  "nether-bricks": "下界砖",
  "mossy-cobblestone": "苔石",
  "door-iron": "铁门",
  observer: "观察者",
  "grass-path": "草径",
  campfire: "营火",
  lantern: "灯笼",
  "oak-trapdoor": "橡木活板门",
  composter: "堆肥桶",
  "nether-quartz-ore": "下界石英矿",
  "copper-block": "铜块",
  "iron-bars": "铁栏杆",
};

const FROM_BLOCKS = new Set([
  "crafting-table",
  "furnace",
  "chest",
  "tnt",
  "ladder",
  "bookshelf",
  "noteblock",
  "jukebox",
  "hopper",
  "dispenser",
  "piston",
  "white-wool",
  "sandstone",
  "stone-bricks",
  "hay",
  "glass",
  "iron-block",
  "gold-block",
  "diamond-block",
  "emerald-block",
  "iron-ore",
  "gold-ore",
  "copper-ore",
  "clay",
  "gravel",
  "glowstone",
  "obsidian",
  "netherrack",
  "soul-sand",
  "magma",
  "sponge",
  "oak-sapling",
  "oak-leaves",
  "birch-planks",
  "spruce-planks",
  "acacia-planks",
  "dark-oak-planks",
  "cactus",
  "snow",
  "ice",
  "blue-ice",
  "lily-pad",
  "vine",
  "red-mushroom",
  "brown-mushroom",
  "enchanting-table",
  "granite",
  "andesite",
  "diorite",
  "nether-bricks",
  "mossy-cobblestone",
  "door-iron",
  "observer",
  "birch-log",
  "spruce-log",
  "grass-path",
  "campfire",
  "lantern",
  "oak-trapdoor",
  "composter",
  "nether-quartz-ore",
  "copper-block",
  "iron-bars",
]);

export const HOTBAR_SLOTS = 9;
export const CHEST_SLOTS = 27;
export const PLAYER_SLOTS = 27;

export const PICK_TIER = {
  "wooden-pickaxe": 1,
  "stone-pickaxe": 2,
  "iron-pickaxe": 3,
  "diamond-pickaxe": 4,
};

export const MINE_TIER = {
  s: 1,
  c: 1,
  x: 1,
  co: 1,
  nr: 1,
  nk: 1,
  qo: 1,
  gl: 1,
  sd: 1,
  sb: 1,
  b: 1,
  m: 1,
  gt: 1,
  ad: 1,
  dr: 1,
  mg: 1,
  io: 2,
  lo: 2,
  go: 3,
  i: 3,
  eo: 3,
  ro: 3,
  ob: 4,
  et: 3,
  ib: 2,
  gb: 3,
  db: 3,
  eb: 3,
  cb: 1,
};

export const TOOL_DUR = {
  "wooden-sword": 59,
  "wooden-pickaxe": 59,
  "wooden-axe": 59,
  "wooden-shovel": 59,
  "wooden-hoe": 59,
  "stone-sword": 131,
  "stone-pickaxe": 131,
  "stone-axe": 131,
  "stone-shovel": 131,
  "stone-hoe": 131,
  "iron-sword": 250,
  "iron-pickaxe": 250,
  "iron-axe": 250,
  "iron-shovel": 250,
  "iron-hoe": 250,
  "diamond-sword": 1561,
  "diamond-pickaxe": 1561,
  "diamond-axe": 1561,
  "diamond-shovel": 1561,
  "diamond-hoe": 1561,
  shears: 238,
  "fishing-rod": 64,
  "flint-and-steel": 64,
  bow: 384,
};

export function canHarvest(itemId, tile) {
  const need = MINE_TIER[tile];
  if (need == null) return true;
  return (PICK_TIER[itemId] ?? 0) >= need;
}

export function pickSpeed(itemId) {
  return [1, 0.75, 0.55, 0.42, 0.32][PICK_TIER[itemId] ?? 0] ?? 1;
}

export function emptySlots(n) {
  return Array.from({ length: n }, () => ({ id: "", count: 0 }));
}

export function transferStack(from, index, to, maxSlots = HOTBAR_SLOTS) {
  const src = from[index];
  if (!src || src.count <= 0) return false;
  if (!tryAddItem(to, src.id, src.count, maxSlots, src)) return false;
  src.count = 0;
  src.id = "";
  delete src.dur;
  return true;
}

export function itemAsset(id) {
  if (FROM_BLOCKS.has(id)) return `blocks/${id}.svg`;
  return `items/${id}.svg`;
}

export function tryAddItem(items, id, count, maxSlots = HOTBAR_SLOTS, extra = null) {
  if (!id || !Number.isFinite(count) || count <= 0) return false;
  const tool = Boolean(TOOL_DUR[id]);
  if (!tool) {
    const stack = items.find((it) => it.id === id && it.count > 0);
    if (stack) {
      stack.count += count;
      return true;
    }
  }
  const empty = items.find((it) => it.count <= 0);
  if (empty) {
    empty.id = id;
    empty.count = count;
    if (tool) empty.dur = extra?.dur ?? TOOL_DUR[id];
    else delete empty.dur;
    return true;
  }
  if (items.length < maxSlots) {
    const it = { id, count };
    if (tool) it.dur = extra?.dur ?? TOOL_DUR[id];
    items.push(it);
    return true;
  }
  return false;
}

export function countOwned(items, id) {
  return items.reduce((sum, it) => sum + (it.id === id && it.count > 0 ? it.count : 0), 0);
}

export function canCraft(items, recipe) {
  return Object.entries(recipe.need).every(([id, n]) => countOwned(items, id) >= n);
}

export function takeNeed(items, need) {
  if (!Object.entries(need).every(([id, n]) => countOwned(items, id) >= n)) return false;
  for (const [id, n] of Object.entries(need)) {
    let left = n;
    for (const it of items) {
      if (it.id !== id || it.count <= 0) continue;
      const take = Math.min(it.count, left);
      it.count -= take;
      left -= take;
      if (left <= 0) break;
    }
  }
  return true;
}

export function craftOnce(items, recipe) {
  if (!takeNeed(items, recipe.need)) return null;
  return { id: recipe.id, count: recipe.count };
}

export function smeltOnce(items, inputId) {
  const spec = SMELT[inputId];
  if (!spec) return null;
  if (countOwned(items, inputId) < 1) return null;
  const fuel = [...FUELS].find((id) => countOwned(items, id) >= 1);
  if (!fuel) return null;
  if (!takeNeed(items, { [inputId]: 1, [fuel]: 1 })) return null;
  return { id: spec.out, count: 1 };
}
