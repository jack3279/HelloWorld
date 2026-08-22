// Official Minecraft still-water as a side-view square. Same vertical strip
// as lava: each 16×16 frame is flattened into color runs for the game flipbook.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, parseArgs, rgbToHex } from "./steve-model.mjs";
import { CANVAS, TILE, TOLERANCE, frameCount, frameSignature, layout, lottieShapesFromRuns, runsOf, svgFromRuns } from "./lava-block.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const WATER_URL =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/blocks/water_still.png";
const CACHE = resolve(__dirname, "../../node_modules/.cache/water-still.png");
export const WATER_TINT = [63, 118, 228];

export { CANVAS, TILE, TOLERANCE, frameCount, frameSignature, layout, lottieShapesFromRuns, parseArgs, runsOf, svgFromRuns };

function tintIfGrey(png) {
  let chroma = 0;
  let n = 0;
  for (let i = 0; i < png.rgba.length; i += 4) {
    if (png.rgba[i + 3] < 8) continue;
    chroma += Math.max(png.rgba[i], png.rgba[i + 1], png.rgba[i + 2]) - Math.min(png.rgba[i], png.rgba[i + 1], png.rgba[i + 2]);
    n += 1;
  }
  if (n && chroma / n > 18) return png;
  const rgba = new Uint8Array(png.rgba);
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = Math.round((rgba[i] / 255) * WATER_TINT[0]);
    rgba[i + 1] = Math.round((rgba[i + 1] / 255) * WATER_TINT[1]);
    rgba[i + 2] = Math.round((rgba[i + 2] / 255) * WATER_TINT[2]);
  }
  return { width: png.width, height: png.height, rgba };
}

export async function loadWaterStrip(explicitPath) {
  if (explicitPath) {
    const png = tintIfGrey(decodePng(await readFile(explicitPath)));
    if (png.width !== TILE) throw new Error(`expected a ${TILE}px-wide water strip`);
    if (png.height % TILE !== 0) throw new Error("water strip height must be a multiple of the tile");
    return png;
  }
  const { paintWaterStrip } = await import("./cc0-skins.mjs");
  return paintWaterStrip();
}

export function waterHex(runHex) {
  return runHex;
}
