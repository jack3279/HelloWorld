// Shared walk / idle / rest / hurt / death SVG + Skottie writer for cuboid mobs.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./steve-model.mjs";
import { ROOT, bake, flipbook, writeFrames, writeHeroSvg, writeSampledClips, writeScene, writeSpriteKit } from "./mob-pipeline.mjs";

const here = dirname(fileURLToPath(import.meta.url));

export async function runMobGenerator({
  generator,
  name,
  title,
  desc,
  groupId,
  loadSkin,
  minWidth = 64,
  minHeight = 32,
  model,
  poses,
  canvas,
  walkName = "Walk",
  walkFps = 10,
  restName = "Rest",
  restFps = 6,
}) {
  const args = parseArgs(process.argv.slice(2));
  const skin = await loadSkin(args.get("skin"));
  if (skin.width < minWidth || skin.height < minHeight) {
    throw new Error(`expected a ${minWidth}×${minHeight}+ ${name} texture`);
  }
  const {
    DEATH_FRAMES,
    HURT_FRAMES,
    IDLE_FRAMES,
    REST_FRAMES,
    SPRITE,
    TOLERANCE,
    WALK_FRAMES,
    catalog,
    idleA,
    sampleDeath,
    sampleHurt,
    sampleIdle,
    sampleRest,
    walkFrame,
  } = poses;

  const hero = resolve(here, `../../assets/${groupId}-side.svg`);
  await writeHeroSvg({
    generator,
    out: hero,
    title,
    desc,
    groupId,
    skin,
    pose: idleA(),
    tolerance: TOLERANCE,
    model,
    canvas,
  });
  console.log(`Wrote ${hero}`);

  const walkSprites = catalog().map((entry) => {
    const baked = bake({ skin, pose: entry.pose, canvas: SPRITE, tolerance: TOLERANCE, model });
    return { ...entry, ...baked };
  });
  const sprites = await writeSpriteKit({
    generator,
    groupId,
    sprite: SPRITE,
    frames: walkSprites,
    outDir: resolve(here, `../../assets/${groupId}-sprites`),
    stillPath: resolve(here, `../../assets/${groupId}-walk.svg`),
    stillLabel: `${name}, walking, facing right`,
  });
  console.log(`Wrote ${sprites.length} walk frames plus sheet.svg`);

  const idleSprites = Array.from({ length: IDLE_FRAMES }, (_, i) => {
    const baked = bake({ skin, pose: sampleIdle(i / IDLE_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
    return { id: `idle-${i}`, label: `Idle ${i + 1}/${IDLE_FRAMES}`, ...baked };
  });
  await writeFrames({
    generator,
    groupId,
    sprite: SPRITE,
    frames: idleSprites,
    outDir: resolve(here, `../../assets/${groupId}-sprites`),
  });
  const restSprites = Array.from({ length: REST_FRAMES }, (_, i) => {
    const baked = bake({ skin, pose: sampleRest(i / REST_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
    return { id: `rest-${i}`, label: `Rest ${i + 1}/${REST_FRAMES}`, ...baked };
  });
  await writeFrames({
    generator,
    groupId,
    sprite: SPRITE,
    frames: restSprites,
    outDir: resolve(here, `../../assets/${groupId}-sprites`),
  });
  await writeSampledClips({
    generator,
    groupId,
    sprite: SPRITE,
    outDir: resolve(here, `../../assets/${groupId}-sprites`),
    skin,
    tolerance: TOLERANCE,
    model,
    sequences: [
      { prefix: "hurt", label: "Hurt", count: HURT_FRAMES, sample: sampleHurt },
      { prefix: "death", label: "Death", count: DEATH_FRAMES, sample: sampleDeath },
    ],
  });
  console.log(`Wrote ${IDLE_FRAMES} idle frames, ${REST_FRAMES} rest frames, ${HURT_FRAMES} hurt, and ${DEATH_FRAMES} death`);

  const idle = idleSprites.map((frame) => ({ id: frame.id, shapes: frame.shapes }));
  await writeScene(
    resolve(ROOT, `public/projects/${groupId}/scene-1`),
    flipbook({
      name: `${name} — Side idle`,
      w: SPRITE.w,
      h: SPRITE.h,
      frames: idle,
      fps: 8,
      hold: 1,
      loop: true,
      generator,
    }),
  );

  const walk = Array.from({ length: WALK_FRAMES }, (_, i) => {
    const baked = bake({ skin, pose: walkFrame(i / WALK_FRAMES), canvas: SPRITE, tolerance: TOLERANCE, model });
    return { id: `walk-${i}`, shapes: baked.shapes };
  });
  await writeScene(
    resolve(ROOT, `public/projects/${groupId}/scene-2`),
    flipbook({
      name: `${name} — ${walkName}`,
      w: SPRITE.w,
      h: SPRITE.h,
      frames: walk,
      fps: walkFps,
      hold: 1,
      loop: true,
      generator,
    }),
  );

  const rest = restSprites.map((frame) => ({ id: frame.id, shapes: frame.shapes }));
  await writeScene(
    resolve(ROOT, `public/projects/${groupId}/scene-3`),
    flipbook({
      name: `${name} — ${restName}`,
      w: SPRITE.w,
      h: SPRITE.h,
      frames: rest,
      fps: restFps,
      hold: 1,
      loop: true,
      generator,
    }),
  );
}
