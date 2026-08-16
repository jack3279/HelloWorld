import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { OP } from "./generate-coin-lottie.mjs";
import { SVG_DIR, SVG_STEP, coinSvg, frameFileName, svgFrameNumbers } from "./generate-coin-svg-frames.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = resolve(ROOT, SVG_DIR);

describe("coin SVG sequence", () => {
  it("takes every 4th Lottie frame, a quarter of the 90-tick spin", () => {
    const frames = svgFrameNumbers();
    assert.deepEqual(frames[0], 0);
    assert.deepEqual(frames.at(-1), 88);
    assert.equal(frames.length, 23);
    assert.equal(frames.length, Math.ceil(OP / SVG_STEP));
    assert.ok(frames.every((f, i) => f === i * SVG_STEP));
    assert.ok(!frames.includes(22));
    assert.ok(!frames.includes(89));
  });

  it("writes one SVG per sampled frame plus a sheet and atlas", async () => {
    const names = await readdir(DIR);
    const frames = svgFrameNumbers();
    for (const f of frames) assert.ok(names.includes(frameFileName(f)), frameFileName(f));
    assert.ok(names.includes("sheet.svg"));
    assert.ok(names.includes("atlas.json"));
    const extras = names.filter((n) => n.startsWith("coin-") && n.endsWith(".svg") && !frames.includes(Number(n.slice(5, 7))));
    assert.deepEqual(extras, []);

    const atlas = JSON.parse(await readFile(resolve(DIR, "atlas.json"), "utf8"));
    assert.equal(atlas.meta.step, 4);
    assert.equal(atlas.meta.count, 23);
    assert.equal(Object.keys(atlas.frames).length, 23);
  });

  it("keeps front / edge / back as vector shapes", async () => {
    const front = await readFile(resolve(DIR, "coin-00.svg"), "utf8");
    assert.match(front, /viewBox="0 0 400 400"/);
    assert.match(front, /<polygon /);
    assert.match(front, /id="front"/);
    assert.doesNotMatch(front, /id="back"/);
    assert.doesNotMatch(front, /id="edge"/);

    const nearEdge = await readFile(resolve(DIR, "coin-20.svg"), "utf8");
    assert.match(nearEdge, /<rect /);
    assert.match(nearEdge, /id="edge"/);

    const back = await readFile(resolve(DIR, "coin-44.svg"), "utf8");
    assert.match(back, /id="back"/);
    assert.doesNotMatch(back, /<polygon /);
    assert.doesNotMatch(back, /id="front"/);

    const edgeOn = coinSvg(20);
    assert.match(edgeOn, /rx="1[2-9]/);
  });
});
