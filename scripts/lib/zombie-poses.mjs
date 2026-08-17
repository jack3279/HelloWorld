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
    flash: lerpNum(a.flash ?? 0, b.flash ?? 0, t),
    roll: lerpNum(a.roll ?? 0, b.roll ?? 0, t),
  };
}

export function sampleIdle(t) {
  const x = ((t % 1) + 1) % 1;
  return x < 0.5
    ? lerpPose(idleA(), idleB(), easeInOut(x * 2))
    : lerpPose(idleB(), idleA(), easeInOut((x - 0.5) * 2));
}

// One shambling cycle. Phase is 0..1; the first and last samples meet so a
// flipbook loops. Arms stay reached forward — only a small droop rides on
// top of the classic Java zombie pose. Legs take a short, dragged stride.
export function walkFrame(phase) {
  const tau = (phase % 1) * Math.PI * 2;
  const stride = Math.sin(tau);
  const dragged = Math.sign(stride) * Math.abs(stride) ** 0.85;
  const bob = Math.sin(tau * 2);
  const sway = Math.sin(tau);
  return pose(
    {
      torso: { pitch: 10 + bob * 2.5, roll: sway * 2.5 },
      head: { ...FACE, pitch: 8 + bob * 2, roll: sway * -2 },
      "arm-right": limb(NEAR, { pitch: -84 + sway * 8, roll: 6 + bob * 2 }),
      "arm-left": limb(FAR, { pitch: -76 - sway * 7, roll: -8 - bob * 2 }),
      "leg-right": limb(NEAR, { pitch: 4 - dragged * 26, roll: 2 }),
      "leg-left": limb(FAR, { pitch: -4 + dragged * 24, roll: -2 }),
    },
    { y: 0.2 + bob * 0.35, x: sway * 0.18 },
  );
}

export const WALK_FRAMES = 16;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 12;

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
    tags: ["walk"],
  }));
}

export function hurtPose() {
  return {
    ...pose(
      {
        torso: { pitch: 18, roll: -8 },
        head: { ...FACE, pitch: 14, roll: -10 },
        "arm-right": limb(NEAR, { pitch: -52, roll: 14 }),
        "arm-left": limb(FAR, { pitch: -40, roll: -16 }),
        "leg-right": limb(NEAR, { pitch: 22, roll: 4 }),
        "leg-left": limb(FAR, { pitch: -16, roll: -4 }),
      },
      { x: -1.7, y: 0.45 },
    ),
    flash: 0.86,
  };
}

export function sampleHurt(t) {
  const x = Math.min(1, Math.max(0, t));
  const recoiled = lerpPose(idleA(), hurtPose(), x < 0.35 ? easeInOut(x / 0.35) : 1);
  const recovering = x < 0.35 ? recoiled : lerpPose(hurtPose(), idleA(), easeInOut((x - 0.35) / 0.65));
  const i = Math.round(x * (HURT_FRAMES - 1));
  const flash = i % 2 === 0 ? 0.9 * (1 - x * 0.55) : 0;
  return { ...recovering, flash };
}

export function deathPose() {
  return {
    ...pose(
      {
        torso: { pitch: 70, roll: 6 },
        head: { ...FACE, pitch: 20, roll: 8 },
        "arm-right": limb(NEAR, { pitch: -24, roll: 16 }),
        "arm-left": limb(FAR, { pitch: -18, roll: -12 }),
        "leg-right": limb(NEAR, { pitch: 44, roll: 8 }),
        "leg-left": limb(FAR, { pitch: 30, roll: -6 }),
      },
      { x: -2.2, y: -5 },
    ),
    roll: 30,
    flash: 0,
  };
}

export function sampleDeath(t) {
  const x = Math.min(1, Math.max(0, t));
  const keys = [
    { t: 0, pose: { ...idleA(), flash: 0.9 } },
    { t: 0.12, pose: { ...hurtPose(), flash: 0.7 } },
    { t: 0.36, pose: lerpPose(hurtPose(), deathPose(), 0.4) },
    { t: 0.62, pose: lerpPose(hurtPose(), deathPose(), 0.78) },
    { t: 0.84, pose: deathPose() },
    { t: 1, pose: deathPose() },
  ];
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].t) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const u = (x - a.t) / (b.t - a.t || 1);
  const out = lerpPose(a.pose, b.pose, easeInOut(u));
  const flash = x < 0.26 && Math.round(x * 10) % 2 === 0 ? 0.82 * (1 - x / 0.26) : 0;
  return { ...out, flash };
}
