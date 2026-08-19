// Official Minecraft sheep from Bedrock geometry.sheep.sheared: feet-origin,
// +Y up, Z negated so the animal faces +z. Body is stored unrotated (8×16×6);
// poses apply the vanilla 90° rest pitch. Wool overlay cuboids come from
// geometry.sheep and paint from the separate wool skin.
import { boxUv } from "./steve-model.mjs";

const LEG_UV = boxUv(0, 16, 4, 12, 4);
const WOOL_LEG_UV = boxUv(0, 16, 4, 6, 4);

function inflate(min, max, n) {
  return {
    min: [min[0] - n, min[1] - n, min[2] - n],
    max: [max[0] + n, max[1] + n, max[2] + n],
  };
}

export const SHEEP_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-4, 13, -1],
    max: [4, 29, 5],
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

const woolHead = inflate([-3, 16, 6], [3, 22, 12], 0.6);
const woolBody = inflate([-4, 13, -1], [4, 29, 5], 1.75);
const woolFR = inflate([-5, 6, 3], [-1, 12, 7], 0.5);
const woolFL = inflate([1, 6, 3], [5, 12, 7], 0.5);
const woolHR = inflate([-5, 6, -9], [-1, 12, -5], 0.5);
const woolHL = inflate([1, 6, -9], [5, 12, -5], 0.5);

export const SHEEP_WOOL = [
  {
    id: "wool-head",
    label: "Wool head",
    parent: "head",
    ...woolHead,
    pivot: [0, 18, 8],
    uv: boxUv(0, 0, 6, 6, 6),
  },
  {
    id: "wool-body",
    label: "Wool body",
    parent: "body",
    ...woolBody,
    pivot: [0, 19, -2],
    uv: boxUv(28, 8, 8, 16, 6),
  },
  {
    id: "wool-front-right",
    label: "Wool front right",
    parent: "leg-front-right",
    ...woolFR,
    pivot: [-3, 12, 5],
    uv: WOOL_LEG_UV,
  },
  {
    id: "wool-front-left",
    label: "Wool front left",
    parent: "leg-front-left",
    ...woolFL,
    pivot: [3, 12, 5],
    uv: WOOL_LEG_UV,
  },
  {
    id: "wool-hind-right",
    label: "Wool hind right",
    parent: "leg-hind-right",
    ...woolHR,
    pivot: [-3, 12, -7],
    uv: WOOL_LEG_UV,
  },
  {
    id: "wool-hind-left",
    label: "Wool hind left",
    parent: "leg-hind-left",
    ...woolHL,
    pivot: [3, 12, -7],
    uv: WOOL_LEG_UV,
  },
];
