// Minecraft items as thin 16×16 voxel slabs parented to a limb.
// The sprite sits on the ±X faces so a side-view (yaw 90) sees the silhouette.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { boxUv, decodePng, loadShieldSkin } from "./steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ITEMS_BASE =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/items";
const CACHE = resolve(__dirname, "../../node_modules/.cache/minecraft-items");
const ALPHA_CUTOFF = 16;

export const ITEM_FILES = {
  sword: "diamond_sword.png",
  "stone-sword": "stone_sword.png",
  bow: "bow_standby.png",
  "bow-0": "bow_pulling_0.png",
  "bow-1": "bow_pulling_1.png",
  "bow-2": "bow_pulling_2.png",
  arrow: "arrow.png",
  trident: "trident.png",
  crossbow: "crossbow_standby.png",
};

export function itemSlabUv(size = 16) {
  const last = size - 1;
  return {
    nx: { x: 0, y: 0, w: size, h: size },
    px: { x: 0, y: 0, w: size, h: size },
    front: { x: 0, y: 0, w: 1, h: size },
    back: { x: last, y: 0, w: 1, h: size },
    top: { x: 0, y: 0, w: size, h: 1 },
    bottom: { x: 0, y: last, w: size, h: 1 },
  };
}

export function punchAlpha(skin, cutoff = ALPHA_CUTOFF) {
  const rgba = new Uint8Array(skin.rgba);
  for (let i = 3; i < rgba.length; i += 4) {
    if (rgba[i] < cutoff) {
      rgba[i] = 0;
      rgba[i - 3] = 0;
      rgba[i - 2] = 0;
      rgba[i - 1] = 0;
    }
  }
  return { width: skin.width, height: skin.height, rgba };
}

function flipRgbaU(skin) {
  const { width, height, rgba } = skin;
  const out = new Uint8Array(rgba.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = (y * width + (width - 1 - x)) * 4;
      out[dst] = rgba[src];
      out[dst + 1] = rgba[src + 1];
      out[dst + 2] = rgba[src + 2];
      out[dst + 3] = rgba[src + 3];
    }
  }
  return { width, height, rgba: out };
}

export async function loadItemTexture(file, { flipU = false } = {}) {
  const cachePath = resolve(CACHE, file);
  let buf;
  try {
    buf = await readFile(cachePath);
  } catch {
    const url = `${ITEMS_BASE}/${file}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`could not download ${url} (${res.status})`);
    buf = Buffer.from(await res.arrayBuffer());
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, buf);
  }
  const skin = punchAlpha(decodePng(buf));
  return flipU ? flipRgbaU(skin) : skin;
}

export function heldSlab({
  id,
  label,
  parent,
  thickness = 0.9,
  size = 16,
  handle = [0, 1.5, 2],
  min,
  max,
  pivot,
}) {
  return {
    id,
    label,
    parent,
    min: min ?? [-thickness / 2, 0, 0],
    max: max ?? [thickness / 2, size, size],
    pivot: pivot ?? handle,
    uv: itemSlabUv(size),
    sparse: true,
  };
}

// Official item PNGs stay unflipped: sword handle is bottom-left, tip top-right;
// bow stave sits on the right. The slab is in body space, parented to the near
// arm, so a side-view (yaw 90) sees the silhouette on the ±X faces.
//
// Handle / grip at the right wrist. Blade runs forward (+Z) and a little up
// so idle looks like the hotbar icon — diagonal, not a flagpole.
export function swordPart() {
  return heldSlab({
    id: "held-sword",
    label: "Diamond sword",
    parent: "arm-right",
    size: 16,
    thickness: 0.9,
    min: [-6.45, 10.6, -0.4],
    max: [-5.55, 17.8, 14.8],
    pivot: [-6, 12.0, 0.5],
  });
}

// Bow in the near (right) hand so it stays in front of the ribs in profile.
// Upright-enough slab at chest / wrist height, stave toward +Z (the target).
export function bowPart() {
  return heldSlab({
    id: "held-bow",
    label: "Bow",
    parent: "arm-right",
    size: 16,
    thickness: 1,
    min: [-5.6, 8.2, 1.2],
    max: [-4.5, 22.2, 13.8],
    pivot: [-5.05, 12.2, 4.0],
  });
}

export function arrowPart() {
  return heldSlab({
    id: "held-arrow",
    label: "Arrow",
    parent: "arm-right",
    size: 16,
    thickness: 0.7,
    min: [-4.9, 11.2, 3.5],
    max: [-4.2, 13.6, 19.2],
    pivot: [-4.55, 12.4, 8.0],
  });
}

export function bowFileForPull(pull = 0) {
  if (pull >= 0.72) return ITEM_FILES["bow-2"];
  if (pull >= 0.45) return ITEM_FILES["bow-1"];
  if (pull >= 0.22) return ITEM_FILES["bow-0"];
  return ITEM_FILES.bow;
}

export async function swordExtra() {
  return { part: swordPart(), skin: await loadItemTexture(ITEM_FILES.sword), tolerance: { default: 4 } };
}

export function stoneSwordPart() {
  return { ...swordPart(), id: "held-sword", label: "Stone sword" };
}

export async function stoneSwordExtra() {
  return {
    part: stoneSwordPart(),
    skin: await loadItemTexture(ITEM_FILES["stone-sword"]),
    tolerance: { default: 4 },
  };
}

export async function bowExtra(pull = 0) {
  return { part: bowPart(), skin: await loadItemTexture(bowFileForPull(pull)), tolerance: { default: 4 } };
}

export async function arrowExtra() {
  return { part: arrowPart(), skin: await loadItemTexture(ITEM_FILES.arrow), tolerance: { default: 4 } };
}

export async function skeletonDrawExtras(pull) {
  const extras = [await bowExtra(pull)];
  if (pull >= 0.4) extras.push(await arrowExtra());
  return extras;
}

export function tridentPart() {
  return { ...swordPart(), id: "held-trident", label: "Trident" };
}

export async function tridentExtra() {
  return {
    part: tridentPart(),
    skin: await loadItemTexture(ITEM_FILES.trident),
    tolerance: { default: 4 },
  };
}

export function crossbowPart() {
  return { ...bowPart(), id: "held-crossbow", label: "Crossbow" };
}

export async function crossbowExtra() {
  return {
    part: crossbowPart(),
    skin: await loadItemTexture(ITEM_FILES.crossbow),
    tolerance: { default: 4 },
  };
}

// Thin in X so a side-view (yaw 90) reads the 12×22 wooden face on ±X.
// Parented to the far (left) arm — Java off-hand.
export function shieldPlateUv() {
  return {
    nx: { x: 1, y: 1, w: 12, h: 22 },
    px: { x: 1, y: 1, w: 12, h: 22 },
    front: { x: 0, y: 1, w: 1, h: 22 },
    back: { x: 13, y: 1, w: 1, h: 22 },
    top: { x: 1, y: 0, w: 12, h: 1 },
    bottom: { x: 1, y: 23, w: 12, h: 1 },
  };
}

export function shieldParts() {
  return [
    {
      id: "shield-plate",
      label: "Shield plate",
      parent: "arm-left",
      min: [7.1, 1.5, -7],
      max: [8.1, 23.5, 5],
      pivot: [7.6, 12, -0.5],
      uv: shieldPlateUv(),
    },
    {
      id: "shield-handle",
      label: "Shield handle",
      parent: "arm-left",
      min: [6.2, 9.5, -1],
      max: [7.2, 15.5, 5],
      pivot: [6.7, 12.5, 1],
      uv: boxUv(26, 0, 2, 6, 6),
    },
  ];
}

export async function shieldExtras() {
  const skin = await loadShieldSkin();
  return shieldParts().map((part) => ({ part, skin, tolerance: { default: 8 } }));
}
