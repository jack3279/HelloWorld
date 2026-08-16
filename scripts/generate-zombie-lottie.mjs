// Builds Skottie scenes from the posed zombie cuboids:
//
//   public/projects/zombie/scene-1   side-view idle (head at 45°)
//   public/projects/zombie/scene-2   shambling walk (arms stay forward)
//
// Transparent background — these are character loops, not a full-frame card.
//
// Usage:
//   node scripts/generate-zombie-lottie.mjs [--skin=<png>]
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildFigure, figureToLottieShapes, loadZombieSkin, makeProjector, parseArgs } from "./lib/steve-model.mjs";
import { SPRITE, TOLERANCE, WALK_FRAMES, sampleIdle, walkFrame } from "./lib/zombie-poses.mjs";

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
    meta: { loop, g: "scripts/generate-zombie-lottie.mjs" },
  };
}

function bake(skin, pose, canvas) {
  const { parts } = buildFigure({ skin, pose, tolerance: TOLERANCE });
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
const skin = await loadZombieSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 64) throw new Error("expected a 64x64 skin");

const frames = Array.from({ length: 8 }, (_, i) => ({
  id: `idle-${i}`,
  shapes: bake(skin, sampleIdle(i / 8), SPRITE),
}));

await writeScene(
  resolve(ROOT, "public/projects/zombie/scene-1"),
  flipbook({
    name: "Zombie — Side idle",
    w: SPRITE.w,
    h: SPRITE.h,
    frames,
    fps: 8,
    hold: 1,
    loop: true,
  }),
);

const walk = Array.from({ length: WALK_FRAMES }, (_, i) => ({
  id: `walk-${i}`,
  shapes: bake(skin, walkFrame(i / WALK_FRAMES), SPRITE),
}));

await writeScene(
  resolve(ROOT, "public/projects/zombie/scene-2"),
  flipbook({
    name: "Zombie — Walk",
    w: SPRITE.w,
    h: SPRITE.h,
    frames: walk,
    fps: 10,
    hold: 1,
    loop: true,
  }),
);
