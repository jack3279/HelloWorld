# Minecraft block faces

Official Bedrock 16×16 block textures, flattened into horizontal color runs
so Skottie can draw terrain, interactives, and nature without a bitmap.

| Sheet | What it is |
| --- | --- |
| `../blocks-sheet.svg` | Grass, dirt, stone, ores, sand, oak, bricks |
| `../blocks-sheet-2.svg` | More wood, nether, stone types, snow |
| `../blocks-sheet-3.svg` | Crafting table, furnace, chest, door, TNT, bedrock |
| `../blocks-sheet-4.svg` | Leaves, sapling, flowers, water, torch, ladder |
| `<id>.svg` | One face, 512×512 |

Skottie scenes live at `public/projects/blocks/scene-N`.

| Scene | Contents |
| --- | --- |
| 1 | Terrain and ores |
| 2 | Wood, nether, stone |
| 3 | Interactives: table, furnace, chest, door, TNT, bedrock |
| 4 | Nature: leaves, grass, flowers, water, torch, ladder |

Grayscale foliage (`leaves_*_opaque`, `tallgrass`, `vine`, `waterlily`) is
multiplied by biome tints so the atlas stays green, not grey.

Regenerate after a catalog change:

```bash
npm run generate:blocks
```
