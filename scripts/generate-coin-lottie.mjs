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
// the extra body width reads as a thick crescent, and at 90°/270° only the
// solid edge remains. Darker back face + a star stamp make the far side obvious.
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

const GOLD_HI = [0.96, 0.82, 0.32, 1];
const GOLD = [0.86, 0.64, 0.15, 1];
const GOLD_MID = [0.72, 0.5, 0.1, 1];
const GOLD_DK = [0.43, 0.29, 0.04, 1];
const WELL_DK = [0.18, 0.1, 0, 1];
const WELL_MD = [0.48, 0.29, 0.03, 1];
const WELL_HI = [0.95, 0.78, 0.31, 1];
const BACK_FACE = [0.55, 0.38, 0.07, 1];
const BACK_WELL = [0.28, 0.17, 0.02, 1];
const SHEEN = [1, 0.96, 0.78, 1];
const STAR = [0.98, 0.86, 0.42, 1];

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

function roundRect(size, radius, pos = [0, 0]) {
  return { ty: "rc", d: 1, p: staticK(pos), s: size, r: radius };
}

function fill(color, opacity = 100, sid) {
  const c = { a: 0, k: color };
  if (sid) c.sid = sid;
  return { ty: "fl", o: staticK(opacity), r: 1, c };
}

function stroke(color, width, opacity = 100) {
  return { ty: "st", lc: 2, lj: 2, ml: 4, o: staticK(opacity), w: staticK(width), c: staticK(color) };
}

function gradFill(stops, y0, y1) {
  const k = [];
  const n = stops.length;
  for (let i = 0; i < n; i++) {
    const [t, r, g, b] = stops[i];
    k.push(t, r, g, b);
  }
  for (let i = 0; i < n; i++) k.push(stops[i][0], 1);
  return {
    ty: "gf",
    t: 1,
    s: staticK([0, y0]),
    e: staticK([0, y1]),
    h: staticK(0),
    a: staticK(0),
    g: { p: n, k: { a: 0, k } },
    o: staticK(100),
  };
}

function group(name, items, xf) {
  return { ty: "gr", nm: name, it: [...items, tr(xf)] };
}

function starPath(or = 30, ir = 13, n = 5, rot = -Math.PI / 2) {
  const v = [];
  for (let k = 0; k < n * 2; k++) {
    const rad = k % 2 === 0 ? or : ir;
    const a = rot + (k * Math.PI) / n;
    v.push([rad * Math.cos(a), rad * Math.sin(a)]);
  }
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
  const faceFade = clamp((ac - 0.16) / 0.18, 0, 1) * 100;
  return {
    th,
    c,
    s,
    ac,
    as,
    faceSx,
    bodySx,
    bodyW,
    bodyR: Math.min(bodyW, 2 * R) / 2,
    frontX,
    backX,
    frontO: c >= 0 ? faceFade : 0,
    backO: c < 0 ? faceFade : 0,
    sheenO: c >= 0 ? 24 * ac * (0.4 + 0.6 * Math.max(0, Math.sin(th * 2 + 0.5))) : 0,
    sheenX: frontX - 16 * ac,
  };
}

function sampleSpin() {
  const faceS = [];
  const bodySize = [];
  const bodyRad = [];
  const frontP = [];
  const backP = [];
  const frontO = [];
  const backO = [];
  const sheenO = [];
  const sheenP = [];

  for (let f = 0; f <= OP; f++) {
    const p = poseAt(f);
    faceS.push({ t: f, s: [p.faceSx, 100, 100] });
    bodySize.push({ t: f, s: [p.bodyW, 2 * R] });
    bodyRad.push({ t: f, s: [p.bodyR] });
    frontP.push({ t: f, s: [p.frontX, CY, 0] });
    backP.push({ t: f, s: [p.backX, CY, 0] });
    frontO.push({ t: f, s: [p.frontO] });
    backO.push({ t: f, s: [p.backO] });
    sheenO.push({ t: f, s: [p.sheenO] });
    sheenP.push({ t: f, s: [p.sheenX, CY - 16, 0] });
  }

  return { faceS, bodySize, bodyRad, frontP, backP, frontO, backO, sheenO, sheenP };
}

const spin = sampleSpin();

const frontShapes = [
  group("front-star", [starPath(30, 13), fill(STAR), stroke(GOLD_DK, 1.5)]),
  group("front-well", [
    ellipse([118, 118]),
    gradFill(
      [
        [0, WELL_DK[0], WELL_DK[1], WELL_DK[2]],
        [0.42, WELL_MD[0], WELL_MD[1], WELL_MD[2]],
        [1, WELL_HI[0], WELL_HI[1], WELL_HI[2]],
      ],
      -56,
      56,
    ),
    stroke(GOLD_DK, 3),
  ]),
  group("front-ring", [
    ellipse([164, 164]),
    fill(GOLD, 100, "goldColor"),
    stroke(GOLD_DK, 5),
  ]),
  group("front-disc", [ellipse([200, 200]), fill(GOLD_MID, 100, "goldMid")]),
];

const backShapes = [
  group("back-dot", [ellipse([22, 22]), fill(GOLD_DK)]),
  group("back-well", [ellipse([110, 110]), fill(BACK_WELL), stroke(GOLD_DK, 2)]),
  group("back-ring", [ellipse([160, 160]), fill(BACK_FACE), stroke(GOLD_DK, 4)]),
  group("back-disc", [ellipse([200, 200]), fill(GOLD_DK)]),
];

const rimShapes = [
  {
    ty: "gr",
    nm: "rim-body",
    it: [
      roundRect(anim(spin.bodySize), anim(spin.bodyRad)),
      gradFill(
        [
          [0, GOLD_HI[0], GOLD_HI[1], GOLD_HI[2]],
          [0.38, GOLD[0], GOLD[1], GOLD[2]],
          [1, GOLD_DK[0], GOLD_DK[1], GOLD_DK[2]],
        ],
        -100,
        100,
      ),
      tr(),
    ],
  },
  group("rim-spec", [ellipse([10, 150]), fill(GOLD_HI, 100)], { p: [0, -12], o: 42 }),
];

const sheenShapes = [
  group("sheen", [ellipse([36, 150]), fill(SHEEN, 100)]),
];

const layers = [
  layer({
    ind: 1,
    name: "Sheen",
    shapes: sheenShapes,
    p: anim(spin.sheenP),
    s: anim(spin.faceS),
    o: anim(spin.sheenO),
  }),
  layer({
    ind: 2,
    name: "Front face",
    shapes: frontShapes,
    p: anim(spin.frontP),
    s: anim(spin.faceS),
    o: anim(spin.frontO),
  }),
  layer({
    ind: 3,
    name: "Back face",
    shapes: backShapes,
    p: anim(spin.backP),
    s: anim(spin.faceS),
    o: anim(spin.backO),
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
