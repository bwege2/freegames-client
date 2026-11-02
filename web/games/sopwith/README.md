# Sopwith (port)

David L. Clark's **Sopwith** (BMB Compuscience, 1984), from the SDL port **2.9.0** by Simon Howard
(`re/sopwith/`). The 320×200 four-colour screen, the 10 Hz flight model, the ASCII sprites, the
bitmap font, the level data and the mission files are the original's; the code is TypeScript.

## Controls

Player 1 (the original's defaults, all rebindable in **Options → Key bindings**):

* **X / Z**: accelerate / decelerate.
* **,** / **/**: pull up / pull down. **.** : flip.
* **Space**: fire. **B**: drop a bomb. **H**: fly home (refuel and rearm).
* **V / C**: missile / starburst (when **Missiles and starbursts** is on).
* **S**: sound on/off. **Esc**: pause.

Local player 2 (browser extra, one keyboard):

* **W / S**: accelerate / decelerate.
* **↑ / ↓**: pull up / pull down. **Q**: flip.
* **Enter**: fire. **A**: bomb. **G**: fly home. **T / R**: missile / starburst.

Menus use letters and the arrow keys: **S** single player, **C** versus computer, **N** network,
**L** local two players, **M** mission, **O** options, **H** high scores, **Q** quit.

## The game

* **Single player, novice**: enemy planes are hidden, ammunition is unlimited, animals are off,
  targets do not shoot and the ceiling is forgiving. The beginner's help is on the screen.
* **Single player, expert**: the same level without the training wheels.
* **Single player versus computer**: every other plane in the map is flown by the computer pilot
  (`swauto.c`): takeoff/landing, formation spacing, target selection by territory, the three-flap
  course search, crash prediction, the machine-gun lead calculation and missiles.
* **Local two players**: two humans in the same world on one keyboard, each with a camera and status
  bar (a deliberate browser extra; SDL Sopwith 2.9.0 itself only had TCP two-player).
* **Network game**: two players through this website's rooms. The host picks the mission; both
  clients run the same fixed-step simulation; every tick each client sends its 16-bit key word, the
  server relays the words in order, and the clients apply them together. A silent seat loses after
  8 s; the result and both scores go to the server.
* **Missions**: the seven files from `maps/` are selectable: the built-in original level, `empty`,
  `new_targets` (radio and water towers), `tank_strike` (wide map), `triplane`, `doghouse` and
  `bogey` (title tune). Files without a `level` keep the original ground, exactly as the C loader
  did; `symbols` and `sounds` replace frames and the tune. The parser reads Yocton unchanged.
* **Simulation**: the original 16-direction angles, 8.8 fixed-point movement, gravity/speed limits,
  4-tick throttle updates, stall/wobble/recovery, ceiling, fuel and refuelling, five lives,
  crash/respawn, home snap, craters, target damage and decay, oil-tank explosions, birds/flocks,
  oxen, balloons, machine-gun bullets, bombs, missiles, starbursts, medals and ribbons.
* **Display**: the original XOR blitter, all 20 target frames and their destroyed symbols, the
  plane hit/winner frames, the 8×8 font, the status bar (score, minimap, lives, fuel, bombs, rounds,
  missiles, bursts, medals and ribbons), the beginner's help and the HUD splats.
* **Audio**: the original PC-speaker tune sequence (the built-in tune and `bogey`) on the title
  screen, plus the square-wave engine, shot, bomb and crash sounds.
* **Files**: `sopwith.cfg` in the original `name value` text format (all options and key bindings;
  controller values round-trip even though the port does not read gamepads) and `hiscores.txt` in
  the original `name score medals ribbons` format, both in the player's account.

## Deviations the browser forces and known gaps

* **Mission menu**: 2.9.0 only had the command-line `-m file`; the menu is a browser extra. The
  title screen keeps the built-in original ground, as the C program did. A malformed mission keeps
  the built-in level; there is no separate error dialog.
* **Local two-player** is a browser extra. The C program had no local mode; the two viewports are
  stacked, each with its own camera and status bar.
* **Network** uses this site's rooms, not the original TCP protocol, serial/Imaginet modes or the
  original 3–4 player paths. Two seats; the host's mission choice is the room option.
* **Audio**: the original's 18.2 Hz PC-speaker mixer, sound priorities and explosion tune are
  simplified to the title tune player plus short engine/shot/bomb/crash tones.
* **Key bindings** are stored as SDL/USB-HID scancodes like the original `sopwith.cfg`. The first
  connected standard gamepad is read through the Gamepad API using the SDL controller defaults;
  unusual controller mappings may need the original SDL button numbers.
* **High scores** are only offered for **versus computer** on the original mission with the default
  rules (missiles/wounded off, animals/big explosions on), matching `NewHighScore()`.
* A few object-list/order quirks of the C engine (the exact linked-list insertion order and a few
  out-of-range reads) are not reproduced; gameplay-relevant rules are.

The original's `COPYING` and `README` are in the download; see `re/sopwith/fetch.sh` and
`re/sopwith/NOTES.md`.

## Running

```sh
bash re/sopwith/fetch.sh                    # downloads 2.9.0 and copies the maps
python3 re/sopwith/tools/build-assets.py     # extracts the C sprites/font/level
cd web && npm test                          # mission parser, flight, combat and AI tests
npm run build && node scripts/screenshots.mjs sopwith
```
