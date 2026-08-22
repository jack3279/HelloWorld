# Block faces

Original CC0 16×16 pixel faces, flattened into horizontal color runs
so Skottie can draw terrain, interactives, and nature without a bitmap.
These are newly drawn (or generated) tiles — not Mojang / Minecraft textures.

| Sheet | What it is |
| --- | --- |
| `../blocks-sheet.svg` | Grass, dirt, stone, ores, sand, oak, bricks |
| `../blocks-sheet-2.svg` | More wood, nether, stone types, snow |
| `../blocks-sheet-3.svg` | Crafting table, furnace, chest, door, TNT, bedrock |
| `../blocks-sheet-4.svg` | Leaves, sapling, flowers, water, torch, ladder |
| `../blocks-sheet-5.svg` | Glass, ice, pumpkin, hay, farmland, mineral blocks |
| `<id>.svg` | One face, 512×512 |

Skottie scenes live at `public/projects/blocks/scene-N`.

| Scene | Contents |
| --- | --- |
| 1 | Terrain and ores |
| 2 | Wood, nether, stone |
| 3 | Interactives: table, furnace, chest, door, TNT, bedrock |
| 4 | Nature: leaves, grass, flowers, water, torch, ladder |
| 5 | Farm, ice, glass, mineral blocks |

Grayscale foliage (`leaves_*_opaque`, `tallgrass`, `vine`, `waterlily`) is
multiplied by biome tints so the atlas stays green, not grey.

Regenerate after a catalog change:

```bash
npm run generate:blocks
```
