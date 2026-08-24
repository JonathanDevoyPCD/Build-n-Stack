# Build n' Stack asset handoff

The game already runs with procedural placeholder artwork. Add your transparent PNG files at the exact paths below, then change `GAME_CONFIG.assets.loadCustomSprites` near the top of `script.js` from `false` to `true`. No other JavaScript changes are required unless you want to change a block's physical size or material.

## Block sprites

Place these files in `assets/images/boxes/`:

| File | Current physics size | Suggested source canvas |
| --- | ---: | ---: |
| `box-01-timber-crate.png` | 156 x 108 | 624 x 432 px |
| `box-02-red-bricks.png` | 166 x 92 | 664 x 368 px |
| `box-03-wood-beams.png` | 190 x 74 | 760 x 296 px |
| `box-04-steel-beams.png` | 188 x 70 | 752 x 280 px |
| `box-05-window-bricks.png` | 158 x 116 | 632 x 464 px |
| `box-06-cat-cargo.png` | 164 x 102 | 656 x 408 px |

The suggested canvases are 4x the physics size for crisp high-density tablet rendering. Transparent padding should be kept very small because the physics rectangle matches the configured width and height, not the visible pixels inside the PNG.

Edit each entry in `GAME_CONFIG.boxes` at the top of `script.js` to change its width, height, density, friction, bounce, filename or label.

## Crane hook

- Path: `assets/images/crane/crane-hook.png`
- Suggested canvas: 384 x 384 px, transparent PNG.
- Centre the cable connection at the top middle.
- Centre the hook pivot in the image.
- Leave enough transparent room below the hook for its curved end.
- The game displays it at 96 x 96 logical pixels by default.

## Background and foreground layers

Place these in `assets/images/backgrounds/`:

- `midground.png`: wide transparent layer for buildings, distant trees and site scenery. Suggested 2400 x 900 px.
- `foreground.png`: wide transparent layer for objects that pass in front of the tower near ground level. Suggested 2400 x 900 px.
- `cloud-01.png`, `cloud-02.png`, `cloud-03.png`: transparent cloud variations, around 600 x 300 px each.
- `bird-01.png`, `bird-02.png`, `bird-03.png`: transparent bird variations, around 240 x 120 px each.

Do not bake the sky gradient into these layers. The game renders the changing morning, afternoon, sunset and night sky behind them.

Keep the middle of the foreground fairly open so it never hides the block landing area. Stronger foreground detail works best around the left and right edges.

## Brand assets still useful

- Official CAT Footwear logo in transparent PNG format.
- Official campaign font files or font names, if available.
- Approved CAT colour values and brand guidance.
- Final privacy disclaimer and a privacy-policy URL.
- Sound files, if you want branded audio instead of the current generated effects.
- Any campaign dates, prize wording or leaderboard eligibility rules.

## Live tuning

Open `index.html?debug=1` through the local web server to show the tuning panel. It can adjust gravity, crane speed, friction, bounce, landing stability, fall distance, camera smoothing and the day/night duration while the game runs.

Use **Copy config** in that panel to copy every current setting as JSON.
