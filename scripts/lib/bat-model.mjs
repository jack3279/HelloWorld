// Official Minecraft bat from Bedrock geometry.bat. Y is shifted +8 so the
// hanging feet sit on the sprite origin. +Y up, Z negated so the face looks +z.
import { boxUv } from "./steve-model.mjs";

const Y = 8;

export const BAT_MODEL = [
  {
    id: "head",
    label: "Head",
    min: [-3, 21 + Y, -3],
    max: [3, 27 + Y, 3],
    pivot: [0, 24 + Y, 0],
    uv: boxUv(0, 0, 6, 6, 6),
  },
  {
    id: "ear-right",
    label: "Right ear",
    parent: "head",
    min: [-4, 26 + Y, 1],
    max: [-1, 30 + Y, 2],
    pivot: [0, 24 + Y, 0],
    uv: boxUv(24, 0, 3, 4, 1),
  },
  {
    id: "ear-left",
    label: "Left ear",
    parent: "head",
    min: [1, 26 + Y, 1],
    max: [4, 30 + Y, 2],
    pivot: [0, 24 + Y, 0],
    uv: boxUv(24, 0, 3, 4, 1),
  },
  {
    id: "body",
    label: "Body",
    min: [-3, 8 + Y, -3],
    max: [3, 20 + Y, 3],
    pivot: [0, 24 + Y, 0],
    uv: boxUv(0, 16, 6, 12, 6),
  },
  {
    id: "feet",
    label: "Feet",
    parent: "body",
    min: [-5, -8 + Y, -1],
    max: [5, 8 + Y, 0],
    pivot: [0, 24 + Y, 0],
    uv: boxUv(0, 34, 10, 16, 1),
  },
  {
    id: "wing-right",
    label: "Right wing",
    parent: "body",
    min: [-12, 7 + Y, -2.5],
    max: [-2, 23 + Y, -1.5],
    pivot: [0, 24 + Y, 0],
    uv: boxUv(42, 0, 10, 16, 1),
  },
  {
    id: "wing-right-tip",
    label: "Right wing tip",
    parent: "wing-right",
    min: [-20, 10 + Y, -2.5],
    max: [-12, 22 + Y, -1.5],
    pivot: [-12, 23 + Y, -1.5],
    uv: boxUv(24, 16, 8, 12, 1),
  },
  {
    id: "wing-left",
    label: "Left wing",
    parent: "body",
    min: [2, 7 + Y, -2.5],
    max: [12, 23 + Y, -1.5],
    pivot: [0, 24 + Y, 0],
    uv: boxUv(42, 0, 10, 16, 1),
  },
  {
    id: "wing-left-tip",
    label: "Left wing tip",
    parent: "wing-left",
    min: [12, 10 + Y, -2.5],
    max: [20, 22 + Y, -1.5],
    pivot: [12, 23 + Y, -1.5],
    uv: boxUv(24, 16, 8, 12, 1),
  },
];
