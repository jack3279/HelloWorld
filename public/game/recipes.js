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
  { id: "shears", count: 1, need: { "iron-ingot": 2 } },
  { id: "bucket", count: 1, need: { "iron-ingot": 3 } },
  { id: "iron-chestplate", count: 1, need: { "iron-ingot": 8 } },
  { id: "diamond-chestplate", count: 1, need: { diamond: 8 } },
  { id: "golden-apple", count: 1, need: { apple: 1, "gold-ingot": 8 } },
  { id: "pumpkin-pie", count: 1, need: { pumpkin: 1, sugar: 1, egg: 1 } },
];

export const HOTBAR_SLOTS = 9;

export function itemAsset(id) {
  if (id === "crafting-table") return "blocks/crafting-table.svg";
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
