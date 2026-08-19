// Official Minecraft fox from Bedrock geometry.fox: feet-origin, +Y up,
// Z negated so the animal faces +z. Body is stored unrotated (6×11×6);
// poses apply the vanilla 90° rest pitch. Head, ears, and muzzle stay on
// the root so that pitch does not flip the face.
import { boxUv } from "./steve-model.mjs";

const LEG_UV_R = boxUv(14, 24, 2, 6, 2);
const LEG_UV_L = boxUv(22, 24, 2, 6, 2);

export const FOX_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-3, 0, -3],
    max: [3, 11, 3],
    pivot: [0, 8, 0],
    uv: boxUv(30, 15, 6, 11, 6),
  },
  {
    id: "head",
    label: "Head",
    min: [-4, 4, 3],
    max: [4, 10, 9],
    pivot: [0, 8, 3],
    uv: boxUv(0, 0, 8, 6, 6),
  },
  {
    id: "ear-right",
    label: "Right ear",
    parent: "head",
    min: [-4, 10, 7],
    max: [-2, 12, 8],
    pivot: [0, 8, 3],
    uv: boxUv(0, 0, 2, 2, 1),
  },
  {
    id: "ear-left",
    label: "Left ear",
    parent: "head",
    min: [2, 10, 7],
    max: [4, 12, 8],
    pivot: [0, 8, 3],
    uv: boxUv(22, 0, 2, 2, 1),
  },
  {
    id: "muzzle",
    label: "Muzzle",
    parent: "head",
    min: [-2, 4, 9],
    max: [2, 6, 12],
    pivot: [0, 8, 3],
    uv: boxUv(0, 24, 4, 2, 3),
  },
  {
    id: "leg-front-right",
    label: "Front right leg",
    min: [-3, 0, 0],
    max: [-1, 6, 2],
    pivot: [-3, 6, 1],
    uv: LEG_UV_R,
  },
  {
    id: "leg-front-left",
    label: "Front left leg",
    min: [1, 0, 0],
    max: [3, 6, 2],
    pivot: [1, 6, 1],
    uv: LEG_UV_L,
  },
  {
    id: "leg-hind-right",
    label: "Hind right leg",
    min: [-3, 0, -7],
    max: [-1, 6, -5],
    pivot: [-3, 6, -6],
    uv: LEG_UV_R,
  },
  {
    id: "leg-hind-left",
    label: "Hind left leg",
    min: [1, 0, -7],
    max: [3, 6, -5],
    pivot: [1, 6, -6],
    uv: LEG_UV_L,
  },
  {
    id: "tail",
    label: "Tail",
    min: [-2, -2, -9.75],
    max: [2, 7, -4.75],
    pivot: [0, 8, -7],
    uv: boxUv(28, 0, 4, 9, 5),
  },
];
