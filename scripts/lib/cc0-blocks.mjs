// Original CC0 16×16 block faces. Recognizable dirt / stone / ore / wood,
// but not Mojang texel copies. Leaves stay pale so biome tints still apply.
import { blob, canvas, hash2, hash32, hexToRgb, noiseFill, rgbToHex, setPx, shade, stamp, tile16 } from "./cc0-canvas.mjs";

const TILE = 16;

function noise(id, hex, amount = 16) {
  const img = tile16();
  noiseFill(img, hex, amount, hash32(id));
  return img;
}

function checker(a, b, size = 2) {
  const img = tile16();
  for (let y = 0; y < TILE; y++)
    for (let x = 0; x < TILE; x++) setPx(img, x, y, (Math.floor(x / size) + Math.floor(y / size)) % 2 ? b : a);
  return img;
}

function speckles(img, hex, count, seed, { minX = 0, minY = 0, maxX = 15, maxY = 15 } = {}) {
  for (let i = 0; i < count; i++) {
    const x = minX + Math.floor(hash2(i, 1, seed) * (maxX - minX + 1));
    const y = minY + Math.floor(hash2(i, 2, seed) * (maxY - minY + 1));
    setPx(img, x, y, hex);
    if (hash2(i, 3, seed) > 0.55) setPx(img, x + 1, y, shade(hex, -12));
  }
  return img;
}

function planks(hex, seed) {
  const img = noise(String(seed), hex, 8);
  const dark = shade(hex, -28);
  const line = shade(hex, -40);
  for (let y = 0; y < TILE; y++) {
    if (y % 4 === 3) for (let x = 0; x < TILE; x++) setPx(img, x, y, line);
    else {
      const shift = y % 8 < 4 ? 0 : 8;
      setPx(img, shift, y, dark);
      setPx(img, (shift + 7) % 16, y, dark);
    }
  }
  return img;
}

function log(bark, ring, seed) {
  const img = noise(String(seed), bark, 10);
  for (let y = 0; y < TILE; y++) {
    setPx(img, 0, y, shade(bark, -22));
    setPx(img, 15, y, shade(bark, -22));
    if (y % 3 === 0) setPx(img, 4 + (y % 5), y, shade(bark, 16));
  }
  for (let x = 3; x < 13; x++) setPx(img, x, 0, ring);
  return img;
}

function ore(stone, speck, count, seed) {
  const img = noise(String(seed), stone, 12);
  speckles(img, speck, count, seed);
  speckles(img, shade(speck, 20), Math.ceil(count / 2), seed + 9);
  return img;
}

function bricks(hex, mortar, seed) {
  const img = noise(String(seed), hex, 7);
  for (let y = 0; y < TILE; y++) {
    if (y % 4 === 3) for (let x = 0; x < TILE; x++) setPx(img, x, y, mortar);
    else {
      const shift = y % 8 < 4 ? 0 : 4;
      for (let x = shift; x < TILE; x += 8) setPx(img, x, y, mortar);
    }
  }
  return img;
}

function metal(hex, seed) {
  const img = noise(String(seed), hex, 6);
  const hi = shade(hex, 28);
  const lo = shade(hex, -30);
  for (let i = 2; i < 14; i++) {
    setPx(img, i, 2, hi);
    setPx(img, 2, i, hi);
    setPx(img, i, 13, lo);
    setPx(img, 13, i, lo);
  }
  for (let y = 5; y < 11; y++) for (let x = 5; x < 11; x++) setPx(img, x, y, shade(hex, ((x + y) % 2) * 12 - 6));
  return img;
}

function leaves(seed) {
  const img = canvas(TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const n = hash2(x, y, seed);
      if (n < 0.12) continue;
      const v = 170 + Math.floor(n * 70);
      setPx(img, x, y, [v, v, v]);
    }
  }
  return img;
}

function plant(art, palette) {
  const img = tile16();
  stamp(img, art, palette);
  return img;
}

const GRASS = `
................
................
..gGgg.Ggg.gG...
.gGGgGGgGGgGGg..
gGGGGGGGGGGGGGg.
`;

function grassTop() {
  const img = noise("grass", "#4aaa38", 14);
  stamp(img, GRASS, { g: "#3d9a2c", G: "#5ec44a" });
  return img;
}

function grassSide() {
  const img = noise("dirt-side", "#8c5a32", 12);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < TILE; x++) {
      const n = hash2(x, y, 11);
      setPx(img, x, y, n > 0.35 ? "#4aaa38" : "#3d9a2c");
    }
  }
  return img;
}

function furnace(lit) {
  const img = noise("furnace", "#6a6a6a", 8);
  fillRectSafe(img, 3, 3, 10, 7, "#1a1a1a");
  fillRectSafe(img, 4, 4, 8, 5, lit ? "#f0a030" : "#141414");
  if (lit) {
    setPx(img, 6, 5, "#ffe060");
    setPx(img, 8, 6, "#ff6020");
    setPx(img, 9, 5, "#ffe060");
  }
  fillRectSafe(img, 5, 11, 6, 3, "#3a3a3a");
  return img;
}

function fillRectSafe(img, x, y, w, h, hex) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) setPx(img, x + xx, y + yy, hex);
}

function craftingTable() {
  const img = planks("#c48a42", 21);
  fillRectSafe(img, 2, 2, 12, 12, "#b57a36");
  fillRectSafe(img, 3, 3, 10, 10, "#d4a056");
  for (let i = 5; i < 11; i++) {
    setPx(img, i, 5, "#6a4220");
    setPx(img, 5, i, "#6a4220");
    setPx(img, i, 10, "#6a4220");
    setPx(img, 10, i, "#6a4220");
  }
  return img;
}

function chestFace() {
  const img = noise("chest", "#b4782c", 8);
  fillRectSafe(img, 1, 1, 14, 14, "#c88838");
  fillRectSafe(img, 2, 2, 12, 5, "#a86824");
  fillRectSafe(img, 7, 6, 2, 3, "#e8c848");
  for (let x = 1; x < 15; x++) setPx(img, x, 7, "#8a5418");
  return img;
}

function door(wood, metal = "#c8c8c8") {
  const img = planks(wood, hash32(wood));
  fillRectSafe(img, 0, 0, 2, 16, shade(wood, -24));
  fillRectSafe(img, 14, 0, 2, 16, shade(wood, -24));
  setPx(img, 12, 8, metal);
  setPx(img, 11, 8, shade(metal, -20));
  return img;
}

function doorUpper(wood) {
  const img = door(wood);
  fillRectSafe(img, 4, 3, 8, 6, shade(wood, 18));
  fillRectSafe(img, 5, 4, 6, 4, shade(wood, -10));
  return img;
}

function tntFace() {
  const img = tile16("#d43c2c");
  noiseFill(img, "#d43c2c", 8, 3);
  fillRectSafe(img, 0, 5, 16, 6, "#f2efe4");
  stamp(
    img,
    `
....#..###..#...
....#...#...#...
....#...#...#...
....#...#...#...
`,
    { "#": "#2a2a2a" },
    0,
    6,
  );
  return img;
}

function hopper() {
  const img = tile16();
  fillRectSafe(img, 1, 1, 14, 5, "#5a5a5a");
  fillRectSafe(img, 3, 6, 10, 4, "#4a4a4a");
  fillRectSafe(img, 6, 10, 4, 5, "#3a3a3a");
  return img;
}

function glassFace() {
  const img = tile16();
  for (let i = 0; i < 16; i++) {
    setPx(img, i, 0, "#c8e8f0");
    setPx(img, 0, i, "#c8e8f0");
    setPx(img, i, 15, "#8ab0c0");
    setPx(img, 15, i, "#8ab0c0");
  }
  fillRectSafe(img, 2, 2, 3, 3, "#e8f8ff");
  return img;
}

function ladder() {
  const img = tile16();
  const wood = "#a06830";
  for (let x of [2, 13]) for (let y = 0; y < 16; y++) setPx(img, x, y, wood);
  for (let y of [2, 6, 10, 14]) for (let x = 3; x < 13; x++) setPx(img, x, y, shade(wood, 16));
  return img;
}

function torch() {
  const img = tile16();
  fillRectSafe(img, 7, 8, 2, 8, "#8a5a28");
  blob(img, 7, 5, 2, 3, "#ffb030");
  setPx(img, 7, 4, "#ffe070");
  setPx(img, 8, 5, "#ff8020");
  return img;
}

function cactus() {
  const img = tile16();
  fillRectSafe(img, 3, 0, 10, 16, "#3a8a38");
  for (let y = 0; y < 16; y++) {
    setPx(img, 3, y, "#2a6a28");
    setPx(img, 12, y, "#2a6a28");
    if (y % 3 === 1) {
      setPx(img, 5, y, "#d8e8c8");
      setPx(img, 10, y, "#d8e8c8");
    }
  }
  return img;
}

function crop(stage, ripe) {
  const img = tile16();
  const h = 3 + stage * 1.6;
  const col = ripe ? "#d8c050" : "#5aaa38";
  for (let x = 2; x < 15; x += 3) {
    for (let y = 15; y > 15 - h; y--) setPx(img, x + (y % 2), y, shade(col, (y % 3) * 8 - 8));
  }
  if (ripe) for (let x = 3; x < 14; x += 3) setPx(img, x, 4, "#c8a028");
  return img;
}

function destroy(stage) {
  const img = tile16();
  if (stage <= 0) return img;
  const cracks = [
    [3, 2, 8, 5],
    [10, 4, 14, 9],
    [2, 8, 7, 13],
    [8, 10, 13, 15],
    [5, 5, 11, 11],
    [1, 4, 4, 10],
    [12, 1, 15, 6],
    [6, 12, 12, 15],
    [0, 0, 6, 4],
    [9, 7, 15, 12],
  ];
  const n = Math.min(cracks.length, 2 + stage);
  for (let i = 0; i < n; i++) {
    const [x0, y0, x1, y1] = cracks[i];
    let x = x0;
    let y = y0;
    while (x !== x1 || y !== y1) {
      setPx(img, x, y, "#1a1a1a");
      if (hash2(x, y, stage) > 0.4) setPx(img, x + 1, y, "#2a2a2a");
      if (x < x1) x++;
      else if (x > x1) x--;
      if (y < y1) y++;
      else if (y > y1) y--;
    }
  }
  return img;
}

function fireFrame(i) {
  const img = tile16();
  const h = 10 + (i % 4);
  for (let y = 15; y > 15 - h; y--) {
    const t = (15 - y) / h;
    const w = 3 + Math.floor((1 - t) * 5 + Math.sin(i + y) * 1.2);
    for (let x = 8 - w; x <= 8 + w; x++) {
      const hex = t < 0.35 ? "#ffe060" : t < 0.7 ? "#ff8020" : "#d43010";
      if (hash2(x, y, i + 2) > 0.15) setPx(img, x, y, hex);
    }
  }
  return img;
}

function waterStill() {
  const img = noise("water", "#3a6ec8", 10);
  for (let x = 0; x < 16; x++) {
    setPx(img, x, 3 + (x % 5), "#5a8ee0");
    setPx(img, x, 9 + ((x * 3) % 4), "#2a58b0");
  }
  return img;
}

const SAPLING = `
.......g........
......gGg.......
.....gGGGg......
....gGGGGGg.....
......#.#.......
.......#........
.......#........
`;

const FLOWER = (petal, center) => `
.......${petal}........
......${petal}${center}${petal}.......
.......${petal}........
.......g........
.......g........
`;

const MUSH = (cap) => `
......${cap}${cap}${cap}.......
.....${cap}${cap}${cap}${cap}${cap}......
......s.s.......
.......s........
`;

const PAINTERS = {
  grass: grassTop,
  dirt: () => noise("dirt", "#8c5a32", 14),
  stone: () => noise("stone", "#7a7a7a", 10),
  cobblestone: () => {
    const img = noise("cobble", "#6e6e6e", 8);
    speckles(img, "#8a8a8a", 18, 4);
    speckles(img, "#555555", 12, 5);
    return img;
  },
  "iron-ore": () => ore("#7a7a7a", "#e0c060", 12, 11),
  "coal-ore": () => ore("#7a7a7a", "#2a2a2a", 10, 12),
  "gold-ore": () => ore("#7a7a7a", "#f0c838", 9, 13),
  "diamond-ore": () => ore("#7a7a7a", "#48e0e8", 8, 14),
  "copper-ore": () => ore("#7a7a7a", "#c87040", 9, 15),
  "redstone-ore": () => ore("#7a7a7a", "#d02020", 10, 16),
  "emerald-ore": () => ore("#7a7a7a", "#30d060", 8, 17),
  "lapis-ore": () => ore("#7a7a7a", "#2450c8", 8, 18),
  sand: () => noise("sand", "#e0d090", 10),
  gravel: () => {
    const img = noise("gravel", "#8a8070", 14);
    speckles(img, "#b0a090", 14, 7);
    return img;
  },
  "oak-planks": () => planks("#c48a42", 1),
  "spruce-planks": () => planks("#705030", 2),
  "birch-planks": () => planks("#d8c890", 3),
  "acacia-planks": () => planks("#c86830", 4),
  "dark-oak-planks": () => planks("#4a3018", 5),
  "oak-log": () => log("#6a4a28", "#c8a060", 1),
  "birch-log": () => log("#e8e0d0", "#2a2a2a", 2),
  "spruce-log": () => log("#3a2a18", "#8a6a40", 3),
  bricks: () => bricks("#b04a38", "#c8b8a0", 1),
  "mossy-cobblestone": () => {
    const img = PAINTERS.cobblestone();
    speckles(img, "#4a8a38", 16, 22);
    return img;
  },
  netherrack: () => noise("netherrack", "#6a2020", 16),
  "soul-sand": () => noise("soul-sand", "#4a3a28", 12),
  glowstone: () => {
    const img = noise("glowstone", "#e0a040", 14);
    speckles(img, "#ffe070", 16, 8);
    return img;
  },
  magma: () => {
    const img = noise("magma", "#8a2010", 12);
    speckles(img, "#f06020", 14, 9);
    return img;
  },
  "nether-bricks": () => bricks("#3a1818", "#2a1010", 2),
  obsidian: () => noise("obsidian", "#1a1028", 8),
  granite: () => {
    const img = noise("granite", "#b07058", 12);
    speckles(img, "#d8a090", 10, 3);
    return img;
  },
  diorite: () => {
    const img = noise("diorite", "#d0d0d0", 10);
    speckles(img, "#8a8a8a", 12, 4);
    return img;
  },
  andesite: () => noise("andesite", "#8a8a88", 10),
  snow: () => noise("snow", "#f0f6fa", 6),
  "crafting-table": craftingTable,
  furnace: () => furnace(false),
  "furnace-on": () => furnace(true),
  chest: chestFace,
  "door-oak": () => door("#b47830"),
  "door-oak-upper": () => doorUpper("#b47830"),
  "door-iron": () => door("#9aa0a6", "#e8c848"),
  "door-iron-upper": () => doorUpper("#9aa0a6"),
  tnt: tntFace,
  bedrock: () => {
    const img = noise("bedrock", "#3a3a3a", 10);
    speckles(img, "#1a1a1a", 18, 2);
    return img;
  },
  bookshelf: () => {
    const img = planks("#c48a42", 8);
    fillRectSafe(img, 1, 2, 14, 12, "#6a3a18");
    for (let y = 3; y < 14; y += 4) for (let x = 2; x < 14; x++) setPx(img, x, y, ["#8a2020", "#204080", "#c8a030"][x % 3]);
    return img;
  },
  noteblock: () => {
    const img = planks("#6a4220", 9);
    blob(img, 8, 8, 3, 3, "#2a2a2a");
    return img;
  },
  jukebox: () => {
    const img = planks("#6a4220", 10);
    blob(img, 8, 8, 4, 4, "#2a1a10");
    blob(img, 8, 8, 2, 2, "#4a80c8");
    return img;
  },
  dispenser: () => {
    const img = noise("disp", "#6a6a6a", 8);
    blob(img, 8, 8, 4, 4, "#1a1a1a");
    return img;
  },
  piston: () => {
    const img = planks("#c48a42", 11);
    fillRectSafe(img, 0, 0, 16, 4, "#7a7a7a");
    return img;
  },
  "enchanting-table": () => {
    const img = noise("ench", "#2a1848", 8);
    fillRectSafe(img, 2, 2, 12, 12, "#3a2060");
    blob(img, 8, 8, 3, 3, "#c060e0");
    return img;
  },
  hopper,
  observer: () => {
    const img = noise("obs", "#5a5a5a", 8);
    blob(img, 8, 7, 3, 2, "#801010");
    fillRectSafe(img, 4, 11, 8, 3, "#2a2a2a");
    return img;
  },
  "oak-leaves": () => leaves(1),
  "birch-leaves": () => leaves(2),
  "spruce-leaves": () => leaves(3),
  "oak-sapling": () => plant(SAPLING, { g: "#3a8a28", G: "#5aaa38", "#": "#6a4a20" }),
  "grass-side": grassSide,
  "tall-grass": () => {
    const img = tile16();
    for (let x = 2; x < 15; x += 2) for (let y = 4 + (x % 3); y < 16; y++) setPx(img, x, y, [200, 200, 200]);
    return img;
  },
  poppy: () => plant(FLOWER("r", "Y"), { r: "#d02030", Y: "#f0d030", g: "#3a8a28" }),
  dandelion: () => plant(FLOWER("y", "Y"), { y: "#f0d030", Y: "#fff0a0", g: "#3a8a28" }),
  vine: () => {
    const img = tile16();
    for (let y = 0; y < 16; y++) {
      setPx(img, 4 + (y % 3), y, [190, 190, 190]);
      setPx(img, 10 - (y % 2), y, [170, 170, 170]);
    }
    return img;
  },
  "red-mushroom": () => plant(MUSH("R"), { R: "#d02828", s: "#e8d8c0" }),
  "brown-mushroom": () => plant(MUSH("B"), { B: "#8a5a30", s: "#e8d8c0" }),
  cactus,
  water: waterStill,
  torch,
  ladder,
  "lily-pad": () => {
    const img = tile16();
    blob(img, 8, 8, 6, 5, [180, 180, 180]);
    blob(img, 8, 8, 3, 2, [210, 210, 210]);
    return img;
  },
  glass: glassFace,
  ice: () => {
    const img = noise("ice", "#a8d8e8", 8);
    fillRectSafe(img, 3, 3, 4, 3, "#d0f0ff");
    return img;
  },
  pumpkin: () => {
    const img = noise("pump", "#d07818", 8);
    for (let y = 0; y < 16; y++) setPx(img, 8, y, "#8a5010");
    fillRectSafe(img, 6, 0, 4, 2, "#3a8a28");
    return img;
  },
  hay: () => {
    const img = noise("hay", "#d4b040", 8);
    for (let y = 0; y < 16; y += 3) for (let x = 0; x < 16; x++) setPx(img, x, y, "#b89028");
    return img;
  },
  farmland: () => {
    const img = noise("farm", "#6a3a18", 10);
    for (let y = 4; y < 16; y += 4) for (let x = 0; x < 16; x++) setPx(img, x, y, "#4a2810");
    return img;
  },
  melon: () => {
    const img = noise("melon", "#5aaa30", 8);
    for (let y = 0; y < 16; y++) setPx(img, 5, y, "#3a8020");
    for (let y = 0; y < 16; y++) setPx(img, 11, y, "#3a8020");
    return img;
  },
  clay: () => noise("clay", "#a0b0b8", 8),
  "blue-ice": () => noise("blue-ice", "#5088d0", 8),
  "iron-block": () => metal("#d0d4d8", 1),
  "gold-block": () => metal("#f0c838", 2),
  "diamond-block": () => metal("#3ad0d0", 3),
  "emerald-block": () => metal("#2cc060", 4),
  "copper-block": () => metal("#c87040", 5),
  "white-wool": () => noise("wool", "#f0f0ea", 8),
  sandstone: () => {
    const img = noise("sandstone", "#e0d090", 8);
    for (let y of [4, 11]) for (let x = 0; x < 16; x++) setPx(img, x, y, "#c8b060");
    return img;
  },
  "stone-bricks": () => bricks("#8a8a8a", "#5a5a5a", 3),
  sponge: () => {
    const img = noise("sponge", "#d0c040", 12);
    speckles(img, "#8a8020", 14, 6);
    return img;
  },
  bed: () => {
    const img = tile16("#c02030");
    fillRectSafe(img, 0, 10, 16, 6, "#c48a42");
    fillRectSafe(img, 1, 2, 14, 8, "#e04050");
    return img;
  },
  "bed-head": () => {
    const img = PAINTERS.bed();
    fillRectSafe(img, 2, 1, 12, 4, "#f0f0ea");
    return img;
  },
  "sugar-cane": () => {
    const img = tile16();
    for (let x of [5, 10]) for (let y = 0; y < 16; y++) setPx(img, x + (y % 2), y, "#5aaa38");
    return img;
  },
  "grass-path": () => {
    const img = noise("path", "#a08048", 10);
    for (let y = 0; y < 3; y++) for (let x = 0; x < 16; x++) setPx(img, x, y, "#6a9a40");
    return img;
  },
  campfire: () => {
    const img = tile16();
    fillRectSafe(img, 2, 12, 12, 3, "#6a4a20");
    blob(img, 8, 8, 3, 4, "#ff8020");
    setPx(img, 8, 5, "#ffe060");
    return img;
  },
  lantern: () => {
    const img = tile16();
    fillRectSafe(img, 5, 3, 6, 10, "#4a4a4a");
    fillRectSafe(img, 6, 5, 4, 5, "#f0c040");
    fillRectSafe(img, 7, 0, 2, 3, "#7a7a7a");
    return img;
  },
  "oak-trapdoor": () => {
    const img = planks("#c48a42", 12);
    fillRectSafe(img, 6, 6, 4, 4, "#5a3a18");
    return img;
  },
  composter: () => {
    const img = planks("#8a5a28", 13);
    fillRectSafe(img, 3, 3, 10, 10, "#3a2810");
    return img;
  },
  "nether-quartz-ore": () => ore("#6a2020", "#f0e8e0", 9, 19),
  "iron-bars": () => {
    const img = tile16();
    for (let x of [3, 8, 12]) for (let y = 0; y < 16; y++) setPx(img, x, y, "#8a8a8a");
    for (let y of [3, 12]) for (let x = 2; x < 14; x++) setPx(img, x, y, "#7a7a7a");
    return img;
  },
  fire: () => fireFrame(0),
  "fire-1": () => fireFrame(3),
};

for (let i = 0; i < 8; i++) PAINTERS[`wheat-${i}`] = () => crop(i, i >= 7);
for (const [id, stage, ripe] of [
  ["potato-0", 1, false],
  ["potato-3", 4, false],
  ["potato-7", 7, true],
  ["carrot-0", 1, false],
  ["carrot-3", 4, false],
  ["carrot-7", 7, true],
  ["cocoa-0", 2, false],
  ["cocoa-1", 4, false],
  ["cocoa-2", 6, true],
  ["nether-wart-0", 1, false],
  ["nether-wart-1", 4, false],
  ["nether-wart-2", 6, true],
]) {
  PAINTERS[id] = () => {
    const img = crop(stage, ripe);
    if (id.startsWith("carrot") && ripe) speckles(img, "#e06020", 8, 3, { minY: 8 });
    if (id.startsWith("nether")) {
      const out = tile16();
      for (let y = 16 - (3 + stage); y < 16; y++) for (let x = 5; x < 11; x++) setPx(out, x, y, ripe ? "#8a2028" : "#5a1018");
      return out;
    }
    if (id.startsWith("cocoa")) {
      const out = tile16();
      blob(out, 8, 10, 2 + Math.floor(stage / 3), 3, ripe ? "#6a3a18" : "#3a8a28");
      return out;
    }
    return img;
  };
}

for (let i = 0; i < 10; i++) PAINTERS[`destroy-${i}`] = () => destroy(i);
for (let i = 2; i < 8; i++) PAINTERS[`fire-${i}`] = () => fireFrame(i * 2);

export function paintBlock(id) {
  const fn = PAINTERS[id];
  if (fn) return fn();
  const img = noise(id, rgbToHex([80 + (hash32(id) % 120), 70 + (hash32(id + "g") % 110), 60 + (hash32(id + "b") % 110)]), 14);
  return img;
}

export function paintFireStrip(frames = 8) {
  const img = canvas(TILE, TILE * frames);
  for (let f = 0; f < frames; f++) {
    const frame = fireFrame(f);
    for (let y = 0; y < TILE; y++)
      for (let x = 0; x < TILE; x++) {
        const i = ((f * TILE + y) * TILE + x) * 4;
        const j = (y * TILE + x) * 4;
        img.rgba.set(frame.rgba.subarray(j, j + 4), i);
      }
  }
  return img;
}

export { fireFrame };
