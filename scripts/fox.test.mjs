import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadFoxSkin } from "./lib/steve-model.mjs";
import { FOX_MODEL } from "./lib/fox-model.mjs";
import { BODY_REST_PITCH, FACE, IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, sampleIdle } from "./lib/fox-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("fox model", () => {
  it("is a head with ears and muzzle, body, four legs, and a tail", () => {
    const ids = FOX_MODEL.map((p) => p.id);
    assert.ok(ids.includes("head"));
    assert.ok(ids.includes("muzzle"));
    assert.ok(ids.includes("ear-left"));
    assert.ok(ids.includes("tail"));
    assert.equal(FOX_MODEL.find((p) => p.id === "muzzle").parent, "head");
    assert.equal(FOX_MODEL.find((p) => p.id === "head").parent, undefined);
  });

  it("loads the official fox skin", async () => {
    const skin = await loadFoxSkin();
    assert.ok(skin.width >= 48);
    assert.ok(skin.height >= 32);
  });
});

describe("fox pose", () => {
  it("keeps the body at the vanilla rest pitch and the head at 45°", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    assert.ok(pose.parts.body.pitch >= BODY_REST_PITCH);
    assert.ok(pose.parts.tail);
  });

  it("idles without leaving the 45° head turn", () => {
    for (let i = 0; i < IDLE_FRAMES; i++) {
      assert.equal(sampleIdle(i / IDLE_FRAMES).parts.head.yaw, FACE.yaw);
    }
  });
});

describe("generated fox assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/fox-side.svg"), "utf8");
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="muzzle"/);
    assert.match(svg, /id="tail"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/fox-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/fox-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, walk, and rest flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/fox", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
