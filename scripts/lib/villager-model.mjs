// Official Minecraft villager from Bedrock geometry.villager.v1.8: feet-origin,
// +Y up, Z negated so the figure faces +z. Head is 8×10×8 with a nose; both
// arms hang from one shared pivot so they swing together in front of the robe.
import { boxUv } from "./steve-model.mjs";

const ARM_UV = boxUv(44, 22, 4, 8, 4);
const LEG_UV = boxUv(0, 22, 4, 12, 4);

export const VILLAGER_MODEL = [
  {
    id: "torso",
    label: "Torso",
    min: [-4, 12, -3],
    max: [4, 24, 3],
    pivot: [0, 12, 0],
    uv: boxUv(16, 20, 8, 12, 6),
  },
  {
    id: "robe",
    label: "Robe",
    parent: "torso",
    min: [-4.5, 6, -3.5],
    max: [4.5, 24.5, 3.5],
    pivot: [0, 12, 0],
    uv: boxUv(0, 38, 8, 18, 6),
  },
  {
    id: "head",
    label: "Head",
    parent: "torso",
    min: [-4, 24, -4],
    max: [4, 34, 4],
    pivot: [0, 24, 0],
    uv: boxUv(0, 0, 8, 10, 8),
  },
  {
    id: "nose",
    label: "Nose",
    parent: "head",
    min: [-1, 23, 4],
    max: [1, 27, 6],
    pivot: [0, 24, 0],
    uv: boxUv(24, 0, 2, 4, 2),
  },
  {
    id: "arms",
    label: "Arms bar",
    parent: "torso",
    min: [-4, 16, -2],
    max: [4, 20, 2],
    pivot: [0, 22, 0],
    uv: boxUv(40, 38, 8, 4, 4),
  },
  {
    id: "arm-right",
    label: "Right arm",
    parent: "torso",
    min: [-8, 16, -2],
    max: [-4, 24, 2],
    pivot: [0, 22, 0],
    uv: ARM_UV,
  },
  {
    id: "arm-left",
    label: "Left arm",
    parent: "torso",
    min: [4, 16, -2],
    max: [8, 24, 2],
    pivot: [0, 22, 0],
    uv: ARM_UV,
  },
  {
    id: "leg-right",
    label: "Right leg",
    min: [-4, 0, -2],
    max: [0, 12, 2],
    pivot: [-2, 12, 0],
    uv: LEG_UV,
  },
  {
    id: "leg-left",
    label: "Left leg",
    min: [0, 0, -2],
    max: [4, 12, 2],
    pivot: [2, 12, 0],
    uv: LEG_UV,
  },
];
