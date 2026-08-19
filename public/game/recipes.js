// Shapeless bag recipes for the overworld crafting table.
// Every id must already have an official SVG in assets/items or assets/blocks.

export const RECIPES = [
  { id: "oak-planks", count: 4, need: { "oak-log": 1 } },
  { id: "stick", count: 4, need: { "oak-planks": 2 } },
  { id: "crafting-table", count: 1, need: { "oak-planks": 4 } },
  { id: "torch", count: 4, need: { stick: 1, coal: 1 } },
  { id: "bread", count: 1, need: { wheat: 3 } },
  { id: "bow", count: 1, need: { stick: 3, string: 3 } },
  { id: "diamond-sword", count: 1, need: { diamond: 2, stick: 1 } },
  { id: "diamond-pickaxe", count: 1, need: { diamond: 3, stick: 2 } },
  { id: "diamond-axe", count: 1, need: { diamond: 3, stick: 2 } },
  { id: "wooden-hoe", count: 1, need: { "oak-planks": 2, stick: 2 } },
  { id: "wooden-sword", count: 1, need: { "oak-planks": 2, stick: 1 } },
  { id: "wooden-pickaxe", count: 1, need: { "oak-planks": 3, stick: 2 } },
  { id: "wooden-axe", count: 1, need: { "oak-planks": 3, stick: 2 } },
  { id: "wooden-shovel", count: 1, need: { "oak-planks": 1, stick: 2 } },
  { id: "iron-hoe", count: 1, need: { "iron-ingot": 2, stick: 2 } },
  { id: "iron-sword", count: 1, need: { "iron-ingot": 2, stick: 1 } },
  { id: "iron-pickaxe", count: 1, need: { "iron-ingot": 3, stick: 2 } },
  { id: "iron-axe", count: 1, need: { "iron-ingot": 3, stick: 2 } },
  { id: "iron-shovel", count: 1, need: { "iron-ingot": 1, stick: 2 } },
  { id: "diamond-hoe", count: 1, need: { diamond: 2, stick: 2 } },
  { id: "diamond-shovel", count: 1, need: { diamond: 1, stick: 2 } },
  { id: "shears", count: 1, need: { "iron-ingot": 2 } },
  { id: "bucket", count: 1, need: { "iron-ingot": 3 } },
  { id: "iron-helmet", count: 1, need: { "iron-ingot": 5 } },
  { id: "iron-chestplate", count: 1, need: { "iron-ingot": 8 } },
  { id: "iron-leggings", count: 1, need: { "iron-ingot": 7 } },
  { id: "iron-boots", count: 1, need: { "iron-ingot": 4 } },
  { id: "diamond-helmet", count: 1, need: { diamond: 5 } },
  { id: "diamond-chestplate", count: 1, need: { diamond: 8 } },
  { id: "diamond-leggings", count: 1, need: { diamond: 7 } },
  { id: "diamond-boots", count: 1, need: { diamond: 4 } },
  { id: "gold-helmet", count: 1, need: { "gold-ingot": 5 } },
  { id: "gold-chestplate", count: 1, need: { "gold-ingot": 8 } },
  { id: "gold-leggings", count: 1, need: { "gold-ingot": 7 } },
  { id: "gold-boots", count: 1, need: { "gold-ingot": 4 } },
  { id: "leather-helmet", count: 1, need: { leather: 5 } },
  { id: "leather-chestplate", count: 1, need: { leather: 8 } },
  { id: "leather-leggings", count: 1, need: { leather: 7 } },
  { id: "leather-boots", count: 1, need: { leather: 4 } },
  { id: "shield", count: 1, need: { "oak-planks": 6, "iron-ingot": 1 } },
  { id: "tnt", count: 1, need: { sand: 4, gunpowder: 5 } },
  { id: "flint-and-steel", count: 1, need: { "iron-ingot": 1, flint: 1 } },
  { id: "golden-apple", count: 1, need: { apple: 1, "gold-ingot": 8 } },
  { id: "pumpkin-pie", count: 1, need: { pumpkin: 1, sugar: 1, egg: 1 } },
  { id: "cookie", count: 8, need: { wheat: 2, sugar: 1 } },
  { id: "sugar", count: 1, need: { "sugar-cane": 1 } },
  { id: "ladder", count: 3, need: { stick: 7 } },
  { id: "chest", count: 1, need: { "oak-planks": 8 } },
  { id: "furnace", count: 1, need: { cobblestone: 8 } },
  { id: "door-oak", count: 3, need: { "oak-planks": 6 } },
  { id: "bed", count: 1, need: { "white-wool": 3, "oak-planks": 3 } },
  { id: "fishing-rod", count: 1, need: { stick: 3, string: 2 } },
  { id: "bowl", count: 4, need: { "oak-planks": 3 } },
  { id: "mushroom-stew", count: 1, need: { bowl: 1, "red-mushroom": 1, "brown-mushroom": 1 } },
  { id: "bookshelf", count: 1, need: { "oak-planks": 6 } },
  { id: "noteblock", count: 1, need: { "oak-planks": 8, "redstone-dust": 1 } },
  { id: "oak-boat", count: 1, need: { "oak-planks": 5 } },
  { id: "blaze-powder", count: 2, need: { "blaze-rod": 1 } },
];

export const HOTBAR_SLOTS = 9;
export const CHEST_SLOTS = 27;
export const FURNACE_SLOTS = 3;
export const COOK_TIME = 4;
export const SMELT = {
  "iron-ore": { id: "iron-ingot", n: 1 },
  "gold-ore": { id: "gold-ingot", n: 1 },
  "raw-porkchop": { id: "cooked-porkchop", n: 1 },
  "raw-beef": { id: "steak", n: 1 },
  "raw-chicken": { id: "cooked-chicken", n: 1 },
  "raw-mutton": { id: "cooked-mutton", n: 1 },
  potato: { id: "baked-potato", n: 1 },
  sand: { id: "glass", n: 1 },
  clay: { id: "bricks", n: 1 },
  "oak-log": { id: "charcoal", n: 1 },
  "raw-cod": { id: "cooked-cod", n: 1 },
};
export const FURNACE_FUEL = { coal: 8, charcoal: 8, "oak-planks": 4, "oak-log": 4 };
export const HOE_IDS = new Set(["diamond-hoe", "wooden-hoe", "iron-hoe"]);
export const BLOCK_FACE_ITEMS = new Set([
  "crafting-table",
  "iron-ore",
  "gold-ore",
  "oak-sapling",
  "white-wool",
  "tnt",
  "glass",
  "gravel",
  "clay",
  "ladder",
  "chest",
  "furnace",
  "door-oak",
  "copper-ore",
  "redstone-ore",
  "lapis-ore",
  "emerald-ore",
  "sandstone",
  "stone-bricks",
  "granite",
  "diorite",
  "andesite",
  "snow",
  "bricks",
  "lily-pad",
  "ice",
  "sugar-cane",
  "bookshelf",
  "noteblock",
  "obsidian",
  "red-mushroom",
  "brown-mushroom",
  "netherrack",
  "soul-sand",
  "glowstone",
  "magma",
  "nether-bricks",
  "nether-portal",
]);

export function emptySlots(n) {
  return Array.from({ length: n }, () => ({ id: "", count: 0 }));
}

export function emptyFurnace() {
  return { slots: emptySlots(FURNACE_SLOTS), cook: 0, burn: 0 };
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
  if (BLOCK_FACE_ITEMS.has(id)) return `blocks/${id}.svg`;
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

function slotEmpty(slot) {
  return !slot || slot.count <= 0 || !slot.id;
}

export function furnaceCanWork(furnace) {
  const input = furnace.slots[0];
  const output = furnace.slots[2];
  const recipe = SMELT[input?.id];
  if (!recipe || slotEmpty(input)) return null;
  if (!slotEmpty(output) && output.id !== recipe.id) return null;
  return recipe;
}

export function furnaceTick(furnace, dt) {
  if (furnace.burn > 0) furnace.burn = Math.max(0, furnace.burn - dt);
  const recipe = furnaceCanWork(furnace);
  const fueled = furnace.burn > 0 || (!slotEmpty(furnace.slots[1]) && FURNACE_FUEL[furnace.slots[1].id]);
  if (!recipe || !fueled) {
    furnace.cook = 0;
    return furnace;
  }
  if (furnace.burn <= 0) {
    const fuel = furnace.slots[1];
    const time = FURNACE_FUEL[fuel.id];
    if (!time || fuel.count <= 0) {
      furnace.cook = 0;
      return furnace;
    }
    fuel.count -= 1;
    if (fuel.count <= 0) fuel.id = "";
    furnace.burn = time;
  }
  furnace.cook += dt;
  if (furnace.cook >= COOK_TIME) {
    furnace.cook = 0;
    const input = furnace.slots[0];
    const output = furnace.slots[2];
    input.count -= 1;
    if (input.count <= 0) input.id = "";
    if (slotEmpty(output)) {
      output.id = recipe.id;
      output.count = recipe.n;
    } else output.count += recipe.n;
  }
  return furnace;
}
