// Shared machinery for rendering the Minecraft player model as flat vector art.
//
// The model is a torso, a head, and four hinged limbs. Each limb is two
// cuboids — upper arm / forearm, thigh / shin — with a short skinned sleeve
// only at the elbow or knee, so the shafts stay boxes and the joint is a
// soft curve instead of a hinge crack. The torso carries the head and arms;
// the legs hang off the root. A pose rotates parts around the model's own
// pivots; the figure is then turned (yaw), tilted toward the camera (pitch)
// and projected orthographically. Every visible face is painted texel by
// texel from a 64x64 player skin, so facial features land exactly where the
// skin puts them.
//
// Consumers: generate-steve-svg.mjs (hero pose), generate-steve-sprites.mjs
// (side-view sprite frames), generate-steve-lottie.mjs (animated rig).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKIN_URL = "https://assets.mojang.com/SkinTemplates/steve.png";
const CACHE = resolve(__dirname, "../../node_modules/.cache/steve-skin.png");

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
  if (bitDepth !== 8) throw new Error(`bit depth ${bitDepth} is unsupported`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`color type ${colorType} is unsupported`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const flat = Buffer.alloc(height * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
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

  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    let r;
    let g;
    let b;
    let a = 255;
    if (colorType === 6) [r, g, b, a] = [flat[i * 4], flat[i * 4 + 1], flat[i * 4 + 2], flat[i * 4 + 3]];
    else if (colorType === 2) [r, g, b] = [flat[i * 3], flat[i * 3 + 1], flat[i * 3 + 2]];
    else if (colorType === 0) r = g = b = flat[i];
    else if (colorType === 4) {
      r = g = b = flat[i * 2];
      a = flat[i * 2 + 1];
    } else {
      const idx = flat[i];
      [r, g, b] = [palette[idx * 3], palette[idx * 3 + 1], palette[idx * 3 + 2]];
      if (alphaTable && idx < alphaTable.length) a = alphaTable[idx];
    }
    rgba.set([r, g, b, a], i * 4);
  }
  return { width, height, rgba };
}

// Without an explicit path the official 64x64 template is downloaded once and
// cached, so repeat runs stay offline-friendly.
export async function loadSkin(explicitPath) {
  if (explicitPath) return decodePng(await readFile(explicitPath));
  try {
    return decodePng(await readFile(CACHE));
  } catch {
    const res = await fetch(SKIN_URL);
    if (!res.ok) throw new Error(`could not download ${SKIN_URL} (${res.status})`);
    const buf = Buffer.from(await res.arrayBuffer());
    await mkdir(dirname(CACHE), { recursive: true });
    await writeFile(CACHE, buf);
    return decodePng(buf);
  }
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

// ----------------------------------------------------------------- model layout

const uv = (x, y, w, h) => ({ x, y, w, h });

// Classic 64x64 skin layout: faces sit around the box net as
// [-x, front, +x, back] with top and bottom above them.
const boxUv = (ox, oy, w, h, d) => ({
  nx: uv(ox, oy + d, d, h),
  front: uv(ox + d, oy + d, w, h),
  px: uv(ox + d + w, oy + d, d, h),
  back: uv(ox + d + w + d, oy + d, w, h),
  top: uv(ox + d, oy, w, d),
  bottom: uv(ox + d + w, oy, w, d),
});

// Cuboid shafts stop this many texels short of the joint. The gap is the
// only place that lofts — a short elbow/knee sleeve, not a hose.
export const JOINT_INSET = 1;
export const BEND_SOFTNESS = JOINT_INSET;
export const BEND_BANDS = 8;
export const LIMB_TEXELS = 12;

// Split a 12-texel limb net into the shoulder/hip half and the hand/foot half.
// `skip` drops that many texels at the cut so the joint sleeve owns them.
function limbUv(ox, oy, w, h, d, half, skip = 0) {
  const hh = h / 2;
  const boxH = hh - skip;
  const side = (yOff) => ({
    nx: uv(ox, oy + d + yOff, d, boxH),
    front: uv(ox + d, oy + d + yOff, w, boxH),
    px: uv(ox + d + w, oy + d + yOff, d, boxH),
    back: uv(ox + d + w + d, oy + d + yOff, w, boxH),
  });
  if (half === "upper") {
    return {
      ...side(0),
      top: uv(ox + d, oy, w, d),
      bottom: uv(ox + d, oy + d + Math.max(0, boxH - d), w, d),
    };
  }
  return {
    ...side(hh + skip),
    top: uv(ox + d, oy + d + hh + skip, w, d),
    bottom: uv(ox + d + w, oy, w, d),
  };
}

function sleeveUv(ox, oy, w, h, d, inset = JOINT_INSET) {
  const yOff = h / 2 - inset;
  const sh = inset * 2;
  return {
    nx: uv(ox, oy + d + yOff, d, sh),
    front: uv(ox + d, oy + d + yOff, w, sh),
    px: uv(ox + d + w, oy + d + yOff, d, sh),
    back: uv(ox + d + w + d, oy + d + yOff, w, sh),
  };
}

const SLEEVE_LABELS = {
  "elbow-right": "Right elbow",
  "elbow-left": "Left elbow",
  "knee-right": "Right knee",
  "knee-left": "Left knee",
};

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
    label: "Right upper arm",
    parent: "torso",
    min: [-8, 18 + JOINT_INSET, -2],
    max: [-4, 24, 2],
    pivot: [-4, 22, 0],
    joint: [-6, 18, 0],
    jointPart: "forearm-right",
    sleeveId: "elbow-right",
    sleeveUv: sleeveUv(40, 16, 4, 12, 4),
    omitFaces: ["bottom"],
    uv: limbUv(40, 16, 4, 12, 4, "upper", JOINT_INSET),
  },
  {
    id: "forearm-right",
    label: "Right forearm",
    parent: "arm-right",
    min: [-8, 12, -2],
    max: [-4, 18 - JOINT_INSET, 2],
    pivot: [-6, 18, 0],
    omitFaces: ["top"],
    uv: limbUv(40, 16, 4, 12, 4, "lower", JOINT_INSET),
  },
  {
    id: "arm-left",
    label: "Left upper arm",
    parent: "torso",
    min: [4, 18 + JOINT_INSET, -2],
    max: [8, 24, 2],
    pivot: [4, 22, 0],
    joint: [6, 18, 0],
    jointPart: "forearm-left",
    sleeveId: "elbow-left",
    sleeveUv: sleeveUv(32, 48, 4, 12, 4),
    omitFaces: ["bottom"],
    uv: limbUv(32, 48, 4, 12, 4, "upper", JOINT_INSET),
  },
  {
    id: "forearm-left",
    label: "Left forearm",
    parent: "arm-left",
    min: [4, 12, -2],
    max: [8, 18 - JOINT_INSET, 2],
    pivot: [6, 18, 0],
    omitFaces: ["top"],
    uv: limbUv(32, 48, 4, 12, 4, "lower", JOINT_INSET),
  },
  {
    id: "leg-right",
    label: "Right thigh",
    min: [-4, 6 + JOINT_INSET, -2],
    max: [0, 12, 2],
    pivot: [-2, 12, 0],
    joint: [-2, 6, 0],
    jointPart: "shin-right",
    sleeveId: "knee-right",
    sleeveUv: sleeveUv(0, 16, 4, 12, 4),
    omitFaces: ["bottom"],
    uv: limbUv(0, 16, 4, 12, 4, "upper", JOINT_INSET),
  },
  {
    id: "shin-right",
    label: "Right shin",
    parent: "leg-right",
    min: [-4, 0, -2],
    max: [0, 6 - JOINT_INSET, 2],
    pivot: [-2, 6, 0],
    omitFaces: ["top"],
    uv: limbUv(0, 16, 4, 12, 4, "lower", JOINT_INSET),
  },
  {
    id: "leg-left",
    label: "Left thigh",
    min: [0, 6 + JOINT_INSET, -2],
    max: [4, 12, 2],
    pivot: [2, 12, 0],
    joint: [2, 6, 0],
    jointPart: "shin-left",
    sleeveId: "knee-left",
    sleeveUv: sleeveUv(16, 48, 4, 12, 4),
    omitFaces: ["bottom"],
    uv: limbUv(16, 48, 4, 12, 4, "upper", JOINT_INSET),
  },
  {
    id: "shin-left",
    label: "Left shin",
    parent: "leg-left",
    min: [0, 0, -2],
    max: [4, 6 - JOINT_INSET, 2],
    pivot: [2, 6, 0],
    omitFaces: ["top"],
    uv: limbUv(16, 48, 4, 12, 4, "lower", JOINT_INSET),
  },
];

const byId = new Map(MODEL.map((p) => [p.id, p]));

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
function chainMatrix(pose, part) {
  const own = localMatrix(poseFor(pose, part.id));
  if (!part.parent) return own;
  return matMul(chainMatrix(pose, byId.get(part.parent)), own);
}

function chainPoint(pose, part, point) {
  const rot = localMatrix(poseFor(pose, part.id));
  const local = [point[0] - part.pivot[0], point[1] - part.pivot[1], point[2] - part.pivot[2]];
  const spun = apply(rot, local);
  const placed = [spun[0] + part.pivot[0], spun[1] + part.pivot[1], spun[2] + part.pivot[2]];
  return part.parent ? chainPoint(pose, byId.get(part.parent), placed) : placed;
}

function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross3(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function safeNorm(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  if (l < 1e-8) return null;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// 0 at the shoulder/hip, 1 at the hand/foot. The band around `jointY` eases
// so the elbow/knee is a curve instead of a hinge crack.
export function bendBlend(y, jointY, softness = BEND_SOFTNESS) {
  return 1 - smoothstep(jointY - softness, jointY + softness, y);
}

function scalePose(rot, t) {
  if (t <= 0) return {};
  return {
    pitch: (rot.pitch ?? 0) * t,
    roll: (rot.roll ?? 0) * t,
    yaw: (rot.yaw ?? 0) * t,
    faceYaw: (rot.faceYaw ?? 0) * t,
  };
}

function bendLocalPoint(pose, part, point) {
  const joint = part.joint;
  if (!joint || !part.jointPart) return point;
  const blend = bendBlend(point[1], joint[1], part.softness ?? BEND_SOFTNESS);
  if (blend <= 0) return point;
  const rot = localMatrix(scalePose(poseFor(pose, part.jointPart), blend));
  return add3(joint, apply(rot, sub3(point, joint)));
}

function limbRing(part, y) {
  const [x0, , z0] = part.min;
  const [x1, , z1] = part.max;
  return [
    [x0, y, z1],
    [x1, y, z1],
    [x1, y, z0],
    [x0, y, z0],
  ];
}

function limbBandFaces(upper, lower) {
  return {
    front: [upper[0], upper[1], lower[1], lower[0]],
    back: [upper[2], upper[3], lower[3], lower[2]],
    nx: [upper[3], upper[0], lower[0], lower[3]],
    px: [upper[1], upper[2], lower[2], lower[1]],
  };
}

function uvRow(rect, row) {
  return { x: rect.x, y: rect.y + row, w: rect.w, h: 1 };
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

function rasterizeFace({
  skin,
  partId,
  faceName,
  rect,
  points,
  worldNormal,
  cameraNormal,
  shading,
  shadeScale,
  viewYaw,
  headYaw,
  tolerance,
  palette,
  doubleSided = false,
}) {
  if (!worldNormal || !cameraNormal) return null;
  if (!doubleSided && cameraNormal[2] <= 0.0015) return null;
  if (doubleSided && Math.abs(cameraNormal[2]) <= 0.0015) return null;
  if (doubleSided && cameraNormal[2] < 0) {
    worldNormal = [-worldNormal[0], -worldNormal[1], -worldNormal[2]];
    cameraNormal = [-cameraNormal[0], -cameraNormal[1], -cameraNormal[2]];
    points = [points[0], points[3], points[2], points[1]];
  }
  const depth = points.reduce((sum, p) => sum + p[2], 0) / 4;
  const lum = luminanceFor(shading, worldNormal, cameraNormal) * (shadeScale ?? 1);
  const lookup = flattenRegion(skin, rect, tolerance);
  const runs = [];
  const counts = new Map();
  for (let ty = 0; ty < rect.h; ty++) {
    let run = null;
    for (let tx = 0; tx <= rect.w; tx++) {
      let hex = null;
      if (tx < rect.w) {
        const key = profileHeadKey(skin, partId, faceName, rect, tx, ty, viewYaw, headYaw);
        if (key != null) {
          const src = lookup.get(key) ?? [(key >> 16) & 255, (key >> 8) & 255, key & 255];
          hex = rgbToHex(shade(shading, grade(src), lum, src));
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
  const base = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!base) return null;
  return { faceName, points, depth, rect, runs, base };
}

function quadNormals(worldQuad, viewMatrix) {
  const worldNormal = safeNorm(cross3(sub3(worldQuad[1], worldQuad[0]), sub3(worldQuad[3], worldQuad[0])));
  if (!worldNormal) return { worldNormal: null, cameraNormal: null };
  return { worldNormal, cameraNormal: safeNorm(apply(viewMatrix, worldNormal)) };
}

function collectPart(id, label, parent, pivot, faces, depths) {
  return {
    id,
    label,
    parent,
    pivot,
    faces,
    depth: depths.reduce((sum, d) => sum + d, 0) / Math.max(1, depths.length),
  };
}

/**
 * Builds every visible face of the posed figure in camera space, with each face
 * already flattened into horizontal runs of graded, shaded color.
 *
 * `pose` is `{ view: { yaw, pitch }, root: { x, y }, parts: { <id>: { pitch,
 * roll, yaw, faceYaw, shadeScale } } }`.
 */
export function buildFigure({ skin, pose, shading = DEFAULT_SHADING, tolerance }) {
  const yaw = rotY(pose.view?.yaw ?? 0);
  const pitch = rotX(pose.view?.pitch ?? 0);
  const viewMatrix = matMul(pitch, yaw);
  const offset = [pose.root?.x ?? 0, pose.root?.y ?? 0, 0];
  const palette = new Set();
  const parts = [];

  const toWorld = (part, p, bend = false) => {
    const local = bend ? bendLocalPoint(pose, part, p) : p;
    const q = chainPoint(pose, part, local);
    return [q[0] + offset[0], q[1] + offset[1], q[2] + offset[2]];
  };

  const paint = (partId, faceName, rect, worldQuad, shadeScale, headYaw, tol, doubleSided = false) => {
    const { worldNormal, cameraNormal } = quadNormals(worldQuad, viewMatrix);
    const points = worldQuad.map((p) => apply(viewMatrix, p));
    const depth = points.reduce((sum, p) => sum + p[2], 0) / 4;
    const face = rasterizeFace({
      skin,
      partId,
      faceName,
      rect,
      points,
      worldNormal,
      cameraNormal,
      shading,
      shadeScale,
      viewYaw: pose.view?.yaw,
      headYaw,
      tolerance: tol,
      palette,
      doubleSided,
    });
    return { face, depth };
  };

  for (const part of MODEL) {
    const partPose = poseFor(pose, part.id);
    const tol = tolerance?.[part.id] ?? tolerance?.default ?? 12;
    const chain = chainMatrix(pose, part);
    const faces = [];
    const depths = [];
    for (const [faceName, rect] of Object.entries(part.uv)) {
      if (part.omitFaces?.includes(faceName)) continue;
      const { normal, quad } = faceCorners(part.min, part.max, faceName);
      const worldNormal = norm(apply(chain, normal));
      const cameraNormal = norm(apply(viewMatrix, worldNormal));
      const worldQuad = quad.map((p) => toWorld(part, p, false));
      const points = worldQuad.map((p) => apply(viewMatrix, p));
      const depth = points.reduce((sum, p) => sum + p[2], 0) / 4;
      depths.push(depth);
      const face = rasterizeFace({
        skin,
        partId: part.id,
        faceName,
        rect,
        points,
        worldNormal,
        cameraNormal,
        shading,
        shadeScale: partPose.shadeScale ?? 1,
        viewYaw: pose.view?.yaw,
        headYaw: partPose.yaw,
        tolerance: tol,
        palette,
      });
      if (face) faces.push(face);
    }

    parts.push(
      collectPart(
        part.id,
        part.label,
        part.parent,
        apply(viewMatrix, toWorld(part, part.pivot, false)),
        faces,
        depths,
      ),
    );

    if (!part.sleeveUv || !part.jointPart) continue;
    const lower = byId.get(part.jointPart);
    const sleeveFaces = [];
    const sleeveDepths = [];
    const yTop = part.min[1];
    const yBot = lower.max[1];
    const rings = [];
    for (let i = 0; i <= BEND_BANDS; i += 1) {
      const y = yTop + (yBot - yTop) * (i / BEND_BANDS);
      rings.push(limbRing(part, y).map((p) => toWorld(part, p, true)));
    }
    const sleeveH = part.sleeveUv.front.h;
    const sleeveShade = partPose.shadeScale ?? 1;
    for (let i = 0; i < BEND_BANDS; i += 1) {
      const row = Math.min(sleeveH - 1, Math.floor((i * sleeveH) / BEND_BANDS));
      const band = limbBandFaces(rings[i], rings[i + 1]);
      for (const faceName of ["front", "back", "nx", "px"]) {
        const painted = paint(
          part.sleeveId,
          faceName,
          uvRow(part.sleeveUv[faceName], row),
          band[faceName],
          sleeveShade,
          0,
          tol,
          true,
        );
        sleeveDepths.push(painted.depth);
        if (painted.face) sleeveFaces.push(painted.face);
      }
    }
    parts.push(
      collectPart(
        part.sleeveId,
        SLEEVE_LABELS[part.sleeveId] ?? part.sleeveId,
        part.id,
        apply(viewMatrix, toWorld(part, part.joint, true)),
        sleeveFaces,
        sleeveDepths,
      ),
    );
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
export function faceColorPaths(face, corners) {
  const byColor = new Map();
  for (const run of face.runs) {
    if (run.hex === face.base) continue;
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
      // Base quad first: it fills the face and hides hairlines between texels
      // and between lofted limb bands.
      out.push(
        `${indent}    <path fill="${face.base}" stroke="${face.base}" stroke-width=".6" stroke-linejoin="round" d="${quadPath(corners)}"/>`,
      );
      for (const [hex, quads] of faceColorPaths(face, corners))
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
      items.push(
        lottieGroup(`${part.id}/${face.faceName}`, [
          { ty: "sh", nm: "base", ks: { a: 0, k: lottieQuad(corners) } },
          lottieFill(face.base),
          lottieStroke(face.base),
        ]),
      );
      for (const [hex, quads] of faceColorPaths(face, corners)) {
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
