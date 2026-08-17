import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadEndermanSkin } from "./lib/steve-model.mjs";
import { FACE, TELEPORT_FRAMES, WALK_FRAMES, idleA, teleportFrame, walkFrame } from "./lib/enderman-poses.mjs";
import { ENDERMAN_MODEL } from "./lib/enderman-model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("enderman skin", () => {
  it("loads the official dark body with purple eyes", async () => {
    const skin = await loadEndermanSkin();
    assert.equal(skin.width, 64);
    assert.equal(skin.height, 32);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2], skin.rgba[i + 3]];
    };
    const [r, g, b] = px(8, 12);
    assert.ok(r > 180 && b > 200 && g < 160, `eyes should be purple, got ${r},${g},${b}`);
    const body = px(10, 10);
    assert.ok(body[0] < 40 && body[1] < 40 && body[2] < 40, `skin should be near-black, got ${body}`);
  });
});

describe("enderman pose", () => {
  it("is taller than a player and hangs the arms", () => {
    const head = ENDERMAN_MODEL.find((p) => p.id === "head");
    const arm = ENDERMAN_MODEL.find((p) => p.id === "arm-right");
    assert.ok(head.max[1] >= 50);
    assert.ok(arm.max[1] - arm.min[1] >= 28);
    const pose = idleA();
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(Math.abs(pose.parts["arm-right"].pitch) < 20, "arms hang, they do not reach forward");
  });

  it("loops the walk and flickers opacity on teleport", () => {
    assert.equal(walkFrame(0).parts["leg-right"].pitch, walkFrame(1).parts["leg-right"].pitch);
    const passing = walkFrame(0.25);
    assert.ok(passing.parts["leg-right"].pitch < passing.parts["leg-left"].pitch);
    const opacities = Array.from({ length: TELEPORT_FRAMES }, (_, i) => teleportFrame(i / TELEPORT_FRAMES).opacity);
    assert.ok(opacities.some((o) => o === 0), "teleport vanishes for a beat");
    assert.ok(opacities.some((o) => o === 100));
  });
});

describe("generated enderman assets", () => {
  it("writes a tall side-view SVG", async () => {
    const svg = await readFile(resolve(ROOT, "assets/enderman-side.svg"), "utf8");
    assert.match(svg, /id="enderman"/);
    assert.match(svg, /id="head"/);
    assert.match(svg, /viewBox="0 0 512 640"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("ships idle, walk, and teleport flipbooks", async () => {
    for (const [scene, min] of [
      ["scene-1", 8],
      ["scene-2", WALK_FRAMES],
      ["scene-3", TELEPORT_FRAMES],
    ]) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/enderman", scene, "lottie.json"), "utf8"),
      );
      assert.equal(lottie.h, 640, scene);
      assert.ok(lottie.layers.filter((l) => l.ty === 4).length >= min, scene);
    }
  });
});
