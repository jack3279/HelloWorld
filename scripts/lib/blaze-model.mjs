// Official Minecraft blaze from Bedrock geometry.blaze. Y is shifted −16 so
// the lowest rods sit on the sprite origin. +Y up, Z negated. 8 of the 12
// vanilla rods, placed in inner and outer rings.
import { boxUv } from "./steve-model.mjs";

const ROD_UV = boxUv(0, 16, 2, 8, 2);
const Y = -16;

function rod(id, x, y, z) {
  return {
    id,
    label: id,
    min: [x, y + Y, z],
    max: [x + 2, y + 8 + Y, z + 2],
    pivot: [x + 1, 24 + Y, z + 1],
    uv: ROD_UV,
  };
}

export const BLAZE_MODEL = [
  {
    id: "head",
    label: "Head",
    min: [-4, 20 + Y, -4],
    max: [4, 28 + Y, 4],
    pivot: [0, 24 + Y, 0],
    uv: boxUv(0, 0, 8, 8, 8),
  },
  rod("rod-0", 5, 16, -1),
  rod("rod-1", -7, 16, -1),
  rod("rod-2", -1, 16, 5),
  rod("rod-3", -1, 16, -7),
  rod("rod-4", 7, 8, 2),
  rod("rod-5", -9, 8, -4),
  rod("rod-6", 2, 8, 7),
  rod("rod-7", -4, 8, -9),
];
