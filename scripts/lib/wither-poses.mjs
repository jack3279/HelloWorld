// Side-view wither. Three heads track 45°; walk is a hovering drift.
const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: -45, pitch: 6, roll: 0 };

export const SPRITE = { w: 512, h: 480, scale: 12, originX: 256, originY: 430 };
export const TOLERANCE = { default: 14, head: 10, "head-left": 10, "head-right": 10 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: extra.swell ?? 0, flash: extra.flash ?? 0 };
}

function heads(pitch = 0, look = 0) {
  return {
    head: { ...FACE, pitch: FACE.pitch + pitch, yaw: FACE.yaw + look },
    "head-right": { ...FACE, pitch: FACE.pitch + pitch * 0.6 + 4, yaw: FACE.yaw - 8 },
    "head-left": { ...FACE, pitch: FACE.pitch + pitch * 0.6 - 2, yaw: FACE.yaw + 8 },
  };
}

export function idleA() {
  return pose({
    shoulders: { pitch: 0 },
    spine: { pitch: 2 },
    "rib-top": {},
    "rib-mid": {},
    "rib-low": {},
    ...heads(0, 0),
  });
}

export function idleB() {
  return pose(
    {
      shoulders: { pitch: 2 },
      spine: { pitch: 0 },
      "rib-top": { pitch: 2 },
      "rib-mid": {},
      "rib-low": { pitch: -2 },
      ...heads(3, 4),
    },
    { root: { y: 0.45 } },
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
  const bob = Math.sin(tau);
  return pose(
    {
      shoulders: { pitch: 4 + bob * 3, roll: bob * 2 },
      spine: { pitch: 3 + bob * 2 },
      "rib-top": { pitch: bob * 4 },
      "rib-mid": { pitch: -bob * 3 },
      "rib-low": { pitch: bob * 2 },
      ...heads(4 + bob * 2, Math.sin(tau + 1) * 6),
    },
    { root: { y: 0.5 + bob * 0.55 } },
  );
}

export function restA() {
  return pose({ shoulders: { pitch: 6 }, spine: { pitch: 8 }, ...heads(10, -4) }, { root: { y: 0.2 } });
}

export function restB() {
  return pose({ shoulders: { pitch: 3 }, spine: { pitch: 5 }, ...heads(6, 4) }, { root: { y: 0.4 } });
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
      shoulders: { pitch: -8, roll: -recoil * 0.3 },
      spine: { pitch: 6 },
      ...heads(-6, -10),
    },
    { root: { x: -recoil * 0.05, y: recoil * 0.03 }, flash },
  );
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    {
      shoulders: { pitch: 8 + u * 50, roll: u * 16 },
      spine: { pitch: 10 + u * 30 },
      "rib-top": { pitch: u * 20 },
      "rib-mid": { pitch: u * 12 },
      "rib-low": { pitch: u * 8 },
      ...heads(8 + u * 40, u * 12),
    },
    { root: { y: -u * 3.6, x: u * 1.3 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Drift ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
