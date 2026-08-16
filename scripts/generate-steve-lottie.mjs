// Builds Skottie scenes that flip through the side-view sprite frames:
//   public/projects/steve-platformer/scene-1  idle
//   public/projects/steve-platformer/scene-2  run
//   public/projects/steve-platformer/scene-3  jump
//
// Each scene copies the SVG frames it needs next to lottie.json and sequences
// them with layer in/out points. Transparent background — these are game
// sprites, not a full-frame card.
//
// Usage:
//   node scripts/generate-steve-sprites.mjs && node scripts/generate-steve-lottie.mjs
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { ANIMATIONS, SPRITE } from "./lib/steve-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SPRITES = resolve(ROOT, "assets/steve-sprites");
const PROJECT = resolve(ROOT, "public/projects/steve-platformer");

function imageLayer({ ind, name, refId, ip, op, w, h }) {
  return {
    ddd: 0,
    ind,
    ty: 2,
    nm: name,
    refId,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [w / 2, h / 2, 0] },
      a: { a: 0, k: [w / 2, h / 2, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip,
    op,
    st: ip,
    bm: 0,
  };
}

function flipbook({ name, frames, fps, hold, loop }) {
  const { w, h } = SPRITE;
  const op = frames.length * hold;
  const assets = frames.map((id) => ({
    id,
    w,
    h,
    u: "",
    p: `${id}.svg`,
    e: 0,
  }));
  // Later layers draw on top; only one layer is visible at a time, so order
  // only has to stay stable. First frame is the last layer so it is underneath
  // if two in-points ever overlap.
  const layers = frames.map((id, i) =>
    imageLayer({
      ind: frames.length - i,
      name: id,
      refId: id,
      ip: i * hold,
      op: (i + 1) * hold,
      w,
      h,
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
    assets,
    layers,
    meta: { loop, g: "scripts/generate-steve-lottie.mjs" },
  };
}

async function writeScene(slug, title, animation, extraHold = {}) {
  const dir = resolve(PROJECT, slug);
  await mkdir(dir, { recursive: true });
  const hold = extraHold[animation] ?? 1;
  const spec = ANIMATIONS[animation];
  const lottie = flipbook({
    name: title,
    frames: spec.frames,
    fps: spec.fps,
    hold,
    loop: spec.loop,
  });
  for (const id of spec.frames) {
    await copyFile(resolve(SPRITES, `${id}.svg`), resolve(dir, `${id}.svg`));
  }
  await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie, null, 2) + "\n");
  return { slug, title, frames: spec.frames.length, op: lottie.op, fps: lottie.fr };
}

const atlas = JSON.parse(await readFile(resolve(SPRITES, "atlas.json"), "utf8"));
if (!atlas.frames["run-0"]) throw new Error("run sprites first: node scripts/generate-steve-sprites.mjs");

const scenes = [
  await writeScene("scene-1", "Steve — Idle", "idle", { idle: 4 }),
  await writeScene("scene-2", "Steve — Run", "run", { run: 1 }),
  await writeScene("scene-3", "Steve — Jump", "jump", { jump: 3 }),
];

for (const s of scenes) {
  console.log(`${s.slug}  ${s.title}  ${s.frames} frames  ${s.op} ticks @ ${s.fps} fps`);
}
console.log(`Wrote ${PROJECT}`);
