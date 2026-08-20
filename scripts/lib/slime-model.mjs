// Official Minecraft slime: outer 8³ cube, inner 6³ cube, two eyes, and a
// mouth. Vanilla sits the cube on y=16…24; `ourY = 24 - vanillaY` puts the
// feet on y=0. Eyes are on the +z face so a 45° head-style yaw is not needed —
// the whole cube yaws 45° in the pose so both eyes read.
import { boxUv } from "./steve-model.mjs";

export const SLIME_MODEL = [
  {
    id: "body",
    label: "Outer",
    min: [-4, 0, -4],
    max: [4, 8, 4],
    pivot: [0, 4, 0],
    uv: boxUv(0, 0, 8, 8, 8),
  },
  {
    id: "inner",
    label: "Inner",
    parent: "body",
    min: [-3, 1, -3],
    max: [3, 7, 3],
    pivot: [0, 4, 0],
    uv: boxUv(0, 16, 6, 6, 6),
  },
  {
    id: "eye-right",
    label: "Right eye",
    parent: "body",
    min: [-3.25, 4, 2.5],
    max: [-1.25, 6, 4.5],
    pivot: [0, 4, 0],
    uv: boxUv(32, 0, 2, 2, 2),
  },
  {
    id: "eye-left",
    label: "Left eye",
    parent: "body",
    min: [1.25, 4, 2.5],
    max: [3.25, 6, 4.5],
    pivot: [0, 4, 0],
    uv: boxUv(32, 4, 2, 2, 2),
  },
  {
    id: "mouth",
    label: "Mouth",
    parent: "body",
    min: [0, 2, 2.5],
    max: [1, 3, 3.5],
    pivot: [0, 4, 0],
    uv: boxUv(32, 8, 1, 1, 1),
  },
];
