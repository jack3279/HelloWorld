import { FACE, TOLERANCE, WALK_FRAMES, createQuadrupedPoses } from "./quadruped-poses.mjs";

export const {
  SPRITE,
  idleA,
  idleB,
  sampleIdle,
  walkFrame,
  catalog,
  easeInOut,
  lerpPose,
  BODY_REST_PITCH,
} = createQuadrupedPoses({ scale: 16, h: 480, originY: 452 });

export { FACE, TOLERANCE, WALK_FRAMES };
