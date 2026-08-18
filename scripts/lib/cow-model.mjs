// Official Minecraft cow: vanilla CowModel (head 8×8×6, horns, 12×18×10 body
// pitched 90°, 12-tall legs, udder). Same coordinate conversion as the pig —
// `ourY = 24 - vanillaY`, Z negated so the animal faces +z. Head, horns, and
// body are siblings on the root; the udder is a child of the body so the rest
// pitch carries it.
import { boxUv } from "./steve-model.mjs";

const LEG_UV = boxUv(0, 16, 4, 12, 4);
const HORN_UV = boxUv(22, 0, 1, 3, 1);

export const COW_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-6, 9, -3],
    max: [6, 29, 5],
    pivot: [0, 19, -2],
    uv: boxUv(18, 4, 12, 18, 10),
  },
  {
    id: "udder",
    label: "Udder",
    parent: "body",
    min: [-2, 11, 5],
    max: [2, 17, 6],
    pivot: [0, 19, -2],
    uv: boxUv(52, 0, 4, 6, 1),
  },
  {
    id: "head",
    label: "Head",
    min: [-4, 16, 8],
    max: [4, 24, 14],
    pivot: [0, 20, 8],
    uv: boxUv(0, 0, 8, 8, 6),
  },
  {
    id: "horn-right",
    label: "Right horn",
    parent: "head",
    min: [-5, 22, 11],
    max: [-4, 25, 12],
    pivot: [0, 20, 8],
    uv: HORN_UV,
  },
  {
    id: "horn-left",
    label: "Left horn",
    parent: "head",
    min: [4, 22, 11],
    max: [5, 25, 12],
    pivot: [0, 20, 8],
    uv: HORN_UV,
  },
  {
    id: "leg-front-right",
    label: "Front right leg",
    min: [-6, 0, 4],
    max: [-2, 12, 8],
    pivot: [-4, 12, 6],
    uv: LEG_UV,
  },
  {
    id: "leg-front-left",
    label: "Front left leg",
    min: [2, 0, 4],
    max: [6, 12, 8],
    pivot: [4, 12, 6],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-right",
    label: "Hind right leg",
    min: [-6, 0, -9],
    max: [-2, 12, -5],
    pivot: [-4, 12, -7],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-left",
    label: "Hind left leg",
    min: [2, 0, -9],
    max: [6, 12, -5],
    pivot: [4, 12, -7],
    uv: LEG_UV,
  },
];
