# Creeper — side-view kit

Official four-leg model: head, body, four legs — **no arms**.
The body stays in true profile (facing right); the head yaws **45°** so
both eyes and the frown read.

| File | What it is |
| --- | --- |
| `../creeper-side.svg` | Idle still |
| `../creeper-walk.svg` | Mid-stride still |
| `walk-0.svg` … `walk-15.svg` | Quadruped trot |
| `swell-0.svg` … `swell-19.svg` | Fuse charge + white flash |
| `sheet.svg` | Walk frames in a row |

Skottie scenes live at `public/projects/creeper/scene-N`.

| Scene | Motion |
| --- | --- |
| 1 | Idle |
| 2 | Walk (opposite corners swing together) |
| 3 | Fuse swell + white flash |

Regenerate after a pose or skin change:

```bash
npm run generate:creeper
npm run check:creeper
```
