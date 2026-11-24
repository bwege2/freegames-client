# 0 A.D. — reference, data and port plan

Stage 1 (2026-11-23): pin the release, check the licences, inspect the data, and write the plan for the
playable vertical slice. Nothing of the port itself is built in this stage.

## 1. Pinned reference release

| | |
| --- | --- |
| Game | **0 A.D.** (Wildfire Games), release **0.28.0 “Boiorix”** |
| Released | **2026-02-16** (`build/resources/0ad.appdata.xml`) |
| Source tag | **`v0.28.0`**, commit **`a2cae4d69f816e9e9d7eecb6bf88f762afc0c90d`** |
| Build stamp | `L"release-0.28.0, a2cae4d69f"` (`build/build_version/build_version.txt`) |
| Source archive | `0ad-0.28.0-unix-build.tar.xz`, **164,975,536 bytes**, SHA-256 `27e217755ef76a922fe58dbf593d96e54b6ed2375d23f548c35619aa6bd5a42a` |
| Data archive | `0ad-0.28.0-unix-data.tar.xz`, **1,415,012,652 bytes**, SHA-256 `e844b30ae2102c47e0a4fff2f0e0ef05ba0cebb1890aa72276fa12457c39526f` |
| Source URL | <https://releases.wildfiregames.com/0ad-0.28.0-unix-build.tar.xz> |
| Data URL | <https://releases.wildfiregames.com/0ad-0.28.0-unix-data.tar.xz> |
| Official sums | <https://releases.wildfiregames.com/0ad-0.28.0-unix-build.tar.xz.sha256sum> and <https://releases.wildfiregames.com/0ad-0.28.0-unix-data.tar.xz.sha256sum> |
| Repository | <https://gitea.wildfiregames.com/0ad/0ad/src/tag/v0.28.0> |

Both `sha256sum` values were recomputed locally and match the official sums byte for byte. The release page
(<https://releases.wildfiregames.com/>), the Gitea tag list (`repos/0ad/0ad/tags`, newest `v0.28.0`) and the
repository’s `0ad.appdata.xml` agree: **0.28.0 is the newest stable release as of 2026-11-23**; no 0.28.1
or later stable tag exists.

`re/0ad/fetch.sh` downloads both archives with the sums above, verifies them and extracts them into
`re/0ad/orig/0ad-0.28.0/` (gitignored by `re/*/orig/`). `./re/0ad/fetch.sh --unpack` also unpacks
`public.zip` and `mod.zip` into `re/0ad/work/` (gitignored by `re/*/work/`). The archives and extracted trees
are **not** committed.

### Extracted tree

| Path | Size | Contents |
| --- | ---: | --- |
| `re/0ad/orig/0ad-0.28.0/` | 2.4 GB | the extracted source/data release (source + `binaries/data/mods/{public,mod}.zip`) |
| `.../source/` | 19 MB | C++ engine, 0 A.D./Pyrogenesis |
| `.../build/` | 2.6 MB | build scripts, premake, `build_version` |
| `.../binaries/data/mods/public/public.zip` | 3,508,827,314 bytes | the public mod, compressed |
| `.../binaries/data/mods/mod/mod.zip` | 93,421,350 bytes | the engine mod (fonts, engine GUI/shaders) |
| `re/0ad/work/public/` | 3,497,330,785 bytes, 52,829 files | unpacked public mod, used only for inspection |
| `re/0ad/work/mod/` | 92,951,362 bytes, 2,013 files | unpacked engine mod |

The data tarball’s `public.zip` is a zip of the mod; its files are mostly already **cached** by the release
build (`*.xml.cached.xmb`, `*.png.cached.dds`, `*.dae.cached.pmd`, `*.dae.cached.psa`). The readable
sources (`*.xml`, `*.json`, `*.js`) are present beside the caches. The port reads the readable sources and the
cached binary assets; it does not use the XMB caches (they are the engine’s compiled XML).

## 2. Licence verdict (details and quotes in `web/games/0ad/LICENSE.md`)

| Part | Licence | Shipped by the port? |
| --- | --- | --- |
| 0 A.D./Pyrogenesis code (`source/`, GPL headers) | **GPL-2.0-or-later** | no: read as reference, translated/reimplemented |
| `source/lib/` | MIT | no |
| `source/third_party/*` | GPL-2.0+ (encryption), MIT, zlib, ISC, BSD, Apache-2.0, WTFPL, CC0, package by package | no |
| Art (`public/art/`, all subdirectories) | **CC BY-SA 3.0 Unported** (`art/LICENSE.txt`) | **yes, a map subset** |
| Audio (`public/audio/`, music included) | **CC BY-SA 3.0 Unported** (`audio/LICENSE.txt`) | **yes, a subset; music lazy** |
| Simulation rules, templates, GUI, maps, shaders, l10n | **GPL-2.0-or-later** (default for `binaries/data/`; `maps/random/LICENSE.txt` adds NASA/OSM terms) | map + templates + HUD data yes; shaders/l10n no |
| Engine-mod fonts (`mod/fonts/`) | DejaVu (Bitstream Vera), GNU FreeFont (GPL-3.0+ font exception), Linux Biolinum (GPL-3.0+ font exception), Source Han Sans (OFL 1.1) | FreeSans + Biolinum + DejaVu only |
| Port’s TypeScript/tools | **GPL-3.0-or-later** (the website’s licence) | yes |

**Conclusion.** The port’s code is GPL-3.0-or-later. The art/audio is CC BY-SA 3.0 and is shipped as a
**separate work beside the code (aggregation), not relicensed under the GPL** — the same arrangement the
operator approved for Lugaru (variant B, 2026-11-21) and used for C-Dogs. The simulation/map/GUI data that
comes from `binaries/data/` outside `art`/`audio` is GPL-2.0-or-later, which combines with the GPL-3.0 port.
Attribution and ShareAlike for the art/audio stay with those files.

No file in the release is under a NonCommercial or NoDerivatives term. The only occurrences of
“non-commercial” in the data are in the CC BY-SA grant itself (“for commercial and non-commercial purposes”).
There is no per-file NC/ND notice in `art/` or `audio/`; in the public mod the only data licence files are
`art/LICENSE.txt`, `audio/LICENSE.txt` and `maps/random/LICENSE.txt`, and the engine mod adds the font
licences in `mod/fonts/`. The one special
third-party arrangement is the **CGTextures** note in `art/LICENSE.txt`: some textures are derived from
CGTextures materials and CGTextures gave special permission to distribute those **derived** textures as
CC BY-SA; the port ships only the derived textures, never the originals.

## 3. Data layout

### 3.1 Top level of the public mod (unpacked)

| Directory | Files | Bytes | What |
| --- | ---: | ---: | --- |
| `art/` | 29,684 | 2,746,278,824 | actors, meshes, animations, textures, terrains, materials, particles, skeletons |
| `audio/` | 1,825 | 283,139,331 | 1,098 OGG files; music directory 61 OGG + `album.png` (221,936,012 B), ambient, attack, interface, actor, voice, resource |
| `maps/` | 755 | 371,349,259 | 150 PMP terrains, 156 scenario XMLs, random-map scripts, previews |
| `simulation/` | 4,607 | 5,233,226 | 1,971 XML templates, 390 JSON data files, 275 JS components/helpers/AI |
| `gui/` | 923 | 2,069,456 | 364 JS files, 228 XML layouts, sprites/styles/texts |
| `shaders/` | 14,509 | 52,101,852 | GLSL/SPIR-V and material shader XML |
| `l10n/` | 450 | 36,959,077 | 432 `.po` translations |
| `autostart/`, `campaigns/`, `gamesettings/`, `globalscripts/` | 75 | 199,567 | engine-side entry points and game settings |

`art/` in detail: `textures/` 2,277,786,199 B (8,533 DDS, 89 PNG, 49 TXT, 12 XMB, 12 XML); `meshes/` 361,353,470 B
(4,280 PMD); `animation/` 88,386,648 B (1,220 PSA); `actors/` 15,819,933 B (5,674 actor XML + XMB);
`variants/` 1,605,261 B (1,166 variant XML); `skeletons/` 557,331 B; `terrains/` 541,160 B (terrain material
XML only — the actual terrain textures are under `textures/terrain/`); `materials/` 36,659 B;
`particles/` 117,538 B; `icons/` 73,199 B.

### 3.2 File formats that matter

| Format | Version / magic | Where documented in the pinned source |
| --- | --- | --- |
| PMP terrain | `PSMP`, version **7** | `source/graphics/MapIO.h`, `MapReader.cpp` (`UnpackTerrain`) |
| Scenario XML | `<Scenario version="7">` | `source/graphics/MapReader.cpp` (`CXMLReader`) |
| Entity templates | XML with `parent` and `a|b|c` inheritance | `source/ps/TemplateLoader.cpp`, `source/simulation2/system/ParamNode.cpp` |
| Actors | XML, `<actor version="1">`, groups/variants/props | `source/graphics/ObjectBase.cpp`, `ObjectManager.cpp` |
| Mesh | `PSMD`, version **4** (PMD) | `source/graphics/ModelDef.h`, `ModelDef.cpp` |
| Animation | `PSSA`, version **1** (PSA) | `source/graphics/SkeletonAnimDef.h`, `SkeletonAnimDef.cpp` |
| Textures | DDS (DXT1/DXT3/DXT5), PNG for UI/cursors | `source/graphics/TextureManager.cpp`; release stores `*.png.cached.dds` |
| Engine XML cache | `.cached.xmb` | not read by the port; the `.xml` source is the reference |

PMP layout (v7): `char[4] "PSMP"; u32 version; u32 payloadSize; u32 patchesPerSide; u16 height[vertices²];
u32 textureCount; (u32 length, char[length])[]; {u16 tex1; u16 tex2; u32 priority}[tiles²]`.
`vertices = patchesPerSide * 16 + 1`; a tile is 4 m; heights are 1/92 m; the tile order is z outer, x inner.
PMD v4: vertex count, UV-set count, vertices (position 3f, normal 3f, UVs, 4 bone indices + 4 weights), faces
(3×u16), bones (translation 3f + quaternion 4f), prop points (name, position, rotation, bone index).
PSA v1: name string, frame time, key count, frame count, keys (translation 3f + quaternion 4f).

### 3.3 Stage-1 candidate map (superseded)

**`maps/skirmishes/temperate_roadway_2p` — “Temperate Roadway (2)”** was the stage-1 candidate. The
interrupted run switched to **Farmland (2)** (`farmland_2p`) and the completed slice uses that map; the
candidate numbers below are kept only as the original plan and the data-inventory example.

| | |
| --- | --- |
| Map XML / PMP | 318,858 B / 369,862 B |
| Entities | **1,590**: 1,564 Gaia (1,019 explicit player 0 + 545 without a player, i.e. trees, animals, decals), 13 for player 1, 13 for player 2 |
| Unique templates | 40 (five `skirmish/*` replacers, the empty `special_starting_unit` placeholder, and the map’s other templates); after civ expansion, 41 direct actor names and 258 actor/variant files |
| Terrain textures | 23 names in the PMP, 69 DDS files (diffuse/normal/specular) |
| Starting units per player | 1 civil centre, 5 support civilians, 3 melee infantry, 2 ranged infantry, 1 cavalry, and 1 `special_starting_unit` that Athenians/Carthaginians do not replace (destroyed by `SkirmishReplacer`; player 2 has 2 melee / 3 ranged) |
| Default civs | **Athenians vs Carthaginians** (`simulation/data/settings/player_defaults.json`); the map itself is civ-neutral and uses `SkirmishReplacer` |
| Starting resources | 300 of each resource (default; `starting_resources.json`, “Low”) |
| Population cap | 300 (`InitGame.js` default) |

Asset subset for this map, counting the actors of both default civs and all actor variants/props (produced by
`re/0ad/tools/data_inventory.py`):

| Kind | Files | Bytes |
| --- | ---: | ---: |
| PMD meshes | 178 | 5,150,341 |
| PSA animations | 252 | 16,601,872 |
| Model textures (DDS) | 246 | 66,433,632 |
| Terrain textures (DDS) | 69 | 18,884,592 |
| Materials | 11 | 4,825 |
| Particle definitions | 6 | 4,690 |
| **Raw total** | | **107,079,952** (102.1 MiB) |

This is the data budget before conversion. Converting DDS to lossless WebP/PNG is expected to stay in the
same order of magnitude; it will be measured, not guessed, in stage 2. GUI sprites, fonts and the sound
subset come on top; music is lazy-loaded per civ.

## 4. What the next stage builds

The stage-1 target was one complete, playable **single-player skirmish** on `temperate_roadway_2p`; the
completed slice uses `farmland_2p` (section 6): the menu's chosen civilisation (Athenians by default)
against the other, with the original terrain, models, animations, UI texts, controls, timings, costs
and rules. Online 1v1 is included; the other maps, the other twelve civs and the campaign are later
stages; they must not be stubbed inside this slice.

### 4.1 Stack and folder layout

* **three.js** (pinned in `web/package.json`) for the 3D world; **DOM/CSS** for the HUD; **TypeScript**
  everywhere. No Phaser and no WASM/emscripten build of 0 A.D.
* `web/games/0ad/src/`:
  * `data/` — `xml.ts`, `templates.ts`, `pmp.ts`, `map.ts`, `actors.ts`, `civs.ts`, `settings.ts`
  * `render/` — `terrain.ts`, `water.ts`, `sky.ts`, `camera.ts`, `pmd.ts`, `psa.ts`, `model.ts`,
    `actor.ts`, `decal.ts`, `particles.ts`, `sprites.ts`
  * `sim/` — `fixed.ts`, `world.ts`, `entity.ts`, `commands.ts`, `pathfinder.ts`, `motion.ts`,
    `gather.ts`, `build.ts`, `train.ts`, `combat.ts`, `projectiles.ts`, `player.ts`
  * `ai/` — the Petra port, file-for-file names (`petra.ts`, `economy.ts`, `military.ts`, `attack.ts`, …)
  * `ui/` — `hud.ts`, `toppanel.ts`, `minimap.ts`, `selection.ts`, `commands.ts`, `queue.ts`,
    `notifications.ts`, `menu.ts`
  * `audio/` — sound-group resolver and music player
  * `save/` — `.0adsave` zip reader/writer and the binary serializer
* `re/0ad/tools/` — `data_inventory.py` (this stage), `extract_assets.py` (stage 2: copy the map subset,
  convert DDS losslessly, write a manifest with licence/source per file), `fixtures.py` (compact JSON
  fixtures for the headless tests), `oracle/` (Node harness that runs the original pure JS with stubs).
* `web/games/0ad/assets/` — only the shipped subset, with `LICENSE.md` beside it and a manifest that names
  the original path, licence and SHA-256 of every converted file.

### 4.2 Map, terrain, camera (first milestone)

1. **PMP parser** (`data/pmp.ts`): exact v7 layout above; validate magic/version/payload size; return
   `patchesPerSide`, `heights: Uint16Array`, `textures: string[]`, `tiles: {tex1,tex2,priority}[]`; reject
   other versions. Tests: the chosen map’s header, dimensions, height checksum, texture list and tile
   checksum against a committed fixture.
2. **Terrain mesh**: 193×193 vertices; each tile a 4 m quad with height/92 m; split into 12×12 patches for
   frustum culling; use `BufferGeometry` with position, normal and a per-tile texture-index/priority
   attribute. The 0 A.D. shader blends two terrain textures per tile by `priority`; implement a WebGL2
   `sampler2DArray` with the 23 diffuse/normal/specular layers (fallback: two-pass atlas). The material
   values come from `art/terrains/**` and `art/materials/terrain_norm_spec.xml`.
3. **Water**: one plane at the map’s `<WaterBody><Height>` (5 m for this map), animated normal map, original
   colour/tint/waviness/murkiness/wind angle; later port the exact water shader.
4. **Sky and light**: use the `<SkySet>` (`sunny 1`), `SunColor`,
   `SunElevation`, `SunRotation`, `AmbientColor`, `Fog` and `Postproc` (brightness/contrast/saturation/
   bloom) from the map XML. Build a cubemap from `art/textures/skies/<set>/`; one directional light + ambient +
   fog; tone/postprocess in the render pass.
5. **Camera**: port the original bindings from `binaries/data/config/default.cfg`: A/D/left/right and
   W/S/up/down scroll, Q/E or Ctrl+A/D rotate, mouse wheel zoom, middle-drag pan, R reset, Space last attack;
   clamp to terrain and map bounds. Use the same projection/FOV and zoom limits as `source/graphics/Camera.cpp`
   and `GameView`.
6. **Picking**: ray/terrain and entity AABB picking; selection ring and health bar sprites; decals
   (`props/structures/decals/*`) drawn on the terrain with the original size/angle/offset.

### 4.3 Selection and movement

* Entities: stable ids from the map XML (`uid`), owner (0 = Gaia, 1/2 players), template, position
  (`x`, `z`, `y` rotation), actor seed, obstruction groups.
* Selection: click, shift-click, drag box, double-click same type, Ctrl+group save/select, H/“idle
  military” etc.; the original selection rules from `gui/session/selection.js` and `input.js`.
* **Pathfinding**: 1 m navcells (`Pathfinding::NAVCELL_SIZE`), 4 per terrain tile; passability classes from
  `template_structure`/`template_unit` `<Pathfinder><PassabilityClasses>`; terrain passability from
  depth/slope/shore distance; rasterise static obstructions (`Obstruction` squares/circles); long-range
  hierarchical A* + short-range vertex pathfinder. Start with the exact static/dynamic grid and an A* that
  returns the same waypoint sequence; add the hierarchical and vertex refinements with tests.
* **UnitMotion**: fixed-point (`CFixed_15_16`, i32) positions and speeds; walk/run speed, turn rate,
  acceleration, waypoint following, formation slots, `UnitMotion` behaviour from
  `source/simulation2/components/CCmpUnitMotion.h`; simulation at **200 ms/turn** (`DEFAULT_TURN_LENGTH`),
  interpolated for rendering; single-player command delay 1 turn.
* Stances/formations: `UnitAI` stances (aggressive/defensive/stand ground/passive/…), formations
  (`LineClosed`, `Box`, `ColumnClosed`, `Flank`, `Skirmish`, `Testudo`, `Phalanx`, …) from
  `simulation/components/Formation.js` and `UnitAI.js`; movement and combat while formed.

### 4.4 Economy: gathering, building, training

Port the components that the starting Athenians/Carthaginians actually use, with their XML data:

| System | Original | Stage-2 scope |
| --- | --- | --- |
| Resources | `simulation/data/resources/*.json` | food, wood, stone, metal; current/max; trickle; loot |
| Supply | `ResourceSupply.js` | trees, berries, animals, mines, fields; max/current, gather rates, subtypes |
| Gathering | `ResourceGatherer.js` | carry capacity, gather rates, target re-target, dropsite search, auto-gather |
| Dropsites | `ResourceDropsite.js` | civil centre, storehouse, farmstead, dock; shared dropsites |
| Construction | `Foundation.js`, `Builder.js`, `BuildRestrictions.js`, `Obstruction.js`, `Footprint.js` | placement, footprint, territory, foundation, build/repair, rotation, cancellation |
| Training | `Trainer.js`, `ProductionQueue.js`, `TrainingRestrictions.js` | batches, queue, population, cancel/refund, rally point |
| Research | `Researcher.js`, `TechnologyManager.js`, `ModifiersManager.js`, `Auras.js` | phase techs and the civ’s starting techs; modifiers |
| Population | `Player.js`, `Population.js`, `PopulationCapManager.js` | 300 cap, house/CC bonuses, population costs |
| Territory | `TerritoryInfluence.js`, `TerritoryManager.js`, `TerritoryDecay.js` | borders from CCs, build restrictions, minimap |
| Player | `Player.js` | 300 starting resources, colours, diplomacy, defeat |

Building placement uses the original footprint/obstruction and the rotated preview (`[`/`]`); training uses
the original costs/times (`Cost`, `BuildTime`, `Population`), so the first villager/hoplite timings match.

### 4.5 Combat

* Components: `Health`, `Resistance`, `Attack`, `BuildingAI`, `UnitAI`, `ProjectileManager`,
  `DelayedDamage`, `DeathDamage`, `Loot`, `Capturable`, `GarrisonHolder`, `TurretHolder`.
* Damage: the original `Attack.js`/`DamageTypes.js` formula (hack/pierce/crush, armour/resistance,
  bonuses, multipliers, `AttackEffects`); melee and ranged prepare/repeat times, ranges, projectile speed/
  spread/gravity, friendly fire; attack-move, guard, patrol, stance transitions; death animation, corpse
  decay, rubble, loot and capture.
* The civil centre’s arrows (`DefaultArrowCount`, garrison multiplier), towers and forts are part of the
  slice because the map has walls/towers? `temperate_roadway_2p` has no walls, but the player can build
  them; the buildings’ `BuildingAI` is still needed.
* Visual: attack animation events (`m_ActionPos`), sounds from `SoundGroups`, selection/health bars.

### 4.6 AI: Petra

The original `simulation/ai/petra/` is **19,198 lines in 32 files**; `common-api/` adds 3,978 lines. It is
ported in layers, not replaced by a toy AI:

1. **Bootstrap and shared API**: `petra.js`, `config.js`, `gamestate.js`, `common-api` entity/player
   wrappers; the same serialized state, the same `chat`/`team`/difficulty/behaviour flags.
2. **Economy**: `economy.js` (build order, resource needs, gatherer allocation, dropsite/farm placement,
   house/population, phase-up), `queue.js` (training priorities), `builder.js` (construction/repair).
3. **Military**: `military.js` (army composition, production, upgrades), `attack.js` (attack plans,
   target selection, retreat), `defense.js` (threat response, towers/garrison), `headquarters.js`
   (coordination), plus `diplomacy.js`.
4. **Difficulty/behaviour**: the same `AIDiff`/`AIBehavior` values and rates as `player_defaults.json`
   (default: Petra, difficulty 3, behaviour “random”).
5. **Determinism**: all randomness from `RoomStarted.seed`/the game’s deterministic PRNG, never
   `Math.random`; the AI runs on the simulation turn, as in `Simulation2::UpdateComponents`.

Acceptance for the slice: the AI gathers, builds houses/storehouse/farmstead/barracks, trains soldiers,
scouts, defends its base and sends at least one attack; its decisions are covered by scripted-state tests
against the original Petra inputs (see 4.9). Full Petra parity (all difficulties, naval, team games) is a
later stage.

### 4.7 HUD

Start from the original session GUI (`gui/page_session.xml` → `gui/session/session.xml`):

* top panel: resources, population, phase, idle workers, chat/notifications;
* minimap: terrain, entities, territory, camera rectangle, click/drag to move;
* selection panel: portrait, name, health, armour, stance, formations, garrison, capture;
* command panel: build/train/research/repair/garrison/patrol/guard/stop/delete, queue with progress;
* tooltips and context help; pause/menu, diplomacy, objectives, game speed, chat;
* sprites from `gui/session/sprites.xml` + `art/textures/ui/`; fonts FreeSans/Biolinum (see LICENSE.md);
* the original hotkeys from `binaries/data/config/default.cfg` (camera, selection groups, training,
  stance, formations), with browser defaults prevented; `ctx.exit()` for “quit”.

Implementation: a small GUI XML loader for the session page’s `<object>/<include>` layout, or hand-written
DOM modules that reproduce it; either way the texts, sizes, colours and sprite names come from the original
files. The HUD is DOM over the three.js canvas so text stays sharp and accessible.

### 4.8 Saves

0 A.D. saves a **zip** (`*.0adsave`) with `metadata.json` and `simulation.dat` (`source/ps/SavedGame.cpp`).
`metadata.json` contains `engine_version` (0.28.0), `engine_serialization_version` (0.28.0), time, player id,
enabled mods, init attributes (map, civs, settings) and GUI metadata (camera position/rotation/zoom,
description). `simulation.dat` is the output of `CBinarySerializer` over every component’s `Serialize()`
state.

Stage 2 implements:
* writer/reader for the zip (`fflate` or the browser’s `CompressionStream`; pin the choice);
* the exact `metadata.json` fields and camera data;
* the binary serializer subset for the components in the slice (entities, positions, health, resources,
  queues, AI state), in component order; versioned and checked against a round-trip and a fixture;
* `ctx.storage` (account scope) for the save file, with the original file name/extension and a save/load
  menu; autosave as the original does.

Full interoperability with saves written by the C++ engine is a later milestone: the port can write the
same container and metadata immediately, but reading an arbitrary original save needs every component’s
serializer. That limitation will be stated in `README.md`, not hidden behind a stub.

### 4.9 Tests (headless `node --test`, no faked oracles)

1. **PMP**: magic/version, 12 patches, 193² heights, texture names, tile array, height/tile SHA-256 against
   `re/0ad/tools/fixtures.py` output; reject v6.
2. **Map XML**: 1,590 entities, owners 1,564/13/13, 40 templates, positions/orientations/UIDs, environment
   and camera values; `SkirmishReplacer` expansion for `athen` and `cart`.
3. **Templates**: `CParamNode` merge cases (`replace`, `disable`, `merge`, tokens, `op=add/mul/mul_round`,
   `@attr`), `a|b|c` chains; assert the chosen civ’s civil centre/hoplite/cavalry stats (health, cost,
   build time, population, trainer list, actor) against the XML/source.
4. **Actors/PMD/PSA**: actor variant selection for known seeds with the original mt19937 algorithm; PMD v4
   vertex/face/bone/prop counts; PSA v1 key/frame counts; bounding boxes; skinned vertex positions for a
   known animation frame against a fixture.
5. **Terrain/camera**: height at sample points, slope/passability, water height, camera clamp/zoom,
   screen↔world picking.
6. **Pathfinding/motion**: navcell passability at known coordinates, path length/waypoints for the map,
   fixed-point movement and turn timing at 200 ms/turn.
7. **Economy/combat**: gather rate/carry/dropsite timing, build cost/time, training queue/population, damage
   formula and armour, projectile flight time, death/loot.
8. **AI**: scripted game states fed to the Petra port; the same build/train/attack decisions and the same
   deterministic serialization as the original code path.
9. **Save**: zip structure, metadata fields, serializer round-trip, deterministic state hash after 100 turns.
10. **Original-JS oracle**: `re/0ad/tools/oracle/` loads the original pure modules (`DamageTypes.js`,
    `Math.js`, `ValueModification.js`, `Requirements.js`, attack/armour helpers) in Node with `Engine`
    stubs and compares the port’s results case by case.

Fixtures are compact JSON (hashes, entity lists, stat values) generated from the pinned data, with the
source path and licence recorded; the 3.3 GB release and the original archives stay gitignored. No test
invents an expected value: each comes from the XML, the source constant or the original JS.

### 4.10 Milestones and acceptance

| Milestone | Done when |
| --- | --- |
| **S2.1 Map** | `temperate_roadway_2p` terrain, 23 texture layers, water, sky, light, camera and decals render at 60 fps; map tests pass |
| **S2.2 Units** | 1,590 map entities load; Athenians/Carthaginians start with their `StartEntities`; selection, groups, picking, movement and pathfinding work; camera tests pass |
| **S2.3 Economy** | gather→carry→drop, build/repair, house/population, train queue and phase-up work with original costs/times; economy tests pass |
| **S2.4 Combat** | melee/ranged attack, projectiles, armour, stances, death/loot, CC arrows; combat tests pass |
| **S2.5 AI** | Petra economy + military + attack on the map; deterministic; AI tests pass |
| **S2.6 HUD** | top panel, minimap, selection/command/queue panels, tooltips, pause, hotkeys; original texts/assets |
| **S2.7 Saves** | `.0adsave` zip with exact `metadata.json` and slice serializer; save/load in `ctx.storage`; round-trip tests |
| **S2.8 Slice** | a full game can be played to conquest, won or lost, with sound and music; no stubs; README lists deviations |

After S2.8: all skirmish maps, all 15 civs, campaigns, random maps, online lockstep (schema
`protocol/games/0ad.capnp`, server module, `RoomStarted.seed`), replay and full save interoperability.

### 4.11 Risks and decisions to verify early

* **Skinning/animations**: PMD v4 + PSA v1 are simple enough to parse, but 0 A.D.’s blend/action-event
  semantics (`CModel`, `CSkeletonAnim`) must be reproduced; verify with a known frame and a visible unit
  before building the whole HUD.
* **Terrain shader**: 23 layers × diffuse/normal/specular + two-layer priority blending; check WebGL2
  texture-array limits on the target browsers, keep a two-pass fallback.
* **Asset size**: 115.6 MB raw for one map; measure DDS→WebP lossless and consider WebP/AVIF for colour maps
  and lossless for normal/spec. Play must show the download size.
* **Pathfinder**: the hierarchical/vertex pathfinder is the largest non-AI risk; start with exact navcell
  passability and an A* whose output is tested, then add the refinements.
* **Petra size**: do not write a “looks like RTS” AI and call it Petra; port the managers in order and test
  decisions. The slice deliberately uses the default difficulty and a land map.
* **Save compatibility**: exact `metadata.json` now, full `simulation.dat` interoperability later; say so.
* **Civ scope**: Athenians and Carthaginians only in the slice; `SkirmishReplacer` and civ JSON make the
  later civs additive rather than a rewrite.
* **CDN/caching**: hashed asset names, lazy music, no external requests (the site is cross-origin isolated).

## 5. Reproducing this stage

```sh
cd re/0ad
./fetch.sh                    # download + verify + extract both official tarballs into orig/
./fetch.sh --unpack           # optionally unpack public.zip/mod.zip into work/
python3 tools/data_inventory.py --map farmland_2p
```

The data inventory prints the map header, owner counts, template/actor counts and a raw asset estimate;
the shipped subset is the 35,869,687-byte manifest in `web/games/0ad/assets/MANIFEST.json` (section 6). The archive checks are in section 1; the licence checks and their commands are in
`web/games/0ad/LICENSE.md`.

---

## 6. Stage 2 result (2026-11-23)

The interrupted run had started the asset builder for **`farmland_2p`** and an Athenian-only subset; that
work was kept, checked against the release and completed, then extended with the Carthaginian templates,
actors, textures and portraits. The slice therefore uses **Farmland (2)**, not the stage-1 candidate
`temperate_roadway_2p`.

* **Map:** Farmland (2), 256×256 tiles (1024 m), 16 patches, 2,921 original placements (2,895 Gaia, 13 per
  player), 23 terrain textures, sky set `default`, water height 5 m. The map is civ-neutral and its
  `SkirmishReplacer` entities become either civilisation; the map's cavalry and `special_starting_unit` are
  not in the subset (README.md).
* **Asset subset:** `web/games/0ad/assets/` — manifest 516 files, 35,869,687 bytes, 36,190,256 bytes on
  disk including the generated `actors.json`, `icons.json`, `terrains.json`, `sky.json` and
  `MANIFEST.json`: 147 PMD, 68 PSA, 70 model-texture WebP, 23 terrain WebP, 5 sky faces, 109 actor/variant
  XML, 64 templates, 23 icons, 2 map files, 4 font files. Every file is recorded with source path, size
  and SHA-256, and the manifest is refreshed from the final files; DDS was decoded losslessly to WebP,
  PMD/PSA copied byte for byte. `re/0ad/tools/assets.py` rebuilds it from the unpacked release and is
  committed.
* **Implemented:** terrain mesh/texture array, sky/light/fog, original camera bindings, entity actors and
  animations, selection/box, 2 m A* movement, gathering/dropsites/foundations/training/
  population, melee and ranged combat/projectiles/stances/capture, compact deterministic opponent, HUD/minimap/fog,
  two civilisations with their own buildings, soldiers, textures and portraits, `.0adsave` zip with exact
  `metadata.json` + slice `simulation.dat`, and 41 real-data tests.
* **Online:** `protocol/games/0ad.capnp`, generated bindings, `ZeroAdeModuleTest` (12 loopback tests)
  and the client `net/online.ts`: two-seat 200 ms lockstep, 3-turn command delay, server-ordered
  applied turns, Sync/rejoin replay, state-hash checks and agreed-result endings. `games/0ad/e2e.mjs`
  drives two Chromium contexts through create/join/ready/start, real commands, training, a reload and
  rejoin, and a leave-win; the host's civilisation is carried in the room options and the guest gets
  the other.
* **Known gaps:** 1 m hierarchical/vertex pathfinder, Petra, formations, garrison/turret/capture overlays, phases/techs, audio,
  the other twelve civilisations and maps, matchmaking/spectators/online chat UI, and the original GUI XML/shaders. The full honest list is
  `web/games/0ad/README.md`; the licence table is `web/games/0ad/LICENSE.md`.
* **Verification:** `npx tsc --noEmit`; 41 `node --test` game tests, including `online.test.ts` against
  the real server; `node games/0ad/e2e.mjs` (two Chromium contexts: Carthage single-player and
  save/load, create/join/start, commands, train, reload-rejoin, leave-win); `npm run build`; catalog,
  downloads, filter, hosts and source tests; `npm test` (1969 tests: 1915 pass, 0 fail, 54 skipped);
  `mvn -B -f pom.xml test` with Java 21 (376 pass, 0 fail); five screenshots with
  `web/scripts/screenshots.mjs 0ad`.
