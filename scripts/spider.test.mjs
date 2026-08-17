import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { decodeTga, loadSpiderSkin } from "./lib/steve-model.mjs";
import { FACE, WALK_FRAMES, idleA, rearFrame, sampleDeath, sampleHurt, walkFrame } from "./lib/spider-poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

describe("spider skin", () => {
  it("decodes the official TGA with brown body and red eyes", async () => {
    const skin = await loadSpiderSkin();
    assert.equal(skin.width, 64);
    assert.equal(skin.height, 32);
    const px = (x, y) => {
      const i = (y * skin.width + x) * 4;
      return [skin.rgba[i], skin.rgba[i + 1], skin.rgba[i + 2], skin.rgba[i + 3]];
    };
    const [r, g, b] = px(41, 12);
    assert.ok(r > 80 && r > g && r > b, `spider eyes should be red, got ${r},${g},${b}`);
    const body = px(8, 8);
    assert.ok(body[0] < 80 && body[1] < 70 && body[2] < 60, `thorax should be brown, got ${body}`);
  });

  it("reads uncompressed 32-bit TGA pixels as top-left RGBA", () => {
    const buf = Buffer.alloc(18 + 8);
    buf[2] = 2;
    buf.writeUInt16LE(1, 12);
    buf.writeUInt16LE(2, 14);
    buf[16] = 32;
    buf[17] = 8;
    buf.set([1, 2, 3, 255], 18);
    buf.set([10, 20, 30, 255], 22);
    const tga = decodeTga(buf);
    assert.equal(tga.width, 1);
    assert.equal(tga.height, 2);
    assert.deepEqual([...tga.rgba.subarray(0, 4)], [30, 20, 10, 255]);
  });
});

describe("spider pose", () => {
  it("splays eight legs down from the thorax", () => {
    const pose = idleA();
    assert.equal(pose.view.yaw, 90);
    assert.equal(pose.parts.head.yaw, FACE.yaw);
    for (const id of ["leg0", "leg2", "leg4", "leg6"]) {
      assert.ok(pose.parts[id].roll > 30, `${id} right leg rolls down`);
    }
    for (const id of ["leg1", "leg3", "leg5", "leg7"]) {
      assert.ok(pose.parts[id].roll < -30, `${id} left leg rolls down`);
    }
  });

  it("loops the crawl and rears the front of the body", () => {
    assert.equal(walkFrame(0).parts.leg0.yaw, walkFrame(1).parts.leg0.yaw);
    const rear = rearFrame(0.5);
    assert.ok(rear.parts.body.pitch < idleA().parts.body.pitch - 8);
    assert.ok(rear.root.y > 0.4);
  });

  it("flashes on hurt and flips on death", () => {
    assert.ok(sampleHurt(0).flash > 0.5);
    assert.ok(sampleDeath(1).roll > 90);
  });
});

describe("generated spider assets", () => {
  it("writes a side-view SVG with head and legs", async () => {
    const svg = await readFile(resolve(ROOT, "assets/spider-side.svg"), "utf8");
    assert.match(svg, /id="spider"/);
    assert.match(svg, /id="head"/);
    assert.match(svg, /id="leg0"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  });

  it("ships idle, walk, and rear flipbooks", async () => {
    for (const [scene, min] of [
      ["scene-1", 8],
      ["scene-2", WALK_FRAMES],
      ["scene-3", 8],
      ["scene-4", 8],
      ["scene-5", 8],
    ]) {
      const lottie = JSON.parse(
        await readFile(resolve(ROOT, "public/projects/spider", scene, "lottie.json"), "utf8"),
      );
      assert.ok(lottie.op > lottie.ip, scene);
      assert.ok(lottie.layers.filter((l) => l.ty === 4).length >= min, scene);
    }
  });
});
