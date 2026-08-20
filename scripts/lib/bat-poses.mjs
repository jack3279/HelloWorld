// Side-view bat. Wings flap on the walk clip; rest hangs upside-down.
const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: -45, pitch: 6, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = { w: 512, h: 480, scale: 11, originX: 256, originY: 430 };
export const TOLERANCE = { default: 18, head: 10 };
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
    body: { pitch: 8, roll: 0 },
    head: { ...FACE },
    "wing-right": limb(NEAR, { yaw: -28, roll: 8 }),
    "wing-right-tip": limb(NEAR, { yaw: -18 }),
    "wing-left": limb(FAR, { yaw: 28, roll: -8 }),
    "wing-left-tip": limb(FAR, { yaw: 18 }),
  });
}

export function idleB() {
  return pose(
    {
      body: { pitch: 4, roll: 0 },
      head: { ...FACE, pitch: 2 },
      "wing-right": limb(NEAR, { yaw: -18, roll: 4 }),
      "wing-right-tip": limb(NEAR, { yaw: -10 }),
      "wing-left": limb(FAR, { yaw: 18, roll: -4 }),
      "wing-left-tip": limb(FAR, { yaw: 10 }),
    },
    { root: { y: 0.4 } },
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
  const flap = Math.sin(tau);
  return pose(
    {
      body: { pitch: 10 + flap * 6, roll: 0 },
      head: { ...FACE, pitch: 4 - flap * 4 },
      "wing-right": limb(NEAR, { yaw: -40 - flap * 32, roll: 10 }),
      "wing-right-tip": limb(NEAR, { yaw: -24 - flap * 18 }),
      "wing-left": limb(FAR, { yaw: 40 + flap * 32, roll: -10 }),
      "wing-left-tip": limb(FAR, { yaw: 24 + flap * 18 }),
    },
    { root: { y: 1.2 + Math.max(0, flap) * 1.4 } },
  );
}

export function restA() {
  return pose(
    {
      body: { pitch: 168, roll: 0 },
      head: { ...FACE, pitch: 20 },
      "wing-right": limb(NEAR, { yaw: -8, roll: 4 }),
      "wing-right-tip": limb(NEAR, { yaw: -6 }),
      "wing-left": limb(FAR, { yaw: 8, roll: -4 }),
      "wing-left-tip": limb(FAR, { yaw: 6 }),
    },
    { root: { y: 4.5 } },
  );
}

export function restB() {
  return pose(
    {
      body: { pitch: 164, roll: 0 },
      head: { ...FACE, pitch: 16 },
      "wing-right": limb(NEAR, { yaw: -4, roll: 2 }),
      "wing-right-tip": limb(NEAR, { yaw: -4 }),
      "wing-left": limb(FAR, { yaw: 4, roll: -2 }),
      "wing-left-tip": limb(FAR, { yaw: 4 }),
    },
    { root: { y: 4.2 } },
  );
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  const recoil = Math.sin(Math.min(1, t * 1.4) * Math.PI) * 14;
  return pose(
    {
      body: { pitch: 16, roll: recoil * 0.2 },
      head: { ...FACE, pitch: -10 },
      "wing-right": limb(NEAR, { yaw: -60, roll: 16 }),
      "wing-right-tip": limb(NEAR, { yaw: -30 }),
      "wing-left": limb(FAR, { yaw: 60, roll: -16 }),
      "wing-left-tip": limb(FAR, { yaw: 30 }),
    },
    { root: { y: recoil * 0.08, x: -recoil * 0.04 }, flash },
  );
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    {
      body: { pitch: 8 + u * 90, roll: u * 12 },
      head: { ...FACE, pitch: 10 + u * 40 },
      "wing-right": limb(NEAR, { yaw: -20 + u * 40, roll: 8 }),
      "wing-right-tip": limb(NEAR, { yaw: -10 }),
      "wing-left": limb(FAR, { yaw: 20 - u * 40, roll: -8 }),
      "wing-left-tip": limb(FAR, { yaw: 10 }),
    },
    { root: { y: u * 2, x: u * 2 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
