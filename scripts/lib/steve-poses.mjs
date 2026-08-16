// Side-view pose library for a 2D platformer. The character faces screen-right.
//
// `view.yaw` is a few degrees shy of a true profile so the front of the head
// (eyes, mustache, beard) stays readable — a 2.5D platformer read, not a
// silhouette. Limb `pitch` is the swing in the plane of motion: negative is
// forward (the direction the character faces), positive is back.
//
// Far limbs (the character's left, away from the camera) are slightly dimmed
// so the near arm and leg read as the foreground.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

// Head stays in plane with the body. Eyes and mustache are stamped onto the
// leading edge of the side of the head in the model painter.
const FACE = { yaw: 0, pitch: 0, roll: 0 };

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

export function idleA() {
  return pose({
    torso: { pitch: -2, roll: 0 },
    head: { ...FACE },
    "arm-right": limb(NEAR, { pitch: 8, roll: 0 }),
    "arm-left": limb(FAR, { pitch: -5, roll: 0 }),
    "leg-right": limb(NEAR, { pitch: 3, roll: 0 }),
    "leg-left": limb(FAR, { pitch: -2, roll: 0 }),
  });
}

export function idleB() {
  return pose(
    {
      torso: { pitch: -1, roll: 0 },
      head: { ...FACE },
      "arm-right": limb(NEAR, { pitch: 5, roll: 0 }),
      "arm-left": limb(FAR, { pitch: -2, roll: 0 }),
      "leg-right": limb(NEAR, { pitch: 2, roll: 0 }),
      "leg-left": limb(FAR, { pitch: -1, roll: 0 }),
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
  return pose(
    {
      torso: { pitch: -6 + bob * 3, roll: 0 },
      head: { ...FACE, pitch: 2 - bob },
      "arm-right": limb(NEAR, { pitch: 12 + arm * 78, roll: 0 }),
      "arm-left": limb(FAR, { pitch: -8 - arm * 72, roll: 0 }),
      "leg-right": limb(NEAR, { pitch: -leg * 42, roll: 0 }),
      "leg-left": limb(FAR, { pitch: leg * 42, roll: 0 }),
    },
    { y: Math.max(0, bob) * 0.7, x: arm * 0.15 },
  );
}

export function jumpCrouch() {
  return pose({
    torso: { pitch: 14, roll: 0 },
    head: { ...FACE, pitch: 8 },
    "arm-right": limb(NEAR, { pitch: 48, roll: 0 }),
    "arm-left": limb(FAR, { pitch: 36, roll: 0 }),
    "leg-right": limb(NEAR, { pitch: 22, roll: 0 }),
    "leg-left": limb(FAR, { pitch: 16, roll: 0 }),
  });
}

export function jumpRise() {
  return pose(
    {
      torso: { pitch: -12, roll: 0 },
      head: { ...FACE, pitch: -6 },
      "arm-right": limb(NEAR, { pitch: -148, roll: 0 }),
      "arm-left": limb(FAR, { pitch: -132, roll: 0 }),
      "leg-right": limb(NEAR, { pitch: -8, roll: 0 }),
      "leg-left": limb(FAR, { pitch: 6, roll: 0 }),
    },
    { y: 7 },
  );
}

export function jumpApex() {
  return pose(
    {
      torso: { pitch: -4, roll: 0 },
      head: { ...FACE, pitch: -2 },
      "arm-right": limb(NEAR, { pitch: -158, roll: 0 }),
      "arm-left": limb(FAR, { pitch: -118, roll: 0 }),
      "leg-right": limb(NEAR, { pitch: -18, roll: 0 }),
      "leg-left": limb(FAR, { pitch: 22, roll: 0 }),
    },
    { y: 11 },
  );
}

export function jumpFall() {
  return pose(
    {
      torso: { pitch: 8, roll: 0 },
      head: { ...FACE, pitch: 6 },
      "arm-right": limb(NEAR, { pitch: -88, roll: 0 }),
      "arm-left": limb(FAR, { pitch: -54, roll: 0 }),
      "leg-right": limb(NEAR, { pitch: -28, roll: 0 }),
      "leg-left": limb(FAR, { pitch: 12, roll: 0 }),
    },
    { y: 5.5 },
  );
}

export function jumpLand() {
  return pose({
    torso: { pitch: 16, roll: 0 },
    head: { ...FACE, pitch: 10 },
    "arm-right": limb(NEAR, { pitch: 28, roll: 0 }),
    "arm-left": limb(FAR, { pitch: 18, roll: 0 }),
    "leg-right": limb(NEAR, { pitch: 24, roll: 0 }),
    "leg-left": limb(FAR, { pitch: 14, roll: 0 }),
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
