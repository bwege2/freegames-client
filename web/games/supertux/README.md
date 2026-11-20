# SuperTux 0.6.3 (port)

Tux's jump-and-run, from **SuperTux 0.6.3** (2021-12-22, the last 0.6.x release), the C++/SDL game by the
SuperTux Team. The port uses the release's own Icy Island levels and worldmap, its tilesets, sprites,
backgrounds, music, sounds and bitmap fonts, converted by `re/supertux/tools/build-assets.py` from
`re/supertux/orig/` (downloaded by `fetch.sh`, never committed).

## What is ported

* **Tux**: walking, running, skidding, jumping with the original's early-apex and coyote rules, ducking,
  butt-jumping, wall-jumping, climbing, slopes, ice friction, water/swimming, damage and power-up states, fire and
  ice bullets. The movement constants and order are `src/object/player.cpp` and `src/supertux/physic.cpp`.
* **The simulation** runs at the original's 15 ms logical step (the C++ computes `1000/64` into an
  integer `Uint32`, 15 ms) through the original's swept-AABB collision constraints and AATriangle slopes
  (`src/collision/`).
* **Icy Island**: all 27 playable levels of `data/levels/world1/` are loaded and playable; the original worldmap's level
  nodes are shown on the map and every level can be chosen. The Yeti is the last level.
* **Creatures**: Snowball and Captain Snowball, SmartBall, Bouncing and Flying Snowball, Mr Ice Block
  (stomp it flat, then kick it), Mr Bomb and Bomb, Jumpy, Spiky, Snowman, Crystallo, Stalactite, Flame,
  Haywire, Gold Bomb, Ice Crusher, the Yeti (simplified fight) and the Dispatcher.
* **Objects**: bonus blocks (the original count of coins), coin blocks, info blocks, unstable ice tiles,
  weak blocks (fire), trampolines, coins, the four crystal switches, push buttons and switches, moving
  platforms and lifts with the original path nodes, sequence triggers at the level end, ambient light
  and the original backgrounds with their parallax speeds.
* **Menus**: title menu, level intro, pause menu, level-finished and death screens. The original's
  bitmap fonts (not its OFL/Apache TrueType fonts, which are not GPL-compatible) draw all text.
* **Local two-player co-op** (an addition; the original 0.6.3 is single-player): player 2 uses
  A/D/W/S/F, or the second gamepad. Both players share the camera and the level.
* **Saves**: the completed levels are kept in the player's account storage (`ctx.storage`, file
  `savegame`, JSON), so progress follows the account. The original's binary savegame format is not used.

## Controls

The original's default keys:

| Key | Action |
| --- | --- |
| Left / Right | walk; hold to run |
| Space | jump (hold for the higher jump) |
| Down | duck; while airborne, butt-jump |
| Up | climb a ladder, look up |
| Ctrl / Alt (also C) | shoot with a fire/ice flower |
| Esc or P | pause menu (resume, restart, worldmap, quit) |
| Enter / Space, arrows | menus and worldmap |

Player 2 (co-op): **A/D** walk, **W** jump, **S** duck, **F** shoot. Gamepads: the first pad is player 1,
the second player 2 (D-pad/left stick, A jump, X action).

## Checked against the original

`re/supertux/oracle/README.md` explains how the original was built headless (C++ 0.6.3 with the null
video system) and driven by a SuperTux demo file (6 input bytes per logical step), logging Tux's
position and velocity after every step. `test/oracle.test.ts` runs the same 640 frames (walking,
stopping, ducking, jumping, stomping a snowball) on `journey_begins` and compares every step:
positions agree within 0.1 px and velocities within 0.01 px/s, on-ground flags exactly.

`test/engine.test.ts` parses all 27 levels, checks the tilemaps and the original level
authors/licenses, loads representative levels, and runs the port's own engine (bonus blocks, coins,
end triggers, two players).

## Deviations from the original

* **Cutscenes**: the Squirrel story cutscenes (`intro.stl`, `yeti_cutscene.stl`, `castle_cutscene.stl`
  and the start of `castle_of_nolok`) are shortened to a title screen followed by the level. The port
  interprets the small subset of Squirrel the levels use for **lifts, switches, doors, level switching
  and text**; lighting fades and wind are ignored, and it is not a Squirrel interpreter.
* **Worldmap**: the original map artwork and level nodes are drawn, but Tux is moved between nodes with the arrow
  keys (and clicking a node) instead of walking tile by tile along the original's pathing tiles, and
  every level can be chosen rather than following the original's path unlocking; the branching paths
  are not reproduced.
* **Secrets**: secret-area rooms (`secretarea`) only show their message; the extra room and its camera
  are not entered. No checkpoint bells are restored on death: a death restarts the level.
* **Yeti**: the original's multi-phase Yeti fight is a simplified three-stomp encounter; the falling
  `yeti_stalactite` objects are ordinary stalactites.
* **Two-player co-op** is an addition (not in 0.6.3); the camera follows player 1.
* **Save file**: JSON in account storage instead of the original's binary `.stsg`; the original's level
  statistics screens, the add-on/level editor machinery, the config file and key rebinding are not
  ported.
* **Python/objects not ported**: the level editor, the console, the demo recorder, the 3D-ish
  "vertical stripes" overlay, most world 2/bonus content and the story levels outside Icy Island. A few
  Icy Island enemy variants (the smart block and the kamikaze snowball) and the dispenser's custom
  enemies are not implemented; they leave their spots empty rather than spawning something else.
* **Graphics**: the original textures are drawn 1:1 on a 1280×800 canvas (the original's default
  window); the lighting pass is simplified to the ambient light colour.
* **Audio**: the original OGG/WAV files are played through Web Audio; `splash.ogg` is replaced by the
  original's `splash.wav` because its CC-BY-SA-3.0 licence is not GPL-compatible (see `LICENSE.md`).

## Running

```sh
bash re/supertux/fetch.sh                         # downloads the pinned 0.6.3 source+data archive
python3 -I re/supertux/tools/build-assets.py      # copies the used data into assets/
cd web && npm install
npm test                                          # catalog + SDK + this game's tests
npm run build
node scripts/screenshots.mjs supertux             # needs the built site and the server jar
```

The original's oracle build and the golden trace are described in `re/supertux/oracle/README.md`.
