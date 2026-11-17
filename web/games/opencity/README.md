# OpenCity (port)

OpenCity 0.0.6.5stable (Duong Khang Nguyen, Frédéric Rodrigo and contributors; GPL-2.0-or-later), ported
from its C++/SDL/OpenGL source and its data (`re/opencity/`): the city simulation, the map generator, the
buildings and their growth, the money, the tools, the tool circles, the status bar, the main menu and the
save file are the original's; the 3D view is drawn with three.js from the original's AC3D models and
textures. Two textures are replaced (see below); every other asset is the original's.

## Controls

The original's (README "Keys' description" and `City::Keyboard`/`City::MouseButton`):

* **Right mouse button**: open or close the tool circle at the mouse. Its buttons: zones (residential,
  commercial, industrial), save/load, power (power line, nuclear plant, coal plant), road, the
  bulldozer circle (raise, lower, destroy, query) and government (park and trees, school, hospital,
  police, fire department).
* **Left mouse button**: click a tool in the circle; on the map, press on a square, drag and release to use
  the tool on the rectangle. Zones and trees fill every empty, flat square of it; roads and power lines run
  along the longer side and then turn; buildings are placed at the square where the button was pressed (with
  a green or red preview while it is held); query opens the query circle (R, C, I and power of the square).
  Ctrl held while releasing cancels.
* **Wheel**: zoom; with **Ctrl** move left/right, with **Shift** move up/down.
* **Arrows**: move the map; **Page Up/Down**: rotate; **Insert/Delete**: zoom; with **Alt** ten times faster.
* **R, C, I, P, L, E, U, D, X, Q, N**: residential, commercial, industrial, road, power line, nuclear plant,
  raise, lower, destroy, query, no tool.
* **B, G, T, W, F, K, O**: buildings, grid, terrain, water, wireframe, status bar and compass, projection.
* **H**: home view. **S**: sound on/off. **M**, **<**, **>**: music (the release has none).
* **F2 / F6**: save / load the city. **Esc**: the main menu (new city, load, save, quit).
* The status bar's **play/pause** button stops and starts the simulation.

## The game

* **A new city** is a generated 50x50 landscape (PLAIN map, LAKE water, SPARSE trees: main.cpp's defaults,
  the map generator's other options exist only on the original's command line), seeded with the time like
  the original, with a fund of 15000.
* **Simulation**: the five micro simulators of the original (residential, commercial, industrial,
  electricity, traffic) run one after the other, each round on a random zone; a zone grows when it has
  power, a road and the other two zone kinds in range, and shrinks otherwise; the electricity spreads from
  the power plants over touching structures; traffic gives roads a load and sends cars, buses and sports cars
  along the cheapest path. The pause between rounds, the 1.75 s day, the monthly maintenance, the yearly
  taxes (with the 10% "government help") and the population formula are the original's.
* **Saving**: F2, the save circle or the menu keep the city as `opencity.save` in your account on the server,
  in the original's file format (the tests check that the port writes the same bytes as the original for
  the same city). F6 or "Load" read it back.
* **Sounds**: the original's WAVs, played through `sound/sound.m3u` as the original indexes it. Its list
  and the program's sound numbers disagree, so building a zone plays `road.wav` and building a road plays
  `rci.wav`, as in the original.

## Checked against the original

`test/opencity.test.ts` compares the port with the original's own code: `re/opencity/oracle` compiles the
release's `city.cpp`, building layer, structures, simulators, path finder, vehicles, map maker and save code
unchanged and runs scripts on a virtual clock; the port runs the same scripts. The height maps and tree
densities of several seeds, the simulator thread's delays, a town growing for 10 years (every structure,
level and status bit, fund, population, vehicles and their positions) and a session with every tool, pause,
destroy, save, load and new city all match exactly, and the save files are byte-identical.

## Differences from the original

* **Two textures are replaced** (operator's decision, see `LICENSE.md` and `re/opencity/LICENSE.md`):
  `graphism/hospitaldept/large/large.png` (the hospital: its bricks, windows and air conditioning fan were
  photographs under CC BY-NC 2.0, CC BY-NC-SA 2.0 and CC BY-SA 2.0) and
  `graphism/industrial/containers/containers.png` (the shipping containers: a CC BY-SA 2.0 photograph).
  Both are drawn by `re/opencity/tools/make_textures.py` (CC0) in the original's size and UV layout, so the
  models are unchanged; they look plainer than the photographs.
* **Timing**: the original's main loop sleeps 20 ms after drawing each frame and its simulator thread sleeps
  `RCIDelay()` between rounds; both clocks therefore run a little slower than nominal there, depending on the
  machine. The port runs both on one clock of exact 20 ms frames (the simulator rounds that are due run
  before each frame), so a day is exactly 88 frames (1.76 s).
* **Window**: the game fills the website's player area instead of a 750x560 window; the GUI keeps the
  original's pixel sizes and positions (status bar at the bottom centre, compass and minimap in it).
* **Drawing**: three.js shaders that compute the original's fixed-function lighting (one directional light
  fixed to the eye, light model ambient 0.7, colour material, unnormalised normals with GL_RESCALE_NORMAL,
  flat shading, modulated textures, the 3D terrain texture chosen by height). Not reproduced exactly: the
  grid's 0x3333 line stipple is drawn by a shader (two pixels on, two off along the line's major screen
  axis), the wireframe mode ('f') draws all polygons as lines (the original drew back faces as points),
  lines are one pixel wide, and the GUI images are scaled by the browser's canvas instead of `gluScaleImage`.
* **Picking**: the square under the mouse is found by casting a ray against the terrain squares and the
  models (the original used OpenGL's selection buffer with a 2x2 pixel pick window); the nearest hit wins,
  as there.
* **Keys**: the browser's keys are mapped by name; key repeat is off as in SDL 1.2 (held arrows, Page
  Up/Down, Insert and Delete act every frame, as in the original).
* **Not available**, as in the release build: the debug tool circles ('a', 'v', compiled out with NDEBUG),
  the multi-agent system (disabled in the release: "FIXME: buggy MAS"), the network client ('z', OpenCity's
  experimental ZeN server), music (the release ships none), the command line (height map files, generator
  options, data and config directories; no height map is shipped, see `LICENSE.md`).
* **Quit** (menu) returns to the website's game page.
* **Saving and loading** go to the server asynchronously; the original wrote and read the file at once.

## Running

```sh
bash re/opencity/fetch.sh --assets        # downloads 0.0.6.5stable, copies the data, draws the two textures
bash re/opencity/oracle/run.sh            # the original's transcripts (needs nix or g++/SDL 1.2/GL headers)
cd web && npm test                        # the port against them
npm run build && node scripts/screenshots.mjs opencity
```
