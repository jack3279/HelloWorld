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
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 12;

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
    "held-bow": { pitch: 0, roll: 0, yaw: 0 },
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
    flash: lerpNum(a.flash ?? 0, b.flash ?? 0, t),
    roll: lerpNum(a.roll ?? 0, b.roll ?? 0, t),
    bowPull: lerpNum(a.bowPull ?? 0, b.bowPull ?? 0, t),
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
  return aimPose(raise, Math.sin(t * Math.PI * 4) * 3 * raise);
}

// One-shot draw for the game: t 0..1 only raises, so the last frame holds a full pull.
export function aimFrame(t) {
  const raise = easeInOut(Math.min(1, Math.max(0, t)));
  return aimPose(raise, Math.sin(raise * Math.PI) * 2);
}

function aimPose(raise, aim) {
  const base = idleA();
  return {
    ...base,
    bowPull: raise,
    parts: {
      ...base.parts,
      torso: { pitch: 4 * raise, roll: 0 },
      head: { ...FACE, pitch: 6 + aim * 0.4, yaw: -45 },
      "arm-left": limb(FAR, { pitch: -8 - 78 * raise, roll: -4 }),
      "arm-right": limb(NEAR, { pitch: 10 - 52 * raise + aim, roll: 8 * raise }),
      "held-bow": { pitch: 0, roll: 0, yaw: 0 },
      "held-arrow": { pitch: 0, roll: 0, yaw: 0 },
    },
  };
}

export function hurtPose() {
  return {
    ...pose(
      {
        torso: { pitch: 14, roll: -8 },
        head: { ...FACE, pitch: 12, roll: -10 },
        "arm-right": limb(NEAR, { pitch: 42, roll: 10 }),
        "arm-left": limb(FAR, { pitch: -36, roll: -12 }),
        "leg-right": limb(NEAR, { pitch: 18, roll: 4 }),
        "leg-left": limb(FAR, { pitch: -20, roll: -4 }),
      },
      { x: -1.8, y: 0.5 },
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
        torso: { pitch: 78, roll: 6 },
        head: { ...FACE, pitch: 22, roll: 10 },
        "arm-right": limb(NEAR, { pitch: 8, roll: 16 }),
        "arm-left": limb(FAR, { pitch: -12, roll: -10 }),
        "leg-right": limb(NEAR, { pitch: 48, roll: 8 }),
        "leg-left": limb(FAR, { pitch: 32, roll: -6 }),
      },
      { x: -2.4, y: -5.2 },
    ),
    roll: 32,
    flash: 0,
  };
}

export function sampleDeath(t) {
  const x = Math.min(1, Math.max(0, t));
  const keys = [
    { t: 0, pose: { ...idleA(), flash: 0.92 } },
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

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
    tags: ["walk"],
  }));
}
