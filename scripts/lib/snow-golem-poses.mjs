// Side-view snow golem. Two stacked snowballs, stick arms, head at 45°.
const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 4, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = { w: 512, h: 480, scale: 13, originX: 256, originY: 448 };
export const TOLERANCE = { default: 16, head: 10, piece1: 14, piece2: 14 };
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
    piece2: { pitch: 1, roll: 0 },
    piece1: { pitch: 2, roll: 0 },
    head: { ...FACE },
    "arm-right": limb(NEAR, { pitch: 8, roll: -12 }),
    "arm-left": limb(FAR, { pitch: -6, roll: 12 }),
  });
}

export function idleB() {
  return pose(
    {
      piece2: { pitch: 0, roll: 0 },
      piece1: { pitch: 1, roll: 0 },
      head: { ...FACE, pitch: 2 },
      "arm-right": limb(NEAR, { pitch: 6, roll: -10 }),
      "arm-left": limb(FAR, { pitch: -4, roll: 10 }),
    },
    { root: { y: 0.2 } },
  );
}

export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function lerpNum(a, b, t) {
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
  const stride = Math.sin(tau);
  const bob = Math.sin(tau * 2);
  return pose(
    {
      piece2: { pitch: 3 + bob * 2, roll: stride * 3 },
      piece1: { pitch: 4 + bob * 2, roll: stride * 2 },
      head: { ...FACE, pitch: 2 + bob, roll: -stride },
      "arm-right": limb(NEAR, { pitch: 10 + stride * 22, roll: -14 }),
      "arm-left": limb(FAR, { pitch: -8 - stride * 22, roll: 14 }),
    },
    { root: { y: Math.max(0, bob) * 0.55 } },
  );
}

export function restA() {
  return pose(
    {
      piece2: { pitch: 6, roll: 0 },
      piece1: { pitch: 8, roll: 0 },
      head: { ...FACE, pitch: 14 },
      "arm-right": limb(NEAR, { pitch: 16, roll: -6 }),
      "arm-left": limb(FAR, { pitch: 12, roll: 6 }),
    },
    { root: { y: -0.25 } },
  );
}

export function restB() {
  return pose(
    {
      piece2: { pitch: 5, roll: 0 },
      piece1: { pitch: 6, roll: 0 },
      head: { ...FACE, pitch: 10 },
      "arm-right": limb(NEAR, { pitch: 12, roll: -4 }),
      "arm-left": limb(FAR, { pitch: 8, roll: 4 }),
    },
    { root: { y: -0.15 } },
  );
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  const recoil = Math.sin(Math.min(1, t * 1.4) * Math.PI) * 8;
  return pose(
    {
      piece2: { pitch: 8, roll: -recoil * 0.2 },
      piece1: { pitch: 10, roll: -recoil * 0.25 },
      head: { ...FACE, pitch: 8, roll: -6 },
      "arm-right": limb(NEAR, { pitch: 24, roll: -8 }),
      "arm-left": limb(FAR, { pitch: -18, roll: 8 }),
    },
    { root: { x: -recoil * 0.05, y: recoil * 0.03 }, flash },
  );
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    {
      piece2: { pitch: 8 + u * 58, roll: u * 10 },
      piece1: { pitch: 10 + u * 20, roll: u * 8 },
      head: { ...FACE, pitch: 8 + u * 24, roll: u * 10 },
      "arm-right": limb(NEAR, { pitch: 12 + u * 28, roll: -4 }),
      "arm-left": limb(FAR, { pitch: 8 + u * 22, roll: 4 }),
    },
    { root: { y: -u * 3.2, x: -u * 1.1 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
