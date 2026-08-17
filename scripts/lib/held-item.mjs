// Minecraft items as thin 16×16 voxel slabs parented to a limb.
// The sprite sits on the ±X faces so a side-view (yaw 90) sees the silhouette.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng } from "./steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ITEMS_BASE =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/items";
const CACHE = resolve(__dirname, "../../node_modules/.cache/minecraft-items");
const ALPHA_CUTOFF = 16;

export const ITEM_FILES = {
  sword: "diamond_sword.png",
  bow: "bow_standby.png",
  "bow-0": "bow_pulling_0.png",
  "bow-1": "bow_pulling_1.png",
  "bow-2": "bow_pulling_2.png",
  arrow: "arrow.png",
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

export async function loadItemTexture(file) {
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
  return punchAlpha(decodePng(buf));
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
  };
}

// Diamond sword in Steve's near (right) hand. Handle at the wrist, blade up the arm.
export function swordPart() {
  return heldSlab({
    id: "held-sword",
    label: "Diamond sword",
    parent: "arm-right",
    size: 16,
    thickness: 0.9,
    min: [-0.45, -1, 0],
    max: [0.45, 15, 16],
    pivot: [0, 0.8, 2.2],
  });
}

// Bow in the skeleton's far (left) hand, pushed forward so the D-shape reads
// in front of the ribs in profile.
export function bowPart() {
  return heldSlab({
    id: "held-bow",
    label: "Bow",
    parent: "arm-left",
    size: 16,
    thickness: 1,
    min: [-3.2, 0, 2],
    max: [-2.2, 16, 18],
    pivot: [-2.7, 2, 4],
  });
}

export function arrowPart() {
  return heldSlab({
    id: "held-arrow",
    label: "Arrow",
    parent: "arm-left",
    size: 16,
    thickness: 0.7,
    min: [-2.6, 4, 6],
    max: [-1.9, 20, 22],
    pivot: [-2.25, 6, 8],
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
