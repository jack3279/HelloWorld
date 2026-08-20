// Two-high oak door cuboids. The 16×16 face textures are not a box net, so
// front/back use the full face and the 3-wide sides sample the edge strip.
// Hinge pivot is the left edge (x = −8). +Y up.

export const DOOR_SPRITE = { w: 256, h: 512, scale: 12, originX: 128, originY: 496 };
export const DOOR_TOLERANCE = { default: 10 };
export const DOOR_SWING_FRAMES = 8;

function doorUv(oy) {
  return {
    front: { x: 0, y: oy, w: 16, h: 16 },
    back: { x: 0, y: oy, w: 16, h: 16 },
    nx: { x: 0, y: oy, w: 3, h: 16 },
    px: { x: 13, y: oy, w: 3, h: 16 },
    top: { x: 0, y: oy, w: 16, h: 3 },
    bottom: { x: 0, y: oy + 13, w: 16, h: 3 },
  };
}

export const DOOR_MODEL = [
  {
    id: "lower",
    label: "Door lower",
    min: [-8, 0, -1.5],
    max: [8, 16, 1.5],
    pivot: [-8, 0, 0],
    uv: doorUv(16),
  },
  {
    id: "upper",
    label: "Door upper",
    parent: "lower",
    min: [-8, 16, -1.5],
    max: [8, 32, 1.5],
    pivot: [-8, 0, 0],
    uv: doorUv(0),
  },
];

export function doorSwingPose(t) {
  const yaw = t * 90;
  return {
    view: { yaw: 0, pitch: -8 },
    root: {},
    parts: { lower: { yaw }, upper: {} },
  };
}

export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function stackDoorSkin(upper, lower) {
  const width = 16;
  const height = 32;
  const rgba = new Uint8Array(width * height * 4);
  const blit = (src, dy) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const si = (y * src.width + x) * 4;
        const di = ((dy + y) * width + x) * 4;
        rgba.set(src.rgba.subarray(si, si + 4), di);
      }
    }
  };
  blit(upper, 0);
  blit(lower, 16);
  return { width, height, rgba };
}
