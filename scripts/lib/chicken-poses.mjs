// Side-view chicken. The body is the vanilla cuboid pitched 90° onto its
// belly. Head, beak, and wattle stay on the root so that pitch does not flip
// the face. The head yaws 45° toward the camera so both eyes read.
//
// Walk is a two-leg stride with a light wing flap. Limb `pitch` is the swing
// in the plane of motion: negative is forward.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 4, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const BODY_REST_PITCH = 90;
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;
export const TOLERANCE = { default: 28, head: 18 };

export const SPRITE = { w: 512, h: 480, scale: 20, originX: 256, originY: 452 };

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: 0, flash: extra.flash ?? 0 };
}

function limb(base, extra = {}) {
  return { ...base, ...extra };
}

export function idleA() {
  return pose({
    body: { pitch: BODY_REST_PITCH + 2, roll: 0 },
    head: { ...FACE },
    "wing-right": limb(NEAR, { roll: -8 }),
    "wing-left": limb(FAR, { roll: 8 }),
    "leg-right": limb(NEAR, { pitch: 4 }),
    "leg-left": limb(FAR, { pitch: -3 }),
  });
}

export function idleB() {
  return pose(
    {
      body: { pitch: BODY_REST_PITCH + 1, roll: 0 },
      head: { ...FACE, pitch: 2 },
      "wing-right": limb(NEAR, { roll: -6 }),
      "wing-left": limb(FAR, { roll: 6 }),
      "leg-right": limb(NEAR, { pitch: 3 }),
      "leg-left": limb(FAR, { pitch: -2 }),
    },
    { root: { y: 0.15 } },
  );
}

export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function lerpNum(a, b, t) {
  return a + (b - a) * t;
}

export function lerpPose(a, b, t) {
  const ids = new Set([...Object.keys(a.parts ?? {}), ...Object.keys(b.parts ?? {})]);
  const parts = {};
  for (const id of ids) {
    const pa = a.parts?.[id] ?? {};
    const pb = b.parts?.[id] ?? {};
    const out = {};
    for (const k of ["pitch", "roll", "yaw", "faceYaw", "shadeScale"]) {
      if (pa[k] != null || pb[k] != null) out[k] = lerpNum(pa[k] ?? 0, pb[k] ?? 0, t);
    }
    parts[id] = out;
  }
  return {
    view: a.view ?? b.view,
    root: {
      x: lerpNum(a.root?.x ?? 0, b.root?.x ?? 0, t),
      y: lerpNum(a.root?.y ?? 0, b.root?.y ?? 0, t),
    },
    parts,
    swell: 0,
    flash: lerpNum(a.flash ?? 0, b.flash ?? 0, t),
  };
}

export function sampleIdle(t) {
  const x = ((t % 1) + 1) % 1;
  return x < 0.5
    ? lerpPose(idleA(), idleB(), easeInOut(x * 2))
    : lerpPose(idleB(), idleA(), easeInOut((x - 0.5) * 2));
}

export function restA() {
  return pose(
    {
      body: { pitch: BODY_REST_PITCH + 8, roll: 4 },
      head: { yaw: -38, pitch: 16, roll: 6 },
      "wing-right": limb(NEAR, { roll: 12 }),
      "wing-left": limb(FAR, { roll: -12 }),
      "leg-right": limb(NEAR, { pitch: 28 }),
      "leg-left": limb(FAR, { pitch: 22 }),
    },
    { root: { y: -1.2 } },
  );
}

export function restB() {
  return pose(
    {
      body: { pitch: BODY_REST_PITCH + 6, roll: 2 },
      head: { yaw: -42, pitch: 20, roll: 3 },
      "wing-right": limb(NEAR, { roll: 10 }),
      "wing-left": limb(FAR, { roll: -10 }),
      "leg-right": limb(NEAR, { pitch: 24 }),
      "leg-left": limb(FAR, { pitch: 26 }),
    },
    { root: { y: -1 } },
  );
}

export function sampleRest(t) {
  const x = ((t % 1) + 1) % 1;
  return x < 0.5
    ? lerpPose(restA(), restB(), easeInOut(x * 2))
    : lerpPose(restB(), restA(), easeInOut((x - 0.5) * 2));
}

export function walkFrame(phase) {
  const tau = (phase % 1) * Math.PI * 2;
  const step = Math.sin(tau);
  const bob = Math.sin(tau * 2);
  const flap = Math.abs(step);
  return pose(
    {
      body: { pitch: BODY_REST_PITCH + 3 + bob * 2, roll: step * 2 },
      head: { ...FACE, pitch: 4 + bob * 3, roll: step * -2 },
      "wing-right": limb(NEAR, { roll: -12 - flap * 28 }),
      "wing-left": limb(FAR, { roll: 12 + flap * 28 }),
      "leg-right": limb(NEAR, { pitch: -step * 34 }),
      "leg-left": limb(FAR, { pitch: step * 34 }),
    },
    { root: { y: 0.2 + Math.abs(bob) * 0.35, x: step * 0.1 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
    tags: ["walk"],
  }));
}

export function hurtPose() {
  return pose(
    {
      body: { pitch: BODY_REST_PITCH + 12, roll: -10 },
      head: { ...FACE, pitch: -8, roll: -8 },
      "wing-right": limb(NEAR, { roll: -36 }),
      "wing-left": limb(FAR, { roll: 36 }),
      "leg-right": limb(NEAR, { pitch: 16 }),
      "leg-left": limb(FAR, { pitch: 12 }),
    },
    { root: { x: -1.1, y: 0.4 }, flash: 0.86 },
  );
}

export function sampleHurt(t) {
  const x = Math.min(1, Math.max(0, t));
  const recoiled = lerpPose(idleA(), hurtPose(), x < 0.35 ? easeInOut(x / 0.35) : 1);
  const recovering = x < 0.35 ? recoiled : lerpPose(hurtPose(), idleA(), easeInOut((x - 0.35) / 0.65));
  const i = Math.round(x * (HURT_FRAMES - 1));
  const flash = i % 2 === 0 ? 0.88 * (1 - x * 0.55) : 0;
  return { ...recovering, flash };
}

export function deathPose() {
  return pose(
    {
      body: { pitch: BODY_REST_PITCH + 14, roll: 10 },
      head: { yaw: -28, pitch: 26, roll: 12 },
      "wing-right": limb(NEAR, { roll: -8 }),
      "wing-left": limb(FAR, { roll: 8 }),
      "leg-right": limb(NEAR, { pitch: 30 }),
      "leg-left": limb(FAR, { pitch: 24 }),
    },
    { root: { x: -0.8, y: -1.6 } },
  );
}

export function sampleDeath(t) {
  const x = Math.min(1, Math.max(0, t));
  const keys = [
    { t: 0, pose: { ...idleA(), flash: 0.8 } },
    { t: 0.18, pose: { ...hurtPose(), flash: 0.55 } },
    { t: 0.48, pose: lerpPose(hurtPose(), deathPose(), 0.55) },
    { t: 0.78, pose: deathPose() },
    { t: 1, pose: deathPose() },
  ];
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].t) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const u = (x - a.t) / (b.t - a.t || 1);
  return { ...lerpPose(a.pose, b.pose, easeInOut(u)), flash: x < 0.22 ? 0.7 * (1 - x / 0.22) : 0 };
}
