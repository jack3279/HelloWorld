// Generates assets/steve.svg: a flat-shaded vector render of the Minecraft
// player model in a running pose, textured from the official Steve skin.
//
// The model is built from real cuboids (head, torso, two arms, two legs), posed
// with per-limb rotations, projected orthographically and drawn back-to-front.
// Every visible face is painted texel by texel from the skin, so the facial
// features (hair fringe, brow shading, white/violet eyes, mustache and beard)
// land exactly where the model puts them.
//
// Usage:
//   node scripts/generate-steve-svg.mjs [--skin=<png>] [--out=<svg>]
//
// Without --skin the official 64x64 template is downloaded once and cached in
// node_modules/.cache/, so the script stays offline-friendly after the first run.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKIN_URL = "https://assets.mojang.com/SkinTemplates/steve.png";
const CACHE = resolve(__dirname, "../node_modules/.cache/steve-skin.png");

// ---------------------------------------------------------------- pose / look

const CANVAS = { w: 512, h: 560, pad: 14 };

// Angles in degrees. Negative limb pitch swings forward, positive swings back.
const POSE = {
  bodyYaw: -34, // turn the torso so the face reads three-quarter
  camPitch: 19, // camera above the figure, so top faces catch the light
  roll: 8, // screen-space lean into the run
  head: { yaw: 16, pitch: -2, roll: -6 },
  torso: { yaw: 0, pitch: -4, roll: 0 },
  armRight: { yaw: -6, pitch: -104, roll: 7 },
  armLeft: { yaw: 4, pitch: 38, roll: -13 },
  legRight: { yaw: 0, pitch: -38, roll: 4 },
  legLeft: { yaw: 0, pitch: 27, roll: -4 },
};

// Light direction in world space: high, from the front left. The skin already
// bakes brighter tops and darker sides, so this pass stays deliberately gentle.
const LIGHT = norm([-0.45, 0.78, 0.44]);
const SHADE = {
  ambient: 0.7,
  diffuse: 0.3,
  sky: 0.08, // extra lift for up-facing faces, matching the flat-art reference
  fill: 0.18, // camera-facing fill, so turned-away materials keep their identity
  highlight: "#fff6e2",
  shadowTint: "#24427e",
};

// Colors inside one face that are closer than this (per channel) collapse into
// a single flat color. The head keeps a tight tolerance so brows, eyes,
// mustache and beard survive; the rest of the body is flattened harder to kill
// the skin's dither noise.
const QUANTIZE_TOLERANCE = { head: 12, body: 30 };

// ---------------------------------------------------------------- png decoding

function decodePng(buf) {
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

async function loadSkin(explicitPath) {
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

function norm(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}

const rad = (deg) => (deg * Math.PI) / 180;

function rotX(deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

function rotY(deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}

function rotZ(deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

function matMul(a, b) {
  const out = new Array(9).fill(0);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      for (let k = 0; k < 3; k++) out[r * 3 + c] += a[r * 3 + k] * b[k * 3 + c];
  return out;
}

function apply(m, v) {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

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

// Lifts the near-black skin tones (hair, beard) into readable browns and firms
// up saturation, turning the game texture into flat vector-art colors.
function grade([r, g, b]) {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (s < 0.06) {
    // Greys are the shoes; the reference art renders them near-black.
    return l < 0.7 ? hslToRgb(h, s, l * 0.55) : [r, g, b];
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

const rgbToHex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");

function luminanceFor(worldNormal, cameraNormal) {
  const dot =
    worldNormal[0] * LIGHT[0] + worldNormal[1] * LIGHT[1] + worldNormal[2] * LIGHT[2];
  const sky = Math.max(0, worldNormal[1]) ** 1.5;
  return (
    SHADE.ambient +
    SHADE.diffuse * Math.max(0, dot) +
    SHADE.sky * sky +
    SHADE.fill * Math.max(0, cameraNormal[2])
  );
}

function shade(rgb, lum) {
  if (lum > 1) return mix(rgb, hexToRgb(SHADE.highlight), Math.min(0.45, (lum - 1) * 1.25));
  const dimmed = rgb.map((v) => v * lum ** 0.85);
  return mix(dimmed, hexToRgb(SHADE.shadowTint), (1 - lum) * 0.35);
}

// ----------------------------------------------------------------- model layout

// Classic 64x64 skin layout. Each face is [u, v, w, h] in texture pixels.
const uv = (x, y, w, h) => ({ x, y, w, h });
const boxUv = (ox, oy, w, h, d) => ({
  nx: uv(ox, oy + d, d, h),
  front: uv(ox + d, oy + d, w, h),
  px: uv(ox + d + w, oy + d, d, h),
  back: uv(ox + d + w + d, oy + d, w, h),
  top: uv(ox + d, oy, w, d),
  bottom: uv(ox + d + w, oy, w, d),
});

// Body space: +x is the character's left, +y up, +z forward (toward the camera
// at rest), origin between the feet.
const PARTS = [
  {
    id: "leg-right",
    label: "Right leg",
    min: [-4, 0, -2],
    max: [0, 12, 2],
    pivot: [-2, 12, 0],
    uv: boxUv(0, 16, 4, 12, 4),
    rot: POSE.legRight,
  },
  {
    id: "leg-left",
    label: "Left leg",
    min: [0, 0, -2],
    max: [4, 12, 2],
    pivot: [2, 12, 0],
    uv: boxUv(16, 48, 4, 12, 4),
    rot: POSE.legLeft,
  },
  {
    id: "torso",
    label: "Torso",
    min: [-4, 12, -2],
    max: [4, 24, 2],
    pivot: [0, 12, 0],
    uv: boxUv(16, 16, 8, 12, 4),
    rot: POSE.torso,
  },
  {
    id: "arm-right",
    label: "Right arm",
    min: [-8, 12, -2],
    max: [-4, 24, 2],
    pivot: [-4, 22, 0],
    uv: boxUv(40, 16, 4, 12, 4),
    rot: POSE.armRight,
  },
  {
    id: "arm-left",
    label: "Left arm",
    min: [4, 12, -2],
    max: [8, 24, 2],
    pivot: [4, 22, 0],
    uv: boxUv(32, 48, 4, 12, 4),
    rot: POSE.armLeft,
  },
  {
    id: "head",
    label: "Head",
    min: [-4, 24, -4],
    max: [4, 32, 4],
    pivot: [0, 24, 0],
    uv: boxUv(0, 0, 8, 8, 8),
    rot: POSE.head,
  },
];

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
  return { lookup, centers };
}

// --------------------------------------------------------------------- pipeline

function poseMatrices(rot) {
  const local = matMul(rotY(rot.yaw ?? 0), matMul(rotZ(rot.roll ?? 0), rotX(rot.pitch ?? 0)));
  const world = matMul(rotY(POSE.bodyYaw), local);
  const camera = matMul(rotX(POSE.camPitch), world);
  return { world, camera };
}

function buildFaces(skin) {
  const camRot = rotX(POSE.camPitch);
  const bodyRot = rotY(POSE.bodyYaw);
  const parts = [];
  const palette = new Set();

  for (const part of PARTS) {
    const tolerance = part.id === "head" ? QUANTIZE_TOLERANCE.head : QUANTIZE_TOLERANCE.body;
    const { world, camera } = poseMatrices(part.rot);
    const toCamera = (p) => {
      const local = [p[0] - part.pivot[0], p[1] - part.pivot[1], p[2] - part.pivot[2]];
      const posed = apply(camera, local);
      const pivotCam = apply(camRot, apply(bodyRot, part.pivot));
      return [posed[0] + pivotCam[0], posed[1] + pivotCam[1], posed[2] + pivotCam[2]];
    };

    const faces = [];
    let partDepth = 0;
    let partSamples = 0;

    for (const [faceName, rect] of Object.entries(part.uv)) {
      const { normal, quad } = faceCorners(part.min, part.max, faceName);
      const camNormal = apply(camera, normal);
      const worldNormal = norm(apply(world, normal));
      const points = quad.map(toCamera);
      const depth = points.reduce((sum, p) => sum + p[2], 0) / 4;
      partDepth += depth;
      partSamples += 1;
      if (camNormal[2] <= 0.0015) continue; // back-facing

      const lum = luminanceFor(worldNormal, norm(camNormal));
      const { lookup } = flattenRegion(skin, rect, tolerance);
      const texels = [];
      const counts = new Map();
      for (let ty = 0; ty < rect.h; ty++) {
        let run = null;
        for (let tx = 0; tx <= rect.w; tx++) {
          let hex = null;
          if (tx < rect.w) {
            const i = ((rect.y + ty) * skin.width + rect.x + tx) * 4;
            if (skin.rgba[i + 3] !== 0) {
              const key = (skin.rgba[i] << 16) | (skin.rgba[i + 1] << 8) | skin.rgba[i + 2];
              hex = rgbToHex(shade(grade(lookup.get(key)), lum));
              palette.add(hex);
            }
          }
          if (run && run.hex === hex) {
            run.x1 = tx + 1;
            continue;
          }
          if (run) {
            texels.push(run);
            counts.set(run.hex, (counts.get(run.hex) ?? 0) + (run.x1 - run.x0));
          }
          run = hex ? { hex, y: ty, x0: tx, x1: tx + 1 } : null;
        }
      }
      const base = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
      faces.push({ faceName, points, depth, rect, texels, base, lum });
    }

    parts.push({ ...part, faces, depth: partDepth / Math.max(1, partSamples) });
  }

  parts.sort((a, b) => a.depth - b.depth);
  for (const part of parts) part.faces.sort((a, b) => a.depth - b.depth);
  return { parts, palette };
}

function projector(parts) {
  const roll = rad(POSE.roll);
  const cos = Math.cos(roll);
  const sin = Math.sin(roll);
  const raw = (p) => {
    const x = p[0];
    const y = -p[1];
    return [x * cos - y * sin, x * sin + y * cos];
  };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const part of parts)
    for (const face of part.faces)
      for (const p of face.points) {
        const [x, y] = raw(p);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }

  const scale = Math.min(
    (CANVAS.w - CANVAS.pad * 2) / (maxX - minX),
    (CANVAS.h - CANVAS.pad * 2) / (maxY - minY),
  );
  const offX = (CANVAS.w - (maxX - minX) * scale) / 2 - minX * scale;
  const offY = (CANVAS.h - (maxY - minY) * scale) / 2 - minY * scale;
  return (p) => {
    const [x, y] = raw(p);
    return [x * scale + offX, y * scale + offY];
  };
}

// -------------------------------------------------------------------- svg emit

const fmt = (n) => (Math.round(n * 100) / 100).toString();

function quadPath(pts) {
  return `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L")}Z`;
}

// A texel run is a sub-quad of the face; the projection is affine, so bilinear
// interpolation between the four projected corners is exact.
function texelQuad(corners, rect, run) {
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const at = (u, v) => lerp(lerp(corners[0], corners[1], u), lerp(corners[3], corners[2], u), v);
  const u0 = run.x0 / rect.w;
  const u1 = run.x1 / rect.w;
  const v0 = run.y / rect.h;
  const v1 = (run.y + 1) / rect.h;
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
}

function renderSvg(parts) {
  const project = projector(parts);
  const body = [];

  for (const part of parts) {
    if (!part.faces.length) continue;
    body.push(`    <g id="${part.id}" aria-label="${part.label}">`);
    for (const face of part.faces) {
      const corners = face.points.map(project);
      const byColor = new Map();
      for (const run of face.texels) {
        if (run.hex === face.base) continue;
        const list = byColor.get(run.hex) ?? [];
        list.push(quadPath(texelQuad(corners, face.rect, run)));
        byColor.set(run.hex, list);
      }
      body.push(`      <g class="face" data-face="${face.faceName}">`);
      // Base quad first: it fills the face and hides hairlines between texels.
      body.push(`        <path fill="${face.base}" d="${quadPath(corners)}"/>`);
      for (const [hex, paths] of byColor)
        body.push(
          `        <path fill="${hex}" stroke="${hex}" stroke-width=".6" stroke-linejoin="round" d="${paths.join("")}"/>`,
        );
      body.push("      </g>");
    }
    body.push("    </g>");
  }

  return `<!-- Generated by scripts/generate-steve-svg.mjs — edit the pose there, not here. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS.w} ${CANVAS.h}" width="${CANVAS.w}" height="${CANVAS.h}" role="img" aria-labelledby="steve-title steve-desc">
  <title id="steve-title">Steve, mid-stride</title>
  <desc id="steve-desc">Voxel character running with one arm thrust forward, drawn face by face from the classic player skin.</desc>
  <g id="steve">
${body.join("\n")}
  </g>
</svg>
`;
}

// -------------------------------------------------------------------------- run

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v = "true"] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);

const skin = await loadSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 64) throw new Error("expected a 64x64 skin");
const { parts, palette } = buildFaces(skin);
const svg = renderSvg(parts);
const out = resolve(__dirname, "..", args.get("out") ?? "assets/steve.svg");
await mkdir(dirname(out), { recursive: true });
await writeFile(out, svg);
console.log(
  `Wrote ${out} (${(svg.length / 1024).toFixed(1)} kB, ${palette.size} flat colors, ` +
    `${parts.reduce((n, p) => n + p.faces.length, 0)} visible faces)`,
);
