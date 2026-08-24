# Build n' Stack

A tablet-first endless stacking game for CAT Footwear. Players release construction blocks from a moving crane, balance each block with Matter.js physics, and climb the leaderboard without letting the stack collapse.

## Run locally

```powershell
npm install
npm run serve
```

Open `http://127.0.0.1:4173`. Use a tap/click or the spacebar to release a block.

## Project layout

- `index.html`, `style.css`, `script.js` — the player-facing game
- `admin/` — password-protected local player-data viewer and CSV export
- `assets/images/` — Illustrator-editable SVG sprite kit loaded directly by the game
- `assets/vendor/matter.min.js` — pinned Matter.js browser build
- `ASSET-GUIDE.md` — sprite dimensions, filenames, and replacement guidance

## Tuning

Gameplay values are grouped and documented near the top of `script.js`. The complete player experience is capped at `768px` via `--game-max-width` near the top of `style.css`. Open any file in `assets/images/` directly in Illustrator, save it back as SVG, and refresh the game to see the update.

## Data status

This version stores player submissions and scores in the browser's local storage. Supabase integration is planned but is not enabled yet. The current client-side admin password is suitable only for local prototyping and must be replaced with server-side authentication before collecting real promotional data.
