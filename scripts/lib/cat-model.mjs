// Official Minecraft cat / ocelot from Bedrock geometry.cat: feet-origin,
// +Y up, Z negated so the animal faces +z. Body is stored unrotated (4×16×6);
// poses apply the vanilla 90° rest pitch. Head, muzzle, and ears stay on the
// root so that pitch does not flip the face.
import { boxUv } from "./steve-model.mjs";

const LEG_FRONT_UV = boxUv(40, 0, 2, 10, 2);
const LEG_BACK_UV = boxUv(8, 13, 2, 6, 2);
const EAR_UV = boxUv(0, 10, 1, 1, 2);

export const CAT_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-2, 6, -3],
    max: [2, 22, 3],
    pivot: [0, 12, 0],
    uv: boxUv(20, 0, 4, 16, 6),
  },
  {
    id: "head",
    label: "Head",
    min: [-2.5, 8, 8],
    max: [2.5, 12, 13],
    pivot: [0, 10, 8],
    uv: boxUv(0, 0, 5, 4, 5),
  },
  {
    id: "snout",
    label: "Muzzle",
    parent: "head",
    min: [-1.5, 8, 13],
    max: [1.5, 10, 15],
    pivot: [0, 10, 8],
    uv: boxUv(0, 24, 3, 2, 2),
  },
  {
    id: "ear-right",
    label: "Right ear",
    parent: "head",
    min: [-2.5, 12, 9],
    max: [-1.5, 13, 11],
    pivot: [0, 10, 8],
    uv: EAR_UV,
  },
  {
    id: "ear-left",
    label: "Left ear",
    parent: "head",
    min: [1.5, 12, 9],
    max: [2.5, 13, 11],
    pivot: [0, 10, 8],
    uv: boxUv(6, 10, 1, 1, 2),
  },
  {
    id: "leg-front-right",
    label: "Front right leg",
    min: [-2.2, 0, 3],
    max: [-0.2, 6, 5],
    pivot: [-1.2, 6, 4],
    uv: LEG_FRONT_UV,
  },
  {
    id: "leg-front-left",
    label: "Front left leg",
    min: [0.2, 0, 3],
    max: [2.2, 6, 5],
    pivot: [1.2, 6, 4],
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
    min: [-0.5, 7, -9],
    max: [0.5, 15, -8],
    pivot: [0, 15, -8],
    uv: boxUv(0, 15, 1, 8, 1),
  },
  {
    id: "tail2",
    label: "Tail tip",
    parent: "tail1",
    min: [-0.5, 7, -10],
    max: [0.5, 15, -9],
    pivot: [0, 15, -9],
    uv: boxUv(4, 15, 1, 8, 1),
  },
];
