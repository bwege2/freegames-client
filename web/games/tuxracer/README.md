# Tux Racer (port)

Jasmin F. Patry's Tux Racer 0.61 (1999–2001), ported from its C/OpenGL/Tcl source and its data
(`re/tuxracer/`): the course bitmaps, terrain, trees, herring, flags, sky boxes, menu art, music and
sounds are the original's; the physics is a line-by-line translation of `src/phys_sim.c`,
`src/nmrcl.c` and `src/alglib.c`; the scene is drawn with three.js.

## Controls

The original's default keys:

* **Left / J**, **Right / L**: turn.
* **Up / I**: paddle (on the ground) or flap (in the air); with the trick key in the air, a front flip.
* **Space / K / Down**: brake; with the trick key in the air, a back flip.
* **E**: jump — hold to charge, release to jump.
* **D**: trick modifier (with a direction/turn while airborne: barrel roll).
* **1**, **2**, **3**: follow, behind and above camera (the original's default bindings are 2 behind,
  1 follow, 3 above; the port keeps that).
* **P**: pause (any key continues).
* **R** or **Backspace**: reset to the last reset point (the `float` objects; the original's
  Backspace, with R as fallback). Resetting costs race time, as in the original.
* **Q** or **Esc**: quit the race (the original's `q`/`escape`); the Race Over screen follows.
* The website's **Back** leaves the game at any time.

## The game

* **Splash → main menu** (`Enter an event`, `Practice`, `Credits`, `Quit`), as 0.61 has it. There is
  no options screen in 0.61 (it was a later version), and difficulty is fixed to NORMAL; the port
  keeps both facts.
* **Practice** lists the five built-in and eight contributed courses, with their par times and
  descriptions. Conditions (sunny/cloudy/night), wind and mirroring can be chosen; snow does nothing
  (the original disables it too).
* **Enter an event** runs the shipped event **Herring Run** and cup **Canadian Cup**: Bunny Hill
  (23 herring, 35 s), Twisty Slope (24 herring, 40 s), Bumpy Ride (18 herring, 30 s), all sunny.
  Four lives per cup; a win advances, a loss or abort costs a life. A race is won when the time and
  herring requirements are met (NORMAL, the only difficulty the original uses). Finishing the last
  race completes the cup and is saved.
* **Score** at the end of a race is the original's: `max(0, floor(100*(par - time) + 200*herring))`,
  with the EASY par time (index 0 of the time requirements).
* **Saved games**: the original's `noname.sav` (magic `fish`, 512-byte records: last completed cup and
  race results with time, herring and score) is kept in the player's account on the server. The format
  is byte-compatible with the original's records (see `src/save.ts`).
* **Music**: the original's tracker modules, rendered to OGG (start screen, race, game over, credits).
  **Sounds**: the original WAVs (herring pickup, tree hit); the sliding loops are not implemented.

## Deviations the browser forces and known gaps

Faithful: course data and placement, physics formulas and ODE23 step control, skid/air controls,
jump charge, camera modes (base offsets), HUD layout and textures, race/cup rules, score, save file,
menu texts, splash, music selection.

Not yet at 1:1, consciously listed:

* **Menus are HTML/CSS**, not the original's OpenGL widgets: the same 640×480 layout, texts, actions
  and key bindings, the original menu title/corner/splash textures, but text is drawn with a system
  Trebuchet-like font instead of the original's texture-atlas font. The listbox/textarea/ssbutton
  chrome is simplified; the mouse cursor is the browser's.
* **Rendering** is three.js with the original's data: one terrain mesh (no quadtree LOD), vertex-blended
  ice/rock/snow textures instead of the original's multi-pass alpha blending, no ice environment map,
  no fog plane, no clipping. Trees are the original's two crossed alpha-tested quads (instanced), the
  objects are billboards; the finish/start "normal" orientation is not reproduced. No track marks, Tux
  shadow, snow particles or UI snow. No sliding sounds.
* **Camera** uses the original's distance and base angle per mode but not its position/orientation
  interpolation (second-order filters); it also does not apply the original's 20° player angle.
  The intro uses the above view, the race the selected view.
* **Physics**: the formulas, constants, force order and ODE23 integration are translated; the tree
  collision is approximated by the tree's diamond base and Tux's body radius instead of testing Tux's
  sphere DAG against the tree polyhedron. The original's particle emission is not part of the
  simulation, so a windy race's random walk consumes no particle randomness. Damage, health and high
  scores are dead code in 0.61 and are not implemented.
* **Intro**: the original keyframes and timing; any key skips. The camera does not use the original's
  no-interpolation path exactly.
* **Music** is rendered from the Impulse Tracker modules to OGG (a lossy browser conversion; the
  modules themselves are in the download archive); the game-over track loops instead of playing
  twice. The audio volume is fixed (the original's HUD/config volume settings and sound options screen
  do not exist in 0.61).
* **Saved file** is written after results rather than only on exit; there is no high-score file (dead
  in the original).
* **Contrib courses** are included in practice, as the original's course list does; their par times
  come from the same data.

The original's `README`, `LICENSE` and `COPYING` are in the downloaded data (not committed); see
`re/tuxracer/fetch.sh`.

## Running

```sh
bash re/tuxracer/fetch.sh              # downloads 0.61 and its data, converts the assets
cd web && npm test                    # the port's data/physics/save tests
npm run build && node scripts/screenshots.mjs tuxracer
```
