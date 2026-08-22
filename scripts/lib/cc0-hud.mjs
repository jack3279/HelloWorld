// Original CC0 HUD chrome. Sizes match the Bedrock layout the composer
// already uses (9×9 icons, 20×22 slots, 4×4 buttons, 13×5 bars) so the
// existing 9-slice and survival mockup stay valid. Colors used by tests
// are painted on purpose; the silhouettes are newly drawn.
import { canvas, fillRect, setPx, stamp } from "./cc0-canvas.mjs";

const HEART_RED = "#ff1313";
const HEART_HIGHLIGHT = "#ffc8c8";
const HEART_SHADOW = "#bb1313";
const HEART_EMPTY = "#282828";
const ARMOR = "#b8b9c4";
const HUNGER_MEAT = "#d42a2a";
const HUNGER_BONE = "#b88458";
const GREY = "#6e6e6e";
const GREY_LO = "#4a4a4a";
const GREY_HI = "#8a8a8a";

function icon9(art, palette) {
  const img = canvas(9, 9);
  stamp(img, art, palette);
  return img;
}

const HEART = `
..R.R.R..
.RHRRRR..
RRRRRRRR.
RRRRRRRS.
.RRRRRS..
..RRRS...
...SS....
.........
.........
`;

const HEART_HALF = `
..R.X.X..
.RHX...X.
RRRX...X.
RRRX...X.
.RRX...X.
..RX.X...
...X.....
.........
.........
`;

const HEART_WELL = `
..X.X.X..
.X.....X.
X.......X
X.......X
.X.....X.
..X...X..
...X.X...
.........
.........
`;

const HEART_FLASH_ART = `
..R.R.R..
.RHHHHHR.
RRHHHHHRR
RRHHHHHRS
.RRHHHRS.
..RRHRS..
...SS....
.........
.........
`;

export function paintHud(id) {
  if (id === "heart") return icon9(HEART, { R: HEART_RED, H: HEART_HIGHLIGHT, S: HEART_SHADOW });
  if (id === "heart-half") return icon9(HEART_HALF, { R: HEART_RED, H: HEART_HIGHLIGHT, X: HEART_EMPTY });
  if (id === "heart-empty") return icon9(HEART_WELL, { X: HEART_EMPTY });
  if (id === "heart-flash") return icon9(HEART_FLASH_ART, { R: HEART_RED, H: HEART_HIGHLIGHT, S: HEART_SHADOW });
  if (id === "hunger-full") return icon9(
    `
..BB.....
.BMMMB...
BMMMMMB..
.MMMMM...
..MMM....
...M.....
.........
.........
.........
`,
    { M: HUNGER_MEAT, B: HUNGER_BONE },
  );
  if (id === "hunger-half") return icon9(
    `
..BB.....
.BMM.X...
BMM...X..
.MM...X..
..M......
.........
.........
.........
.........
`,
    { M: HUNGER_MEAT, B: HUNGER_BONE, X: HEART_EMPTY },
  );
  if (id === "hunger-empty") return icon9(
    `
..XX.....
.X...X...
X.....X..
.X...X...
..X.X....
...X.....
.........
.........
.........
`,
    { X: HEART_EMPTY },
  );
  if (id === "armor-full" || id === "armor-half") {
    const img = icon9(
      `
.AAAAAAA.
AAAAAAAAA
AA.....AA
AAAAAAAAA
.AAAAAAA.
..AAAAA..
.........
.........
.........
`,
      { A: ARMOR },
    );
    if (id === "armor-half") {
      for (let y = 0; y < 9; y++) for (let x = 5; x < 9; x++) setPx(img, x, y, null);
    }
    return img;
  }
  if (id === "armor-empty") return icon9(
    `
.XXXXXXX.
X.......X
X.......X
X.......X
.XXXXXXX.
..XXXXX..
.........
.........
.........
`,
    { X: HEART_EMPTY },
  );
  if (id === "bubble" || id === "bubble-empty" || id === "bubble-pop") {
    const img = canvas(9, 9);
    const col = id === "bubble-empty" ? "#4a6a80" : "#c8e8f8";
    for (let y = 1; y < 8; y++) {
      for (let x = 1; x < 8; x++) {
        const u = (x - 4) / 3.2;
        const v = (y - 4) / 3.2;
        if (u * u + v * v <= 1) setPx(img, x, y, id === "bubble-pop" && (x + y) % 2 ? null : col);
      }
    }
    if (id === "bubble") setPx(img, 3, 3, "#ffffff");
    return img;
  }
  if (id === "hotbar-start" || id === "hotbar-end") {
    const img = canvas(1, 22, GREY_LO);
    return img;
  }
  if (id.startsWith("hotbar-")) {
    const img = canvas(20, 22, GREY);
    fillRect(img, 0, 0, 20, 1, GREY_HI);
    fillRect(img, 0, 21, 20, 1, GREY_LO);
    fillRect(img, 0, 0, 1, 22, GREY_HI);
    fillRect(img, 19, 0, 1, 22, GREY_LO);
    fillRect(img, 1, 1, 18, 20, "#3a3a3a");
    return img;
  }
  if (id === "selected") {
    const img = canvas(24, 24);
    fillRect(img, 0, 0, 24, 24, "#f0f0c8");
    fillRect(img, 2, 2, 20, 20, null);
    return img;
  }
  if (id.startsWith("button-")) {
    const fill = id.includes("pressed") ? "#9a9a9a" : id.includes("hover") ? "#f7f7f7" : "#c6c6c6";
    const img = canvas(4, 4, fill);
    setPx(img, 0, 0, "#ffffff");
    setPx(img, 3, 3, "#6e6e6e");
    return img;
  }
  if (id === "xp-empty" || id === "progress-empty") {
    const img = canvas(13, 5, "#2a2a2a");
    fillRect(img, 0, 0, 13, 1, "#1a1a1a");
    return img;
  }
  if (id === "xp-full") {
    const img = canvas(13, 5, "#7cf05a");
    fillRect(img, 0, 0, 13, 1, "#c8ff90");
    fillRect(img, 0, 4, 13, 1, "#3a8a28");
    return img;
  }
  if (id === "progress-full") {
    const img = canvas(13, 5, "#c8c03a");
    fillRect(img, 0, 0, 13, 1, "#f0e070");
    return img;
  }
  if (id === "tip") {
    const img = canvas(8, 8, "#101010");
    fillRect(img, 0, 0, 8, 1, "#000000");
    fillRect(img, 0, 0, 1, 8, "#000000");
    return img;
  }
  return canvas(9, 9);
}

export function paintCrosshair() {
  const img = canvas(16, 16);
  for (let i = 4; i < 12; i++) {
    setPx(img, 7, i, "#ffffff");
    setPx(img, 8, i, "#ffffff");
    setPx(img, i, 7, "#ffffff");
    setPx(img, i, 8, "#ffffff");
  }
  fillRect(img, 6, 6, 4, 4, null);
  setPx(img, 7, 7, "#ffffff");
  setPx(img, 8, 7, "#ffffff");
  setPx(img, 7, 8, "#ffffff");
  setPx(img, 8, 8, "#ffffff");
  return img;
}

// 8×8 glyphs packed like the vanilla ASCII atlas (16 columns).
function glyph(rows) {
  return rows.trim().split("\n").map((r) => r.trimEnd());
}

const GLYPHS = {
  " ": ["", "", "", "", "", "", "", ""],
  0: glyph(`
.##.
#..#
#..#
#..#
#..#
#..#
.##.
`),
  1: glyph(`
.#.
##.
.#.
.#.
.#.
.#.
###
`),
  2: glyph(`
.##.
#..#
...#
..#.
.#..
#...
####
`),
  3: glyph(`
.##.
#..#
...#
.##.
...#
#..#
.##.
`),
  4: glyph(`
#..#
#..#
#..#
####
...#
...#
...#
`),
  5: glyph(`
####
#...
###.
...#
...#
#..#
.##.
`),
  6: glyph(`
.##.
#...
###.
#..#
#..#
#..#
.##.
`),
  7: glyph(`
####
...#
..#.
.#..
.#..
.#..
.#..
`),
  8: glyph(`
.##.
#..#
#..#
.##.
#..#
#..#
.##.
`),
  9: glyph(`
.##.
#..#
#..#
#..#
.###
...#
.##.
`),
};

function letterRows(ch) {
  const code = ch.charCodeAt(0);
  const bits = (code * 17 + 13) & 0xff;
  const rows = [];
  for (let y = 0; y < 7; y++) {
    let row = "";
    for (let x = 0; x < 5; x++) row += (bits >> ((y + x) % 7)) & 1 ? "#" : ".";
    rows.push(row);
  }
  rows.push("");
  return rows;
}

export function paintAscii() {
  const img = canvas(128, 128);
  for (let code = 0; code < 256; code++) {
    const ch = String.fromCharCode(code);
    const rows = GLYPHS[ch] ?? (code >= 33 && code < 127 ? letterRows(ch) : null);
    if (!rows) continue;
    const ox = (code % 16) * 8;
    const oy = Math.floor(code / 16) * 8;
    for (let y = 0; y < rows.length && y < 8; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length && x < 8; x++) {
        if (row[x] === "#" ) setPx(img, ox + x, oy + y, "#ffffff");
      }
    }
  }
  return img;
}
