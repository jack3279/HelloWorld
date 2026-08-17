// Writes one square SVG per hotbar item, plus the 4×4 sheet:
//   assets/items/<id>.svg
//   assets/items-sheet.svg
//
// Usage:
//   node scripts/generate-items-svg.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ATLAS,
  BLOCK_ITEMS,
  ITEMS,
  SINGLE,
  itemPages,
  layoutAtlas,
  layoutSingle,
  loadItem,
  runsOf,
  svgFromRuns,
  wrapSvg,
} from "./lib/minecraft-items.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const outDir = resolve(ROOT, "assets/items");
await mkdir(outDir, { recursive: true });

const singleBox = layoutSingle();

for (const item of [...ITEMS, ...BLOCK_ITEMS]) {
  const png = await loadItem(item.id);
  const svg = wrapSvg(
    item.id,
    `${item.title} / ${item.label}`,
    SINGLE,
    `<g id="${item.id}">\n    ${svgFromRuns(runsOf(png), singleBox).join("\n    ")}\n  </g>`,
  );
  await writeFile(resolve(outDir, `${item.id}.svg`), svg);
}

for (const [index, page] of itemPages().entries()) {
  const atlas = layoutAtlas(page);
  const parts = [];
  for (const cell of atlas.cells) {
    const runs = runsOf(await loadItem(cell.item.id));
    parts.push(`<g id="${cell.item.id}">\n    ${svgFromRuns(runs, cell).join("\n    ")}\n  </g>`);
  }
  const name = index === 0 ? "items-sheet.svg" : `items-sheet-${index + 1}.svg`;
  const path = resolve(ROOT, "assets", name);
  await writeFile(path, wrapSvg(`items-sheet-${index + 1}`, "Minecraft item icons", ATLAS, parts.join("\n  ")));
  console.log(`Wrote ${path}`);
}

console.log(`Wrote ${ITEMS.length + BLOCK_ITEMS.length} squares in ${outDir}`);
