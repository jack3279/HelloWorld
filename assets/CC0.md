# CC0 pixel pack

Every block, item, HUD icon, fluid strip, and entity skin under `assets/`
is original pixel art released as **CC0 1.0 Universal** (public domain).

Nothing in this folder is copied from Mojang, Minecraft, or the Bedrock /
Java texture packs. The generators in `scripts/lib/cc0-*.mjs` paint new
16×16 (and skin-net) texels, then flatten them into SVG color runs.

To redraw after a catalog change:

```bash
npm run generate:blocks
npm run generate:items
npm run generate:hud
npm run generate:water
npm run generate:lava
npm run generate:combat
```
