import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { OP, T, R, poseAt } from "./generate-coin-lottie.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function layer(j, name) {
  return j.layers.find((l) => l.nm === name);
}

function keyAt(prop, t) {
  return prop.k.find((k) => k.t === t);
}

describe("coin spin", () => {
  it("completes one revolution and loops", async () => {
    const j = JSON.parse(await readFile(resolve(ROOT, "public/projects/coin/scene-1/lottie.json"), "utf8"));
    assert.equal(j.ip, 0);
    assert.equal(j.op, OP);
    assert.equal(j.fr, 60);
    const front = layer(j, "Front face");
    const back = layer(j, "Back face");
    const rim = layer(j, "Rim");
    assert.ok(front && back && rim);
    assert.equal(j.layers.some((l) => l.nm === "Edge slab"), false);

    const sx = front.ks.s.k;
    assert.deepEqual(sx[0].s, sx[sx.length - 1].s);
    assert.ok(keyAt(front.ks.s, 45).s[0] > 90, "back of the spin is face-on again");
    assert.ok(keyAt(front.ks.s, 22).s[0] < 10, "quarter-turn face is edge-on");

    const fo = front.ks.o.k;
    const bo = back.ks.o.k;
    assert.ok(fo[0].s[0] > 90);
    assert.equal(bo[0].s[0], 0);
    assert.ok(keyAt(back.ks.o, 45).s[0] > 90);
    assert.equal(keyAt(front.ks.o, 45).s[0], 0);
  });

  it("projects a cylinder: rim wider than the face, faces on opposite rims", () => {
    const faceOn = poseAt(0);
    const quarter = poseAt(22);
    const mid = poseAt(45);
    const threeQ = poseAt(67);
    const angled = poseAt(11);

    assert.equal(faceOn.faceSx, 100);
    assert.ok(Math.abs(faceOn.bodySx - 100) < 0.2);
    assert.ok(quarter.bodySx > T / (2 * R) * 100 - 1, "edge keeps the coin thickness");
    assert.ok(quarter.bodySx > quarter.faceSx, "rim is the silhouette at 90°");
    assert.ok(angled.bodySx - angled.faceSx > 10, "45° shows a thick crescent");
    assert.ok(angled.frontX > 200);
    assert.ok(angled.backX < 200);
    assert.ok(mid.backO > 90);
    assert.equal(mid.frontO, 0);
    assert.ok(threeQ.bodySx > threeQ.faceSx);
    assert.deepEqual(
      [poseAt(0).faceSx, poseAt(0).frontO, poseAt(0).backO],
      [poseAt(OP).faceSx, poseAt(OP).frontO, poseAt(OP).backO],
    );
  });
});
