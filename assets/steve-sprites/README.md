# Steve — 2D platformer kit

Side-view sprite frames for a character that faces **right**. Flip on X for the left-facing set (`scaleX = -1` around the `anchor`).

| File | What it is |
| --- | --- |
| `../steve-side.svg` | Idle hero, the pose to drop into a mockup |
| `<id>.svg` | One frame (256×320 locomotion, 384×336 combat) |
| `sheet.svg` | Idle / run / jump in an 8-column grid |
| `combat-sheet.svg` | Sword / hurt / death |
| `atlas.json` | Frame rects, foot anchors, animation lists |

## Animations

| Name | Frames | Suggested fps | Loop |
| --- | --- | --- | --- |
| `idle` | `idle-a`, `idle-b` | 6 | yes |
| `run` | `run-0` … `run-7` | 12 | yes |
| `jump` | crouch → rise → apex → fall → land | 10 | no |
| `swing` | `swing-0` … `swing-9` (diamond sword) | 12 | no |
| `hurt` | `hurt-0` … `hurt-7` (recoil + white flash) | 12 | no |
| `death` | `death-0` … `death-11` | 10 | no |

Locomotion frames are 256×320 on `sheet.svg`. Combat frames are 384×336 on `combat-sheet.svg` so the sword reach and the fall stay in frame.

Pin each sprite to the ground with `atlas.frames[id].anchor` (the pixel under the feet). The same numbers are `originX` / `originY` in `scripts/lib/steve-poses.mjs`.

Regenerate after a pose or skin change:

```bash
npm run generate:steve
```
