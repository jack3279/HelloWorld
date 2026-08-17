// Side-view enderman. Tall limbs hang almost to the ground. Head turns 45°
// so the purple eyes read. Teleport frames add a root jitter plus opacity.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 2, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = {
  w: 512,
  h: 640,
  scale: 9.4,
  originX: 252,
  originY: 612,
};

export const TOLERANCE = { default: 8, head: 4 };

export const WALK_FRAMES = 16;
export const TELEPORT_FRAMES = 14;

function pose(parts, root = {}, extra = {}) {
  return { view: SIDE_VIEW, root, parts, opacity: extra.opacity ?? 100 };
}

function limb(base, extra = {}) {
  return { ...base, ...extra };
}

export function idleA() {
  return pose({
    torso: { pitch: 1, roll: 0 },
    head: { ...FACE },
    "arm-right": limb(NEAR, { pitch: 4, roll: 2 }),
    "arm-left": limb(FAR, { pitch: -3, roll: -2 }),
    "leg-right": limb(NEAR, { pitch: 3, roll: 1 }),
    "leg-left": limb(FAR, { pitch: -2, roll: -1 }),
  });
}

export function idleB() {
  return pose(
    {
      torso: { pitch: 0, roll: 0 },
      head: { ...FACE, pitch: 0 },
      "arm-right": limb(NEAR, { pitch: 2, roll: 1 }),
      "arm-left": limb(FAR, { pitch: -1, roll: -1 }),
      "leg-right": limb(NEAR, { pitch: 2, roll: 1 }),
      "leg-left": limb(FAR, { pitch: -1, roll: -1 }),
    },
    { y: 0.2 },
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
    opacity: lerpNum(a.opacity ?? 100, b.opacity ?? 100, t),
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
  const stride = Math.sin(tau);
  const bob = Math.sin(tau * 2);
  return pose(
    {
      torso: { pitch: 2 + bob * 1.5, roll: stride * 1.5 },
      head: { ...FACE, pitch: 2 + bob, roll: stride * -2 },
      "arm-right": limb(NEAR, { pitch: 4 + stride * 14, roll: 2 }),
      "arm-left": limb(FAR, { pitch: -3 - stride * 14, roll: -2 }),
      "leg-right": limb(NEAR, { pitch: -stride * 22, roll: 1 }),
      "leg-left": limb(FAR, { pitch: stride * 22, roll: -1 }),
    },
    { y: Math.abs(bob) * 0.35, x: stride * 0.1 },
  );
}

export function teleportFrame(phase) {
  const t = ((phase % 1) + 1) % 1;
  const flicker = [100, 100, 55, 0, 100, 20, 100, 0, 80, 100, 40, 100, 100, 100];
  const idx = Math.min(flicker.length - 1, Math.floor(t * flicker.length));
  const jitter = flicker[idx] < 90 ? (idx % 2 === 0 ? 1.6 : -1.8) : 0;
  const base = idleA();
  return pose(
    {
      ...base.parts,
      head: { ...FACE, pitch: 2 + jitter * 2, roll: jitter },
    },
    { x: jitter, y: Math.abs(jitter) * 0.3 },
    { opacity: flicker[idx] },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
    tags: ["walk"],
  }));
}
