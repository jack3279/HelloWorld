// Builds a standing gold coin that spins a full turn around its vertical axis.
//
// The source file only squashed scale-X 100→0→100 twice. At 0 the disc vanished,
// both "faces" were identical, and the rim flashed for a few frames — so it read
// as a 2D squash, not a 360° flip. This version keeps a thick rim, swaps a
// darker back face at 90°/270°, and uses constant angular speed so the loop
// closes on the same pose it started.
//
//   public/projects/coin/scene-1/lottie.json
//
// Usage: node scripts/generate-coin-lottie.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const W = 400;
const H = 400;
const CX = 200;
const CY = 200;
const FR = 60;
const OP = 90; // 1.5s, one revolution; op is exclusive
const R = 100;
const THICK = 16;

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

function group(name, items) {
  return { ty: "gr", nm: name, it: [...items, tr()] };
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

function sampleSpin() {
  const faceSx = [];
  const faceSy = [];
  const facePx = [];
  const rimSx = [];
  const rimPx = [];
  const frontO = [];
  const backO = [];
  const slabO = [];
  const sheenO = [];
  const sheenPx = [];

  for (let f = 0; f <= OP; f++) {
    const th = (f / OP) * Math.PI * 2;
    const c = Math.cos(th);
    const s = Math.sin(th);
    const ac = Math.abs(c);
    const front = c >= 0;
    const minFace = 4;
    const minRim = (THICK / (2 * R)) * 100;
    const sx = Math.max(ac * 100, minFace);
    const persp = 100 + 3 * (1 - ac);

    faceSx.push({ t: f, s: [sx] });
    faceSy.push({ t: f, s: [persp] });
    facePx.push({ t: f, s: [CX + s * THICK * 0.18, CY, 0] });
    rimSx.push({ t: f, s: [Math.max(ac * 100, minRim)] });
    rimPx.push({ t: f, s: [CX + s * THICK * 0.62, CY, 0] });

    const faceFade = Math.min(100, Math.max(0, (ac - 0.06) / 0.22) * 100);
    frontO.push({ t: f, s: [front ? faceFade : 0] });
    backO.push({ t: f, s: [front ? 0 : faceFade] });
    slabO.push({ t: f, s: [Math.min(100, (1 - ac) * 130)] });
    sheenO.push({ t: f, s: [28 * ac * (0.45 + 0.55 * Math.max(0, Math.sin(th * 2 + 0.6)))] });
    sheenPx.push({ t: f, s: [CX + s * THICK * 0.18 - 18 * ac, CY - 12, 0] });
  }

  const pack2 = (xs, ys) =>
    xs.map((x, i) => ({ t: x.t, s: [x.s[0], ys[i].s[0], 100] }));

  return {
    faceS: pack2(faceSx, faceSy),
    faceP: facePx,
    rimS: pack2(rimSx, faceSy),
    rimP: rimPx,
    frontO,
    backO,
    slabO,
    sheenO,
    sheenP: sheenPx,
  };
}

const spin = sampleSpin();

const frontShapes = [
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
  group("back-well", [ellipse([110, 110]), fill(BACK_WELL), stroke(GOLD_DK, 2)]),
  group("back-ring", [ellipse([160, 160]), fill(BACK_FACE), stroke(GOLD_DK, 4)]),
  group("back-disc", [ellipse([200, 200]), fill(GOLD_DK)]),
];

const rimShapes = [
  group("rim-body", [
    ellipse([200, 200]),
    gradFill(
      [
        [0, GOLD_HI[0], GOLD_HI[1], GOLD_HI[2]],
        [0.45, GOLD_MID[0], GOLD_MID[1], GOLD_MID[2]],
        [1, GOLD_DK[0], GOLD_DK[1], GOLD_DK[2]],
      ],
      -100,
      100,
    ),
  ]),
];

const slabShapes = [
  group("edge-slab", [
    ellipse([THICK + 4, 200]),
    gradFill(
      [
        [0, GOLD_HI[0], GOLD_HI[1], GOLD_HI[2]],
        [0.5, GOLD[0], GOLD[1], GOLD[2]],
        [1, GOLD_DK[0], GOLD_DK[1], GOLD_DK[2]],
      ],
      -100,
      100,
    ),
  ]),
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
    p: anim(spin.faceP),
    s: anim(spin.faceS),
    o: anim(spin.frontO),
  }),
  layer({
    ind: 3,
    name: "Back face",
    shapes: backShapes,
    p: anim(spin.faceP),
    s: anim(spin.faceS),
    o: anim(spin.backO),
  }),
  layer({
    ind: 4,
    name: "Edge slab",
    shapes: slabShapes,
    p: staticK([CX, CY, 0]),
    s: staticK([100, 100, 100]),
    o: anim(spin.slabO),
  }),
  layer({
    ind: 5,
    name: "Rim",
    shapes: rimShapes,
    p: anim(spin.rimP),
    s: anim(spin.rimS),
    o: staticK(100),
  }),
];

const lottie = {
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
