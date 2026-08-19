// Official Minecraft parrot from Bedrock geometry.parrot: feet-origin, +Y up,
// Z negated so the bird faces +z. The body stays upright (no quadruped pitch).
import { boxUv } from "./steve-model.mjs";

const WING_UV = boxUv(19, 8, 1, 5, 3);
const LEG_UV = boxUv(14, 18, 1, 2, 1);

export const PARROT_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-1.5, 1.5, 1.5],
    max: [1.5, 7.5, 4.5],
    pivot: [0, 7.5, 3],
    uv: boxUv(2, 8, 3, 6, 3),
  },
  {
    id: "head",
    label: "Head",
    min: [-1, 6.8, 1.8],
    max: [1, 9.8, 3.8],
    pivot: [0, 8.3, 2.8],
    uv: boxUv(2, 2, 2, 3, 2),
  },
  {
    id: "crest",
    label: "Beak ridge",
    parent: "head",
    min: [-1, 9.8, 1.8],
    max: [1, 10.8, 5.8],
    pivot: [0, 8.3, 2.8],
    uv: boxUv(10, 0, 2, 1, 4),
  },
  {
    id: "beak",
    label: "Beak",
    parent: "head",
    min: [-0.5, 7.8, 3.7],
    max: [0.5, 9.8, 4.7],
    pivot: [0, 8.3, 2.8],
    uv: boxUv(11, 7, 1, 2, 1),
  },
  {
    id: "beak-tip",
    label: "Beak tip",
    parent: "head",
    min: [-0.5, 8.1, 4.7],
    max: [0.5, 9.8, 5.7],
    pivot: [0, 8.3, 2.8],
    uv: boxUv(16, 7, 1, 2, 1),
  },
  {
    id: "tail",
    label: "Tail",
    min: [-1.5, -0.1, -1.2],
    max: [1.5, 3.9, -0.2],
    pivot: [0, 2.9, -1.2],
    uv: boxUv(22, 1, 3, 4, 1),
  },
  {
    id: "wing-right",
    label: "Right wing",
    min: [-2, 2.1, 1.3],
    max: [-1, 7.1, 4.3],
    pivot: [-1.5, 7.1, 2.8],
    uv: WING_UV,
  },
  {
    id: "wing-left",
    label: "Left wing",
    min: [1, 2.1, 1.3],
    max: [2, 7.1, 4.3],
    pivot: [1.5, 7.1, 2.8],
    uv: WING_UV,
  },
  {
    id: "leg-right",
    label: "Right leg",
    min: [-1.5, -0.5, 0.5],
    max: [-0.5, 1.5, 1.5],
    pivot: [-0.5, 1, 0.5],
    uv: LEG_UV,
  },
  {
    id: "leg-left",
    label: "Left leg",
    min: [0.5, -0.5, 0.5],
    max: [1.5, 1.5, 1.5],
    pivot: [1.5, 1, 0.5],
    uv: LEG_UV,
  },
];
