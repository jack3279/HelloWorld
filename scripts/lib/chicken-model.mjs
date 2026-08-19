// Official Minecraft chicken from Bedrock geometry.chicken: feet-origin, +Y up.
// Z is negated so the bird faces +z. The body cuboid is stored unrotated
// (6×8×6); poses apply the vanilla 90° rest pitch. Head, beak, comb, wings,
// and legs stay on the root so that pitch does not flip the face.
import { boxUv } from "./steve-model.mjs";

const LEG_UV = boxUv(26, 0, 3, 5, 3);
const WING_UV = boxUv(24, 13, 1, 4, 6);

export const CHICKEN_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-3, 4, -3],
    max: [3, 12, 3],
    pivot: [0, 8, 0],
    uv: boxUv(0, 9, 6, 8, 6),
  },
  {
    id: "head",
    label: "Head",
    min: [-2, 9, 3],
    max: [2, 15, 6],
    pivot: [0, 9, 4],
    uv: boxUv(0, 0, 4, 6, 3),
  },
  {
    id: "beak",
    label: "Beak",
    parent: "head",
    min: [-2, 11, 6],
    max: [2, 13, 8],
    pivot: [0, 9, 4],
    uv: boxUv(14, 0, 4, 2, 2),
  },
  {
    id: "comb",
    label: "Wattle",
    parent: "head",
    min: [-1, 9, 5],
    max: [1, 11, 7],
    pivot: [0, 9, 4],
    uv: boxUv(14, 4, 2, 2, 2),
  },
  {
    id: "leg-right",
    label: "Right leg",
    min: [-3, 0, -1],
    max: [0, 5, 2],
    pivot: [-2, 5, -1],
    uv: LEG_UV,
  },
  {
    id: "leg-left",
    label: "Left leg",
    min: [0, 0, -1],
    max: [3, 5, 2],
    pivot: [1, 5, -1],
    uv: LEG_UV,
  },
  {
    id: "wing-right",
    label: "Right wing",
    min: [-4, 7, -3],
    max: [-3, 11, 3],
    pivot: [-3, 11, 0],
    uv: WING_UV,
  },
  {
    id: "wing-left",
    label: "Left wing",
    min: [3, 7, -3],
    max: [4, 11, 3],
    pivot: [3, 11, 0],
    uv: WING_UV,
  },
];
