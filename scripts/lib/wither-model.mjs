// Official Bedrock geometry.witherBoss, feet-shifted so the spine sits on the
// sprite origin. +Y up, Z negated so the figure faces +z. Texture is 64×64.
import { boxUv } from "./steve-model.mjs";

function cuboid(id, origin, size, uv, extra = {}) {
  const [ox, oy, oz] = origin;
  const [sx, sy, sz] = size;
  const y = oy - 7;
  return {
    id,
    label: extra.label ?? id,
    parent: extra.parent,
    min: [ox, y, -(oz + sz)],
    max: [ox + sx, y + sy, -oz],
    pivot: extra.pivot ? [extra.pivot[0], extra.pivot[1] - 7, -extra.pivot[2]] : [0, y, 0],
    uv: boxUv(uv[0], uv[1], sx, sy, sz),
  };
}

export const WITHER_MODEL = [
  cuboid("shoulders", [-10, 17.1, -0.5], [20, 3, 3], [0, 16], { label: "Shoulders" }),
  cuboid("spine", [-2, 7.1, -0.5], [3, 10, 3], [0, 22], { label: "Spine", parent: "shoulders", pivot: [-2, 17.1, -0.5] }),
  cuboid("rib-top", [-6, 13.6, 0], [11, 2, 2], [24, 22], { label: "Rib top", parent: "spine" }),
  cuboid("rib-mid", [-6, 11.1, 0], [11, 2, 2], [24, 22], { label: "Rib mid", parent: "spine" }),
  cuboid("rib-low", [-6, 8.6, 0], [11, 2, 2], [24, 22], { label: "Rib low", parent: "spine" }),
  cuboid("head", [-4, 20, -4], [8, 8, 8], [0, 0], { label: "Center head", parent: "shoulders", pivot: [0, 20, 0] }),
  cuboid("head-right", [-12, 18, -4], [6, 6, 6], [32, 0], { label: "Right head", parent: "shoulders", pivot: [-9, 18, -1] }),
  cuboid("head-left", [6, 18, -4], [6, 6, 6], [32, 0], { label: "Left head", parent: "shoulders", pivot: [9, 18, -1] }),
];
