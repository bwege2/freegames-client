# Lugaru (port)

**Lugaru: The Rabbit's Foot** (Wolfire Games, 2005), ported from the open-source C++ release
**OSS Lugaru 1.3.0-dev** (`WolfireGames/lugaru`, commit `6a58b62858d9c3c3630abf00bf43075f65a09d38`,
2020-09-29). The TypeScript code is new; the game data is the original's, copied unchanged by
`re/lugaru/fetch.sh` and `re/lugaru/tools/assets.py`. The site's `web/games/lugaru/LICENSE.md`
records the licences and the operator's variant-B decision.

## What is here

* **The 27-level Wolfire campaign** (`Data/Campaigns/main.txt`, `Lugaru1.json` … `Lugaru27.json`),
  with the original level names, descriptions, map coordinates, terrain, objects, spawns, equipment,
  clothing, waypoints and opening dialogue. The campaign map is the original `World.png`; locked
  levels are shown as locked nodes. Progress is kept in the player's account storage.
* **Movement:** camera-relative running, walking, crouching/sneaking, jumping, turning, terrain
  height following and simple object collision.
* **Combat:** punches, spin kicks, low kicks, sweeps, knife/sword/staff attacks, crouched ground
  stabs, stealth attacks from behind, crouch reversals, weapon drawing and a simplified throw.
  Damage uses the original `damagetype * power / (tolerance/200) / protection` formula; the attack
  table and hit labels are from `Source/Objects/Person.cpp` (see `test/combat.test.ts`).
* **AI:** passive villagers, guards, search, chase and attack states; sight checks against terrain
  and objects; the original 20/30-unit notice distances, 1.9-unit attack distance and the
  map's `hostile` flag; wolves are stronger and faster.
* **The original characters:** the `Body.solid`/`Wolf.solid` meshes deformed by the original
  skeleton and muscle system (`Skeleton::Load`/`Person::DrawSkeleton`), the original fur and
  clothes textures, and the original animation files. The renderer is three.js; the terrain is the
  original 256×256 heightmap with its two blended ground textures, and the objects, trees, bushes,
  rocks, boxes, weapons, skyboxes and sound effects are the original assets.
* **Menus and dialogue:** title, campaign map, controls, pause, level complete, death; the original
  dialogue scenes' names, text and staging. Sound effects are positional (gain/pan); there is no
  music.
* **Saves:** campaign unlocks and completed levels in `ctx.storage` as `lugaru-save.json` (the
  server registers `lugaru` as a storage-only game). A new game resets the save; a reload continues
  from the stored one.

## Controls

* **W A S D** or the arrow keys: move. The character turns toward the movement direction.
* **Mouse:** look. Click the game once to capture the pointer; right-drag to look without capture.
* **Left mouse:** attack. Crouched it is a sweep (or a stealth kill from behind); with a knife,
  sword or staff it uses the weapon.
* **Space:** jump (hold for the higher jump).
* **Shift:** crouch/sneak; crouch under a high attack to reverse it.
* **E:** draw/switch weapon. **Q:** throw the current weapon.
* **Esc:** pause; the pause menu can resume, restart, go to the campaign map/main menu, or quit to
  the site.

## Deliberate omissions (operator's variant B, 2026-11-21)

The data is Wolfire's **CC BY-SA 3.0** and is shipped as a separate work beside the GPL-3.0 port
(aggregation, not a combined work). The following are **not shipped**:

* **Music:** `Data/Sounds/Music1Desert.ogg`, `Music1Grass.ogg`, `Music1Snow.ogg`, `Music2.ogg` and
  `Music3.ogg`. Their embedded titles/MP3 provenance are undocumented; the game runs without music.
* **Temple campaign:** `Data/Campaigns/temple.txt`, `Data/Maps/sven*`, its six textures and the four
  `Cl*.png` textures made with the AR PL UKai font. The port contains the Wolfire main campaign only.
* **Console font:** `Data/Textures/FontMono.png` (SIL OFL 1.1, Liberation Mono). There is no console
  in the port; any console text would use a browser font.
* **HD texture pack:** the port uses the base 2005 texture set in the pinned tree (the largest
  terrain textures are 1024×1024 and the character skins 512×512); no separate 2048 HD pack is
  copied. `Data/Textures/Fur2.png` is the base black-fur texture restored by the OSS project.
* **Community campaigns** (Empire by Jendraz, Seven Tasks by Philtron R.) are also not copied.
* **HD-only textures:** the pinned tree contains one texture set (largest terrain 1024×1024, character
  skins 512×512); no separate 2048 HD-only files were present, so there was nothing else to leave
  out. The commercial *Lugaru HD* texture pack is not used.

## Deviations and known gaps

Faithful (checked against the source and the data):

* Terrain height (`red / 10 * 6`), the 256×256 map, the 1536×1536 world, the original object tuples,
  tree/rock/box scales and textures, the skyboxes, the character skeleton/muscle deformation, the
  animation frame data and hit labels, the attack damage table, the `power`, `damageTolerance` and
  `protection` factors, the crouch reversal rule, the 20-unit/30-unit AI sight and 1.9-unit attack
  distances, the original campaign levels and dialogue text.
* The 27 main-campaign maps, the challenge maps and the tutorial map are present; all main-campaign
  maps are `type 0` (kill everyone), which the port implements.

Simplified or missing (browser/scope):

* **Physics:** no ragdoll skeleton, no muscle constraints, no terrain sliding momentum, no
  wall-jumps/climbing/hanging, no back-handsprings/flips, no weapon physics or stuck weapons.
  Knockdown plays the original `Dying`/`Dead` animations and a downed character can be finished.
* **Combat:** no counter-reversals (the original's reversal of a reversal), no high block/staff
  parry, no feints, no weapon disarm, no thrown-weapon projectile (Q applies the damage
  immediately), no bleeding-out/unconscious timers, no armour-specific damage, no stealth
  hearing/smell model. The player and AI use the original crouch-reversal chance (55 %) instead of
  the frame-perfect input.
* **AI:** sight only (no hearing, scent, wind, blood or noise), simple steering instead of the
  original path-point graph, no group/flanking/help calls, no weapon-pickup AI. Patrol waypoints
  from the map are followed.
* **Campaign/dialogue:** each level's opening dialogue is played; mid-level dialogue triggers,
  hotspot objectives, the tutorial's staged lessons and the challenge progression are not ported.
  `Challenge` starts the first challenge map (`map1`). The campaign map is a node map, not the
  original animated campaign screen.
* **Renderer:** three.js instead of immediate-mode OpenGL; no motion blur, depth-of-field, terrain
  decals (blood/footprints), particles beyond simple blood points, fire, weather or shadows. The
  two ground textures are blended by slope in a shader; the original also adds random per-tile
  texture offsets. Characters use the main body model; the six facial/hand morph targets, eyes,
  eyelids and the belt/clothes mesh are not separately rendered (clothes are composited into the
  fur texture). Weapons are attached at the right hand, not to the original's weapon-target frames.
* **Audio:** sound effects only (no music, ambience loops or 3D HRTF); distance gain and stereo pan.
* **Menus/settings:** the menus are DOM panels with a browser font, not the original's bitmap-font
  screens; there is no settings screen, key remapping, joystick, resolution/detail options or
  credits; the site's full screen button is used.
* **Saves:** campaign progress only, no per-level checkpoint; `ctx.storage` is the account storage.

The port is a **gameplay-faithful port of the original's data, numbers and campaign**, not a
pixel-perfect reproduction of the 2005 OpenGL renderer.

## Data and licences

* Code: GPL-2.0-or-later (original), port code GPL-3.0-or-later.
* Data: Wolfire CC-BY-SA 3.0, unchanged, attributed. No music, Temple, FontMono or HD pack. The
  full per-package table, the historic terms and the operator decision are in `LICENSE.md`.
* The favicon (`web/icons/lugaru.png`, `lugaru-180.png`) is the game's own red/gold logo
  (`Data/Textures/Lugaru.png`, CC-BY-SA 3.0), cropped to the L on a dark ember tile.

## Running and tests

```sh
bash re/lugaru/fetch.sh             # downloads the pinned tree, copies assets, generates metadata
cd web
npm test                            # every game's tests, including games/lugaru/test
npx tsc --noEmit
npm run build
node scripts/screenshots.mjs lugaru # needs server/target/freegames-server.jar
```

The headless tests in `web/games/lugaru/test/` read the copied original data and check:

* the skeleton (20 joints/45 muscles), `Body.solid` (463 vertices/904 triangles), `Idle`/`Upunch`
  frame counts/labels/speeds, the heightmap and spawn heights, the Lugaru1 object/player/dialogue
  counts and the 27-level campaign;
* the attack damage table, range/height rules, knockdown/death and the crouch reversal;
* the animation player's loop/one-shot timing, hit label 5 and joint interpolation;
* the AI's sight range, object occlusion and 1.5-unit attack start;
* the kill-everyone win and player-death loss rules.

## Credits

Lugaru by **David Rosen / Wolfire Games**; the open-source release and its data by Wolfire and the
OSS Lugaru contributors. Port code, tests and tooling by the freegames project. The original
`COPYING.txt`/`CONTENT-LICENSE.txt` and the full asset credit table are in `LICENSE.md` and
`re/lugaru/NOTES.md`.
