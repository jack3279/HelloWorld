// Side-view pose library for a 2D platformer. The body faces screen-right
// (true profile). The head turns 45° toward the camera so the front of the
// face — both eyes, mustache, beard — stays readable.
//
// Limb `pitch` is the swing in the plane of motion: negative is forward
// (the direction the character faces), positive is back.
//
// Far limbs (the character's left, away from the camera) are slightly dimmed
// so the near arm and leg read as the foreground.

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

// Sword reach and death fall need more room in front and below the feet.
export const COMBAT_SPRITE = {
  w: 384,
  h: 336,
  scale: 6.6,
  originX: 168,
  originY: 308,
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
    flash: lerpNum(a.flash ?? 0, b.flash ?? 0, t),
    roll: lerpNum(a.roll ?? 0, b.roll ?? 0, t),
    opacity: lerpNum(a.opacity ?? 100, b.opacity ?? 100, t),
  };
}

export const SWING_FRAMES = 10;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 12;
export const SLEEP_FRAMES = 8;
export const EAT_FRAMES = 8;

function withSword(base, sword = {}) {
  return {
    ...base,
    parts: {
      ...base.parts,
      "held-sword": { pitch: -28, roll: 0, yaw: 0, ...sword },
    },
  };
}

export function swingWindup() {
  return withSword(
    pose(
      {
        torso: { pitch: -10, roll: -4 },
        head: { ...FACE, pitch: -4 },
        "arm-right": limb(NEAR, { pitch: 62, roll: 8 }),
        "arm-left": limb(FAR, { pitch: 22, roll: -6 }),
        "leg-right": limb(NEAR, { pitch: 8, roll: 0 }),
        "leg-left": limb(FAR, { pitch: -10, roll: 0 }),
      },
      { x: -0.4, y: 0.15 },
    ),
    { pitch: -8 },
  );
}

export function swingStrike() {
  return withSword(
    pose(
      {
        torso: { pitch: 8, roll: 6 },
        head: { ...FACE, pitch: 4 },
        "arm-right": limb(NEAR, { pitch: -118, roll: 4 }),
        "arm-left": limb(FAR, { pitch: 28, roll: -10 }),
        "leg-right": limb(NEAR, { pitch: -12, roll: 0 }),
        "leg-left": limb(FAR, { pitch: 10, roll: 0 }),
      },
      { x: 1.1, y: 0.35 },
    ),
    { pitch: -42 },
  );
}

export function swingFollow() {
  return withSword(
    pose(
      {
        torso: { pitch: 14, roll: 8 },
        head: { ...FACE, pitch: 8 },
        "arm-right": limb(NEAR, { pitch: -158, roll: 2 }),
        "arm-left": limb(FAR, { pitch: 18, roll: -4 }),
        "leg-right": limb(NEAR, { pitch: -6, roll: 0 }),
        "leg-left": limb(FAR, { pitch: 8, roll: 0 }),
      },
      { x: 0.6, y: 0.1 },
    ),
    { pitch: -55 },
  );
}

export function sampleSwing(t) {
  const keys = [
    { t: 0, pose: withSword(idleA()) },
    { t: 0.18, pose: swingWindup() },
    { t: 0.38, pose: swingStrike() },
    { t: 0.58, pose: swingFollow() },
    { t: 0.82, pose: withSword(idleA(), { pitch: -22 }) },
    { t: 1, pose: withSword(idleA()) },
  ];
  const x = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].t) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const u = (x - a.t) / (b.t - a.t || 1);
  return lerpPose(a.pose, b.pose, easeInOut(u));
}

export function hurtPose() {
  return {
    ...pose(
      {
        torso: { pitch: 12, roll: -6 },
        head: { ...FACE, pitch: 10, roll: -8 },
        "arm-right": limb(NEAR, { pitch: -48, roll: 12 }),
        "arm-left": limb(FAR, { pitch: 38, roll: -14 }),
        "leg-right": limb(NEAR, { pitch: 16, roll: 4 }),
        "leg-left": limb(FAR, { pitch: -18, roll: -4 }),
      },
      { x: -1.6, y: 0.55 },
    ),
    flash: 0.86,
  };
}

export function sampleHurt(t) {
  const x = Math.min(1, Math.max(0, t));
  const recoiled = lerpPose(idleA(), hurtPose(), x < 0.35 ? easeInOut(x / 0.35) : 1);
  const recovering = x < 0.35 ? recoiled : lerpPose(hurtPose(), idleA(), easeInOut((x - 0.35) / 0.65));
  const i = Math.round(x * (HURT_FRAMES - 1));
  const flash = i % 2 === 0 ? 0.88 * (1 - x * 0.55) : 0;
  return { ...recovering, flash };
}

export function deathPose() {
  return {
    ...pose(
      {
        torso: { pitch: 72, roll: 4 },
        head: { ...FACE, pitch: 18, roll: 8 },
        "arm-right": limb(NEAR, { pitch: -20, roll: 18 }),
        "arm-left": limb(FAR, { pitch: 8, roll: -12 }),
        "leg-right": limb(NEAR, { pitch: 42, roll: 6 }),
        "leg-left": limb(FAR, { pitch: 28, roll: -4 }),
      },
      { x: -2.2, y: -4.8 },
    ),
    roll: 28,
    flash: 0,
  };
}

export function sampleDeath(t) {
  const keys = [
    { t: 0, pose: { ...idleA(), flash: 0.9 } },
    { t: 0.12, pose: { ...hurtPose(), flash: 0.7 } },
    { t: 0.32, pose: lerpPose(hurtPose(), deathPose(), 0.35) },
    { t: 0.58, pose: lerpPose(hurtPose(), deathPose(), 0.72) },
    { t: 0.82, pose: deathPose() },
    { t: 1, pose: deathPose() },
  ];
  const x = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].t) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const u = (x - a.t) / (b.t - a.t || 1);
  const pose = lerpPose(a.pose, b.pose, easeInOut(u));
  const flash = x < 0.28 && Math.round(x * 10) % 2 === 0 ? 0.8 * (1 - x / 0.28) : 0;
  return { ...pose, flash };
}

// Lie on the side — calmer than death, knees tucked, head on the pillow.
export function sleepPose() {
  return {
    ...pose(
      {
        torso: { pitch: 80, roll: 2 },
        head: { ...FACE, pitch: 10, roll: 4 },
        "arm-right": limb(NEAR, { pitch: 16, roll: 8 }),
        "arm-left": limb(FAR, { pitch: 10, roll: -6 }),
        "leg-right": limb(NEAR, { pitch: 18, roll: 4 }),
        "leg-left": limb(FAR, { pitch: 12, roll: -2 }),
      },
      { x: -1.6, y: -5.1 },
    ),
    roll: 16,
  };
}

export function sleepBreathe() {
  return {
    ...pose(
      {
        torso: { pitch: 78, roll: 1 },
        head: { ...FACE, pitch: 6, roll: 2 },
        "arm-right": limb(NEAR, { pitch: 12, roll: 6 }),
        "arm-left": limb(FAR, { pitch: 8, roll: -4 }),
        "leg-right": limb(NEAR, { pitch: 14, roll: 3 }),
        "leg-left": limb(FAR, { pitch: 10, roll: -2 }),
      },
      { x: -1.5, y: -4.85 },
    ),
    roll: 15,
  };
}

export function sampleSleep(t) {
  const x = Math.min(1, Math.max(0, t));
  if (x < 0.32) return lerpPose(idleA(), sleepPose(), easeInOut(x / 0.32));
  const wave = (Math.sin(((x - 0.32) / 0.68) * Math.PI * 2) + 1) / 2;
  return lerpPose(sleepPose(), sleepBreathe(), easeInOut(wave));
}

export function eatBite() {
  return pose(
    {
      torso: { pitch: 6, roll: 2 },
      head: { ...FACE, pitch: 14 },
      "arm-right": limb(NEAR, { pitch: -102, roll: 18 }),
      "arm-left": limb(FAR, { pitch: 8, roll: 0 }),
      "leg-right": limb(NEAR, { pitch: 6, roll: 0 }),
      "leg-left": limb(FAR, { pitch: -2, roll: 0 }),
    },
    { x: 0.15, y: 0.1 },
  );
}

export function eatChew() {
  return pose(
    {
      torso: { pitch: 4, roll: 1 },
      head: { ...FACE, pitch: 6 },
      "arm-right": limb(NEAR, { pitch: -88, roll: 14 }),
      "arm-left": limb(FAR, { pitch: 6, roll: 0 }),
      "leg-right": limb(NEAR, { pitch: 4, roll: 0 }),
      "leg-left": limb(FAR, { pitch: -2, roll: 0 }),
    },
    { y: 0.05 },
  );
}

export function sampleEat(t) {
  const keys = [
    { t: 0, pose: idleA() },
    { t: 0.2, pose: eatBite() },
    { t: 0.38, pose: eatChew() },
    { t: 0.54, pose: eatBite() },
    { t: 0.7, pose: eatChew() },
    { t: 0.88, pose: lerpPose(eatBite(), idleA(), 0.5) },
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

// Every named frame a game or the Lottie flipbook can ask for.
export function catalog() {
  const run = Array.from({ length: 8 }, (_, i) => ({
    id: `run-${i}`,
    label: `Run ${i + 1}/8`,
    pose: runFrame(i / 8),
    tags: ["run"],
  }));
  const swing = Array.from({ length: SWING_FRAMES }, (_, i) => ({
    id: `swing-${i}`,
    label: `Sword ${i + 1}/${SWING_FRAMES}`,
    pose: sampleSwing(i / (SWING_FRAMES - 1)),
    tags: ["swing", "combat"],
  }));
  const hurt = Array.from({ length: HURT_FRAMES }, (_, i) => ({
    id: `hurt-${i}`,
    label: `Hurt ${i + 1}/${HURT_FRAMES}`,
    pose: sampleHurt(i / (HURT_FRAMES - 1)),
    tags: ["hurt", "combat"],
  }));
  const death = Array.from({ length: DEATH_FRAMES }, (_, i) => ({
    id: `death-${i}`,
    label: `Death ${i + 1}/${DEATH_FRAMES}`,
    pose: sampleDeath(i / (DEATH_FRAMES - 1)),
    tags: ["death", "combat"],
  }));
  const sleep = Array.from({ length: SLEEP_FRAMES }, (_, i) => ({
    id: `sleep-${i}`,
    label: `Sleep ${i + 1}/${SLEEP_FRAMES}`,
    pose: sampleSleep(i / (SLEEP_FRAMES - 1)),
    tags: ["sleep", "combat"],
  }));
  const eat = Array.from({ length: EAT_FRAMES }, (_, i) => ({
    id: `eat-${i}`,
    label: `Eat ${i + 1}/${EAT_FRAMES}`,
    pose: sampleEat(i / (EAT_FRAMES - 1)),
    tags: ["eat"],
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
    ...swing,
    ...hurt,
    ...death,
    ...sleep,
    ...eat,
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
  swing: {
    frames: Array.from({ length: SWING_FRAMES }, (_, i) => `swing-${i}`),
    fps: 12,
    loop: false,
  },
  hurt: {
    frames: Array.from({ length: HURT_FRAMES }, (_, i) => `hurt-${i}`),
    fps: 12,
    loop: false,
  },
  death: {
    frames: Array.from({ length: DEATH_FRAMES }, (_, i) => `death-${i}`),
    fps: 10,
    loop: false,
  },
  sleep: {
    frames: Array.from({ length: SLEEP_FRAMES }, (_, i) => `sleep-${i}`),
    fps: 6,
    loop: false,
  },
  eat: {
    frames: Array.from({ length: EAT_FRAMES }, (_, i) => `eat-${i}`),
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
