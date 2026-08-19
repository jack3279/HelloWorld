// Official Minecraft squid from Bedrock geometry.squid. Y is shifted +25 so
// tentacle tips sit on the sprite origin. +Y up, Z negated so the body faces +z.
import { boxUv } from "./steve-model.mjs";

const TENTACLE_UV = boxUv(48, 0, 2, 18, 2);

function tentacle(id, label, pivot, restYaw) {
  const [px, py, pz] = pivot;
  return {
    id,
    label,
    parent: "body",
    min: [px - 1, py - 18, pz - 1],
    max: [px + 1, py, pz + 1],
    pivot,
    restYaw,
    uv: TENTACLE_UV,
  };
}

export const SQUID_MODEL = [
  {
    id: "body",
    label: "Body",
    min: [-6, 17, -6],
    max: [6, 33, 6],
    pivot: [0, 25, 0],
    uv: boxUv(0, 0, 12, 16, 12),
  },
  tentacle("tentacle-1", "Tentacle 1", [5, 18, 0], 90),
  tentacle("tentacle-2", "Tentacle 2", [3.5, 18, -3.5], 45),
  tentacle("tentacle-3", "Tentacle 3", [0, 18, -5], 0),
  tentacle("tentacle-4", "Tentacle 4", [-3.5, 18, -3.5], -45),
  tentacle("tentacle-5", "Tentacle 5", [-5, 18, 0], -90),
  tentacle("tentacle-6", "Tentacle 6", [-3.5, 18, 3.5], -135),
  tentacle("tentacle-7", "Tentacle 7", [0, 18, 5], 180),
  tentacle("tentacle-8", "Tentacle 8", [3.5, 18, 3.5], 135),
];
