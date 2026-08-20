// Side-view slime. The cube yaws 45° toward the camera so both eyes and the
// mouth stay readable. Walk is a hop: the root lifts and the model stretches,
// then squashes on landing. `swell` is fed to swellCanvas like the creeper fuse.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 0, roll: 0 };

export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;
export const TOLERANCE = { default: 22, body: 16 };

export const SPRITE = {
  w: 512,
  h: 480,
  scale: 22,
  originX: 256,
  originY: 452,
};

function pose(parts, extra = {}) {
  return {
    view: SIDE_VIEW,
    root: extra.root ?? {},
    parts,
    swell: extra.swell ?? 0,
    flash: extra.flash ?? 0,
    roll: extra.roll ?? 0,
  };
}

export function idleA() {
  return pose(
    {
      body: { ...FACE, pitch: 2 },
      inner: {},
      "eye-right": {},
      "eye-left": {},
      mouth: {},
    },
    { swell: 0.02 },
  );
}

export function idleB() {
  return pose(
    {
      body: { ...FACE, pitch: 1 },
      inner: {},
      "eye-right": {},
      "eye-left": {},
      mouth: {},
    },
    { root: { y: 0.15 }, swell: 0.06 },
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
    swell: lerpNum(a.swell ?? 0, b.swell ?? 0, t),
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

export function walkFrame(phase) {
  const tau = (phase % 1) * Math.PI * 2;
  const hop = Math.max(0, Math.sin(tau));
  const land = Math.max(0, -Math.sin(tau));
  return pose(
    {
      body: { ...FACE, pitch: 2 + hop * 4 - land * 6 },
      inner: {},
      "eye-right": {},
      "eye-left": {},
      mouth: {},
    },
    { root: { y: hop * 2.8, x: Math.sin(tau) * 0.08 }, swell: hop * 0.22 - land * 0.18 },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Hop ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
    tags: ["walk"],
  }));
}

export function hurtPose() {
  return pose(
    {
      body: { ...FACE, pitch: 10, roll: -8 },
      inner: {},
      "eye-right": {},
      "eye-left": {},
      mouth: {},
    },
    { root: { x: -1.1, y: 0.4 }, swell: 0.12, flash: 0.86 },
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
      body: { ...FACE, pitch: 8, roll: 12 },
      inner: {},
      "eye-right": {},
      "eye-left": {},
      mouth: {},
    },
    { root: { x: -0.6, y: -1.4 }, swell: -0.42, roll: 18 },
  );
}

export function sampleDeath(t) {
  const x = Math.min(1, Math.max(0, t));
  const keys = [
    { t: 0, pose: { ...idleA(), flash: 0.8 } },
    { t: 0.2, pose: { ...hurtPose(), flash: 0.5 } },
    { t: 0.55, pose: lerpPose(hurtPose(), deathPose(), 0.6) },
    { t: 1, pose: deathPose() },
  ];
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].t) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const u = (x - a.t) / (b.t - a.t || 1);
  return { ...lerpPose(a.pose, b.pose, easeInOut(u)), flash: x < 0.22 ? 0.7 * (1 - x / 0.22) : 0 };
}

export function swellCanvas(pose, canvas = SPRITE) {
  return { ...canvas, scale: canvas.scale * (1 + (pose.swell ?? 0) * 0.45) };
}
