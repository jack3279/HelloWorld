// Side-view zombie. The body faces screen-right (true profile). The head
// turns 45° toward the camera so the front of the face — both eye sockets
// and the mouth — stays readable. Arms hang forward in the classic Java
// zombie reach, not the player idle.
//
// Limb `pitch` is the swing in the plane of motion: negative is forward
// (the direction the character faces), positive is back.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 8, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = {
  w: 512,
  h: 520,
  scale: 12,
  originX: 236,
  originY: 490,
};

export const TOLERANCE = { default: 30, head: 12 };

function pose(parts, root = {}) {
  return { view: SIDE_VIEW, root, parts };
}

function limb(base, extra = {}) {
  return { ...base, ...extra };
}

// Classic zombie: hunched torso, arms stretched forward, uneven stance.
export function idleA() {
  return pose({
    torso: { pitch: 8, roll: 0 },
    head: { ...FACE },
    "arm-right": limb(NEAR, { pitch: -86, roll: 6 }),
    "arm-left": limb(FAR, { pitch: -78, roll: -8 }),
    "leg-right": limb(NEAR, { pitch: 12, roll: 2 }),
    "leg-left": limb(FAR, { pitch: -10, roll: -2 }),
  });
}

export function idleB() {
  return pose(
    {
      torso: { pitch: 6, roll: 0 },
      head: { ...FACE, pitch: 6 },
      "arm-right": limb(NEAR, { pitch: -82, roll: 4 }),
      "arm-left": limb(FAR, { pitch: -74, roll: -6 }),
      "leg-right": limb(NEAR, { pitch: 8, roll: 2 }),
      "leg-left": limb(FAR, { pitch: -6, roll: -2 }),
    },
    { y: 0.3 },
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
