// Writes one square SVG per Minecraft block face, plus a 4×4 sheet:
//   assets/blocks/<id>.svg
//   assets/blocks-sheet.svg
//
// Usage:
//   node scripts/generate-blocks-svg.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ATLAS,
  BLOCKS,
  SINGLE,
  layoutAtlas,
  layoutSingle,
  loadBlock,
  runsOf,
  svgFromRuns,
  wrapSvg,
} from "./lib/minecraft-blocks.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const outDir = resolve(ROOT, "assets/blocks");
await mkdir(outDir, { recursive: true });

const singleBox = layoutSingle();
const atlas = layoutAtlas();
const sheetParts = [];

for (const block of BLOCKS) {
  const png = await loadBlock(block.id);
  const runs = runsOf(png);
  const svg = wrapSvg(
    block.id,
    `${block.title} / ${block.label}`,
    SINGLE,
    `<g id="${block.id}">\n    ${svgFromRuns(runs, singleBox).join("\n    ")}\n  </g>`,
  );
  const path = resolve(outDir, `${block.id}.svg`);
  await writeFile(path, svg);
  const cell = atlas.cells.find((c) => c.block.id === block.id);
  sheetParts.push(`<g id="${block.id}">\n    ${svgFromRuns(runs, cell).join("\n    ")}\n  </g>`);
}

const sheet = resolve(ROOT, "assets/blocks-sheet.svg");
await writeFile(
  sheet,
  wrapSvg("blocks-sheet", "Minecraft block faces", ATLAS, sheetParts.join("\n  ")),
);

console.log(`Wrote ${BLOCKS.length} squares in ${outDir}`);
console.log(`Wrote ${sheet}`);
