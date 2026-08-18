# Pig — side-view kit

Official four-leg pig: body pitched 90° onto the legs, head + snout, no arms.
The body stays in true profile (facing right); the head yaws **45°** so
the face and snout read.

| File | What it is |
| --- | --- |
| `../pig-side.svg` | Idle still |
| `../pig-walk.svg` | Mid-stride still |
| `walk-0.svg` … `walk-15.svg` | Quadruped trot |
| `idle-0.svg` … `idle-7.svg` | Standing idle |
| `rest-0.svg` … `rest-7.svg` | Head-down rest |
| `sheet.svg` | Walk frames in a row |

Skottie scenes live at `public/projects/pig/scene-N`.

| Scene | Motion |
| --- | --- |
| 1 | Idle |
| 2 | Walk (opposite corners swing together) |
| 3 | Rest |

Regenerate after a pose or skin change:

```bash
npm run generate:pig
npm run check:pig
```
