// Side-view skeleton. Body in profile, head turned 45° so both eye sockets
// read. Thin limbs use the same pitch convention as Steve: negative is forward.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 4, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = {
  w: 512,
  h: 520,
  scale: 12,
  originX: 248,
  originY: 490,
};

export const TOLERANCE = { default: 18, head: 8 };

export const WALK_FRAMES = 16;
export const DRAW_FRAMES = 12;

function pose(parts, root = {}) {
  return { view: SIDE_VIEW, root, parts };
}

function limb(base, extra = {}) {
  return { ...base, ...extra };
}

export function idleA() {
  return pose({
    torso: { pitch: -1, roll: 0 },
    head: { ...FACE },
    "arm-right": limb(NEAR, { pitch: 10, roll: 4 }),
    "arm-left": limb(FAR, { pitch: -8, roll: -4 }),
    "leg-right": limb(NEAR, { pitch: 4, roll: 2 }),
    "leg-left": limb(FAR, { pitch: -3, roll: -2 }),
  });
}

export function idleB() {
  return pose(
    {
      torso: { pitch: 0, roll: 0 },
      head: { ...FACE, pitch: 2 },
      "arm-right": limb(NEAR, { pitch: 7, roll: 3 }),
      "arm-left": limb(FAR, { pitch: -5, roll: -3 }),
      "leg-right": limb(NEAR, { pitch: 3, roll: 2 }),
      "leg-left": limb(FAR, { pitch: -2, roll: -2 }),
    },
    { y: 0.25 },
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
  };
}

export function sampleIdle(t) {
  const x = ((t % 1) + 1) % 1;
  return x < 0.5
    ? lerpPose(idleA(), idleB(), easeInOut(x * 2))
    : lerpPose(idleB(), idleA(), easeInOut((x - 0.5) * 2));
}

export function walkFrame(phase) {
  const tau = (phase % 1) * Math.PI * 2;
  const swing = Math.sin(tau);
  const bob = Math.sin(tau * 2);
  return pose(
    {
      torso: { pitch: -4 + bob * 2.5, roll: swing * 2 },
      head: { ...FACE, pitch: 4 + bob * 1.5, roll: swing * -2 },
      "arm-right": limb(NEAR, { pitch: 8 + swing * 55, roll: 3 }),
      "arm-left": limb(FAR, { pitch: -6 - swing * 52, roll: -3 }),
      "leg-right": limb(NEAR, { pitch: -swing * 38, roll: 2 }),
      "leg-left": limb(FAR, { pitch: swing * 38, roll: -2 }),
    },
    { y: Math.max(0, bob) * 0.45, x: swing * 0.12 },
  );
}

export function drawFrame(phase) {
  const t = ((phase % 1) + 1) % 1;
  const raise = t < 0.28 ? easeInOut(t / 0.28) : t > 0.82 ? 1 - easeInOut((t - 0.82) / 0.18) : 1;
  const aim = Math.sin(t * Math.PI * 4) * 3 * raise;
  const base = idleA();
  return {
    ...base,
    parts: {
      ...base.parts,
      torso: { pitch: 4 * raise, roll: 0 },
      head: { ...FACE, pitch: 6 + aim * 0.4, yaw: -45 },
      "arm-left": limb(FAR, { pitch: -8 - 78 * raise, roll: -4 }),
      "arm-right": limb(NEAR, { pitch: 10 - 52 * raise + aim, roll: 8 * raise }),
    },
  };
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
    tags: ["walk"],
  }));
}
