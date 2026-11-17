# kiki the nano bot (port)

Thorsten Kohnhorst's kiki the nano bot, from the 1.0.2 source release (2006, public domain; first written for
the uDevGame contest), ported from its C++ and Python source (`re/kiki/`):

* `src/engine/` is the C++ half translated function by function: the timed actions and events
  (`KikiAction`, `KikiEvent`), the world and its cells with the temporary objects that reserve a cell while
  something moves into it, every object (stones, wire stones, walls, switches, gates, bombs, bullets, wires,
  gears, generators, motors, spikes, lights) and the bots (`KikiBot`, `KikiPlayer`, `KikiMutant`), the three
  cameras, and the 3D text screens and menus. glibc's `random()` with `srandom(1)` drives the mutants, as in the
  original.
* `src/pyworld.ts` is the Python half: `KikiPyWorld` (building a level, exits, the Escape menu, help pages,
  restart), the highscore and configuration files, the main menu, story, statistics, about, setup, keyboard
  setup, level selection and outro.
* `src/data/levels.gen.ts` are the 50 levels of `py/levels.py`, translated from the original Python statement by
  statement by `re/kiki/tools/levels.py` (with Python 2's integer division and `range()`), including their own
  callbacks (switch counters, mutant counters, colour-changing switches).
* `src/render/` draws what the original's `display()`/`render()` functions draw, with three.js: the models of the
  original headers, the vector font with its bevel, the wall plates, the light halos, per-vertex lighting like
  OpenGL 1's fixed-function pipeline (colour material, specular 0.5 grey, shininess 60, the camera's spot light
  and up to seven `KikiLight`s), the drawing order (far to near), and the display gamma.

## Controls

The original's default keys (`py/kiki.cfg`), changeable in Setup → keyboard setup as in the original:

* **Up / Down**: move forward / backward. Held: keep moving. kiki climbs a wall in front, rolls over an edge,
  falls if nothing is below.
* **Left / Right**: turn.
* **Ctrl**: jump. Held while moving forward: jump forward; pressed and released standing: jump up.
* **Shift** (held): push the stone in front while moving.
* **Space**: shoot (held: keeps shooting). Shots toggle switches, set off bombs and hurt mutants.
* **Page Down**: change the view (inside, behind, follow).
* **Home / End** (held): look up / down.
* **Escape**: the level's menu (help, restart, load level, setup, about, quit); in menus: back.
* **1–9**: game speed (as in the original; Setup has it too).
* **F9**: the original's debug mode (also in its release): the Escape menu gets "next level"; **b**, **r**, **d**
  toggle the wall plates, their raster and the dots of the temporary cells.
* Menus: **Up / Down** to choose, **Return** or **Space** to select, **Right** to change a setup value; in the
  level list **Left / Right** move by columns. Pages (help, story): **Down / Right / Return / Space** next, **Up /
  Left** back, any other key closes.
* **Ctrl+Q** quits (back to the website), like the menus' **quit**.

## The game

* **Fifty levels** in the original's order (`py/levels.py`), with their sizes, colour schemes, intro names, help
  pages, par moves (`py/kiki.hsc`) and objects. A level's moves count down from its par in the status atom; solving
  a level for the first time opens the next two in the level list (`highscore.py`).
* **Highscore and setup files**: the original's `~/.kiki.hsc` and `~/.kiki.cfg` (Python ConfigParser files) are
  kept as `kiki.hsc` and `kiki.cfg` in the player's account on the server, in the same format.
* **Languages**: Setup → language cycles through the original's seven (Dutch, English, Euskara, German,
  Portuguese, Spanish, Swedish); like the original, only the menu texts that have a translation change, and the
  3D font draws the few accented letters it knows.
* **Timing**: every movement is a timed action (forward 200 ms, climbing down 500 ms, jump 120 ms, falling 120 ms
  for a bot and 40 ms for a stone, …) scaled by the speed setting (10/speed: 7 by default), driven by the
  frame's time stamp like the original's `SDL_GetTicks()` loop.

## Deviations

* **Sound effects are not the original's.** The original's 28 WAV files come from a third party and have no known
  license (`LICENSE.md`). The port plays new sound effects made for it (`re/kiki/tools/sounds.py`, CC0 1.0), one
  for each original file, with the same names, formats and about the same lengths. Which sound plays when, at
  which volume and where in the stereo field, is the original's (`KikiSound.cpp` on SDL_mixer's eight channels).
* **No music**, as in the 1.0.2 source package (its code looks for a title song the package does not contain).
* **Files and quit**: the highscore and setup files live in the account storage (see above); the user name in the
  highscore file is `player` (the original writes the login name). Quit returns to the website.
* **Setup → fullscreen** switches the browser's full screen; the window sizes of `kiki.cfg` are not used.
  **Gamma** (`SDL_SetGamma`) is applied as the last drawing pass, with the same curve.
* **Level selection before any level is solved**: the original crashes (an empty menu; Debian bug #503389);
  the port lists the first level.
* **Drawing**: three.js (WebGL) in place of OpenGL 1.x. The geometry, colours, lighting formula and drawing
  order are the original's; GLU's tessellator is replaced by an equivalent triangulation of the same font
  contours, `glPolygonOffset` of the gate bars is left out, and the scene is drawn once per browser animation
  frame (the original loops as fast as it can, at least 10 ms per frame). The game logic depends on time, not on
  frames, so it is the same.
* **Numbers**: the port computes in doubles; the original in floats. Where that changes the game (the bots'
  health: ten hits of 0.1 must kill a mutant) the port rounds to floats like the original.
* **Not ported**: the debug mode's level editor (mouse picking, key `e`, `f`), its Python console (`c`) and
  cell debugging, the screenshot key **F1** (the browser has its own), the demo recorder (not reachable in the
  release) and the hidden menu bar (switched off in the original). The browser keeps a few shortcuts no page can
  take (Ctrl+W, Ctrl+T, Ctrl+N).

## Checked against the original

* `test/levels.test.ts`: all 50 levels make the same world calls, with the same arguments and in the same order,
  as the original's level scripts run by `re/kiki/tools/levels.py` (Python 2 semantics on a recording mock).
* `test/oracle.test.ts`: `re/kiki/oracle/` builds the original's C++ game logic (src/base, src/world,
  src/items, src/bots, kodilib's math) unchanged and headless; 27 scenarios (24 levels, 20–40 s of random key
  presses with uneven frame times, three of them at other game speeds) give the same positions, orientations, move
  actions, health, moves, switch/gear/wire states and sounds on the port, every ~250 ms, numbers within 0.01.
* `test/game.test.ts`: the highscore and setup files, unlocking, the menus, a level's callbacks, exits, and all
  levels driven for 10 s.
