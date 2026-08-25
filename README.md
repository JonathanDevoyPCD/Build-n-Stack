# Build n' Stack

A tablet-first endless stacking game for CAT Footwear. Players release construction blocks from a moving crane, balance each block with Matter.js physics, and climb the leaderboard without letting the stack collapse.

## Run locally

```powershell
npm install
npm run serve
```

Open `http://127.0.0.1:4173`. Use a tap/click or the spacebar to release a block.

## Project layout

- `index.html`, `style.css`, `script.js` - the player-facing game
- `admin/` - Supabase Auth-protected player-data viewer and CSV export
- `assets/images/` - Illustrator-editable SVG sprite kit loaded directly by the game
- `assets/vendor/matter.min.js` - pinned Matter.js browser build
- `assets/vendor/supabase.js` - pinned Supabase browser client
- `assets/supabase-config.js` - browser-safe project URL and publishable key
- `supabase/migrations/` - versioned database schema, RLS policies and grants
- `ASSET-GUIDE.md` - sprite dimensions, filenames, and replacement guidance

## Tuning

Gameplay values are grouped and documented near the top of `script.js`. The complete player experience is capped at `768px` via `--game-max-width` near the top of `style.css`. Open any file in `assets/images/` directly in Illustrator, save it back as SVG, and refresh the game to see the update.

## Data status

Player submissions now sync to Supabase. LocalStorage acts only as an offline queue; a run is removed from the device after the cloud insert succeeds, and returning to the menu clears the previous entrant's form details. Contact number and email are stored in the protected `build_n_stack_player_results` table; anonymous visitors cannot select that table. The public `build_n_stack_leaderboard` table exposes only player name, score and completion time.

The publishable key in `assets/supabase-config.js` is intentionally browser-visible and receives only the narrow permissions allowed by RLS. Never add the database password, a secret key or a service-role key to this repository.

Public browser submissions are suitable for campaign gameplay but are not cheat-proof. A prize-grade competition should add server-side score verification, rate limiting and bot protection.

## One-time admin account setup

The admin page uses Supabase Auth rather than a password embedded in browser code.

1. In the Supabase Dashboard, open **Authentication > Users** and create the administrator account.
2. In the SQL Editor, replace the example email below and run:

```sql
insert into public.build_n_stack_admins (user_id)
select id
from auth.users
where lower(email) = lower('admin@example.com')
on conflict (user_id) do nothing;
```

3. Open `/admin/` and sign in with that account's email and Auth password. This is separate from the project's database password.
