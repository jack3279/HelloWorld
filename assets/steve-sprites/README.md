# Steve — 2D platformer kit

Side-view sprite frames for a character that faces **right**. Flip on X for the left-facing set (`scaleX = -1` around the `anchor`).

| File | What it is |
| --- | --- |
| `../steve-side.svg` | Idle hero, the pose to drop into a mockup |
| `<id>.svg` | One frame, 256×320, transparent |
| `sheet.svg` | Every frame in an 8-column grid |
| `atlas.json` | Frame rects, foot anchors, animation lists |

## Animations

| Name | Frames | Suggested fps | Loop |
| --- | --- | --- | --- |
| `idle` | `idle-a`, `idle-b` | 6 | yes |
| `run` | `run-0` … `run-7` | 12 | yes |
| `jump` | crouch → rise → apex → fall → land | 10 | no |

Pin each sprite to the ground with `atlas.frames[id].anchor` (the pixel under the feet). The same numbers are `originX` / `originY` in `scripts/lib/steve-poses.mjs`.

Regenerate after a pose or skin change:

```bash
npm run generate:steve
```
