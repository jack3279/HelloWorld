const ROOT = "/repo-assets";
const TILE = 48;
const GOAL_DIAMONDS = 5;
const GRAVITY = 2100;
const MOVE = 210;
const JUMP = 680;
const MAX_FALL = 980;

const STEVE = {
  loco: { w: 256, h: 320, ax: 128, ay: 300, scale: 0.3 },
  combat: { w: 384, h: 336, ax: 168, ay: 308, scale: 0.3 },
};

const ITEM_LABELS = {
  "diamond-sword": "钻石剑",
  "diamond-pickaxe": "钻石镐",
  torch: "火把",
  bread: "面包",
  steak: "熟牛排",
  apple: "苹果",
  "golden-apple": "金苹果",
  "potion-heal": "治疗药水",
  diamond: "钻石",
  "iron-chestplate": "铁胸甲",
  "rotten-flesh": "腐肉",
  bone: "骨头",
  string: "线",
  gunpowder: "火药",
  "spider-eye": "蜘蛛眼",
  "ender-pearl": "末影珍珠",
  "cooked-porkchop": "熟猪排",
  "cooked-chicken": "熟鸡肉",
  carrot: "胡萝卜",
  leather: "皮革",
  emerald: "绿宝石",
  saddle: "鞍",
};

const FOOD = {
  bread: { hunger: 5, health: 2 },
  steak: { hunger: 8, health: 4 },
  apple: { hunger: 4, health: 2 },
  "golden-apple": { hunger: 10, health: 10 },
  "potion-heal": { hunger: 0, health: 8 },
  "cooked-porkchop": { hunger: 8, health: 4 },
  "cooked-chicken": { hunger: 6, health: 3 },
  carrot: { hunger: 3, health: 1 },
  "rotten-flesh": { hunger: 4, health: -2 },
};

const BLOCKS = {
  g: "blocks/grass.svg",
  d: "blocks/dirt.svg",
  s: "blocks/stone.svg",
  c: "blocks/cobblestone.svg",
  o: "blocks/oak-log.svg",
  L: "blocks/oak-leaves.svg",
  p: "blocks/oak-planks.svg",
  a: "blocks/sand.svg",
  w: "blocks/water.svg",
  k: "blocks/cactus.svg",
  t: "blocks/torch.svg",
  C: "blocks/chest.svg",
  T: "blocks/crafting-table.svg",
  F: "blocks/furnace.svg",
  b: "blocks/bricks.svg",
  B: "blocks/bedrock.svg",
  D: "blocks/door-oak.svg",
  f: "blocks/dandelion.svg",
  P: "blocks/poppy.svg",
  G: "blocks/tall-grass.svg",
  i: "blocks/diamond-ore.svg",
  x: "blocks/coal-ore.svg",
  h: "blocks/ladder.svg",
  m: "blocks/mossy-cobblestone.svg",
  j: "blocks/glass.svg",
  I: "blocks/ice.svg",
  u: "blocks/pumpkin.svg",
  y: "blocks/hay.svg",
  e: "blocks/melon.svg",
  n: "blocks/farmland.svg",
  q: "blocks/clay.svg",
};

const SOLID = new Set("gdscpLabBTFimxIjuyenq".split(""));

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start");
const demoBtn = document.getElementById("demo");
const loadStatus = document.getElementById("load-status");
const ctx = canvas.getContext("2d");

const images = new Map();
const keys = new Set();
const hold = { left: false, right: false, jump: false, use: false };

let viewW = 960;
let viewH = 540;
let last = 0;
let mode = "boot";
let world;
let player;
let mobs = [];
let drops = [];
let particles = [];
let cam = { x: 0, y: 0 };
let time = 0;
let message = "";
let messageT = 0;
let win = false;
let demo = null;

function asset(rel) {
  return `${ROOT}/${rel}`;
}

function range(n, map) {
  return Array.from({ length: n }, (_, i) => map(i));
}

const MANIFEST = [
  ...Object.values(BLOCKS),
  ...range(8, (i) => `lava-sprites/boil-${i * 4}.svg`),
  ...["idle-a", "idle-b", ...range(8, (i) => `run-${i}`), "jump-crouch", "jump-rise", "jump-apex", "jump-fall", "jump-land"].map(
    (id) => `steve-sprites/${id}.svg`,
  ),
  ...range(10, (i) => `steve-sprites/swing-${i}.svg`),
  ...range(8, (i) => `steve-sprites/hurt-${i}.svg`),
  ...range(12, (i) => `steve-sprites/death-${i}.svg`),
  ...range(8, (i) => `zombie-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `skeleton-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `spider-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `enderman-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `creeper-sprites/walk-${i * 2}.svg`),
  ...range(10, (i) => `creeper-sprites/swell-${i * 2}.svg`),
  ...range(8, (i) => `pig-sprites/walk-${i * 2}.svg`),
  ...range(8, (i) => `cow-sprites/walk-${i * 2}.svg`),
  ...Object.keys(ITEM_LABELS).map((id) => `items/${id}.svg`),
  "hud/heart.svg",
  "hud/heart-half.svg",
  "hud/heart-empty.svg",
  "hud/hunger-full.svg",
  "hud/hunger-half.svg",
  "hud/hunger-empty.svg",
  "hud/armor-full.svg",
  "hud/armor-half.svg",
  "hud/armor-empty.svg",
  "hud/hotbar.svg",
  "hud/selected-slot.svg",
  "hud/hotbar-slot.svg",
  "hud/xp-bar.svg",
  "hud/crosshair.svg",
];

export function listGameAssets() {
  return MANIFEST.map(asset);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

async function loadAll() {
  let done = 0;
  await Promise.all(
    MANIFEST.map(async (rel) => {
      const src = asset(rel);
      const img = await loadImage(src);
      images.set(rel, img);
      done += 1;
      loadStatus.textContent = `正在载入素材… ${done}/${MANIFEST.length}`;
    }),
  );
}

function img(rel) {
  return images.get(rel);
}

function setCell(tiles, x, y, t) {
  if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) tiles[y][x] = t;
}

function fillRow(tiles, y, x0, x1, t) {
  for (let x = x0; x <= x1; x++) setCell(tiles, x, y, t);
}

function tree(tiles, x, ground) {
  setCell(tiles, x, ground - 1, "o");
  setCell(tiles, x, ground - 2, "o");
  setCell(tiles, x, ground - 3, "o");
  for (let dy = 4; dy <= 6; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + (6 - dy) < 4) setCell(tiles, x + dx, ground - dy, "L");
    }
  }
}

function buildWorld() {
  const W = 78;
  const H = 16;
  const tiles = Array.from({ length: H }, () => Array(W).fill("."));
  const ground = 10;

  for (let x = 0; x < W; x++) {
    setCell(tiles, x, H - 1, "B");
    for (let y = ground + 1; y < H - 1; y++) setCell(tiles, x, y, y > ground + 2 ? "s" : "d");
    setCell(tiles, x, ground, "g");
  }

  fillRow(tiles, ground, 14, 17, ".");
  fillRow(tiles, ground + 1, 14, 17, "w");
  fillRow(tiles, ground + 2, 14, 17, "w");
  fillRow(tiles, ground + 3, 14, 17, "s");

  fillRow(tiles, ground, 32, 35, ".");
  fillRow(tiles, ground + 1, 32, 35, "v");
  fillRow(tiles, ground + 2, 32, 35, "v");
  fillRow(tiles, ground + 3, 32, 35, "s");

  fillRow(tiles, ground - 2, 22, 26, "p");
  fillRow(tiles, ground - 2, 40, 44, "p");
  fillRow(tiles, ground - 4, 41, 43, "p");
  setCell(tiles, 43, ground - 5, "t");
  setCell(tiles, 26, ground - 3, "t");
  setCell(tiles, 14, ground, "h");
  setCell(tiles, 17, ground, "h");
  setCell(tiles, 32, ground, "h");
  setCell(tiles, 35, ground, "h");

  tree(tiles, 8, ground);
  tree(tiles, 48, ground);

  fillRow(tiles, ground, 2, 4, "n");
  setCell(tiles, 6, ground - 1, "u");
  setCell(tiles, 9, ground - 1, "u");
  setCell(tiles, 13, ground, "I");
  setCell(tiles, 18, ground, "I");
  setCell(tiles, 15, ground + 3, "q");
  setCell(tiles, 47, ground - 1, "e");
  setCell(tiles, 49, ground - 1, "u");
  setCell(tiles, 60, ground - 1, "y");
  setCell(tiles, 61, ground - 1, "y");
  setCell(tiles, 60, ground - 2, "y");

  setCell(tiles, 11, ground - 1, "f");
  setCell(tiles, 12, ground - 1, "G");
  setCell(tiles, 20, ground - 1, "P");
  setCell(tiles, 29, ground - 1, "k");
  setCell(tiles, 38, ground - 1, "k");

  setCell(tiles, 19, ground + 3, "x");
  setCell(tiles, 36, ground + 3, "i");
  setCell(tiles, 54, ground + 3, "x");

  fillRow(tiles, ground, 62, 70, "p");
  for (let y = ground - 3; y < ground; y++) {
    setCell(tiles, 62, y, "p");
    setCell(tiles, 70, y, "p");
  }
  fillRow(tiles, ground - 4, 62, 70, "p");
  setCell(tiles, 62, ground - 2, "j");
  setCell(tiles, 70, ground - 2, "j");
  setCell(tiles, 63, ground - 1, "F");
  setCell(tiles, 64, ground - 1, "T");
  setCell(tiles, 65, ground - 1, "D");
  setCell(tiles, 68, ground - 1, "C");
  setCell(tiles, 66, ground - 2, "t");
  setCell(tiles, 69, ground - 5, "t");

  fillRow(tiles, ground, 71, W - 1, "m");
  setCell(tiles, 0, ground, "B");
  setCell(tiles, W - 1, ground, "B");

  return { w: W, h: H, tiles, ground };
}

function tileAt(px, py) {
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  if (y < 0 || y >= world.h || x < 0 || x >= world.w) return "B";
  return world.tiles[y][x];
}

function solidAt(px, py) {
  return SOLID.has(tileAt(px, py));
}

function rectHitsSolid(x, y, w, h) {
  const x0 = Math.floor(x / TILE);
  const x1 = Math.floor((x + w - 1) / TILE);
  const y0 = Math.floor(y / TILE);
  const y1 = Math.floor((y + h - 1) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = tx < 0 || tx >= world.w || ty < 0 || ty >= world.h ? "B" : world.tiles[ty][tx];
      if (SOLID.has(t)) return true;
    }
  }
  return false;
}

function unstick(body) {
  if (!rectHitsSolid(body.x - body.hw, body.y - body.hh, body.hw * 2, body.hh)) return;
  for (const dx of [6, -6, 12, -12, 20, -20]) {
    if (!rectHitsSolid(body.x - body.hw + dx, body.y - body.hh, body.hw * 2, body.hh)) {
      body.x += dx;
      return;
    }
  }
}

function moveBody(body, dt) {
  unstick(body);
  const prevVy = body.vy;
  body.vy = Math.min(MAX_FALL, body.vy + GRAVITY * dt);

  const nx = body.x + body.vx * dt;
  if (rectHitsSolid(nx - body.hw, body.y - body.hh, body.hw * 2, body.hh)) body.vx = 0;
  else body.x = nx;

  const ny = body.y + body.vy * dt;
  if (rectHitsSolid(body.x - body.hw, ny - body.hh, body.hw * 2, body.hh)) {
    if (body.vy > 0) {
      body.y = Math.floor(ny / TILE) * TILE;
      body.grounded = true;
      if (prevVy > 860 && body === player) hurt(player, 2, Math.sign(body.vx) || -1);
    } else {
      body.y = Math.ceil((ny - body.hh) / TILE) * TILE + body.hh + 0.05;
      body.grounded = false;
    }
    body.vy = 0;
  } else {
    body.y = ny;
    body.grounded = false;
  }

  const mid = tileAt(body.x, body.y - 2);
  const chest = tileAt(body.x, body.y - 8);
  body.inWater = mid === "w" || tileAt(body.x, body.y - 16) === "w";
  body.inLava = mid === "v" || tileAt(body.x, body.y - 16) === "v";
  body.atChest = chest === "C" || tileAt(body.x + 16, body.y - 8) === "C" || tileAt(body.x - 16, body.y - 8) === "C";
  if (body.inWater) {
    body.vy = Math.min(body.vy, 160);
    body.vx *= 0.88;
  }
}

function makePlayer() {
  return {
    x: TILE * 3.5,
    y: TILE * 10,
    vx: 0,
    vy: 0,
    hw: 10,
    hh: 46,
    face: 1,
    grounded: false,
    health: 20,
    hunger: 18,
    invuln: 0,
    anim: "idle",
    frame: 0,
    age: 0,
    swingT: 0,
    hurtT: 0,
    dead: false,
    inWater: false,
    inLava: false,
    armor: 0,
    selected: 0,
    items: [
      { id: "diamond-sword", count: 1 },
      { id: "diamond-pickaxe", count: 1 },
      { id: "torch", count: 8 },
      { id: "bread", count: 6 },
      { id: "steak", count: 2 },
      { id: "apple", count: 3 },
      { id: "golden-apple", count: 1 },
      { id: "potion-heal", count: 1 },
      { id: "diamond", count: 0 },
    ],
  };
}

function makeMob(kind, tx, ty) {
  const specs = {
    zombie: { hp: 8, speed: 70, dmg: 2, hw: 12, hh: 50, scale: 0.17, sheet: "zombie-sprites", h: 520 },
    skeleton: { hp: 6, speed: 90, dmg: 1, hw: 11, hh: 50, scale: 0.17, sheet: "skeleton-sprites", h: 520 },
    spider: { hp: 6, speed: 130, dmg: 1, hw: 18, hh: 28, scale: 0.14, sheet: "spider-sprites", h: 400 },
    enderman: { hp: 12, speed: 100, dmg: 3, hw: 10, hh: 70, scale: 0.16, sheet: "enderman-sprites", h: 640 },
    creeper: { hp: 10, speed: 75, dmg: 8, hw: 12, hh: 44, scale: 0.18, sheet: "creeper-sprites", h: 480 },
    pig: { hp: 6, speed: 55, dmg: 0, hw: 14, hh: 28, scale: 0.16, sheet: "pig-sprites", h: 480, passive: true },
    cow: { hp: 8, speed: 50, dmg: 0, hw: 16, hh: 40, scale: 0.17, sheet: "cow-sprites", h: 480, passive: true },
  };
  return {
    kind,
    ...specs[kind],
    x: tx * TILE + TILE / 2,
    y: ty * TILE,
    vx: 0,
    vy: 0,
    face: -1,
    grounded: false,
    health: specs[kind].hp,
    age: Math.random(),
    hitT: 0,
    dead: false,
    inWater: false,
    inLava: false,
    fuse: 0,
    hurtFlee: 0,
  };
}

function makeDrop(id, x, y, count = 1) {
  return { id, x, y, vy: -180, count, bob: Math.random() * Math.PI * 2, gone: false };
}

function resetGame() {
  world = buildWorld();
  player = makePlayer();
  mobs = [
    makeMob("pig", 7, 10),
    makeMob("pig", 10, 10),
    makeMob("zombie", 18, 10),
    makeMob("skeleton", 27, 10),
    makeMob("creeper", 33, 10),
    makeMob("spider", 43, 10),
    makeMob("cow", 51, 10),
    makeMob("cow", 54, 10),
    makeMob("enderman", 56, 10),
    makeMob("zombie", 50, 10),
  ];
  drops = [
    makeDrop("diamond", TILE * 13.5, TILE * 9),
    makeDrop("diamond", TILE * 24, TILE * 7.5),
    makeDrop("diamond", TILE * 42, TILE * 5.5),
    makeDrop("apple", TILE * 21, TILE * 9),
    makeDrop("bread", TILE * 39, TILE * 9),
    makeDrop("iron-chestplate", TILE * 67, TILE * 9),
  ];
  particles = [];
  cam = { x: 0, y: 0 };
  time = 0;
  win = false;
  demo = null;
  hold.left = hold.right = hold.jump = hold.use = false;
  message = "向东走。挥剑清怪，捡齐 5 颗钻石。";
  messageT = 4;
}

function selectedItem() {
  return player.items[player.selected];
}

function addItem(id, count) {
  if (id === "iron-chestplate") {
    player.armor = Math.min(20, player.armor + 8);
  }
  const stack = player.items.find((it) => it.id === id);
  if (stack) stack.count += count;
  else {
    const empty = player.items.find((it) => it.count <= 0);
    if (empty) {
      empty.id = id;
      empty.count = count;
    }
  }
}

function diamonds() {
  return player.items.find((it) => it.id === "diamond")?.count ?? 0;
}

function say(text, secs = 2.4) {
  message = text;
  messageT = secs;
}

function hurt(who, amount, dir) {
  if (who.dead) return;
  if (who === player) {
    if (player.invuln > 0) return;
    const soaked = Math.min(amount - 1, Math.floor(player.armor / 4));
    const taken = Math.max(1, amount - soaked);
    player.health = Math.max(0, player.health - taken);
    player.invuln = 0.9;
    player.hurtT = 8 / 12;
    player.vx = dir * 220;
    player.vy = -220;
    if (player.health <= 0) {
      player.dead = true;
      player.anim = "death";
      player.frame = 0;
      player.age = 0;
      say("你死了。按 R 重来。", 8);
    }
    return;
  }
  who.health -= amount;
  who.hitT = 0.18;
  who.vx = dir * 260;
  who.vy = -160;
  if (who.passive) who.hurtFlee = 1.6;
  if (who.health <= 0) {
    who.dead = true;
    const loot = {
      zombie: "rotten-flesh",
      skeleton: "bone",
      spider: "string",
      creeper: "gunpowder",
      enderman: "ender-pearl",
      pig: "cooked-porkchop",
      cow: "steak",
    };
    drops.push(makeDrop(loot[who.kind] ?? "apple", who.x, who.y - 20));
    if (who.kind === "enderman" || Math.random() < 0.25) drops.push(makeDrop("diamond", who.x + 8, who.y - 24));
  }
}

function useSelected() {
  if (player.dead || win) return;
  const item = selectedItem();
  if (!item || item.count <= 0) return;
  if (item.id === "diamond-sword") {
    if (player.swingT > 0) return;
    player.swingT = 10 / 12;
    player.anim = "swing";
    player.frame = 0;
    player.age = 0;
    return;
  }
  const food = FOOD[item.id];
  if (food) {
    if (player.health >= 20 && player.hunger >= 20) {
      say("已经吃饱了。");
      return;
    }
    player.health = Math.min(20, Math.max(0, player.health + food.health));
    player.hunger = Math.min(20, player.hunger + food.hunger);
    item.count -= 1;
    say(`使用了${ITEM_LABELS[item.id]}`);
  }
}

function swingHit() {
  const t = 1 - player.swingT / (10 / 12);
  if (t < 0.28 || t > 0.72) return;
  const reach = 46;
  const x = player.x + player.face * 18;
  for (const mob of mobs) {
    if (mob.dead || mob.hitT > 0) continue;
    if (Math.abs(mob.x - x) < reach + mob.hw && Math.abs(mob.y - player.y) < player.hh + 8) {
      hurt(mob, 3, player.face);
    }
  }
}

function updatePlayer(dt) {
  if (player.dead) {
    player.age += dt;
    player.frame = Math.min(11, Math.floor(player.age * 10));
    return;
  }

  const left = keys.has("a") || keys.has("arrowleft") || hold.left;
  const right = keys.has("d") || keys.has("arrowright") || hold.right;
  const jump = keys.has(" ") || keys.has("w") || keys.has("arrowup") || hold.jump;
  const speed = player.inWater ? MOVE * 0.55 : MOVE;

  if (player.swingT <= 0) {
    player.vx = (right ? speed : 0) - (left ? speed : 0);
    if (left) player.face = -1;
    if (right) player.face = 1;
  } else {
    player.vx *= 0.85;
  }

  const onLadder = tileAt(player.x, player.y - 8) === "h" || tileAt(player.x, player.y - 24) === "h";
  if (jump && (player.grounded || player.inWater || onLadder)) {
    player.vy = player.inWater || onLadder ? -420 : -JUMP;
    player.grounded = false;
  }

  moveBody(player, dt);

  if (player.inLava) hurt(player, 3, -player.face);
  if (tileAt(player.x, player.y - 8) === "k") hurt(player, 1, -player.face);

  if (player.swingT > 0) {
    player.swingT -= dt;
    swingHit();
    if (player.swingT <= 0) player.anim = "idle";
  }
  if (player.hurtT > 0) player.hurtT -= dt;
  if (player.invuln > 0) player.invuln -= dt;

  player.age += dt;
  if (player.swingT > 0) {
    player.anim = "swing";
    player.frame = Math.min(9, Math.floor((1 - player.swingT / (10 / 12)) * 10));
  } else if (player.hurtT > 0) {
    player.anim = "hurt";
    player.frame = Math.min(7, Math.floor((1 - player.hurtT / (8 / 12)) * 8));
  } else if (!player.grounded) {
    player.anim = "jump";
    player.frame = player.vy < -80 ? 1 : player.vy > 120 ? 3 : 2;
  } else if (Math.abs(player.vx) > 20) {
    player.anim = "run";
    player.frame = Math.floor(player.age * 12) % 8;
  } else {
    player.anim = "idle";
    player.frame = Math.floor(player.age * 6) % 2;
  }

  if (player.atChest && !win) {
    if (diamonds() >= GOAL_DIAMONDS) {
      win = true;
      say("箱子打开了。试玩通关！", 10);
    } else {
      say(`还差 ${GOAL_DIAMONDS - diamonds()} 颗钻石。`);
    }
  }
}

function updateMobs(dt) {
  for (const mob of mobs) {
    if (mob.dead) continue;
    mob.age += dt;
    if (mob.hitT > 0) mob.hitT -= dt;
    const dx = player.x - mob.x;
    const close = !player.dead && Math.abs(dx) < 420;
    if (mob.passive) {
      if (mob.hurtFlee > 0) {
        mob.hurtFlee -= dt;
        mob.face = Math.sign(mob.x - player.x) || mob.face;
        mob.vx = mob.face * mob.speed * 1.6;
      } else if (mob.grounded && Math.random() < 0.012) {
        mob.face = Math.random() < 0.5 ? -1 : 1;
        mob.vx = mob.face * mob.speed * (0.35 + Math.random() * 0.45);
      } else if (Math.random() < 0.01) {
        mob.vx = 0;
      }
      moveBody(mob, dt);
      if (mob.inLava) hurt(mob, 4, -mob.face);
      continue;
    }
    if (mob.kind === "creeper" && close && Math.abs(dx) < 72 && Math.abs(mob.y - player.y) < 56) {
      mob.face = Math.sign(dx) || mob.face;
      mob.vx = 0;
      mob.fuse += dt;
      if (mob.fuse >= 1.35) {
        hurt(player, 10, Math.sign(player.x - mob.x) || -1);
        mob.dead = true;
        drops.push(makeDrop("gunpowder", mob.x, mob.y - 20));
        say("苦力怕爆炸了！");
        continue;
      }
    } else {
      if (mob.kind === "creeper") mob.fuse = Math.max(0, mob.fuse - dt * 1.8);
      if (close) {
        mob.face = Math.sign(dx) || mob.face;
        mob.vx = mob.face * mob.speed;
        if (mob.kind === "spider" && mob.grounded && Math.abs(dx) < 90 && Math.random() < 0.02) mob.vy = -520;
      } else {
        mob.vx *= 0.8;
      }
    }
    moveBody(mob, dt);
    if (mob.inLava) hurt(mob, 4, -mob.face);
    if (mob.kind !== "creeper" && !player.dead && Math.abs(mob.x - player.x) < mob.hw + player.hw + 4 && Math.abs(mob.y - player.y) < mob.hh) {
      hurt(player, mob.dmg, Math.sign(player.x - mob.x) || -1);
    }
  }
}

function updateDrops(dt) {
  for (const drop of drops) {
    if (drop.gone) continue;
    drop.vy = Math.min(420, drop.vy + 1400 * dt);
    drop.y += drop.vy * dt;
    if (solidAt(drop.x, drop.y + 8)) {
      drop.y = Math.floor((drop.y + 8) / TILE) * TILE - 8;
      drop.vy = 0;
    }
    drop.bob += dt * 3;
    if (!player.dead && Math.hypot(drop.x - player.x, drop.y - (player.y - 20)) < 28) {
      addItem(drop.id, drop.count);
      drop.gone = true;
      say(`捡到 ${ITEM_LABELS[drop.id] ?? drop.id}`);
    }
  }
}

function updateCamera() {
  const targetX = player.x - viewW * 0.38;
  const targetY = player.y - viewH * 0.68;
  cam.x += (targetX - cam.x) * 0.12;
  cam.y += (targetY - cam.y) * 0.1;
  const maxX = world.w * TILE - viewW;
  const maxY = world.h * TILE - viewH;
  cam.x = Math.max(0, Math.min(maxX, cam.x));
  cam.y = Math.max(0, Math.min(Math.max(0, maxY), cam.y));
}

function drawImage(rel, x, y, w, h) {
  const pic = img(rel);
  if (!pic) return;
  ctx.drawImage(pic, x, y, w, h);
}

function drawAnchored(rel, spec, x, y, face) {
  const pic = img(rel);
  if (!pic) return;
  const dw = spec.w * spec.scale;
  const dh = spec.h * spec.scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);
  ctx.drawImage(pic, -spec.ax * spec.scale, -spec.ay * spec.scale, dw, dh);
  ctx.restore();
}

function steveFrame() {
  if (player.anim === "idle") return `steve-sprites/${player.frame === 0 ? "idle-a" : "idle-b"}.svg`;
  if (player.anim === "run") return `steve-sprites/run-${player.frame}.svg`;
  if (player.anim === "jump") return `steve-sprites/${["jump-crouch", "jump-rise", "jump-apex", "jump-fall", "jump-land"][player.frame]}.svg`;
  if (player.anim === "swing") return `steve-sprites/swing-${player.frame}.svg`;
  if (player.anim === "hurt") return `steve-sprites/hurt-${player.frame}.svg`;
  return `steve-sprites/death-${player.frame}.svg`;
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, viewH);
  g.addColorStop(0, "#8ec5ff");
  g.addColorStop(0.55, "#c7e4ff");
  g.addColorStop(1, "#e7f4c8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, viewW, viewH);
}

function drawWorld() {
  const x0 = Math.max(0, Math.floor(cam.x / TILE) - 1);
  const x1 = Math.min(world.w - 1, Math.ceil((cam.x + viewW) / TILE) + 1);
  const y0 = Math.max(0, Math.floor(cam.y / TILE) - 1);
  const y1 = Math.min(world.h - 1, Math.ceil((cam.y + viewH) / TILE) + 1);
  const lavaFrame = `lava-sprites/boil-${Math.floor(time * 8) % 8 * 4}.svg`;

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const t = world.tiles[y][x];
      if (t === ".") continue;
      const dx = x * TILE - cam.x;
      const dy = y * TILE - cam.y;
      if (t === "v") drawImage(lavaFrame, dx, dy, TILE, TILE);
      else if (BLOCKS[t]) drawImage(BLOCKS[t], dx, dy, TILE, TILE);
    }
  }
}

function drawDrops() {
  for (const drop of drops) {
    if (drop.gone) continue;
    const bob = Math.sin(drop.bob) * 4;
    drawImage(`items/${drop.id}.svg`, drop.x - 14 - cam.x, drop.y - 14 + bob - cam.y, 28, 28);
  }
}

function drawMobs() {
  for (const mob of mobs) {
    if (mob.dead) continue;
    let rel;
    if (mob.kind === "creeper" && mob.fuse > 0.12) {
      const frame = Math.min(18, Math.floor((mob.fuse / 1.35) * 10) * 2);
      rel = `creeper-sprites/swell-${frame}.svg`;
    } else {
      const frame = Math.floor(mob.age * 10) % 8;
      rel = `${mob.sheet}/walk-${frame * 2}.svg`;
    }
    const spec = { w: 512, h: mob.h, ax: 256, ay: mob.h - 16, scale: mob.scale };
    if (mob.hitT > 0 || (mob.kind === "creeper" && mob.fuse > 0.4 && Math.floor(time * 16) % 2 === 0)) ctx.filter = "brightness(2)";
    drawAnchored(rel, spec, mob.x - cam.x, mob.y - cam.y, mob.face);
    ctx.filter = "none";
  }
}

function drawPlayer() {
  if (player.invuln > 0 && Math.floor(time * 16) % 2 === 0 && !player.dead) ctx.globalAlpha = 0.45;
  const combat = player.anim === "swing" || player.anim === "hurt" || player.anim === "death";
  drawAnchored(steveFrame(), combat ? STEVE.combat : STEVE.loco, player.x - cam.x, player.y - cam.y, player.face);
  ctx.globalAlpha = 1;
}

function drawHearts(x, y, value, full, half, empty) {
  for (let i = 0; i < 10; i++) {
    const v = value - i * 2;
    const rel = v >= 2 ? full : v === 1 ? half : empty;
    drawImage(rel, x + i * 18, y, 16, 16);
  }
}

function drawHud() {
  const barW = 364;
  const barX = (viewW - barW) / 2;
  const barY = viewH - 86;
  drawHearts(barX + 8, barY - 28, player.health, "hud/heart.svg", "hud/heart-half.svg", "hud/heart-empty.svg");
  drawHearts(barX + barW - 8 - 180, barY - 28, player.hunger, "hud/hunger-full.svg", "hud/hunger-half.svg", "hud/hunger-empty.svg");
  if (player.armor > 0) {
    drawHearts(barX + 8, barY - 48, player.armor, "hud/armor-full.svg", "hud/armor-half.svg", "hud/armor-empty.svg");
  }

  drawImage("hud/xp-bar.svg", barX, barY - 8, barW, 28);
  const progress = Math.min(1, diamonds() / GOAL_DIAMONDS);
  ctx.fillStyle = "#7cf37c";
  ctx.fillRect(barX + 28, barY + 4, (barW - 56) * progress, 6);

  drawImage("hud/hotbar.svg", barX, barY + 10, barW, 72);
  const slot = 36;
  const origin = barX + 22;
  for (let i = 0; i < 9; i++) {
    const it = player.items[i];
    const sx = origin + i * 38;
    const sy = barY + 26;
    if (it && it.count > 0) drawImage(`items/${it.id}.svg`, sx, sy, 28, 28);
    if (it && it.count > 1) {
      ctx.fillStyle = "#111";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(it.count), sx + 29, sy + 29);
      ctx.fillStyle = "#fff";
      ctx.fillText(String(it.count), sx + 28, sy + 28);
    }
  }
  drawImage("hud/selected-slot.svg", origin + player.selected * 38 - 8, barY + 18, slot + 8, slot + 8);

  const label = ITEM_LABELS[selectedItem()?.id] ?? "";
  if (label && selectedItem()?.count > 0) {
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(16,16,16,0.72)";
    const tw = ctx.measureText(label).width + 24;
    ctx.fillRect(viewW / 2 - tw / 2, barY - 58, tw, 26);
    ctx.fillStyle = "#ffe566";
    ctx.fillText(label, viewW / 2, barY - 40);
  }

  drawImage("hud/crosshair.svg", viewW / 2 - 10, viewH / 2 - 10, 20, 20);

  ctx.textAlign = "left";
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(`钻石 ${diamonds()} / ${GOAL_DIAMONDS}`, 16, 28);
  if (messageT > 0) {
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(viewW / 2 - 220, 40, 440, 32);
    ctx.fillStyle = "#fff";
    ctx.fillText(message, viewW / 2, 62);
  }
  if (player.dead || win) {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.textAlign = "center";
    ctx.fillStyle = win ? "#ffe566" : "#ff6b6b";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText(win ? "试玩通关" : "你死了", viewW / 2, viewH / 2 - 10);
    ctx.fillStyle = "#fff";
    ctx.font = "18px sans-serif";
    ctx.fillText("按 R 重新开始", viewW / 2, viewH / 2 + 28);
  }
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  viewW = Math.max(640, canvas.clientWidth);
  viewH = Math.max(360, canvas.clientHeight);
  canvas.width = Math.floor(viewW * dpr);
  canvas.height = Math.floor(viewH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function frame(ts) {
  const dt = Math.min(0.033, (ts - last) / 1000 || 0.016);
  last = ts;
  if (mode === "play") {
    time += dt;
    if (messageT > 0) messageT -= dt;
    updateDemo(dt);
    updatePlayer(dt);
    updateMobs(dt);
    updateDrops(dt);
    updateCamera();
  }
  drawSky();
  if (world) {
    drawWorld();
    drawDrops();
    drawMobs();
    drawPlayer();
    drawHud();
  }
  requestAnimationFrame(frame);
}

const CODE_KEYS = {
  KeyA: "a",
  KeyD: "d",
  KeyW: "w",
  KeyJ: "j",
  KeyE: "e",
  KeyR: "r",
  Space: " ",
  ArrowLeft: "arrowleft",
  ArrowRight: "arrowright",
  ArrowUp: "arrowup",
};

function bindKey(e) {
  if (CODE_KEYS[e.code]) return CODE_KEYS[e.code];
  const key = e.key.toLowerCase();
  if (key === "right") return "arrowright";
  if (key === "left") return "arrowleft";
  return key;
}

function pulse(t, a, b) {
  return t >= a && t < b;
}

function updateDemo(dt) {
  if (!demo) return;
  demo.t += dt;
  const t = demo.t;
  hold.right = t < 9;
  hold.left = false;
  hold.jump = pulse(t, 1.15, 1.35) || pulse(t, 3.1, 3.3) || pulse(t, 5.4, 5.6);
  if (pulse(t, 2.2, 2.28) || pulse(t, 4.4, 4.48) || pulse(t, 6.2, 6.28) || pulse(t, 7.1, 7.18)) {
    useSelected();
  }
  if (t > 12) {
    demo = null;
    hold.right = hold.jump = false;
    say("可以接着自己玩，或按 R 重来。", 4);
  }
}

function startGame(asDemo = false) {
  resetGame();
  mode = "play";
  overlay.hidden = true;
  document.getElementById("hud-layer").hidden = false;
  startBtn.blur();
  demoBtn.blur();
  canvas.focus();
  if (asDemo) {
    demo = { t: 0 };
    say("自动演示：向东走、跳跃、挥剑。", 3);
  }
}

window.addEventListener("keydown", (e) => {
  const key = bindKey(e);
  keys.add(key);
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) e.preventDefault();
  if (e.code.startsWith("Digit")) {
    const n = Number(e.code.slice(5));
    if (n >= 1 && n <= 9 && player) player.selected = n - 1;
  } else if (key >= "1" && key <= "9" && player) {
    player.selected = Number(key) - 1;
  }
  if (key === "j" || key === "e") useSelected();
  if (key === "r" && mode === "play") resetGame();
});

window.addEventListener("keyup", (e) => {
  keys.delete(bindKey(e));
});

window.addEventListener("blur", () => keys.clear());

canvas.addEventListener("mousedown", (e) => {
  if (mode !== "play") return;
  if (e.button === 0) useSelected();
});

window.addEventListener("resize", resize);

for (const btn of document.querySelectorAll("#touch button")) {
  const press = (on) => {
    const dir = btn.dataset.dir;
    const act = btn.dataset.act;
    if (dir) hold[dir] = on;
    if (act === "jump") hold.jump = on;
    if (act === "use" && on) useSelected();
  };
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    press(true);
  });
  btn.addEventListener("pointerup", () => press(false));
  btn.addEventListener("pointerleave", () => press(false));
}

startBtn.addEventListener("click", () => startGame(false));
demoBtn.addEventListener("click", () => startGame(true));

resize();
requestAnimationFrame(frame);

loadAll()
  .then(() => {
    loadStatus.textContent = "素材已就绪。";
    startBtn.disabled = false;
    demoBtn.disabled = false;
  })
  .catch((err) => {
    loadStatus.textContent = err.message;
    startBtn.disabled = true;
    demoBtn.disabled = true;
  });

startBtn.disabled = true;
demoBtn.disabled = true;
