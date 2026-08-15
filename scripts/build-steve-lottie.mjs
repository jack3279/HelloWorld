import { writeFileSync } from "node:fs";

const FR = 60;
const OP = 180;
const W = 512;
const H = 512;
const U = 14;
const DX = 0.46;
const DY = -0.3;

const hex = (h) => {
  const n = h.replace("#", "");
  return [
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255,
    1,
  ];
};

const C = {
  skin: hex("#C68E62"),
  skinLit: hex("#D4A574"),
  skinShadow: hex("#A87248"),
  hair: hex("#3D2817"),
  hairLit: hex("#5C3D26"),
  hairDark: hex("#2A1A10"),
  shirt: hex("#00A3A3"),
  shirtLit: hex("#1BB5B5"),
  shirtDark: hex("#007A7A"),
  vneck: hex("#0A5A72"),
  pants: hex("#3F3FAD"),
  pantsLit: hex("#5555C4"),
  pantsDark: hex("#2C2C86"),
  shoes: hex("#3A3A3A"),
  shoesDark: hex("#2A2A2A"),
  eyeWhite: hex("#F7F4EC"),
  pupil: hex("#1558E0"),
  mouth: hex("#2A1810"),
  beard: hex("#5A2E18"),
  neck: hex("#C68E62"),
  shadow: hex("#1A1410"),
};

const E = {
  travel: { o: [1.0, 0.49], i: [0.0, 0.55] },
  settle: { o: [0.0, 0.65], i: [0.51, 0.99] },
  pop: { o: [0.94, 0.75], i: [0.34, 0.94] },
  sharp: { o: [0.2, 0.75], i: [0.34, 0.94] },
};

const staticProp = (k) => ({ a: 0, k });
const slotColor = (sid, fallback) => ({ a: 0, k: fallback, sid });

function kf(t, s, ease, incoming) {
  const key = { t, s };
  if (ease) key.o = { x: [ease.o[0]], y: [ease.o[1]] };
  if (incoming) key.i = { x: [incoming.i[0]], y: [incoming.i[1]] };
  return key;
}
const anim = (keys) => ({ a: 1, k: keys });

function tr(p = [0, 0]) {
  return {
    ty: "tr",
    p: staticProp(p),
    a: staticProp([0, 0]),
    s: staticProp([100, 100]),
    r: staticProp(0),
    o: staticProp(100),
  };
}

function fill(color, sid) {
  return {
    ty: "fl",
    o: staticProp(100),
    c: sid ? slotColor(sid, color) : staticProp(color),
  };
}

function rect(size, pos = [0, 0], radius = 0) {
  return {
    ty: "rc",
    p: staticProp(pos),
    s: staticProp(size),
    r: staticProp(radius),
  };
}

function path(verts) {
  return {
    ty: "sh",
    ks: {
      a: 0,
      k: {
        c: true,
        v: verts,
        i: verts.map(() => [0, 0]),
        o: verts.map(() => [0, 0]),
      },
    },
  };
}

function group(name, items, pos = [0, 0]) {
  return { ty: "gr", nm: name, it: [...items, tr(pos)] };
}

function layer({ ind, nm, parent, ks, shapes }) {
  const next = {
    ddd: 0,
    ind,
    ty: 4,
    nm,
    sr: 1,
    ks,
    ao: 0,
    shapes,
    ip: 0,
    op: OP,
    st: 0,
    bm: 0,
  };
  if (parent != null) next.parent = parent;
  return next;
}

function ks({ p, r = 0, s = [100, 100, 100], a = [0, 0, 0], o = 100 }) {
  return {
    o: typeof o === "object" ? o : staticProp(o),
    r: typeof r === "object" ? r : staticProp(r),
    p: typeof p === "object" && p.a !== undefined ? p : staticProp(p),
    a: staticProp(a),
    s: typeof s === "object" && s.a !== undefined ? s : staticProp(s),
  };
}

function depthOf(size) {
  return [size * DX, size * DY];
}

function frontPixel(name, col, row, cols, rows, w, h, color, sid) {
  const pw = w / cols;
  const ph = h / rows;
  const x = -w / 2 + pw * (col + 0.5);
  const y = -h / 2 + ph * (row + 0.5);
  return group(name, [rect([pw + 0.2, ph + 0.2]), fill(color, sid)], [x, y]);
}

function sideStrip(name, row, rows, w, h, d, color, sid) {
  const [sx, sy] = depthOf(d);
  const ph = h / rows;
  const y0 = -h / 2 + ph * row;
  const y1 = y0 + ph + 0.2;
  const x = w / 2;
  return group(
    name,
    [
      path([
        [x, y0],
        [x + sx, y0 + sy],
        [x + sx, y1 + sy],
        [x, y1],
      ]),
      fill(color, sid),
    ],
  );
}

function topFace(name, w, h, d, color, sid) {
  const [sx, sy] = depthOf(d);
  return group(name, [
    path([
      [-w / 2, -h / 2],
      [w / 2, -h / 2],
      [w / 2 + sx, -h / 2 + sy],
      [-w / 2 + sx, -h / 2 + sy],
    ]),
    fill(color, sid),
  ]);
}

function sideFace(name, w, h, d, color, sid) {
  const [sx, sy] = depthOf(d);
  return group(name, [
    path([
      [w / 2, -h / 2],
      [w / 2 + sx, -h / 2 + sy],
      [w / 2 + sx, h / 2 + sy],
      [w / 2, h / 2],
    ]),
    fill(color, sid),
  ]);
}

function frontFace(name, w, h, color, sid) {
  return group(name, [rect([w, h]), fill(color, sid)]);
}

function vary(color, amount) {
  return [
    Math.min(1, Math.max(0, color[0] + amount)),
    Math.min(1, Math.max(0, color[1] + amount)),
    Math.min(1, Math.max(0, color[2] + amount)),
    1,
  ];
}

function hash(i, j) {
  return ((i * 17 + j * 31) % 7) / 7;
}

const FACE = [
  "HHHHHHHH",
  "HHHHHHHH",
  "HSSSSSSH",
  "HSWWSWWH",
  "HSWPSPWH",
  "SSSNNSSS",
  "SSBSSBSS",
  "SSBBBBSS",
];

const FACE_COLOR = {
  H: [C.hair, "hairColor"],
  L: [C.hairLit, "hairColor"],
  D: [C.hairDark, "hairColor"],
  S: [C.skin, "skinColor"],
  T: [C.skinLit, "skinColor"],
  W: [C.eyeWhite, null],
  P: [C.pupil, "pupilColor"],
  B: [C.beard, "beardColor"],
  N: [C.skinShadow, "skinShadow"],
  O: [C.mouth, null],
};

const HEAD_SIDE = [
  "LLHHDDHH",
  "LHHHDDDH",
  "HHHHHHDH",
  "HHHTTHHH",
  "HHHTNHHH",
  "SSSSSSSH",
  "SSSSSSSS",
  "SSSSSSSS",
];

const HEAD_TOP = [
  "LLHHDHHL",
  "LHHHHDDH",
  "HHHLHHHD",
  "LHHHHHHL",
  "HHHDHHHL",
  "LHHHLHHD",
  "HHHHDHHL",
  "DHHHLHHD",
];

const SHIRT = [
  "CCCSSCCC",
  "CCCSCSCC",
  "CCCCCCCC",
  "CcCCCCCc",
  "CCCCCCCC",
  "CCcCCCCc",
  "CCCCCCCC",
  "CcCCCCCC",
  "CCCCCcCC",
  "CCCCCCCC",
  "CcCCCCcC",
  "CCCCCCCC",
];

const SHIRT_COLOR = {
  C: [C.shirt, "shirtColor"],
  c: [C.shirtLit, "shirtColor"],
  S: [C.skin, "skinColor"],
  K: [C.shirtDark, "shirtDark"],
};

function gridFront(map, dict, w, h, prefix, shade = true) {
  const rows = map.length;
  const cols = map[0].length;
  const items = [];
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < cols; c++) {
      const key = map[r][c];
      const [color, sid] = dict[key];
      const n = shade ? (hash(c, r) - 0.5) * 0.06 : 0;
      items.push(frontPixel(`${prefix}-${c}-${r}`, c, r, cols, rows, w, h, vary(color, n), sid));
    }
  }
  return items;
}

function sidePixel(name, col, row, cols, rows, w, h, d, color, sid) {
  const [sx, sy] = depthOf(d);
  const ph = h / rows;
  const t0 = col / cols;
  const t1 = (col + 1) / cols;
  const y0 = -h / 2 + ph * row;
  const y1 = y0 + ph + 0.15;
  const x = w / 2;
  return group(name, [
    path([
      [x + sx * t0, y0 + sy * t0],
      [x + sx * t1, y0 + sy * t1],
      [x + sx * t1, y1 + sy * t1],
      [x + sx * t0, y1 + sy * t0],
    ]),
    fill(color, sid),
  ]);
}

function gridSide(map, dict, w, h, d, prefix) {
  const rows = map.length;
  const cols = map[0].length;
  const items = [];
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      const key = map[r][c];
      const [color, sid] = dict[key] || [C.hair, "hairColor"];
      const n = (hash(c, r) - 0.5) * 0.05;
      items.push(sidePixel(`${prefix}-${c}-${r}`, c, r, cols, rows, w, h, d, vary(color, n), sid));
    }
  }
  return items;
}

function gridTop(map, dict, w, h, d, prefix) {
  const rows = map.length;
  const cols = map[0].length;
  const [sx, sy] = depthOf(d);
  const pw = w / cols;
  const items = [];
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < cols; c++) {
      const key = map[r][c];
      const [color, sid] = dict[key] || [C.hairLit, "hairColor"];
      const x0 = -w / 2 + c * pw;
      const x1 = x0 + pw + 0.15;
      const t0 = r / rows;
      const t1 = (r + 1) / rows;
      const y = -h / 2;
      const n = (hash(c, r) - 0.5) * 0.05;
      items.push(group(`${prefix}-${c}-${r}`, [
        path([
          [x0 + sx * t0, y + sy * t0],
          [x1 + sx * t0, y + sy * t0],
          [x1 + sx * t1, y + sy * t1],
          [x0 + sx * t1, y + sy * t1],
        ]),
        fill(vary(color, n), sid),
      ]));
    }
  }
  return items;
}

const headW = 8 * U;
const headH = 8 * U;
const headD = 8 * U;
const bodyW = 8 * U;
const bodyH = 12 * U;
const bodyD = 4 * U;
const armW = 4 * U;
const armH = 12 * U;
const armD = 4 * U;
const legW = 4 * U;
const legH = 12 * U;
const legD = 4 * U;

const bodyP = [232, 238, 0];

const bodyS = anim([
  kf(0, [100, 100, 100]),
  kf(15, [86.6, 100, 100]),
  kf(30, [50, 100, 100]),
  kf(45, [6, 100, 100]),
  kf(60, [-50, 100, 100]),
  kf(75, [-86.6, 100, 100]),
  kf(90, [-100, 100, 100]),
  kf(105, [-86.6, 100, 100]),
  kf(120, [-50, 100, 100]),
  kf(135, [-6, 100, 100]),
  kf(150, [50, 100, 100]),
  kf(165, [86.6, 100, 100]),
  kf(180, [100, 100, 100]),
]);

const headR = 0;
const rightArmR = 8;
const leftArmR = -6;

const eyeOpenO = anim([
  kf(0, [100], E.sharp),
  kf(66, [100], E.sharp, E.sharp),
  kf(70, [0], E.sharp, E.sharp),
  kf(78, [0], E.settle, E.sharp),
  kf(82, [100], E.settle, E.settle),
  kf(180, [100], null, E.settle),
]);

const lidO = anim([
  kf(0, [0], E.sharp),
  kf(66, [0], E.sharp, E.sharp),
  kf(70, [100], E.sharp, E.sharp),
  kf(78, [100], E.settle, E.sharp),
  kf(82, [0], E.settle, E.settle),
  kf(180, [0], null, E.settle),
]);

const IND = {
  lids: 1,
  face: 2,
  headFront: 3,
  headTop: 4,
  rightArm: 5,
  bodyFront: 6,
  bodyTop: 7,
  rightLeg: 8,
  headSide: 9,
  bodySide: 10,
  leftArm: 11,
  leftLeg: 12,
  body: 13,
  shadow: 14,
};

const sleeveH = armH * 0.34;
const handH = armH - sleeveH;

const ARM = [
  "cccc",
  "cCcc",
  "cccc",
  "CccC",
  "STTS",
  "STST",
  "TSTS",
  "STTS",
  "TSTS",
  "STST",
  "TSTS",
  "STTS",
];

const ARM_COLOR = {
  C: [C.shirt, "shirtColor"],
  c: [C.shirtLit, "shirtColor"],
  S: [C.skin, "skinColor"],
  T: [C.skinLit, "skinColor"],
};

const PANT = [
  "PpPP",
  "PPpP",
  "PPPp",
  "pPPP",
  "PPpP",
  "PpPP",
  "PPPp",
  "pPPP",
  "PPpP",
  "PpPP",
  "GGGG",
  "GGGG",
];

const PANT_COLOR = {
  P: [C.pants, "pantsColor"],
  p: [C.pantsLit, "pantsColor"],
  G: [C.shoes, "shoeColor"],
};

function armShapes(side) {
  const shirt = side === "right" ? C.shirt : C.shirtDark;
  const shirtSid = side === "right" ? "shirtColor" : "shirtDark";
  const skin = side === "right" ? C.skin : C.skinShadow;
  const skinSid = side === "right" ? "skinColor" : "skinShadow";
  return [
    group("arm-pixels", gridFront(ARM, ARM_COLOR, armW, armH, `${side}-arm`, true), [0, armH / 2]),
    group("sleeve-front", [rect([armW, sleeveH]), fill(shirt, shirtSid)], [0, sleeveH / 2]),
    group("skin-front", [rect([armW, handH]), fill(skin, skinSid)], [0, sleeveH + handH / 2]),
    group("sleeve-side", [
      path((() => {
        const [sx, sy] = depthOf(armD);
        const x = armW / 2;
        return [
          [x, 0],
          [x + sx, sy],
          [x + sx, sleeveH + sy],
          [x, sleeveH],
        ];
      })()),
      fill(C.shirtDark, "shirtDark"),
    ]),
    group("skin-side", [
      path((() => {
        const [sx, sy] = depthOf(armD);
        const y0 = sleeveH;
        const y1 = armH;
        const x = armW / 2;
        return [
          [x, y0],
          [x + sx, y0 + sy],
          [x + sx, y1 + sy],
          [x, y1],
        ];
      })()),
      fill(C.skinShadow, "skinShadow"),
    ]),
    group("sleeve-top", [
      path((() => {
        const [sx, sy] = depthOf(armD);
        return [
          [-armW / 2, 0],
          [armW / 2, 0],
          [armW / 2 + sx, sy],
          [-armW / 2 + sx, sy],
        ];
      })()),
      fill(C.shirtLit, "shirtColor"),
    ]),
  ];
}

function legShapes(side) {
  const pant = side === "right" ? C.pants : C.pantsDark;
  const pantSid = side === "right" ? "pantsColor" : "pantsDark";
  const shoe = side === "right" ? C.shoes : C.shoesDark;
  const pantH = legH - 2 * U;
  return [
    group("leg-pixels", gridFront(PANT, PANT_COLOR, legW, legH, `${side}-leg`, true), [0, legH / 2]),
    group("pant-front", [rect([legW, pantH]), fill(pant, pantSid)], [0, pantH / 2]),
    group("shoe-front", [rect([legW, 2 * U]), fill(shoe, "shoeColor")], [0, pantH + U]),
    group("pant-side", [
      path((() => {
        const [sx, sy] = depthOf(legD);
        const x = legW / 2;
        return [
          [x, 0],
          [x + sx, sy],
          [x + sx, pantH + sy],
          [x, pantH],
        ];
      })()),
      fill(C.pantsDark, "pantsDark"),
    ]),
    group("shoe-side", [
      path((() => {
        const [sx, sy] = depthOf(legD);
        const x = legW / 2;
        const y0 = pantH;
        const y1 = legH;
        return [
          [x, y0],
          [x + sx, y0 + sy],
          [x + sx, y1 + sy],
          [x, y1],
        ];
      })()),
      fill(C.shoesDark, "shoeColor"),
    ]),
  ];
}

const layers = [
  layer({
    ind: IND.lids,
    nm: "Lids",
    parent: IND.headFront,
    ks: ks({ p: [0, 0, 0], o: lidO }),
    shapes: [
      group("left-lid", [rect([2.3 * U, 2.2 * U]), fill(C.skin, "skinColor")], [-1.5 * U, 0]),
      group("right-lid", [rect([2.3 * U, 2.2 * U]), fill(C.skin, "skinColor")], [1.5 * U, 0]),
    ],
  }),
  layer({
    ind: IND.face,
    nm: "Face Pixels",
    parent: IND.headFront,
    ks: ks({ p: [0, 0, 0] }),
    shapes: gridFront(FACE, FACE_COLOR, headW, headH, "face"),
  }),
  layer({
    ind: IND.headFront,
    nm: "Head",
    parent: IND.body,
    ks: ks({ p: [0, -(bodyH / 2 + headH / 2) + 2, 0], r: headR }),
    shapes: [
      frontFace("head-base", headW, headH, C.skin, "skinColor"),
    ],
  }),
  layer({
    ind: IND.headTop,
    nm: "Head Top",
    parent: IND.headFront,
    ks: ks({ p: [0, 0, 0] }),
    shapes: [
      topFace("hair-top", headW, headH, headD, C.hairLit, "hairColor"),
      ...gridTop(HEAD_TOP, FACE_COLOR, headW, headH, headD, "ht"),
    ],
  }),
  layer({
    ind: IND.headSide,
    nm: "Head Side",
    parent: IND.headFront,
    ks: ks({ p: [0, 0, 0] }),
    shapes: [
      ...gridSide(HEAD_SIDE, FACE_COLOR, headW, headH, headD, "hs"),
      sideFace("head-side-base", headW, headH, headD, C.skin, "skinColor"),
    ],
  }),
  layer({
    ind: IND.rightArm,
    nm: "Right Arm",
    parent: IND.body,
    ks: ks({ p: [bodyW / 2 + 6, -bodyH / 2 + 4, 0], r: rightArmR }),
    shapes: armShapes("right"),
  }),
  layer({
    ind: IND.bodyFront,
    nm: "Body Front",
    parent: IND.body,
    ks: ks({ p: [0, 0, 0] }),
    shapes: [
      ...gridFront(SHIRT, SHIRT_COLOR, bodyW, bodyH, "shirt"),
      frontFace("body-base", bodyW, bodyH, C.shirt, "shirtColor"),
    ],
  }),
  layer({
    ind: IND.bodyTop,
    nm: "Body Top",
    parent: IND.body,
    ks: ks({ p: [0, 0, 0] }),
    shapes: [topFace("shoulders", bodyW, bodyH, bodyD, C.shirtLit, "shirtColor")],
  }),
  layer({
    ind: IND.bodySide,
    nm: "Body Side",
    parent: IND.body,
    ks: ks({ p: [0, 0, 0] }),
    shapes: [sideFace("body-side", bodyW, bodyH, bodyD, C.shirtDark, "shirtDark")],
  }),
  layer({
    ind: IND.rightLeg,
    nm: "Right Leg",
    parent: IND.body,
    ks: ks({ p: [legW / 2, bodyH / 2, 0] }),
    shapes: legShapes("right"),
  }),
  layer({
    ind: IND.leftArm,
    nm: "Left Arm",
    parent: IND.body,
    ks: ks({ p: [-(bodyW / 2 + 2), -bodyH / 2 + 4, 0], r: leftArmR }),
    shapes: armShapes("left"),
  }),
  layer({
    ind: IND.leftLeg,
    nm: "Left Leg",
    parent: IND.body,
    ks: ks({ p: [-legW / 2, bodyH / 2, 0] }),
    shapes: legShapes("left"),
  }),
  layer({
    ind: IND.body,
    nm: "Body Root",
    ks: ks({ p: bodyP, s: bodyS }),
    shapes: [group("anchor", [rect([1, 1]), fill([0, 0, 0, 0])])],
  }),
  layer({
    ind: IND.shadow,
    nm: "Contact Shadow",
    ks: ks({
      p: [250, 498, 0],
      o: anim([
        kf(0, [25]),
        kf(45, [18]),
        kf(90, [25]),
        kf(135, [18]),
        kf(180, [25]),
      ]),
      s: anim([
        kf(0, [100, 100, 100]),
        kf(45, [64, 92, 100]),
        kf(90, [100, 100, 100]),
        kf(135, [64, 92, 100]),
        kf(180, [100, 100, 100]),
      ]),
    }),
    shapes: [
      group("shadow", [
        {
          ty: "el",
          p: staticProp([0, 0]),
          s: staticProp([150, 28]),
        },
        fill(C.shadow),
      ]),
    ],
  }),
];

const order = [
  IND.lids,
  IND.face,
  IND.headTop,
  IND.headFront,
  IND.rightArm,
  IND.bodyTop,
  IND.bodyFront,
  IND.rightLeg,
  IND.headSide,
  IND.bodySide,
  IND.leftArm,
  IND.leftLeg,
  IND.body,
  IND.shadow,
];

const lottie = {
  v: "5.7.0",
  fr: FR,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: "Steve — in-place 360 spin",
  ddd: 0,
  assets: [],
  slots: {
    skinColor: { p: staticProp(C.skin) },
    skinShadow: { p: staticProp(C.skinShadow) },
    hairColor: { p: staticProp(C.hair) },
    beardColor: { p: staticProp(C.beard) },
    shirtColor: { p: staticProp(C.shirt) },
    shirtDark: { p: staticProp(C.shirtDark) },
    vneckColor: { p: staticProp(C.skin) },
    pantsColor: { p: staticProp(C.pants) },
    pantsDark: { p: staticProp(C.pantsDark) },
    shoeColor: { p: staticProp(C.shoes) },
    pupilColor: { p: staticProp(C.pupil) },
  },
  layers: order.map((id) => layers.find((l) => l.ind === id)),
};

writeFileSync(new URL("../public/projects/steve-character/scene-1/lottie.json", import.meta.url), JSON.stringify(lottie, null, 2));
console.log("wrote scene", lottie.layers.length, "layers");
