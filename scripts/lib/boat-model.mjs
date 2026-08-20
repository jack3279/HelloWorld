// Oak boat assembled from the Java BoatModel cuboids, stored already rotated
// so the hull sits on the waterline. +Y up, Z negated, origin at the keel.
// Texture is the 128×64 oak boat sheet.
import { boxUv } from "./steve-model.mjs";

export const BOAT_MODEL = [
  {
    id: "bottom",
    label: "Hull",
    min: [-14, 0, -8],
    max: [14, 3, 8],
    pivot: [0, 3, 0],
    uv: boxUv(0, 0, 28, 16, 3),
  },
  {
    id: "left",
    label: "Left gunwale",
    min: [-14, 3, 7],
    max: [14, 9, 9],
    pivot: [0, 4, 9],
    uv: boxUv(0, 43, 28, 6, 2),
  },
  {
    id: "right",
    label: "Right gunwale",
    min: [-14, 3, -9],
    max: [14, 9, -7],
    pivot: [0, 4, -9],
    uv: boxUv(0, 35, 28, 6, 2),
  },
  {
    id: "front",
    label: "Bow",
    min: [12, 3, -8],
    max: [14, 9, 8],
    pivot: [15, 4, 0],
    uv: boxUv(0, 27, 16, 6, 2),
  },
  {
    id: "back",
    label: "Stern",
    min: [-14, 3, -8],
    max: [-12, 9, 8],
    pivot: [-15, 4, 0],
    uv: boxUv(0, 19, 18, 6, 2),
  },
  {
    id: "paddle-left",
    label: "Left paddle",
    min: [2, 4, 8],
    max: [4, 6, 20],
    pivot: [3, 5, 9],
    uv: boxUv(62, 0, 2, 2, 18),
  },
  {
    id: "paddle-right",
    label: "Right paddle",
    min: [2, 4, -20],
    max: [4, 6, -8],
    pivot: [3, 5, -9],
    uv: boxUv(62, 20, 2, 2, 18),
  },
];
