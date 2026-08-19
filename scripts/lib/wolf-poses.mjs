import {
  BODY_REST_PITCH,
  DEATH_FRAMES,
  FACE,
  HURT_FRAMES,
  IDLE_FRAMES,
  REST_FRAMES,
  TOLERANCE,
  WALK_FRAMES,
  createQuadrupedPoses,
} from "./quadruped-poses.mjs";

const base = createQuadrupedPoses({ scale: 16.5, h: 480, originY: 452 });

function decorate(pose) {
  // After Z-flip, vanilla +90° body pitch sends the torso toward the tail and
  // leaves a gap at the head. Negating it lays the 9-tall cuboid toward +z.
  const rest = pose.parts.body?.pitch ?? BODY_REST_PITCH;
  const bodyPitch = -rest;
  const bodyRoll = pose.parts.body?.roll ?? 0;
  const wag = (pose.root?.x ?? 0) * 40 + (pose.root?.y ?? 0) * 18;
  pose.parts.body = { ...pose.parts.body, pitch: bodyPitch };
  pose.parts.mane = { pitch: bodyPitch, roll: bodyRoll };
  pose.parts.tail = { pitch: 52 + wag, yaw: -18, roll: bodyRoll * 0.5 };
  return pose;
}

export const SPRITE = base.SPRITE;
export const idleA = () => decorate(base.idleA());
export const idleB = () => decorate(base.idleB());
export const sampleIdle = (t) => decorate(base.sampleIdle(t));
export const restA = () => decorate(base.restA());
export const restB = () => decorate(base.restB());
export const sampleRest = (t) => decorate(base.sampleRest(t));
export const walkFrame = (phase) => decorate(base.walkFrame(phase));
export const catalog = () =>
  base.catalog().map((entry) => ({ ...entry, pose: decorate(entry.pose) }));
export const sampleHurt = (t) => decorate(base.sampleHurt(t));
export const sampleDeath = (t) => decorate(base.sampleDeath(t));
export const easeInOut = base.easeInOut;
export const lerpPose = base.lerpPose;

export { BODY_REST_PITCH, DEATH_FRAMES, FACE, HURT_FRAMES, IDLE_FRAMES, REST_FRAMES, TOLERANCE, WALK_FRAMES };
