// Side-view minecart. Idle rocks on the rails; walk is a rolling rumble.
const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const SPRITE = { w: 512, h: 400, scale: 11, originX: 256, originY: 372 };
export const TOLERANCE = { default: 16 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function hull(extra = {}) {
  return {
    bottom: extra,
    left: extra,
    right: extra,
    front: extra,
    back: extra,
  };
}

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: 0, flash: extra.flash ?? 0 };
}

export function idleA() {
  return pose(hull({ roll: 0 }));
}

export function idleB() {
  return pose(hull({ roll: 2 }), { root: { y: 0.2 } });
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
  const rumble = Math.sin(tau);
  return pose(hull({ roll: rumble * 4, pitch: Math.sin(tau * 2) * 2 }), {
    root: { y: 0.15 + Math.abs(Math.sin(tau)) * 0.2, x: rumble * 0.12 },
  });
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
  return pose(hull({ roll: -recoil * 0.4, pitch: -recoil * 0.15 }), {
    root: { x: -recoil * 0.04, y: recoil * 0.02 },
    flash,
  });
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(hull({ roll: u * 22, pitch: u * 16 }), { root: { y: -u * 2.4, x: u * 1.1 } });
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Roll ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
