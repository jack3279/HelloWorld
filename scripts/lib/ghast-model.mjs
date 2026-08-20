// Official Minecraft ghast from Java / Bedrock: a 16×16×16 body and nine
// 2×8×2 tentacles in a 3×3 grid. Y is shifted so the tentacle tips sit on the
// sprite origin. +Y up, Z negated.
import { boxUv } from "./steve-model.mjs";

const Y = 0;
const TENTACLE_UV = boxUv(0, 0, 2, 8, 2);

function tentacle(id, x, z) {
  return {
    id,
    label: id,
    min: [x - 1, Y, z - 1],
    max: [x + 1, 8 + Y, z + 1],
    pivot: [x, 8 + Y, z],
    uv: TENTACLE_UV,
  };
}

export const GHAST_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-8, 8 + Y, -8],
    max: [8, 24 + Y, 8],
    pivot: [0, 16 + Y, 0],
    uv: boxUv(0, 0, 16, 16, 16),
  },
  tentacle("tentacle-0", -5, 5),
  tentacle("tentacle-1", 0, 5),
  tentacle("tentacle-2", 5, 5),
  tentacle("tentacle-3", -5, 0),
  tentacle("tentacle-4", 0, 0),
  tentacle("tentacle-5", 5, 0),
  tentacle("tentacle-6", -5, -5),
  tentacle("tentacle-7", 0, -5),
  tentacle("tentacle-8", 5, -5),
];
