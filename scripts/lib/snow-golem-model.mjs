// Official Bedrock geometry.snowgolem.v1.8: two snow lumps, a head, and
// two 12×2×2 stick arms. Feet-origin, +Y up, Z negated so the figure faces +z.
// Texture is 64×64 snow_golem.png.
import { boxUv } from "./steve-model.mjs";

export const SNOW_GOLEM_MODEL = [
  {
    id: "piece2",
    label: "Lower body",
    min: [-6, 0, -6],
    max: [6, 12, 6],
    pivot: [0, 0, 0],
    uv: boxUv(0, 36, 12, 12, 12),
  },
  {
    id: "piece1",
    label: "Upper body",
    parent: "piece2",
    min: [-5, 11, -5],
    max: [5, 21, 5],
    pivot: [0, 11, 0],
    uv: boxUv(0, 16, 10, 10, 10),
  },
  {
    id: "head",
    label: "Head",
    parent: "piece1",
    min: [-4, 20, -4],
    max: [4, 28, 4],
    pivot: [0, 20, 0],
    uv: boxUv(0, 0, 8, 8, 8),
  },
  {
    id: "arm-right",
    label: "Right arm",
    parent: "piece1",
    min: [-13, 17, -1],
    max: [-1, 19, 1],
    pivot: [0, 18, 0],
    uv: boxUv(32, 0, 12, 2, 2),
  },
  {
    id: "arm-left",
    label: "Left arm",
    parent: "piece1",
    min: [1, 17, -1],
    max: [13, 19, 1],
    pivot: [0, 18, 0],
    uv: boxUv(32, 0, 12, 2, 2),
  },
];
