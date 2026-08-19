import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyFlash } from "./lib/steve-model.mjs";
import { flashBeat } from "./lib/combat-motion.mjs";
import { bowFileForPull, itemSlabUv, punchAlpha, swordPart } from "./lib/held-item.mjs";

describe("hit flash", () => {
  it("lerps shaded color toward white", () => {
    assert.deepEqual(applyFlash([0, 0, 0], 1), [255, 255, 255]);
    assert.deepEqual(applyFlash([10, 20, 30], 0), [10, 20, 30]);
    const mid = applyFlash([0, 0, 100], 0.5);
    assert.ok(mid[2] > 100);
    assert.ok(mid[0] > 0);
  });

  it("alternates on even beats and decays", () => {
    assert.ok(flashBeat(0, 8) > flashBeat(2, 8));
    assert.equal(flashBeat(1, 8), 0);
  });
});

describe("held items", () => {
  it("maps the 16×16 sprite onto the camera-facing slab", () => {
    const uv = itemSlabUv(16);
    assert.deepEqual(uv.nx, { x: 0, y: 0, w: 16, h: 16 });
    assert.equal(uv.front.w, 1);
    const sword = swordPart();
    assert.equal(sword.parent, "arm-right");
    assert.equal(sword.id, "held-sword");
  });

  it("punches out faint item alpha and picks bow pull textures", () => {
    const punched = punchAlpha({
      width: 1,
      height: 1,
      rgba: Uint8Array.from([10, 20, 30, 8]),
    });
    assert.equal(punched.rgba[3], 0);
    assert.equal(bowFileForPull(0), "bow_standby.png");
    assert.equal(bowFileForPull(0.3), "bow_pulling_0.png");
    assert.equal(bowFileForPull(0.5), "bow_pulling_1.png");
    assert.equal(bowFileForPull(0.9), "bow_pulling_2.png");
  });

  it("decodes the 4-bit diamond sword palette", async () => {
    const { loadItemTexture, ITEM_FILES } = await import("./lib/held-item.mjs");
    const sword = await loadItemTexture(ITEM_FILES.sword);
    assert.equal(sword.width, 16);
    assert.equal(sword.height, 16);
    let opaque = 0;
    for (let i = 3; i < sword.rgba.length; i += 4) if (sword.rgba[i] > 0) opaque += 1;
    assert.ok(opaque > 20, "sword silhouette has pixels");
  });

  it("keeps the sword silhouette instead of filling a solid slab", async () => {
    const { buildFigure, loadSkin } = await import("./lib/steve-model.mjs");
    const { swordExtra } = await import("./lib/held-item.mjs");
    const { swingStrike } = await import("./lib/steve-poses.mjs");
    const extra = await swordExtra();
    assert.equal(extra.part.sparse, true);
    const { parts } = buildFigure({
      skin: await loadSkin(),
      pose: swingStrike(),
      extras: [extra],
    });
    const sword = parts.find((p) => p.id === "held-sword");
    assert.ok(sword, "sword part exists");
    assert.ok(sword.faces.some((f) => f.sparse), "item faces stay sparse");
    const body = parts.find((p) => p.id === "torso");
    assert.ok(body.faces.every((f) => !f.sparse), "body cubes keep a solid base fill");
  });

  it("points the idle sword in front of Steve", async () => {
    const { buildFigure, loadSkin, makeProjector, boundsOf } = await import("./lib/steve-model.mjs");
    const { swordExtra } = await import("./lib/held-item.mjs");
    const { idleA } = await import("./lib/steve-poses.mjs");
    const pose = {
      ...idleA(),
      parts: { ...idleA().parts, "held-sword": { pitch: 40, roll: 0, yaw: 0 } },
    };
    const { parts } = buildFigure({ skin: await loadSkin(), pose, extras: [await swordExtra()] });
    const project = makeProjector({ scale: 6.6, originX: 168, originY: 308 });
    const sword = boundsOf(parts.filter((p) => p.id === "held-sword"), project);
    const torso = boundsOf(parts.filter((p) => p.id === "torso"), project);
    assert.ok((sword.minX + sword.maxX) / 2 > (torso.minX + torso.maxX) / 2, "blade sits in front");
  });
});
