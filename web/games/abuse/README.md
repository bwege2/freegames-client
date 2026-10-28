# Abuse

A port of **Abuse 0.8** (the SDL version by Sam Hocevar, 2011, of Crack dot Com's 1996 game) to the
browser: its C++ engine, Lisp interpreter, window system and SDL layer translated to TypeScript
(`src/`, file by file after the original's `src/`), running the original's data unchanged
(`assets/abuse-data.bin`: levels, graphics and the game logic in Lisp). License and credits:
`LICENSE.md`. How it was checked: `re/abuse/NOTES.md`.

## Controls

| Input | Action |
| --- | --- |
| Left / Right arrow | run |
| Up arrow | jump, climb ladders |
| Down arrow | use: switches, doors, teleporters, the save consoles; climb down |
| mouse, left button (or Space) | aim and fire |
| right mouse button | special power (after a power-up) |
| mouse wheel, Right Ctrl / Insert | previous / next weapon (or click a weapon on the status bar) |
| p | pause (Space or Enter go on) |
| h, F1 | help screens |
| Esc | the main menu |

The key bindings are the original's `abuserc` (`left`, `right`, `up`, `down`, `fire`, `special`,
`weapprev`, `weapnext`): the game writes it into your save directory on its first start and reads it
on the next, as the original does; so Space fires from the second start on (the mouse always does).

## Saving

The save consoles in the levels save the game (15 slots); the main menu's second icon loads one.
What the original kept in `~/.abuse/` is kept in your account on the server: the saves
(`save0001.spe` …, each 70-300 KB with its thumbnail), `gamma.lsp` (the darkest grey you picked)
and `abuserc`. The server keeps at most 4 MiB per player and game; a save beyond that is kept for the
session only, and the game says over the screen that it was not saved on the server.

## Online

The main menu's networking icon (the original's "Networking" dialogs) opens the website's lobby. The
host sets the original server's options: the level set (small, medium or large network levels) and
the kills to win a level. When the round starts, every player's game starts again as the original's
deathmatch add-on (`addon/deathmat`), as the original restarted its engine for a network game. The
games run in lockstep: each player's input of every game tick (what the original's engine put into
its network packets) goes through our server to everyone, and every game processes everyone's input
of a tick in the same order (`src/online.ts`, `protocol/games/abuse.capnp`, the server module
`server/.../games/abuse/`). Seat 1 of the room is the original's server (client 0), the others its
clients.

## Sound

Abuse's sounds and music are by Bobby Prince and are not free, so the port has none and plays
silently, as the original does without its `sfx/` directory. The sound layer is complete: every
sound and music call of the original is made with the same file names, volumes and panning
(`src/sdlport/sound.ts`; the tests check them against the original), and `src/rt/audio.ts` plays WAV
files and, through `src/sdlport/hmi.ts` (translated from `sdlport/hmi.cpp`) and `src/sdlport/midi.ts`,
the HMI music. To add the sounds where a licence allows it: put the original's `sfx/` and `music/`
directories (and the add-ons' `.wav` files in their places) into a directory and build the data with
them, `python3 re/abuse/tools/pack.py re/abuse/work/data web/games/abuse/assets/abuse-data.bin --sound
<that directory>`; nothing else changes. The files must then be named in the `NEVER` list of
`web/scripts/legal.mjs`, so that the source archive does not carry them.

## Deviations

Where the browser forces a difference, or the original cannot work:

* **No sound** (above).
* **The level editor** (`-edit`, the dev menus and windows, `edit.lsp`) is not ported; the game has
  no way to start it. The Lisp functions `menu` and `scene:wait`, which no file of the data calls, are
  not ported either, nor morphing between characters (no character of the data has a morph).
* **The window** is the page's: 320x200, scaled to fit. F11 (full screen) does nothing (the site has
  a full screen button); F12 (grab the mouse) shows its message but the pointer is not grabbed.
  Command line options of the window (`-scale`, `-fullscreen`, `-gl`, `-doublebuf`), `-2` (double
  pixels) and the joystick are not there.
* **Keys** are read by their position on a US keyboard, as SDL 1.2 reported them.
* **Quitting** (the menu's quit icon, Alt+X) returns to the game's page.
* **The loading status window**: the original opens it when loading something takes more than a
  second, and then crashes (it reads the window before creating it, `imlib/guistat.cpp`); the port
  never opens it.
* **Files the original writes into its data directory** (`hardness.lsp` with the difficulty, the
  online setup's files, `defaults.prp`; `open_FILE` puts the data directory and a space before their
  names, so the original never reads them back) are kept in memory for the session.
* **Online**: the lobby replaces the original's network dialogs (server or client, server name, port,
  the search for games on the local network). Players join when the round starts; the original also
  let a client join a running game (the server saved the level and every client loaded it). The
  original's game server ran on one machine and collected the clients' packets; in the port every
  client runs that server's game (the same, from the round's seed) and the players of the round join
  at its first tick as joiners joined the original's server. Abuse 0.8's deathmatch add-on does not
  start (it loads `config/levelset.lsp` and `config/username.lsp`, but the setup writes them under
  `addon/deathmat/` and there is no `config/` directory): the port writes them in both places. A player
  who leaves is taken out of the game for everyone at the same tick (the original's server did the
  same, `SCMD_DELETE_CLIENT`). In the online game the menu's networking icon leaves the round.
