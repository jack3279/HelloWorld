import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { MINECART_MODEL } from "./lib/minecart-model.mjs";
import { IDLE_FRAMES, WALK_FRAMES, idleA, walkFrame } from "./lib/minecart-poses.mjs";
import { loadMinecartSkin } from "./lib/steve-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("minecart model", () => {
  it("is a floor plus four walls", () => {
    const ids = MINECART_MODEL.map((p) => p.id);
    assert.deepEqual(ids, ["bottom", "left", "right", "front", "back"]);
  });

  it("loads the official 64×32 minecart sheet", async () => {
    const skin = await loadMinecartSkin();
    assert.ok(skin.width >= 64);
    assert.ok(skin.height >= 32);
  });
});

describe("minecart pose", () => {
  it("rocks on idle and rolls on walk", () => {
    assert.equal(idleA().parts.bottom.roll ?? 0, 0);
    const roll = walkFrame(0.25);
    assert.ok(Math.abs(roll.parts.bottom.roll) > 0);
  });
});

describe("generated minecart assets", () => {
  it("writes roll, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/minecart-side.svg"), "utf8");
    assert.match(svg, /id="bottom"/);
    assert.match(svg, /id="left"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/minecart-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/minecart-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle and roll flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/minecart", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
