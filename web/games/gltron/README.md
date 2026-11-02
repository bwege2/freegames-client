# GLtron (port)

Andreas Umbach's **GLtron 0.70final** (2003), ported from its C/OpenGL source, Lua menu and data
(`re/gltron/`): the original arena, lightcycle and recognizer models, art-pack textures, sounds and
Peter Hajba's “Revenge of Cats” soundtrack. The simulation and camera formulas are translated from
`src/game/engine.c`, `event.c`, `computer.c`, `computer_utilities.c` and `camera.c`; the scene is
drawn with three.js.

## Controls

The original's default bindings:

* **A / S**: player 1 turn left / right. **D**: boost. **Q / W**: glance left / right.
* **J / K**: player 2 turn left / right. **L**: boost. **U / I**: glance.
* **Left / Right arrows**: player 3 turn left / right. **Down**: boost. **Delete / End**: glance.
* **Keypad 4 / 6**: player 4 turn left / right. **5**: boost. **7 / 9**: glance.
* **Space**: pause; any key resumes. **Esc**: back to the menu (from the menu: the website).
* **F1–F4**: single / split / 4-player / auto viewports. **F10**: next camera. **F5**: save settings.
* **Arrow keys**, **Enter**, **Esc**: menus; left/right changes a value. Keys can be remapped in
  **Game → Configure Keys**.
* GLtron starts a round on the **pause screen** (“Game is paused”); a key press starts the physics,
  exactly as the original does.

## The game

* **Menu**: Game (Start Game, Reset Scores, Game Rules, Play Settings, Configure Players,
  Configure Keys, Configure Joystick), Video (Artpack, Detail Options, Screen Options), Audio
  (Music, FX, volumes, song), Quit. The labels, values and defaults are from `scripts/menu.lua` and
  `scripts/config.lua`.
* **Rules**: game type classic / booster / wall acceleration / both, four speeds
  (5, 6.5, 8.5, 12), four bot skills (dumb, normal, strong, the MCP himself), five arena sizes
  (160, 240, 480, 720, 1200), erase dead players.
* **Play settings**: fast finish, circling/behind/cockpit/mouse camera, single/split/4-player/auto
  viewports, 2D map size.
* **Four seats**: each can be Human, Computer or None; scores accumulate over rounds, **Reset
  Scores** clears them. The four spawns are shuffled with the original LCG (seed 42), and the
  round-1 spawns are the original's (180,360)/(540,360)/(360,180)/(360,540), directions 3,2,1,3.
* **Simulation**: 20 ms physics steps, the `±9 %` speed wobble per seat, instantaneous 90° turns,
  trail segments, the original segment intersection (including its parallel failure rules), walls,
  boosters, wall acceleration, the 3 s crash explosion, survivor scoring and the original round end.
* **AI**: all four parameter rows, the simple distance brain and the sector/intersection aggressive
  and evasive brains with the original action tables.
* **Rendering**: drawn the way `drawCam()` draws it, in the original's world units: skybox, textured
  floor (the texture repeated grid/12 times) and shadows without depth, then the four upright
  144-high textured walls, the high/medium/low lightcycle models by distance (lit by a light at the
  eye, Hull in the seat's colour), the trail ribbon with the GL_DECAL pinstripe, bow and white tip,
  the white top lines, the red-outlined recognizer on its path, the glow around the other cycles,
  the flying-fragment explosion, the projected black shadows of cycles, trails and recognizer, the
  bitmap-font HUD (score and pause text at the bottom of the viewport) and the 2D map.
* **Audio**: the original engine loop (pitch follows speed), crash sound, music and volume settings.
* **Settings** are kept in the player's account on the server (`gltron-settings.json`), so seats,
  keys and video/audio choices survive a reload.

## Deviations the browser forces and known gaps

Faithful: the physics constants, fixed-step order and event queue, the LCG and spawn fixture, the
AI, the round/score rules, the menu tree and defaults, the arena/model/texture/sound data, the FTX
fonts and the HUD, the camera formulas for circling/behind/cockpit, and the original's
Start-Game-on-the-pause-screen behaviour.

* **Renderer**: three.js rather than immediate-mode OpenGL. Not reproduced: the lighting of the trail
  ribbon (it is drawn in its plain colour, the original multiplies it by two directional lights), the
  shockwave/spire impact effect (`drawImpact`), the recognizer's faint specular highlight (it is a
  near-black body), the angular visibility test of `playerVisible`, and the stencil shadow mode
  (off by default in the original too). The explosion uses the high-detail model for every distance.
* **The menu** is drawn with the original FTX bitmap fonts and logo on the HUD canvas; the Lua menu's
  active-item colour animation, artpack scanner, screen-resolution list and joystick threshold are
  simplified or absent. **Joystick** is not supported (Configure Joystick says so). **Screen
  Options** cannot resize the browser window; use the site's fullscreen button.
* **Mouse camera** is not pointer-locked (browsers require a gesture); the `mouse` camera behaves like
  the free/behind camera. The default behind camera, cockpit and circling cameras work.
* **Audio** is mixed in two channels (music/FX), not the original's 3D positional mixer; the engine
  loop is one source whose pitch follows player 1's speed. The soundtrack is the original Impulse
  Tracker module rendered to OGG (`re/gltron/fetch.sh`), a lossy conversion; the `.it` stays in the
  download.
* **Settings** are JSON in account storage rather than the original's `~/.gltronrc` Lua text file;
  the values and defaults are the original's. There is no local save of the game state (the original
  has none either).
* **Browser keys**: F1/F5/F10/F11/F12 may be taken by the browser; the port prevents them where it
  can and every game key is remappable in Configure Keys. Frame deltas are capped at 250 ms and the
  game pauses when the tab is hidden (browser-forced; the original would catch up).
* **Credits/timedemo/network/demo recording**: the original's credits screen is replaced by Quit
  leaving the site; timedemo, network and the demo-recording code are unreachable/dead in 0.70 and
  are not ported.

The original's `COPYING` is in the download; see `re/gltron/fetch.sh` and `re/gltron/NOTES.md`.

## Running

```sh
bash re/gltron/fetch.sh              # downloads 0.70final, copies the data, renders the music
cd web && npm test                    # simulation/intersection/spawn tests
npm run build && node scripts/screenshots.mjs gltron
```
