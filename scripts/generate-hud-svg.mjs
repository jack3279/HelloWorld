// Minecraft HUD chrome kit from official Bedrock UI textures:
//   assets/hud/<id>.svg     one icon or composed control
//   assets/hud/sheet.svg    4×4 atlas
//   assets/hud/survival.svg survival mockup
//
// Usage:
//   node scripts/generate-hud-svg.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HOTBAR_LOADOUT, WORLD_LOADOUT, loadItemPixels } from "./lib/minecraft-items.mjs";
import { loadItemTexture } from "./lib/held-item.mjs";
import {
  ATLAS,
  BAR_CANVAS,
  BUTTON_CANVAS,
  HEARTS_CANVAS,
  SURVIVAL,
  composeBar,
  composeButton,
  composeHearts,
  composeHotbar,
  composeOverlay,
  composeSurvival,
  composeTip,
  loadCrosshair,
  fitSprite,
  itemPixelsFromRgba,
  layoutAtlas,
  layoutCentered,
  loadAtlasSprite,
  loadHud,
  runsOf,
  svgFromRuns,
  wrapSvg,
} from "./lib/minecraft-hud.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../assets/hud");

function spriteSvg(id, label, src, canvas) {
  const box = layoutCentered(src, canvas);
  const body = `<g id="${id}">\n    ${svgFromRuns(runsOf(src), box).join("\n    ")}\n  </g>`;
  return wrapSvg(id, label, canvas, body);
}

async function maybeSword() {
  try {
    return itemPixelsFromRgba(await loadItemTexture("diamond_sword.png"));
  } catch {
    return null;
  }
}

await mkdir(OUT, { recursive: true });

const singles = [
  ["heart", "Heart", () => loadHud("heart"), { w: 256, h: 256 }],
  ["heart-half", "Half heart", () => loadHud("heart-half"), { w: 256, h: 256 }],
  ["heart-empty", "Empty heart", () => loadHud("heart-empty"), { w: 256, h: 256 }],
  ["heart-flash", "Heart flash", () => loadHud("heart-flash"), { w: 256, h: 256 }],
  ["hunger-full", "Hunger", () => loadHud("hunger-full"), { w: 256, h: 256 }],
  ["hunger-half", "Half hunger", () => loadHud("hunger-half"), { w: 256, h: 256 }],
  ["hunger-empty", "Empty hunger", () => loadHud("hunger-empty"), { w: 256, h: 256 }],
  ["armor-full", "Armor", () => loadHud("armor-full"), { w: 256, h: 256 }],
  ["armor-half", "Half armor", () => loadHud("armor-half"), { w: 256, h: 256 }],
  ["armor-empty", "Empty armor", () => loadHud("armor-empty"), { w: 256, h: 256 }],
  ["hotbar-slot", "Hotbar slot", () => loadHud("hotbar-0"), { w: 256, h: 256 }],
  ["selected-slot", "Selected hotbar slot", () => loadHud("selected"), { w: 256, h: 256 }],
  ["hearts", "Ten hearts", () => composeHearts(20), HEARTS_CANVAS],
  ["hotbar", "Hotbar", () => composeHotbar({ selected: 0 }), SURVIVAL],
  ["button-idle", "Menu button", () => composeButton({ state: "idle" }), BUTTON_CANVAS],
  ["button-hover", "Menu button hover", () => composeButton({ state: "hover" }), BUTTON_CANVAS],
  ["button-pressed", "Menu button pressed", () => composeButton({ state: "pressed" }), BUTTON_CANVAS],
  ["xp-bar", "XP bar", () => composeBar({ fill: 1, kind: "xp" }), BAR_CANVAS],
  ["health-bar", "Health bar", () => composeBar({ fill: 0.7, kind: "health" }), BAR_CANVAS],
];

for (const [id, label, load, canvas] of singles) {
  const src = await load();
  await writeFile(resolve(OUT, `${id}.svg`), spriteSvg(id, label, src, canvas));
}

const sword = await maybeSword();
const survival = await composeSurvival({ item: sword, selected: 0 });
await writeFile(resolve(OUT, "survival.svg"), spriteSvg("survival", "Survival HUD", survival, SURVIVAL));

const loadout = [];
for (const id of HOTBAR_LOADOUT) loadout.push(await loadItemPixels(id));
const filled = await composeSurvival({ items: loadout, selected: 0 });
await writeFile(resolve(OUT, "survival-items.svg"), spriteSvg("survival-items", "Survival HUD with items", filled, SURVIVAL));
const filledBar = await composeHotbar({ items: loadout, selected: 0 });
await writeFile(resolve(OUT, "hotbar-items.svg"), spriteSvg("hotbar-items", "Hotbar with items", filledBar, SURVIVAL));

const worldItems = [];
const worldCounts = [];
for (const slot of WORLD_LOADOUT) {
  worldItems.push(await loadItemPixels(slot.id));
  worldCounts.push(slot.count);
}
const stacked = await composeHotbar({ items: worldItems, counts: worldCounts, selected: 1 });
await writeFile(resolve(OUT, "hotbar-stacks.svg"), spriteSvg("hotbar-stacks", "Hotbar with blocks and stacks", stacked, SURVIVAL));
await writeFile(resolve(OUT, "crosshair.svg"), spriteSvg("crosshair", "Crosshair", await loadCrosshair(), { w: 256, h: 256 }));
await writeFile(resolve(OUT, "item-tip.svg"), spriteSvg("item-tip", "Item name tip", await composeTip("Dirt"), { w: 320, h: 96 }));
const overlay = await composeOverlay({
  items: worldItems,
  counts: worldCounts,
  selected: 1,
  tip: "Dirt",
});
await writeFile(resolve(OUT, "survival-overlay.svg"), spriteSvg("survival-overlay", "Crosshair and item tip", overlay, { w: 640, h: 360 }));

const atlas = layoutAtlas();
const atlasParts = [];
for (const cell of atlas.cells) {
  const src = await loadAtlasSprite(cell);
  const fit = fitSprite(src, cell.cell);
  const box = { x: cell.cellX + fit.x, y: cell.cellY + fit.y, texel: fit.texel };
  atlasParts.push(...svgFromRuns(runsOf(src), box));
}
await writeFile(
  resolve(OUT, "sheet.svg"),
  wrapSvg("hud-sheet", "Minecraft HUD chrome", ATLAS, `<g id="hud-sheet">\n    ${atlasParts.join("\n    ")}\n  </g>`),
);

console.log(`Wrote HUD kit in ${OUT}`);
