// Official Minecraft 16×16 item sprites as static squares.
// Transparent texels are skipped so swords and pickaxes keep their silhouette.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, hexToRgba01, parseArgs, rgbToHex } from "./steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ITEMS_BASE =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/items";
const CACHE = resolve(__dirname, "../../node_modules/.cache/minecraft-items");

export const TILE = 16;
export const TOLERANCE = 4;
export const ALPHA_CUTOFF = 16;
export const SINGLE = { w: 512, h: 512, pad: 56 };
export const ATLAS = { w: 512, h: 512, cols: 4, rows: 4, texel: 7, gap: 8 };
export const PAGE_SIZE = ATLAS.cols * ATLAS.rows;

export { parseArgs };

export const ITEMS = [
  { id: "wood-sword", file: "wood_sword.png", label: "Wooden sword", title: "木剑" },
  { id: "stone-sword", file: "stone_sword.png", label: "Stone sword", title: "石剑" },
  { id: "iron-sword", file: "iron_sword.png", label: "Iron sword", title: "铁剑" },
  { id: "gold-sword", file: "gold_sword.png", label: "Golden sword", title: "金剑" },
  { id: "diamond-sword", file: "diamond_sword.png", label: "Diamond sword", title: "钻石剑" },
  { id: "netherite-sword", file: "netherite_sword.png", label: "Netherite sword", title: "下界合金剑" },
  { id: "wood-pickaxe", file: "wood_pickaxe.png", label: "Wooden pickaxe", title: "木镐" },
  { id: "stone-pickaxe", file: "stone_pickaxe.png", label: "Stone pickaxe", title: "石镐" },
  { id: "iron-pickaxe", file: "iron_pickaxe.png", label: "Iron pickaxe", title: "铁镐" },
  { id: "gold-pickaxe", file: "gold_pickaxe.png", label: "Golden pickaxe", title: "金镐" },
  { id: "diamond-pickaxe", file: "diamond_pickaxe.png", label: "Diamond pickaxe", title: "钻石镐" },
  { id: "netherite-pickaxe", file: "netherite_pickaxe.png", label: "Netherite pickaxe", title: "下界合金镐" },
  { id: "diamond-axe", file: "diamond_axe.png", label: "Diamond axe", title: "钻石斧" },
  { id: "diamond-shovel", file: "diamond_shovel.png", label: "Diamond shovel", title: "钻石锹" },
  { id: "bow", file: "bow_standby.png", label: "Bow", title: "弓" },
  { id: "arrow", file: "arrow.png", label: "Arrow", title: "箭" },
  { id: "wood-axe", file: "wood_axe.png", label: "Wooden axe", title: "木斧" },
  { id: "stone-axe", file: "stone_axe.png", label: "Stone axe", title: "石斧" },
  { id: "iron-axe", file: "iron_axe.png", label: "Iron axe", title: "铁斧" },
  { id: "gold-axe", file: "gold_axe.png", label: "Golden axe", title: "金斧" },
  { id: "netherite-axe", file: "netherite_axe.png", label: "Netherite axe", title: "下界合金斧" },
  { id: "wood-shovel", file: "wood_shovel.png", label: "Wooden shovel", title: "木锹" },
  { id: "iron-shovel", file: "iron_shovel.png", label: "Iron shovel", title: "铁锹" },
  { id: "iron-hoe", file: "iron_hoe.png", label: "Iron hoe", title: "铁锄" },
  { id: "diamond-hoe", file: "diamond_hoe.png", label: "Diamond hoe", title: "钻石锄" },
  { id: "shears", file: "shears.png", label: "Shears", title: "剪刀" },
  { id: "flint-and-steel", file: "flint_and_steel.png", label: "Flint and steel", title: "打火石" },
  { id: "stick", file: "stick.png", label: "Stick", title: "木棍" },
  { id: "apple", file: "apple.png", label: "Apple", title: "苹果" },
  { id: "bread", file: "bread.png", label: "Bread", title: "面包" },
  { id: "diamond", file: "diamond.png", label: "Diamond", title: "钻石" },
  { id: "iron-ingot", file: "iron_ingot.png", label: "Iron ingot", title: "铁锭" },
];

export function itemPages(pageSize = PAGE_SIZE) {
  const pages = [];
  for (let i = 0; i < ITEMS.length; i += pageSize) pages.push(ITEMS.slice(i, i + pageSize));
  return pages;
}

export function itemById(id) {
  const item = ITEMS.find((it) => it.id === id);
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
    const url = `${ITEMS_BASE}/${item.file}`;
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
    if (near) lookup.set(key, near);
    else {
      centers.push(rgb);
      lookup.set(key, rgb);
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
      const rgb = x < TILE ? grid[y][x] : null;
      const hex = rgb ? rgbToHex(rgb) : null;
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
