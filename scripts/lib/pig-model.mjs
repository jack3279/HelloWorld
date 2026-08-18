// Official Minecraft pig: vanilla QuadrupedModel with leg height 6 plus a snout.
// The body cuboid is stored unrotated (10×16×8); poses apply the vanilla 90°
// rest pitch so it lies on the legs. Head and snout sit on the root — parenting
// them to the body would flip the face with that pitch.
//
// Units match the player pipeline: texels, +y up, +z facing, origin between the
// feet. Vanilla Y is flipped (`ourY = 24 - vanillaY`) and Z is negated so the
// entity faces +z.
import { boxUv } from "./steve-model.mjs";

const LEG_UV = boxUv(0, 16, 4, 6, 4);

export const PIG_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-5, 7, -3],
    max: [5, 23, 5],
    pivot: [0, 13, -2],
    uv: boxUv(28, 8, 10, 16, 8),
  },
  {
    id: "head",
    label: "Head",
    min: [-4, 8, 6],
    max: [4, 16, 14],
    pivot: [0, 12, 6],
    uv: boxUv(0, 0, 8, 8, 8),
  },
  {
    id: "snout",
    label: "Snout",
    parent: "head",
    min: [-2, 9, 14],
    max: [2, 12, 15],
    pivot: [0, 12, 6],
    uv: boxUv(16, 16, 4, 3, 1),
  },
  {
    id: "leg-front-right",
    label: "Front right leg",
    min: [-5, 0, 3],
    max: [-1, 6, 7],
    pivot: [-3, 6, 5],
    uv: LEG_UV,
  },
  {
    id: "leg-front-left",
    label: "Front left leg",
    min: [1, 0, 3],
    max: [5, 6, 7],
    pivot: [3, 6, 5],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-right",
    label: "Hind right leg",
    min: [-5, 0, -9],
    max: [-1, 6, -5],
    pivot: [-3, 6, -7],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-left",
    label: "Hind left leg",
    min: [1, 0, -9],
    max: [5, 6, -5],
    pivot: [3, 6, -7],
    uv: LEG_UV,
  },
];
