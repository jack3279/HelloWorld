// Side-view squid. Tentacles hang and pulse; swim is a vertical bob.
import { SQUID_MODEL } from "./squid-model.mjs";

const SIDE_VIEW = { yaw: 90, pitch: 0 };
export const FACE = { yaw: -20, pitch: 8, roll: 0 };

export const SPRITE = { w: 512, h: 520, scale: 10, originX: 256, originY: 500 };
export const TOLERANCE = { default: 22, head: 16 };
export const WALK_FRAMES = 16;
export const IDLE_FRAMES = 8;
export const REST_FRAMES = 8;
export const HURT_FRAMES = 8;
export const DEATH_FRAMES = 8;

function tentacleYaw(id) {
  return SQUID_MODEL.find((p) => p.id === id)?.restYaw ?? 0;
}

function tentacles(pitch) {
  const parts = {};
  for (let i = 1; i <= 8; i++) {
    const id = `tentacle-${i}`;
    parts[id] = { yaw: tentacleYaw(id), pitch };
  }
  return parts;
}

function pose(parts, extra = {}) {
  return { view: SIDE_VIEW, root: extra.root ?? {}, parts, swell: extra.swell ?? 0, flash: extra.flash ?? 0 };
}

export function idleA() {
  return pose({ body: { pitch: 2, ...FACE }, ...tentacles(8) });
}

export function idleB() {
  return pose({ body: { pitch: 0, ...FACE, pitch: 4 }, ...tentacles(14) }, { root: { y: 0.35 } });
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
  const pulse = Math.sin(tau);
  return pose(
    { body: { pitch: 4 + pulse * 6, yaw: FACE.yaw }, ...tentacles(10 + pulse * 16) },
    { root: { y: 0.8 + pulse * 1.1 }, swell: Math.max(0, pulse) * 0.08 },
  );
}

export function restA() {
  return pose({ body: { pitch: 12, yaw: FACE.yaw }, ...tentacles(28) }, { root: { y: -0.6 } });
}

export function restB() {
  return pose({ body: { pitch: 8, yaw: FACE.yaw }, ...tentacles(22) }, { root: { y: -0.4 } });
}

export function sampleRest(t) {
  const u = easeInOut(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
  return lerpPose(restA(), restB(), u);
}

export function sampleHurt(t) {
  const flash = t < 0.45 ? 1 : 0;
  const recoil = Math.sin(Math.min(1, t * 1.4) * Math.PI) * 10;
  return pose(
    { body: { pitch: 16, roll: recoil * 0.2, yaw: FACE.yaw }, ...tentacles(36) },
    { root: { y: recoil * 0.06, x: -recoil * 0.04 }, flash },
  );
}

export function sampleDeath(t) {
  const u = easeInOut(Math.min(1, t));
  return pose(
    { body: { pitch: 8 + u * 70, roll: u * 10, yaw: FACE.yaw }, ...tentacles(8 + u * 40) },
    { root: { y: -u * 3, x: u * 1.4 } },
  );
}

export function catalog() {
  return Array.from({ length: WALK_FRAMES }, (_, i) => ({
    id: `walk-${i}`,
    label: `Walk ${i + 1}/${WALK_FRAMES}`,
    pose: walkFrame(i / WALK_FRAMES),
  }));
}
