import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadBoatSkin } from "./lib/steve-model.mjs";
import { BOAT_MODEL } from "./lib/boat-model.mjs";
import { IDLE_FRAMES, WALK_FRAMES, idleA, walkFrame } from "./lib/boat-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("boat model", () => {
  it("is a hull, gunwales, bow, stern, and two paddles", () => {
    const ids = BOAT_MODEL.map((p) => p.id);
    assert.deepEqual(ids, ["bottom", "left", "right", "front", "back", "paddle-left", "paddle-right"]);
  });

  it("loads the official oak boat sheet", async () => {
    const skin = await loadBoatSkin();
    assert.ok(skin.width >= 64);
    assert.ok(skin.height >= 64);
  });
});

describe("boat pose", () => {
  it("bobs on idle and strokes the paddles on walk", () => {
    assert.ok((idleA().root?.y ?? 0) >= 0);
    const stroke = walkFrame(0.25);
    assert.ok(Math.abs(stroke.parts["paddle-left"].pitch) > idleA().parts["paddle-left"].pitch);
  });
});

describe("generated boat assets", () => {
  it("writes paddle, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/boat-side.svg"), "utf8");
    assert.match(svg, /id="bottom"/);
    assert.match(svg, /id="paddle-left"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/boat-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/boat-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle and paddle flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/boat", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
