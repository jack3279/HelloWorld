// Chest entity cuboids from the vanilla 64×64 chest sheet, plus a thin
// shield plate used as a hotbar icon (Bedrock has no 16×16 shield.png).
import { boxUv } from "./steve-model.mjs";

export const CHEST_MODEL = [
  {
    id: "base",
    label: "Chest base",
    min: [-7, 0, -7],
    max: [7, 10, 7],
    pivot: [0, 0, 0],
    uv: boxUv(0, 19, 14, 10, 14),
  },
  {
    id: "lid",
    label: "Chest lid",
    min: [-7, 9, -7],
    max: [7, 14, 7],
    pivot: [0, 10, -7],
    uv: boxUv(0, 0, 14, 5, 14),
  },
  {
    id: "latch",
    label: "Latch",
    parent: "lid",
    min: [-1, 7, 7],
    max: [1, 11, 8],
    pivot: [0, 10, -7],
    uv: boxUv(0, 0, 2, 4, 1),
  },
];

export const SHIELD_MODEL = [
  {
    id: "plate",
    label: "Shield plate",
    min: [-6, 1, -2],
    max: [6, 23, -1],
    pivot: [0, 12, -1.5],
    uv: boxUv(0, 0, 12, 22, 1),
  },
  {
    id: "handle",
    label: "Handle",
    min: [-1, 9, -1],
    max: [1, 15, 5],
    pivot: [0, 12, -1.5],
    uv: boxUv(26, 0, 2, 6, 6),
  },
];
