// Shared machinery for rendering the Minecraft player model as flat vector art.
//
// The model is six cuboids (head, torso, two arms, two legs) in a small
// hierarchy: the torso carries the head and arms, the legs hang off the root.
// A pose rotates parts around the model's own pivots; the figure is then turned
// (yaw), tilted toward the camera (pitch) and projected orthographically. Every
// visible face is painted texel by texel from a 64x64 player skin, so facial
// features land exactly where the skin puts them.
//
// Consumers: generate-steve-*.mjs, generate-zombie-*.mjs, generate-skeleton.mjs,
// generate-spider.mjs, generate-enderman.mjs, generate-creeper.mjs,
// generate-pig.mjs, generate-cow.mjs.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const STEVE_SKIN_URL = "https://assets.mojang.com/SkinTemplates/steve.png";
export const ZOMBIE_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/zombie/zombie.png";
export const SKELETON_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/skeleton/skeleton.png";
export const SPIDER_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/spider/spider.tga";
export const ENDERMAN_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/enderman/enderman.tga";
export const CREEPER_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/creeper/creeper.png";
export const PIG_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/pig/pig.png";
export const COW_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/cow/cow.png";
export const CHICKEN_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/chicken.png";
export const SHEEP_SKIN_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/sheep/sheep.png";
export const SHEEP_WOOL_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/sheep/sheep_wool.png";
export const WOLF_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/wolf/wolf.png";
export const SLIME_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/slime/slime.png";
export const CHEST_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/chest/normal.png";
export const SHIELD_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/shield.png";
export const RABBIT_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/rabbit/brown.png";
export const RABBIT_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/rabbit/brown.png";
export const VILLAGER_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/villager/villager.png";
export const VILLAGER_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/villager/villager.png";
export const CAT_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/cat/redtabby.png";
export const BAT_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/bat.png";
export const BAT_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/bat/bat.png";
export const SQUID_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/squid.png";
export const WITCH_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/witch.png";
export const IRON_GOLEM_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/iron_golem.png";
export const IRON_GOLEM_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/iron_golem/iron_golem.png";
export const HORSE_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/horse/horse_brown.png";
export const BOAT_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/boat/boat_oak.png";
export const BLAZE_SKIN_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/blaze/blaze.png";
export const BLAZE_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/blaze.png";
export const MAGMA_CUBE_SKIN_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/slime/magmacube.png";
export const GHAST_SKIN_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/ghast/ghast.png";
export const GHAST_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/ghast/ghast.png";
export const WITHER_SKELETON_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/skeleton/wither_skeleton.png";
export const SNOW_GOLEM_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/snow_golem.png";
export const DROWNED_SKIN_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/zombie/drowned.png";
export const DROWNED_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/zombie/drowned.tga";
export const PILLAGER_SKIN_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/illager/pillager.png";
export const MINECART_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/minecart.png";
export const WITHER_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/wither_boss/wither.png";
export const WITHER_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/wither/wither.png";
export const ENDER_DRAGON_SKIN_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/enderdragon/dragon.png";
export const FOX_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/fox/fox.png";
export const FOX_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/fox/fox.png";
export const PARROT_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/parrot/parrot_red_blue.png";
export const PARROT_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/parrot/parrot_red_blue.png";
export const BEE_SKIN_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/bee/bee.png";
export const BEE_SKIN_FALLBACK_URL =
  "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/bee/bee.png";
export const NETHERITE_ARMOR_1_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/netherite_1.png";
export const NETHERITE_ARMOR_2_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/netherite_2.png";
export const LEATHER_ARMOR_1_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/cloth_1.png";
export const LEATHER_ARMOR_2_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/cloth_2.png";
export const IRON_ARMOR_1_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/iron_1.png";
export const IRON_ARMOR_2_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/iron_2.png";
export const DIAMOND_ARMOR_1_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/diamond_1.png";
export const DIAMOND_ARMOR_2_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/diamond_2.png";
export const GOLD_ARMOR_1_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/gold_1.png";
export const GOLD_ARMOR_2_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/gold_2.png";
export const CHAIN_ARMOR_1_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/chain_1.png";
export const CHAIN_ARMOR_2_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/models/armor/chain_2.png";
const SKIN_URL = STEVE_SKIN_URL;
const CACHE = resolve(__dirname, "../../node_modules/.cache/steve-skin.png");
const ZOMBIE_CACHE = resolve(__dirname, "../../node_modules/.cache/zombie-skin.png");
const SKELETON_CACHE = resolve(__dirname, "../../node_modules/.cache/skeleton-skin.png");
const SPIDER_CACHE = resolve(__dirname, "../../node_modules/.cache/spider-skin.tga");
const ENDERMAN_CACHE = resolve(__dirname, "../../node_modules/.cache/enderman-skin.tga");
const CREEPER_CACHE = resolve(__dirname, "../../node_modules/.cache/creeper-skin.png");
const PIG_CACHE = resolve(__dirname, "../../node_modules/.cache/pig-skin.png");
const COW_CACHE = resolve(__dirname, "../../node_modules/.cache/cow-skin.png");
const CHICKEN_CACHE = resolve(__dirname, "../../node_modules/.cache/chicken-skin.png");
const SHEEP_CACHE = resolve(__dirname, "../../node_modules/.cache/sheep-skin.png");
const SHEEP_WOOL_CACHE = resolve(__dirname, "../../node_modules/.cache/sheep-wool.png");
const WOLF_CACHE = resolve(__dirname, "../../node_modules/.cache/wolf-skin.png");
const SLIME_CACHE = resolve(__dirname, "../../node_modules/.cache/slime-skin.png");
const CHEST_CACHE = resolve(__dirname, "../../node_modules/.cache/chest-entity.png");
const SHIELD_CACHE = resolve(__dirname, "../../node_modules/.cache/shield-entity.png");
const RABBIT_CACHE = resolve(__dirname, "../../node_modules/.cache/rabbit-skin.png");
const VILLAGER_CACHE = resolve(__dirname, "../../node_modules/.cache/villager-skin.png");
const CAT_CACHE = resolve(__dirname, "../../node_modules/.cache/cat-skin.png");
const BAT_CACHE = resolve(__dirname, "../../node_modules/.cache/bat-skin.png");
const SQUID_CACHE = resolve(__dirname, "../../node_modules/.cache/squid-skin.png");
const WITCH_CACHE = resolve(__dirname, "../../node_modules/.cache/witch-skin.png");
const IRON_GOLEM_CACHE = resolve(__dirname, "../../node_modules/.cache/iron-golem-skin.png");
const HORSE_CACHE = resolve(__dirname, "../../node_modules/.cache/horse-skin.png");
const BOAT_CACHE = resolve(__dirname, "../../node_modules/.cache/boat-oak-skin.png");
const BLAZE_CACHE = resolve(__dirname, "../../node_modules/.cache/blaze-skin.png");
const MAGMA_CUBE_CACHE = resolve(__dirname, "../../node_modules/.cache/magma-cube-skin.png");
const GHAST_CACHE = resolve(__dirname, "../../node_modules/.cache/ghast-skin.png");
const WITHER_SKELETON_CACHE = resolve(__dirname, "../../node_modules/.cache/wither-skeleton-skin.png");
const SNOW_GOLEM_CACHE = resolve(__dirname, "../../node_modules/.cache/snow-golem-skin.png");
const DROWNED_CACHE = resolve(__dirname, "../../node_modules/.cache/drowned-skin.png");
const PILLAGER_CACHE = resolve(__dirname, "../../node_modules/.cache/pillager-skin.png");
const MINECART_CACHE = resolve(__dirname, "../../node_modules/.cache/minecart-skin.png");
const WITHER_CACHE = resolve(__dirname, "../../node_modules/.cache/wither-skin.png");
const ENDER_DRAGON_CACHE = resolve(__dirname, "../../node_modules/.cache/ender-dragon-skin.png");
const FOX_CACHE = resolve(__dirname, "../../node_modules/.cache/fox-skin.png");
const PARROT_CACHE = resolve(__dirname, "../../node_modules/.cache/parrot-skin.png");
const BEE_CACHE = resolve(__dirname, "../../node_modules/.cache/bee-skin.png");
const NETHERITE_ARMOR_1_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-netherite-1.png");
const NETHERITE_ARMOR_2_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-netherite-2.png");
const LEATHER_ARMOR_1_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-leather-1.png");
const LEATHER_ARMOR_2_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-leather-2.png");
const IRON_ARMOR_1_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-iron-1.png");
const IRON_ARMOR_2_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-iron-2.png");
const DIAMOND_ARMOR_1_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-diamond-1.png");
const DIAMOND_ARMOR_2_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-diamond-2.png");
const GOLD_ARMOR_1_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-gold-1.png");
const GOLD_ARMOR_2_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-gold-2.png");
const CHAIN_ARMOR_1_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-chain-1.png");
const CHAIN_ARMOR_2_CACHE = resolve(__dirname, "../../node_modules/.cache/armor-chain-2.png");

// ---------------------------------------------------------------- png decoding

export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a png");
  let off = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let palette = null;
  let alphaTable = null;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (data[12] !== 0) throw new Error("interlaced png is unsupported");
    } else if (type === "PLTE") palette = Buffer.from(data);
    else if (type === "tRNS") alphaTable = Buffer.from(data);
    else if (type === "IDAT") idat.push(Buffer.from(data));
    else if (type === "IEND") break;
    off += 12 + len;
  }
  if (![1, 2, 4, 8].includes(bitDepth)) throw new Error(`bit depth ${bitDepth} is unsupported`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`color type ${colorType} is unsupported`);
  if (bitDepth < 8 && colorType !== 0 && colorType !== 3) {
    throw new Error(`bit depth ${bitDepth} is unsupported for color type ${colorType}`);
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bitsPerPixel = bitDepth * channels;
  const stride = Math.ceil((width * bitsPerPixel) / 8);
  const filterBpp = Math.max(1, Math.ceil(bitsPerPixel / 8));
  const flat = Buffer.alloc(height * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= filterBpp ? line[i - filterBpp] : 0;
      const b = prev[i];
      const c = i >= filterBpp ? prev[i - filterBpp] : 0;
      if (filter === 1) line[i] = (line[i] + a) & 255;
      else if (filter === 2) line[i] = (line[i] + b) & 255;
      else if (filter === 3) line[i] = (line[i] + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        line[i] = (line[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      } else if (filter !== 0) throw new Error(`unknown png filter ${filter}`);
    }
    line.copy(flat, y * stride);
    prev = line;
  }

  const samples = unpackPngSamples(flat, width, height, bitDepth, channels);
  const scale = bitDepth === 8 ? 1 : 255 / ((1 << bitDepth) - 1);

  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    let r;
    let g;
    let b;
    let a = 255;
    if (colorType === 6) [r, g, b, a] = [samples[i * 4], samples[i * 4 + 1], samples[i * 4 + 2], samples[i * 4 + 3]];
    else if (colorType === 2) [r, g, b] = [samples[i * 3], samples[i * 3 + 1], samples[i * 3 + 2]];
    else if (colorType === 0) r = g = b = Math.round(samples[i] * scale);
    else if (colorType === 4) {
      r = g = b = samples[i * 2];
      a = samples[i * 2 + 1];
    } else {
      const idx = samples[i];
      [r, g, b] = [palette[idx * 3], palette[idx * 3 + 1], palette[idx * 3 + 2]];
      if (alphaTable && idx < alphaTable.length) a = alphaTable[idx];
    }
    rgba.set([r, g, b, a], i * 4);
  }
  return { width, height, rgba };
}

function unpackPngSamples(flat, width, height, bitDepth, channels) {
  if (bitDepth === 8) return flat;
  const ppb = 8 / bitDepth;
  const mask = (1 << bitDepth) - 1;
  const packedStride = Math.ceil((width * bitDepth * channels) / 8);
  const samples = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y++) {
    const row = flat.subarray(y * packedStride, (y + 1) * packedStride);
    for (let x = 0; x < width * channels; x++) {
      const byte = row[Math.floor(x / ppb)];
      const shift = 8 - bitDepth * ((x % ppb) + 1);
      samples[y * width * channels + x] = (byte >> shift) & mask;
    }
  }
  return samples;
}

// Uncompressed true-color TGA (Bedrock spider / enderman skins).
export function decodeTga(buf) {
  const idLen = buf[0];
  const imageType = buf[2];
  const width = buf.readUInt16LE(12);
  const height = buf.readUInt16LE(14);
  const bpp = buf[16];
  const desc = buf[17];
  if (imageType !== 2) throw new Error(`tga type ${imageType} is unsupported`);
  if (bpp !== 24 && bpp !== 32) throw new Error(`tga bit depth ${bpp} is unsupported`);
  const originTop = (desc & 0x20) !== 0;
  const channels = bpp / 8;
  const off = 18 + idLen;
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const srcY = originTop ? y : height - 1 - y;
    for (let x = 0; x < width; x++) {
      const i = off + (srcY * width + x) * channels;
      const b = buf[i];
      const g = buf[i + 1];
      const r = buf[i + 2];
      const a = channels === 4 ? buf[i + 3] : 255;
      rgba.set([r, g, b, a], (y * width + x) * 4);
    }
  }
  return { width, height, rgba };
}

export function decodeTexture(buf) {
  if (buf.length >= 8 && buf.readUInt32BE(0) === 0x89504e47) return decodePng(buf);
  return decodeTga(buf);
}

function regionOpaqueCount(skin, x, y, w, h) {
  let n = 0;
  for (let yy = y; yy < y + h; yy++)
    for (let xx = x; xx < x + w; xx++) {
      if (skin.rgba[(yy * skin.width + xx) * 4 + 3] > 0) n += 1;
    }
  return n;
}

function copyRect(skin, sx, sy, dx, dy, w, h, flipX = false) {
  const tmp = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = ((sy + y) * skin.width + (sx + x)) * 4;
      tmp.set(skin.rgba.subarray(i, i + 4), (y * w + x) * 4);
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const srcX = flipX ? w - 1 - x : x;
      const i = ((dy + y) * skin.width + (dx + x)) * 4;
      skin.rgba.set(tmp.subarray((y * w + srcX) * 4, (y * w + srcX) * 4 + 4), i);
    }
}

// Classic zombie (and old player) skins are 64x32: only the right limbs are
// painted. The game mirrors them onto the left at runtime. Do the same so the
// 64x64 model UVs are not empty.
export function normalizePlayerSkin(skin) {
  if (skin.width < 64) throw new Error("expected a skin at least 64 px wide");
  if (skin.height === 32) {
    const rgba = new Uint8Array(skin.width * 64 * 4);
    rgba.set(skin.rgba);
    skin = { width: skin.width, height: 64, rgba };
  }
  if (skin.height >= 64 && regionOpaqueCount(skin, 36, 52, 4, 12) === 0) {
    // Right arm 40,16 → left arm 32,48. Swap ±x faces and flip the rest.
    copyRect(skin, 48, 20, 32, 52, 4, 12, true); // +x → −x
    copyRect(skin, 44, 20, 36, 52, 4, 12, true); // front
    copyRect(skin, 40, 20, 40, 52, 4, 12, true); // −x → +x
    copyRect(skin, 52, 20, 44, 52, 4, 12, true); // back
    copyRect(skin, 44, 16, 36, 48, 4, 4, true); // top
    copyRect(skin, 48, 16, 40, 48, 4, 4, true); // bottom
    // Right leg 0,16 → left leg 16,48.
    copyRect(skin, 8, 20, 16, 52, 4, 12, true);
    copyRect(skin, 4, 20, 20, 52, 4, 12, true);
    copyRect(skin, 0, 20, 24, 52, 4, 12, true);
    copyRect(skin, 12, 20, 28, 52, 4, 12, true);
    copyRect(skin, 4, 16, 20, 48, 4, 4, true);
    copyRect(skin, 8, 16, 24, 48, 4, 4, true);
  }
  return skin;
}

// Without an explicit path the official template is downloaded once and
// cached, so repeat runs stay offline-friendly. Pass `{ url, cache }` for
// another 64x64 (or classic 64x32) player-layout skin such as the zombie.
export async function loadSkin(explicitPath, options = {}) {
  const urls = options.urls ?? [options.url ?? SKIN_URL];
  const cache = options.cache ?? (urls[0] === ZOMBIE_SKIN_URL ? ZOMBIE_CACHE : CACHE);
  const shouldNormalize = options.normalize ?? true;
  let decoded;
  if (explicitPath) decoded = decodeTexture(await readFile(explicitPath));
  else {
    try {
      decoded = decodeTexture(await readFile(cache));
    } catch {
      let lastErr;
      let buf;
      for (const url of urls) {
        const res = await fetch(url);
        if (!res.ok) {
          lastErr = new Error(`could not download ${url} (${res.status})`);
          continue;
        }
        buf = Buffer.from(await res.arrayBuffer());
        lastErr = null;
        break;
      }
      if (!buf) throw lastErr ?? new Error("could not download skin");
      await mkdir(dirname(cache), { recursive: true });
      await writeFile(cache, buf);
      decoded = decodeTexture(buf);
    }
  }
  return shouldNormalize ? normalizePlayerSkin(decoded) : decoded;
}

export async function loadZombieSkin(explicitPath) {
  return loadSkin(explicitPath, { url: ZOMBIE_SKIN_URL, cache: ZOMBIE_CACHE });
}

export async function loadSkeletonSkin(explicitPath) {
  return loadSkin(explicitPath, { url: SKELETON_SKIN_URL, cache: SKELETON_CACHE, normalize: false });
}

export async function loadSpiderSkin(explicitPath) {
  return loadSkin(explicitPath, { url: SPIDER_SKIN_URL, cache: SPIDER_CACHE, normalize: false });
}

export async function loadEndermanSkin(explicitPath) {
  return loadSkin(explicitPath, { url: ENDERMAN_SKIN_URL, cache: ENDERMAN_CACHE, normalize: false });
}

export async function loadCreeperSkin(explicitPath) {
  return loadSkin(explicitPath, { url: CREEPER_SKIN_URL, cache: CREEPER_CACHE, normalize: false });
}

export async function loadPigSkin(explicitPath) {
  return loadSkin(explicitPath, { url: PIG_SKIN_URL, cache: PIG_CACHE, normalize: false });
}

export async function loadCowSkin(explicitPath) {
  return loadSkin(explicitPath, { url: COW_SKIN_URL, cache: COW_CACHE, normalize: false });
}

export async function loadChickenSkin(explicitPath) {
  return loadSkin(explicitPath, { url: CHICKEN_SKIN_URL, cache: CHICKEN_CACHE, normalize: false });
}

export async function loadSheepSkin(explicitPath) {
  return loadSkin(explicitPath, { url: SHEEP_SKIN_URL, cache: SHEEP_CACHE, normalize: false });
}

export async function loadSheepWoolSkin(explicitPath) {
  return loadSkin(explicitPath, { url: SHEEP_WOOL_URL, cache: SHEEP_WOOL_CACHE, normalize: false });
}

export async function loadWolfSkin(explicitPath) {
  return loadSkin(explicitPath, { url: WOLF_SKIN_URL, cache: WOLF_CACHE, normalize: false });
}

export async function loadSlimeSkin(explicitPath) {
  return loadSkin(explicitPath, { url: SLIME_SKIN_URL, cache: SLIME_CACHE, normalize: false });
}

export async function loadChestSkin(explicitPath) {
  return loadSkin(explicitPath, { url: CHEST_SKIN_URL, cache: CHEST_CACHE, normalize: false });
}

export async function loadShieldSkin(explicitPath) {
  return loadSkin(explicitPath, { url: SHIELD_SKIN_URL, cache: SHIELD_CACHE, normalize: false });
}

export async function loadRabbitSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [RABBIT_SKIN_URL, RABBIT_SKIN_FALLBACK_URL],
    cache: RABBIT_CACHE,
    normalize: false,
  });
}

export async function loadVillagerSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [VILLAGER_SKIN_URL, VILLAGER_SKIN_FALLBACK_URL],
    cache: VILLAGER_CACHE,
    normalize: false,
  });
}

export async function loadCatSkin(explicitPath) {
  return loadSkin(explicitPath, { url: CAT_SKIN_URL, cache: CAT_CACHE, normalize: false });
}

export async function loadBatSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [BAT_SKIN_URL, BAT_SKIN_FALLBACK_URL],
    cache: BAT_CACHE,
    normalize: false,
  });
}

export async function loadSquidSkin(explicitPath) {
  return loadSkin(explicitPath, { url: SQUID_SKIN_URL, cache: SQUID_CACHE, normalize: false });
}

export async function loadWitchSkin(explicitPath) {
  return loadSkin(explicitPath, { url: WITCH_SKIN_URL, cache: WITCH_CACHE, normalize: false });
}

export async function loadIronGolemSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [IRON_GOLEM_SKIN_URL, IRON_GOLEM_SKIN_FALLBACK_URL],
    cache: IRON_GOLEM_CACHE,
    normalize: false,
  });
}

export async function loadHorseSkin(explicitPath) {
  return loadSkin(explicitPath, { url: HORSE_SKIN_URL, cache: HORSE_CACHE, normalize: false });
}

export async function loadBoatSkin(explicitPath) {
  return loadSkin(explicitPath, { url: BOAT_SKIN_URL, cache: BOAT_CACHE, normalize: false });
}

export async function loadBlazeSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [BLAZE_SKIN_URL, BLAZE_SKIN_FALLBACK_URL],
    cache: BLAZE_CACHE,
    normalize: false,
  });
}

export async function loadMagmaCubeSkin(explicitPath) {
  return loadSkin(explicitPath, { url: MAGMA_CUBE_SKIN_URL, cache: MAGMA_CUBE_CACHE, normalize: false });
}

export async function loadWitherSkeletonSkin(explicitPath) {
  return loadSkin(explicitPath, {
    url: WITHER_SKELETON_SKIN_URL,
    cache: WITHER_SKELETON_CACHE,
    normalize: false,
  });
}

export async function loadSnowGolemSkin(explicitPath) {
  return loadSkin(explicitPath, {
    url: SNOW_GOLEM_SKIN_URL,
    cache: SNOW_GOLEM_CACHE,
    normalize: false,
  });
}

export async function loadDrownedSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [DROWNED_SKIN_URL, DROWNED_SKIN_FALLBACK_URL],
    cache: DROWNED_CACHE,
  });
}

export async function loadPillagerSkin(explicitPath) {
  return loadSkin(explicitPath, {
    url: PILLAGER_SKIN_URL,
    cache: PILLAGER_CACHE,
    normalize: false,
  });
}

export async function loadMinecartSkin(explicitPath) {
  return loadSkin(explicitPath, { url: MINECART_SKIN_URL, cache: MINECART_CACHE, normalize: false });
}

export async function loadWitherSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [WITHER_SKIN_URL, WITHER_SKIN_FALLBACK_URL],
    cache: WITHER_CACHE,
    normalize: false,
  });
}

export async function loadEnderDragonSkin(explicitPath) {
  return loadSkin(explicitPath, {
    url: ENDER_DRAGON_SKIN_URL,
    cache: ENDER_DRAGON_CACHE,
    normalize: false,
  });
}

export async function loadFoxSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [FOX_SKIN_URL, FOX_SKIN_FALLBACK_URL],
    cache: FOX_CACHE,
    normalize: false,
  });
}

export async function loadParrotSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [PARROT_SKIN_URL, PARROT_SKIN_FALLBACK_URL],
    cache: PARROT_CACHE,
    normalize: false,
  });
}

export async function loadBeeSkin(explicitPath) {
  return loadSkin(explicitPath, {
    urls: [BEE_SKIN_URL, BEE_SKIN_FALLBACK_URL],
    cache: BEE_CACHE,
    normalize: false,
  });
}

export async function loadGhastSkin(explicitPath) {
  const skin = await loadSkin(explicitPath, {
    urls: [GHAST_SKIN_URL, GHAST_SKIN_FALLBACK_URL],
    cache: GHAST_CACHE,
    normalize: false,
  });
  if (skin.width >= 128 && skin.height >= 64) return downscaleNearest(skin, 2);
  return skin;
}

function downscaleNearest(skin, factor) {
  const width = Math.floor(skin.width / factor);
  const height = Math.floor(skin.height / factor);
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = ((y * factor) * skin.width + x * factor) * 4;
      rgba.set(skin.rgba.subarray(si, si + 4), (y * width + x) * 4);
    }
  }
  return { width, height, rgba };
}

function tintLeatherArmor(skin) {
  const rgba = new Uint8Array(skin.rgba);
  const [tr, tg, tb] = [196, 112, 80];
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue;
    rgba[i] = Math.round((rgba[i] * tr) / 255);
    rgba[i + 1] = Math.round((rgba[i + 1] * tg) / 255);
    rgba[i + 2] = Math.round((rgba[i + 2] * tb) / 255);
  }
  return { width: skin.width, height: skin.height, rgba };
}

export async function loadArmorLayer(kind, layer, explicitPath) {
  const spec = {
    leather: [
      { url: LEATHER_ARMOR_1_URL, cache: LEATHER_ARMOR_1_CACHE },
      { url: LEATHER_ARMOR_2_URL, cache: LEATHER_ARMOR_2_CACHE },
    ],
    iron: [
      { url: IRON_ARMOR_1_URL, cache: IRON_ARMOR_1_CACHE },
      { url: IRON_ARMOR_2_URL, cache: IRON_ARMOR_2_CACHE },
    ],
    diamond: [
      { url: DIAMOND_ARMOR_1_URL, cache: DIAMOND_ARMOR_1_CACHE },
      { url: DIAMOND_ARMOR_2_URL, cache: DIAMOND_ARMOR_2_CACHE },
    ],
    gold: [
      { url: GOLD_ARMOR_1_URL, cache: GOLD_ARMOR_1_CACHE },
      { url: GOLD_ARMOR_2_URL, cache: GOLD_ARMOR_2_CACHE },
    ],
    chainmail: [
      { url: CHAIN_ARMOR_1_URL, cache: CHAIN_ARMOR_1_CACHE },
      { url: CHAIN_ARMOR_2_URL, cache: CHAIN_ARMOR_2_CACHE },
    ],
    netherite: [
      { url: NETHERITE_ARMOR_1_URL, cache: NETHERITE_ARMOR_1_CACHE },
      { url: NETHERITE_ARMOR_2_URL, cache: NETHERITE_ARMOR_2_CACHE },
    ],
  }[kind];
  if (!spec) throw new Error(`unknown armor ${kind}`);
  const { url, cache } = spec[layer === 2 ? 1 : 0];
  const skin = await loadSkin(explicitPath, { url, cache, normalize: false });
  return kind === "leather" ? tintLeatherArmor(skin) : skin;
}

// ------------------------------------------------------------------- 3d helpers

export function norm(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}

export const rad = (deg) => (deg * Math.PI) / 180;

export function rotX(deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

export function rotY(deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}

export function rotZ(deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

export function matMul(a, b) {
  const out = new Array(9).fill(0);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      for (let k = 0; k < 3; k++) out[r * 3 + c] += a[r * 3 + k] * b[k * 3 + c];
  return out;
}

export function apply(m, v) {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

const IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1];

// ------------------------------------------------------------------ color grade

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [
    Math.round(channel(h + 1 / 3) * 255),
    Math.round(channel(h) * 255),
    Math.round(channel(h - 1 / 3) * 255),
  ];
}

// Official Steve hair is a near-black brown (L ≲ 0.17). The mustache and
// beard are a lighter cocoa (L ≳ 0.22) and stay put so the face still reads.
export function isHair([r, g, b]) {
  const [h, s, l] = rgbToHsl(r, g, b);
  const brown = h < 0.12 || h > 0.9;
  return s > 0.12 && l < 0.17 && brown;
}

// Lifts skin into readable tans and firms up saturation. Hair is crushed the
// other way — deep brown, almost black — so it does not wash out to cocoa.
export function grade([r, g, b]) {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (s < 0.06) {
    // Greys are the shoes; the reference art renders them near-black.
    return l < 0.7 ? hslToRgb(h, s, l * 0.55) : [r, g, b];
  }
  if (isHair([r, g, b])) {
    const crushed = Math.min(0.09, l * 0.5 + 0.02);
    return hslToRgb(0.06, 0.28, crushed);
  }
  const lifted = Math.min(0.96, l + 0.3 * Math.exp(-4 * l));
  const saturated = s > 0.9 ? 0.88 : Math.min(1, s * 1.22);
  return hslToRgb(h, saturated, lifted);
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

export const rgbToHex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");

// Light direction in world space: high, from the front left. The skin already
// bakes brighter tops and darker sides, so this pass stays deliberately gentle.
export const DEFAULT_SHADING = {
  light: norm([-0.45, 0.78, 0.44]),
  ambient: 0.7,
  diffuse: 0.3,
  sky: 0.08, // extra lift for up-facing faces, matching flat-art references
  fill: 0.18, // camera-facing fill, so turned-away materials keep their identity
  highlight: "#fff6e2",
  shadowTint: "#24427e",
};

function luminanceFor(shading, worldNormal, cameraNormal) {
  const { light } = shading;
  const dot = worldNormal[0] * light[0] + worldNormal[1] * light[1] + worldNormal[2] * light[2];
  const sky = Math.max(0, worldNormal[1]) ** 1.5;
  return (
    shading.ambient +
    shading.diffuse * Math.max(0, dot) +
    shading.sky * sky +
    shading.fill * Math.max(0, cameraNormal[2])
  );
}

function shade(shading, rgb, lum, source) {
  if (source && isHair(source)) {
    // Keep hair near-black even on lit top faces; a warm highlight would
    // turn it back into the old cocoa brown.
    const dim = 0.62 + 0.28 * Math.min(1, Math.max(0, lum));
    return rgb.map((v) => Math.round(v * dim));
  }
  if (lum > 1) return mix(rgb, hexToRgb(shading.highlight), Math.min(0.45, (lum - 1) * 1.25));
  const dimmed = rgb.map((v) => v * lum ** 0.85);
  return mix(dimmed, hexToRgb(shading.shadowTint), (1 - lum) * 0.35);
}

// Minecraft hit flash: lerp every shaded texel toward white. `amount` is 0..1.
export function applyFlash(rgb, amount) {
  if (!amount) return rgb;
  return mix(rgb, [255, 255, 255], Math.min(1, Math.max(0, amount)));
}

// ----------------------------------------------------------------- model layout

const uv = (x, y, w, h) => ({ x, y, w, h });

// Classic 64x64 skin layout: faces sit around the box net as
// [-x, front, +x, back] with top and bottom above them.
export const boxUv = (ox, oy, w, h, d) => ({
  nx: uv(ox, oy + d, d, h),
  front: uv(ox + d, oy + d, w, h),
  px: uv(ox + d + w, oy + d, d, h),
  back: uv(ox + d + w + d, oy + d, w, h),
  top: uv(ox + d, oy, w, d),
  bottom: uv(ox + d + w, oy, w, d),
});

// Body space: +x is the character's left, +y up, +z the direction the character
// faces, origin between the feet. Units are skin texels.
export const MODEL = [
  {
    id: "torso",
    label: "Torso",
    min: [-4, 12, -2],
    max: [4, 24, 2],
    pivot: [0, 12, 0],
    uv: boxUv(16, 16, 8, 12, 4),
  },
  {
    id: "head",
    label: "Head",
    parent: "torso",
    min: [-4, 24, -4],
    max: [4, 32, 4],
    pivot: [0, 24, 0],
    uv: boxUv(0, 0, 8, 8, 8),
  },
  {
    id: "arm-right",
    label: "Right arm",
    parent: "torso",
    min: [-8, 12, -2],
    max: [-4, 24, 2],
    pivot: [-4, 22, 0],
    uv: boxUv(40, 16, 4, 12, 4),
  },
  {
    id: "arm-left",
    label: "Left arm",
    parent: "torso",
    min: [4, 12, -2],
    max: [8, 24, 2],
    pivot: [4, 22, 0],
    uv: boxUv(32, 48, 4, 12, 4),
  },
  {
    id: "leg-right",
    label: "Right leg",
    min: [-4, 0, -2],
    max: [0, 12, 2],
    pivot: [-2, 12, 0],
    uv: boxUv(0, 16, 4, 12, 4),
  },
  {
    id: "leg-left",
    label: "Left leg",
    min: [0, 0, -2],
    max: [4, 12, 2],
    pivot: [2, 12, 0],
    uv: boxUv(16, 48, 4, 12, 4),
  },
];

const byId = new Map(MODEL.map((p) => [p.id, p]));

function lookupOf(model) {
  return model === MODEL ? byId : new Map(model.map((p) => [p.id, p]));
}

// Corner order per face is [u0v0, u1v0, u1v1, u0v1] seen from outside the box.
function faceCorners(min, max, face) {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  switch (face) {
    case "front":
      return { normal: [0, 0, 1], quad: [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]] };
    case "back":
      return { normal: [0, 0, -1], quad: [[x1, y1, z0], [x0, y1, z0], [x0, y0, z0], [x1, y0, z0]] };
    case "nx":
      return { normal: [-1, 0, 0], quad: [[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0]] };
    case "px":
      return { normal: [1, 0, 0], quad: [[x1, y1, z1], [x1, y1, z0], [x1, y0, z0], [x1, y0, z1]] };
    case "top":
      return { normal: [0, 1, 0], quad: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] };
    case "bottom":
      return { normal: [0, -1, 0], quad: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]] };
    default:
      throw new Error(`unknown face ${face}`);
  }
}

// ------------------------------------------------------------------- quantizing

// Flattens one texture rectangle: the dominant colors become cluster centers and
// every remaining shade snaps onto the closest one within `tolerance`.
function flattenRegion(skin, rect, tolerance) {
  const counts = new Map();
  for (let y = rect.y; y < rect.y + rect.h; y++)
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      const i = (y * skin.width + x) * 4;
      if (skin.rgba[i + 3] === 0) continue;
      const key = (skin.rgba[i] << 16) | (skin.rgba[i + 1] << 8) | skin.rgba[i + 2];
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
  return lookup;
}

// The base quad hides hairlines. It must be the real field color, not a
// feature (eyes, frown) that only wins because the field split into many
// near-greens. Skip a near-black winner unless it actually owns the face.
function pickBaseColor(counts) {
  const ranked = [...counts].sort((a, b) => b[1] - a[1]);
  const total = ranked.reduce((n, [, c]) => n + c, 0) || 1;
  for (const [hex, n] of ranked) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (r + g + b < 48 && n / total < 0.4) continue;
    return hex;
  }
  return ranked[0]?.[0];
}

// --------------------------------------------------------------------- pipeline

// Local rotation order: the part is first turned to pick which texture face
// looks at the camera (`faceYaw`), then pitched/rolled/yawed by the pose. That
// keeps `pitch` the screen-plane swing axis in every view.
function localMatrix(rot) {
  const spin = rot.faceYaw ? rotY(rot.faceYaw) : IDENTITY;
  return matMul(rotY(rot.yaw ?? 0), matMul(rotZ(rot.roll ?? 0), matMul(rotX(rot.pitch ?? 0), spin)));
}

function poseFor(pose, id) {
  return pose.parts?.[id] ?? {};
}

// Walks the parent chain so a torso lean carries the head and arms with it.
function chainMatrix(pose, part, lookup = byId) {
  const own = localMatrix(poseFor(pose, part.id));
  if (!part.parent) return own;
  const parent = lookup.get(part.parent);
  if (!parent) throw new Error(`missing parent ${part.parent} for ${part.id}`);
  return matMul(chainMatrix(pose, parent, lookup), own);
}

function chainPoint(pose, part, point, lookup = byId) {
  const rot = localMatrix(poseFor(pose, part.id));
  const local = [point[0] - part.pivot[0], point[1] - part.pivot[1], point[2] - part.pivot[2]];
  const spun = apply(rot, local);
  const placed = [spun[0] + part.pivot[0], spun[1] + part.pivot[1], spun[2] + part.pivot[2]];
  if (!part.parent) return placed;
  const parent = lookup.get(part.parent);
  if (!parent) throw new Error(`missing parent ${part.parent} for ${part.id}`);
  return chainPoint(pose, parent, placed, lookup);
}

function skinKey(skin, x, y) {
  if (x < 0 || y < 0 || x >= skin.width || y >= skin.height) return null;
  const i = (y * skin.width + x) * 4;
  if (skin.rgba[i + 3] === 0) return null;
  return (skin.rgba[i] << 16) | (skin.rgba[i + 1] << 8) | skin.rgba[i + 2];
}

// In a true profile the front of the head is edge-on, so the eye and mustache
// would vanish. Stamp the front-face columns onto the leading edge of the
// visible side so the face still reads as a 2D sprite.
function profileHeadKey(skin, partId, faceName, rect, tx, ty, viewYaw, headYaw) {
  const side = skinKey(skin, rect.x + tx, rect.y + ty);
  const profile = Math.abs(Math.abs(viewYaw ?? 0) - 90) < 12;
  // A turned head already shows the real front face; don't stamp over the side.
  if (Math.abs(headYaw ?? 0) > 12) return side;
  if (!profile || partId !== "head" || (faceName !== "nx" && faceName !== "px")) return side;
  const overlay = 3;
  const onFront = faceName === "nx" ? tx >= rect.w - overlay : tx < overlay;
  if (!onFront) return side;
  const col = faceName === "nx" ? tx - (rect.w - overlay) : overlay - 1 - tx;
  const frontX = faceName === "nx" ? 8 + col : 13 + col;
  return skinKey(skin, frontX, 8 + ty) ?? side;
}

/**
 * Builds every visible face of the posed figure in camera space, with each face
 * already flattened into horizontal runs of graded, shaded color.
 *
 * `pose` is `{ view: { yaw, pitch }, root: { x, y }, parts: { <id>: { pitch,
 * roll, yaw, faceYaw, shadeScale } }, flash }`.
 *
 * `extras` are additional cuboids (held items) that share the pose hierarchy
 * but paint from their own skin: `{ part, skin, tolerance }`.
 */
export function buildFigure({ skin, pose, shading = DEFAULT_SHADING, tolerance, model = MODEL, extras = [] }) {
  const yaw = rotY(pose.view?.yaw ?? 0);
  const pitch = rotX(pose.view?.pitch ?? 0);
  const viewMatrix = matMul(pitch, yaw);
  const offset = [pose.root?.x ?? 0, pose.root?.y ?? 0, 0];
  const palette = new Set();
  const parts = [];
  const extraParts = extras.map((e) => e.part ?? e);
  const lookup = new Map([...model, ...extraParts].map((p) => [p.id, p]));
  const flash = shading.flash ?? pose.flash ?? 0;

  const paint = (part, partSkin, partTolerance) => {
    const partPose = poseFor(pose, part.id);
    const tol = partTolerance?.[part.id] ?? partTolerance?.default ?? 12;
    const chain = chainMatrix(pose, part, lookup);
    const worldOf = (p) => {
      const q = chainPoint(pose, part, p, lookup);
      return [q[0] + offset[0], q[1] + offset[1], q[2] + offset[2]];
    };

    const faces = [];
    let depthSum = 0;
    let depthCount = 0;

    for (const [faceName, rect] of Object.entries(part.uv ?? {})) {
      const { normal, quad } = faceCorners(part.min, part.max, faceName);
      const worldNormal = norm(apply(chain, normal));
      const cameraNormal = norm(apply(viewMatrix, worldNormal));
      const points = quad.map((p) => apply(viewMatrix, worldOf(p)));
      const depth = points.reduce((sum, p) => sum + p[2], 0) / 4;
      depthSum += depth;
      depthCount += 1;
      if (cameraNormal[2] <= 0.0015) continue; // back-facing

      const lum = luminanceFor(shading, worldNormal, cameraNormal) * (partPose.shadeScale ?? 1);
      const colors = flattenRegion(partSkin, rect, tol);
      const runs = [];
      const counts = new Map();
      for (let ty = 0; ty < rect.h; ty++) {
        let run = null;
        for (let tx = 0; tx <= rect.w; tx++) {
          let hex = null;
          if (tx < rect.w) {
            const key = profileHeadKey(
              partSkin,
              part.id,
              faceName,
              rect,
              tx,
              ty,
              pose.view?.yaw,
              partPose.yaw,
            );
            if (key != null) {
              const src = colors.get(key) ?? [(key >> 16) & 255, (key >> 8) & 255, key & 255];
              const colored = shading.grade === false ? src : grade(src);
              hex = rgbToHex(applyFlash(shade(shading, colored, lum, src), flash));
              palette.add(hex);
            }
          }
          if (run && run.hex === hex) {
            run.x1 = tx + 1;
            continue;
          }
          if (run) {
            runs.push(run);
            counts.set(run.hex, (counts.get(run.hex) ?? 0) + (run.x1 - run.x0));
          }
          run = hex ? { hex, y: ty, x0: tx, x1: tx + 1 } : null;
        }
      }
      const base = pickBaseColor(counts);
      if (!base) continue;
      faces.push({ faceName, points, depth, rect, runs, base, sparse: Boolean(part.sparse) });
    }

    parts.push({
      id: part.id,
      label: part.label,
      parent: part.parent,
      pivot: apply(viewMatrix, worldOf(part.pivot)),
      faces,
      depth: depthSum / Math.max(1, depthCount),
    });
  };

  for (const part of model) paint(part, skin, tolerance);
  for (const extra of extras) {
    const part = extra.part ?? extra;
    paint(part, extra.skin ?? skin, extra.tolerance ?? { default: 4 });
  }

  parts.sort((a, b) => a.depth - b.depth);
  for (const part of parts) part.faces.sort((a, b) => a.depth - b.depth);
  return { parts, palette };
}

// ------------------------------------------------------------------- projection

// Orthographic camera-space -> screen. `roll` rotates the finished image, so it
// tilts the figure without disturbing the lighting.
export function makeProjector({ scale, originX, originY, roll = 0 }) {
  const cos = Math.cos(rad(roll));
  const sin = Math.sin(rad(roll));
  return (p) => {
    const x = p[0] * scale;
    const y = -p[1] * scale;
    return [x * cos - y * sin + originX, x * sin + y * cos + originY];
  };
}

export function boundsOf(parts, project) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const part of parts)
    for (const face of part.faces)
      for (const p of face.points) {
        const [x, y] = project(p);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
  return { minX, minY, maxX, maxY };
}

// Scales and centers the figure inside `canvas`, keeping `pad` px of margin.
export function fitProjector(parts, canvas, roll = 0) {
  const unit = makeProjector({ scale: 1, originX: 0, originY: 0, roll });
  const { minX, minY, maxX, maxY } = boundsOf(parts, unit);
  const scale = Math.min(
    (canvas.w - canvas.pad * 2) / (maxX - minX),
    (canvas.h - canvas.pad * 2) / (maxY - minY),
  );
  return makeProjector({
    scale,
    originX: (canvas.w - (maxX - minX) * scale) / 2 - minX * scale,
    originY: (canvas.h - (maxY - minY) * scale) / 2 - minY * scale,
    roll,
  });
}

// -------------------------------------------------------------------- svg emit

export const fmt = (n) => (Math.round(n * 100) / 100).toString();

export function quadPath(pts) {
  return `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L")}Z`;
}

// A texel run is a sub-quad of the face; the projection is affine, so bilinear
// interpolation between the four projected corners is exact.
export function runQuad(corners, rect, run) {
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const at = (u, v) => lerp(lerp(corners[0], corners[1], u), lerp(corners[3], corners[2], u), v);
  const u0 = run.x0 / rect.w;
  const u1 = run.x1 / rect.w;
  const v0 = run.y / rect.h;
  const v1 = (run.y + 1) / rect.h;
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
}

// Groups a face's runs by color so each color becomes one path.
export function faceColorPaths(face, corners, { includeBase = false } = {}) {
  const byColor = new Map();
  for (const run of face.runs) {
    if (!includeBase && run.hex === face.base) continue;
    const list = byColor.get(run.hex) ?? [];
    list.push(runQuad(corners, face.rect, run));
    byColor.set(run.hex, list);
  }
  return byColor;
}

export function svgFigureBody(parts, project, indent = "    ", idPrefix = "") {
  const out = [];
  for (const part of parts) {
    if (!part.faces.length) continue;
    const id = `${idPrefix}${part.id}`;
    out.push(`${indent}<g id="${id}" aria-label="${part.label}">`);
    for (const face of part.faces) {
      const corners = face.points.map(project);
      out.push(`${indent}  <g class="face" data-face="${face.faceName}">`);
      // Opaque cubes get a base quad so hairlines between texels disappear.
      // Item silhouettes are sparse — only paint the actual texel runs.
      if (!face.sparse) out.push(`${indent}    <path fill="${face.base}" d="${quadPath(corners)}"/>`);
      for (const [hex, quads] of faceColorPaths(face, corners, { includeBase: face.sparse }))
        out.push(
          `${indent}    <path fill="${hex}" stroke="${hex}" stroke-width=".6" stroke-linejoin="round" d="${quads.map(quadPath).join("")}"/>`,
        );
      out.push(`${indent}  </g>`);
    }
    out.push(`${indent}</g>`);
  }
  return out;
}

export function parseArgs(argv) {
  return new Map(
    argv.map((a) => {
      const [k, v = "true"] = a.replace(/^--/, "").split("=");
      return [k, v];
    }),
  );
}

// ----------------------------------------------------------------- lottie emit

export function hexToRgba01(hex) {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
    1,
  ];
}

function lottieQuad(pts) {
  return {
    c: true,
    v: pts.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]),
    i: pts.map(() => [0, 0]),
    o: pts.map(() => [0, 0]),
  };
}

function lottieFill(hex) {
  return { ty: "fl", o: { a: 0, k: 100 }, c: { a: 0, k: hexToRgba01(hex) }, r: 1 };
}

function lottieStroke(hex, width = 0.6) {
  return {
    ty: "st",
    o: { a: 0, k: 100 },
    w: { a: 0, k: width },
    c: { a: 0, k: hexToRgba01(hex) },
    lc: 2,
    lj: 1,
  };
}

const IDENTITY_TR = {
  ty: "tr",
  p: { a: 0, k: [0, 0] },
  a: { a: 0, k: [0, 0] },
  s: { a: 0, k: [100, 100] },
  r: { a: 0, k: 0 },
  o: { a: 0, k: 100 },
};

function lottieGroup(name, items) {
  return { ty: "gr", nm: name, it: [...items, { ...IDENTITY_TR }] };
}

// One shape-layer `shapes` array for the posed figure. Parts are already
// back-to-front; later groups draw on top inside a Lottie shape layer.
export function figureToLottieShapes(parts, project) {
  const shapes = [];
  for (const part of parts) {
    if (!part.faces.length) continue;
    const items = [];
    for (const face of part.faces) {
      const corners = face.points.map(project);
      if (!face.sparse) {
        items.push(
          lottieGroup(`${part.id}/${face.faceName}`, [
            { ty: "sh", nm: "base", ks: { a: 0, k: lottieQuad(corners) } },
            lottieFill(face.base),
          ]),
        );
      }
      for (const [hex, quads] of faceColorPaths(face, corners, { includeBase: face.sparse })) {
        const paths = quads.map((q, i) => ({
          ty: "sh",
          nm: `texel-${i}`,
          ks: { a: 0, k: lottieQuad(q) },
        }));
        items.push(lottieGroup(`${part.id}/${face.faceName}/${hex}`, [...paths, lottieFill(hex), lottieStroke(hex)]));
      }
    }
    shapes.push(lottieGroup(part.id, items));
  }
  return shapes;
}
