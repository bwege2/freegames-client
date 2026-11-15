# Liquid War (Liquid War 5.6.6)

Reference version: **Liquid War 5.6.6** (2025-11-09, elsewhere 2024 release; `re/liquidwar/fetch.sh` downloads the
source and the upstream Windows zip whose `LW5/data/lw.dat` this port ships). The C program
(`src/`: the game, its menus, the map and battle cores) is translated to TypeScript statement by statement
(`web/games/liquidwar/src/lw/`, `src/al/` is the re-written Allegro 4.4 layer the original draws through).
License check: `LICENSE.md`; reverse engineering and the oracle: `re/liquidwar/NOTES.md`.

## What is in it

| Part | Files |
| --- | --- |
| Allegro 4.4 emulation: bitmaps, palette, datafile, fonts, keyboard, mouse, GUI, screen, config, sounds, MIDI, clock | `src/al/*.ts` |
| glibc's `random()` (the original's RNG) | `src/glibc.ts` |
| the game: main, menus, options, teams, maps, textures, the battle core, path finding, display, info bar, scores, error dialogs, languages | `src/lw/*.ts` |
| the page: screen through the palette, keys, pointer, Web Audio, the settings file in account storage | `src/index.ts` |

The original's data is shipped unchanged (`assets/lw.dat` and the release's `custom/` maps, textures and
music). The settings file (`liquidwarrc`) is kept in the player's server storage.

## Tests

In `npm test`:

- `test/oracle.test.ts`: six sessions recorded on the original (`re/liquidwar/oracle/`, built from source against
  Allegro 4.4.3.1 with a virtual clock) are run on the port; every screen and palette, every sound call, every
  round's army/mesh/cursor hashes and the written settings file must equal the original's. 13 tests.
- `test/network.test.ts`: the colours and starting parts of a network game's teams (`src/lw/network.ts`) equal
  what the original's own `src/network.c` gives on 2000 team tables (`re/liquidwar/tools/netcolors.sh`).
- `test/netplay.test.ts`: the client's side of the key exchange (`src/page/netplay.ts`) with a stand-in room.
- `test/online.test.ts` (needs the server jar, `mvn -f pom.xml package`): two and three computers, each a worker
  thread running the port headless, pick "Net game" in the main menu, meet in a room on the real server and play;
  all of them play the same battle round by round (fighters, mesh, every team's cursor and keys), with the teams
  numbered as the original's server numbers them, and a computer whose game is changed is caught by the checksum
  check. The server side: `server/src/test/java/net/slop/freegames/games/liquidwar/LiquidwarModuleTest.java`.

## Online

"Net game" in the main menu opens the website's lobby (a room of 2 to 6 players); when the host starts the
round, the original's network game runs: every computer sends its teams (its human teams, and its computer
teams if "allow network bots" is on in Options/Rules/Advanced), its rules and its map; the server module
(`server/.../games/liquidwar/LiquidwarModule.java`, in place of the original's `liquidwar-server`) numbers the teams
in seat order, gives everyone the host's rules and map, and every computer then plays with the keys of all teams
merged by the server, applied by every computer at the same exchange (`src/page/netplay.ts`, `src/lw/netplay.ts`,
`src/lw/network.ts`; `re/liquidwar/NOTES.md` has the design). At most 6 teams take part; a computer whose teams
find no place gets the original's "server full" error. A computer whose game differs from the others' writes the
original's "incorrect checksum" line to the log (the browser console), as the original did.

## Deviations the browser forces

- The window is the page's game area; the original's video modes appear at their own size, and
  `PageUp`/`PageDown`/scroll-wheel full screen is the browser's.
- Settings (`~/.lwrc`) go to the player's account storage; there is no home directory.
- Sound and music: Web Audio; the original's MIDI tracks are played by a small MIDI synthesiser
  (`src/al/midi.ts`), not by the operating system's device.
- Palette fades are a 200 ms animation in the page instead of the original's busy-wait loop.
- No joystick. The screenshot key (F9) does nothing. `Quit`, `F10` and the window's close button leave to the
  website (the settings are saved first).
- "Net game": the website's lobby takes the place of the original's dialog (server address, port, password,
  the LAN/internet search) and of its waiting room with chat; the battle is the original's. After a network
  game the main menu comes back (the original went back to its "Net game" dialog). The original's server
  lag (blank key exchanges it inserts or skips) is a lag each computer keeps for its own keys: raised by the
  original's rule (and whenever the game has to wait for keys), lowered by it; every computer still applies
  the same keys at the same exchange. A computer that loses its connection during a battle cannot come back
  into it (the original's server dropped it too); its teams stand still for the others.
- "Random map" is not ported: the original builds it with an external program, `lwmapgen` (`utils/lwmapgen/`),
  whose licence is GPL-2.0-only and cannot be combined with the port's GPL-3.0-or-later (`LICENSE.md`).
- The favicon is the original's window icon (`web/icons/liquidwar*.png`, `web/scripts/icons.py`).
