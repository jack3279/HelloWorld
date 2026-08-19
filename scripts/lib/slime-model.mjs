// Official Minecraft slime from Bedrock geometry.slime plus the outer gel
// cube from the Java inner/outer layers. Feet-origin, +Y up, Z negated so
// the face looks +z.
import { boxUv } from "./steve-model.mjs";

export const SLIME_MODEL = [
  {
    id: "outer",
    label: "Outer gel",
    min: [-4, 0, -4],
    max: [4, 8, 4],
    pivot: [0, 0, 0],
    uv: boxUv(0, 0, 8, 8, 8),
    sparse: true,
  },
  {
    id: "cube",
    label: "Inner cube",
    min: [-3, 1, -3],
    max: [3, 7, 3],
    pivot: [0, 0, 0],
    uv: boxUv(0, 16, 6, 6, 6),
  },
  {
    id: "eye-right",
    label: "Right eye",
    parent: "cube",
    min: [-3.3, 4, 1.5],
    max: [-1.3, 6, 3.5],
    pivot: [0, 0, 0],
    uv: boxUv(32, 0, 2, 2, 2),
  },
  {
    id: "eye-left",
    label: "Left eye",
    parent: "cube",
    min: [1.3, 4, 1.5],
    max: [3.3, 6, 3.5],
    pivot: [0, 0, 0],
    uv: boxUv(32, 4, 2, 2, 2),
  },
  {
    id: "mouth",
    label: "Mouth",
    parent: "cube",
    min: [0, 2, 2.5],
    max: [1, 3, 3.5],
    pivot: [0, 0, 0],
    uv: boxUv(32, 8, 1, 1, 1),
  },
];
