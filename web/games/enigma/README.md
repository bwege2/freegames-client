# Enigma (port)

Enigma 1.30 (2021), the free successor of Oxyd: a black marble steered by the mouse, landscapes of stones,
floors and items, and pairs of Oxyd stones to open. Ported from the C++ source of the release (`re/enigma/`):
the engine (objects, world physics, timers, the Lua level API 2 of `lua.cc`, display models) is a TypeScript
translation, and the original's Lua files (`api2init.lua`, `compat.lua`, `models-32.lua`, `sound-defaults.lua`)
and level files run unchanged on the port's own Lua 5.1 interpreter (`src/lua/`).

## Controls

* **Mouse**: accelerates the marble (mouse speed 4 times the pixels moved, as in the original). The pointer is
  captured while playing; click to capture it again.
* **Left button**: activate or drop the leftmost inventory item. **Right button** or **Tab**: rotate the inventory.
* **Esc**: game menu (resume, restart, abort level, exit). **Shift+Esc**: leave the game.
* **F3**: kill the current marble; **Shift+F3** or **Ctrl+A**: restart the level.
* **Left / right arrow**: change the mouse speed. **F4 / F5**: skip to the next level.
* Level menu: arrows and Enter, or the mouse.

## What is ported

* The physics of World::advance_actor, contacts and collisions with stones, edges and windows, actor
  collisions, rubber bands, force fields and the fixed 10 ms server step with its 2.5 ms sub-steps, timers and
  animations in the original's order, the level and system random generators. Checked bit for bit against the
  original (below), including glibc's `pow` for the friction (`src/engine/pow.ts`).
* The Lua API 2 (`wo`, `ti`, `po`, `no`, `en`, `res`, tiles, groups, position lists, named objects in
  `ecl::Dict` order, resolvers, libraries with their release suffix).
* About 110 object classes: standard, glass, hollow and movable stones, doors, switches, triggers, timers,
  counters, Oxyd stones with their shuffling and colours, lasers, mirrors, laser switches, puzzle stones,
  boxes, boulders, blockers, swap, pull, rotator, knight, thief, plaster, break and window stones, floors with
  slopes, ice, water, swamp, abyss, bridges, scales, flood streams, items like documents, coins, hammers,
  swords, wrenches, glasses, keys, floppies, cracks, dynamite, bombs, vortices, wormholes, seeds, magnets,
  strips, land mines, traps, crosses, bags, rubber bands, and the actors marble, pearl, rotor, top, killer and
  horse.
* 724 of the 1,099 shipped levels load and run (`node games/enigma/test/tools/scan.ts`); the others stop
  with "unknown object name" for a kind that is not ported yet (most often `st_lightpassenger`, turnstiles,
  chess stones, dispensers, `st_ice`, scissors, shoguns, pullers, extinguishers and the fire system
  (`it_burnable`), portals, `st_magic`, `st_flash`, `fl_thief`, `ac_bug`, ghosts, polar switches, mail,
  disco and monoflop stones, pipes). Their previews show "Error"; the game shows the error and goes back.
* The menus: main menu, level packs, level menu with previews (4×3 per page), help, the game menu.
  Solved levels, times and the current pack and level are kept in `state.xml` in the player's storage.

## Not ported (deviations)

* **Levels**: only levels whose licence allows GPL-3 (see LICENSE.md): the 284 "GPL version 2" (only)
  levels are not shipped, nor the 142 levels for the old API 1 and the Sokoban, Pentomino and user packs.
* **Object kinds**: the ones named above.
* **Game compatibility modes**: the 66 levels of the Oxyd, PerOxyd, Oxyd Magnum and Oxyd Extra remakes ask
  for the `oxyd1`, `per.oxyd`, `oxyd.magnum` and `oxyd.extra` engines (`el:engine`); the port always applies
  the rules of the `enigma` engine.
* **Fire** (burning floors and `it_burnable`), the freeze checks of stones, and the item `it_drop` are not
  ported.
* **Menus**: no options menu, no level editor, no network or two-player game, no translations, no score
  upload or rating display, no in-game music (off by default in the original and not shipped).
* **Graphics**: only the 32×32 set; the font is DejaVu Sans Condensed (the MicroHei font is not shipped,
  `models-32.lua` names DejaVu as its alternative). Rubber bands and wires are drawn with the canvas.
* **Mouse**: the browser's pointer lock delivers the mouse moves; they are spread over the 10 ms steps of a
  frame. Without pointer lock the moves of the pointer over the game are used.
* **Replaced files**: `sound/menuok.wav` and `music/pentagonal_dreams.s3m` are free replacements (LICENSE.md).
* **Storage**: `state.xml` is in the server storage instead of the user's Enigma directory.

## Checked against the original

`re/enigma/oracle/build.sh` builds Enigma 1.30 from the release with a headless entry point
(`re/enigma/oracle/oracle.cc`): it loads a level, seeds the random generator and moves the mouse by a script,
and after every 10 ms prints every actor's position and velocity (17 digits) and a hash of all floors, items
and stones with their states. `golden.mjs` recorded four 9-second runs (`test/physics/*.txt`: the first tutorial
levels and Welcome of Enigma I). `test/physics.test.ts` runs the port on the same input: all four agree to the
last bit. `test/lua.test.ts` checks the Lua interpreter against Enigma's bundled Lua 5.1.4.
