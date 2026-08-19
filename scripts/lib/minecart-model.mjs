// Axis-aligned minecart from Bedrock geometry.minecart.v1.8 (rotations baked
// out so a side-view yaw 90 reads the hull). Texture is 64×32. +Y up, Z negated.
import { boxUv } from "./steve-model.mjs";

const WALL = boxUv(0, 0, 16, 8, 2);

export const MINECART_MODEL = [
  {
    id: "bottom",
    label: "Floor",
    min: [-10, 0, -8],
    max: [10, 2, 8],
    pivot: [0, 1, 0],
    uv: boxUv(0, 10, 20, 2, 16),
  },
  {
    id: "left",
    label: "Left wall",
    parent: "bottom",
    min: [-8, 2, 6],
    max: [8, 10, 8],
    pivot: [0, 2, 7],
    uv: WALL,
  },
  {
    id: "right",
    label: "Right wall",
    parent: "bottom",
    min: [-8, 2, -8],
    max: [8, 10, -6],
    pivot: [0, 2, -7],
    uv: WALL,
  },
  {
    id: "front",
    label: "Front wall",
    parent: "bottom",
    min: [8, 2, -8],
    max: [10, 10, 8],
    pivot: [9, 2, 0],
    uv: WALL,
  },
  {
    id: "back",
    label: "Back wall",
    parent: "bottom",
    min: [-10, 2, -8],
    max: [-8, 10, 8],
    pivot: [-9, 2, 0],
    uv: WALL,
  },
];
