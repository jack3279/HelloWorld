// Official Minecraft 16×16 item icons for the HUD hotbar, plus drop motion.
// Transparent texels stay empty so swords and potions keep their silhouette.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, hexToRgba01, parseArgs, rgbToHex } from "./steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ITEMS_BASE =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/items";
export const BLOCKS_BASE =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/blocks";
export const JAVA_ITEMS_BASE =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/item";
const CACHE = resolve(__dirname, "../../node_modules/.cache/minecraft-items");

export const TILE = 16;
export const TOLERANCE = 4;
export const ALPHA_CUTOFF = 16;
export const SINGLE = { w: 512, h: 512, pad: 56 };
export const ATLAS = { w: 512, h: 512, cols: 4, rows: 4, texel: 7, gap: 8 };
export const PAGE_SIZE = ATLAS.cols * ATLAS.rows;
export const DROP = { w: 512, h: 512, fr: 30, op: 60, ground: 400, startY: 72, size: 64 };
export const PICKUP = { w: 512, h: 360, fr: 30, op: 48 };

export { parseArgs };

// One 4×4 page: the icons a survival hotbar actually holds.
export const ITEMS = [
  { id: "diamond-sword", file: "diamond_sword.png", label: "Diamond sword", title: "钻石剑" },
  { id: "bow", file: "bow_standby.png", label: "Bow", title: "弓" },
  { id: "arrow", file: "arrow.png", label: "Arrow", title: "箭" },
  { id: "diamond-pickaxe", file: "diamond_pickaxe.png", label: "Diamond pickaxe", title: "钻石镐" },
  { id: "diamond-axe", file: "diamond_axe.png", label: "Diamond axe", title: "钻石斧" },
  { id: "shears", file: "shears.png", label: "Shears", title: "剪刀" },
  { id: "flint-and-steel", file: "flint_and_steel.png", label: "Flint and steel", title: "打火石" },
  { id: "stick", file: "stick.png", label: "Stick", title: "木棍" },
  { id: "apple", file: "apple.png", label: "Apple", title: "苹果" },
  { id: "golden-apple", file: "apple_golden.png", label: "Golden apple", title: "金苹果" },
  { id: "bread", file: "bread.png", label: "Bread", title: "面包" },
  { id: "steak", file: "beef_cooked.png", label: "Steak", title: "熟牛排" },
  { id: "potion-heal", file: "potion_bottle_heal.png", label: "Healing potion", title: "治疗药水" },
  { id: "diamond", file: "diamond.png", label: "Diamond", title: "钻石" },
  { id: "iron-ingot", file: "iron_ingot.png", label: "Iron ingot", title: "铁锭" },
  { id: "coal", file: "coal.png", label: "Coal", title: "煤炭" },
];

// Armor, mob drops, and more food — the survival kit that was missing from
// the first hotbar page. Leather helmet/leggings/boots are not in this
// Bedrock items pack, so the armor page uses the four complete metal sets.
export const MORE_ITEMS = [
  { id: "iron-helmet", file: "iron_helmet.png", label: "Iron helmet", title: "铁头盔" },
  { id: "iron-chestplate", file: "iron_chestplate.png", label: "Iron chestplate", title: "铁胸甲" },
  { id: "iron-leggings", file: "iron_leggings.png", label: "Iron leggings", title: "铁护腿" },
  { id: "iron-boots", file: "iron_boots.png", label: "Iron boots", title: "铁靴子" },
  { id: "diamond-helmet", file: "diamond_helmet.png", label: "Diamond helmet", title: "钻石头盔" },
  { id: "diamond-chestplate", file: "diamond_chestplate.png", label: "Diamond chestplate", title: "钻石胸甲" },
  { id: "diamond-leggings", file: "diamond_leggings.png", label: "Diamond leggings", title: "钻石护腿" },
  { id: "diamond-boots", file: "diamond_boots.png", label: "Diamond boots", title: "钻石靴子" },
  { id: "gold-helmet", file: "gold_helmet.png", label: "Golden helmet", title: "金头盔" },
  { id: "gold-chestplate", file: "gold_chestplate.png", label: "Golden chestplate", title: "金胸甲" },
  { id: "gold-leggings", file: "gold_leggings.png", label: "Golden leggings", title: "金护腿" },
  { id: "gold-boots", file: "gold_boots.png", label: "Golden boots", title: "金靴子" },
  { id: "netherite-helmet", file: "netherite_helmet.png", label: "Netherite helmet", title: "下界合金头盔" },
  { id: "netherite-chestplate", file: "netherite_chestplate.png", label: "Netherite chestplate", title: "下界合金胸甲" },
  { id: "netherite-leggings", file: "netherite_leggings.png", label: "Netherite leggings", title: "下界合金护腿" },
  { id: "netherite-boots", file: "netherite_boots.png", label: "Netherite boots", title: "下界合金靴子" },
  { id: "rotten-flesh", file: "rotten_flesh.png", label: "Rotten flesh", title: "腐肉" },
  { id: "bone", file: "bone.png", label: "Bone", title: "骨头" },
  { id: "string", file: "string.png", label: "String", title: "线" },
  { id: "gunpowder", file: "gunpowder.png", label: "Gunpowder", title: "火药" },
  { id: "spider-eye", file: "spider_eye.png", label: "Spider eye", title: "蜘蛛眼" },
  { id: "ender-pearl", file: "ender_pearl.png", label: "Ender pearl", title: "末影珍珠" },
  { id: "feather", file: "feather.png", label: "Feather", title: "羽毛" },
  { id: "wheat", file: "wheat.png", label: "Wheat", title: "小麦" },
  { id: "cooked-porkchop", file: "porkchop_cooked.png", label: "Cooked porkchop", title: "熟猪排" },
  { id: "cooked-chicken", file: "chicken_cooked.png", label: "Cooked chicken", title: "熟鸡肉" },
  { id: "cooked-mutton", file: "mutton_cooked.png", label: "Cooked mutton", title: "熟羊肉" },
  { id: "carrot", file: "carrot.png", label: "Carrot", title: "胡萝卜" },
  { id: "baked-potato", file: "potato_baked.png", label: "Baked potato", title: "烤马铃薯" },
  { id: "cookie", file: "cookie.png", label: "Cookie", title: "曲奇" },
  { id: "pumpkin-pie", file: "pumpkin_pie.png", label: "Pumpkin pie", title: "南瓜派" },
  { id: "melon-slice", file: "melon.png", label: "Melon slice", title: "西瓜片" },
  { id: "chainmail-helmet", file: "chainmail_helmet.png", label: "Chainmail helmet", title: "锁链头盔" },
  { id: "chainmail-chestplate", file: "chainmail_chestplate.png", label: "Chainmail chestplate", title: "锁链胸甲" },
  { id: "chainmail-leggings", file: "chainmail_leggings.png", label: "Chainmail leggings", title: "锁链护腿" },
  { id: "chainmail-boots", file: "chainmail_boots.png", label: "Chainmail boots", title: "锁链靴子" },
  { id: "gold-ingot", file: "gold_ingot.png", label: "Gold ingot", title: "金锭" },
  { id: "emerald", file: "emerald.png", label: "Emerald", title: "绿宝石" },
  { id: "redstone-dust", file: "redstone_dust.png", label: "Redstone dust", title: "红石粉" },
  { id: "saddle", file: "saddle.png", label: "Saddle", title: "鞍" },
  { id: "potato", file: "potato.png", label: "Potato", title: "马铃薯" },
  { id: "sugar", file: "sugar.png", label: "Sugar", title: "糖" },
  { id: "snowball", file: "snowball.png", label: "Snowball", title: "雪球" },
  { id: "egg", file: "egg.png", label: "Egg", title: "鸡蛋" },
  { id: "leather", file: "leather.png", label: "Leather", title: "皮革" },
  { id: "slimeball", file: "slimeball.png", label: "Slimeball", title: "粘液球" },
  { id: "bucket", file: "bucket_empty.png", label: "Bucket", title: "桶" },
  { id: "sugar-cane", file: "reeds.png", label: "Sugar cane", title: "甘蔗" },
];

export const HOTBAR_LOADOUT = [
  "diamond-sword",
  "bow",
  "diamond-pickaxe",
  "arrow",
  "bread",
  "steak",
  "golden-apple",
  "potion-heal",
  "diamond",
];

export const DROP_LOADOUT = ["diamond", "apple", "diamond-sword", "potion-heal"];

// Block faces that go in the hotbar as items (not the terrain atlas).
export const BLOCK_ITEMS = [
  { id: "dirt", file: "dirt.png", label: "Dirt", title: "土壤", base: BLOCKS_BASE },
  { id: "cobblestone", file: "cobblestone.png", label: "Cobblestone", title: "圆石", base: BLOCKS_BASE },
  { id: "oak-planks", file: "planks_oak.png", label: "Oak Planks", title: "橡木木板", base: BLOCKS_BASE },
  { id: "stone", file: "stone.png", label: "Stone", title: "石头", base: BLOCKS_BASE },
  { id: "sand", file: "sand.png", label: "Sand", title: "沙子", base: BLOCKS_BASE },
  { id: "oak-log", file: "log_oak.png", label: "Oak Log", title: "橡木原木", base: BLOCKS_BASE },
  { id: "torch", file: "torch_on.png", label: "Torch", title: "火把", base: BLOCKS_BASE },
  { id: "bricks", file: "brick.png", label: "Bricks", title: "砖块", base: BLOCKS_BASE },
];

export const PLAY_ITEMS = [
  { id: "wheat-seeds", file: "seeds_wheat.png", label: "Wheat seeds", title: "小麦种子" },
  { id: "bed", file: "bed_red.png", label: "Bed", title: "床" },
  { id: "pumpkin", file: "pumpkin_side.png", label: "Pumpkin", title: "南瓜", base: BLOCKS_BASE },
  { id: "raw-porkchop", file: "porkchop_raw.png", label: "Raw porkchop", title: "生猪排" },
  { id: "raw-beef", file: "beef_raw.png", label: "Raw beef", title: "生牛肉" },
  { id: "diamond-hoe", file: "diamond_hoe.png", label: "Diamond hoe", title: "钻石锄" },
  { id: "wooden-hoe", file: "wood_hoe.png", label: "Wooden hoe", title: "木锄" },
  { id: "bow-pulling-0", file: "bow_pulling_0.png", label: "Bow pulling 0", title: "拉弓" },
  { id: "bow-pulling-1", file: "bow_pulling_1.png", label: "Bow pulling 1", title: "拉弓" },
  { id: "bow-pulling-2", file: "bow_pulling_2.png", label: "Bow pulling 2", title: "拉满弓" },
  { id: "water-bucket", file: "bucket_water.png", label: "Water bucket", title: "水桶" },
  { id: "lava-bucket", file: "bucket_lava.png", label: "Lava bucket", title: "熔岩桶" },
  { id: "raw-chicken", file: "chicken_raw.png", label: "Raw chicken", title: "生鸡肉" },
  { id: "raw-mutton", file: "mutton_raw.png", label: "Raw mutton", title: "生羊肉" },
  { id: "wooden-sword", file: "wood_sword.png", label: "Wooden sword", title: "木剑" },
  { id: "wooden-pickaxe", file: "wood_pickaxe.png", label: "Wooden pickaxe", title: "木镐" },
  { id: "wooden-axe", file: "wood_axe.png", label: "Wooden axe", title: "木斧" },
  { id: "wooden-shovel", file: "wood_shovel.png", label: "Wooden shovel", title: "木铲" },
  { id: "iron-sword", file: "iron_sword.png", label: "Iron sword", title: "铁剑" },
  { id: "iron-pickaxe", file: "iron_pickaxe.png", label: "Iron pickaxe", title: "铁镐" },
  { id: "iron-axe", file: "iron_axe.png", label: "Iron axe", title: "铁斧" },
  { id: "iron-shovel", file: "iron_shovel.png", label: "Iron shovel", title: "铁铲" },
  { id: "iron-hoe", file: "iron_hoe.png", label: "Iron hoe", title: "铁锄" },
  { id: "diamond-shovel", file: "diamond_shovel.png", label: "Diamond shovel", title: "钻石铲" },
  { id: "leather-helmet", file: "leather_helmet.png", label: "Leather helmet", title: "皮革头盔", base: JAVA_ITEMS_BASE },
  { id: "leather-chestplate", file: "leather_chestplate.png", label: "Leather chestplate", title: "皮革胸甲", base: JAVA_ITEMS_BASE },
  { id: "leather-leggings", file: "leather_leggings.png", label: "Leather leggings", title: "皮革裤子", base: JAVA_ITEMS_BASE },
  { id: "leather-boots", file: "leather_boots.png", label: "Leather boots", title: "皮革靴子", base: JAVA_ITEMS_BASE },
  { id: "flint", file: "flint.png", label: "Flint", title: "燧石" },
  { id: "charcoal", file: "charcoal.png", label: "Charcoal", title: "木炭" },
  { id: "fishing-rod", file: "fishing_rod_uncast.png", label: "Fishing rod", title: "钓鱼竿" },
  { id: "fishing-rod-cast", file: "fishing_rod_cast.png", label: "Fishing rod cast", title: "钓鱼中" },
  { id: "raw-cod", file: "fish_raw.png", label: "Raw cod", title: "生鳕鱼" },
  { id: "cooked-cod", file: "fish_cooked.png", label: "Cooked cod", title: "熟鳕鱼" },
  { id: "ink-sac", file: "ink_sac.png", label: "Ink sac", title: "墨囊", base: JAVA_ITEMS_BASE },
  { id: "bowl", file: "bowl.png", label: "Bowl", title: "碗" },
  { id: "mushroom-stew", file: "mushroom_stew.png", label: "Mushroom stew", title: "蘑菇煲" },
  { id: "oak-boat", file: "boat_oak.png", label: "Oak boat", title: "橡木船" },
  { id: "blaze-rod", file: "blaze_rod.png", label: "Blaze rod", title: "烈焰棒" },
  { id: "blaze-powder", file: "blaze_powder.png", label: "Blaze powder", title: "烈焰粉" },
];

// Mixed survival bar: tools, blocks, stacks. Count 1 hides the numeral.
export const WORLD_LOADOUT = [
  { id: "diamond-sword", count: 1 },
  { id: "dirt", count: 64 },
  { id: "cobblestone", count: 64 },
  { id: "oak-planks", count: 32 },
  { id: "torch", count: 16 },
  { id: "arrow", count: 64 },
  { id: "bread", count: 8 },
  { id: "steak", count: 3 },
  { id: "diamond", count: 2 },
];

export function itemPages(pageSize = PAGE_SIZE) {
  const pages = [];
  for (let i = 0; i < ITEMS.length; i += pageSize) pages.push(ITEMS.slice(i, i + pageSize));
  return pages;
}

export function moreItemPages(pageSize = PAGE_SIZE) {
  const pages = [];
  for (let i = 0; i < MORE_ITEMS.length; i += pageSize) pages.push(MORE_ITEMS.slice(i, i + pageSize));
  return pages;
}

export function itemById(id) {
  const item = ITEMS.find((it) => it.id === id) ?? MORE_ITEMS.find((it) => it.id === id) ?? BLOCK_ITEMS.find((it) => it.id === id) ?? PLAY_ITEMS.find((it) => it.id === id);
  if (!item) throw new Error(`unknown item ${id}`);
  return item;
}

export async function loadItem(id) {
  const item = itemById(id);
  const cachePath = resolve(CACHE, item.file);
  let buf;
  try {
    buf = await readFile(cachePath);
  } catch {
    const url = `${item.base ?? ITEMS_BASE}/${item.file}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`could not download ${url} (${res.status})`);
    buf = Buffer.from(await res.arrayBuffer());
    await mkdir(CACHE, { recursive: true });
    await writeFile(cachePath, buf);
  }
  const png = decodePng(buf);
  if (png.width < TILE || png.height < TILE) {
    throw new Error(`${item.file} is smaller than ${TILE}×${TILE}`);
  }
  return png;
}

export function itemPixels(png, flatten = 4) {
  const { width: w, height: h, rgba } = png;
  const pixels = new Array(w * h).fill(null);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (rgba[i + 3] < ALPHA_CUTOFF) continue;
      pixels[y * w + x] = rgbToHex([rgba[i], rgba[i + 1], rgba[i + 2]]);
    }
  }
  if (!flatten) return { w, h, pixels };
  const counts = new Map();
  for (const hex of pixels) {
    if (!hex) continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  const centers = [];
  const lookup = new Map();
  for (const [hex] of [...counts].sort((a, b) => b[1] - a[1])) {
    const rgb = [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    const near = centers
      .filter((c) => c.every((v, k) => Math.abs(v - rgb[k]) <= flatten))
      .sort(
        (a, b) =>
          Math.hypot(a[0] - rgb[0], a[1] - rgb[1], a[2] - rgb[2]) -
          Math.hypot(b[0] - rgb[0], b[1] - rgb[1], b[2] - rgb[2]),
      )[0];
    if (near) lookup.set(hex, rgbToHex(near));
    else {
      centers.push(rgb);
      lookup.set(hex, hex);
    }
  }
  return { w, h, pixels: pixels.map((hex) => (hex ? lookup.get(hex) : null)) };
}

export async function loadItemPixels(id) {
  return itemPixels(await loadItem(id));
}

function pixel(png, x, y) {
  const i = (y * png.width + x) * 4;
  return [png.rgba[i], png.rgba[i + 1], png.rgba[i + 2], png.rgba[i + 3]];
}

function flattenFace(png, tolerance = TOLERANCE) {
  const counts = new Map();
  for (let y = 0; y < TILE; y++)
    for (let x = 0; x < TILE; x++) {
      const [r, g, b, a] = pixel(png, x, y);
      if (a < ALPHA_CUTOFF) continue;
      const key = (r << 16) | (g << 8) | b;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  const centers = [];
  const lookup = new Map();
  for (const [key] of [...counts].sort((a, b) => b[1] - a[1])) {
    const rgb = [(key >> 16) & 255, (key >> 8) & 255, key & 255];
    const near = centers
      .filter((c) => c.every((v, k) => Math.abs(v - rgb[k]) <= tolerance))
      .sort(
        (a, b) =>
          Math.hypot(a[0] - rgb[0], a[1] - rgb[1], a[2] - rgb[2]) -
          Math.hypot(b[0] - rgb[0], b[1] - rgb[1], b[2] - rgb[2]),
      )[0];
    if (near) lookup.set(key, rgbToHex(near));
    else {
      centers.push(rgb);
      lookup.set(key, rgbToHex(rgb));
    }
  }
  const grid = [];
  for (let y = 0; y < TILE; y++) {
    const row = [];
    for (let x = 0; x < TILE; x++) {
      const [r, g, b, a] = pixel(png, x, y);
      if (a < ALPHA_CUTOFF) {
        row.push(null);
        continue;
      }
      row.push(lookup.get((r << 16) | (g << 8) | b));
    }
    grid.push(row);
  }
  return grid;
}

export function runsOf(png, tolerance = TOLERANCE) {
  const grid = flattenFace(png, tolerance);
  const runs = [];
  for (let y = 0; y < TILE; y++) {
    let run = null;
    for (let x = 0; x <= TILE; x++) {
      const hex = x < TILE ? grid[y][x] : null;
      if (run && run.hex === hex) {
        run.x1 = x + 1;
        continue;
      }
      if (run) runs.push(run);
      run = hex ? { hex, y, x0: x, x1: x + 1 } : null;
    }
  }
  return runs;
}

export function layoutSingle(canvas = SINGLE) {
  const { w, h, pad } = canvas;
  const size = Math.min(w, h) - pad * 2;
  return { x: (w - size) / 2, y: (h - size) / 2, size, texel: size / TILE, w, h };
}

export function layoutAtlas(items = ITEMS, spec = ATLAS) {
  const { w, h, cols, rows, texel, gap } = spec;
  const size = TILE * texel;
  const gridW = cols * size + (cols - 1) * gap;
  const gridH = rows * size + (rows - 1) * gap;
  const originX = (w - gridW) / 2;
  const originY = (h - gridH) / 2;
  const cells = items.map((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      item,
      col,
      row,
      x: originX + col * (size + gap),
      y: originY + row * (size + gap),
      size,
      texel,
    };
  });
  return { w, h, cols, rows, size, texel, gap, originX, originY, cells };
}

function runRect(run, box) {
  return {
    x: box.x + run.x0 * box.texel,
    y: box.y + run.y * box.texel,
    w: (run.x1 - run.x0) * box.texel,
    h: box.texel,
  };
}

export function svgFromRuns(runs, box) {
  const byColor = new Map();
  for (const run of runs) {
    const r = runRect(run, box);
    const d = `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`;
    byColor.set(run.hex, (byColor.get(run.hex) ?? "") + d);
  }
  return [...byColor].map(([hex, d]) => `<path fill="${hex}" d="${d}"/>`);
}

function lottieRect(r) {
  return {
    ty: "rc",
    d: 1,
    p: { a: 0, k: [r.x + r.w / 2, r.y + r.h / 2] },
    s: { a: 0, k: [r.w, r.h] },
    r: { a: 0, k: 0 },
  };
}

function lottieFill(hex) {
  return { ty: "fl", o: { a: 0, k: 100 }, c: { a: 0, k: hexToRgba01(hex) }, r: 1 };
}

const IDENTITY_TR = {
  ty: "tr",
  p: { a: 0, k: [0, 0] },
  a: { a: 0, k: [0, 0] },
  s: { a: 0, k: [100, 100] },
  r: { a: 0, k: 0 },
  o: { a: 0, k: 100 },
};

export function lottieShapesFromRuns(runs, box) {
  const byColor = new Map();
  for (const run of runs) {
    if (!byColor.has(run.hex)) byColor.set(run.hex, []);
    byColor.get(run.hex).push(lottieRect(runRect(run, box)));
  }
  return [...byColor].map(([hex, rects]) => ({
    ty: "gr",
    nm: hex,
    it: [...rects, lottieFill(hex), { ...IDENTITY_TR }],
  }));
}

export function wrapSvg(id, label, canvas, body) {
  return `<!-- Generated by scripts/generate-items-svg.mjs -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.w} ${canvas.h}" width="${canvas.w}" height="${canvas.h}" role="img" aria-labelledby="${id}-title">
  <title id="${id}-title">${label}</title>
  ${body}
</svg>
`;
}

export function runCoverage(runs, pred) {
  let n = 0;
  for (const run of runs) {
    if (pred(run.hex)) n += run.x1 - run.x0;
  }
  return n;
}

export function centeredItemBox(size = DROP.size) {
  return { x: -size / 2, y: -size / 2, texel: size / TILE, size };
}

const EASE = {
  fall: { o: [1.0, 0.02], i: [0.54, 0.42] },
  bounce: { o: [0.0, 0.65], i: [0.51, 0.99] },
  travel: { o: [1.0, 0.49], i: [0.0, 0.55] },
  linear: { o: [0, 0], i: [1, 1] },
};

function kf(t, s, easeName, { last = false, first = false } = {}) {
  const ease = EASE[easeName] ?? EASE.linear;
  const key = { t, s };
  if (!last) key.o = { x: [ease.o[0]], y: [ease.o[1]] };
  if (!first) key.i = { x: [ease.i[0]], y: [ease.i[1]] };
  return key;
}

function anim(keys) {
  return { a: 1, k: keys };
}

export function dropPositionKeys({ x, startY, groundY, delay = 0, op = DROP.op }) {
  const land = delay + 12;
  const peak = land + 5;
  const settle = peak + 5;
  const keys = [
    kf(delay, [x, startY, 0], "fall", { first: true }),
    kf(land, [x, groundY, 0], "bounce"),
    kf(peak, [x, groundY - 36, 0], "bounce"),
    kf(settle, [x, groundY, 0], "linear"),
  ];
  for (let t = settle + 3; t < op; t += 3) {
    const phase = ((t - settle) / 24) * Math.PI * 2;
    keys.push(kf(t, [x, groundY - 8 + Math.cos(phase) * 8, 0], "linear"));
  }
  keys.push(kf(op, [x, groundY, 0], "linear", { last: true }));
  return anim(keys);
}

export function dropScaleKeys({ delay = 0, op = DROP.op } = {}) {
  const land = delay + 12;
  const peak = land + 5;
  const settle = peak + 5;
  return anim([
    kf(delay, [100, 100, 100], "fall", { first: true }),
    kf(land, [118, 82, 100], "bounce"),
    kf(peak, [92, 108, 100], "bounce"),
    kf(settle, [100, 100, 100], "linear"),
    kf(op, [100, 100, 100], "linear", { last: true }),
  ]);
}

export function pickupPositionKeys({ from, to, delay = 0, flyAt = 20, landAt = 34, op = PICKUP.op }) {
  const peak = delay + 10;
  const settle = peak + 5;
  return anim([
    kf(delay, [from[0], from[1], 0], "fall", { first: true }),
    kf(peak, [from[0], from[1] + 150, 0], "bounce"),
    kf(settle, [from[0], from[1] + 118, 0], "linear"),
    kf(flyAt, [from[0], from[1] + 118, 0], "travel"),
    kf(landAt, [to[0], to[1], 0], "linear"),
    kf(op, [to[0], to[1], 0], "linear", { last: true }),
  ]);
}

export function pickupScaleKeys({ flyAt = 20, landAt = 34, op = PICKUP.op, end = 56 } = {}) {
  return anim([
    kf(0, [100, 100, 100], "linear", { first: true }),
    kf(flyAt, [100, 100, 100], "travel"),
    kf(landAt, [end, end, 100], "linear"),
    kf(op, [end, end, 100], "linear", { last: true }),
  ]);
}

export function itemLayer({ ind, name, shapes, ip = 0, op, p, s }) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p,
      a: { a: 0, k: [0, 0, 0] },
      s,
    },
    ao: 0,
    shapes,
    ip,
    op,
    st: ip,
    bm: 0,
  };
}

export function staticLayer({ ind, name, shapes, ip = 0, op, p = [0, 0, 0] }) {
  return itemLayer({
    ind,
    name,
    shapes,
    ip,
    op,
    p: { a: 0, k: p },
    s: { a: 0, k: [100, 100, 100] },
  });
}
