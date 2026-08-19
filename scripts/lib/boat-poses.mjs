// Side-view oak boat. Idle bobs; walk is a paddle stroke.
const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: 0, pitch: 0, roll: 0 };

export const SPRITE = { w: 512, h: 400, scale: 9, originX: 256, originY: 372 };
export const TOLERANCE = { default: 16 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: 0, flash: extra.flash ?? 0 };
}

export function idleA() {
  return pose({
    bottom: {},
    left: {},
    right: {},
    front: {},
    back: {},
    "paddle-left": { pitch: 8 },
    "paddle-right": { pitch: -8 },
  });
}

export function idleB() {
  return pose(
    {
      bottom: { roll: 1 },
      left: {},
      right: {},
      front: {},
      back: {},
      "paddle-left": { pitch: 4 },
      "paddle-right": { pitch: -4 },
    },
    { root: { y: 0.35 } },
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
  const stroke = Math.sin(tau);
  return pose(
    {
      bottom: { roll: stroke * 2 },
      left: {},
      right: {},
      front: {},
      back: {},
      "paddle-left": { pitch: 10 + stroke * 28 },
      "paddle-right": { pitch: -10 - stroke * 28 },
    },
    { root: { y: 0.2 + Math.sin(tau * 2) * 0.25, x: stroke * 0.15 } },
  );
}

export function restA() {
  return idleA();
}

export function restB() {
  return idleB();
}

export function sampleRest(t) {
  return sampleIdle(t);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  const recoil = Math.sin(Math.min(1, t * 1.4) * Math.PI) * 8;
  return pose(
    {
      bottom: { roll: -recoil * 0.3 },
      left: {},
      right: {},
      front: {},
      back: {},
      "paddle-left": { pitch: 20 },
      "paddle-right": { pitch: -20 },
    },
    { root: { x: -recoil * 0.04, y: recoil * 0.02 }, flash },
  );
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    {
      bottom: { roll: u * 18, pitch: u * 12 },
      left: {},
      right: {},
      front: {},
      back: {},
      "paddle-left": { pitch: 30 },
      "paddle-right": { pitch: -30 },
    },
    { root: { y: -u * 2.5, x: u * 1.2 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Paddle ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
