// Official Minecraft 16×16 block faces as static squares.
// Each texture is flattened into horizontal color runs (no bitmap).
// Transparent texels stay empty so doors and hoppers keep their silhouette.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeTexture, hexToRgba01, parseArgs, rgbToHex } from "./steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const BLOCKS_BASE =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/blocks";
const CACHE = resolve(__dirname, "../../node_modules/.cache/minecraft-blocks");

export const TILE = 16;
export const TOLERANCE = 4;
export const ALPHA_CUTOFF = 16;
export const SINGLE = { w: 512, h: 512, pad: 56 };
export const ATLAS = { w: 512, h: 512, cols: 4, rows: 4, texel: 7, gap: 8 };
export const PAGE_SIZE = ATLAS.cols * ATLAS.rows;

export { parseArgs };

export const FOLIAGE_OAK = "#48b518";
export const FOLIAGE_BIRCH = "#80a755";
export const FOLIAGE_SPRUCE = "#619961";
export const FOLIAGE_LILY = "#2d8a3a";

// Official Bedrock faces. Pages: terrain, wood/nether, interactives, nature, farm/mineral.
export const BLOCKS = [
  { id: "grass", file: "grass_carried.png", label: "Grass", title: "草地" },
  { id: "dirt", file: "dirt.png", label: "Dirt", title: "土壤" },
  { id: "stone", file: "stone.png", label: "Stone", title: "石头" },
  { id: "cobblestone", file: "cobblestone.png", label: "Cobblestone", title: "圆石" },
  { id: "iron-ore", file: "iron_ore.png", label: "Iron ore", title: "铁矿" },
  { id: "coal-ore", file: "coal_ore.png", label: "Coal ore", title: "煤矿" },
  { id: "gold-ore", file: "gold_ore.png", label: "Gold ore", title: "金矿" },
  { id: "diamond-ore", file: "diamond_ore.png", label: "Diamond ore", title: "钻石矿" },
  { id: "copper-ore", file: "copper_ore.png", label: "Copper ore", title: "铜矿" },
  { id: "redstone-ore", file: "redstone_ore.png", label: "Redstone ore", title: "红石矿" },
  { id: "sand", file: "sand.png", label: "Sand", title: "沙子" },
  { id: "gravel", file: "gravel.png", label: "Gravel", title: "沙砾" },
  { id: "oak-planks", file: "planks_oak.png", label: "Oak planks", title: "橡木木板" },
  { id: "oak-log", file: "log_oak.png", label: "Oak log", title: "橡木原木" },
  { id: "bricks", file: "brick.png", label: "Bricks", title: "砖块" },
  { id: "mossy-cobblestone", file: "cobblestone_mossy.png", label: "Mossy cobblestone", title: "苔石" },
  { id: "spruce-planks", file: "planks_spruce.png", label: "Spruce planks", title: "云杉木板" },
  { id: "birch-planks", file: "planks_birch.png", label: "Birch planks", title: "白桦木板" },
  { id: "acacia-planks", file: "planks_acacia.png", label: "Acacia planks", title: "金合欢木板" },
  { id: "dark-oak-planks", file: "planks_big_oak.png", label: "Dark oak planks", title: "深色橡木木板" },
  { id: "netherrack", file: "netherrack.png", label: "Netherrack", title: "下界岩" },
  { id: "soul-sand", file: "soul_sand.png", label: "Soul sand", title: "灵魂沙" },
  { id: "glowstone", file: "glowstone.png", label: "Glowstone", title: "荧石" },
  { id: "magma", file: "magma.png", label: "Magma", title: "岩浆块" },
  { id: "nether-bricks", file: "nether_brick.png", label: "Nether bricks", title: "下界砖" },
  { id: "obsidian", file: "obsidian.png", label: "Obsidian", title: "黑曜石" },
  { id: "granite", file: "stone_granite.png", label: "Granite", title: "花岗岩" },
  { id: "diorite", file: "stone_diorite.png", label: "Diorite", title: "闪长岩" },
  { id: "andesite", file: "stone_andesite.png", label: "Andesite", title: "安山岩" },
  { id: "emerald-ore", file: "emerald_ore.png", label: "Emerald ore", title: "绿宝石矿" },
  { id: "lapis-ore", file: "lapis_ore.png", label: "Lapis ore", title: "青金石矿" },
  { id: "snow", file: "snow.png", label: "Snow", title: "雪块" },
  { id: "crafting-table", file: "crafting_table_front.png", label: "Crafting table", title: "工作台" },
  { id: "furnace", file: "furnace_front_off.png", label: "Furnace", title: "熔炉" },
  { id: "furnace-on", file: "furnace_front_on.png", label: "Lit furnace", title: "燃烧的熔炉" },
  { id: "chest", file: "chest_front.png", label: "Chest", title: "箱子" },
  { id: "door-oak", file: "door_wood_lower.png", label: "Oak door", title: "橡木门" },
  { id: "door-iron", file: "door_iron_lower.png", label: "Iron door", title: "铁门" },
  { id: "tnt", file: "tnt_side.png", label: "TNT", title: "TNT" },
  { id: "bedrock", file: "bedrock.png", label: "Bedrock", title: "基岩" },
  { id: "bookshelf", file: "bookshelf.png", label: "Bookshelf", title: "书架" },
  { id: "noteblock", file: "noteblock.png", label: "Note block", title: "音符盒" },
  { id: "jukebox", file: "jukebox_side.png", label: "Jukebox", title: "唱片机" },
  { id: "dispenser", file: "dispenser_front_horizontal.png", label: "Dispenser", title: "发射器" },
  { id: "piston", file: "piston_side.png", label: "Piston", title: "活塞" },
  { id: "enchanting-table", file: "enchanting_table_top.png", label: "Enchanting table", title: "附魔台" },
  { id: "hopper", file: "hopper_outside.png", label: "Hopper", title: "漏斗" },
  { id: "observer", file: "observer_front.png", label: "Observer", title: "观察者" },
  { id: "oak-leaves", file: "leaves_oak_opaque.png", label: "Oak leaves", title: "橡树树叶", tint: FOLIAGE_OAK },
  { id: "birch-leaves", file: "leaves_birch_opaque.png", label: "Birch leaves", title: "白桦树叶", tint: FOLIAGE_BIRCH },
  { id: "spruce-leaves", file: "leaves_spruce_opaque.png", label: "Spruce leaves", title: "云杉树叶", tint: FOLIAGE_SPRUCE },
  { id: "oak-sapling", file: "sapling_oak.png", label: "Oak sapling", title: "橡树树苗" },
  { id: "grass-side", file: "grass_side_carried.png", label: "Grass side", title: "草地侧面" },
  { id: "tall-grass", file: "tallgrass.png", label: "Tall grass", title: "高草", tint: FOLIAGE_OAK },
  { id: "poppy", file: "flower_rose.png", label: "Poppy", title: "虞美人" },
  { id: "dandelion", file: "flower_dandelion.png", label: "Dandelion", title: "蒲公英" },
  { id: "vine", file: "vine.png", label: "Vine", title: "藤蔓", tint: FOLIAGE_OAK },
  { id: "red-mushroom", file: "mushroom_red.png", label: "Red mushroom", title: "红蘑菇" },
  { id: "brown-mushroom", file: "mushroom_brown.png", label: "Brown mushroom", title: "棕蘑菇" },
  { id: "cactus", file: "cactus_side.tga", label: "Cactus", title: "仙人掌" },
  { id: "water", file: "water_still.png", label: "Water", title: "水" },
  { id: "torch", file: "torch_on.png", label: "Torch", title: "火把" },
  { id: "ladder", file: "ladder.png", label: "Ladder", title: "梯子" },
  { id: "lily-pad", file: "waterlily.png", label: "Lily pad", title: "睡莲", tint: FOLIAGE_LILY },
  { id: "glass", file: "glass.png", label: "Glass", title: "玻璃" },
  { id: "ice", file: "ice.png", label: "Ice", title: "冰" },
  { id: "pumpkin", file: "pumpkin_side.png", label: "Pumpkin", title: "南瓜" },
  { id: "hay", file: "hay_block_side.png", label: "Hay bale", title: "干草块" },
  { id: "farmland", file: "farmland_wet.png", label: "Farmland", title: "耕地" },
  { id: "melon", file: "melon_side.png", label: "Melon", title: "西瓜" },
  { id: "clay", file: "clay.png", label: "Clay", title: "粘土块" },
  { id: "blue-ice", file: "blue_ice.png", label: "Blue ice", title: "蓝冰" },
  { id: "iron-block", file: "iron_block.png", label: "Iron block", title: "铁块" },
  { id: "gold-block", file: "gold_block.png", label: "Gold block", title: "金块" },
  { id: "diamond-block", file: "diamond_block.png", label: "Diamond block", title: "钻石块" },
  { id: "emerald-block", file: "emerald_block.png", label: "Emerald block", title: "绿宝石块" },
  { id: "white-wool", file: "wool_colored_white.png", label: "White wool", title: "白色羊毛" },
  { id: "sandstone", file: "sandstone_normal.png", label: "Sandstone", title: "砂岩" },
  { id: "stone-bricks", file: "stonebrick.png", label: "Stone bricks", title: "石砖" },
  { id: "sponge", file: "sponge.png", label: "Sponge", title: "海绵" },
];

export function blockPages(pageSize = PAGE_SIZE) {
  const pages = [];
  for (let i = 0; i < BLOCKS.length; i += pageSize) pages.push(BLOCKS.slice(i, i + pageSize));
  return pages;
}

export function blockById(id) {
  const block = BLOCKS.find((b) => b.id === id);
  if (!block) throw new Error(`unknown block ${id}`);
  return block;
}

export async function loadBlock(id) {
  const block = blockById(id);
  const cachePath = resolve(CACHE, block.file);
  let buf;
  try {
    buf = await readFile(cachePath);
  } catch {
    const url = `${BLOCKS_BASE}/${block.file}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`could not download ${url} (${res.status})`);
    buf = Buffer.from(await res.arrayBuffer());
    await mkdir(CACHE, { recursive: true });
    await writeFile(cachePath, buf);
  }
  const png = decodeTexture(buf);
  if (png.width < TILE || png.height < TILE) {
    throw new Error(`${block.file} is smaller than ${TILE}×${TILE}`);
  }
  return block.tint ? applyTint(png, block.tint) : png;
}

function applyTint(png, tintHex) {
  const tr = parseInt(tintHex.slice(1, 3), 16);
  const tg = parseInt(tintHex.slice(3, 5), 16);
  const tb = parseInt(tintHex.slice(5, 7), 16);
  const rgba = new Uint8Array(png.rgba);
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < ALPHA_CUTOFF) continue;
    rgba[i] = Math.round((rgba[i] * tr) / 255);
    rgba[i + 1] = Math.round((rgba[i + 1] * tg) / 255);
    rgba[i + 2] = Math.round((rgba[i + 2] * tb) / 255);
  }
  return { width: png.width, height: png.height, rgba };
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

export function layoutAtlas(blocks = BLOCKS, spec = ATLAS) {
  const { w, h, cols, rows, texel, gap } = spec;
  const size = TILE * texel;
  const gridW = cols * size + (cols - 1) * gap;
  const gridH = rows * size + (rows - 1) * gap;
  const originX = (w - gridW) / 2;
  const originY = (h - gridH) / 2;
  const cells = blocks.map((block, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      block,
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
  return `<!-- Generated by scripts/generate-blocks-svg.mjs -->
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
