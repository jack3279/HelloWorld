// Original CC0 HUD chrome as flat vector runs: hearts, hunger, armor,
// hotbar frames, 9-slice buttons, and XP / health bars.
// Transparent texels stay empty so icons keep their silhouette.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, hexToRgba01, parseArgs, rgbToHex } from "./steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const HUD_BASE =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/ui";
export const GUI_BASE =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/gui";
export const FONT_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/font/ascii.png";
const CACHE = resolve(__dirname, "../../node_modules/.cache/minecraft-hud");

export const ALPHA_CUTOFF = 16;
export const HEART_RED = "#ff1313";
export const HEART_HIGHLIGHT = "#ffc8c8";
export const HEART_SHADOW = "#bb1313";
export const HEART_EMPTY = "#282828";
export const COUNT_WHITE = "#f8f8f8";
export const COUNT_SHADOW = "#3e3e3e";

export const ICON = 9;
export const ICON_STRIDE = 8;
export const ICON_ROW_W = 10 * ICON_STRIDE + 1;
export const HOTBAR_SLOT_W = 20;
export const HOTBAR_SLOT_H = 22;
export const HOTBAR_SLOTS = 9;
export const HOTBAR_CAP = 1;
export const HOTBAR_W = HOTBAR_CAP + HOTBAR_SLOTS * HOTBAR_SLOT_W + HOTBAR_CAP;
export const SELECTED_W = 24;
export const SELECTED_H = 24;
export const BUTTON_SRC = 4;
export const BAR_SRC_W = 13;
export const BAR_SRC_H = 5;

export const ATLAS = { w: 512, h: 512, cols: 4, rows: 4, cell: 112, gap: 12 };
export const SURVIVAL = { w: 640, h: 220, padX: 20, padY: 24 };
export const OVERLAY = { w: 640, h: 360, padX: 20, padY: 24 };
export const HEARTS_CANVAS = { w: 640, h: 180 };
export const BUTTON_CANVAS = { w: 640, h: 180, padX: 100, padY: 52, maxTexel: 4 };
export const BAR_CANVAS = { w: 640, h: 140 };
export const BUTTON_SIZE = { w: 100, h: 20 };
export const BAR_SIZE = { w: HOTBAR_W, h: BAR_SRC_H };

export { parseArgs };

export const HUD_FILES = {
  heart: "heart.png",
  "heart-half": "heart_half.png",
  "heart-empty": "heart_background.png",
  "heart-flash": "heart_flash.png",
  "hunger-full": "hunger_full.png",
  "hunger-half": "hunger_half.png",
  "hunger-empty": "hunger_background.png",
  "armor-full": "armor_full.png",
  "armor-half": "armor_half.png",
  "armor-empty": "armor_empty.png",
  bubble: "bubble.png",
  "bubble-empty": "bubble_empty.png",
  "hotbar-start": "hotbar_start_cap.png",
  "hotbar-end": "hotbar_end_cap.png",
  selected: "selected_hotbar_slot.png",
  "button-idle": "button_borderless_light.png",
  "button-hover": "button_borderless_lighthover.png",
  "button-pressed": "button_borderless_lightpressed.png",
  "button-dark": "button_borderless_dark.png",
  "xp-empty": "experiencebarempty.png",
  "xp-full": "experiencebarfull.png",
  "progress-empty": "empty_progress_bar.png",
  "progress-full": "filled_progress_bar.png",
  tip: "hud_tip_text_background.png",
  bubble: "bubble.png",
  "bubble-empty": "bubble_empty.png",
  "bubble-pop": "bubble_pop.png",
};

for (let i = 0; i < HOTBAR_SLOTS; i++) HUD_FILES[`hotbar-${i}`] = `hotbar_${i}.png`;

const FLATTEN = {
  "hotbar-start": 0,
  "hotbar-end": 0,
  selected: 14,
  "xp-empty": 12,
  "progress-empty": 6,
  "progress-full": 8,
  tip: 0,
};

for (let i = 0; i < HOTBAR_SLOTS; i++) FLATTEN[`hotbar-${i}`] = 16;

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

export async function loadHudPng(id) {
  const file = HUD_FILES[id];
  if (!file) throw new Error(`unknown HUD texture ${id}`);
  const { paintHud } = await import("./cc0-hud.mjs");
  return paintHud(id);
}

export function flattenPixels(pixels, tolerance = 0) {
  if (!tolerance) return pixels;
  const counts = new Map();
  for (const hex of pixels) {
    if (!hex) continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  const centers = [];
  const lookup = new Map();
  for (const [hex] of [...counts].sort((a, b) => b[1] - a[1])) {
    const rgb = hexToRgb(hex);
    const near = centers
      .filter((c) => c.every((v, k) => Math.abs(v - rgb[k]) <= tolerance))
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
  return pixels.map((hex) => (hex ? lookup.get(hex) : null));
}

export function pngToPixels(png, { flatten = 0, alphaCutoff = ALPHA_CUTOFF } = {}) {
  const { width: w, height: h, rgba } = png;
  const pixels = new Array(w * h).fill(null);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (rgba[i + 3] < alphaCutoff) continue;
      pixels[y * w + x] = rgbToHex([rgba[i], rgba[i + 1], rgba[i + 2]]);
    }
  }
  return { w, h, pixels: flattenPixels(pixels, flatten) };
}

export async function loadHud(id, opts = {}) {
  const flatten = opts.flatten ?? FLATTEN[id] ?? 0;
  return pngToPixels(await loadHudPng(id), { ...opts, flatten });
}

export function makeCanvas(w, h, fill = null) {
  return { w, h, pixels: new Array(w * h).fill(fill) };
}

export function blit(dest, src, dx, dy, { clipW, clipH } = {}) {
  const maxX = clipW == null ? src.w : Math.min(src.w, clipW);
  const maxY = clipH == null ? src.h : Math.min(src.h, clipH);
  for (let y = 0; y < maxY; y++) {
    const ty = dy + y;
    if (ty < 0 || ty >= dest.h) continue;
    for (let x = 0; x < maxX; x++) {
      const hex = src.pixels[y * src.w + x];
      if (!hex) continue;
      const tx = dx + x;
      if (tx < 0 || tx >= dest.w) continue;
      dest.pixels[ty * dest.w + tx] = hex;
    }
  }
  return dest;
}

export function cropPixels(src, x, y, w, h) {
  const dest = makeCanvas(w, h);
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      dest.pixels[yy * w + xx] = src.pixels[(y + yy) * src.w + (x + xx)] ?? null;
    }
  }
  return dest;
}

async function loadCachedPng(url, cacheName) {
  const cachePath = resolve(CACHE, cacheName);
  let buf;
  try {
    buf = await readFile(cachePath);
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`could not download ${url} (${res.status})`);
    buf = Buffer.from(await res.arrayBuffer());
    await mkdir(CACHE, { recursive: true });
    await writeFile(cachePath, buf);
  }
  return decodePng(buf);
}

let asciiPng = null;
export async function loadAscii() {
  if (!asciiPng) {
    const { paintAscii } = await import("./cc0-hud.mjs");
    asciiPng = paintAscii();
  }
  return asciiPng;
}

export async function loadCrosshair() {
  const { paintCrosshair } = await import("./cc0-hud.mjs");
  return pngToPixels(paintCrosshair(), { flatten: 0 });
}

function glyphCell(ch) {
  const code = ch.charCodeAt(0);
  return { x: (code % 16) * 8, y: Math.floor(code / 16) * 8 };
}

export function glyphAdvance(png, ch) {
  if (ch === " ") return 4;
  const { x, y } = glyphCell(ch);
  let max = 0;
  for (let yy = 0; yy < 8; yy++) {
    for (let xx = 0; xx < 8; xx++) {
      if (png.rgba[((y + yy) * png.width + (x + xx)) * 4 + 3] < ALPHA_CUTOFF) continue;
      if (xx > max) max = xx;
    }
  }
  return Math.max(1, max + 2);
}

function blitGlyph(dest, png, ch, dx, dy, hex) {
  const { x, y } = glyphCell(ch);
  for (let yy = 0; yy < 8; yy++) {
    for (let xx = 0; xx < 8; xx++) {
      if (png.rgba[((y + yy) * png.width + (x + xx)) * 4 + 3] < ALPHA_CUTOFF) continue;
      const tx = dx + xx;
      const ty = dy + yy;
      if (tx < 0 || ty < 0 || tx >= dest.w || ty >= dest.h) continue;
      dest.pixels[ty * dest.w + tx] = hex;
    }
  }
}

export async function composeText(text, { fill = COUNT_WHITE, shadow = COUNT_SHADOW } = {}) {
  const png = await loadAscii();
  const advances = [...text].map((ch) => glyphAdvance(png, ch));
  const w = advances.reduce((n, a) => n + a, 0) + 1;
  const dest = makeCanvas(w, 9);
  let x = 0;
  for (let i = 0; i < text.length; i++) {
    blitGlyph(dest, png, text[i], x + 1, 1, shadow);
    blitGlyph(dest, png, text[i], x, 0, fill);
    x += advances[i];
  }
  return dest;
}

export async function composeCount(n) {
  return composeText(String(n));
}

export async function composeTip(label) {
  const text = await composeText(label);
  const padX = 3;
  const padY = 2;
  const bg = slice9(await loadHud("tip"), text.w + padX * 2, text.h + padY * 2, { border: 2 });
  blit(bg, text, padX, padY);
  return bg;
}

export async function composeOverlay({
  items = null,
  counts = null,
  selected = 0,
  tip = null,
  crosshair = true,
} = {}) {
  const hud = await composeSurvival({ items, counts, selected, xp: 0.45, armor: 10 });
  const dest = makeCanvas(OVERLAY.w, OVERLAY.h);
  const hudX = Math.floor((OVERLAY.w - hud.w) / 2);
  const hudY = OVERLAY.h - hud.h - 16;
  blit(dest, hud, hudX, hudY);
  if (tip) {
    const label = await composeTip(tip);
    blit(dest, label, Math.floor((OVERLAY.w - label.w) / 2), hudY - label.h - 6);
  }
  if (crosshair) {
    const hair = await loadCrosshair();
    blit(dest, hair, Math.floor((OVERLAY.w - hair.w) / 2), Math.floor((OVERLAY.h - hair.h) / 2) - 36);
  }
  return dest;
}

function sample(src, x, y) {
  const sx = Math.max(0, Math.min(src.w - 1, x));
  const sy = Math.max(0, Math.min(src.h - 1, y));
  return src.pixels[sy * src.w + sx];
}

function map9(u, dest, src, border) {
  if (u < border) return u;
  if (u >= dest - border) return src - (dest - u);
  const innerD = Math.max(1, dest - 2 * border);
  const innerS = Math.max(1, src - 2 * border);
  return border + ((u - border) * innerS) / innerD;
}

export function slice9(src, dw, dh, { border = 1 } = {}) {
  const dest = makeCanvas(dw, dh);
  for (let y = 0; y < dh; y++) {
    const sy = Math.floor(map9(y, dh, src.h, border));
    for (let x = 0; x < dw; x++) {
      const sx = Math.floor(map9(x, dw, src.w, border));
      dest.pixels[y * dw + x] = sample(src, sx, sy);
    }
  }
  return dest;
}

export function remapPixels(src, mapHex) {
  return {
    w: src.w,
    h: src.h,
    pixels: src.pixels.map((hex) => (hex ? mapHex(hex) : null)),
  };
}

export function xpToHealth(hex) {
  const [r, g, b] = hexToRgb(hex);
  if (g > r + 16 && g > b) {
    if (g > 180) return HEART_HIGHLIGHT;
    if (g > 110) return HEART_RED;
    return HEART_SHADOW;
  }
  return hex;
}

export function runsOf(canvas) {
  const { w, h, pixels } = canvas;
  const runs = [];
  for (let y = 0; y < h; y++) {
    let run = null;
    for (let x = 0; x <= w; x++) {
      const hex = x < w ? pixels[y * w + x] : null;
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

export function runCoverage(runs, pred) {
  let n = 0;
  for (const run of runs) {
    if (pred(run.hex)) n += run.x1 - run.x0;
  }
  return n;
}

function iconRow(dest, x0, y0, count, pick) {
  for (let i = 0; i < count; i++) blit(dest, pick(i), x0 + i * ICON_STRIDE, y0);
}

export function composeIconRow(units, maxUnits, { empty, half, full, flashIndex = -1, flash, rtl = false } = {}) {
  const count = Math.ceil(maxUnits / 2);
  const dest = makeCanvas(count * ICON_STRIDE + 1, ICON);
  iconRow(dest, 0, 0, count, (visualI) => {
    const i = rtl ? count - 1 - visualI : visualI;
    if (flash && i === flashIndex) return flash;
    const left = units - i * 2;
    if (left >= 2) return full;
    if (left === 1) return half;
    return empty;
  });
  return dest;
}

export async function composeHearts(hp, max = 20, { flashIndex = -1 } = {}) {
  const [empty, half, full, flash] = await Promise.all([
    loadHud("heart-empty"),
    loadHud("heart-half"),
    loadHud("heart"),
    loadHud("heart-flash"),
  ]);
  return composeIconRow(hp, max, { empty, half, full, flashIndex, flash });
}

export async function composeHunger(food, max = 20) {
  const [empty, half, full] = await Promise.all([
    loadHud("hunger-empty"),
    loadHud("hunger-half"),
    loadHud("hunger-full"),
  ]);
  return composeIconRow(food, max, { empty, half, full, rtl: true });
}

export async function composeArmor(points, max = 20) {
  const [empty, half, full] = await Promise.all([
    loadHud("armor-empty"),
    loadHud("armor-half"),
    loadHud("armor-full"),
  ]);
  return composeIconRow(points, max, { empty, half, full });
}

export async function composeHotbar({
  selected = null,
  item = null,
  itemSlot = 0,
  items = null,
  counts = null,
} = {}) {
  const pad = selected == null ? 0 : 1;
  const dest = makeCanvas(HOTBAR_W + pad * 2, HOTBAR_SLOT_H + pad * 2);
  const ox = pad;
  const oy = pad;
  blit(dest, await loadHud("hotbar-start"), ox, oy);
  for (let i = 0; i < HOTBAR_SLOTS; i++) {
    blit(dest, await loadHud(`hotbar-${i}`), ox + HOTBAR_CAP + i * HOTBAR_SLOT_W, oy);
  }
  blit(dest, await loadHud("hotbar-end"), ox + HOTBAR_CAP + HOTBAR_SLOTS * HOTBAR_SLOT_W, oy);
  const slotItems = items ?? (item ? Array.from({ length: HOTBAR_SLOTS }, (_, i) => (i === itemSlot ? item : null)) : []);
  for (let i = 0; i < HOTBAR_SLOTS; i++) {
    const it = slotItems[i];
    if (!it) continue;
    const ix = ox + HOTBAR_CAP + i * HOTBAR_SLOT_W + Math.floor((HOTBAR_SLOT_W - it.w) / 2);
    const iy = oy + Math.floor((HOTBAR_SLOT_H - it.h) / 2);
    blit(dest, it, ix, iy);
  }
  if (selected != null) {
    const sx = ox + HOTBAR_CAP + selected * HOTBAR_SLOT_W - 2;
    const sy = oy - 1;
    blit(dest, await loadHud("selected"), sx, sy);
  }
  if (counts) {
    for (let i = 0; i < HOTBAR_SLOTS; i++) {
      const n = counts[i];
      if (!n || n <= 1) continue;
      const it = slotItems[i];
      const num = await composeCount(n);
      const itemW = it?.w ?? 16;
      const itemH = it?.h ?? 16;
      const itemX = ox + HOTBAR_CAP + i * HOTBAR_SLOT_W + Math.floor((HOTBAR_SLOT_W - itemW) / 2);
      const itemY = oy + Math.floor((HOTBAR_SLOT_H - itemH) / 2);
      blit(dest, num, itemX + itemW - num.w + 1, itemY + itemH - num.h + 1);
    }
  }
  return dest;
}

export async function composeButton({ state = "idle", width = BUTTON_SIZE.w, height = BUTTON_SIZE.h } = {}) {
  const id = state === "hover" ? "button-hover" : state === "pressed" ? "button-pressed" : "button-idle";
  return slice9(await loadHud(id), width, height);
}

export async function composeBar({
  fill = 1,
  kind = "xp",
  width = BAR_SIZE.w,
  height = BAR_SIZE.h,
} = {}) {
  const emptyId = kind === "progress" ? "progress-empty" : "xp-empty";
  const fullId = kind === "progress" ? "progress-full" : "xp-full";
  let empty = await loadHud(emptyId);
  let full = await loadHud(fullId);
  if (kind === "health") {
    empty = remapPixels(empty, (hex) => {
      const [r, g, b] = hexToRgb(hex);
      if (g >= r && g >= b) return "#0e1110";
      return hex;
    });
    full = remapPixels(full, xpToHealth);
  }
  const dest = slice9(empty, width, height);
  const fw = Math.max(0, Math.min(width, Math.round(width * fill)));
  if (fw > 0) blit(dest, slice9(full, width, height), 0, 0, { clipW: fw });
  return dest;
}

export async function composeSurvival({
  hearts = 20,
  hunger = 20,
  armor = 10,
  xp = 0.45,
  selected = 0,
  item = null,
  items = null,
  counts = null,
} = {}) {
  const heartRow = await composeHearts(hearts);
  const hungerRow = await composeHunger(hunger);
  const armorRow = await composeArmor(armor);
  const xpBar = await composeBar({ fill: xp, kind: "xp" });
  const hotbar = await composeHotbar({ selected, item, itemSlot: selected ?? 0, items, counts });
  const w = Math.max(HOTBAR_W, hotbar.w);
  const h = 10 + ICON + 1 + BAR_SRC_H + 1 + hotbar.h;
  const dest = makeCanvas(w, h);
  const hungerX = w - hungerRow.w;
  blit(dest, armorRow, 0, 0);
  blit(dest, heartRow, 0, 10);
  blit(dest, hungerRow, hungerX, 10);
  blit(dest, xpBar, Math.floor((w - xpBar.w) / 2), 20);
  blit(dest, hotbar, Math.floor((w - hotbar.w) / 2), 26);
  return dest;
}

export const ATLAS_CELLS = [
  { id: "heart", label: "Heart" },
  { id: "heart-half", label: "Half heart" },
  { id: "heart-empty", label: "Empty heart" },
  { id: "heart-flash", label: "Heart flash" },
  { id: "hunger-full", label: "Hunger" },
  { id: "hunger-half", label: "Half hunger" },
  { id: "armor-full", label: "Armor" },
  { id: "armor-half", label: "Half armor" },
  { id: "hotbar-0", label: "Hotbar slot" },
  { id: "selected", label: "Selected slot" },
  { id: "button-idle", label: "Button", compose: () => composeButton({ state: "idle", width: 24, height: 8 }) },
  { id: "button-hover", label: "Button hover", compose: () => composeButton({ state: "hover", width: 24, height: 8 }) },
  { id: "button-pressed", label: "Button pressed", compose: () => composeButton({ state: "pressed", width: 24, height: 8 }) },
  { id: "xp-bar", label: "XP bar", compose: () => composeBar({ fill: 1, kind: "xp", width: 24, height: 5 }) },
  { id: "progress-bar", label: "Progress bar", compose: () => composeBar({ fill: 1, kind: "progress", width: 24, height: 5 }) },
  { id: "health-bar", label: "Health bar", compose: () => composeBar({ fill: 0.7, kind: "health", width: 24, height: 5 }) },
];

export function layoutAtlas(spec = ATLAS) {
  const { w, h, cols, rows, cell, gap } = spec;
  const gridW = cols * cell + (cols - 1) * gap;
  const gridH = rows * cell + (rows - 1) * gap;
  const originX = (w - gridW) / 2;
  const originY = (h - gridH) / 2;
  const cells = ATLAS_CELLS.map((entry, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      ...entry,
      col,
      row,
      cellX: originX + col * (cell + gap),
      cellY: originY + row * (cell + gap),
      cell,
    };
  });
  return { w, h, cols, rows, cell, gap, originX, originY, cells };
}

export function fitSprite(src, cell) {
  const texel = Math.max(1, Math.floor(Math.min(cell / src.w, cell / src.h)));
  return {
    texel,
    x: (cell - src.w * texel) / 2,
    y: (cell - src.h * texel) / 2,
    w: src.w * texel,
    h: src.h * texel,
  };
}

export async function loadAtlasSprite(entry) {
  if (entry.compose) return entry.compose();
  return loadHud(entry.id);
}

export function layoutCentered(src, canvas) {
  const { w, h, padX = 40, padY = 32, maxTexel = Infinity } = canvas;
  const texel = Math.max(
    1,
    Math.min(maxTexel, Math.floor(Math.min((w - padX * 2) / src.w, (h - padY * 2) / src.h))),
  );
  return {
    x: (w - src.w * texel) / 2,
    y: (h - src.h * texel) / 2,
    texel,
    w,
    h,
  };
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

export function wrapSvg(id, label, canvas, body, generator = "scripts/generate-hud-svg.mjs") {
  return `<!-- Generated by ${generator} -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.w} ${canvas.h}" width="${canvas.w}" height="${canvas.h}" role="img" aria-labelledby="${id}-title">
  <title id="${id}-title">${label}</title>
  ${body}
</svg>
`;
}

export function shapeLayer({ ind, name, ip, op, shapes }) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [0, 0, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes,
    ip,
    op,
    st: ip,
    bm: 0,
  };
}

export function staticScene({ name, w, h, shapes, generator }) {
  return {
    v: "5.7.0",
    fr: 1,
    ip: 0,
    op: 1,
    w,
    h,
    nm: name,
    ddd: 0,
    assets: [],
    layers: [shapeLayer({ ind: 1, name: "hud", ip: 0, op: 1, shapes })],
    meta: { loop: false, g: generator },
  };
}

export function flipbookScene({ name, w, h, frames, fps, hold = 1, loop = true, generator }) {
  let t = 0;
  const layers = frames.map((frame, i) => {
    const dur = frame.hold ?? hold;
    const layer = shapeLayer({
      ind: frames.length - i,
      name: frame.id,
      ip: t,
      op: t + dur,
      shapes: frame.shapes,
    });
    t += dur;
    return layer;
  });
  const op = t;
  return {
    v: "5.7.0",
    fr: fps,
    ip: 0,
    op,
    w,
    h,
    nm: name,
    ddd: 0,
    assets: [],
    layers,
    meta: { loop, g: generator },
  };
}

export async function itemPixelsFromRgba(skin) {
  return pngToPixels(skin, { flatten: 4 });
}
