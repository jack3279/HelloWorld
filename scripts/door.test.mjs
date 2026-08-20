import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { DOOR_MODEL, DOOR_SWING_FRAMES, doorSwingPose, stackDoorSkin } from "./lib/door-model.mjs";
import { loadBlock } from "./lib/minecraft-blocks.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("door model", () => {
  it("is a hinged lower leaf with a parented upper leaf", () => {
    const ids = DOOR_MODEL.map((p) => p.id);
    assert.ok(ids.includes("lower"));
    assert.ok(ids.includes("upper"));
    assert.equal(DOOR_MODEL.find((p) => p.id === "upper").parent, "lower");
    assert.deepEqual(DOOR_MODEL.find((p) => p.id === "lower").pivot, [-8, 0, 0]);
  });

  it("stacks official upper and lower oak and iron faces", async () => {
    const oak = stackDoorSkin(await loadBlock("door-oak-upper"), await loadBlock("door-oak"));
    assert.equal(oak.width, 16);
    assert.equal(oak.height, 32);
    const iron = stackDoorSkin(await loadBlock("door-iron-upper"), await loadBlock("door-iron"));
    assert.equal(iron.width, 16);
    assert.equal(iron.height, 32);
  });

  it("swings the hinge from 0° to 90°", () => {
    assert.equal(doorSwingPose(0).parts.lower.yaw, 0);
    assert.equal(doorSwingPose(1).parts.lower.yaw, 90);
  });
});

describe("generated door assets", () => {
  it("writes eight swing frames", async () => {
    const hero = await readFile(resolve(ROOT, "assets/door-side.svg"), "utf8");
    assert.match(hero, /id="lower"/);
    assert.match(hero, /id="upper"/);
    assert.doesNotMatch(hero, /NaN|undefined/);
    for (let i = 0; i < DOOR_SWING_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/door-sprites", `swing-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
      assert.match(frame, /id="lower"/);
      const iron = await readFile(resolve(ROOT, "assets/iron-door-sprites", `swing-${i}.svg`), "utf8");
      assert.match(iron, /<svg /);
      assert.match(iron, /id="lower"/);
    }
  });

  it("ships a swing flipbook", async () => {
    const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/door/scene-1/lottie.json"), "utf8"));
    assert.equal(lottie.assets.length, 0);
    assert.equal(lottie.layers.length, DOOR_SWING_FRAMES);
  });
});
