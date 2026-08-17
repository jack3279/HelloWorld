// Side-view spider. Thorax faces screen-right; the head turns 45° so the
// red eyes read. Legs splay down with roll and spread along the body with yaw.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 2, roll: 0 };

const FAR = { shadeScale: 0.82 };
const NEAR = { shadeScale: 1 };

export const SPRITE = {
  w: 512,
  h: 400,
  scale: 10.5,
  originX: 248,
  originY: 318,
};

export const TOLERANCE = { default: 22, head: 10 };

export const WALK_FRAMES = 16;
export const REAR_FRAMES = 14;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 12;

function pose(parts, root = {}) {
  return { view: SIDE_VIEW, root, parts };
}

function limb(base, extra = {}) {
  return { ...base, ...extra };
}

// Rest pose matching SpiderModel: opposite corners, 45° down, yaw fan.
function restLegs(motion = {}) {
  const { i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0 } = motion;
  return {
    leg0: limb(NEAR, { yaw: 45 + i, roll: 48 + m, pitch: 4 }),
    leg1: limb(FAR, { yaw: -45 + i, roll: -48 - m, pitch: 4 }),
    leg2: limb(NEAR, { yaw: 22 + j, roll: 48 + n, pitch: 2 }),
    leg3: limb(FAR, { yaw: -22 + j, roll: -48 - n, pitch: 2 }),
    leg4: limb(NEAR, { yaw: -22 + k, roll: 48 + o, pitch: -2 }),
    leg5: limb(FAR, { yaw: 22 + k, roll: -48 - o, pitch: -2 }),
    leg6: limb(NEAR, { yaw: -45 + l, roll: 48 + p, pitch: -4 }),
    leg7: limb(FAR, { yaw: 45 + l, roll: -48 - p, pitch: -4 }),
  };
}

export function idleA() {
  return pose({
    body: { pitch: 2, roll: 0 },
    head: { ...FACE },
    abdomen: { pitch: -4, roll: 0 },
    ...restLegs(),
  });
}

export function idleB() {
  return pose(
    {
      body: { pitch: 1, roll: 0 },
      head: { ...FACE, pitch: 0 },
      abdomen: { pitch: -2, roll: 0 },
      ...restLegs({ m: 2, n: 1, o: 1, p: 2 }),
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

// Opposite-corner crawl, from SpiderModel.setupAnim (degrees).
export function walkFrame(phase) {
  const tau = (phase % 1) * Math.PI * 2;
  const step = Math.sin(tau);
  const a = -Math.cos(tau) * 18;
  const b = -Math.cos(tau + Math.PI) * 18;
  const c = -Math.cos(tau + Math.PI / 2) * 18;
  const d = -Math.cos(tau + (Math.PI * 3) / 2) * 18;
  const lift = (phaseOffset) => Math.abs(Math.sin(tau + phaseOffset)) * 12;
  const bob = Math.sin(tau * 2);
  return pose(
    {
      body: { pitch: 3 + bob * 2, roll: step * 3 },
      head: { ...FACE, pitch: 2 + bob * 3, roll: step * -3 },
      abdomen: { pitch: -6 - bob * 3, roll: step * -2 },
      ...restLegs({
        i: a,
        j: b,
        k: c,
        l: d,
        m: lift(0),
        n: lift(Math.PI),
        o: lift(Math.PI / 2),
        p: lift((Math.PI * 3) / 2),
      }),
    },
    { y: 0.15 + Math.abs(bob) * 0.35, x: step * 0.2 },
  );
}

export function rearFrame(phase) {
  const t = ((phase % 1) + 1) % 1;
  const up = t < 0.4 ? easeInOut(t / 0.4) : t > 0.72 ? 1 - easeInOut((t - 0.72) / 0.28) : 1;
  const base = idleA();
  return {
    ...base,
    parts: {
      ...base.parts,
      body: { pitch: 2 - 22 * up, roll: 0 },
      head: { ...FACE, pitch: 2 - 8 * up },
      abdomen: { pitch: -4 - 10 * up },
      leg0: limb(NEAR, { yaw: 45, roll: 48 - 18 * up, pitch: -28 * up }),
      leg1: limb(FAR, { yaw: -45, roll: -48 + 18 * up, pitch: -28 * up }),
      leg2: limb(NEAR, { yaw: 22, roll: 48 - 10 * up, pitch: -12 * up }),
      leg3: limb(FAR, { yaw: -22, roll: -48 + 10 * up, pitch: -12 * up }),
    },
    root: { y: up * 1.2, x: -up * 0.4 },
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

export function hurtPose() {
  return {
    ...pose(
      {
        body: { pitch: 10, roll: -8 },
        head: { ...FACE, pitch: 8, roll: -6 },
        abdomen: { pitch: 6, roll: 4 },
        ...restLegs({ m: 16, n: 14, o: 14, p: 16, i: 8, j: -6, k: 6, l: -8 }),
      },
      { x: -1.2, y: 0.8 },
    ),
    flash: 0.86,
  };
}

export function sampleHurt(t) {
  const x = Math.min(1, Math.max(0, t));
  const recoiled = lerpPose(idleA(), hurtPose(), x < 0.35 ? easeInOut(x / 0.35) : 1);
  const recovering = x < 0.35 ? recoiled : lerpPose(hurtPose(), idleA(), easeInOut((x - 0.35) / 0.65));
  const i = Math.round(x * (HURT_FRAMES - 1));
  const flash = i % 2 === 0 ? 0.9 * (1 - x * 0.55) : 0;
  return { ...recovering, flash };
}

export function deathPose() {
  return {
    ...pose(
      {
        body: { pitch: 8, roll: 0 },
        head: { ...FACE, pitch: 16 },
        abdomen: { pitch: 18 },
        leg0: limb(NEAR, { yaw: 55, roll: 88, pitch: 20 }),
        leg1: limb(FAR, { yaw: -55, roll: -88, pitch: 20 }),
        leg2: limb(NEAR, { yaw: 28, roll: 90, pitch: 12 }),
        leg3: limb(FAR, { yaw: -28, roll: -90, pitch: 12 }),
        leg4: limb(NEAR, { yaw: -28, roll: 90, pitch: -8 }),
        leg5: limb(FAR, { yaw: 28, roll: -90, pitch: -8 }),
        leg6: limb(NEAR, { yaw: -55, roll: 88, pitch: -16 }),
        leg7: limb(FAR, { yaw: 55, roll: -88, pitch: -16 }),
      },
      { x: -0.6, y: -1.4 },
    ),
    roll: 162,
    flash: 0,
  };
}

export function sampleDeath(t) {
  const x = Math.min(1, Math.max(0, t));
  const keys = [
    { t: 0, pose: { ...idleA(), flash: 0.9 } },
    { t: 0.14, pose: { ...hurtPose(), flash: 0.65 } },
    { t: 0.4, pose: lerpPose(hurtPose(), deathPose(), 0.45) },
    { t: 0.68, pose: lerpPose(hurtPose(), deathPose(), 0.82) },
    { t: 0.88, pose: deathPose() },
    { t: 1, pose: deathPose() },
  ];
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].t) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const u = (x - a.t) / (b.t - a.t || 1);
  const out = lerpPose(a.pose, b.pose, easeInOut(u));
  const flash = x < 0.26 && Math.round(x * 10) % 2 === 0 ? 0.82 * (1 - x / 0.26) : 0;
  return { ...out, flash };
}
