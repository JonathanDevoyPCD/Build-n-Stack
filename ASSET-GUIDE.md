# Build n' Stack editable SVG asset guide

The game now loads a complete SVG starter kit directly from `assets/images/`. Every SVG can be opened and edited in Adobe Illustrator without exporting a PNG.

## Illustrator workflow

1. Open an SVG directly from the table below.
2. Edit the named groups and shapes. The artwork intentionally uses simple paths, rectangles, circles, strokes and fills.
3. Keep the existing artboard/viewBox dimensions and transparent background.
4. Save as SVG to the same filename. Illustrator's standard SVG export is suitable.
5. Refresh the game in the browser. No JavaScript change or image export is required.

Keep visible artwork close to the artboard edges on block sprites. Matter.js uses the configured rectangular width and height for collisions, so large transparent margins would make a block appear to float or collide early.

## Block sprites

| Editable SVG | Physics/artboard size | Purpose |
| --- | ---: | --- |
| `assets/images/boxes/box-01-timber-crate.svg` | 156 x 108 | Timber crate |
| `assets/images/boxes/box-02-red-bricks.svg` | 166 x 92 | Red brick wall |
| `assets/images/boxes/box-03-wood-beams.svg` | 190 x 74 | Stacked wood beams |
| `assets/images/boxes/box-04-steel-beams.svg` | 188 x 70 | Stacked steel beams |
| `assets/images/boxes/box-05-window-bricks.svg` | 158 x 116 | Brick wall with window |
| `assets/images/boxes/box-06-cat-cargo.svg` | 164 x 102 | CAT cargo block |

The artboard dimensions match the physics dimensions in `GAME_CONFIG.boxes`. If you change an artboard's proportions, update that block's `width` and `height` in `script.js` as well.

## Crane hook

- Editable file: `assets/images/crane/crane-hook.svg`
- Artboard: 384 x 384
- Display size: 96 x 96 logical pixels
- The cable connection is centred near the top of the artwork.
- Keep the hook assembly centred so it remains aligned with the carried block.
- `crane.hookSpriteSize` controls the rendered SVG size.
- `crane.hookContactOffset` marks the visible hook tip relative to its centre pivot.
- `crane.hookBoxOverlap` controls how far the hook tucks behind every attached box.

The box attachment is calculated from each box's individual height, so all six variations meet the hook consistently. These three values are also available in the `?debug=1` live tuner. The moving rail and cable remain code-drawn because their length and position change continuously during play.

## Game logo

- Editable file: `assets/images/logo/BNS-LOGO.svg`
- Used on the main menu and in the gameplay HUD.
- Keep the existing viewBox proportions so both placements scale consistently.
- Convert custom-font lettering to outlines before public deployment so the logo does not depend on fonts installed on the player's device.

## Background and foreground layers

| Editable SVG | Artboard | Layer behavior |
| --- | ---: | --- |
| `assets/images/backgrounds/midground.svg` | 2400 x 900 | Distant buildings and trees; slow parallax |
| `assets/images/backgrounds/foreground.svg` | 2400 x 900 | Edge trees and shrubs drawn in front of the stack |
| `assets/images/backgrounds/cloud-01.svg` | 660 x 300 | Independently drifting cloud |
| `assets/images/backgrounds/cloud-02.svg` | 660 x 300 | Independently drifting cloud |
| `assets/images/backgrounds/cloud-03.svg` | 660 x 300 | Independently drifting cloud |
| `assets/images/backgrounds/bird-01.svg` | 240 x 120 | Independently animated bird |
| `assets/images/backgrounds/bird-02.svg` | 240 x 120 | Independently animated bird |
| `assets/images/backgrounds/bird-03.svg` | 240 x 120 | Independently animated bird |

Keep the central section of `foreground.svg` mostly open so the tower remains readable. Do not add a sky rectangle to either large layer: the game generates its changing morning, afternoon, sunset and night sky dynamically behind the SVGs.

## Procedural elements intentionally retained

The changing sky, sun/moon, stars, crane cable, foundation and particle effects remain code-rendered. They respond to gameplay, camera height or physics and are not static sprite placeholders.

## Replacing or disabling the SVG kit

All paths live in `GAME_CONFIG.assets` and `GAME_CONFIG.boxes` near the top of `script.js`. Set `loadCustomSprites` to `false` to compare the SVG kit with the original Canvas fallbacks.

## Brand assets still useful

- Official CAT Footwear logo artwork.
- Official campaign font files or approved font names.
- Approved CAT colour values and brand guidance.
- Final privacy disclaimer and privacy-policy URL.
- Branded sound files.
- Campaign dates, prize wording and leaderboard eligibility rules.

The `CAT` text in the cargo starter SVG remains editable text. Before final production delivery, replace it with approved official logo vectors or convert approved lettering to outlines to avoid font substitution.

## Live tuning

Open `index.html?debug=1` through the local web server to show the tuning panel. It can adjust gravity, crane speed, friction, bounce, landing stability, fall distance, camera smoothing and day/night duration while the game runs.

Use **Copy config** to copy the current settings as JSON.
