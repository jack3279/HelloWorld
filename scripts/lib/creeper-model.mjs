// Official Minecraft creeper: a head, a four-wide body, and four legs.
// No arms. Units match the player pipeline — texels, +y up, +z facing,
// origin between the feet.
import { boxUv } from "./steve-model.mjs";

const LEG_UV = boxUv(0, 16, 4, 6, 4);

export const CREEPER_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-4, 6, -2],
    max: [4, 18, 2],
    pivot: [0, 6, 0],
    uv: boxUv(16, 16, 8, 12, 4),
  },
  {
    id: "head",
    label: "Head",
    parent: "body",
    min: [-4, 18, -4],
    max: [4, 26, 4],
    pivot: [0, 18, 0],
    uv: boxUv(0, 0, 8, 8, 8),
  },
  {
    id: "leg-front-right",
    label: "Front right leg",
    parent: "body",
    min: [-4, 0, 2],
    max: [0, 6, 6],
    pivot: [-2, 6, 4],
    uv: LEG_UV,
  },
  {
    id: "leg-front-left",
    label: "Front left leg",
    parent: "body",
    min: [0, 0, 2],
    max: [4, 6, 6],
    pivot: [2, 6, 4],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-right",
    label: "Hind right leg",
    parent: "body",
    min: [-4, 0, -6],
    max: [0, 6, -2],
    pivot: [-2, 6, -4],
    uv: LEG_UV,
  },
  {
    id: "leg-hind-left",
    label: "Hind left leg",
    parent: "body",
    min: [0, 0, -6],
    max: [4, 6, -2],
    pivot: [2, 6, -4],
    uv: LEG_UV,
  },
];
