# A Dark Room (port)

Michael Townsend's **A Dark Room 1.4** (Doublespeak Games, 2013), ported from its browser source
and data (`re/darkroom/`). The original is already a browser game: this port keeps its CSS, its 86
FLAC sounds and its own game logic, translated to TypeScript so that the site can host it with
account saves. The 920×720 stage (700 px of game plus the 220 px notification column) is scaled to
the player window.

## Controls

* **Mouse / touch**: every action is a button, a resource row or a map tile.
* **Arrow keys / WASD**: move on the world map; on the other screens, **left/right** switch between
  the unlocked location tabs (Room, Outside, Path, Ship, Fabricator), as in the original.
* **Click a neighbouring map tile** to walk there.
* The original's menu stays in the bottom-right corner: **save.** (export/import the save as
  base64), **restart.**, **hyper.** (double speed), **lights off.** and **sound on./off.**.
* The website's **Back** leaves the game at any time; the save is written before it stops.

## The game

All of the original is here, with its texts, numbers, events, enemies and timing:

* **A Dark Room**: light the fire, keep it burning, meet the builder, gather wood, build traps,
  carts, huts, the tannery, smokehouse, workshop and steelworks, trade with nomads, and grow the
  village.
* **A Silent Forest / Outside**: population, workers, food and water, traps and huts, the village
  and its events, the compass.
* **The world map**: the original's generated 30-radius map with its landmarks (village, iron and
  coal mines, sulphur mine, forest, field, barrens, road, house, cave, town, city, outpost, ship,
  borehole, battlefield, swamp, cache, executioner), light radius, supplies, food/water movement,
  fights and loot.
* **The path**: the original event deck, setpieces, combat (weapons, armour, health, statuses),
  the ship parts and fuel, lift-off, space, the asteroid field and the ending.
* **The fabricator** and the **prestige** loop with its perks and score.
* **Saves**: the original's `gameState` JSON is kept in one account-scoped server file
  (`savegame.json`); loading, restarting and base64 export/import work as in the original.
  The original wrote `localStorage.gameState`; the format is byte-for-byte the same JSON.

## Deviations the browser/site forces and known gaps

Faithful: the original logic (translated line for line), all event and combat content, the map
generator, the room/outside/village economy, the ship/space/fabricator/prestige stages, the whole
CSS and every sound.

* **English only**: the original's translations (`lang/`, 4.3 MB) are not shipped; the source
  strings are English and the port's `_()` fills `{0}` placeholders with the same formatter.
* **The site replaces browser glue**: no `localStorage` (account storage instead), no Dropbox, no
  Google Analytics, no browser/mobile warning pages, no external app-store/share/GitHub menu items,
  and no doublespeak logo. The game's own menu (save/restart/hyper/lights/sound) remains.
* **The original's code is translated as one generated factory** (`src/legacy.ts`, produced by
  `re/darkroom/tools/build-port.mjs` from the pinned download). It is TypeScript, but the original
  is dynamic browser JavaScript, so the generated file is marked `@ts-nocheck`; the adapter and the
  save/text pieces around it are typed. This keeps the port a direct translation instead of a
  rewrite with new behaviour.
* **The CSS is the original's**, with every selector scoped to the game container
  (`re/darkroom/tools/scope-css.mjs`) so it cannot leak into the site; `dark.css` applies only with
  the container's `dark` class. The stage is scaled to fit the player window; the original assumes
  a 920×720 desktop window and redirects phones to a warning page.
* **The original's bugs are kept** (the game is a direct translation): the `FIGHT_CHANCE = 0`
  wilderness fights that are dead code, the builder's self-cancelling stoke, the delayed-wanderer
  save path, and the rest of the quirks listed in `re/darkroom/NOTES.md`.

The original's `LICENSE.md`, `README.md`, `lang/`, `img/` warnings and the `lib/` libraries are in
the download (not committed); see `re/darkroom/fetch.sh`.

## Running

```sh
bash re/darkroom/fetch.sh            # downloads 1.4 and copies its CSS and sounds
cd web && npm test                    # the port's generated-code/data tests
npm run build && node scripts/screenshots.mjs darkroom
```
