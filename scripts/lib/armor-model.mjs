// Inflated player armor cuboids. Layer 1 is helmet / chest / arms / boots
// (cloth_1 / iron_1 / diamond_1). Layer 2 is the leggings waist + legs.
// Left limbs reuse the right-side UVs because armor sheets are 64×32.
import { MODEL, boxUv } from "./steve-model.mjs";

function inflate(min, max, n) {
  return [min.map((v) => v - n), max.map((v) => v + n)];
}

const ARM_UV = boxUv(40, 16, 4, 12, 4);
const BOOT_UV = boxUv(0, 16, 4, 12, 4);
const LEGGING_UV = boxUv(0, 16, 4, 12, 4);
const WAIST_UV = boxUv(16, 16, 8, 12, 4);

export function armorLayer1Model() {
  return MODEL.map((part) => {
    const n = part.id === "head" ? 1 : 0.5;
    const [min, max] = inflate(part.min, part.max, n);
    const uv = part.id === "arm-left" ? ARM_UV : part.id === "leg-left" ? BOOT_UV : part.uv;
    return { ...part, min, max, uv };
  });
}

export function armorLeggingsExtras() {
  const torso = MODEL.find((p) => p.id === "torso");
  const right = MODEL.find((p) => p.id === "leg-right");
  const left = MODEL.find((p) => p.id === "leg-left");
  const [tMin, tMax] = inflate(torso.min, torso.max, 0.25);
  const [rMin, rMax] = inflate(right.min, right.max, 0.25);
  const [lMin, lMax] = inflate(left.min, left.max, 0.25);
  return [
    { id: "legging-torso", label: "Leggings waist", parent: "torso", min: tMin, max: tMax, pivot: torso.pivot, uv: WAIST_UV },
    { id: "legging-right", label: "Right legging", parent: "leg-right", min: rMin, max: rMax, pivot: right.pivot, uv: LEGGING_UV },
    { id: "legging-left", label: "Left legging", parent: "leg-left", min: lMin, max: lMax, pivot: left.pivot, uv: LEGGING_UV },
  ];
}
