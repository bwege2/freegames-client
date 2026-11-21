# Lugaru: reference, data formats and port notes

**Status: ported** (operator-approved variant B, 2026-11-21). The license assessment is
`web/games/lugaru/LICENSE.md`; the port's features and deviations are in
`web/games/lugaru/README.md`. This file records the reference, the data formats, how the assets are
made, the original formulas used by the tests, and the commands run.

## Reference

* **Game:** *Lugaru: The Rabbit's Foot* (Wolfire Games, 2005; *Lugaru HD*, 2010).
* **Reference version:** `WolfireGames/lugaru`, `master`, commit
  `6a58b62858d9c3c3630abf00bf43075f65a09d38` (2020-09-29), CMake **1.3.0-dev**.
* **Archive:** GitHub codeload tarball, 36,004,161 bytes, SHA-256
  `40cddfc07e81e8c37ea770dce75e51565a56c3cb43de610b1ee0532e0de2282d`; downloaded by
  `re/lugaru/fetch.sh` into `re/lugaru/orig/` (gitignored, never committed).
* **Data:** 542 files / 39,530,757 bytes in `Data/`; `Source/` 1,521,617 bytes.
* **License:** code GPL-2.0-or-later; Wolfire data CC BY-SA 3.0 (2016 relicensing commit
  `51203b5` by David Rosen). The operator approved variant B: code and data as separate works, no
  music, no Temple campaign, no `FontMono.png`, no HD pack.

## Fetch and asset pipeline

```sh
bash re/lugaru/fetch.sh
```

`fetch.sh` downloads and verifies the tarball, unpacks it into `re/lugaru/orig/lugaru-6a58b62`, and
runs `python3 -I tools/assets.py`. The script copies the Wolfire models, skeleton, animations,
textures (base set), sound effects (no music), the 27 main-campaign maps, the challenge/tutorial
maps, `main.txt` and the dialogues. It generates:

* `assets/heightmap.json` — the red channel of `Data/Textures/HeightMap.png` in the original
  heightmap indexing (`heightmap[x][z] = image(255-z, 255-x)`; `Terrain::load` reads `red/5`, halves
  it to `red/10`, and the terrain scale is 6, so world height = red * 0.6).
* `assets/animations.json` — the 110 loadable entries of `Source/Animation/Animation.def` (id, file,
  height, attack, bits).
* `assets/campaign.json` — the 27 levels of `Data/Campaigns/main.txt` (name, description, next
  link, campaign-map coordinates, end text).
* `assets/manifest.json` — every copied file and its size.

The copy excludes `Music*.ogg`, `Cl*.png`, `FontMono.png`, `temple/`, `empire/`, the Slib Temple
textures, `sven*`, `jendraz*` and `task*` maps/campaigns. The script checks the exclusions after
copying. The result is 435 files / 34,052,842 bytes.

## Data formats (verified against the source and the files)

* **`.solid` models** (`Source/Graphic/Models.cpp`): big-endian `int16` vertex/triangle counts;
  vertices are `float32 x,y,z`; each triangle is six `int16` indices (the rendered triangle uses
  indices 0, 2 and 4; 1, 3, 5 are decal vertices) followed by two sets of three `float32` texture
  coordinates. `parseSolid` in `src/data/model.ts` reads this exactly.
* **Skeleton** (`Source/Animation/Joint.cpp`, `Muscle.cpp`, `Skeleton::Load`): `int32` joint count;
  per joint position/length/mass, two bytes, model number, two bytes, label, gun flag, lower byte,
  parent id; then `int32` muscle count; per muscle five floats, type, vertex count and indices,
  visible byte and two parent joints; finally the three forward and three low-forward joints.
  `BasicFigure` and `BasicFigureWolf` both have 20 joints and 45 muscles.
* **Animations** (`Source/Animation/Animation.cpp`): `int32` frame/joint counts; per frame all joint
  positions, twists, on-ground bytes and a speed; then all `twist2`, then per-frame labels. The
  label is read with `Bf` into an `int` in the original, i.e. the four bytes are the integer label
  (the files contain 4/5/7 etc., not floats). The shipped files end after the labels; the parser
  tolerates the absent weapon-target block. `parseAnimation` matches this.
* **Maps** (`Source/GameTick.cpp LoadJsonLevel`, `Object::Object(Json)`): `map.objects` is an array
  of `[type, yaw, pitch, scale, [x,y,z]]`; tree leaves inherit the previous object's scale.
  `map.players` are objects with coords/yaw/creature/whichskin/power/armor/protection/clothes/
  weapons/howactive/waypoints. The port's `src/data/map.ts` types this.
* **Terrain** (`Source/Environment/Terrain.cpp`): the 256×256 heightmap, `height = red/10 * 6`,
  two blended textures per environment (snow: `Snow.jpg`/`Rock.jpg`; grass:
  `GrassDirt.jpg`/`MossRock.jpg`; desert: `Sand.jpg`/`SandSlope.jpg`), terrain scale 6, world
  1536×1536. `heightmap.json` and `heightAt` match the original's triangle interpolation.

No REA run was needed: the source and the binary formats above were enough, and the parsers are
covered by `web/games/lugaru/test/data.test.ts`. The original C++ program was not built or run under
`/tmp/opencode/lugaru`; the formulas and data are checked directly against the source and the
shipped files (the task allows this where a build is not needed/feasible). No binary is committed.

## Combat and AI numbers used by the port/tests

From `Source/Objects/Person.cpp` (`DoDamage`, the attack blocks and `doAI`):

* `damage = damagemult * N / protection`, `damagemult = creaturePower * power`, and for a victim
  with a tolerance other than 200, `damagemult /= victim.damageTolerance / 200`.
* Base N: punch/upunch 60 high, windup punch 60, spin kick 100 head, low kick 30 high, sweep 40 low,
  rabbit kick 500 high, drop kick 20, knife slash 120 high, sword slash 350 head, staff hit 100
  high, staff spin hit 350 head, staff ground smash 100 head, crouch/sword ground stab 100 head,
  sneak 100 head (the port uses a lethal 10000 for the stealth kill), reversals 30–150.
* Knockdown at `damage > damageTolerance`; permanent death at `permanentDamage > damageTolerance`;
  damage regenerates at 13/s, permanent damage at 4/s (8/s idle/crouch). A downed character can be
  hit again, as in the original.
* AI: passive → attack when the player is within 20 units and visible; chase up to 30 units;
  attack at 1.9 units. `hostile` maps start alerted. Sight is blocked by terrain and object
  cylinders. The port uses these ranges and the original `power`/tolerance values.

## Port structure

* `src/data/` — pure parsers/math/heightmap/skinning (no DOM), used by the browser and the tests.
* `src/sim/` — `Person` (movement, animation state, combat, AI), `World` (map, objects, level rules,
  dialogue, camera), combat table, animation player, creature data.
* `src/render/` — three.js terrain shader, object meshes, character skinning/rendering, scene.
* `src/ui.ts`, `src/game.ts`, `src/index.ts` — menus, campaign map, input, saves, SDK entry point.
* `test/` — `data`, `combat`, `animation`, `ai`, `level`, `campaign`; 24 tests.
* The server registers `lugaru` as `GameModule.storageOnly("lugaru")` in
  `server/src/main/java/net/slop/freegames/games/Games.java`, so the SDK's account storage
  (`ctx.storage`) has a game to belong to. The server is not distributed.

## Commands run

```sh
cd /home/leo/proj/sloptown/freegames-lugaru
git fetch origin && git rebase origin/main
bash re/lugaru/fetch.sh
cd web
npm ci --no-audit --no-fund
npx tsc --noEmit
npm run build
node --test --test-concurrency=1 games/lugaru/test/*.test.ts
node --test test/catalog.test.ts
JAVA_HOME=/nix/store/r1gykws65crj97ifmi7qpkl71pb6dmvz-openjdk-headless-21.0.13.0.2+1/lib/openjdk \
  mvn -B -q -f pom.xml package -DskipTests
node scripts/screenshots.mjs lugaru
```

`re/lugaru` is listed in `web/scripts/source-paths.mjs`, so the public source holds the fetch/build
scripts and these notes (not the downloaded archive). See `web/games/lugaru/README.md` for the
deliberate omissions and the missing original features.
