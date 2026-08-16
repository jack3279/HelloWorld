// Side-view creeper. The body faces screen-right. The head turns 45° toward
// the camera so the front face — both eyes and the frown — stays readable.
//
// Walk is the in-game quadruped trot: opposite corners swing together.
// Swell is the fuse charge — the model grows and flashes white.
//
// Limb `pitch` is the swing in the plane of motion: negative is forward.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 4, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = {
  w: 512,
  h: 480,
  scale: 13.5,
  originX: 256,
  originY: 452,
};

export const TOLERANCE = { default: 28, head: 10 };

export const WALK_FRAMES = 16;
export const SWELL_FRAMES = 20;

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: extra.swell ?? 0, flash: extra.flash ?? 0 };
}

function limb(base, extra = {}) {
  return { ...base, ...extra };
}

export function idleA() {
  return pose({
    body: { pitch: 2, roll: 0 },
    head: { ...FACE },
    "leg-front-right": limb(NEAR, { pitch: 4 }),
    "leg-front-left": limb(FAR, { pitch: -3 }),
    "leg-hind-right": limb(NEAR, { pitch: -3 }),
    "leg-hind-left": limb(FAR, { pitch: 4 }),
  });
}

export function idleB() {
  return pose(
    {
      body: { pitch: 1, roll: 0 },
      head: { ...FACE, pitch: 2 },
      "leg-front-right": limb(NEAR, { pitch: 3 }),
      "leg-front-left": limb(FAR, { pitch: -2 }),
      "leg-hind-right": limb(NEAR, { pitch: -2 }),
      "leg-hind-left": limb(FAR, { pitch: 3 }),
    },
    { root: { y: 0.2 } },
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
  };
}

export function sampleIdle(t) {
  const x = ((t % 1) + 1) % 1;
  return x < 0.5
    ? lerpPose(idleA(), idleB(), easeInOut(x * 2))
    : lerpPose(idleB(), idleA(), easeInOut((x - 0.5) * 2));
}

// Opposite corners travel together, matching CreeperModel.setupAnim.
export function walkFrame(phase) {
  const tau = (phase % 1) * Math.PI * 2;
  const step = Math.sin(tau);
  const bob = Math.sin(tau * 2);
  return pose(
    {
      body: { pitch: 3 + bob * 1.5, roll: step * 1.5 },
      head: { ...FACE, pitch: 4 + bob * 2, roll: step * -2 },
      "leg-front-right": limb(NEAR, { pitch: -step * 32 }),
      "leg-hind-left": limb(FAR, { pitch: -step * 30 }),
      "leg-front-left": limb(FAR, { pitch: step * 30 }),
      "leg-hind-right": limb(NEAR, { pitch: step * 32 }),
    },
    { root: { y: 0.15 + Math.abs(bob) * 0.25, x: step * 0.12 } },
  );
}

// Fuse charge: grow and flash white, flicker near the peak, then snap back.
export function swellFrame(phase) {
  const t = ((phase % 1) + 1) % 1;
  const charge = t < 0.72 ? easeInOut(t / 0.72) : 1 - easeInOut((t - 0.72) / 0.28);
  const flicker = t > 0.4 && t < 0.78 && Math.sin(t * 48) > 0 ? 0.18 : 0;
  const base = idleA();
  return {
    ...base,
    parts: {
      ...base.parts,
      head: { ...FACE, pitch: 6 + charge * 4 },
      body: { pitch: 2 + charge * 3 },
    },
    swell: charge,
    flash: Math.min(0.92, charge * 0.78 + flicker),
    root: { y: charge * 0.4 },
  };
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
    tags: ["walk"],
  }));
}
