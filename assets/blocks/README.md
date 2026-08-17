# Minecraft block faces

Official Bedrock 16×16 block textures, flattened into horizontal color runs
so Skottie can draw terrain and interactives without a bitmap.

| Sheet | What it is |
| --- | --- |
| `../blocks-sheet.svg` | Grass, dirt, stone, ores, sand, oak, bricks |
| `../blocks-sheet-2.svg` | More wood, nether, stone types, snow |
| `../blocks-sheet-3.svg` | Crafting table, furnace, chest, door, TNT, bedrock |
| `<id>.svg` | One face, 512×512 |

Skottie scenes live at `public/projects/blocks/scene-N`.

| Scene | Contents |
| --- | --- |
| 1 | Terrain and ores |
| 2 | Wood, nether, stone |
| 3 | Interactives: table, furnace, chest, door, TNT, bedrock |

Regenerate after a catalog change:

```bash
npm run generate:blocks
```
