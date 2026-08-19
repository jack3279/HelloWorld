import {
  DEATH_FRAMES,
  FACE,
  HURT_FRAMES,
  IDLE_FRAMES,
  REST_FRAMES,
  TOLERANCE,
  WALK_FRAMES,
  catalog as villagerCatalog,
  idleA as villagerIdleA,
  idleB as villagerIdleB,
  sampleDeath as villagerDeath,
  sampleHurt as villagerHurt,
  sampleIdle as villagerIdle,
  sampleRest as villagerRest,
  walkFrame as villagerWalk,
} from "./villager-poses.mjs";

export const SPRITE = { w: 512, h: 560, scale: 11, originX: 236, originY: 530 };

function hat(pose) {
  pose.parts.hat = { pitch: 0, roll: 0 };
  pose.parts.hat2 = { pitch: -3, roll: 1.5 };
  pose.parts.hat3 = { pitch: -6, roll: 3 };
  pose.parts.hat4 = { pitch: -12, roll: 6 };
  pose.parts.wart = {};
  return pose;
}

export const idleA = () => hat(villagerIdleA());
export const idleB = () => hat(villagerIdleB());
export const sampleIdle = (t) => hat(villagerIdle(t));
export const sampleRest = (t) => hat(villagerRest(t));
export const walkFrame = (phase) => hat(villagerWalk(phase));
export const catalog = () =>
  villagerCatalog().map((entry) => ({ ...entry, pose: hat(entry.pose) }));
export const sampleHurt = (t) => hat(villagerHurt(t));
export const sampleDeath = (t) => hat(villagerDeath(t));

export { DEATH_FRAMES, FACE, HURT_FRAMES, IDLE_FRAMES, REST_FRAMES, TOLERANCE, WALK_FRAMES };
