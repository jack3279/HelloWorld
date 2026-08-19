// Witch is the villager.v1.8 figure plus the 64×128 hat stack from
// geometry.villager.witch.v1.8. Same feet-origin, +Y up, Z-flip as the villager.
import { boxUv } from "./steve-model.mjs";
import { VILLAGER_MODEL } from "./villager-model.mjs";

export const WITCH_MODEL = [
  ...VILLAGER_MODEL,
  {
    id: "hat",
    label: "Hat brim",
    parent: "head",
    min: [-5, 32, -5],
    max: [5, 34, 5],
    pivot: [0, 32, 0],
    uv: boxUv(0, 64, 10, 2, 10),
  },
  {
    id: "hat2",
    label: "Hat mid",
    parent: "hat",
    min: [-3.25, 33.5, -3],
    max: [3.75, 37.5, 4],
    pivot: [1.75, 32, -2],
    uv: boxUv(0, 76, 7, 4, 7),
  },
  {
    id: "hat3",
    label: "Hat top",
    parent: "hat2",
    min: [-1.5, 36.5, -1],
    max: [2.5, 40.5, 3],
    pivot: [1.75, 35, -2],
    uv: boxUv(0, 87, 4, 4, 4),
  },
  {
    id: "hat4",
    label: "Hat tip",
    parent: "hat3",
    min: [0.25, 40, -1],
    max: [1.25, 42, 0],
    pivot: [1.75, 38, -2],
    uv: boxUv(0, 95, 1, 2, 1),
  },
  {
    id: "wart",
    label: "Nose wart",
    parent: "head",
    min: [0, 25, 5.75],
    max: [1, 26, 6.75],
    pivot: [0, 24, 0],
    uv: boxUv(0, 0, 1, 1, 1),
  },
];
