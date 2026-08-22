// Tiny RGBA canvas helpers for the original CC0 pixel pack.
// Every texel is authored here or in the sibling cc0-* painters — no Mojang
// bitmaps are sampled.

export function hexToRgb(hex) {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, "0")).join("")}`;
}

export function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function hash2(x, y, seed = 1) {
  let h = seed >>> 0;
  h = Math.imul(h ^ Math.imul(x + 1, 374761393), 668265263);
  h = Math.imul(h ^ Math.imul(y + 1, 668265263), 374761393);
  h ^= h >>> 13;
  return (Math.imul(h, 1274126177) >>> 0) / 4294967296;
}

export function canvas(width, height, fill = null) {
  const rgba = new Uint8Array(width * height * 4);
  if (fill) {
    const [r, g, b, a = 255] = typeof fill === "string" ? [...hexToRgb(fill), 255] : fill;
    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = a;
    }
  }
  return { width, height, rgba };
}

export function setPx(img, x, y, hex, a = 255) {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
  const i = (y * img.width + x) * 4;
  if (!hex) {
    img.rgba[i] = 0;
    img.rgba[i + 1] = 0;
    img.rgba[i + 2] = 0;
    img.rgba[i + 3] = 0;
    return;
  }
  const rgb = typeof hex === "string" ? hexToRgb(hex) : hex;
  img.rgba[i] = rgb[0];
  img.rgba[i + 1] = rgb[1];
  img.rgba[i + 2] = rgb[2];
  img.rgba[i + 3] = a;
}

export function getPx(img, x, y) {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return [0, 0, 0, 0];
  const i = (y * img.width + x) * 4;
  return [img.rgba[i], img.rgba[i + 1], img.rgba[i + 2], img.rgba[i + 3]];
}

export function fillRect(img, x, y, w, h, hex, a = 255) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) setPx(img, x + xx, y + yy, hex, a);
}

export function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function shade(hex, delta) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r + delta, g + delta, b + delta]);
}

export function noiseFill(img, hex, amount = 14, seed = 1, { x = 0, y = 0, w = img.width, h = img.height } = {}) {
  const base = hexToRgb(hex);
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      const n = (hash2(x + xx, y + yy, seed) - 0.5) * 2 * amount;
      setPx(img, x + xx, y + yy, [base[0] + n, base[1] + n, base[2] + n]);
    }
  }
}

export function stamp(img, art, palette, ox = 0, oy = 0) {
  const rows = art.trim().split("\n").map((row) => row.trimEnd());
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "." || ch === " ") continue;
      const hex = palette[ch];
      if (!hex) continue;
      setPx(img, ox + x, oy + y, hex);
    }
  }
}

export function blob(img, cx, cy, rx, ry, hex, a = 255) {
  for (let y = cy - ry; y <= cy + ry; y++) {
    for (let x = cx - rx; x <= cx + rx; x++) {
      const u = (x - cx) / rx;
      const v = (y - cy) / ry;
      if (u * u + v * v <= 1) setPx(img, x, y, hex, a);
    }
  }
}

export function tile16(fillHex) {
  const img = canvas(16, 16);
  if (fillHex) fillRect(img, 0, 0, 16, 16, fillHex);
  return img;
}

export function stripFrames(frameCount, tile = 16, paint) {
  const img = canvas(tile, tile * frameCount);
  for (let f = 0; f < frameCount; f++) {
    const frame = canvas(tile, tile);
    paint(frame, f);
    for (let y = 0; y < tile; y++) {
      for (let x = 0; x < tile; x++) {
        const [r, g, b, a] = getPx(frame, x, y);
        const i = ((f * tile + y) * tile + x) * 4;
        img.rgba[i] = r;
        img.rgba[i + 1] = g;
        img.rgba[i + 2] = b;
        img.rgba[i + 3] = a;
      }
    }
  }
  return img;
}
