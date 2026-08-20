// Side-view ghast. Tentacles pulse on the walk clip; rest is a slow hover.
const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: -45, pitch: 6, roll: 0 };

export const SPRITE = { w: 512, h: 480, scale: 10, originX: 256, originY: 420 };
export const TOLERANCE = { default: 14, body: 12 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function tentacles(phase, amp = 18) {
  const parts = {};
  for (let i = 0; i < 9; i++) {
    const wave = Math.sin((phase * Math.PI * 2 + i * 0.7) ) * amp;
    parts[`tentacle-${i}`] = { pitch: wave, yaw: Math.sin((phase * 360 + i * 40) * (Math.PI / 180)) * 6 };
  }
  return parts;
}

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: extra.swell ?? 0, flash: extra.flash ?? 0 };
}

export function idleA() {
  return pose({ body: { ...FACE }, ...tentacles(0, 10) });
}

export function idleB() {
  return pose({ body: { ...FACE, pitch: 2 }, ...tentacles(0.5, 10) }, { root: { y: 0.5 } });
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
  return pose({ body: { ...FACE, pitch: 8 }, ...tentacles(phase, 22) }, { root: { y: 0.6 + Math.sin(phase * Math.PI * 2) * 0.7 } });
}

export function restA() {
  return pose({ body: { ...FACE, pitch: 10 }, ...tentacles(0.1, 6) }, { root: { y: 0.2 } });
}

export function restB() {
  return pose({ body: { ...FACE, pitch: 4 }, ...tentacles(0.6, 6) }, { root: { y: 0.55 } });
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  return pose({ body: { ...FACE, pitch: -10, roll: -8 }, ...tentacles(0.3, 28) }, { root: { x: -0.8, y: 1.4 }, flash });
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    { body: { ...FACE, pitch: 8 + u * 70, roll: u * 18 }, ...tentacles(0.2 + u, 8) },
    { root: { y: -u * 4, x: u * 1.4 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Drift ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
