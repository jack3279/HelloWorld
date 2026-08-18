# Minecraft item icons

Official Bedrock 16×16 item sprites, flattened into horizontal color runs so
Skottie can draw hotbar icons and world drops without a bitmap.

This is the survival loadout, not a full item museum: swords, tools, food,
a potion, and a few materials the HUD actually puts in slots. Two extra
pages cover armor and the mob-drop / food icons the overworld demo uses.

| File | What it is |
| --- | --- |
| `../items-sheet.svg` | 4×4 atlas of the 16 hotbar icons |
| `<id>.svg` | One icon, 512×512 |

Skottie scenes live at `public/projects/items/scene-N`.

| Scene | Motion |
| --- | --- |
| 1 | Static icon atlas |
| 2 | Four items drop, bounce, then bob |
| 3 | Diamond sword drops and flies into slot 1 |
| 4 | Armor (iron / diamond / gold / netherite) |
| 5 | Mob drops and extra food |

Block faces used as items (`dirt`, `cobblestone`, `oak-planks`, `torch`, …)
live in the same folder. The mixed survival bar is `public/projects/hud/scene-7`
(stacks) and `scene-8` (crosshair + name tip).

The tool-only filled hotbar is `public/projects/hud/scene-6`.

Extra pages (armor, mob drops, more food) live at `scene-4` and `scene-5`.
Leather helmet / leggings / boots are not in this Bedrock items pack.

Regenerate after a catalog change:

```bash
npm run generate:items
npm run generate:hud
```
