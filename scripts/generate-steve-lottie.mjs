// Builds Skottie scenes from posed cuboids as vector shape layers
// (Skottie leaves SVG image assets blank):
//
//   public/projects/steve/scene-1              looping reel (idle → run → jump)
//   public/projects/steve/scene-2              side-view run
//   public/projects/steve-platformer/scene-1   idle
//   public/projects/steve-platformer/scene-2   run
//   public/projects/steve-platformer/scene-3   jump
//   public/projects/steve-platformer/scene-4   sword swing
//   public/projects/steve-platformer/scene-5   hurt flash
//   public/projects/steve-platformer/scene-6   death
//
// Every scene uses the same right-facing side camera.
//
// Transparent background — these are character loops, not a full-frame card.
//
// Usage:
//   node scripts/generate-steve-lottie.mjs [--skin=<png>]
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildFigure, figureToLottieShapes, loadSkin, makeProjector, parseArgs } from "./lib/steve-model.mjs";
import { swordExtra } from "./lib/held-item.mjs";
import {
  COMBAT_SPRITE,
  DEATH_FRAMES,
  HURT_FRAMES,
  SPRITE,
  SWING_FRAMES,
  TOLERANCE,
  catalog,
  demoReel,
  sampleDeath,
  sampleHurt,
  sampleIdle,
  sampleJump,
  sampleSwing,
  runFrame,
} from "./lib/steve-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function shapeLayer({ ind, name, ip, op, shapes }) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [0, 0, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes,
    ip,
    op,
    st: ip,
    bm: 0,
  };
}

function flipbook({ name, w, h, frames, fps, hold, loop }) {
  const op = frames.length * hold;
  const layers = frames.map((frame, i) =>
    shapeLayer({
      ind: frames.length - i,
      name: frame.id,
      ip: i * hold,
      op: (i + 1) * hold,
      shapes: frame.shapes,
    }),
  );
  return {
    v: "5.7.0",
    fr: fps,
    ip: 0,
    op,
    w,
    h,
    nm: name,
    ddd: 0,
    assets: [],
    layers,
    meta: { loop, g: "scripts/generate-steve-lottie.mjs" },
  };
}

function bake(skin, pose, canvas, extras) {
  const { parts } = buildFigure({ skin, pose, tolerance: TOLERANCE, extras });
  const project = makeProjector({
    scale: canvas.scale,
    originX: canvas.originX,
    originY: canvas.originY,
    roll: pose.roll ?? canvas.roll ?? 0,
  });
  return figureToLottieShapes(parts, project);
}

async function writeScene(dir, lottie) {
  await mkdir(dir, { recursive: true });
  for (const name of await readdir(dir).catch(() => [])) {
    if (name.endsWith(".svg")) await rm(resolve(dir, name));
  }
  await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie) + "\n");
  const kb = (Buffer.byteLength(JSON.stringify(lottie)) / 1024).toFixed(1);
  console.log(
    `${dir.replace(ROOT + "/", "")}  ${lottie.nm}  ${lottie.layers.length} poses  ${lottie.op} ticks @ ${lottie.fr} fps  ${kb} kB`,
  );
}

const args = parseArgs(process.argv.slice(2));
const skin = await loadSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 64) throw new Error("expected a 64x64 skin");

const spriteCache = new Map();
function spriteShapes(pose, id) {
  const key = id ?? JSON.stringify(pose);
  if (!spriteCache.has(key)) spriteCache.set(key, { id: key, shapes: bake(skin, pose, SPRITE) });
  return spriteCache.get(key);
}

for (const entry of catalog().filter((e) => !e.tags.includes("combat"))) spriteShapes(entry.pose, entry.id);

const platformer = resolve(ROOT, "public/projects/steve-platformer");
const idleFrames = Array.from({ length: 8 }, (_, i) => ({
  id: `idle-${i}`,
  shapes: spriteShapes(sampleIdle(i / 8), `idle-s-${i}`).shapes,
}));
const runFrames = Array.from({ length: 16 }, (_, i) => ({
  id: `run-${i}`,
  shapes: spriteShapes(runFrame(i / 16), `run-s-${i}`).shapes,
}));
const jumpFrames = Array.from({ length: 14 }, (_, i) => ({
  id: `jump-${i}`,
  shapes: spriteShapes(sampleJump(i / 13), `jump-s-${i}`).shapes,
}));

await writeScene(
  resolve(platformer, "scene-1"),
  flipbook({
    name: "Steve — Idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: idleFrames,
    fps: 12,
    hold: 1,
    loop: true,
  }),
);
await writeScene(
  resolve(platformer, "scene-2"),
  flipbook({
    name: "Steve — Run",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: runFrames,
    fps: 24,
    hold: 1,
    loop: true,
  }),
);
await writeScene(
  resolve(platformer, "scene-3"),
  flipbook({
    name: "Steve — Jump",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: jumpFrames,
    fps: 24,
    hold: 1,
    loop: true,
  }),
);

const demo = resolve(ROOT, "public/projects/steve");
const demoCanvas = {
  w: 512,
  h: 640,
  scale: SPRITE.scale * 2,
  originX: SPRITE.originX * 2,
  originY: SPRITE.originY * 2,
};
const reel = demoReel().map((frame) => ({
  id: frame.id,
  shapes: bake(skin, frame.pose, demoCanvas),
}));
await writeScene(
  resolve(demo, "scene-1"),
  flipbook({
    name: "Steve — Idle, run, jump",
    w: demoCanvas.w,
    h: demoCanvas.h,
    frames: reel,
    fps: 24,
    hold: 1,
    loop: true,
  }),
);

const sideRun = Array.from({ length: 16 }, (_, i) => ({
  id: `side-run-${i}`,
  shapes: bake(skin, runFrame(i / 16), demoCanvas),
}));
await writeScene(
  resolve(demo, "scene-2"),
  flipbook({
    name: "Steve — Run",
    w: demoCanvas.w,
    h: demoCanvas.h,
    frames: sideRun,
    fps: 24,
    hold: 1,
    loop: true,
  }),
);

const heldSword = await swordExtra();
const swingFrames = Array.from({ length: SWING_FRAMES }, (_, i) => ({
  id: `swing-${i}`,
  shapes: bake(skin, sampleSwing(i / (SWING_FRAMES - 1)), COMBAT_SPRITE, [heldSword]),
}));
const hurtFrames = Array.from({ length: HURT_FRAMES }, (_, i) => ({
  id: `hurt-${i}`,
  shapes: bake(skin, sampleHurt(i / (HURT_FRAMES - 1)), COMBAT_SPRITE),
}));
const deathFrames = Array.from({ length: DEATH_FRAMES }, (_, i) => ({
  id: `death-${i}`,
  shapes: bake(skin, sampleDeath(i / (DEATH_FRAMES - 1)), COMBAT_SPRITE),
}));

await writeScene(
  resolve(platformer, "scene-4"),
  flipbook({
    name: "Steve — Sword swing",
    w: COMBAT_SPRITE.w,
    h: COMBAT_SPRITE.h,
    frames: swingFrames,
    fps: 12,
    hold: 1,
    loop: true,
  }),
);
await writeScene(
  resolve(platformer, "scene-5"),
  flipbook({
    name: "Steve — Hurt",
    w: COMBAT_SPRITE.w,
    h: COMBAT_SPRITE.h,
    frames: hurtFrames,
    fps: 12,
    hold: 1,
    loop: true,
  }),
);
await writeScene(
  resolve(platformer, "scene-6"),
  flipbook({
    name: "Steve — Death",
    w: COMBAT_SPRITE.w,
    h: COMBAT_SPRITE.h,
    frames: deathFrames,
    fps: 10,
    hold: 1,
    loop: false,
  }),
);
