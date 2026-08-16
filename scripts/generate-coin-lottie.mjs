// Gold coin spinning a full turn around its vertical axis.
//
// The uploaded source only squashed scale-X 100→0→100 twice. At 0 the disc
// vanished, both faces were identical, and the rim flashed — a 2D squash, not
// a 360° flip. This version projects a cylinder:
//
//   face width  = 2R |cos θ|
//   body width  = 2R |cos θ| + T |sin θ|
//   front x     = + (T/2) sin θ     (visible when cos θ ≥ 0)
//   back x      = − (T/2) sin θ     (visible when cos θ < 0)
//
// The body is always the silhouette. The visible face sits on the near rim so
// the extra body width reads as a thick crescent. At 90°/270° the silhouette
// tightens from a stadium into a rounded rectangle (small fixed corner, not a
// capsule). Front and back stay equally bright — ambient light is flat and
// does not travel with the spin. A star vs rings tells the sides apart.
// Constant angular speed; last key matches frame 0 so the loop is seamless.
//
//   public/projects/coin/scene-1/lottie.json
//
// Usage: node scripts/generate-coin-lottie.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const W = 400;
export const H = 400;
export const CX = 200;
export const CY = 200;
export const FR = 60;
export const OP = 90; // 1.5s, one revolution; op is exclusive
export const R = 100;
export const T = 56;
export const EDGE_R = 12;
export const EDGE_WINDOW = 0.22;

export const GOLD = [0.93, 0.76, 0.28, 1];
export const GOLD_MID = [0.88, 0.70, 0.22, 1];
export const GOLD_LINE = [0.80, 0.60, 0.16, 1];
export const WELL = [0.84, 0.64, 0.18, 1];
export const STAR = [0.97, 0.86, 0.42, 1];
export const BACK = [0.90, 0.73, 0.24, 1];
export const BACK_WELL = [0.82, 0.62, 0.18, 1];
export const BACK_DOT = [0.86, 0.68, 0.20, 1];

const staticK = (k) => ({ a: 0, k });

function linearKeys(samples) {
  return samples.map((sample, i) => {
    const key = { t: sample.t, s: sample.s };
    if (i < samples.length - 1) key.o = { x: [0], y: [0] };
    if (i > 0) key.i = { x: [1], y: [1] };
    return key;
  });
}

function anim(samples) {
  return { a: 1, k: linearKeys(samples) };
}

function tr({ p = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) {
  return {
    ty: "tr",
    p: staticK(p),
    a: staticK([0, 0]),
    s: staticK(s),
    r: staticK(r),
    o: staticK(o),
    sk: staticK(0),
    sa: staticK(0),
  };
}

function ellipse(size, pos = [0, 0]) {
  return { ty: "el", d: 1, p: staticK(pos), s: staticK(size) };
}

function fill(color, opacity = 100, sid) {
  const c = { a: 0, k: color };
  if (sid) c.sid = sid;
  return { ty: "fl", o: staticK(opacity), r: 1, c };
}

function stroke(color, width, opacity = 100) {
  return { ty: "st", lc: 2, lj: 2, ml: 4, o: staticK(opacity), w: staticK(width), c: staticK(color) };
}

function group(name, items, xf) {
  return { ty: "gr", nm: name, it: [...items, tr(xf)] };
}

export function starVertices(or = 30, ir = 13, n = 5, rot = -Math.PI / 2) {
  const v = [];
  for (let k = 0; k < n * 2; k++) {
    const rad = k % 2 === 0 ? or : ir;
    const a = rot + (k * Math.PI) / n;
    v.push([rad * Math.cos(a), rad * Math.sin(a)]);
  }
  return v;
}

function starPath(or = 30, ir = 13, n = 5, rot = -Math.PI / 2) {
  const v = starVertices(or, ir, n, rot);
  return {
    ty: "sh",
    ks: {
      a: 0,
      k: {
        c: true,
        v,
        i: v.map(() => [0, 0]),
        o: v.map(() => [0, 0]),
      },
    },
  };
}

function layer({ ind, name, shapes, p, s, o }) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ip: 0,
    op: OP,
    st: 0,
    ks: {
      a: staticK([0, 0, 0]),
      p,
      s,
      r: staticK(0),
      o,
    },
    ao: 0,
    shapes,
    bm: 0,
  };
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

export function cornerRadius(bodyW, ac) {
  const stadium = Math.min(bodyW, 2 * R) / 2;
  const t = clamp(ac / EDGE_WINDOW, 0, 1);
  return EDGE_R + (stadium - EDGE_R) * t;
}

export function poseAt(f) {
  const th = (f / OP) * Math.PI * 2;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const ac = Math.abs(c);
  const as = Math.abs(s);
  const faceSx = ac * 100;
  const bodyW = 2 * R * ac + T * as;
  const bodySx = (bodyW / (2 * R)) * 100;
  const frontX = CX + (T / 2) * s;
  const backX = CX - (T / 2) * s;
  const faceFade = clamp((ac - 0.08) / 0.07, 0, 1) * 100;
  return {
    th,
    c,
    s,
    ac,
    as,
    faceSx,
    bodySx,
    bodyW,
    bodyR: cornerRadius(bodyW, ac),
    frontX,
    backX,
    frontO: c >= 0 ? faceFade : 0,
    backO: c < 0 ? faceFade : 0,
    edgeO: clamp((EDGE_WINDOW - ac) / 0.12, 0, 1) * 100,
  };
}

function sampleSpin() {
  const faceS = [];
  const bodySize = [];
  const frontP = [];
  const backP = [];
  const frontO = [];
  const backO = [];
  const edgeO = [];
  const edgeSize = [];
  const rimRad = [];

  for (let f = 0; f <= OP; f++) {
    const p = poseAt(f);
    faceS.push({ t: f, s: [p.faceSx, 100, 100] });
    bodySize.push({ t: f, s: [p.bodyW, 2 * R] });
    frontP.push({ t: f, s: [p.frontX, CY, 0] });
    backP.push({ t: f, s: [p.backX, CY, 0] });
    frontO.push({ t: f, s: [p.frontO] });
    backO.push({ t: f, s: [p.backO] });
    edgeO.push({ t: f, s: [p.edgeO] });
    edgeSize.push({ t: f, s: [Math.max(p.bodyW, T * 0.85), 2 * R] });
    rimRad.push({ t: f, s: [p.bodyR] });
  }

  return { faceS, bodySize, frontP, backP, frontO, backO, edgeO, edgeSize, rimRad };
}

const spin = sampleSpin();

const frontShapes = [
  group("front-star", [starPath(30, 13), fill(STAR), stroke(GOLD_LINE, 1.5)]),
  group("front-well", [ellipse([118, 118]), fill(WELL), stroke(GOLD_LINE, 3)]),
  group("front-ring", [ellipse([164, 164]), fill(GOLD, 100, "goldColor"), stroke(GOLD_LINE, 5)]),
  group("front-disc", [ellipse([200, 200]), fill(GOLD_MID, 100, "goldMid")]),
];

const backShapes = [
  group("back-dot", [ellipse([22, 22]), fill(BACK_DOT)]),
  group("back-well", [ellipse([110, 110]), fill(BACK_WELL), stroke(GOLD_LINE, 2)]),
  group("back-ring", [ellipse([160, 160]), fill(BACK), stroke(GOLD_LINE, 4)]),
  group("back-disc", [ellipse([200, 200]), fill(GOLD_MID)]),
];

const rimShapes = [
  {
    ty: "gr",
    nm: "rim-body",
    it: [
      { ty: "rc", d: 1, p: staticK([0, 0]), s: anim(spin.bodySize), r: anim(spin.rimRad) },
      fill(GOLD_MID, 100, "goldMid"),
      stroke(GOLD_LINE, 1.6),
      tr(),
    ],
  },
];

const edgeShapes = [
  {
    ty: "gr",
    nm: "edge-plate",
    it: [
      { ty: "rc", d: 1, p: staticK([0, 0]), s: anim(spin.edgeSize), r: staticK(EDGE_R) },
      fill(GOLD_MID),
      stroke(GOLD_LINE, 1.2),
      tr(),
    ],
  },
];

const layers = [
  layer({
    ind: 1,
    name: "Front face",
    shapes: frontShapes,
    p: anim(spin.frontP),
    s: anim(spin.faceS),
    o: anim(spin.frontO),
  }),
  layer({
    ind: 2,
    name: "Back face",
    shapes: backShapes,
    p: anim(spin.backP),
    s: anim(spin.faceS),
    o: anim(spin.backO),
  }),
  layer({
    ind: 3,
    name: "Edge",
    shapes: edgeShapes,
    p: staticK([CX, CY, 0]),
    s: staticK([100, 100, 100]),
    o: anim(spin.edgeO),
  }),
  layer({
    ind: 4,
    name: "Rim",
    shapes: rimShapes,
    p: staticK([CX, CY, 0]),
    s: staticK([100, 100, 100]),
    o: staticK(100),
  }),
];

export const lottie = {
  v: "5.7.0",
  fr: FR,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: "Gold coin — full spin",
  ddd: 0,
  assets: [],
  layers,
  slots: {
    goldColor: { p: { a: 0, k: GOLD } },
    goldMid: { p: { a: 0, k: GOLD_MID } },
  },
};

const isMain = String(process.argv[1] || "").endsWith("generate-coin-lottie.mjs");
if (isMain) {
  const dir = resolve(__dirname, "../public/projects/coin/scene-1");
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie) + "\n");
  await writeFile(
    resolve(dir, "controls.json"),
    JSON.stringify(
      {
        controls: [
          { sid: "goldColor", label: "Gold" },
          { sid: "goldMid", label: "Gold shade" },
        ],
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Wrote ${dir}/lottie.json  ${OP} ticks @ ${FR} fps  ${(JSON.stringify(lottie).length / 1024).toFixed(1)} kB`);
}
