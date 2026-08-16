// Builds Skottie scenes that flip through the side-view poses as vector
// shape layers (not image assets — Skottie leaves SVG files blank):
//   public/projects/steve-platformer/scene-1  idle
//   public/projects/steve-platformer/scene-2  run
//   public/projects/steve-platformer/scene-3  jump
//
// Transparent background — these are game sprites, not a full-frame card.
//
// Usage:
//   node scripts/generate-steve-lottie.mjs [--skin=<png>]
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildFigure, figureToLottieShapes, loadSkin, makeProjector, parseArgs } from "./lib/steve-model.mjs";
import { ANIMATIONS, SPRITE, TOLERANCE, catalog } from "./lib/steve-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(__dirname, "../public/projects/steve-platformer");

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

function flipbook({ name, frames, fps, hold, loop }) {
  const { w, h } = SPRITE;
  const op = frames.length * hold;
  // First layer in the file is on top. Only one frame is visible at a time.
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

const args = parseArgs(process.argv.slice(2));
const skin = await loadSkin(args.get("skin"));
if (skin.width < 64 || skin.height < 64) throw new Error("expected a 64x64 skin");

const project = makeProjector({
  scale: SPRITE.scale,
  originX: SPRITE.originX,
  originY: SPRITE.originY,
});

const baked = new Map();
for (const entry of catalog()) {
  const { parts } = buildFigure({ skin, pose: entry.pose, tolerance: TOLERANCE });
  baked.set(entry.id, { id: entry.id, shapes: figureToLottieShapes(parts, project) });
}

const scenes = [
  { slug: "scene-1", title: "Steve — Idle", animation: "idle", hold: 4 },
  { slug: "scene-2", title: "Steve — Run", animation: "run", hold: 1 },
  { slug: "scene-3", title: "Steve — Jump", animation: "jump", hold: 3 },
];

for (const scene of scenes) {
  const dir = resolve(PROJECT, scene.slug);
  await mkdir(dir, { recursive: true });
  for (const name of await readdir(dir)) {
    if (name.endsWith(".svg")) await rm(resolve(dir, name));
  }
  const spec = ANIMATIONS[scene.animation];
  const lottie = flipbook({
    name: scene.title,
    frames: spec.frames.map((id) => baked.get(id)),
    fps: spec.fps,
    hold: scene.hold,
    loop: spec.loop,
  });
  await writeFile(resolve(dir, "lottie.json"), JSON.stringify(lottie) + "\n");
  const kb = (Buffer.byteLength(JSON.stringify(lottie)) / 1024).toFixed(1);
  console.log(`${scene.slug}  ${scene.title}  ${spec.frames.length} frames  ${lottie.op} ticks @ ${lottie.fr} fps  ${kb} kB`);
}
