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
  { id: "stick", count: 4, need: { "oak-planks": 2 } },
  { id: "crafting-table", count: 1, need: { "oak-planks": 4 } },
  { id: "chest", count: 1, need: { "oak-planks": 8 } },
  { id: "furnace", count: 1, need: { cobblestone: 8 } },
  { id: "ladder", count: 3, need: { stick: 7 } },
  { id: "torch", count: 4, need: { stick: 1, coal: 1 } },
  { id: "white-wool", count: 1, need: { string: 4 } },
  { id: "bed", count: 1, need: { "white-wool": 3, "oak-planks": 3 } },
  { id: "tnt", count: 1, need: { gunpowder: 4, sand: 4 } },
  { id: "bookshelf", count: 1, need: { "oak-planks": 6, wheat: 3 } },
  { id: "noteblock", count: 1, need: { "oak-planks": 8, "redstone-dust": 1 } },
  { id: "jukebox", count: 1, need: { "oak-planks": 8, diamond: 1 } },
  { id: "hopper", count: 1, need: { "iron-ingot": 5, chest: 1 } },
  { id: "dispenser", count: 1, need: { cobblestone: 7, bow: 1, "redstone-dust": 1 } },
  { id: "piston", count: 1, need: { "oak-planks": 3, cobblestone: 4, "iron-ingot": 1, "redstone-dust": 1 } },
  { id: "sandstone", count: 1, need: { sand: 4 } },
  { id: "stone-bricks", count: 4, need: { stone: 4 } },
  { id: "hay", count: 1, need: { wheat: 9 } },
  { id: "bread", count: 1, need: { wheat: 3 } },
  { id: "cookie", count: 8, need: { wheat: 2, sugar: 1 } },
  { id: "sugar", count: 1, need: { "sugar-cane": 1 } },
  { id: "arrow", count: 4, need: { stick: 1, feather: 1 } },
  { id: "bow", count: 1, need: { stick: 3, string: 3 } },
  { id: "diamond-sword", count: 1, need: { diamond: 2, stick: 1 } },
  { id: "diamond-pickaxe", count: 1, need: { diamond: 3, stick: 2 } },
  { id: "diamond-axe", count: 1, need: { diamond: 3, stick: 2 } },
  { id: "shears", count: 1, need: { "iron-ingot": 2 } },
  { id: "bucket", count: 1, need: { "iron-ingot": 3 } },
  { id: "golden-apple", count: 1, need: { apple: 1, "gold-ingot": 8 } },
  { id: "pumpkin-pie", count: 1, need: { pumpkin: 1, sugar: 1, egg: 1 } },
  { id: "iron-block", count: 1, need: { "iron-ingot": 9 } },
  { id: "gold-block", count: 1, need: { "gold-ingot": 9 } },
  { id: "diamond-block", count: 1, need: { diamond: 9 } },
  { id: "emerald-block", count: 1, need: { emerald: 9 } },
  { id: "iron-ingot", count: 9, need: { "iron-block": 1 } },
  { id: "gold-ingot", count: 9, need: { "gold-block": 1 } },
  { id: "diamond", count: 9, need: { "diamond-block": 1 } },
  { id: "emerald", count: 9, need: { "emerald-block": 1 } },
  { id: "wheat", count: 9, need: { hay: 1 } },
  ...armorSet("iron", "iron-ingot"),
  ...armorSet("gold", "gold-ingot"),
  ...armorSet("diamond", "diamond"),
];

export const SMELT = {
  "iron-ore": { out: "iron-ingot", fuel: "coal" },
  "gold-ore": { out: "gold-ingot", fuel: "coal" },
  cobblestone: { out: "stone", fuel: "coal" },
  sand: { out: "glass", fuel: "coal" },
  potato: { out: "baked-potato", fuel: "coal" },
  clay: { out: "bricks", fuel: "coal" },
};

export const ARMOR = {
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
  bread: { hunger: 5, health: 2 },
  steak: { hunger: 8, health: 4 },
  apple: { hunger: 4, health: 2 },
  "golden-apple": { hunger: 10, health: 10 },
  "potion-heal": { hunger: 0, health: 8 },
  "cooked-porkchop": { hunger: 8, health: 4 },
  "cooked-chicken": { hunger: 6, health: 3 },
  "cooked-mutton": { hunger: 8, health: 4 },
  carrot: { hunger: 3, health: 1 },
  potato: { hunger: 2, health: 1 },
  "baked-potato": { hunger: 6, health: 3 },
  cookie: { hunger: 3, health: 1 },
  "rotten-flesh": { hunger: 4, health: -2 },
  "pumpkin-pie": { hunger: 8, health: 3 },
  "melon-slice": { hunger: 3, health: 1 },
  "spider-eye": { hunger: 2, health: -3 },
  "red-mushroom": { hunger: 2, health: 0 },
  "brown-mushroom": { hunger: 2, health: 0 },
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
  shears: "剪刀",
  bucket: "桶",
  "water-bucket": "水桶",
  "iron-ingot": "铁锭",
  "gold-ingot": "金锭",
  sugar: "糖",
  egg: "鸡蛋",
  "pumpkin-pie": "南瓜派",
  "flint-and-steel": "打火石",
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
  "lapis-ore": "青金石矿",
  observer: "观察者",
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
  "lapis-ore",
  "observer",
]);

export const HOTBAR_SLOTS = 9;
export const CHEST_SLOTS = 27;

export function emptySlots(n) {
  return Array.from({ length: n }, () => ({ id: "", count: 0 }));
}

export function transferStack(from, index, to, maxSlots = HOTBAR_SLOTS) {
  const src = from[index];
  if (!src || src.count <= 0) return false;
  if (!tryAddItem(to, src.id, src.count, maxSlots)) return false;
  src.count = 0;
  src.id = "";
  return true;
}

export function itemAsset(id) {
  if (id === "water-bucket") return "items/bucket.svg";
  if (FROM_BLOCKS.has(id)) return `blocks/${id}.svg`;
  return `items/${id}.svg`;
}

export function tryAddItem(items, id, count, maxSlots = HOTBAR_SLOTS) {
  if (!id || !Number.isFinite(count) || count <= 0) return false;
  const stack = items.find((it) => it.id === id);
  if (stack) {
    stack.count += count;
    return true;
  }
  const empty = items.find((it) => it.count <= 0);
  if (empty) {
    empty.id = id;
    empty.count = count;
    return true;
  }
  if (items.length < maxSlots) {
    items.push({ id, count });
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
  if (countOwned(items, inputId) < 1 || countOwned(items, spec.fuel) < 1) return null;
  if (!takeNeed(items, { [inputId]: 1, [spec.fuel]: 1 })) return null;
  return { id: spec.out, count: 1 };
}
