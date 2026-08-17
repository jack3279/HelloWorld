// Official Minecraft still-lava as a side-view square. The game stores the
// boil as a vertical strip of 16×16 frames; we flatten each frame into
// horizontal color runs so the surface keeps churning without a bitmap.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, hexToRgba01, parseArgs, rgbToHex } from "./steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const LAVA_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/blocks/lava_still.png";
const CACHE = resolve(__dirname, "../../node_modules/.cache/lava-still.png");

export const TILE = 16;
export const CANVAS = { w: 512, h: 512, pad: 56 };
export const FPS = 10;
export const TOLERANCE = 16;

export { parseArgs };

export async function loadLavaStrip(explicitPath) {
  let buf;
  if (explicitPath) buf = await readFile(explicitPath);
  else {
    try {
      buf = await readFile(CACHE);
    } catch {
      const res = await fetch(LAVA_URL);
      if (!res.ok) throw new Error(`could not download ${LAVA_URL} (${res.status})`);
      buf = Buffer.from(await res.arrayBuffer());
      await mkdir(dirname(CACHE), { recursive: true });
      await writeFile(CACHE, buf);
    }
  }
  const png = decodePng(buf);
  if (png.width !== TILE) throw new Error(`expected a ${TILE}px-wide lava strip`);
  if (png.height % TILE !== 0) throw new Error("lava strip height must be a multiple of the tile");
  return png;
}

export function frameCount(strip) {
  return strip.height / TILE;
}

function pixel(strip, x, y) {
  const i = (y * strip.width + x) * 4;
  return [strip.rgba[i], strip.rgba[i + 1], strip.rgba[i + 2]];
}

function flattenFrame(strip, frame, tolerance = TOLERANCE) {
  const y0 = frame * TILE;
  const counts = new Map();
  for (let y = 0; y < TILE; y++)
    for (let x = 0; x < TILE; x++) {
      const [r, g, b] = pixel(strip, x, y0 + y);
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
      const [r, g, b] = pixel(strip, x, y0 + y);
      const key = (r << 16) | (g << 8) | b;
      row.push(lookup.get(key));
    }
    grid.push(row);
  }
  return grid;
}

export function runsOf(strip, frame, tolerance = TOLERANCE) {
  const grid = flattenFrame(strip, frame, tolerance);
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

export function layout() {
  const { w, h, pad } = CANVAS;
  const size = Math.min(w, h) - pad * 2;
  const x = (w - size) / 2;
  const y = (h - size) / 2;
  const texel = size / TILE;
  return { x, y, size, texel };
}

function runRect(run, box) {
  return {
    x: box.x + run.x0 * box.texel,
    y: box.y + run.y * box.texel,
    w: (run.x1 - run.x0) * box.texel,
    h: box.texel,
  };
}

export function svgFromRuns(runs, box = layout()) {
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

export function lottieShapesFromRuns(runs, box = layout()) {
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

export function frameSignature(strip, frame) {
  const y0 = frame * TILE;
  let h = 0;
  for (let y = 0; y < TILE; y++)
    for (let x = 0; x < TILE; x++) {
      const [r, g, b] = pixel(strip, x, y0 + y);
      h = (h * 33 + r + g * 3 + b * 7) >>> 0;
    }
  return h;
}
