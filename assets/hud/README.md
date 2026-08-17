# Minecraft HUD chrome

Official Bedrock UI textures, flattened into horizontal color runs so Skottie
can draw hearts, the hotbar, menu buttons, and bars without a bitmap.

| File | What it is |
| --- | --- |
| `heart.svg` / `heart-half.svg` / `heart-empty.svg` / `heart-flash.svg` | 9×9 health icons |
| `hunger-*.svg` / `armor-*.svg` | Matching status icons |
| `hotbar-slot.svg` / `selected-slot.svg` / `hotbar.svg` | Slot frame and 9-slot bar |
| `button-idle.svg` / `button-hover.svg` / `button-pressed.svg` | 9-slice menu button |
| `xp-bar.svg` / `health-bar.svg` | XP green and heart-red bars |
| `survival.svg` | Armor + hearts + hunger + XP + hotbar |
| `survival-items.svg` / `hotbar-items.svg` | Same chrome with a 9-item loadout |
| `sheet.svg` | 4×4 atlas of the pieces |

Skottie scenes live at `public/projects/hud/scene-N`.

| Scene | Motion |
| --- | --- |
| 1 | Static chrome atlas |
| 2 | Survival HUD mockup |
| 3 | Hearts 20 → 0 with a flash on the hit |
| 4 | Button idle → hover → pressed |
| 5 | Health bar fill 0 → 100% |
| 6 | Filled hotbar, selected slot cycles |

Regenerate after a texture or layout change:

```bash
npm run generate:hud
```
