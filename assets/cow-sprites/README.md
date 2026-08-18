# Cow — side-view kit

Official four-leg cow: body pitched 90° onto the legs, head + horns + udder,
no arms. The body stays in true profile (facing right); the head yaws **45°**
so the face and horns read.

| File | What it is |
| --- | --- |
| `../cow-side.svg` | Idle still |
| `../cow-walk.svg` | Mid-stride still |
| `walk-0.svg` … `walk-15.svg` | Quadruped trot |
| `idle-0.svg` … `idle-7.svg` | Standing idle |
| `rest-0.svg` … `rest-7.svg` | Head-down rest |
| `sheet.svg` | Walk frames in a row |

Skottie scenes live at `public/projects/cow/scene-N`.

| Scene | Motion |
| --- | --- |
| 1 | Idle |
| 2 | Walk (opposite corners swing together) |
| 3 | Rest |

Regenerate after a pose or skin change:

```bash
npm run generate:cow
npm run check:cow
```
