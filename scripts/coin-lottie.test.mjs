import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("coin spin", () => {
  it("completes one revolution and loops", async () => {
    const j = JSON.parse(await readFile(resolve(ROOT, "public/projects/coin/scene-1/lottie.json"), "utf8"));
    assert.equal(j.ip, 0);
    assert.equal(j.op, 90);
    assert.equal(j.fr, 60);
    const front = j.layers.find((l) => l.nm === "Front face");
    const back = j.layers.find((l) => l.nm === "Back face");
    const rim = j.layers.find((l) => l.nm === "Rim");
    assert.ok(front && back && rim);
    const sx = front.ks.s.k;
    assert.deepEqual(sx[0].s, sx[sx.length - 1].s);
    const mid = sx[Math.floor(sx.length / 2)].s[0];
    assert.ok(mid > 90, "back of the spin is face-on again");
    const edge = sx[Math.floor(sx.length / 4)].s[0];
    assert.ok(edge < 20, "quarter-turn is edge-on");
    const fo = front.ks.o.k;
    const bo = back.ks.o.k;
    assert.ok(fo[0].s[0] > 90);
    assert.equal(bo[0].s[0], 0);
    assert.ok(bo[Math.floor(bo.length / 2)].s[0] > 90);
  });
});
