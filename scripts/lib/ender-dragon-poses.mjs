// Side-view ender dragon. Wings beat on the walk clip; jaw drops on hurt.
const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: -18, pitch: 8, roll: 0 };

export const SPRITE = { w: 512, h: 480, scale: 3.1, originX: 256, originY: 350 };
export const TOLERANCE = { default: 18, body: 14, head: 12 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: extra.swell ?? 0, flash: extra.flash ?? 0 };
}

function wings(amp, phase = 0) {
  const flap = Math.sin(phase * Math.PI * 2) * amp;
  return {
    "wing-right": { roll: -28 - flap, pitch: 8 },
    "wing-left": { roll: 28 + flap, pitch: 8 },
  };
}

export function idleA() {
  return pose({
    body: { ...FACE },
    neck: { pitch: 6 },
    head: { pitch: 4, yaw: -12 },
    snout: {},
    jaw: { pitch: 4 },
    ...wings(10, 0),
  });
}

export function idleB() {
  return pose(
    {
      body: { ...FACE, pitch: 6 },
      neck: { pitch: 2 },
      head: { pitch: 2, yaw: -10 },
      snout: {},
      jaw: { pitch: 8 },
      ...wings(10, 0.5),
    },
    { root: { y: 0.8 } },
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
      body: { ...FACE, pitch: 10 + bob * 4, roll: bob * 3 },
      neck: { pitch: 8 + bob * 6 },
      head: { pitch: 6 + bob * 4, yaw: -14 },
      snout: {},
      jaw: { pitch: 10 + Math.max(0, bob) * 8 },
      ...wings(22, phase),
    },
    { root: { y: 0.6 + bob * 0.9 } },
  );
}

export function restA() {
  return pose(
    {
      body: { ...FACE, pitch: 12 },
      neck: { pitch: 10 },
      head: { pitch: 8, yaw: -8 },
      jaw: { pitch: 2 },
      ...wings(6, 0.1),
    },
    { root: { y: 0.3 } },
  );
}

export function restB() {
  return pose(
    {
      body: { ...FACE, pitch: 8 },
      neck: { pitch: 6 },
      head: { pitch: 4, yaw: -12 },
      jaw: { pitch: 6 },
      ...wings(6, 0.6),
    },
    { root: { y: 0.7 } },
  );
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  return pose(
    {
      body: { ...FACE, pitch: -6, roll: -10 },
      neck: { pitch: -8 },
      head: { pitch: -4, yaw: -20 },
      jaw: { pitch: 28 },
      ...wings(30, 0.3),
    },
    { root: { x: -1.1, y: 1.6 }, flash },
  );
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    {
      body: { ...FACE, pitch: 12 + u * 70, roll: u * 22 },
      neck: { pitch: 10 + u * 40 },
      head: { pitch: 8 + u * 24, yaw: -8 },
      jaw: { pitch: 8 + u * 20 },
      ...wings(8 + u * 10, 0.2 + u),
    },
    { root: { y: -u * 5, x: u * 2 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Fly ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
