// Side-view rabbit. Body stays horizontal; the hop is root.y plus opposite
// front-leg / haunch swings. Ears flop as secondary motion. Head yaws 45°.
const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 4, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = { w: 512, h: 480, scale: 16, originX: 256, originY: 452 };
export const TOLERANCE = { default: 24, head: 14 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: 0, flash: extra.flash ?? 0 };
}

function limb(base, extra = {}) {
  return { ...base, ...extra };
}

export function idleA() {
  return pose({
    body: { pitch: 4, roll: 0 },
    head: { ...FACE },
    "ear-right": limb(NEAR, { pitch: 8, roll: -6 }),
    "ear-left": limb(FAR, { pitch: 6, roll: 6 }),
    "leg-front-right": limb(NEAR, { pitch: 8 }),
    "leg-front-left": limb(FAR, { pitch: -4 }),
    "haunch-right": limb(NEAR, { pitch: -6 }),
    "haunch-left": limb(FAR, { pitch: 4 }),
    tail: { pitch: 8 },
  });
}

export function idleB() {
  return pose(
    {
      body: { pitch: 2, roll: 0 },
      head: { ...FACE, pitch: 2 },
      "ear-right": limb(NEAR, { pitch: 14, roll: -10 }),
      "ear-left": limb(FAR, { pitch: 12, roll: 10 }),
      "leg-front-right": limb(NEAR, { pitch: 6 }),
      "leg-front-left": limb(FAR, { pitch: -2 }),
      "haunch-right": limb(NEAR, { pitch: -4 }),
      "haunch-left": limb(FAR, { pitch: 3 }),
      tail: { pitch: 12 },
    },
    { root: { y: 0.2 } },
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
    view: a.view,
    root: {
      x: lerpNum(a.root?.x ?? 0, b.root?.x ?? 0, t),
      y: lerpNum(a.root?.y ?? 0, b.root?.y ?? 0, t),
    },
    parts,
    swell: lerpNum(a.swell ?? 0, b.swell ?? 0, t),
    flash: lerpNum(a.flash ?? 0, b.flash ?? 0, t),
  };
}

export function sampleIdle(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(idleA(), idleB(), u);
}

export function walkFrame(phase) {
  const tau = (phase % 1) * Math.PI * 2;
  const hop = Math.max(0, Math.sin(tau));
  const step = Math.sin(tau);
  return pose(
    {
      body: { pitch: 2 + hop * 10, roll: 0 },
      head: { ...FACE, pitch: 4 - hop * 8 },
      "ear-right": limb(NEAR, { pitch: 10 + hop * 28, roll: -8 }),
      "ear-left": limb(FAR, { pitch: 10 + hop * 24, roll: 8 }),
      "leg-front-right": limb(NEAR, { pitch: -step * 42 }),
      "leg-front-left": limb(FAR, { pitch: step * 42 }),
      "haunch-right": limb(NEAR, { pitch: step * 36 }),
      "haunch-left": limb(FAR, { pitch: -step * 36 }),
      tail: { pitch: 6 + hop * 18 },
    },
    { root: { y: hop * 3.4 } },
  );
}

export function restA() {
  return pose(
    {
      body: { pitch: 16, roll: 0 },
      head: { ...FACE, pitch: 22 },
      "ear-right": limb(NEAR, { pitch: 42, roll: -12 }),
      "ear-left": limb(FAR, { pitch: 38, roll: 12 }),
      "leg-front-right": limb(NEAR, { pitch: 28 }),
      "leg-front-left": limb(FAR, { pitch: 22 }),
      "haunch-right": limb(NEAR, { pitch: 18 }),
      "haunch-left": limb(FAR, { pitch: 14 }),
      tail: { pitch: 4 },
    },
    { root: { y: -1.4 } },
  );
}

export function restB() {
  return pose(
    {
      body: { pitch: 14, roll: 0 },
      head: { ...FACE, pitch: 18 },
      "ear-right": limb(NEAR, { pitch: 36, roll: -8 }),
      "ear-left": limb(FAR, { pitch: 32, roll: 8 }),
      "leg-front-right": limb(NEAR, { pitch: 24 }),
      "leg-front-left": limb(FAR, { pitch: 20 }),
      "haunch-right": limb(NEAR, { pitch: 16 }),
      "haunch-left": limb(FAR, { pitch: 12 }),
      tail: { pitch: 8 },
    },
    { root: { y: -1.2 } },
  );
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  const recoil = Math.sin(Math.min(1, t * 1.4) * Math.PI) * 12;
  return pose(
    {
      body: { pitch: 8, roll: recoil * 0.2 },
      head: { ...FACE, pitch: -8, yaw: -45 },
      "ear-right": limb(NEAR, { pitch: 50, roll: -18 }),
      "ear-left": limb(FAR, { pitch: 46, roll: 18 }),
      "leg-front-right": limb(NEAR, { pitch: 24 }),
      "leg-front-left": limb(FAR, { pitch: 18 }),
      "haunch-right": limb(NEAR, { pitch: -18 }),
      "haunch-left": limb(FAR, { pitch: -12 }),
      tail: { pitch: 20 },
    },
    { root: { y: recoil * 0.08, x: -recoil * 0.04 }, flash },
  );
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    {
      body: { pitch: 4 + u * 82, roll: u * 8 },
      head: { ...FACE, pitch: 10 + u * 40 },
      "ear-right": limb(NEAR, { pitch: 20 + u * 40, roll: -10 }),
      "ear-left": limb(FAR, { pitch: 16 + u * 36, roll: 10 }),
      "leg-front-right": limb(NEAR, { pitch: 8 + u * 20 }),
      "leg-front-left": limb(FAR, { pitch: 4 + u * 16 }),
      "haunch-right": limb(NEAR, { pitch: u * 24 }),
      "haunch-left": limb(FAR, { pitch: u * 20 }),
      tail: { pitch: 8 },
    },
    { root: { y: u * 1.2, x: u * 2 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
