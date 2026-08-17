// Official Bedrock skeleton: Steve layout with 2×12×2 limbs.
import { boxUv } from "./steve-model.mjs";

const ARM = boxUv(40, 16, 2, 12, 2);
const LEG = boxUv(0, 16, 2, 12, 2);

export const SKELETON_MODEL = [
  {
    id: "torso",
    label: "Torso",
    min: [-4, 12, -2],
    max: [4, 24, 2],
    pivot: [0, 12, 0],
    uv: boxUv(16, 16, 8, 12, 4),
  },
  {
    id: "head",
    label: "Head",
    parent: "torso",
    min: [-4, 24, -4],
    max: [4, 32, 4],
    pivot: [0, 24, 0],
    uv: boxUv(0, 0, 8, 8, 8),
  },
  {
    id: "arm-right",
    label: "Right arm",
    parent: "torso",
    min: [-6, 12, -1],
    max: [-4, 24, 1],
    pivot: [-5, 22, 0],
    uv: ARM,
  },
  {
    id: "arm-left",
    label: "Left arm",
    parent: "torso",
    min: [4, 12, -1],
    max: [6, 24, 1],
    pivot: [5, 22, 0],
    uv: ARM,
  },
  {
    id: "leg-right",
    label: "Right leg",
    min: [-3, 0, -1],
    max: [-1, 12, 1],
    pivot: [-2, 12, 0],
    uv: LEG,
  },
  {
    id: "leg-left",
    label: "Left leg",
    min: [1, 0, -1],
    max: [3, 12, 1],
    pivot: [2, 12, 0],
    uv: LEG,
  },
];
