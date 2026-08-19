// Official Minecraft magma cube from Bedrock geometry.magma_cube_v2. Eight
// stacked 8×1×8 slices plus the inner cube. Feet-origin, +Y up, Z negated.
import { boxUv } from "./steve-model.mjs";

function slice(i, uvx, uvy) {
  return {
    id: `cube-${i}`,
    label: `Slice ${i}`,
    parent: "inside",
    min: [-4, 7 - i, -4],
    max: [4, 8 - i, 4],
    pivot: [0, 0, 0],
    uv: boxUv(uvx, uvy, 8, 1, 8),
  };
}

export const MAGMA_CUBE_MODEL = [
  {
    id: "inside",
    label: "Core",
    min: [-2, 2, -2],
    max: [2, 6, 2],
    pivot: [0, 0, 0],
    uv: boxUv(24, 40, 4, 4, 4),
  },
  slice(0, 0, 0),
  slice(1, 0, 9),
  slice(2, 0, 18),
  slice(3, 0, 27),
  slice(4, 32, 0),
  slice(5, 32, 9),
  slice(6, 32, 18),
  slice(7, 32, 27),
];
