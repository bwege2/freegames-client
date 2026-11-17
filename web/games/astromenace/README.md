# AstroMenace 1.4.3 in the browser

A TypeScript port of AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later). Licences and
credits: `LICENSE.md`; licence check: `re/astromenace/LICENSE.md`.

## Build the assets

```
re/astromenace/fetch.sh    # downloads the v1.4.3 source archive into re/astromenace/orig/ and converts gamedata/
```

`re/astromenace/tools/convert.py` unpacks `gamedata/` and `models/models.pack` (the VFS format of
`tools/vfs.py`), converts TGA and VW2D textures losslessly to PNG (`name.tga.png`, `name.vw2d.png`, the rows in
the order the original uploads them to OpenGL), and copies the VW3D models, the sounds, the music, the fonts,
the scripts and `lang/text.csv` (English voices only).

## Layout

| Path | Original | What |
| --- | --- | --- |
| `src/core/` | `src/core/` | math (vectors, matrices, the minstd_rand0 RNG with `generate_canonical<float>`), VW3D models, collision, XML, particles and lights, camera and frustum |
| `src/object3d/` | `src/object3d/` | all objects: projectiles, explosions, space objects, weapons, Earth/alien/pirate ships, motherships, ground objects, the collision and damage rules |
| `src/game/` | `src/game/`, `src/script/`, `src/config/`, `src/gfx/star_system.cpp`, `src/ui/` | mission script interpreter, config and pilot profiles (the original's files), camera, player ship, HUD, weapon panels, game loop |
| `src/menu/` | `src/menu/`, `src/command.cpp`, `src/loop_proc.cpp` | menus, dialogs, profiles, difficulty, missions, top scores, credits, options |
| `src/engine/` | `src/core/` | time threads, input state, text table, textures, the 2D drawing and text |
| `src/render/` | `src/core/graphics`, `gamedata/glsl/`, `src/core/sound` | WebGL 2 renderer and Web Audio |

## Differences from the original

* **Rendering.** WebGL 2 drawn directly (no three.js scene graph: the original draws in immediate order, and its
  draw calls have game side effects, e.g. objects that left the view are deleted). The per-pixel lighting of
  `gamedata/glsl/light.frag` and the explosion vertex shader are reproduced; **shadow maps and normal maps are not
  drawn**; MSAA is the browser's antialiasing. Lights that are switched off contribute nothing (in the original
  the GLSL shader may still read stale values of a disabled light). Brightness is a CSS filter.
* **2D layer.** Menus, HUD and text are drawn on a canvas of the internal resolution (1228x768, or 1024x768 for
  4:3 windows) and laid over the 3D picture wherever the original switches to 2D mode. Text is the browser's
  rendering of the original font files at the original's sizes (FreeType at 96 dpi in the original), so glyph
  shapes and widths can differ slightly. The 2D particles of the HUD are drawn with their colours rounded to 1/32.
* **Numbers.** The game logic computes in doubles where the original uses `float`; the RNG is the original's
  (libstdc++ `minstd_rand0`, `generate_canonical<float>`), seeded from the clock as the original.
* **Sound.** Web Audio instead of OpenAL: game sounds are placed relative to the camera with an inverse-distance
  panner; music files load on demand.
* **Files.** `config.xml` and `PilotProfiles_1.4.data` (the original's XOR-packed profile file, same layout) are
  stored in the account's storage on the server instead of the user's config folder.
* **Window.** Full screen, window size and VSync belong to the browser: those option rows are shown switched off.
  "Quit" returns to the website. F12 (screenshot) is left to the browser. The language is English (the other
  languages' voices and textures are not shipped; the language dialog is not shown).
* **Pointer.** In flight the pointer is captured (click into the game), as SDL's window grab.

## Not ported yet

* The workshop's shops: **Shipyard** (buy, repair, upgrade ships), **Workshop** (engine, power, targeting and
  protection systems) and **Weaponry** (buy, sell, place and set up weapons, ammo). Their tabs are shown switched
  off; START and BACK work, so every mission is flown with the profile's current ship and weapons.
* The options screens **Advanced**, **Interface** and **Config Controls** (shown switched off), the
  **Information** encyclopedia (its screen shows only the way back), the joystick and the FPS counter.

## Tests

`npm test` runs `test/astromenace.test.ts` (9 tests): the RNG against libstdc++'s `minstd_rand0` values, rotation,
all 181 VW3D models, the profile and config files round-trip, the top scores, the text table, the mission list, mission 1
run headless twice from a fresh start with the same seed (same result), and all 15 mission scripts run 20 seconds each.
`test/headless.ts` runs the program without a renderer. These tests check the port against itself and the original's
data; there is no trace comparison with a build of the original yet. `test/browser-debug.mjs` drives the built game
in headless Chromium (manual check).
