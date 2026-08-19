// Side-view pig / cow. The body is the vanilla quadruped cuboid pitched 90°
// onto its belly. Head, snout, and horns stay on the root so that pitch does
// not flip the face. The head yaws 45° toward the camera so both eyes read.
//
// Walk is the in-game opposite-corner trot. Limb `pitch` is the swing in the
// plane of motion: negative is forward.

const SIDE_VIEW = { yaw: 90, pitch: 0 };

export const FACE = { yaw: -45, pitch: 4, roll: 0 };

const FAR = { shadeScale: 0.84 };
const NEAR = { shadeScale: 1 };

export const BODY_REST_PITCH = 90;
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;
export const TOLERANCE = { default: 28, head: 18 };

const FAR_NEAR = { FAR, NEAR };

export function createQuadrupedPoses({ scale = 14, h = 480, originY = 452, originX = 256 } = {}) {
  const SPRITE = { w: 512, h, scale, originX, originY };

  function pose(parts, extra = {}) {
    return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: 0, flash: extra.flash ?? 0 };
  }

  function limb(base, extra = {}) {
    return { ...base, ...extra };
  }

  function idleA() {
    return pose({
      body: { pitch: BODY_REST_PITCH + 2, roll: 0 },
      head: { ...FACE },
      "leg-front-right": limb(NEAR, { pitch: 4 }),
      "leg-front-left": limb(FAR, { pitch: -3 }),
      "leg-hind-right": limb(NEAR, { pitch: -3 }),
      "leg-hind-left": limb(FAR, { pitch: 4 }),
    });
  }

  function idleB() {
    return pose(
      {
        body: { pitch: BODY_REST_PITCH + 1, roll: 0 },
        head: { ...FACE, pitch: 2 },
        "leg-front-right": limb(NEAR, { pitch: 3 }),
        "leg-front-left": limb(FAR, { pitch: -2 }),
        "leg-hind-right": limb(NEAR, { pitch: -2 }),
        "leg-hind-left": limb(FAR, { pitch: 3 }),
      },
      { root: { y: 0.2 } },
    );
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  }

  function lerpNum(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpPose(a, b, t) {
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
      swell: 0,
      flash: lerpNum(a.flash ?? 0, b.flash ?? 0, t),
    };
  }

  function sampleIdle(t) {
    const x = ((t % 1) + 1) % 1;
    return x < 0.5
      ? lerpPose(idleA(), idleB(), easeInOut(x * 2))
      : lerpPose(idleB(), idleA(), easeInOut((x - 0.5) * 2));
  }

  // Drowsy rest: head droops, legs tuck, the body sinks a little onto the
  // ground. Used when a pig or cow has been standing still for a while.
  function restA() {
    return pose(
      {
        body: { pitch: BODY_REST_PITCH + 7, roll: 3 },
        head: { yaw: -38, pitch: 18, roll: 6 },
        "leg-front-right": limb(NEAR, { pitch: 22 }),
        "leg-front-left": limb(FAR, { pitch: 16 }),
        "leg-hind-right": limb(NEAR, { pitch: -20 }),
        "leg-hind-left": limb(FAR, { pitch: -14 }),
      },
      { root: { y: -1.1 } },
    );
  }

  function restB() {
    return pose(
      {
        body: { pitch: BODY_REST_PITCH + 5, roll: 1 },
        head: { yaw: -42, pitch: 22, roll: 3 },
        "leg-front-right": limb(NEAR, { pitch: 18 }),
        "leg-front-left": limb(FAR, { pitch: 12 }),
        "leg-hind-right": limb(NEAR, { pitch: -16 }),
        "leg-hind-left": limb(FAR, { pitch: -18 }),
      },
      { root: { y: -0.85 } },
    );
  }

  function sampleRest(t) {
    const x = ((t % 1) + 1) % 1;
    return x < 0.5
      ? lerpPose(restA(), restB(), easeInOut(x * 2))
      : lerpPose(restB(), restA(), easeInOut((x - 0.5) * 2));
  }

  function walkFrame(phase) {
    const tau = (phase % 1) * Math.PI * 2;
    const step = Math.sin(tau);
    const bob = Math.sin(tau * 2);
    return pose(
      {
        body: { pitch: BODY_REST_PITCH + 3 + bob * 1.5, roll: step * 1.5 },
        head: { ...FACE, pitch: 4 + bob * 2, roll: step * -2 },
        "leg-front-right": limb(NEAR, { pitch: -step * 32 }),
        "leg-hind-left": limb(FAR, { pitch: -step * 30 }),
        "leg-front-left": limb(FAR, { pitch: step * 30 }),
        "leg-hind-right": limb(NEAR, { pitch: step * 32 }),
      },
      { root: { y: 0.15 + Math.abs(bob) * 0.25, x: step * 0.12 } },
    );
  }

  function catalog() {
    return Array.from({ length: WALK_FRAMES }, (_, i) => ({
      id: `walk-${i}`,
      label: `Walk ${i + 1}/${WALK_FRAMES}`,
      pose: walkFrame(i / WALK_FRAMES),
      tags: ["walk"],
    }));
  }

  function hurtPose() {
    return pose(
      {
        body: { pitch: BODY_REST_PITCH + 10, roll: -8 },
        head: { ...FACE, pitch: -6, roll: -8 },
        "leg-front-right": limb(NEAR, { pitch: 18 }),
        "leg-front-left": limb(FAR, { pitch: 12 }),
        "leg-hind-right": limb(NEAR, { pitch: -16 }),
        "leg-hind-left": limb(FAR, { pitch: -10 }),
      },
      { root: { x: -1.2, y: 0.35 }, flash: 0.86 },
    );
  }

  function sampleHurt(t) {
    const x = Math.min(1, Math.max(0, t));
    const recoiled = lerpPose(idleA(), hurtPose(), x < 0.35 ? easeInOut(x / 0.35) : 1);
    const recovering = x < 0.35 ? recoiled : lerpPose(hurtPose(), idleA(), easeInOut((x - 0.35) / 0.65));
    const i = Math.round(x * (HURT_FRAMES - 1));
    const flash = i % 2 === 0 ? 0.88 * (1 - x * 0.55) : 0;
    return { ...recovering, flash };
  }

  function deathPose() {
    return pose(
      {
        body: { pitch: BODY_REST_PITCH + 12, roll: 8 },
        head: { yaw: -30, pitch: 28, roll: 10 },
        "leg-front-right": limb(NEAR, { pitch: 28 }),
        "leg-front-left": limb(FAR, { pitch: 22 }),
        "leg-hind-right": limb(NEAR, { pitch: -26 }),
        "leg-hind-left": limb(FAR, { pitch: -20 }),
      },
      { root: { x: -0.6, y: -1.8 } },
    );
  }

  function sampleDeath(t) {
    const x = Math.min(1, Math.max(0, t));
    const keys = [
      { t: 0, pose: { ...idleA(), flash: 0.8 } },
      { t: 0.18, pose: { ...hurtPose(), flash: 0.55 } },
      { t: 0.48, pose: lerpPose(hurtPose(), deathPose(), 0.55) },
      { t: 0.78, pose: deathPose() },
      { t: 1, pose: deathPose() },
    ];
    let i = 0;
    while (i < keys.length - 2 && x > keys[i + 1].t) i += 1;
    const a = keys[i];
    const b = keys[i + 1];
    const u = (x - a.t) / (b.t - a.t || 1);
    return { ...lerpPose(a.pose, b.pose, easeInOut(u)), flash: x < 0.22 ? 0.7 * (1 - x / 0.22) : 0 };
  }

  return {
    SPRITE,
    FACE,
    WALK_FRAMES,
    BODY_REST_PITCH,
    idleA,
    idleB,
    sampleIdle,
    restA,
    restB,
    sampleRest,
    walkFrame,
    catalog,
    hurtPose,
    sampleHurt,
    deathPose,
    sampleDeath,
    easeInOut,
    lerpPose,
  };
}

export { FAR_NEAR };
