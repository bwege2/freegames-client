# Endless Sky 0.11.4 in the browser

**Endless Sky** (M. C. Martin and the community, GPL-3.0-or-later) ported to the browser. The
reference release is **0.11.4** (2026-10-31, the latest stable release), downloaded by
`re/endlesssky/fetch.sh` from `https://github.com/endless-sky/endless-sky` (`v0.11.4`, source archive
sha256 `971399cc91956171261f5a36429572201a35662db2b1d3615fd6043ee4a38a61`) and pinned there. The
port reads the original's own data files, converted losslessly where needed (sprites and the two
bitmap font atlases are stored as lossless WebP; the data files and sounds are unchanged).

## What is ported

* **The galaxy.** All 694 star systems, their hyperlinks, positions and trade prices; 619 planets
  with their descriptions, spaceport texts, landscapes, governments, shipyards and outfitters, from
  `data/map systems.txt`, `data/map planets.txt` and the species data files.
* **Ships and outfits.** All 917 ship definitions (including the data's variants) and 938 outfits
  with their masses, costs, shields, hull, drag, thrust, turn, capacities, weapon values, amounts and
  descriptions. A ship's final stats are the base ship plus its installed outfits, at the original's
  1/10,000 attribute precision.
* **Flight.** The original's frame-based model at 60 frames/s: `Ship::DoMovement`'s drag/thrust/
  reverse/afterburner, `Ship::DoGeneration`'s energy, fuel, heat, shield and hull regeneration, the
  min-hull disabling threshold, turret aiming, primary/secondary firing, reload counters,
  projectile velocity/lifetime/acceleration/homing, shield-first damage with piercing and blast
  damage, and hit force. Constants and formulas are from `source/Ship.cpp`, `Weapon.cpp`,
  `Projectile.cpp`, `DamageProfile.cpp` and `ship/ResourceLevels.cpp` of 0.11.4.
* **The star map, travel and landing.** The map draws every system and hyperlink; clicking a system
  sets a course through hyperlinks, `J` jumps one link, each jump costs the ship's `"jump fuel"`
  (100 for the Hyperdrive) and advances the date by one day. Landing uses the original's stellar
  orbit positions (`System::SetDate`) and the stellar object's sprite radius, and a spaceport
  recharges shields, hull, energy and fuel (`Port::LoadDefaultSpaceport`).
* **Trading.** The ten commodities with their original base prices, the `System::Price::Update`
  formula (`base - 100 * erf(supply / 20000)`, truncated), the daily economy (`KEEP = .89`,
  `EXPORT = .10`, `VOLUME = 2000`), cargo space and the deferred supply changes when the day steps.
* **Shipyard and outfitter.** The original's `Basic Ships`/`Basic Outfits` and every other sale list
  the planets name, with the original prices, outfit capacities and fit checks.
* **Pilot and save.** The default start scenario (`start "default"`: New Boston, Rutilicus,
  16 Nov 3013, 480,000 credits, the 480,000 mortgage at 0.4% daily interest over 365 days), the
  original's daily mortgage payment formula, and a text save file with the original's
  `pilot`/`date`/`system`/`planet`/`credits`/`ship`/`outfits`/`cargo`/`conditions`/`visited`/
  `economy` sections in your account storage (`pilot.txt`).
* **Assets.** The original's ship, outfit, projectile, effect, star, planet, land, asteroid,
  hardpoint, scene, map and menu sprites, its sounds and its two bitmap fonts
  (`images/font/ubuntu14r.png`, `ubuntu18r.png`), rendered with `Font.cpp`'s glyph advances and
  kerning.

## Controls

| Input | Action |
| --- | --- |
| Arrow keys or W/A/S/D | Thrust, reverse and turn |
| Space or Enter | Fire primary weapons |
| Q | Fire secondary weapons (missiles) |
| Shift or F | Afterburner |
| L | Land on the planet or station in range |
| J | Jump to the next system of the course |
| M | Star map; click a system to set a course |
| I | Pilot and ship information |
| Esc | Pause menu, or back from a panel |

The first screen offers **New Pilot** (name and one of the three ships for sale at New Boston:
Shuttle, Sparrow or Star Barge) and **Continue** when a save exists.

## Differences from the original

The browser and this port's scope force these deviations:

* **Missions, jobs, campaigns and news are not implemented.** The original's 2,347 mission
  definitions and its job board, conversation engine, condition assignments and event/war timeline
  are not simulated. Hails and boarding are not implemented either. Planets still have their
  descriptions and spaceport text, but no jobs are offered.
* **One ship at a time.** The original lets a pilot own a fleet, switch flagships, store outfits and
  hire escorts. This port flies one ship; buying a ship at a shipyard trades the current one in at
  75% of its value (the original's depreciation rules are more detailed), and the new ship keeps the
  old cargo only if it fits. Selling outfits returns 75% of their cost.
* **The intro is shortened.** The original's bank/shipyard conversation and its mission chain are
  skipped. New Pilot goes straight to the ship purchase (the same three Basic Ships and the same
  prices, deducted from the 480,000 credits) and starts landed on New Boston.
* **The star map shows the whole galaxy.** The original reveals systems as you visit and hear about
  them; this port dims unvisited systems but draws every one, so a player can plan a course
  anywhere.
* **The interface is rebuilt.** The game screen, HUD, panels and dialog style are drawn on a
  1024x768 canvas with the original bitmap fonts and sprites, but the panel layouts are not the
  original's pixel-exact `SpaceportPanel`/`TradingPanel`/`MapPanel`/`ShipyardPanel`/`OutfitterPanel`.
  The map's system labels, the commodity table and the outfit list are simpler.
* **The AI is a browser heuristic.** Pirates choose the nearest hostile, turn toward it and fire
  when it is in range; merchants wander. The original's `AI.cpp` (personalities, formations,
  targeting, fleet orders, cloaking, boarding and missile dodging) is not ported. Fleets spawn from
  the system's fleet weights; their approximate rate is one fleet per period, capped at 16 ships.
* **No ship-to-ship or ship-to-star collisions.** Projectiles hit ships and effects are drawn, and a
  planet can be landed on when the ship is close enough, but the original's collision masks (ramming
  another ship, hitting a star or an asteroid) are not ported.
* **No asteroids, minables, flotsam, fighters, drones, bays, escorts, cloaking, scanning or
  boarding.** Asteroids are not drawn and cannot be mined; destroyed ships leave effects, not
  salvage. 0.11.4's newer status effects (`slowness`, `disruption`, and the damage-over-time
  counters) are only partly applied.
* **No music.** The original repository does not contain its music; the port has the original's
  sounds (weapons, engines, explosions, landing, hyperdrive) but no soundtrack.
* **The random number generator is not libstdc++'s `mt19937_64`.** A port seed is deterministic, but
  the same seed does not reproduce the original's random stream. Physics, prices and every
  data-driven value are independent of this.
* **The save file is a compatible subset.** It writes the original's section names and can read the
  ship, outfits, cargo, credits, date, system, planet and conditions of an original save; missions,
  events, fleet members, planetary storage and the original's map-reveal state are not kept.
* **Sprites are lossless WebP, not PNG,** and a few assets are left out for licensing (below).

## Missing from this round (honest list)

The whole game is far larger than one round. Done and checked: data loading, flight, combat with
the original numbers, the map/travel, landing, trading, shipyard, outfitter, pilot info and save.
Not done: missions/jobs/conversations, the intro campaign, fleet/escort management, boarding and
capture, asteroid mining and flotsam, fighters/drones, cloaking and scanning, the event/war
timeline, the original's exact UI panels and music. `re/endlesssky/NOTES.md` records the source
functions and constants the port follows.

## Building and testing

```sh
bash re/endlesssky/fetch.sh                 # the pinned source, data and assets (not committed)
python3 re/endlesssky/tools/build-assets.py # copies/converts them (Python 3 + Pillow)
cd web && npm install
npm test                                    # includes games/endlesssky/test/*.test.ts
npm run build
node scripts/screenshots.mjs endlesssky     # with the built site and server/target/freegames-server.jar
```

The tests compare the port with the original's data and formulas: the data tree's counts, known
ship/outfit/weapon values, system links and orbits, the trade price formula, the start scenario, the
movement/inertia formulas, the mortgage payment and a save round trip. They do not need the network
or a browser (`node --test`).

## License

The port and the original's code and data are **GPL-3.0-or-later**; the original's artwork is
**CC-BY-SA-4.0** (most of it by Michael Zahniser and the contributors named in
`ORIGINAL-CREDITS.txt` and `ORIGINAL-COPYRIGHT.txt`); the sounds are public domain, CC-BY-3.0 or
CC-BY-SA-4.0. See `LICENSE.md` and `assets/licenses.json` for every file's license and author.
