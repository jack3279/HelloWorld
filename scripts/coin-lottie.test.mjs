import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { EDGE_R, OP, T, R, cornerRadius, poseAt } from "./generate-coin-lottie.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function layer(j, name) {
  return j.layers.find((l) => l.nm === name);
}

function keyAt(prop, t) {
  return prop.k.find((k) => k.t === t);
}

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node);
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  for (const value of Object.values(node)) walk(value, visit);
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
    const edge = layer(j, "Edge");
    assert.ok(front && back && rim && edge);
    assert.equal(layer(j, "Sheen"), undefined, "traveling sheen is gone");
    assert.ok(keyAt(edge.ks.o, 22).s[0] > 80, "rounded-rect edge is on at 90°");
    assert.equal(keyAt(edge.ks.o, 0).s[0], 0);

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

  it("keeps lighting flat and the edge-on body a rounded rectangle", async () => {
    const j = JSON.parse(await readFile(resolve(ROOT, "public/projects/coin/scene-1/lottie.json"), "utf8"));
    const types = [];
    const fills = [];
    walk(j, (node) => {
      if (node.ty) types.push(node.ty);
      if (node.ty === "fl" && Array.isArray(node.c?.k)) fills.push(node.c.k);
    });
    assert.ok(!types.includes("gf"), "no gradient fills");
    assert.ok(!types.includes("gs"), "no gradient strokes");
    assert.ok(fills.length > 0);
    for (const color of fills) {
      assert.ok(color[0] >= 0.8, `red channel stays bright: ${color}`);
      assert.ok(color[1] >= 0.58, `green channel stays bright: ${color}`);
    }

    const edge = layer(j, "Edge");
    const plate = edge.shapes.find((s) => s.nm === "edge-plate");
    const rect = plate.it.find((s) => s.ty === "rc");
    assert.equal(rect.r.a, 0);
    assert.equal(rect.r.k, EDGE_R);

    const rim = layer(j, "Rim");
    const body = rim.shapes.find((s) => s.nm === "rim-body");
    const rimRect = body.it.find((s) => s.ty === "rc");
    const r0 = keyAt(rimRect.r, 0).s[0];
    const r22 = keyAt(rimRect.r, 22).s[0];
    const r45 = keyAt(rimRect.r, 45).s[0];
    const r67 = keyAt(rimRect.r, 67).s[0];
    assert.ok(Math.abs(r0 - R) < 0.2, "face-on rim is a circle");
    assert.ok(Math.abs(r45 - R) < 0.2, "back face-on rim is a circle");
    assert.ok(r22 < 20, "90° rim is a small-corner rounded rect, not a capsule");
    assert.ok(r67 < 20, "270° rim is a small-corner rounded rect, not a capsule");
    assert.ok(r22 < r0 / 4);
  });

  it("projects a cylinder: rim wider than the face, faces on opposite rims", () => {
    const faceOn = poseAt(0);
    const quarter = poseAt(22);
    const mid = poseAt(45);
    const threeQ = poseAt(67);
    const angled = poseAt(11);

    assert.equal(faceOn.faceSx, 100);
    assert.ok(Math.abs(faceOn.bodySx - 100) < 0.2);
    assert.ok(quarter.bodyW > T - 4, "edge keeps the coin thickness");
    assert.ok(quarter.bodySx > quarter.faceSx, "rim is the silhouette at 90°");
    assert.ok(angled.bodyW - 2 * R * (angled.faceSx / 100) > T * 0.5, "45° shows a thick crescent");
    assert.ok(angled.frontX > 200);
    assert.ok(angled.backX < 200);
    assert.ok(mid.backO > 90);
    assert.equal(mid.frontO, 0);
    assert.ok(threeQ.bodySx > threeQ.faceSx);
    assert.ok(quarter.bodyR < 20);
    assert.ok(threeQ.bodyR < 20);
    assert.ok(Math.abs(faceOn.bodyR - R) < 0.2);
    assert.equal(cornerRadius(T, 0), EDGE_R);
    assert.deepEqual(
      [poseAt(0).faceSx, poseAt(0).frontO, poseAt(0).backO],
      [poseAt(OP).faceSx, poseAt(OP).frontO, poseAt(OP).backO],
    );
  });
});
