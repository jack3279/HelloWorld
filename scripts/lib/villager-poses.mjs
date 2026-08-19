// Side-view villager. Arms hang together from one shared pivot in front of
// the robe. The head turns 45° so the nose reads. Walk is a short shuffle.
const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 4, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = { w: 512, h: 520, scale: 12, originX: 236, originY: 490 };
export const TOLERANCE = { default: 26, head: 12 };
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

function folded(extra = {}) {
  return { pitch: -78, roll: 0, ...extra };
}

export function idleA() {
  return pose({
    torso: { pitch: 2, roll: 0 },
    head: { ...FACE },
    arms: folded(),
    "arm-right": limb(NEAR, folded({ roll: 4 })),
    "arm-left": limb(FAR, folded({ roll: -4 })),
    "leg-right": limb(NEAR, { pitch: 4 }),
    "leg-left": limb(FAR, { pitch: -3 }),
  });
}

export function idleB() {
  return pose(
    {
      torso: { pitch: 1, roll: 0 },
      head: { ...FACE, pitch: 2 },
      arms: folded({ pitch: -74 }),
      "arm-right": limb(NEAR, folded({ pitch: -74, roll: 3 })),
      "arm-left": limb(FAR, folded({ pitch: -74, roll: -3 })),
      "leg-right": limb(NEAR, { pitch: 3 }),
      "leg-left": limb(FAR, { pitch: -2 }),
    },
    { root: { y: 0.25 } },
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
  const stride = Math.sin(tau);
  const bob = Math.sin(tau * 2);
  const arms = folded({ pitch: -76 + bob * 4 });
  return pose(
    {
      torso: { pitch: 4 + bob * 2, roll: stride * 2 },
      head: { ...FACE, pitch: 4 + bob, roll: -stride },
      arms,
      "arm-right": limb(NEAR, { ...arms, roll: 4 }),
      "arm-left": limb(FAR, { ...arms, roll: -4 }),
      "leg-right": limb(NEAR, { pitch: -stride * 22 }),
      "leg-left": limb(FAR, { pitch: stride * 22 }),
    },
    { root: { y: Math.max(0, bob) * 0.35 } },
  );
}

export function restA() {
  return pose(
    {
      torso: { pitch: 10, roll: 0 },
      head: { ...FACE, pitch: 16 },
      arms: folded({ pitch: -88 }),
      "arm-right": limb(NEAR, folded({ pitch: -88, roll: 6 })),
      "arm-left": limb(FAR, folded({ pitch: -88, roll: -6 })),
      "leg-right": limb(NEAR, { pitch: 10 }),
      "leg-left": limb(FAR, { pitch: 6 }),
    },
    { root: { y: -0.4 } },
  );
}

export function restB() {
  return pose(
    {
      torso: { pitch: 8, roll: 0 },
      head: { ...FACE, pitch: 12 },
      arms: folded({ pitch: -84 }),
      "arm-right": limb(NEAR, folded({ pitch: -84, roll: 4 })),
      "arm-left": limb(FAR, folded({ pitch: -84, roll: -4 })),
      "leg-right": limb(NEAR, { pitch: 8 }),
      "leg-left": limb(FAR, { pitch: 5 }),
    },
    { root: { y: -0.3 } },
  );
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  const recoil = Math.sin(Math.min(1, t * 1.4) * Math.PI) * 10;
  return pose(
    {
      torso: { pitch: 12, roll: -recoil * 0.3 },
      head: { ...FACE, pitch: 10, roll: -8 },
      arms: folded({ pitch: -50 }),
      "arm-right": limb(NEAR, folded({ pitch: -50, roll: 12 })),
      "arm-left": limb(FAR, folded({ pitch: -46, roll: -12 })),
      "leg-right": limb(NEAR, { pitch: 18 }),
      "leg-left": limb(FAR, { pitch: -12 }),
    },
    { root: { x: -recoil * 0.06, y: recoil * 0.04 }, flash },
  );
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    {
      torso: { pitch: 8 + u * 68, roll: u * 8 },
      head: { ...FACE, pitch: 8 + u * 24, roll: u * 10 },
      arms: folded({ pitch: -40 + u * 20 }),
      "arm-right": limb(NEAR, folded({ pitch: -40 + u * 18, roll: 10 })),
      "arm-left": limb(FAR, folded({ pitch: -36 + u * 16, roll: -8 })),
      "leg-right": limb(NEAR, { pitch: 8 + u * 28 }),
      "leg-left": limb(FAR, { pitch: 4 + u * 22 }),
    },
    { root: { y: -u * 4.5, x: -u * 1.6 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
