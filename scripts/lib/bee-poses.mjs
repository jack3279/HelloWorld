// Side-view bee. Wings flap on the walk/hover clip; rest folds them.
const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: -45, pitch: 4, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = { w: 512, h: 480, scale: 16, originX: 256, originY: 430 };
export const TOLERANCE = { default: 18, head: 12 };
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
    body: { pitch: 6, roll: 0, yaw: FACE.yaw * 0.15 },
    "wing-right": limb(NEAR, { roll: -18, yaw: -8 }),
    "wing-left": limb(FAR, { roll: 18, yaw: 8 }),
  });
}

export function idleB() {
  return pose(
    {
      body: { pitch: 2, roll: 0, yaw: FACE.yaw * 0.15 },
      "wing-right": limb(NEAR, { roll: -8, yaw: -4 }),
      "wing-left": limb(FAR, { roll: 8, yaw: 4 }),
    },
    { root: { y: 0.45 } },
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
  const flap = Math.sin(tau * 2);
  return pose(
    {
      body: { pitch: 8 + flap * 4, roll: flap * 3, yaw: FACE.yaw * 0.12 },
      "wing-right": limb(NEAR, { roll: -28 - flap * 36, yaw: -10 }),
      "wing-left": limb(FAR, { roll: 28 + flap * 36, yaw: 10 }),
    },
    { root: { y: 1.1 + Math.max(0, flap) * 1.2 } },
  );
}

export function restA() {
  return pose(
    {
      body: { pitch: 2, roll: 0 },
      "wing-right": limb(NEAR, { roll: -4, yaw: -2 }),
      "wing-left": limb(FAR, { roll: 4, yaw: 2 }),
    },
    { root: { y: -0.4 } },
  );
}

export function restB() {
  return pose(
    {
      body: { pitch: 0, roll: 0 },
      "wing-right": limb(NEAR, { roll: -2, yaw: 0 }),
      "wing-left": limb(FAR, { roll: 2, yaw: 0 }),
    },
    { root: { y: -0.25 } },
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
      body: { pitch: 14, roll: recoil * 0.25 },
      "wing-right": limb(NEAR, { roll: -50, yaw: -16 }),
      "wing-left": limb(FAR, { roll: 50, yaw: 16 }),
    },
    { root: { y: recoil * 0.08, x: -recoil * 0.04 }, flash },
  );
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    {
      body: { pitch: 8 + u * 80, roll: u * 16 },
      "wing-right": limb(NEAR, { roll: -8 + u * 20, yaw: 8 }),
      "wing-left": limb(FAR, { roll: 8 - u * 20, yaw: -8 }),
    },
    { root: { y: u * 1.6, x: u * 1.8 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
