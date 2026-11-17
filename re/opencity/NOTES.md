# OpenCity 0.0.6.5stable: notes for the port

Reference: Debian's `opencity_0.0.6.5stable.orig.tar.bz2` (`fetch.sh`). The program calls itself 0.0.7
(`globalvar.h`: OC_VERSION 0, OC_PATCHLEVEL 0, OC_SUBLEVEL 7), which is the version in the save file.

## How the port is checked

Instead of tracing a binary, `oracle/` compiles the release's own game logic unchanged (g++, the release's
`-std=c++98 -DNDEBUG`, the include paths of `src/Makefile.am` and `src/mapgen/Makefile.am`) with a driver
(`oracle/harness.cpp`) and stubs for what has no effect on the game state (`oracle/stub.cpp`: SDL, the
renderer, textures, networking). `oracle/run.sh` runs `oracle/scripts/*.txt` and writes the transcripts and
save files that `web/games/opencity/test/opencity.test.ts` compares with the port.

The driver replaces the two threads by one virtual clock: a frame every 20 ms calls `City::Run()`
(`config/opencity.xml`: msPerFrame 20), and before each frame every simulator round that is due runs (the body
of `MainSim::Main()`'s loop: the five micro simulators, `RefreshSimValue()` every fifth round), the next round
`Simulator::RCIDelay()` milliseconds later (the delay is recorded from the stubbed `SDL_Delay`). The port's
`OpenCity.frame()` (`web/games/opencity/src/city.ts`) is the same schedule. Randomness is glibc's `rand()`
(`web/games/opencity/src/rand.ts`), seeded as the original seeds it.

## Findings (all reproduced by the port)

* `mapgen/filter/gaussblur.cpp` `_gauss(x - length, length)`: the offset is unsigned, so the left half of
  the kernel gets exp(-huge) = 0 and the "blur" only averages towards +x/+y.
* All map generator arithmetic is `float`; `powf`, `exp` and `log2` results are rounded to float. The port
  rounds every operation with `Math.fround` and matches the original's maps exactly for the tested seeds.
* `main.cpp` gfMsSimDelayMax = log10(2501) * 500 (float) ≈ 1699 ms; `RCIDelay()` subtracts
  log10(structures + 1) * 400: the simulator speeds up as the city fills (about 340 ms at 2500 structures).
* A day is `++frames * 20 > 1750`, i.e. 88 frames. Monthly: maintenance of every square (every tree costs 1);
  income accumulated as (8R + 8C + 9I) / 100 per month; yearly: +10 % and paid out. Population is
  R + C/2 + I/3 (unsigned).
* `ResidentialSim/CommercialSim/IndustrialSim::RemoveStructure`: `GetLevel() - 1 > 0` is unsigned, so
  destroying a level 0 zone subtracts 2^32 - 1 from the int value, i.e. adds 1.
* `ElectricitySim::RemoveStructure` for a part of a power plant: the search loop increments the row after it
  found the main structure, so the plant's coordinates are not found and the plant stays in the list of plants
  (its power is subtracted from the maximum, though); destroying the plant's main square works.
* The simulators are only told the first corner of a destroyed rectangle (`City::_DoTool`).
* `sound/sound.m3u` lists destroy, eline, eplant, park, **road, rci**, terrain, but `OPENCITY_SOUND_EFFECT`
  has RCI before ROAD: zoning plays `road.wav`, building a road plays `rci.wav`.
* `GUIBar`'s initial height ratio is `1/20` in integer arithmetic, 0: the bars are empty until the first
  update (every third day).
* `GUILabel` centres text with unsigned arithmetic: a date wider than the label (from year 100) is not drawn.
* The GUI reports a click when the button is pressed (not released); a click on a tool closes the circle.
* The release build has NDEBUG: the debug tool circles ('a' path finding, 'v' agents) are compiled out; the
  multi-agent system is commented out in `main.cpp`.
* `PropertyManager2` (the `.xml` building data with needs, incomes and workers) is commented out in
  `main.cpp`; the game uses the hard-coded costs of `propertymanager.cpp` and the models' `.conf` sizes.
* Model sizes are read with `strtol`: "height=2.35" is 2.
* `Conf::Open` and the AC3D loader stop at the end of the file before using a last line without a newline.
* Rendering (`renderer.cpp`): one light at eye-space (0, 2, 1, 0), light model ambient 0.7, ambient
  (.6, .6, .4), diffuse (.8, .8, .6); `GL_COLOR_MATERIAL` (ambient and diffuse); flat shading;
  `GL_RESCALE_NORMAL` with unnormalised face normals (the cross products of the model loader and the
  terrain); terrain 3D texture coordinate r = h/10 * 55/64 + 9/64 (h ≥ 0) or (10 + h)/10 * 8/64; water quad
  at -0.15 with colour (.3, .25, .2); models sheared to the square's slope (`Model::DisplayList`).
