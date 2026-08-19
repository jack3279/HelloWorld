// Official Minecraft horse from Bedrock geometry.horse (v1). Feet-origin,
// +Y up, Z negated so the animal faces +z. Texture is 128×128. Saddle bags
// and mule ears are omitted; a thin saddle plate stays so a tamed mount reads.
import { boxUv } from "./steve-model.mjs";

function bed(id, label, ox, oy, oz, sx, sy, sz, uvx, uvy, extra = {}) {
  const [px, py, pz] = extra.pivot ?? [ox + sx / 2, oy + sy, oz + sz / 2];
  return {
    id,
    label,
    parent: extra.parent,
    min: [ox, oy, -(oz + sz)],
    max: [ox + sx, oy + sy, -oz],
    pivot: [px, py, -pz],
    uv: boxUv(uvx, uvy, Math.round(sx), Math.round(sy), Math.round(sz)),
  };
}

export const HORSE_MODEL = [
  bed("body", "Body", -5, 11, -10, 10, 10, 24, 0, 34, { pivot: [0, 13, 9] }),
  bed("saddle", "Saddle", -5, 21, -1, 10, 1, 8, 80, 0, { parent: "body", pivot: [0, 22, 2] }),
  bed("neck", "Neck", -2, 16, -12, 4, 14, 8, 0, 12, { pivot: [0, 20, -10] }),
  bed("mane", "Mane", -1, 16, -5, 2, 16, 4, 58, 0, { parent: "neck", pivot: [0, 20, -10] }),
  bed("head", "Head", -2.5, 25, -11.5, 5, 5, 7, 0, 0, { parent: "neck", pivot: [0, 20, -10] }),
  bed("mouth", "Muzzle", -2, 27, -17, 4, 3, 6, 24, 18, { parent: "head", pivot: [0, 20, -10] }),
  bed("ear-left", "Left ear", 0.45, 29, -6, 2, 3, 1, 0, 0, { parent: "head", pivot: [0, 20, -10] }),
  bed("ear-right", "Right ear", -2.45, 29, -6, 2, 3, 1, 0, 0, { parent: "head", pivot: [0, 20, -10] }),
  bed("tail", "Tail", -1.5, 19, 17, 3, 4, 7, 38, 7, { pivot: [0, 21, 14] }),
  bed("leg-front-right", "Front right", -5.1, 8, -10.1, 3, 8, 4, 60, 29, { pivot: [-4, 15, -8] }),
  bed("hoof-front-right", "Front right hoof", -5.6, 0, -10.1, 4, 8, 4, 60, 51, {
    parent: "leg-front-right",
    pivot: [-4, 8, -8],
  }),
  bed("leg-front-left", "Front left", 2.1, 8, -10.1, 3, 8, 4, 44, 29, { pivot: [4, 15, -8] }),
  bed("hoof-front-left", "Front left hoof", 1.6, 0, -10.1, 4, 8, 4, 44, 51, {
    parent: "leg-front-left",
    pivot: [4, 8, -8],
  }),
  bed("leg-hind-right", "Hind right", -5.5, 8, 8.5, 4, 9, 5, 96, 29, { pivot: [-4, 15, 11] }),
  bed("hoof-hind-right", "Hind right hoof", -5.5, 0, 9, 4, 8, 4, 96, 51, {
    parent: "leg-hind-right",
    pivot: [-4, 8, 11],
  }),
  bed("leg-hind-left", "Hind left", 1.5, 8, 8.5, 4, 9, 5, 78, 29, { pivot: [4, 15, 11] }),
  bed("hoof-hind-left", "Hind left hoof", 1.5, 0, 9, 4, 8, 4, 78, 51, {
    parent: "leg-hind-left",
    pivot: [4, 8, 11],
  }),
];
