// Side-view blaze. Rods orbit on the walk clip; rest is a slow hover.
const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: -45, pitch: 4, roll: 0 };

export const SPRITE = { w: 512, h: 480, scale: 12, originX: 256, originY: 420 };
export const TOLERANCE = { default: 14, head: 10 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function rods(spin) {
  const parts = {};
  for (let i = 0; i < 8; i++) {
    parts[`rod-${i}`] = { yaw: spin + i * 45, pitch: Math.sin((spin + i * 40) * (Math.PI / 180)) * 8 };
  }
  return parts;
}

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: extra.swell ?? 0, flash: extra.flash ?? 0 };
}

export function idleA() {
  return pose({ head: { ...FACE }, ...rods(0) });
}

export function idleB() {
  return pose({ head: { ...FACE, pitch: 0 }, ...rods(12) }, { root: { y: 0.4 } });
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
  const spin = phase * 360;
  return pose({ head: { ...FACE, pitch: 6 }, ...rods(spin) }, { root: { y: 0.8 + Math.sin(phase * Math.PI * 2) * 0.6 } });
}

export function restA() {
  return pose({ head: { ...FACE, pitch: 10 }, ...rods(-8) }, { root: { y: 0.2 } });
}

export function restB() {
  return pose({ head: { ...FACE, pitch: 6 }, ...rods(8) }, { root: { y: 0.45 } });
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  return pose({ head: { ...FACE, pitch: -12 }, ...rods(40) }, { root: { x: -0.6, y: 1.2 }, flash });
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    { head: { ...FACE, pitch: 8 + u * 50, roll: u * 12 }, ...rods(20 + u * 80) },
    { root: { y: -u * 3, x: u * 1.2 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Spin ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
