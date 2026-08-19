// Subset of Bedrock geometry.dragon: body, neck, head, jaw, and two wing bones.
// 0-thickness membranes are skipped. Y is shifted so the body sits on the
// sprite origin. Texture is the official 256×256 dragon sheet.
import { boxUv } from "./steve-model.mjs";

const YS = 8;

function cuboid(id, origin, size, uv, extra = {}) {
  const [ox, oy, oz] = origin;
  const [sx, sy, sz] = size;
  const y = oy + YS;
  return {
    id,
    label: extra.label ?? id,
    parent: extra.parent,
    min: [ox, y, -(oz + sz)],
    max: [ox + sx, y + sy, -oz],
    pivot: extra.pivot ? [extra.pivot[0], extra.pivot[1] + YS, -extra.pivot[2]] : [0, y, 0],
    uv: boxUv(uv[0], uv[1], sx, sy, sz),
  };
}

export const ENDER_DRAGON_MODEL = [
  cuboid("body", [-12, -4, -8], [24, 24, 64], [0, 0], { label: "Body", pivot: [0, 20, 8] }),
  cuboid("neck", [-5, 19, -5], [10, 10, 10], [192, 104], { label: "Neck", parent: "body", pivot: [0, 24, 0] }),
  cuboid("head", [-8, 16, -10], [16, 16, 16], [112, 30], { label: "Head", parent: "neck", pivot: [0, 24, 0] }),
  cuboid("snout", [-6, 20, -24], [12, 5, 16], [176, 44], { label: "Snout", parent: "head" }),
  cuboid("jaw", [-6, 16, -24], [12, 4, 16], [176, 65], { label: "Jaw", parent: "head", pivot: [0, 20, -8] }),
  cuboid("wing-right", [-68, 15, -2], [56, 8, 8], [112, 88], { label: "Right wing", parent: "body", pivot: [-12, 19, 2] }),
  cuboid("wing-left", [12, 15, -2], [56, 8, 8], [112, 88], { label: "Left wing", parent: "body", pivot: [12, 19, 2] }),
];
