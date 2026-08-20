// Official Bedrock spider with Z negated so the head faces +z (screen-right
// at yaw 90), matching pig/wolf/cat. Thorax, head, abdomen, eight 16×2×2 legs.
import { boxUv } from "./steve-model.mjs";

const LEG_UV = boxUv(18, 0, 16, 2, 2);

function leg(id, label, pivot, towardLeft) {
  const [px, py, pz] = pivot;
  const x0 = towardLeft ? px - 1 : px - 15;
  const x1 = towardLeft ? px + 15 : px + 1;
  return {
    id,
    label,
    parent: "body",
    min: [x0, py - 1, pz - 1],
    max: [x1, py + 1, pz + 1],
    pivot,
    uv: LEG_UV,
  };
}

export const SPIDER_MODEL = [
  {
    id: "body",
    label: "Thorax",
    min: [-3, 6, -3],
    max: [3, 12, 3],
    pivot: [0, 9, 0],
    uv: boxUv(0, 0, 6, 6, 6),
  },
  {
    id: "head",
    label: "Head",
    parent: "body",
    min: [-4, 5, 3],
    max: [4, 13, 11],
    pivot: [0, 9, 3],
    uv: boxUv(32, 4, 8, 8, 8),
  },
  {
    id: "abdomen",
    label: "Abdomen",
    parent: "body",
    min: [-5, 5, -15],
    max: [5, 13, -3],
    pivot: [0, 9, -9],
    uv: boxUv(0, 12, 10, 8, 12),
  },
  leg("leg0", "Right front leg", [-4, 9, 2], false),
  leg("leg1", "Left front leg", [4, 9, 2], true),
  leg("leg2", "Right mid-front leg", [-4, 9, 1], false),
  leg("leg3", "Left mid-front leg", [4, 9, 1], true),
  leg("leg4", "Right mid-hind leg", [-4, 9, 0], false),
  leg("leg5", "Left mid-hind leg", [4, 9, 0], true),
  leg("leg6", "Right hind leg", [-4, 9, -1], false),
  leg("leg7", "Left hind leg", [4, 9, -1], true),
];
