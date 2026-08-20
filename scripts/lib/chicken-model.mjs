// Official Minecraft chicken: vanilla ChickenModel. Head 4×6×3 plus beak and
// wattle, 6×8×6 body pitched 90°, 1×4×6 wings, 3×5×3 legs. Same conversion as
// the pig — `ourY = 24 - vanillaY`, Z negated so the bird faces +z. Head, beak,
// and wattle stay on the root / head so the body rest pitch does not flip the
// face.
import { boxUv } from "./steve-model.mjs";

// Official chicken.png leaves the vanilla 26,0 leg box almost empty (a 1px
// strip). Reuse the opaque tan beak strip so the legs read in side view.
const LEG_UV = boxUv(16, 0, 3, 5, 3);
const WING_UV = boxUv(24, 13, 1, 4, 6);

export const CHICKEN_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-3, 8, -3],
    max: [3, 16, 3],
    pivot: [0, 12, 0],
    uv: boxUv(0, 9, 6, 8, 6),
  },
  {
    id: "head",
    label: "Head",
    min: [-2, 9, 2],
    max: [2, 15, 5],
    pivot: [0, 9, 4],
    uv: boxUv(0, 0, 4, 6, 3),
  },
  {
    id: "beak",
    label: "Beak",
    parent: "head",
    min: [-2, 11, 5],
    max: [2, 13, 7],
    pivot: [0, 9, 4],
    uv: boxUv(14, 0, 4, 2, 2),
  },
  {
    id: "wattle",
    label: "Wattle",
    parent: "head",
    min: [-1, 9, 4],
    max: [1, 11, 6],
    pivot: [0, 9, 4],
    uv: boxUv(14, 4, 2, 2, 2),
  },
  {
    id: "wing-right",
    label: "Right wing",
    min: [-4, 7, -3],
    max: [-3, 11, 3],
    pivot: [-4, 11, 0],
    uv: WING_UV,
  },
  {
    id: "wing-left",
    label: "Left wing",
    min: [3, 7, -3],
    max: [4, 11, 3],
    pivot: [4, 11, 0],
    uv: WING_UV,
  },
  {
    id: "leg-right",
    label: "Right leg",
    min: [-3, 0, -2],
    max: [0, 5, 1],
    pivot: [-2, 5, -1],
    uv: LEG_UV,
  },
  {
    id: "leg-left",
    label: "Left leg",
    min: [0, 0, -2],
    max: [3, 5, 1],
    pivot: [1, 5, -1],
    uv: LEG_UV,
  },
];
