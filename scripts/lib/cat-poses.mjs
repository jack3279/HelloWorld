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

const base = createQuadrupedPoses({ scale: 12, h: 480, originY: 452, originX: 328 });

function decorate(pose) {
  const bodyPitch = pose.parts.body?.pitch ?? BODY_REST_PITCH;
  const wag = (pose.root?.x ?? 0) * 30 + (pose.root?.y ?? 0) * 20;
  pose.parts["ear-right"] = { pitch: 8, roll: -10 };
  pose.parts["ear-left"] = { pitch: 8, roll: 10 };
  pose.parts.tail1 = { pitch: bodyPitch - 10 + wag, yaw: -6 };
  pose.parts.tail2 = { pitch: bodyPitch + 12 + wag * 0.6, yaw: -4 };
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
