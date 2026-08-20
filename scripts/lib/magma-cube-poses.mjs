// Side-view magma cube. Hop like the slime; slices stay parented to the core.
const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: -45, pitch: 0, roll: 0 };

export const SPRITE = { w: 512, h: 480, scale: 22, originX: 256, originY: 452 };
export const TOLERANCE = { default: 18, inside: 14 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function slices(extra = {}) {
  const parts = { inside: { yaw: FACE.yaw, ...extra } };
  for (let i = 0; i < 8; i++) parts[`cube-${i}`] = {};
  return parts;
}

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
  return pose(slices());
}

export function idleB() {
  return pose(slices({ pitch: 2 }), { root: { y: 0.25 }, swell: 0.04 });
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
  const land = hop < 0.08 ? (0.08 - hop) / 0.08 : 0;
  return pose(slices({ pitch: hop * 8 }), {
    root: { y: hop * 5.5, x: Math.sin(tau) * 0.15 },
    swell: hop * 0.12 - land * 0.18,
  });
}

export function restA() {
  return pose(slices({ pitch: 4 }), { root: { y: -0.2 }, swell: -0.04 });
}

export function restB() {
  return pose(slices({ pitch: 2 }), { root: { y: -0.1 }, swell: 0 });
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  return pose(slices({ pitch: -6, roll: -10 }), { root: { x: -1.2, y: 0.6 }, swell: 0.08, flash });
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(slices({ pitch: u * 20, roll: u * 16 }), { root: { y: -u * 2.2, x: -u }, swell: -u * 0.2 });
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Hop ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
