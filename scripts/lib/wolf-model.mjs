// Official Minecraft wolf from Bedrock geometry.wolf: feet-origin, +Y up,
// Z negated so the animal faces +z. Body and mane are stored unrotated
// (body 6×9×6, mane 8×6×7); poses apply a −90° rest pitch — the sign flips
// relative to vanilla +90° because Z was negated. Head, ears, and muzzle stay
// on the root so that pitch does not flip the face. Tail hangs off the rump.
import { boxUv } from "./steve-model.mjs";

const LEG_UV = boxUv(0, 18, 2, 8, 2);
const EAR_UV = boxUv(16, 14, 2, 2, 1);

export const WOLF_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-3, 3, -5],
    max: [3, 12, 1],
    pivot: [0, 10, -2],
    uv: boxUv(18, 14, 6, 9, 6),
  },
  {
    id: "mane",
    label: "Mane",
    min: [-4, 7, -6],
    max: [4, 13, 1],
    pivot: [-1, 10, -2],
    uv: boxUv(21, 0, 8, 6, 7),
  },
  {
    id: "head",
    label: "Head",
    min: [-3, 7.5, 5],
    max: [3, 13.5, 9],
    pivot: [-1, 10.5, 7],
    uv: boxUv(0, 0, 6, 6, 4),
  },
  {
    id: "ear-right",
    label: "Right ear",
    parent: "head",
    min: [-3, 13.5, 6],
    max: [-1, 15.5, 7],
    pivot: [-1, 10.5, 7],
    uv: EAR_UV,
  },
  {
    id: "ear-left",
    label: "Left ear",
    parent: "head",
    min: [1, 13.5, 6],
    max: [3, 15.5, 7],
    pivot: [-1, 10.5, 7],
    uv: EAR_UV,
  },
  {
    id: "muzzle",
    label: "Muzzle",
    parent: "head",
    min: [-1.5, 7.5, 8],
    max: [1.5, 10.5, 12],
    pivot: [-1, 10.5, 7],
    uv: boxUv(0, 10, 3, 3, 4),
  },
  {
    id: "leg-front-right",
    label: "Front right leg",
    min: [-2.5, 0, 3],
    max: [-0.5, 8, 5],
    pivot: [-2.5, 8, 4],
    uv: LEG_UV,
  },
  {
    id: "leg-front-left",
    label: "Front left leg",
    min: [0.5, 0, 3],
    max: [2.5, 8, 5],
    pivot: [0.5, 8, 4],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-right",
    label: "Hind right leg",
    min: [-2.5, 0, -8],
    max: [-0.5, 8, -6],
    pivot: [-2.5, 8, -7],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-left",
    label: "Hind left leg",
    min: [0.5, 0, -8],
    max: [2.5, 8, -6],
    pivot: [0.5, 8, -7],
    uv: LEG_UV,
  },
  {
    id: "tail",
    label: "Tail",
    min: [-1, 4, -9],
    max: [1, 12, -7],
    pivot: [-1, 12, -8],
    uv: boxUv(9, 18, 2, 8, 2),
  },
];
