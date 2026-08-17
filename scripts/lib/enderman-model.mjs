// Official Bedrock enderman: 8×8 head, 8×12 body, 2×30×2 arms and legs.
import { boxUv } from "./steve-model.mjs";

const LIMB = boxUv(56, 0, 2, 30, 2);

export const ENDERMAN_MODEL = [
  {
    id: "torso",
    label: "Torso",
    min: [-4, 30, -2],
    max: [4, 42, 2],
    pivot: [0, 30, 0],
    uv: boxUv(32, 16, 8, 12, 4),
  },
  {
    id: "head",
    label: "Head",
    parent: "torso",
    min: [-4, 42, -4],
    max: [4, 50, 4],
    pivot: [0, 42, 0],
    uv: boxUv(0, 0, 8, 8, 8),
  },
  {
    id: "arm-right",
    label: "Right arm",
    parent: "torso",
    min: [-6, 12, -1],
    max: [-4, 42, 1],
    pivot: [-5, 40, 0],
    uv: LIMB,
  },
  {
    id: "arm-left",
    label: "Left arm",
    parent: "torso",
    min: [4, 12, -1],
    max: [6, 42, 1],
    pivot: [5, 40, 0],
    uv: LIMB,
  },
  {
    id: "leg-right",
    label: "Right leg",
    min: [-3, 0, -1],
    max: [-1, 30, 1],
    pivot: [-2, 30, 0],
    uv: LIMB,
  },
  {
    id: "leg-left",
    label: "Left leg",
    min: [1, 0, -1],
    max: [3, 30, 1],
    pivot: [2, 30, 0],
    uv: LIMB,
  },
];
