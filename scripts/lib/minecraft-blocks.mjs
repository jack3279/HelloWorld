// Official Minecraft 16×16 block faces as static squares.
// Each texture is flattened into horizontal color runs (no bitmap).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, hexToRgba01, parseArgs, rgbToHex } from "./steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const BLOCKS_BASE =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/blocks";
const CACHE = resolve(__dirname, "../../node_modules/.cache/minecraft-blocks");

export const TILE = 16;
export const TOLERANCE = 4;
export const SINGLE = { w: 512, h: 512, pad: 56 };
export const ATLAS = { w: 512, h: 512, cols: 4, rows: 4, texel: 7, gap: 8 };

export { parseArgs };

// Plains-green carried grass top, plus the usual terrain and ores.
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
];

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
  const png = decodePng(buf);
  if (png.width < TILE || png.height < TILE) {
    throw new Error(`${block.file} is smaller than ${TILE}×${TILE}`);
  }
  return png;
}

function pixel(png, x, y) {
  const i = (y * png.width + x) * 4;
  return [png.rgba[i], png.rgba[i + 1], png.rgba[i + 2]];
}

function flattenFace(png, tolerance = TOLERANCE) {
  const counts = new Map();
  for (let y = 0; y < TILE; y++)
    for (let x = 0; x < TILE; x++) {
      const [r, g, b] = pixel(png, x, y);
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
      const [r, g, b] = pixel(png, x, y);
      const key = (r << 16) | (g << 8) | b;
      row.push(lookup.get(key));
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

export function layoutAtlas(spec = ATLAS) {
  const { w, h, cols, rows, texel, gap } = spec;
  const size = TILE * texel;
  const gridW = cols * size + (cols - 1) * gap;
  const gridH = rows * size + (rows - 1) * gap;
  const originX = (w - gridW) / 2;
  const originY = (h - gridH) / 2;
  const cells = BLOCKS.map((block, i) => {
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
