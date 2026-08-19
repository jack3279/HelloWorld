// Official Minecraft cat from Bedrock geometry.cat: feet-origin, +Y up,
// Z negated so the animal faces +z. Body is stored unrotated (4×16×6) from
// origin y=−1; poses apply the vanilla 90° rest pitch. Head, muzzle, and ears
// stay on the root so that pitch does not flip the face. Front legs are 10
// tall; hind legs are 6. Tail cuboids are world-space like the body — tail2
// is a sibling, not a child, so the rest pitch does not swing it twice.
import { boxUv } from "./steve-model.mjs";

const LEG_FRONT_UV = boxUv(40, 0, 2, 10, 2);
const LEG_BACK_UV = boxUv(8, 13, 2, 6, 2);
const EAR_UV = boxUv(0, 10, 1, 1, 2);

export const CAT_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-2, -1, -4],
    max: [2, 15, 2],
    pivot: [0, 7, -1],
    uv: boxUv(20, 0, 4, 16, 6),
  },
  {
    id: "head",
    label: "Head",
    min: [-2.5, 7, 7],
    max: [2.5, 11, 12],
    pivot: [0, 9, 9],
    uv: boxUv(0, 0, 5, 4, 5),
  },
  {
    id: "snout",
    label: "Muzzle",
    parent: "head",
    min: [-1.5, 7, 11],
    max: [1.5, 9, 13],
    pivot: [0, 9, 9],
    uv: boxUv(0, 24, 3, 2, 2),
  },
  {
    id: "ear-right",
    label: "Right ear",
    parent: "head",
    min: [-2, 11, 7],
    max: [-1, 12, 9],
    pivot: [0, 9, 9],
    uv: EAR_UV,
  },
  {
    id: "ear-left",
    label: "Left ear",
    parent: "head",
    min: [1, 11, 7],
    max: [2, 12, 9],
    pivot: [0, 9, 9],
    uv: boxUv(6, 10, 1, 1, 2),
  },
  {
    id: "leg-front-right",
    label: "Front right leg",
    min: [-2.2, 0.2, 3],
    max: [-0.2, 10.2, 5],
    pivot: [-1.2, 10, 4],
    uv: LEG_FRONT_UV,
  },
  {
    id: "leg-front-left",
    label: "Front left leg",
    min: [0.2, 0.2, 3],
    max: [2.2, 10.2, 5],
    pivot: [1.2, 10, 4],
    uv: LEG_FRONT_UV,
  },
  {
    id: "leg-hind-right",
    label: "Hind right leg",
    min: [-2.1, 0, -8],
    max: [-0.1, 6, -6],
    pivot: [-1.1, 6, -7],
    uv: LEG_BACK_UV,
  },
  {
    id: "leg-hind-left",
    label: "Hind left leg",
    min: [0.1, 0, -8],
    max: [2.1, 6, -6],
    pivot: [1.1, 6, -7],
    uv: LEG_BACK_UV,
  },
  {
    id: "tail1",
    label: "Tail",
    min: [-0.5, 1, -9],
    max: [0.5, 9, -8],
    pivot: [0, 9, -8],
    uv: boxUv(0, 15, 1, 8, 1),
  },
  {
    id: "tail2",
    label: "Tail tip",
    min: [-0.5, 1, -17],
    max: [0.5, 9, -16],
    pivot: [0, 9, -16],
    uv: boxUv(4, 15, 1, 8, 1),
  },
];
