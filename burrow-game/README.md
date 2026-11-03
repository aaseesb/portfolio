# Moss & Marigold (working title)
A cozy pixel-art farm sim. Plain JS + canvas, no build step, state in `localStorage`.

Loop: animals make eggs / milk / wool over time (and while you're away, up to 12h) → collect → cook in the kitchen → coins. Petting raises happiness, which speeds production.

Run: `python3 -m http.server -d burrow-game` then open http://localhost:8000

## Assets
Currently **placeholder sprites** drawn in code (`src/sprites.js`). Plan: Kenney Tiny Farm (CC0, https://kenney.nl/assets/tiny-farm) recolored with `tools/recolor.py` into `assets/`.

## v1 scope
3 animals, 1 pen, 1 kitchen, 5 recipes, happiness, coins, save/load. Out of scope: seasons, NPCs, quests, decoration, walkable map.
