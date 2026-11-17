# No Gravity (port)

realtech VR's **No Gravity**, release **2.0** (2006) as its Linux build runs it (SDL, OpenGL,
SDL_mixer; `re/nogravity/`). The game code (`src/game/`) is a line by line translation of the
original's C (`src/lt_*.c`, `lithium.c`, `ccmx.c`, `console.c`), the parts of its engine rlx32 that
the game logic relies on are translated too (`src/v3x/`: the scene files, the object matrices, the
camera, the collisions; `src/gx/`: sprites, fonts, FLC animations; `src/sys/`: the configuration
parser, the timer, glibc's `rand()`, the keyboard and the mouse, the SDL_mixer channels), and the
OpenGL drawing is done with three.js (`src/screen.ts`). All pictures, scenes, sounds and music are the
original's files.

## Controls

The original's defaults (Options, Keyboard, can change them):

* **Mouse**: steers by where the pointer is on the screen (the original's default controller).
  **Left button**: fire, **right button**: accelerate, **wheel**: next weapon.
* **Arrow keys**: steer (when the controller is set to Keyboard in Options, Controls).
* **Alt**: fire. **Right Shift**: accelerate. **Keypad + / -**: cruise speed. **/**: full stop speed.
  **Tab / Backspace**: booster forward / backward. **Delete / Insert**: roll.
* **1-6**: weapon (Twin, Quad, Octo laser, Vulcan, Freezer, Missile; missiles need a lock). **0**: next weapon.
* **Enter**: lock the next target. **Space**: use the power-up, **= / -**: choose it.
* **A**: jump to the next NAV point when its objectives are done. **C**, then **1-8**: orders to the wingmen.
* **R**: radar mode. **I**: HUD on/off (with left Shift: everything). **T**: talk.
* **F1**: help. **F2-F7**: cockpit, outside cameras, rear view, NAV view, missile view.
* **Esc**: pause menu (resume, mission briefing, retry, abort, quit). The key left of **1**: console
  (`god`, `stealth`, `/cheat`, `/win`, `/lose`, `/warp`, `/ticker`, `/cmdlist`).
* Menus: arrow keys, **Enter**, **Esc** or the mouse; on the mission map left/right choose the mission
  and up/down the ship.

## What is the original's

The three ships with their weapon tables (`g_pShip`), ammunition and reload times, shields, booster,
inertia and the six power-ups; the scripts of all missions (`cmx/stage_*.cmx`) with every object's
behaviour (`ccmx.c`): fixed and turning objects, patrols, fighters, kamikaze drones, mines, objects on
tracks, group attacks ("hind"), events, stealth objects, replacements, bonuses and NAV points; the
weapons' flight and damage, missiles with their lock time, the freezer; explosions, debris, smoke and
the blast spheres; the collisions of V3X (spheres and boxes, with their push); the NAV points, the
warp, the mission timer, the friends' orders and the enemies' changing tactics; the cameras of F2-F7,
the start, death and warp cameras; the HUD of each ship with its zones (`int/v<n>_zones.spc`), the
radar and its 3D mode, the target boxes, the lock circle, the rear and target views; the lens flares;
the score, the end of mission statistics, the bonus, the medals; the menus with their texts in five
languages, the pilots' roster (`nogravity.pts`), the hall of fame (`nogravity.hsc`) and the settings
(`nogravity.ini`) in the original's formats; the recorded demos (`menu/record*.dem`, main menu "Demo");
the console. The frame timer is the original's: one frame at least 1/70 s (the "Limit FPS" setting:
1/35, 1/24), the game's speed measured in SDL's millisecond ticks.

## Deviations the browser forces

* **Drawing**: the original's V3X engine projects, sorts and clips the polygons itself and hands them
  to OpenGL; here three.js draws the same meshes with the same projection, a depth buffer instead of
  V3X's sorting, and the vertex colours V3X's lighting gives (computed as `V3XMesh_T2` does). Sprite
  polygons are billboards. Small differences in the order of transparent polygons and in texture
  filtering remain.
* **Screen**: always 640x480 (the default of the original), scaled to the window in 4:3. The
  display mode, vertical sync, multisampling and texture options of the Video menu are kept and saved
  but change nothing.
* **Joystick**: none (the Gamepad API is not used); the joystick entries of the menus are kept, the
  calibration does nothing. As in the original without a joystick, the controller falls back to the mouse.
* **Multiplayer**: the Linux build has none (its network game is DirectPlay, Windows only).
* **Files**: `nogravity.pts`, `nogravity.hsc` and `nogravity.ini` are kept in your account on this
  website (the original writes them to `~/.local/share/realtech/nogravity`), byte for byte in the
  original's formats (a 32-bit `SGPlayerSave`, 72 bytes per pilot). The pilot's name starts as
  "Pilot" (the original uses the login name).
* **Music**: stopping it is immediate (the original fades it out while blocking); the streams are the
  original's OGG files, downloaded when first played.
* **Keys**: a key pressed and released between two frames counts as pressed for one frame (SDL would
  report it at its next poll). Characters above 127 in the texts are looked up unsigned in the font
  table (the original's `char` is signed on x86 and reads before the table).
* **Quit**: "Quit" returns to the game's page.
