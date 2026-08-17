// Writes one square SVG per Minecraft block face, plus a 4×4 sheet per page:
//   assets/blocks/<id>.svg
//   assets/blocks-sheet.svg
//   assets/blocks-sheet-2.svg
//   assets/blocks-sheet-3.svg
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
  blockPages,
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
const pages = blockPages();

for (const block of BLOCKS) {
  const png = await loadBlock(block.id);
  const runs = runsOf(png);
  const svg = wrapSvg(
    block.id,
    `${block.title} / ${block.label}`,
    SINGLE,
    `<g id="${block.id}">\n    ${svgFromRuns(runs, singleBox).join("\n    ")}\n  </g>`,
  );
  await writeFile(resolve(outDir, `${block.id}.svg`), svg);
}

for (const [index, page] of pages.entries()) {
  const atlas = layoutAtlas(page);
  const parts = [];
  for (const cell of atlas.cells) {
    const runs = runsOf(await loadBlock(cell.block.id));
    parts.push(`<g id="${cell.block.id}">\n    ${svgFromRuns(runs, cell).join("\n    ")}\n  </g>`);
  }
  const name = index === 0 ? "blocks-sheet.svg" : `blocks-sheet-${index + 1}.svg`;
  const path = resolve(ROOT, "assets", name);
  await writeFile(path, wrapSvg(`blocks-sheet-${index + 1}`, "Minecraft block faces", ATLAS, parts.join("\n  ")));
  console.log(`Wrote ${path}`);
}

console.log(`Wrote ${BLOCKS.length} squares in ${outDir}`);
