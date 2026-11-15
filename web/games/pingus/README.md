# Pingus (port)

**Pingus 0.7.6** (2011, Ingo Ruhnke and contributors), ported from its C++ source (`re/pingus/`). The levels,
sprite descriptions, graphics, sounds and music are the release's files, unchanged (`re/pingus/assets.py`). The
picture is the original's default 800×600 window on the SDK's pixel screen.

## Controls

As `data/controller/default.scm` maps them:

* **Left mouse button**: menus; in a level, give the pingu under the cursor the selected action, or select an
  action on the panel at the left. **Right (or middle) mouse button** held: scroll towards the pointer.
* **Arrow keys**: scroll (800 pixels a second).
* **1–9, 0**: select the 1st–10th action. **Tab**, **mouse wheel**: next / previous action.
* **Space** or **F** (held): fast forward (4 world updates per tick). **P**: pause. **S**: single step.
* **A**: armageddon (the armageddon button wants two clicks within a second).
* **Escape**: give up the level (its result screen follows), leave a menu, the worldmap or a story.

## What is ported

* **The game logic**, tick for tick (`world.ts`, `pingu.ts`, `worldobjs.ts`): the world at 50 ticks a second
  (`globals::game_speed` 20 ms), the pingus with all their actions (walker, faller, tumbler, floater, climber,
  bridger, basher, digger, miner, blocker, bomber, jumper, slider, waiter, drown, splashed, exiter, laserkill,
  smashed, angel, superman, boarder), float arithmetic as C++ `float`, the LinearMover and PinguCollider, the
  collision map and the ground map (the masks as SDL_image loads the PNGs: colour keys, alpha, 8-bit sources
  for removal), entrances and their release rates, exits, all traps and objects (guillotine, hammer, spike,
  smasher, fake exit, laser exit, liquids, ice blocks, conveyor belts, switch doors, teleporters, hotspots,
  backgrounds, starfield, snow and rain), prefabs with overrides, groups, the action limits, armageddon and the
  goal manager (out of time, no pingus left, the 125-tick grace period).
* **The screens**: main menu (with its scrolling layers), Story → Tutorial Island worldmap (walking pingu, path
  finding, locked and finished dots, the intro story the first time), Levelsets (desert, factory, Halloween,
  Halloween 2011, Christmas 2011, unlocked level by level), start screen, the game session (action panel,
  counters, time, small map, armageddon / fast forward / pause buttons, the capture rectangle), result screen,
  stories and credits, the fade between screens.
* **Saving**: `savegames.scm` and `variables.scm` as the original writes them to `~/.pingus/savegames/`, in the
  player's server storage.
* **Sound**: the WAV sounds on 8 channels as SDL_mixer; the tracker music (`*.it`) with a player of our own
  (`it.ts`, in an audio worklet).

## Deviations

* **No level editor and no options menu** (the main menu's "Editor" and "Options" buttons do nothing; F5 and
  Ctrl-O too). The options menu's settings are about the window, the renderer and the language.
* **No developer mode** (Ctrl-M, `--developer-mode`): the developer-only levelsets (alien, crystal, hellmouth,
  jungle, mysteryisland, pacman, "Under Construction") are not shipped, as a player never sees them.
* **English only**: the translations (`data/po/`) are not used, so the CJK glyph images are not needed (see
  LICENSE.md).
* **No autoscrolling at the window's edge**: the original does it only in full screen or with the mouse grabbed
  (Ctrl-G), which a web page cannot do. F10 (fps), F11 (full screen), F12 (screenshot) and Ctrl-G are not mapped.
* **Demo recording**: the original writes a demo file of every level played to `~/.pingus/demos/`; the port
  records it (`Server.demo`) but does not store it.
* **Music**: SDL_mixer's module player (MikMod or ModPlug) is not reproduced sample for sample; `it.ts` plays the
  IT modules with their samples, instruments, envelopes and effects, but the mix is our own. Sounds that the
  release does not ship (`tenton`, `thunder`) stay silent as in the original.
* **Boarder**: the boarder action (one test level) moves a pingu to x = ±1 by an operator precedence slip in the
  original and can loop forever there; the port gives up after 100000 steps instead of hanging.

## Tests

`test/demos.test.ts` plays all 157 demo files of the release (players' recordings, `data/levels/xskat/*/demo/`)
in the port and compares the state after every tick with what the original computes for them
(`re/pingus/oracle/`: Pingus's own C++ game logic built headless, `golden.mjs` writes `test/golden/`).
