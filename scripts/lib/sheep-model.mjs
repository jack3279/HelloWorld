// Official Minecraft sheep: vanilla SheepModel (head 6×6×8, 8×16×6 body
// pitched 90°, 12-tall legs). Same coordinate conversion as the pig and cow —
// `ourY = 24 - vanillaY`, Z negated so the animal faces +z. Head and body sit
// on the root so the rest pitch does not flip the face.
import { boxUv } from "./steve-model.mjs";

const LEG_UV = boxUv(0, 16, 4, 12, 4);

export const SHEEP_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-4, 11, -2],
    max: [4, 27, 4],
    pivot: [0, 19, -2],
    uv: boxUv(28, 8, 8, 16, 6),
  },
  {
    id: "head",
    label: "Head",
    min: [-3, 16, 6],
    max: [3, 22, 14],
    pivot: [0, 18, 8],
    uv: boxUv(0, 0, 6, 6, 8),
  },
  {
    id: "leg-front-right",
    label: "Front right leg",
    min: [-5, 0, 3],
    max: [-1, 12, 7],
    pivot: [-3, 12, 5],
    uv: LEG_UV,
  },
  {
    id: "leg-front-left",
    label: "Front left leg",
    min: [1, 0, 3],
    max: [5, 12, 7],
    pivot: [3, 12, 5],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-right",
    label: "Hind right leg",
    min: [-5, 0, -9],
    max: [-1, 12, -5],
    pivot: [-3, 12, -7],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-left",
    label: "Hind left leg",
    min: [1, 0, -9],
    max: [5, 12, -5],
    pivot: [3, 12, -7],
    uv: LEG_UV,
  },
];
