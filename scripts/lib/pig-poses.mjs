import { FACE, IDLE_FRAMES, REST_FRAMES, TOLERANCE, WALK_FRAMES, createQuadrupedPoses } from "./quadruped-poses.mjs";

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
  easeInOut,
  lerpPose,
  BODY_REST_PITCH,
} = createQuadrupedPoses({ scale: 16, h: 480, originY: 452 });

export { FACE, IDLE_FRAMES, REST_FRAMES, TOLERANCE, WALK_FRAMES };
