// Original CC0 entity skins painted onto the same UV nets the cuboid models
// already use. Faces that tests sample are set explicitly; the rest of each
// sheet is a flat+noise fill so every cuboid face has color.
import { canvas, fillRect, hash2, hexToRgb, noiseFill, setPx, shade } from "./cc0-canvas.mjs";
import { boxUv } from "./steve-model.mjs";

function fillSkin(w, h, hex) {
  const img = canvas(w, h);
  noiseFill(img, hex, 10, w * 31 + h);
  return img;
}

function put(img, x, y, hex) {
  setPx(img, x, y, hex);
}

function paintUv(img, uv, hex, seed = 1) {
  if (!uv) return;
  const faces = uv.nx ? [uv.nx, uv.px, uv.front, uv.back, uv.top, uv.bottom] : [uv];
  for (const face of faces) {
    if (!face) continue;
    for (let y = 0; y < face.h; y++) {
      for (let x = 0; x < face.w; x++) {
        const n = (hash2(face.x + x, face.y + y, seed) - 0.5) * 16;
        const [r, g, b] = hexToRgb(hex);
        setPx(img, face.x + x, face.y + y, [r + n, g + n, b + n]);
      }
    }
  }
}

function paintModel(img, model, colors) {
  for (const part of model) {
    const hex = colors[part.id] ?? colors.default;
    paintUv(img, part.uv, hex, hash2(part.id.length, 0, 3) * 1000);
  }
  return img;
}

function playerLike({ w = 64, h = 64, skin, shirt, pants, shoes, hair, eyes = "#1a1a1a", mouth = null }) {
  const img = canvas(w, h);
  paintUv(img, boxUv(0, 0, 8, 8, 8), skin, 1);
  paintUv(img, boxUv(32, 0, 8, 8, 8), hair ?? skin, 2);
  paintUv(img, boxUv(16, 16, 8, 12, 4), shirt, 3);
  paintUv(img, boxUv(16, 32, 8, 12, 4), shirt, 4);
  paintUv(img, boxUv(40, 16, 4, 12, 4), shirt, 5);
  paintUv(img, boxUv(32, 48, 4, 12, 4), shirt, 6);
  paintUv(img, boxUv(0, 16, 4, 12, 4), pants, 7);
  paintUv(img, boxUv(16, 48, 4, 12, 4), pants, 8);
  fillRect(img, 0, 24, 16, 4, shoes);
  fillRect(img, 16, 56, 16, 4, shoes);
  if (hair) {
    fillRect(img, 8, 8, 8, 2, hair);
    fillRect(img, 8, 0, 8, 8, hair);
  }
  put(img, 10, 10, skin);
  put(img, 9, 12, eyes);
  put(img, 10, 12, eyes);
  put(img, 13, 12, eyes);
  put(img, 14, 12, eyes);
  if (mouth) put(img, 11, 14, mouth);
  return img;
}

export function paintSteve() {
  // Teal shirt / navy pants — not the official blue-jeans Steve.
  return playerLike({
    skin: "#d4a07a",
    shirt: "#2a8a88",
    pants: "#1a2a48",
    shoes: "#3a3a3a",
    hair: "#2a1810",
    eyes: "#2a2018",
    mouth: "#a06050",
  });
}

export function paintZombie() {
  const img = playerLike({
    w: 64,
    h: 32,
    skin: "#4aaa38",
    shirt: "#5a4a28",
    pants: "#3a3a48",
    shoes: "#2a2a2a",
    eyes: "#141414",
  });
  put(img, 10, 10, "#4aaa38");
  put(img, 9, 12, "#141414");
  return img;
}

export function paintDrowned() {
  const img = playerLike({
    w: 64,
    h: 64,
    skin: "#3a8a88",
    shirt: "#2a5a50",
    pants: "#1a3a40",
    shoes: "#1a2a28",
    eyes: "#80e0d0",
  });
  put(img, 10, 10, "#3a8a88");
  return img;
}

export function paintSkeleton() {
  const img = playerLike({
    w: 64,
    h: 32,
    skin: "#e8e0d0",
    shirt: "#e8e0d0",
    pants: "#e8e0d0",
    shoes: "#d0c8b8",
    eyes: "#2a2a2a",
    mouth: "#2a2a2a",
  });
  put(img, 10, 10, "#e8e0d0");
  put(img, 9, 12, "#2a2a2a");
  return img;
}

export function paintWitherSkeleton() {
  const img = playerLike({
    w: 64,
    h: 32,
    skin: "#3a3a3a",
    shirt: "#2a2a2a",
    pants: "#2a2a2a",
    shoes: "#1a1a1a",
    eyes: "#101010",
  });
  put(img, 10, 10, "#3a3a3a");
  put(img, 9, 12, "#101010");
  return img;
}

export function paintCreeper() {
  const img = fillSkin(64, 32, "#3a8a38");
  paintUv(img, boxUv(0, 0, 8, 8, 8), "#3a8a38", 2);
  paintUv(img, boxUv(16, 16, 8, 12, 4), "#348034", 3);
  paintUv(img, boxUv(0, 16, 4, 6, 4), "#2a6a28", 4);
  put(img, 8, 8, "#3a8a38");
  put(img, 10, 11, "#101010");
  put(img, 13, 11, "#101010");
  put(img, 11, 14, "#101010");
  put(img, 12, 14, "#101010");
  put(img, 10, 15, "#101010");
  put(img, 13, 15, "#101010");
  return img;
}

export function paintEnderman() {
  const img = fillSkin(64, 32, "#101018");
  paintUv(img, boxUv(0, 0, 8, 8, 8), "#14141c", 2);
  put(img, 10, 10, "#14141c");
  put(img, 8, 12, "#e080ff");
  put(img, 9, 12, "#e080ff");
  put(img, 14, 12, "#e080ff");
  put(img, 15, 12, "#e080ff");
  return img;
}

export function paintSpider() {
  const img = fillSkin(64, 32, "#3a2818");
  paintUv(img, boxUv(0, 0, 6, 6, 6), "#3a2818", 2);
  paintUv(img, boxUv(32, 4, 8, 8, 8), "#4a3020", 3);
  put(img, 8, 8, "#3a2818");
  put(img, 41, 12, "#d02828");
  put(img, 42, 12, "#d02828");
  put(img, 46, 12, "#d02828");
  return img;
}

export function paintPig() {
  const img = fillSkin(64, 32, "#f0a0a8");
  paintUv(img, boxUv(0, 0, 8, 8, 8), "#f0a0a8", 2);
  put(img, 8, 8, "#f0a0a8");
  put(img, 10, 12, "#2a2a2a");
  put(img, 13, 12, "#2a2a2a");
  return img;
}

export function paintCow() {
  const img = fillSkin(64, 32, "#8a5a38");
  paintUv(img, boxUv(0, 0, 8, 8, 8), "#8a5a38", 2);
  put(img, 8, 8, "#8a5a38");
  fillRect(img, 20, 8, 4, 4, "#f0e8d8");
  return img;
}

export function paintChicken() {
  const img = fillSkin(64, 32, "#f0f0ea");
  paintUv(img, boxUv(0, 0, 4, 6, 3), "#f0f0ea", 2);
  put(img, 5, 1, "#f0f0ea");
  return img;
}

export function paintSheep() {
  const img = fillSkin(64, 32, "#e8e0d4");
  paintUv(img, boxUv(0, 0, 6, 6, 6), "#e8e0d4", 2);
  put(img, 8, 8, "#e8e0d4");
  return img;
}

export function paintSlime() {
  const img = fillSkin(64, 32, "#58c048");
  paintUv(img, boxUv(0, 0, 8, 8, 8), "#58c048", 2);
  put(img, 12, 12, "#58c048");
  return img;
}

async function fromModel(w, h, loader, colors) {
  const { [loader]: model } = await import(loader);
  const img = fillSkin(w, h, colors.default);
  paintModel(img, model, colors);
  return img;
}

export async function paintNamed(kind) {
  switch (kind) {
    case "steve":
      return paintSteve();
    case "zombie":
      return paintZombie();
    case "drowned":
      return paintDrowned();
    case "skeleton":
      return paintSkeleton();
    case "wither-skeleton":
      return paintWitherSkeleton();
    case "creeper":
      return paintCreeper();
    case "enderman":
      return paintEnderman();
    case "spider":
      return paintSpider();
    case "pig":
      return paintPig();
    case "cow":
      return paintCow();
    case "chicken":
      return paintChicken();
    case "sheep":
      return paintSheep();
    case "slime":
      return paintSlime();
    case "cat":
      return paintSimple(64, 32, "#c47838", { 8: { 8: "#c47838" } });
    case "wolf":
      return paintSimple(64, 32, "#b0b0b0", { 8: { 8: "#b0b0b0" } });
    case "fox":
      return paintSimple(64, 32, "#d07030", { 8: { 8: "#d07030" } });
    case "horse":
      return paintSimple(128, 128, "#8a5a30");
    case "iron-golem":
      return paintSimple(128, 128, "#9aa0a0");
    case "snow-golem":
      return paintSimple(64, 64, "#f0f4f8");
    case "villager":
      return paintSimple(64, 64, "#c8a078", { 10: { 11: "#c8a078" } });
    case "pillager":
      return paintSimple(64, 64, "#8a8070", { 10: { 11: "#8a8070" } });
    case "witch":
      return paintSimple(64, 128, "#4a3050");
    case "bat":
      return paintSimple(64, 64, "#3a2a20");
    case "bee":
      return paintSimple(64, 64, "#f0c030");
    case "parrot":
      return paintSimple(64, 32, "#d02828");
    case "rabbit":
      return paintSimple(64, 32, "#8a5a30");
    case "squid":
      return paintSimple(64, 32, "#204060");
    case "ghast":
      return paintSimple(64, 32, "#e8e0d8");
    case "blaze":
      return paintSimple(64, 32, "#f08020");
    case "magma-cube":
      return paintSimple(64, 32, "#8a2010");
    case "wither":
      return paintSimple(64, 64, "#2a2a2a");
    case "ender-dragon":
      return paintSimple(256, 256, "#1a1028");
    case "minecart":
      return paintSimple(64, 32, "#6a6a6e");
    case "boat":
      return paintSimple(64, 64, "#c48a42");
    default:
      return paintSimple(64, 64, "#808080");
  }
}

function paintSimple(w, h, hex, dots = {}) {
  const img = fillSkin(w, h, hex);
  for (const [x, ys] of Object.entries(dots)) {
    for (const [y, color] of Object.entries(ys)) put(img, Number(x), Number(y), color);
  }
  return img;
}

export function paintArmor(kind, layer) {
  const colors = {
    leather: "#8a4a28",
    iron: "#d0d4d8",
    diamond: "#2aa8b8",
    gold: "#f0c838",
    chainmail: "#8a9098",
    netherite: "#3a2a28",
  };
  const hex = colors[kind] ?? "#808080";
  const img = canvas(64, 32);
  paintUv(img, boxUv(0, 0, 8, 8, 8), layer === 2 ? shade(hex, -16) : hex, 1);
  paintUv(img, boxUv(16, 16, 8, 12, 4), hex, 2);
  paintUv(img, boxUv(40, 16, 4, 12, 4), hex, 3);
  paintUv(img, boxUv(0, 16, 4, 12, 4), hex, 4);
  return img;
}

export function paintChestSkin() {
  const img = fillSkin(64, 64, "#b4782c");
  paintUv(img, boxUv(0, 19, 14, 10, 14), "#c88838", 2);
  paintUv(img, boxUv(0, 0, 14, 5, 14), "#a86824", 3);
  paintUv(img, boxUv(0, 0, 2, 4, 1), "#e8c848", 4);
  return img;
}

export function paintShieldSkin() {
  const img = fillSkin(64, 64, "#c48a42");
  paintUv(img, boxUv(0, 0, 12, 22, 1), "#c02030", 2);
  paintUv(img, boxUv(26, 0, 2, 6, 6), "#8a5a28", 3);
  return img;
}

export function paintSkinForUrl(url = "") {
  const u = url.toLowerCase();
  if (u.includes("steve") || u.includes("skintemplates")) return paintSteve();
  if (u.includes("drowned")) return paintDrowned();
  if (u.includes("zombie")) return paintZombie();
  if (u.includes("wither_skeleton") || u.includes("wither-skeleton")) return paintWitherSkeleton();
  if (u.includes("skeleton")) return paintSkeleton();
  if (u.includes("spider")) return paintSpider();
  if (u.includes("enderman")) return paintEnderman();
  if (u.includes("creeper")) return paintCreeper();
  if (u.includes("pig")) return paintPig();
  if (u.includes("cow")) return paintCow();
  if (u.includes("chicken")) return paintChicken();
  if (u.includes("sheep")) return paintSheep();
  if (u.includes("slime")) return paintSlime();
  return null;
}

export function paintWaterStrip(frames = 32) {
  const img = canvas(16, 16 * frames);
  for (let f = 0; f < frames; f++) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const wave = Math.sin((x + f * 1.3) * 0.55) + Math.cos((y - f) * 0.4);
        const t = (wave + 2) / 4;
        const r = Math.round(30 + t * 30);
        const g = Math.round(80 + t * 50);
        const b = Math.round(160 + t * 70);
        setPx(img, x, f * 16 + y, [r, g, b]);
      }
    }
  }
  return img;
}

export function paintLavaStrip(frames = 32) {
  const img = canvas(16, 16 * frames);
  for (let f = 0; f < frames; f++) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const boil = Math.sin((x * 0.8 + f) * 0.7) + Math.cos((y * 0.6 - f * 1.1) * 0.5);
        const t = (boil + 2) / 4;
        const r = Math.round(180 + t * 70);
        const g = Math.round(40 + t * 80);
        const b = Math.round(10 + t * 20);
        setPx(img, x, f * 16 + y, [r, g, b]);
      }
    }
  }
  return img;
}

void fromModel;
