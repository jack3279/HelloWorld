import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { TILE, frameCount, frameSignature, loadWaterStrip, runsOf } from "./lib/water-block.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("water strip", () => {
  it("loads the official still-water strip as square frames", async () => {
    const strip = await loadWaterStrip();
    assert.equal(strip.width, TILE);
    assert.ok(frameCount(strip) >= 16, "enough frames to flow");
    assert.equal(strip.height % TILE, 0);
  });

  it("changes from frame to frame", async () => {
    const strip = await loadWaterStrip();
    const n = frameCount(strip);
    const a = frameSignature(strip, 0);
    const b = frameSignature(strip, Math.floor(n / 3));
    assert.notEqual(a, b);
  });

  it("stays water-colored: blue, not lava orange", async () => {
    const strip = await loadWaterStrip();
    const runs = runsOf(strip, 0);
    let blue = 0;
    for (const run of runs) {
      const r = parseInt(run.hex.slice(1, 3), 16);
      const g = parseInt(run.hex.slice(3, 5), 16);
      const b = parseInt(run.hex.slice(5, 7), 16);
      if (b > r && b > 80) blue += run.x1 - run.x0;
    }
    assert.ok(blue > TILE * TILE * 0.4, "most texels are blue");
  });
});

describe("generated water assets", () => {
  it("ships flowing square frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/water-side.svg"), "utf8");
    assert.match(svg, /id="water-block"/);
    assert.match(svg, /viewBox="0 0 512 512"/);
    for (const i of [0, 4, 8, 12, 16, 20, 24, 28]) {
      assert.ok(existsSync(resolve(ROOT, "assets/water-sprites", `flow-${i}.svg`)), `flow-${i}`);
    }
  });
});
