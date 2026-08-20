import {
  DEATH_FRAMES,
  FACE,
  HURT_FRAMES,
  IDLE_FRAMES,
  REST_FRAMES,
  TOLERANCE,
  WALK_FRAMES,
  createQuadrupedPoses,
} from "./quadruped-poses.mjs";

export const {
  SPRITE,
  idleA,
  idleB,
  sampleIdle,
  restA,
  restB,
  sampleRest,
  walkFrame,
  catalog,
  sampleHurt,
  sampleDeath,
  easeInOut,
  lerpPose,
  BODY_REST_PITCH,
} = createQuadrupedPoses({ scale: 13, h: 480, originY: 452 });

export { DEATH_FRAMES, FACE, HURT_FRAMES, IDLE_FRAMES, REST_FRAMES, TOLERANCE, WALK_FRAMES };
