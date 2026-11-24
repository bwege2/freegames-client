# 0 A.D. — Farmland (2), a playable vertical slice

**0 A.D.** (Wildfire Games) is a free real-time strategy game of ancient warfare. This folder is a
browser port of one skirmish map from the latest stable release, **Release 28 “Boiorix”
(`v0.28.0`, 2026-02-16/18)**. It is not the whole game: it is a coherent, tested slice with a real
economy, base building, an army, combat, capture, victory, an opponent and online 1v1, played as
one of two civilisations. What is missing is listed below, precisely.

The port is TypeScript and three.js. It is not an emulator or a WASM build; it reads the original
release's data formats, templates and assets.

## The reference

* **Original:** *0 A.D.* (Wildfire Games), <https://play0ad.com/>, engine *Pyrogenesis*.
* **Reference release:** Release 28 “Boiorix”, version **0.28.0**, tag `v0.28.0`, commit
  `a2cae4d69f816e9e9d7eecb6bf88f762afc0c90d` (2026-02-15), released 2026-02-16.
* **Archives:** the official source downloads from <https://releases.wildfiregames.com/>:
  * `0ad-0.28.0-unix-build.tar.xz`, 164,975,536 bytes, SHA-256
    `27e217755ef76a922fe58dbf593d96e54b6ed2375d23f548c35619aa6bd5a42a`;
  * `0ad-0.28.0-unix-data.tar.xz`, 1,415,012,652 bytes, SHA-256
    `e844b30ae2102c47e0a4fff2f0e0ef05ba0cebb1890aa72276fa12457c39526f`.
  `re/0ad/fetch.sh` verifies both and extracts them into `re/0ad/orig/` (gitignored); no original
  archive is committed.
* **Map:** `binaries/data/mods/public/maps/skirmishes/farmland_2p.{xml,pmp}`, “Farmland (2)”.
  2,921 placed entities, 16×16 patches (256×256 four-metre tiles, 1024×1024 m), 23 terrain
  textures, two players.
* **Ships:** two civilisations, the **Athenians** and the **Carthaginians**, one per player. The
  local player chooses in the menu; online, the host's choice goes to seat 0 and the guest gets the
  other. Each has its own Civic Centre, houses and units with the original Punic/Hellenic models,
  portraits and stats.

## What is playable

* **Economy.** Food (berry bushes, fields, deer), wood (trees and bushes), stone (rock formations)
  and metal (ore). Each worker carries 10 units, walks to a dropsite and back. The rates and
  capacities are the original `ResourceGatherer` values (`0.5 fruit`, `0.75 wood`, `0.5 stone`,
  `0.5 metal` for a hoplite; `1.0/0.7/0.35/0.35` for a civilian), and fields have the original
  `DiminishingReturns` 0.9.
* **Buildings.** Civic Centre, House, Storehouse, Farmstead, Field, Barracks and Stone Tower (the
  last requires Town phase in the original templates and is therefore shown but not buildable in
  this Village-phase slice). Costs, build times, population bonuses, dropsite types, footprints
  and health come from the original XML. Multiple builders use the original `BuildTimeModifier`
  0.7 formula (`n^0.7 / n`).
* **Units.** Athens: Hoplite (melee spearman), Slinger Militia (ranged) and Athenian Artisan
  (civilian worker/builder). Carthage: Spearman, Archer and Carthaginian Artisan. The units are
  trained at the Civic Centre and the Barracks with their own original templates, and each
  civilisation builds its own seven structures. The templates give health, armour, attack
  damage/types, ranges, repeat times, projectile speed/spread/gravity, armour, vision, speed and
  population; all are read at runtime.
* **Combat and capture.** 0 A.D.'s damage formula (`attack * 0.9^armour`, bonuses multiplied,
  melee/ranged), prepare and repeat timers, ballistic projectiles, projectiles with spread and
  gravity, death, and building capture: each melee attack removes capture points
  (`2.5 × 0.9^capture-resistance` for a melee citizen), and the Civic Centre changes owner at zero. The
  enemy Civic Centre is the conquest objective; a player with none loses.
* **Online 1v1.** The main menu's "Play online 1v1" opens the site's shared lobby; two seats run
  the same deterministic world, send their commands through the server and advance together. See
  the Online section below for the protocol, limits and rejoin behaviour.
* **Opponent.** A scripted player on the same world, costs and rates: it gathers, builds a
  storehouse, farmstead, field, barracks and houses in its own civilisation's style, trains its
  civilians and soldiers, defends its Civic Centre and attacks with a group of at least seven
  soldiers. It never receives free resources
  or units. It is not Petra.
* **UI.** The original resource and portrait icons, a top resource/population bar, selection panel
  with health and capture percentage, building/training buttons with original costs, minimap with
  fog of war, pause menu, controls screen, victory/defeat screen and `ctx.storage` save/load.
* **Camera and orders.** Camera-relative WASD/arrow pan, wheel zoom, middle/Shift+right drag
  rotate, left click/box select, Shift add, right click move/gather/attack/help a foundation, H
  stop, Space centre, Esc pause. The port's camera uses a 48° field of view and the same target
  point/yaw/pitch idea as the original's RTS camera.

## The data and how it is converted

`re/0ad/tools/assets.py` copies only the subset this slice uses into `web/games/0ad/assets/` and
records every file's source path, size and SHA-256 in `assets/MANIFEST.json`:

| Kind | Files | Bytes | Source |
| --- | ---: | ---: | --- |
| map (scenario XML + PMP) | 2 | 1,253,644 | `maps/skirmishes/farmland_2p.*` |
| templates (simulation XML) | 64 | 69,204 | `simulation/templates/…` (with parents/mixins) |
| actors (actor and prop XML) | 109 | 115,562 | `art/actors/…` |
| PMD meshes | 147 | 9,280,781 | `art/meshes/**.dae.cached.pmd` |
| PSA animations | 68 | 4,979,828 | `art/animation/**.dae.cached.psa` |
| actor textures | 70 | 14,611,002 | `art/textures/skins/**` → lossless WebP |
| terrain textures | 23 | 2,583,468 | `art/textures/terrain/types/**` → 256² lossless WebP |
| sky cube faces | 5 | 73,572 | engine mod `art/textures/skies/default/*` → lossless WebP |
| portrait/resource icons | 23 | 552,567 | `art/textures/ui/session/portraits/**` → PNG; unit portraits keep their civ folder |
| HUD fonts + licences | 4 | 2,223,606 | engine mod `fonts/FreeSans.ttf`, `LinBiolinum_Rah.ttf` + licences |
| favicon source | 1 | 126,453 | Athenians' emblem from `art/textures/ui/session/portraits/emblems/` |
| **total** | **516** | **35,869,687** | |

The DDS textures are decoded losslessly to WebP (terrain 512→256 px, still 64 px/m; actor skins
keep their size). PMD/PSA files are the original compiled binary formats, kept unchanged and parsed
by `src/data/pmd.ts` / `src/data/psa.ts`; this is a lossless conversion to a browser-readable
format, the same approach Lugaru takes with its original binary model files. Template/actor XML is
the original text (the actor groups are flattened into `actors.json` for the renderer, with every
mesh, texture and animation reference preserved). `assets/MANIFEST.json` records each source file,
size and hash.

Everything in `assets/` is either:

* **GPL-2.0-or-later**: templates and map XML/PMP (the release's `binaries/data/` default), aggregated
  with the GPL-3.0-or-later port code; or
* **CC BY-SA 3.0**: the `art/` models, animations, textures and actor XML, the sky faces and the
  icons, shipped as a separate work beside the code and not relicensed; or
* the HUD fonts, under the GNU FreeFont/Libertine font exceptions (see `LICENSE.md`).

No audio, music, CJK font, shader or translation is shipped. There is no NC/ND file in this
release; the classification and the full command log are in `re/0ad/NOTES.md` and
`web/games/0ad/LICENSE.md`.

## Reproduce it from a clean checkout

```sh
# from the repository root; the reference archives are gitignored (~1.6 GB download, ~5 GB unpacked)
bash re/0ad/fetch.sh --unpack         # verifies the two SHA-256 sums, extracts orig/ and work/

# the shipped subset (writes web/games/0ad/assets/, needs python3 and ImageMagick)
python3 -I re/0ad/tools/assets.py

cd web
npm install                           # three, Vite, the SDK — pinned in package.json
npx tsc --noEmit
npm run build
npm test                              # catalog + SDK + all game tests
node scripts/screenshots.mjs 0ad      # needs the built site and the server jar
```

The committed `web/games/0ad/assets/` is complete: a checkout without `re/0ad/orig` can still
build and play the port. `re/0ad/fetch.sh` is only needed to rebuild the asset subset.

## Tests

`npm test` runs `web/games/0ad/test/*.test.ts` with Node's test runner against the shipped original
data. They cover:

* `data.test.ts` — the PMP header/heightmap hash, the 2,921 scenario entities and camera, the
  Athenian and Carthaginian template costs/health/armour, the PMD/PSA parsers on the original
  files and the complete shipped template set.
* `world.test.ts` — starting armies of both civilisations, Carthaginian archers, wood gathering and
  deposit, a house foundation built by civilians, training/population, the damage formula, the AI
  building and training its own civilisation, and a save/restore round trip that keeps both civs.
* `path.test.ts` — the 2 m navigation grid, blocked Civic Centre footprint, smoothed A* paths, and
  an AI that gathers, builds and trains without free resources.
* `capture.test.ts` — exact armour/bonus damage, capture points, a Civic Centre taken by capture
  and the resulting conquest victory, a slinger projectile hitting a hoplite, and a save under the
  server's 512 KiB limit.
* `assets.test.ts` — the hoplite's and the Punic archer's original meshes/textures/kit/animations,
  the separate portraits of the two civilisations' soldiers, a berry bush's separate mesh/texture
  groups, the manifest's licence split, its per-file sizes and SHA-256 hashes and unique
  destinations, and the HUD font files.
* `save.test.ts` — the original 0 A.D. save container (`metadata.json` fields, zip limits, rejection
  of foreign files).
* `commands.test.ts` — the command executor used by single-player and online play (ownership,
  movement, gathering, attack, building, training, placement, stance, rally).
* `test/online.test.ts` — two real WebSocket clients against the server: identical worlds and state
  hashes turn by turn, and a reloaded client catching up from `Sync` and staying equal.
* `games/0ad/e2e.mjs` — two headless Chromium contexts on the built site and the real server: create,
  join, ready and start a room; box-select and right-click a villager; train from the HUD; compare the
  simulations' hashes; reload and rejoin the running round; leave, which ends it for the other seat.
  The same run first chooses Carthage in the menu, checks the Punic start and reloads that save
  before the online round. Run it after `npm run build` and with the server jar present.

`mvn -B -f pom.xml test` covers the online module (`ZeroAdeModuleTest`, 12 loopback tests),
the game registration and the rest of the server. Saves use `ctx.storage`; there is no score table.

## Faithful to the original

| Port | Original source |
| --- | --- |
| 200 ms simulation turn | `DEFAULT_TURN_LENGTH` in `source/simulation2/system/TurnManager.h` |
| 4 m tiles, 92 height units/m, exact PMP layout | `source/graphics/Terrain.h`, `MapWriter.cpp`, `MapReader.cpp` |
| height interpolation and triangulation | `CTerrain::GetExactGroundLevel`, `GetTriangulationDir` |
| 2 m nav grid, water depth 2 m, slope 1.0, clearance 0.8 | 0 A.D.'s `simulation/data/pathfinder.xml` (1 m navcells; see deviations) |
| attack damage and armour | `simulation/helpers/Attack.js`: `0.9^armour`, multiplied bonuses |
| class matching and bonuses | `globalscripts/Templates.js` `MatchesClassList`; `AttackHelper.GetAttackBonus` |
| prepare, repeat, projectile speed/spread/gravity | `simulation/components/Attack.js` and the templates |
| gather rates, capacities, diminishing returns | `simulation/components/ResourceGatherer.js`, `ResourceSupply.js` |
| dropsite types | `ResourceDropsite` templates |
| build time, multiple builders | `Cost.BuildTime`, `Foundation.Build`'s `BuildTimeModifier` |
| training time, queue size 16 | `Cost.BuildTime`, `ProductionQueue.MaxQueueSize` |
| population costs/bonuses | `Cost.Population`, `Population.Bonus`, `Player.GetPopulationLimit` |
| vision/fog | `Vision.Range`; the port reveals a circular grid (0 A.D. has line-of-sight and terrain blockers) |
| capture points/resistance | `Capturable.CapturePoints`, `Resistance.Entity.Capture` |
| unit/building footprints and obstructions | `Footprint`, `Obstruction` templates |
| models, skeletons, animations | original PMD/PSA files, original bone transforms and `CSkeletonAnimDef::BuildBoneMatrices` sampling |
| terrain and sky textures, tree/rock/berry/ore/deer models | the release's CC BY-SA art, converted losslessly |

## Deviations and gaps (all of them)

**Scope.** One map (Farmland (2)), two civilisations (**Athenians** and **Carthaginians**, one per
player), **Village phase only**. Town and City phase, technologies, auras, promotions and the
buildings/units behind them are absent. The map's two starting entities that have no Village-phase
equivalent are dropped: the `default_cavalry` entity (a cavalryman) and the empty
`special_starting_unit`; the remaining start is 3 melee citizens, 2 ranged citizens and 5
civilians plus the Civic Centre per player (Athens: hoplites, slingers, artisans; Carthage:
spearmen, archers, artisans). Walls, gates, ships, siege engines, champions, heroes, mercenaries,
healers, traders, corrals, docks, temples, markets, forges, theaters, fortresses and wonders are
not implemented. The whole game has 14 civilisations and 150+ maps; the slice has two of its
civilisations on one small map.

**Simulation.** The original runs a 1 m hierarchical/vertex pathfinder with unit pushing; the port
uses a 2 m A* grid, straight-line smoothing and simple separation. There are no formations (0
A.D. itself currently hides most formation behaviour), no territory influence/borders, no
garrisoning, no line-of-sight blockers or shared vision, no unit pushing physics, no projectiles
with splash/status effects, no death animations or corpses (units disappear), no decay/rubble, no
promotion, no loot, no auto-gathering from a rally point and no waypoint queues. Capture is
simplified: a melee attack on a building also removes capture points; there is no separate capture
order, capture stance or capture animation. Buildings under construction are the real model scaled
vertically, not the original scaffold actor. Fields are infinite-supply as in the 0.28 templates,
but their crop variants are not shown (the port uses the original simple field plot actor).

**Rendering.** Buildings, terrain, units, resources and the sky are the original models/textures;
normal, specular, parallax and ambient-occlusion maps are not used, so the shading is diffuse
only. There are no shadows, decals, particles, water animation (Farmland (2) has no visible water
at its water height), birds, fish, weather, bloom, HDR, depth of field or motion blur. Terrain
textures are downscaled to 256² WebP (64 px/m) and actor textures kept at their original size as
lossless WebP. The fog of war is a circular cell grid, not 0 A.D.'s polygon/line-of-sight model.
The port shows no death animation: units and buildings are removed when destroyed.

**Audio.** None. No music or sound effect is shipped (the release's audio is CC BY-SA 3.0, but
this slice has no sound; a later round can add the original sound groups).

**Opponent.** A compact scripted opponent, not Petra. It does not scout, use its own AI scripts,
build walls, change phases, use formations, manage territory, retreat, or adapt its army
composition; it trains a fixed civilian count and its civilisation's melee/ranged citizens and
attacks in one group. It uses the same command API and the same costs/rates as the player.

**UI.** The HUD is CSS with the original portrait/resource icons and fonts, not 0 A.D.'s XML GUI.
There is no building tooltip tree, technology panel, diplomacy, chat, observer mode, unit
description or in-game credits screen. The minimap is a terrain-colour render with entity dots and
fog, not the original minimap texture.

**Save/load.** `ctx.storage` holds a `savegame.0adsave` zip with 0 A.D.'s `metadata.json` fields
(`engine_version`, `engine_serialization_version`, `playerID`, `initAttributes`, `gui.camera`,
`description`) and a `simulation.dat` that is **this port's** documented JSON serializer, not the
original C++ component serialization. It restores entities, resources, orders, production,
construction, capture points, RNG, fog and camera. There is one slot. The original's save list,
thumbnail, save names, and binary compatibility with real 0 A.D. saves are not implemented.

**Online.** Online 1v1 is implemented on the same simulation and is playable from the main menu's
"Play online 1v1" (the site's shared lobby). Both seats build the same `World` from `RoomStarted.seed`
and the same room options, send their commands to the server for turn `applied + 3` and advance only
when the server has relayed both seats' packets for the next 200 ms turn. The host's menu choice sets
the room's two civilisations (seat 0 gets the chosen one, seat 1 the other). `protocol/games/0ad.capnp`
carries the commands (move, gather, attack, build, train, place, stop, stance, rally), room options,
checked turns, sync chunks, chat and results; `server/.../games/zeroade/ZeroAdeModule.java` checks
option ranges, seats, sequential turn numbers, command sizes and map bounds, relays one server order,
keeps the checked history for a rejoining client (`Sync`, replay from turn 0), compares each client's
end report, and ends on leave/timeout/too-many-turns. Clients compare a state hash every 20 turns; a
mismatch ends the round as `desync`. A reloaded page or a rejoin gets its seat back through the SDK's
room rejoin and replays the checked turns. Commands are still checked for ownership on each client
(`applyCommand` only accepts the sender's own entities); the server does not know the map's entity
list, so a malicious client can only desync itself and is caught by the hash. Not implemented:
matchmaking beyond the shared lobby, spectators, online chat UI (the protocol relays chat and the
port shows it as a toast), a server-side simulation, tournaments or rankings. There is no score table.

`node --test games/0ad/test/online.test.ts` runs two real WebSocket clients against the server and
checks the turn stream, the state hashes and a reload-rejoin replay. `games/0ad/e2e.mjs` drives the
full two-browser flow through the real UI. `ZeroAdeModuleTest` (12 loopback tests) covers options,
turn ordering, malformed commands, sync chunks, leave, disagreement, timeout and the turn/history
bounds.

**Other.** The campaign, the other twelve civilisations, other maps, random maps, the Atlas editor, the original
console, chat, replay, and the original's exact 97 Hz render interpolation are absent. The camera
shortcuts differ from the original's configurable keys. There is no game-speed control, no
ceasefire, no regicide/relic/last-man-standing victory. The `Load game` button is enabled only when
a save exists (the main menu is rebuilt after a save).

## Credits and licences

The port's TypeScript, tests and tools are **GPL-3.0-or-later**, the website's licence. The game's
code and non-art data are **GPL-2.0-or-later**; its art is **CC BY-SA 3.0 Unported** and is shipped
as a separate work beside the code (aggregation, not a combined work), attributed to Wildfire
Games and the 0 A.D. contributors. The HUD fonts keep their own GNU font-exception licences. The
full file classification and attribution are in **`LICENSE.md`**; the reference inspection log is
`re/0ad/NOTES.md`.

> **0 A.D.** © Wildfire Games and the 0 A.D. contributors. Art: **CC BY-SA 3.0 Unported**,
> <https://creativecommons.org/licenses/by-sa/3.0/>, <https://www.wildfiregames.com/>.
> Changes: assets copied and, where needed, converted losslessly (DDS → WebP/PNG; PMD/PSA kept
> unchanged). Code and non-art data: GPL-2.0-or-later; this port: GPL-3.0-or-later.
