// Side-view horse. Body stays upright (not the pig 90° rest). Head yaws 45°.
const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: -45, pitch: 8, roll: 0 };
const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = { w: 512, h: 520, scale: 10, originX: 248, originY: 500 };
export const TOLERANCE = { default: 20, head: 12 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: 0, flash: extra.flash ?? 0 };
}

function limb(base, extra = {}) {
  return { ...base, ...extra };
}

function figure(legPitch, extra = {}) {
  const [fr, fl, hr, hl] = legPitch;
  return pose(
    {
      body: { pitch: extra.bodyPitch ?? 2, roll: extra.bodyRoll ?? 0 },
      saddle: {},
      neck: { pitch: extra.neckPitch ?? 22, yaw: FACE.yaw * 0.25 },
      mane: {},
      head: { ...FACE, pitch: extra.headPitch ?? FACE.pitch },
      mouth: {},
      "ear-left": { roll: 8 },
      "ear-right": { roll: -8 },
      tail: { pitch: extra.tailPitch ?? 20, yaw: extra.tailYaw ?? -8 },
      "leg-front-right": limb(NEAR, { pitch: fr }),
      "leg-front-left": limb(FAR, { pitch: fl }),
      "leg-hind-right": limb(NEAR, { pitch: hr }),
      "leg-hind-left": limb(FAR, { pitch: hl }),
    },
    extra,
  );
}

export function idleA() {
  return figure([4, -3, -3, 4]);
}

export function idleB() {
  return figure([3, -2, -2, 3], { root: { y: 0.2 }, headPitch: 4, neckPitch: 20 });
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
  const stride = Math.sin(tau);
  const bob = Math.sin(tau * 2);
  return figure([-stride * 22, stride * 22, stride * 20, -stride * 20], {
    root: { y: Math.max(0, bob) * 0.45 },
    bodyPitch: 3 + bob,
    bodyRoll: stride * 2,
    neckPitch: 18 + bob * 2,
    headPitch: 6 + bob,
    tailPitch: 16 + stride * 10,
    tailYaw: -6 + stride * 8,
  });
}

export function restA() {
  return figure([16, 12, -14, -10], { root: { y: -0.8 }, neckPitch: 36, headPitch: 22, tailPitch: 8 });
}

export function restB() {
  return figure([14, 10, -12, -12], { root: { y: -0.6 }, neckPitch: 32, headPitch: 18, tailPitch: 12 });
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  const recoil = Math.sin(Math.min(1, t * 1.4) * Math.PI) * 10;
  return figure([18, 12, -16, -10], {
    root: { x: -recoil * 0.05, y: recoil * 0.03 },
    bodyRoll: -recoil * 0.2,
    neckPitch: 8,
    headPitch: -6,
    flash,
  });
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return figure([24, 20, -22, -18], {
    root: { y: -u * 4, x: -u * 1.4 },
    bodyPitch: 2 + u * 70,
    bodyRoll: u * 10,
    neckPitch: 22 + u * 30,
    headPitch: 10 + u * 24,
    tailPitch: 8,
  });
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
