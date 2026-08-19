import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadSquidSkin } from "./lib/steve-model.mjs";
import { SQUID_MODEL } from "./lib/squid-model.mjs";
import { IDLE_FRAMES, REST_FRAMES, WALK_FRAMES, idleA, walkFrame } from "./lib/squid-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("squid model", () => {
  it("is a body plus eight tentacles with rest yaw", () => {
    const tentacles = SQUID_MODEL.filter((p) => p.id.startsWith("tentacle-"));
    assert.equal(tentacles.length, 8);
    assert.equal(SQUID_MODEL.find((p) => p.id === "body").parent, undefined);
    assert.equal(tentacles[0].parent, "body");
    assert.ok(tentacles.every((p) => Number.isFinite(p.restYaw)));
  });

  it("loads the official squid skin", async () => {
    const skin = await loadSquidSkin();
    assert.equal(skin.width, 64);
    assert.ok(skin.height >= 32);
  });
});

describe("squid pose", () => {
  it("copies each tentacle's rest yaw into the pose", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    for (const part of SQUID_MODEL.filter((p) => p.id.startsWith("tentacle-"))) {
      assert.equal(pose.parts[part.id].yaw, part.restYaw);
    }
    const swim = walkFrame(0.25);
    assert.ok((swim.root?.y ?? 0) !== 0);
  });
});

describe("generated squid assets", () => {
  it("writes walk, idle, rest, hurt, and death frames", async () => {
    const svg = await readFile(resolve(ROOT, "assets/squid-side.svg"), "utf8");
    assert.match(svg, /id="body"/);
    assert.match(svg, /id="tentacle-1"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    for (let i = 0; i < WALK_FRAMES; i++) {
      const frame = await readFile(resolve(ROOT, "assets/squid-sprites", `walk-${i}.svg`), "utf8");
      assert.match(frame, /<svg /);
    }
    for (const clip of ["idle", "rest", "hurt", "death"]) {
      for (let i = 0; i < 8; i++) {
        const frame = await readFile(resolve(ROOT, "assets/squid-sprites", `${clip}-${i}.svg`), "utf8");
        assert.match(frame, /<svg /);
      }
    }
  });

  it("ships idle, swim, and rest flipbooks", async () => {
    for (const [scene, minLayers] of [
      ["scene-1", IDLE_FRAMES],
      ["scene-2", WALK_FRAMES],
      ["scene-3", REST_FRAMES],
    ]) {
      const lottie = JSON.parse(await readFile(resolve(ROOT, "public/projects/squid", scene, "lottie.json"), "utf8"));
      assert.equal(lottie.assets.length, 0, scene);
      assert.ok(lottie.layers.length >= minLayers, scene);
    }
  });
});
