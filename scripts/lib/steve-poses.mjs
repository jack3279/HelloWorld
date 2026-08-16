// Side-view pose library for a 2D platformer. The body faces screen-right
// (true profile). The head turns 45° toward the camera so the front of the
// face — both eyes, mustache, beard — stays readable.
//
// Limb `pitch` is the swing in the plane of motion: negative is forward
// (the direction the character faces), positive is back.
//
// Upper-arm / thigh pitch is the shoulder or hip. Forearm pitch is the elbow
// (negative folds the hand forward). Shin pitch is the knee (positive folds
// the foot back). Far limbs (the character's left) are slightly dimmed so the
// near arm and leg read as the foreground.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

// Body stays in profile. The head turns 45° toward the camera so both eyes
// and the mustache read on the front of the cube.
const FACE = { yaw: -45, pitch: 0, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const SPRITE = {
  w: 256,
  h: 320,
  scale: 6.6,
  originX: 128,
  originY: 300,
};

export const TOLERANCE = { default: 30, head: 12 };

function pose(parts, root = {}) {
  return { view: SIDE_VIEW, root, parts };
}

function limb(base, extra = {}) {
  return { ...base, ...extra };
}

function armLeg(side, { shoulder, elbow, hip, knee, roll = 0 }) {
  const base = side === "right" ? NEAR : FAR;
  return {
    [`arm-${side}`]: limb(base, { pitch: shoulder, roll }),
    [`forearm-${side}`]: limb(base, { pitch: elbow, roll: 0 }),
    [`leg-${side}`]: limb(base, { pitch: hip, roll }),
    [`shin-${side}`]: limb(base, { pitch: knee, roll: 0 }),
  };
}

export function idleA() {
  return pose({
    torso: { pitch: -2, roll: 0 },
    head: { ...FACE },
    ...armLeg("right", { shoulder: 8, elbow: -18, hip: 3, knee: 8 }),
    ...armLeg("left", { shoulder: -5, elbow: -14, hip: -2, knee: 6 }),
  });
}

export function idleB() {
  return pose(
    {
      torso: { pitch: -1, roll: 0 },
      head: { ...FACE },
      ...armLeg("right", { shoulder: 5, elbow: -16, hip: 2, knee: 6 }),
      ...armLeg("left", { shoulder: -2, elbow: -12, hip: -1, knee: 5 }),
    },
    { y: 0.25 },
  );
}

// One run cycle. Phase is 0..1; the first and last samples meet so a flipbook
// loops without a hitch.
export function runFrame(phase) {
  const tau = (phase % 1) * Math.PI * 2;
  const arm = Math.sin(tau);
  const leg = Math.sin(tau);
  const bob = Math.sin(tau * 2);
  // Elbow and knee close on the trailing limb, open on the leading one.
  const trail = (v) => Math.max(0, v);
  return pose(
    {
      torso: { pitch: -6 + bob * 3, roll: 0 },
      head: { ...FACE, pitch: 2 - bob },
      ...armLeg("right", {
        shoulder: 12 + arm * 78,
        elbow: -22 - trail(arm) * 42,
        hip: -leg * 42,
        knee: 10 + trail(-leg) * 48,
      }),
      ...armLeg("left", {
        shoulder: -8 - arm * 72,
        elbow: -22 - trail(-arm) * 42,
        hip: leg * 42,
        knee: 10 + trail(leg) * 48,
      }),
    },
    { y: Math.max(0, bob) * 0.7, x: arm * 0.15 },
  );
}

export function jumpCrouch() {
  return pose({
    torso: { pitch: 14, roll: 0 },
    head: { ...FACE, pitch: 8 },
    ...armLeg("right", { shoulder: 48, elbow: -52, hip: 28, knee: 54 }),
    ...armLeg("left", { shoulder: 36, elbow: -44, hip: 22, knee: 48 }),
  });
}

export function jumpRise() {
  return pose(
    {
      torso: { pitch: -12, roll: 0 },
      head: { ...FACE, pitch: -6 },
      ...armLeg("right", { shoulder: -148, elbow: -28, hip: -8, knee: 12 }),
      ...armLeg("left", { shoulder: -132, elbow: -22, hip: 6, knee: 18 }),
    },
    { y: 7 },
  );
}

export function jumpApex() {
  return pose(
    {
      torso: { pitch: -4, roll: 0 },
      head: { ...FACE, pitch: -2 },
      ...armLeg("right", { shoulder: -158, elbow: -18, hip: -18, knee: 8 }),
      ...armLeg("left", { shoulder: -118, elbow: -36, hip: 22, knee: 38 }),
    },
    { y: 11 },
  );
}

export function jumpFall() {
  return pose(
    {
      torso: { pitch: 8, roll: 0 },
      head: { ...FACE, pitch: 6 },
      ...armLeg("right", { shoulder: -88, elbow: -34, hip: -28, knee: 16 }),
      ...armLeg("left", { shoulder: -54, elbow: -28, hip: 12, knee: 22 }),
    },
    { y: 5.5 },
  );
}

export function jumpLand() {
  return pose({
    torso: { pitch: 16, roll: 0 },
    head: { ...FACE, pitch: 10 },
    ...armLeg("right", { shoulder: 28, elbow: -40, hip: 26, knee: 50 }),
    ...armLeg("left", { shoulder: 18, elbow: -34, hip: 18, knee: 44 }),
  });
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
  };
}

// Every named frame a game or the Lottie flipbook can ask for.
export function catalog() {
  const run = Array.from({ length: 8 }, (_, i) => ({
    id: `run-${i}`,
    label: `Run ${i + 1}/8`,
    pose: runFrame(i / 8),
    tags: ["run"],
  }));
  return [
    { id: "idle-a", label: "Idle A", pose: idleA(), tags: ["idle"] },
    { id: "idle-b", label: "Idle B", pose: idleB(), tags: ["idle"] },
    ...run,
    { id: "jump-crouch", label: "Jump crouch", pose: jumpCrouch(), tags: ["jump"] },
    { id: "jump-rise", label: "Jump rise", pose: jumpRise(), tags: ["jump"] },
    { id: "jump-apex", label: "Jump apex", pose: jumpApex(), tags: ["jump"] },
    { id: "jump-fall", label: "Jump fall", pose: jumpFall(), tags: ["jump"] },
    { id: "jump-land", label: "Jump land", pose: jumpLand(), tags: ["jump"] },
  ];
}

export const ANIMATIONS = {
  idle: { frames: ["idle-a", "idle-b"], fps: 6, loop: true },
  run: {
    frames: ["run-0", "run-1", "run-2", "run-3", "run-4", "run-5", "run-6", "run-7"],
    fps: 12,
    loop: true,
  },
  jump: {
    frames: ["jump-crouch", "jump-rise", "jump-apex", "jump-fall", "jump-land"],
    fps: 10,
    loop: false,
  },
};

export function sampleIdle(t) {
  const x = ((t % 1) + 1) % 1;
  return x < 0.5
    ? lerpPose(idleA(), idleB(), easeInOut(x * 2))
    : lerpPose(idleB(), idleA(), easeInOut((x - 0.5) * 2));
}

export function sampleJump(t) {
  const keys = [
    { t: 0, pose: jumpCrouch() },
    { t: 0.16, pose: jumpCrouch() },
    { t: 0.38, pose: jumpRise() },
    { t: 0.52, pose: jumpApex() },
    { t: 0.72, pose: jumpFall() },
    { t: 0.86, pose: jumpLand() },
    { t: 1, pose: idleA() },
  ];
  const x = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].t) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const u = (x - a.t) / (b.t - a.t || 1);
  return lerpPose(a.pose, b.pose, easeInOut(u));
}

// One looping reel: breathe, run twice, jump, settle. Counts are unique poses.
export function demoReel() {
  const frames = [];
  for (let i = 0; i < 8; i++) frames.push({ id: `idle-${i}`, pose: sampleIdle(i / 8) });
  for (let cycle = 0; cycle < 2; cycle++) {
    for (let i = 0; i < 16; i++) {
      frames.push({ id: `run-${cycle}-${i}`, pose: runFrame(i / 16) });
    }
  }
  frames.push({
    id: "run-to-crouch",
    pose: lerpPose(runFrame(0), jumpCrouch(), 0.55),
  });
  for (let i = 0; i < 14; i++) frames.push({ id: `jump-${i}`, pose: sampleJump(i / 13) });
  return frames;
}
