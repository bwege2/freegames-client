# OpenTTD 15.3: reference, data and the port plan

Stage 1 (2026-11-23): the reference is pinned, its licences are checked file by file, the source and
the three base sets are inspected, and the plan below is written. **No port code exists yet**; the
folder `web/games/openttd/` holds only `game.json` (unlisted) and `LICENSE.md`.

## Reference version

Checked on 2026-11-23 against <https://github.com/OpenTTD/OpenTTD/releases>: the newest release is
**15.3**, published 2026-04-04. `16.0-RC1` (2026-10-31) is a release candidate, not a stable
release, so it is not the reference; `15.2`, `15.1` and `15.0` are older stable releases.

| | |
| --- | --- |
| Release | **OpenTTD 15.3**, published 2026-04-04T19:56:48Z |
| Git tag | `15.3` (lightweight), commit **`14ec60f248547d4d062a1160f0fc26d742319888`** |
| Commit date | 2026-04-04 16:16:04 +0100, “Update: Update changelog and bump release version for 15.3” |
| Release page | <https://github.com/OpenTTD/OpenTTD/releases/tag/15.3> |
| Project | <https://www.openttd.org/> |

Official downloads (the `manifest.yaml` of each directory carries these SHA-256 sums):

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `openttd-15.3-source.tar.xz` | 8,531,992 | `5ea21eea7d59c78a42071924ac18c6bc0116088f2e96b14cfee9369175973be7` |
| `openttd-15.3-source.zip` (not used) | 13,758,737 | `dcb6813a3ec2064700a52c391e20e2682d9111ce82971d7e4eee1039b0f98e2e` |
| `opengfx-8.0-all.zip` | 3,583,152 | `43a0c1dabf39cb865394f3a6cc36d4da5c10ecfaaf55652043104806810903be` |
| `opensfx-1.0.3-all.zip` | 11,566,000 | `e0a218b7dd9438e701503b0f84c25a97c1c11b7c2f025323fb19d6db16ef3759` |
| `openmsx-0.4.2-all.zip` | 140,204 | `5a4277a2e62d87f2952ea5020dc20fb2f6ffafdccf9913fbf35ad45ee30ec762` |
| `opensfx-1.0.3-source.tar.xz` (per-sound licences) | 9,943,616 | `43cacb3ca2d86e5729d19c7fcf2533e1bb9c9a32a39f515cf6cbe665ec32635c` |

The source archive is the release itself: `.version` = `15.3`, `.release_date` = `2026-04-04 19:57 UTC`,
`.ottdrev` = `15.3 20260404 0 14ec60f248547d4d062a1160f0fc26d742319888 1 1`. A depth-1 clone of the tag
(`git clone --depth 1 --branch 15.3 https://github.com/OpenTTD/OpenTTD.git`) is identical to the
unpacked archive except the four release-generated files `.version`, `.ottdrev`, `.release_date` and
`.changelog` (checked with `diff -rq`).

Base-set metadata: OpenGFX `opengfx.obg` says version 9499, palette `DOS`, blitter `8bpp`; OpenSFX
`opensfx.obs` says version 7974, one file `samples = opensfx.cat`; OpenMSX `openmsx.obm` says version
7974 and names the 31 MIDI files.

## `fetch.sh`

`re/openttd/fetch.sh` downloads the five archives above from the official CDN
(<https://cdn.openttd.org/…>), checks each SHA-256 and byte size, unpacks them and checks the
content. It is safe to run again (the archives are kept in `orig/` and only downloaded when missing or
wrong). It needs `curl`, `unzip`, `tar`, `xz`, `sha256sum`/`md5sum`.

```sh
cd re/openttd
./fetch.sh
```

Result (sizes are the unpacked trees):

| Path | Bytes | Files |
| --- | ---: | ---: |
| `orig/openttd-15.3` | 54,129,941 | 1,857 |
| `orig/opengfx-8.0` | 5,383,650 | 10 |
| `orig/opensfx-1.0.3` | 13,279,968 | 5 |
| `orig/openmsx-0.4.2` | 766,576 | 35 |
| `orig/opensfx-1.0.3-source` | 13,353,653 | 132 |

`orig/` is gitignored (the repository's `.gitignore` has `re/*/orig/`). Nothing there is committed.

Checks in the script: the expected files (`src/tgp.cpp`, `src/train_cmd.cpp`, `src/economy.cpp`,
`src/table/engines.h`, `src/table/cargo_const.h`, `src/lang/english.txt`, `COPYING.md`,
`docs/savegame_format.md`, `media/baseset/openttd.grf`, …), > 1,800 files in the source tree, > 1,200
C++ files under `src/`, exactly 31 `.mid` files and 73 `.wav` sources, and the MD5s of
`ogfx1_base.grf`, `opensfx.cat` and `tttheme2.mid`.

**OpenGFX metadata anomaly.** The `[md5s]` table inside `opengfx.obg` does **not** match the six GRFs
the 8.0 release ships (all six differ, e.g. the base GRF is
`d4607d8c356f033b1ee933a12e00fa53`, the table says `5d83f4f2…`). The archive SHA-256 is the official
one from OpenTTD's manifest, and OpenTTD 15.3 itself only logs this as a debug message at level 0 and
loads the set (`src/base_media_func.h`, `MD5File::CR_MISMATCH`), so the script checks the checksums
computed from this release and notes the table as stale. OpenSFX's and OpenMSX's tables do match.

## Licences

The full check, quotes, credit lists and the conclusion are in `web/games/openttd/LICENSE.md`. In
short:

| Package | Licence | Verdict |
| --- | --- | --- |
| OpenTTD 15.3 code, `media/baseset/openttd.grf`, OpenTTD fonts v0.7 | GPL-2.0-only | ship / translate |
| OpenGFX 8.0 (six GRFs + `opengfx.obg`) | GPL-2.0-only | ship unchanged |
| OpenMSX 0.4.2 (31 MIDI + `openmsx.obm`) | GPL-2.0-only | ship unchanged |
| OpenSFX 1.0.3 sounds (`opensfx.cat`) | CC BY-SA 3.0 as a set; per sound 21× CC0 1.0, 51× CC BY 3.0, 1× CC BY-SA 3.0 | ship unchanged, credited, as a separate aggregate |
| OpenSFX other files (`opensfx.obs`, readme, …) | GPL-2.0-or-later and CDDL-1.1 | metadata only |
| OpenTTD 3rd-party code (`src/3rdparty/…`) | Zlib, MIT, BSD-2/CC0, Boost, Unicode, Apache-2.0 | not ported, not shipped |

**Correction to the ticket's assumption:** OpenSFX is *not* GPL-2.0-only. Its sounds are CC BY-SA 3.0
(the set's `readme.txt` §1.1; the per-sound list `src/opensfx.psfo` in the source package shows the 21
CC0 and 51 CC BY 3.0 sounds and the one CC BY-SA 3.0 helicopter). There is no NC or ND term anywhere.
The sounds therefore stay a separate aggregate beside the GPL-2.0-only port, exactly as the site
already ships Lugaru's CC BY-SA 3.0 data beside GPL code (`web/games/lugaru/LICENSE.md`, variant B,
approved 2026-11-21). They are not relicensed and the port's GPL does not cover them.

The port itself is GPL-2.0-only. The website/SDK's GPL-3.0 §7 additional permission in
`web/LICENSE.md` explicitly permits combining with a GPL-2.0-only port; Frozen Bubble
(`web/games/frozenbubble/LICENSE.md`) is the precedent. The combined work is conveyed under
GPL-2.0-only.

## What is in the source tree

Numbers below exclude `src/3rdparty`. The line counts are non-blank non-comment lines / all lines
(same method as the FreeCol notes):

| Part | Code | All | Files |
| --- | ---: | ---: | ---: |
| map generation (`tgp.cpp`, `landscape.cpp`, `heightmap.cpp`, `map.cpp`, clearing) | 2,472 | 4,328 | 6 |
| trees, water, terraforming | 1,922 | 2,902 | 3 |
| towns and town names | 7,752 | 11,316 | 12 |
| industries and cargo | 8,284 | 11,679 | 13 |
| stations and waypoints | 8,063 | 12,629 | 18 |
| rail, road, tunnels/bridges, signals | 7,118 | 11,189 | 11 |
| vehicles (rail, road, ships, aircraft, orders, depots) | 16,327 | 26,000 | 49 |
| orders and pathfinding (`yapf` etc.) | 4,908 | 7,834 | 21 |
| economy, companies, engines, subsidies | 4,235 | 6,926 | 9 |
| GUI (`*_gui.cpp`, `widgets/`, window, viewport, gfx, fonts) | 42,731 | 61,114 | 116 |
| NewGRF (sprite groups, callbacks, texts, GRF loading) | 17,379 | 27,489 | 107 |
| save/load (`src/saveload`) | 12,742 | 18,854 | 46 |
| network | 9,949 | 15,713 | 37 |
| script (Squirrel GameScripts and AIs) | 14,182 | 31,455 | 171 |
| **all of `src/`** | **239,496** | **379,136** | **1,298** |

The GUI is by far the largest single block; the simulation is roughly 60k lines, and the save/load
machinery another 13k. This is a FreeCol-sized port (FreeCol: 131k code lines / 247k all lines), in
C++ instead of Java.

### Key files for the next stages

| Area | Files |
| --- | --- |
| map generation | `src/tgp.cpp` (`GenerateTerrainPerlin`, `_height_map`, up to 10 noise frequencies with 7 amplitude entries per smoothness level, `TGP_*` settings), `src/landscape.cpp`, `src/clear_map.h`, `src/tree_cmd.cpp`, `src/water_cmd.cpp`, `src/heightmap.cpp` |
| towns | `src/town_cmd.cpp` (`BuildTown`, `TownTickHandler`, `GrowTown`, `BuildTownHouse`), `src/townname.cpp`, `src/table/town_land.h` (house specs), `src/table/townname.h` |
| industries | `src/industry_cmd.cpp` (`PlaceIndustry`, `IndustryTick`, `ChangeIndustryProduction`), `src/table/build_industry.h` (`_origin_industry_specs`, 37 industries), `src/table/industry_land.h` (tile layouts), `src/industrytype.h` |
| cargo | `src/cargotype.cpp` (`CargoSpec`), `src/table/cargo_const.h` (`_default_cargo`), `src/cargopacket.cpp` (`CargoPacket`, `CargoList`), `src/economy.cpp` (`GetTransportedGoodsIncome`, `CargoPayment`) |
| stations | `src/station_cmd.cpp` (`CmdBuildRailStation`, `CmdBuildRoadStop`, `CmdBuildDock`, `CmdBuildAirport`), `src/station.cpp`, `src/station_map.h`, `src/table/station_land.h` |
| rail / road | `src/rail_cmd.cpp`, `src/road_cmd.cpp`, `src/tunnelbridge_cmd.cpp`, `src/terraform_cmd.cpp`, `src/signal.cpp`, `src/pbs.cpp`, `src/rail_map.h`, `src/road_map.h`, `src/table/track_land.h`, `src/table/road_land.h`, `src/table/bridge_land.h` |
| trains / road vehicles | `src/train_cmd.cpp` (`TrainController`, `TrainAcceleration`, `UpdateTrainSpeed`, `AdvanceWagon`, `TrainEnterStation`), `src/ground_vehicle.cpp`, `src/roadveh_cmd.cpp` (`RoadVehicleController`), `src/vehicle.cpp` (`CallVehicleTicks`), `src/order_cmd.cpp`, `src/pathfinder/yapf/yapf_rail.cpp`, `yapf_road.cpp` |
| economy | `src/economy.cpp` (`EconomyLoop`, `StationRating`, `PayFinalDelivery`), `src/company_cmd.cpp` (loan, interest, finances), `src/engine.cpp` (`CalcEngineReliability`, purchase/running costs), `src/subsidy.cpp`, `src/linkgraph/` |
| UI | `src/window.cpp`, `src/widget.cpp`, `src/widgets/*`, `src/*_gui.cpp` (declarative `NWidgetPart` arrays), `src/gfx.cpp`, `src/gfx_layout.cpp`, `src/viewport.cpp`, `src/fontcache.cpp`, `src/lang/english.txt` (5,978 lines of texts), `src/table/sprites.h` (sprite IDs) |
| save / load | `src/saveload/*`, `docs/savegame_format.md` |
| network | `src/network/*`, `docs/desync.md`, `docs/multiplayer.md` |

### Data and defaults (the numbers the port must reproduce)

* 4 climates (`Temperate`, `Arctic`, `Tropic`, `Toyland`), default Temperate.
* Map side 64..4,096 tiles (`MIN_MAP_SIZE_BITS` 6, `MAX_MAP_SIZE_BITS` 12), default **256 × 256**
  (`game_creation.map_x/map_y` are log2, default 8), TerraGenesis Perlin with smoothness 0..3
  (default 1), default sea/lakes 0, start year **1950**.
* 1 day = **74 ticks** (`Ticks::DAY_TICKS`), 1 tick = **27 ms**, so a day is ≈ 1.998 s
  (`src/timer/timer_game_tick.h`, `src/gfx_type.h`).
* Difficulty defaults: towns **2** (normal), industry density **normal**, max loan **300,000**,
  initial interest **2 %**, town council tolerance 0.
* Vehicles: **256 engine types** — 116 rail (30 locomotives, 5 multiple units, 81 wagons; the rail
  block numbers 0–115), 88 road vehicles (116–203), 11 ships (204–214), 41 aircraft (215–255); the
  tables are `_orig_engine_info[256]`, `_orig_rail_vehicle_info[116]`, `_orig_road_vehicle_info[88]`,
  `_orig_ship_vehicle_info[11]`, `_orig_aircraft_vehicle_info[41]` in `src/table/engines.h`.
* Cargo: **27 cargo bit numbers** (`CT_PASSENGERS` … `CT_FIZZY_DRINKS`, 0..26), 31 names because
  grain/wheat/maize and valuables/gold/diamonds share a bit and oil/wood differ by climate
  (`src/table/cargo_const.h`). Payment uses `initial_payment`, `transit_periods[2]` and
  `GetTransportedGoodsIncome`; the full formula is in `src/economy.cpp` lines 965–1050.
* Default cargo distribution is **manual** for passengers, mail, armoured and the rest
  (`DT_MANUAL` in `src/table/settings/linkgraph_settings.ini`), so the link graph can wait.
* Network: up to **255 clients** in up to **15 companies** (`MAX_CLIENTS`, `MAX_COMPANIES`),
  deterministic command lockstep (`docs/desync.md`).

### The game loop and determinism

`StateGameLoop` (`src/openttd.cpp`) runs every 27 ms and does, in this order: animated tiles, the
calendar day proc, the economy timer, the tick timer, `RunTileLoop`, `CallVehicleTicks`,
`CallLandscapeTick` (towns/industries/trees), then `AI::GameLoop` and `Game::GameLoop`.
`CallVehicleTicks` first loads/unloads every station, then iterates the vehicle pool in index order
and calls each vehicle's `Tick()` (`src/vehicle.cpp`). The port must keep this order, the pool order,
the 32-bit integer semantics (wrapping, shifts, `GB`/`SB` bit helpers), and OpenTTD's `Randomizer`
(`src/core/random_func.hpp`) exactly; multiplayer lockstep and every oracle comparison depend on it.

## The base sets and their file formats

### OpenGFX (graphics)

Six NewGRF container-version-2 files: `ogfx1_base.grf` (2,693,610 B), `ogfxc_arctic.grf` (287,331),
`ogfxh_tropical.grf` (472,020), `ogfxt_toyland.grf` (622,079), `ogfxi_logos.grf` (249,673),
`ogfxe_extra.grf` (988,215), plus `opengfx.obg`. A quick parser of the container (the format is
`src/spriteloader/sprite_file.cpp` and `src/spriteloader/grf.cpp`) gives:

| GRF | Data entries | Sprite references | Special/recolour | Sprite-section entries | Distinct IDs |
| --- | ---: | ---: | ---: | ---: | ---: |
| `ogfx1_base.grf` | 4,793 | 4,758 | 35 | 4,855 | 4,758 |
| `ogfxc_arctic.grf` | 343 | 343 | 0 | 343 | 343 |
| `ogfxh_tropical.grf` | 558 | 558 | 0 | 558 | 558 |
| `ogfxt_toyland.grf` | 1,194 | 1,194 | 1 | 1,194 | 1,194 |
| `ogfxi_logos.grf` | 103 | 103 | 0 | 103 | 103 |
| `ogfxe_extra.grf` | 4,579 | 3,850 | 729 | 3,952 | 3,850 |

* Container v2: 2 zero bytes, the 8-byte signature `GRF\x82\r\n\x1a\n`, a 32-bit offset to the
  sprite section (relative to the position after that field), one compression byte (0), then the
  data section. Each data entry: 32-bit length, 1 type byte; type `0xFD` is a 4-byte reference to a
  sprite-section ID, `0xFF` is a special (recolour) sprite, otherwise 7 header bytes + sprite data
  and the sprite is inline (none in OpenGFX). The data section ends with a 32-bit zero.
* The sprite section: `id`, `length`, a colour/type byte, a zoom byte, then the payload. Colour byte
  `4` = 8bpp palette, `12` = palette + the chunked-row flag `0x08`; `68`/`76` carry the extra
  `0x40` flag that the decoder does not use. All OpenGFX sprites are 8bpp palette. Zoom 0 = normal,
  2 = 2×; a few GUI sprites have both.
* Global sprite IDs: the base GRF loads at 0 (0..4,792), logos at **4793**, `SPR_MAPGEN_BEGIN` is
  4845 and `SPR_MAPGEN_END` 4882 (the map-generation height sprites), OpenTTD's own `openttd.grf`
  loads at `SPR_OPENTTD_BASE` **4896** (192 sprites), then the base-set extra GRF
  (`ogfxe_extra.grf`) through the NewGRF loader (`src/gfxinit.cpp: LoadSpriteTables`).
* The palette is `src/table/palettes.h` (`_palette`, 256 entries, the DOS palette) with animated
  ranges (`_extra_palette_values`: water, lighthouse, oil refinery, fizzy drinks, glitter water).
  Company colours are applied through the original's recolour sprites (`PALETTE_TO_*` from
  `PALETTE_RECOLOUR_START` 775 in `src/table/sprites.h`), which map the company-colour pixels of a
  sprite to one of the 16 colours; the port must do the same or every company’s vehicles are the
  same colour.

The decoder (`DecodeSingleSprite` in `src/spriteloader/grf.cpp`) is a small RLE: a non-negative code
`n` copies `n` (0 means 128) literal bytes, a negative code copies `-(code >> 3)` bytes from
`offset = ((code & 7) << 8) | next byte` back. For the chunked flag (`type & 0x08`) the decoded data
starts with a per-row offset table, then the pixel rows.

OpenTTD's own extra graphics are in the source as `media/baseset/openttd.grf` plus its NFO/PNG
sources (`media/baseset/openttd/*.nfo`, `*.png`); they are GPL-2.0-only and are part of the port's
assets.

### OpenSFX (sounds)

`opensfx.cat` is a catalogue: a 32-bit header with bit 31 set and the sound count × 8, then per sound
a 32-bit offset (relative to the header) and a 32-bit size; each entry starts with a name-length byte,
the name, and a WAV (or raw 8-bit 11,025 Hz for the jackhammer) — `src/sound.cpp` lines 30–75 and
`src/soundloader_wav.cpp`. There are 73 sounds; `ORIGINAL_SAMPLE_COUNT` is 73. The port can extract
them at build time into individual audio files (or one audio sprite) and use Web Audio; the mixer is
`src/mixer.cpp` (channels, volume, pan, resampling).

### OpenMSX (music)

31 MIDI files and `openmsx.obm` (names and MD5s). Browsers have no MIDI device, so the port needs a
General MIDI software synthesiser (Web Audio) or a build-time render. The original's output depended
on the system's MIDI synth, so there is no single canonical rendering; this will be a listed
deviation either way.

### Fonts

OpenTTD ships four TrueType fonts (`media/baseset/OpenTTD-{Mono,Sans,Serif,Small}.ttf`, OpenTTD font
v0.7, GPL-2.0-only) and OpenGFX contains the original TTD sprite fonts (`SPR_ASCII_*` in
`src/table/sprites.h`). OpenTTD 15.3's default is the TTF; the sprite font is a setting. Browser text
rasterisation is not FreeType's, so pixel-identical text will need either the sprite font (exact, the
original TTD look) or a documented font-rasterisation deviation; decide when the first UI window is
ported.

## Testing against the original

The reference binary can be the official `openttd-15.3-linux-generic-amd64.tar.xz` (23,046,700 B,
SHA-256 `f49eb25d61b00f8f4d332fee02b530ad75552d1efb8f2bb01e7ca5e6540fe059`), downloaded on demand by
the stage-2 oracle script (not by `fetch.sh`; it is not needed for stage 1). It is authoritative
because it is built from exactly the pinned release.

Useful properties, verified in the source:

* `-G <seed>` sets the world-generation seed; `-g` starts a generated game immediately; `-D` runs a
  dedicated server (console on stdin); `-c <file>` picks a config; `-x` never writes the config.
* Console commands (`src/console_cmds.cpp`): `setting` / `setting_newgame` (map size, climate,
  smoothness, …), `newgame [seed]`, `getseed`, `getdate`, `pause`, `save <file>`,
  `screenshot [viewport|normal|big|giant|heightmap|minimap] [size W H] [file]`.
* `screenshot heightmap` writes one pixel per tile with the tile height — a direct oracle for the
  map generator; `screenshot minimap` writes one pixel per tile with the owner/land colour;
  `screenshot giant` renders the whole map with the real sprites; `screenshot normal size W H` gives
  a viewport at a chosen size. The screenshot needs a screenshot provider, which the `null` blitter
  does not have (`src/blitter/null.cpp`), so run the graphical build under **Xvfb** (as the FreeCol
  oracle does) rather than `-D` + `-v null`.
* `save` writes a 15.3 savegame. `docs/savegame_format.md` describes the outer container (`OTTN`,
  `OTTZ`, `OTTX`), the big-endian data, the chunk table (the map chunks `MAPT`, `MAPH`, `MAPS`,
  `MAP2`, `MAP5`, `MAP7`, `MAP8`, `MAPE`, `MAPO`; then `CITY` for towns, `INDY` for industries,
  `CAPA` for cargo packets, `VEHS`, `STNN`/`STNS` for stations, `PLYR` for companies, `ENGN`/`ENGS`
  for engines, …) and the version fields (the savegame version in the outer header, the `SLV_*`
  constants in `src/saveload/saveload.h`). A
  reader for the chunks the tests need is part of stage 2; writing the original format comes with
  the save/load stage, so a save made by the port can be opened by the original and vice versa.
* For commands no console command can issue (build a station, buy a vehicle, run 10,000 ticks), use
  a **small oracle harness** built from the 15.3 source, in the spirit of FreeCol's
  `re/freecol/oracle`: load a map from a seed, run a fixed command script through `DoCommand`, step
  the loop a fixed number of ticks, and write a canonical JSON/text dump of the state. The harness
  is a patch on the original, kept in `re/openttd/oracle/`; the release binary stays the reference for
  the unpatched behaviour.

Test strategy (no faked tests: every expected value comes from the original, and every test names
where it comes from):

1. **Map generation**: for a matrix of seeds (e.g. 1, 2, 12345) × climates × sizes (64, 256, 1024) ×
   smoothness (0..3), compare the port's height array and tile types with the original's
   `heightmap` screenshot and/or `MAPH`/`MAPT` save chunks, byte for byte. The heightmap PNG is
   deterministic and does not depend on fonts or rendering.
2. **Sprites**: the asset tool's output is checked against the GRF (sprite count, a table of
   `(id, width, height, xoff, yoff, sha256 of the palette indices)` for a few hundred sprites). The
   renderer is checked by drawing a fixed map/viewport and comparing with `screenshot giant` /
   `screenshot normal` (allowing only documented differences such as font rasterisation).
3. **World state**: a canonical dump (tiles, towns, industries, stations, vehicles, cargo, company
   money) after N ticks from the oracle harness vs the port, for scripted scenarios.
4. **Tick order and RNG**: a unit test that reproduces OpenTTD's `Randomizer` sequence and a set of
   `RandomRange`/`Chance` results from the original.
5. **Mutation checks** (the FreeCol precedent): change one number in the port (one RNG draw, one
   height scale, one cargo rate) and make sure a test fails; a test suite that cannot fail is not a
   test.

## The port: architecture and plan

### Decisions

* **TypeScript, hand-written, native.** No emulator and no WASM build of the C++ (porting rule 2). The
  C++ source is the specification; the port is a translation and stays GPL-2.0-only.
* **Simulation separate from presentation.** `src/sim/` has no DOM and no browser APIs; it runs in
  node for tests and in a Web Worker in the page for map generation and long ticks if the main
  thread needs it. `src/render/` and `src/ui/` use the sim's state only.
* **Fixed 27 ms game ticks**, 74 ticks/day, the original's loop order and pool order, 32-bit integer
  semantics and OpenTTD's `Randomizer`. This is what makes the oracle comparisons and online lockstep
  possible.
* **Renderer: WebGL2 palette renderer** — 8bpp sprite atlases (one byte per pixel, exactly the GRF's
  palette indices) plus a 256-entry palette texture, a company-colour remap table and the animated
  palette ranges, so recolouring and palette animation remain exact and cheap. A software path
  produces PNGs with the same draw commands for node tests. `PixelScreen`-style scaling for the
  original's zoom levels (normal, 2×, 4× out).
* **Assets built at build time**, not decoded in the browser: a Python/Node tool reads the six
  OpenGFX GRFs, `openttd.grf` and its NFO/PNG sources, extracts every sprite into a few indexed-PNG
  atlases and writes `sprites.json` (id, atlas, rect, xoff, yoff, zoom, flags); a second tool
  extracts the 73 OpenSFX WAVs and the MIDI files. The sources are `orig/`; the built assets are
  committed (like Endless Sky's and FreeCol's), with `assets/licenses.json` for the per-file
  provenance.
* **Strings and UI layouts generated from the original**: `src/lang/english.txt` (strgen format) →
  JSON; the declarative `NWidgetPart` arrays of `src/*_gui.cpp` → JSON with a small parser, so the
  window sizes, fills and widget order are the original's numbers instead of hand-copied ones. The
  widget/window runtime mirrors `src/widget.cpp`/`src/window.cpp`.
* **Online: deterministic lockstep** in the site's rooms, the model `docs/SERVER.md` recommends for
  this kind of game. Every client runs the same simulation from `RoomStarted.seed`; the server
  module maps seats to companies, relays `Command` messages in `seq` order, and clients compare
  state hashes at fixed tick intervals (OpenTTD's own desync model, `docs/desync.md`). The module
  enforces turn-free command ordering and the limits; it does not run the game.
* **Saves: the original 15.3 savegame format.** Start with a reader for the chunks the tests and the
  game need (map, towns, industries, stations, vehicles, companies), use it in the oracle tests,
  and later write the same format so the original can load the port's saves. The account storage
  limits (64 files × 512 KiB, 4 MiB) are enough for a 256×256 game; a 4,096×4,096 save is far
  larger — the port must either compress with the savegame's own zlib container or document the
  size limit of the site.

### The next stages, in order

**Stage 2 — assets, RNG, map generation, first pixels (the next run).**

1. `re/openttd/tools/grf.py`: container-v2 parser, RLE decoder, palette conversion, and the
   `ActionA`/`Action5` subset needed for `openttd.grf` and `ogfxe_extra.grf`; outputs
   `web/games/openttd/assets/sprites/*.png` + `sprites.json` + `assets/licenses.json`. Check counts
   and hashes against the source (see the table above).
2. `web/games/openttd/src/sim/`: `random.ts` (OpenTTD `Randomizer`), `int.ts` (`GB`, `SB`,
   `ClampTo`, wrapping), `tile.ts` (`TileIndex`, the 8-byte tile, map dimensions, `TileXY`),
   `settings.ts` (the defaults above), `date.ts` (`TimerGameCalendar`, 74 ticks/day).
3. `src/sim/tgp.ts` + `landscape.ts`: `GenerateTerrainPerlin` with its height map, frequencies,
   amplitudes, water level, slope fixing, climate masks, snowline/desert; then `RunTileLoop`’s static
   parts and trees.
4. `src/render/palette.ts` + `src/render/tile.ts`: WebGL2 palette renderer with the 8bpp atlas, the
   original’s tile draw order (`src/tile_map.h`/`src/landscape.cpp` draw rules), zoom levels, the
   software backend for node.
5. `test/mapgen.test.ts` and `test/sprites.test.ts` with the oracle: fetch the release binary,
   generate the heightmap screenshots under Xvfb, compare with the port. `npm test` passes and the
   mutation check fails as it should.
6. A minimal page: `start(host, ctx)` with a canvas that shows the generated map and scrolls/zooms;
   no gameplay yet. `game.json` stays `listed: false` until it is playable.

**Stage 3 — towns, industries, cargo, stations, construction.**

Towns and names (`town_cmd.cpp`, `townname.cpp`, `town_land.h`), industries and production
(`industry_cmd.cpp`, `build_industry.h`, `industry_land.h`), the 27 cargo types and `CargoPacket`
(`cargo_const.h`, `cargopacket.cpp`), station building and catchment (`station_cmd.cpp`), rail/road/
tunnels/bridges/terraform and signals (`rail_cmd.cpp`, `road_cmd.cpp`, `tunnelbridge_cmd.cpp`,
`terraform_cmd.cpp`, `signal.cpp`). UI: the main toolbar, build toolbars and the tile query window,
so a player can build a line. Oracle: scripted `DoCommand` runs in the harness, compare tile bytes,
costs and the town/industry/cargo state.

**Stage 4 — trains, road vehicles, orders, economy.**

`TrainController` and `GroundVehicle` physics (`train_cmd.cpp`, `ground_vehicle.cpp`), road vehicles
(`roadveh_cmd.cpp`), orders (`order_cmd.cpp`), YAPF rail/road pathfinding, station load/unload and
the income formula (`economy.cpp`), company finances/loan/interest (`company_cmd.cpp`), engine
purchase and running costs/reliability (`engine.cpp`), town growth, subsidies (later). UI: depot,
buy-vehicle, vehicle details/orders, station and company windows. Oracle: tick-by-tick state dumps;
that is where the 1:1 claim is really tested.

**Stage 5 — the rest of the game.**

Ships, aircraft and airports; the remaining windows and lists (finances, graphs, news, town
directory, industry directory, small map, subsidies, disasters); the sound mixer and the MIDI synth;
the original save format complete (read and write, round-trip against the native binary); the intro
and main menus. If NewGRF support is wanted, it is its own stage (the loader is ~17k lines); the
base game does not need it. AIs and GameScripts (Squirrel, ~14k lines) are optional content and can
be a later stage; the port must say so in `README.md` until they exist.

**Stage 6 — online.**

`protocol/games/openttd.capnp` (commands, state hashes, room options), the server module (seats =
companies, command relay in `seq` order, seed, desync stop, drop-in by sending a savegame in
chunks), and the SDK lobby room. Tests: two node clients with the same seed and command stream stay
in sync; a modified client is caught by the hash; the module's loopback tests (`docs/SERVER.md`).

### Scope and honest limits

The original ships no NewGRF, AI or GameScript with the base game; the port targets the base game +
OpenGFX/OpenSFX/OpenMSX first. Everything optional is named in `README.md` as missing until it is
ported. The first playable milestone is the vertical slice of stages 3–4 on Temperate 256×256, with
rail and road; the other climates, ships/aircraft, the full UI and online follow. No test may claim
a feature the port does not have, and no expected value may be invented: every one comes from the
pinned source or from a run of the pinned binary.

## Stage 1 status

Done: the reference above is pinned and fetched; the licence check is complete and written; the
source/data layout, formats, counts and defaults are recorded; the plan is written. Not done (on
purpose): no port code, no assets, no tests, no `src/index.ts`, no screenshots, no favicon, no server
schema or module, and nothing merged or pushed. `web/games/openttd/game.json` is `listed: false` so
the incomplete game is not on the site; its `screenshots` is empty and it has no `added` date — both
belong to the ticket that makes the game playable.

## Stage 2 (2026-11-23): graphics, Randomizer, TerraGenesis, first page

The reference binary and data are the stage-1 ones. Everything below is checked against them.

### Graphics extraction

`re/openttd/tools/grf.mjs` reads the container-v2 format (`src/spriteloader/sprite_file.cpp`,
`grf.cpp`): the header and sprite section, the data section's `0xFD` sprite references, `0xFF`
recolour sprites, the RLE decoder and the chunked-row transparency encoding. It evaluates the
Action 5, 8, 1, 12 and 0x0A subset that `openttd.grf` and OpenGFX's `ogfxe_extra.grf` use
(`src/newgrf/newgrf_act5.cpp`, `acta.cpp`, `act1.cpp`, `act12.cpp`), including the special
ten-sprite shore block. After the extra GRFs it applies `ActivateOldShore`
(`src/newgrf.cpp`), which duplicates the old shore sprites into `SPR_SHORE_BASE`; without it
the coast sprites 5937–5948 would be missing.

The output (`web/games/openttd/assets/sprites/`) is 8,102 unique 8bpp sprite variants
(11,107,545 pixels) in three 2048×2048 index atlases, with `sprites.json` (rectangles, offsets,
zoom, atlas) and `manifest.json` (source SHA-256, counts, atlas hashes). Every climate is
built (Temperate, Arctic, Tropic, Toyland); the page uses Temperate. The DOS palette and its
28 animated entries are `assets/palette.json` (parsed by `palette.mjs` from
`src/table/palettes.h` and `src/palette.cpp`).

Counts checked by `test/sprites.test.ts`: OpenGFX base 4,793 data entries = 4,758 images + 35
recolours; logos 103; Arctic 343, Tropic 558, Toyland 1,195 entries (1,194 images + 1 recolour);
`openttd.grf` 1,018 images + 257 recolours; `ogfxe_extra.grf` 1,166 images + 257 recolours;
292 recolour tables; each final climate table has 6,189 ids. When `orig/` is present the test
also decodes sprites again and compares their pixels with the atlases.

### Core semantics

`src/sim/random.ts` is `Randomizer::Next`/`SetSeed` and `ScaleToLimit` (64-bit multiply),
checked against `re/openttd/tools/rng-probe.c` compiled with gcc for seeds 0, 1, 12345 and
0xDEADBEEF. `src/sim/date.ts` is `CalendarConvertYMDToDate`, `CalendarConvertDateToYMD`,
`DateAtStartOfYear`, leap years, 74 ticks/day and the 27 ms tick (tested against the
proleptic Gregorian calendar; 1 Jan 1950 = date 712223).

### TerraGenesis and the landscape

`src/sim/tgp.ts` translates `src/tgp.cpp`: the 10 frequency levels, the four smoothness
amplitude rows and extrapolation, `RandomHeight`, interpolation, min/max/mean, the sine
redistribution for all four climates, water-level selection, Perlin coastlines, coast and slope
smoothing, and the optional curve maps. `int_noise` uses BigInt because the reference is a
64-bit Linux `long`; the C probe with `-fno-strict-overflow` matches the JavaScript for the
actual parameters. The coastline uses the original's **integer** `size_y / 2` and `size_y / 3`
(the first version used floating division and was off by one on some coasts).

`src/sim/landscape.ts` and `world.ts` translate `InitializeLandscape` (including the south and
east void border), `TgenSetTileHeight`/the height transfer (void border heights are
overwritten), `FixSlopes` (with its `RandomRange(map_height_limit)` rock chance), the water
conversion and `GenerateClearTile`. `worldgen.ts` follows `_GenerateWorld`: seed `Random()` with
the generation seed, draw `_economy.fluct = GB(Random(), 0, 8) + 168` in `StartupEconomy`,
then generate the landscape.

The oracle is the official 15.3 Linux binary (`fetch-binary.sh`). `oracle.mjs` starts the
dedicated server, waits for the console and the start-up map, then issues `newgame <seed>`,
`save` and `quit`; the savegame is uncompressed and `save.mjs` reads its `MAPT`/`MAPH`
CH_RIFF chunks. The fixtures for seeds 1, 2 and 12345
(`web/games/openttd/test/fixtures/`) use 256×256, temperate, terrain type 1, smoothness 1,
variety 0, sea/lakes 0, rivers 0, trees none, industry fund-only and custom towns 0 (the
minimum, one town). Towns, industries, objects and trees are not ported; their native tiles and
terraforming within four tiles are masked (computed from the native tile types, never from the
port). Every remaining tile's height, type, ground byte `m5` and owner/water byte `m1` matches byte
for byte: 63k+ tiles per seed, zero differences. All map heights outside those masks match too.

### Renderer and page

`src/render/renderer.ts` is WebGL2: one R8 texel per GRF pixel in a `TEXTURE_2D_ARRAY` (three
layers), a 256×1 RGBA palette texture and a 256×1 R8 remap texture, with `texelFetch` (no
filtering); index 0 is transparent. `palette.ts` fills the 28 animated entries with the original
`DoPaletteAnimations` formulas. `scene.ts` selects ground sprites per
`DrawTile_Clear`/`DrawTile_Water`/`DrawShoreTile` and the 19-sprite slope offsets.
`game.ts` draws ground sprites back-to-front (`x+y`, then `x`), supports drag/arrow scrolling,
five zoom levels (out 8×/4×/2×, normal, 2× in; 2× GRF variants are used when present), `N` for a
new random seed and `Home`, and shows the seed, map size, date and zoom. `src/index.ts` starts it
from the site's Play button; stopping removes the canvas, GL context, listeners and style.

Screenshots of the running port are in `web/games/openttd/screenshots/` (normal-zoom coast,
zoomed-out island, rolling hills, the whole map with rivers). `game.json` is still `listed: false`: the landscape viewer is
not the game yet.

### What stage 2 does not have

Towns and town growth, industries and production, trees, objects (lighthouses/transmitters),
rivers, stations, rail/road construction, trains/road vehicles/ships/aircraft, orders and
pathfinding, the economy, the game UI, savegames, NewGRFs, AIs/GameScripts, sound and music,
and online play. Rivers are refused explicitly for now (`amountOfRivers != 0` throws); the page
generates with rivers 0 and trees none. The renderer draws ground sprites only, so there is no
multi-tile-object sorting yet; the 2× zoom uses the GRF's 2× sprite when available and scales
the normal sprite otherwise. Only Temperate/variety 0/rivers 0 has oracle fixtures; the other
climates' sprite replacements are built but not map-tested, and the variety curve maps are
implemented from the source but not oracle-tested. A pixel comparison with a native screenshot
is not in the tests because the released binary has no screenshot provider without a video
backend here. These are the subjects of stages 3–6.

## Stage 3a (2026-11-24): the landscape is complete

The landscape now matches the original for every climate, all variety levels and rivers 1–3.
The remaining stage-3 work (trees, objects, towns, industries, stations, vehicles, economy) is
listed at the end.

### Climate post-processing and the tile loop

`src/sim/landscape.ts` adds `CalculateCoverageLine`, `CalculateSnowLine`, `CalculateDesertLine`,
`CreateDesertOrRainForest` and the tile loop's clear/water handlers (`TileLoop_Clear`,
`TileLoopClearAlps`, `TileLoopClearDesert`, `TileLoop_Water`). Two details that are easy to get
wrong:

* `_make_desert_or_rainforest_data` (`src/table/genland.h`) is not only the 11×11 square: it
  also has 28 tiles at distance six (`(±6,−3..3)`, `(−3..3,±6)`). Without them 800+ extra tiles
  become desert.
* `TileLoop_Water` does not mean "any tile of type water": `IsWaterTile` is
  `IsTileType(MP_WATER) && GetWaterTileType(t) == Clear`, so **coast tiles are not water** for
  the river and flooding code. Flooding is a state machine (`FLOOD_ACTIVE`, `FLOOD_DRYUP`,
  `FLOOD_NONE`): single-corner coasts and sea flood neighbours; multi-corner coasts dry up when
  no active/flooding neighbour remains. `m3` bit 0 is the non-flooding marker and is cleared
  around every cleared tile.

The tile loop runs 0x500 times after all generation, with `TimerGameTick::counter` starting at
zero: during generation every call also processes tile 0, and the LFSR skips it. The port keeps
the same runner state across the climate and river loops.

### Rivers

`src/sim/rivers.ts` translates `FindSpring`, `FlowRiver`, `TryMakeRiverTerminus`, `MakeLake`,
`MakeWetlands`, `CreateRivers`, `RiverMakeWider` (`src/landscape.cpp`),
`MakeRiverAndModifyDesertZoneAround` (`src/water_cmd.cpp`), the river builder
(`src/pathfinder/yapf/yapf_river_builder.cpp`) and its A* base and binary heap
(`src/pathfinder/yapf/yapf_base.hpp`, `src/misc/binaryheap.hpp`). The river builder's cost
includes `RandomRange(river_route_random)`, so every explored node consumes a game RNG draw;
the node expansion order, the open/closed map updates and the heap's tie handling are part of
the world and are reproduced exactly. The port uses a dedicated `NodeHeap` with the original
1-based array and strict `<` on `estimate`.

Terraforming is `CmdTerraformLand` (`src/terraform_cmd.cpp`) restricted to the empty generated
map: corner raise/lower, neighbour recursion, dirty tiles, the clear-tile pass, and applying the
new north-corner heights at the end. The command clears every dirty water/clear tile
(`DoClearSquare`) before the heights change, which is what lets a river cut through a coast.

`CountConnectedSeaTiles` stores its tiles in a `std::unordered_set<TileIndex>` and the
"small sea" path flattens them in container iteration order. libstdc++'s iteration order is not
insertion order (bucket array, head insertion, prime bucket counts, rehash prepending bucket
segments), so `rivers.ts` contains `TileUnorderedSet`, a faithful model of that hashtable. This
was not cosmetic: on seed 12345 the first big sea has 596 tiles and the order decides the shape
of the land left behind.

One native detail worth recording: with `tree_placer = none` the generator still produces no
trees, but the dedicated server ticks the game for a moment before `save`; `OnTick_Trees` can
plant a tree and `PlantTreesOnTile` clears the non-flooding bit of neighbouring water tiles.
Fixtures therefore set `construction.extra_tree_placement = 3` (no growth, no spread), so the
saved map is exactly the generated one.

### Oracle with selectable stages

`re/openttd/oracle/stages.patch` adds `OTTD_ORACLE_STAGES` to `_GenerateWorld` so the native
binary can generate landscape-only maps, and then add towns, industries, objects or trees one
at a time. `re/openttd/oracle/README.md` has the build and fixture commands. The fixtures are
generated with this binary; `re/openttd/tools/fixture.mjs` turns a savegame into the base64
arrays under `web/games/openttd/test/fixtures/`.

### Tested

* Four climates × seeds 1 and 12345 × rivers 2: every tile's height, type (including the tropic
  zone), `m1`, `m3`, `m4` and `m5` matches the native map exactly, no masks.
* Temperate seed 2 × rivers 3, and the earlier stage-2 seeds with rivers 0.
* Variety 1, 2 and 3 at seeds 1 and 12345 (temperate) were compared when the fround fix was
  made; the repository keeps the stage-2 fixtures and the three river fixtures.
* The stage-2 fixtures still pass with the completed tile loop and clear-tile order.
* `npx tsc --noEmit`, `npm run build` and the full OpenTTD test file set pass; the page builds
  with rivers 2 and was played in Chromium (scroll, zoom, new seed, replay).

### What stage 3 still needs

Trees and objects (generation and drawing), towns and town names, industries and cargo tables,
stations and construction, rail/road vehicles and pathfinding, the economy and savegames. The
map page still sets `tree_placer = none`; town/industry/object/tree tiles of the older full-map
fixtures remain masked until those generators are ported.

## Stage 3b (2026-11-24): trees

`src/sim/trees.ts` translates `GenerateTrees`, `PlaceTreeGroups` (the
star-shaped float polygons), `PlaceTreesRandomly`, `PlaceTreeAtSameHeight`,
`PlantTreesOnTile`, `MakeTree` and `TileLoop_Trees` from `src/tree_cmd.cpp` /
`src/tree_map.h`. Both placers are implemented; the page uses the configured
default (improved). The original tree sprite tables are generated by
`re/openttd/tools/tree-table.mjs` into `src/render/treetable.ts`, and
`src/render/tree.ts` follows `DrawTile_Trees`'s sprite index, ground variants,
count/growth selection and in-tile draw order.

Things the comparison exposed:

* `GenerateTrees` itself leaves the same RNG state as the native generator.
  The two draws between it and the first 0x500 tile-loop tick are
  `StartupEngines`' engine-aging seed and `StartupDisasters`'
  `ResetDisasterDelay`; without them every tree-growth decision is off.
* `IsWaterTile` excluding coasts matters for trees too: trees are planted on
  coasts, and a shore tree is `TREE_GROUND_SHORE` (water class Sea) rather
  than water. Flooding a tree sets shore ground; drying it up sets grass
  ground while keeping the tree.
* The savegame's `MAP2` chunk is big-endian (SLE_UINT16); the fixture builder
  stores it as-is and the test decodes big-endian.
* The oracle config uses `extra_tree_placement = 3`. With the default 2 the
  server ticks the game between generation and save and a few trees grow or
  spread, so the fixture would not be the pure generator output.

Tested: temperate and tropic tree maps at seed 12345, every tile's height,
type, `m1`, `m2`, `m3`, `m4` and `m5`, plus temperate seed 12345 with two
rivers and trees together; all byte-identical. The page renders them in
Chromium (normal and 0.125× zoom, screenshots `trees.png`).

Still missing for stage 3: objects, towns/names, industries/cargo, stations,
construction, vehicles, economy, UI, savegames. The renderer uses all ground
first, then trees in tile order, instead of the original's full sprite sorter.

## Stage 5a (2026-11-24): a deterministic selectable scenario

The page builds one fixed scenario on the start seed's generated map. A
search from the map centre finds verified flat, clear footprints: a 5×5 town
site, a 3×2 coal mine and a 4×2 power station at least ten tiles apart. The
town is drawn with `SPR_BUILD_TOWNHOUSE_06_V1` (1446) and `SPR_ROAD_X`
(1333), the industries with the original industry sprites 2050 and
`SPR_IT_POWER_PLANT_TRANSFORMERS` (2054). Each industry is one sprite at its
north tile, sorted with the anchor tile in the back-to-front pass; the full
multi-tile layout generator is deliberately not used.

The data is original, not invented:

* Coal cargo: `MK(1, CT_COAL, ..., weight 16, mult 0x100, initial_payment
  5916, transit periods 7/255)` in `src/table/cargo_const.h`.
* Coal Mine: `MI(_tile_table_coal_mine, ..., CT_COAL, 15, ...)` in
  `src/table/build_industry.h`.
* Power Station: `MI(_tile_table_power_station, ..., CT_COAL, 256, ...)`;
  the coal-accepting tile is `MT(1, CT_PASSENGERS, 8, CT_COAL, ...)` in
  `_origin_industry_tile_specs`.
* Name parts: `_name_original_english_2[1]` + `_3[0]` + `_4[0]` + `_5[3]`
  = "B" + "ar" + "n" + "ton" = Barton (`src/table/townname.h`).

Clicking a town or industry footprint shows a panel with its name and data.
The scenario is optional: a random landscape without a large flat area keeps
the landscape viewer and simply has no scenario.

Tests: `test/scenario.test.ts` checks determinism, flat/clear footprints,
town/industry/cargo values, sprite IDs and their presence in the atlas, and
selection. Browser: clicked Barton and the coal mine in Chromium and captured
`screenshots/scenario-town.png` and `scenario-overview.png`.

Next: 5b, road construction and two truck stops.

## Stage 5b (2026-11-24): road and truck-stop construction

`src/construction.ts` adds road and truck-stop occupancy, building and
demolition with the original price bases (`src/table/pricebase.h`):
PR_BUILD_ROAD 95, PR_CLEAR_ROAD 40, PR_BUILD_STATION_TRUCK 200,
PR_CLEAR_STATION_TRUCK 50. The player starts with £100,000 (the original
starting loan). Roads require flat clear land; houses, industry footprints,
water, slopes, trees and stops are occupied. 5a town roads are town-owned:
free to connect to, not demolishable. Truck stops are 1×1, require an
adjacent road, use `SPR_TRUCK_STOP_{NE,SE,SW,NW}_GROUND` (2708–2711) plus the
matching building sprites 2712–2715, and are selectable with orientation and
a four-tile catchment label.

The road tool drags an L-shaped run (x first, then y), charging each new tile;
existing roads cost 0. Demolition charges the clear price. The toolbar shows
Road / Truck stop / Demolish, the balance and the last action's cost or error.

Tests: `test/construction.test.ts` covers prices, road cost/occupancy,
flat-land rules, stop placement and orientation, line building, demolition
and town-road freedom. Browser: built the road from Barton to the coal mine
(£665), placed two stops (£400), demolished and rebuilt one road tile
(£40 + £95), verified the balance and selected a stop. Screenshots:
`scenario-road.png`, `scenario-stop-panel.png`.

Next: 5c, buy a coal truck, A→B orders, pathfinding, loading/unloading,
payment and money changes.

## Stage 5c (2026-11-24): the earning coal truck

`src/vehicles.ts` adds the Balogh Coal Truck with the original engine data
(ROV image index 1 = 0xCDC, cost factor 108, running 90, speed 96, capacity
20, src/table/engines.h). Purchase = 14000*108>>8 = £5,906 and running =
1600*90>>8 = £562/year (src/table/pricebase.h). Payment uses the fast branch
of GetTransportedGoodsIncome: dist*255*units*5916>>21; the 5-tile mine→power
route pays £71 for 20 t.

The truck is bought from a truck-stop panel, orders are set by clicking the
truck and then two stops (clear button in the panel), pathfinding is a
four-directional BFS over roads/stops, movement uses a linear acceleration
approximation up to 96 km/h, and it repeats A→B→A. The mine stop has 20 t of
initial coal and produces 15/month; its four-tile catchment rating scales the
available coal, and the power station only accepts coal from a stop in its
catchment. Running costs are charged per game day while moving.

To make the first route actually buildable, the deterministic scenario's
power station is now placed at least six tiles from the coal mine with a
flat, clear L-shaped corridor; on seed 12345 it is at (124,133), the coal
mine at (127,127). The 5c route is the four road tiles (126,129)…(126,132),
with stops at (126,128) and (125,132): road £380, stops £400, truck £5,906,
delivery £71, running about £8 over the first trip.

Tests: `test/vehicles.test.ts` covers prices/payment, four-way pathfinding,
catchment, purchase/order/load/deliver/return and the balance equation.
Browser: built the route, bought the truck, set orders, waited for delivery:
balance £93,313.74 → £93,376.74, revenue £71, running £8.26, profit £63,
trips 1. Screenshots `truck-loaded.png`, `truck-delivered.png`.

Next: 5d, save/load in ctx.storage, then listing with `listed: true`.

## Stage 5d (2026-11-24): saves and listing

`game.ts` writes a versioned JSON save to `ctx.storage` (`openttd-save.json`)
with the seed, camera, `ConstructionSave` (money, roads, stops) and
`FleetSave` (time, stock, revenue/running totals, trucks with path, position,
orders, cargo, dwell, trips). Load rebuilds the same seed's world and
restores both. Missing saves and malformed JSON are caught and reported in
the toolbar status; the current game is not replaced. Save also runs on
`pagehide` and in `destroy()`. `test/save.test.ts` round-trips the exact JSON
and then ticks both copies to verify they remain identical.

The game is listed with `"listed": true` and `"added": "2026-11-24"`. Fresh
screenshots from `node scripts/screenshots.mjs openttd` are `scenario-town.png`,
`road-stops.png`, `truck-loaded.png` and `finance.png`. The screenshot driver
passes `?debug` for OpenTTD so the game object can provide tile coordinates;
all actions in the steps still use the real toolbar/panel.

Playable scope: one generated seed, simplified deterministic town/industry
placement, L-shaped road building, two truck stops, one Balogh Coal Truck,
A→B orders, four-directional pathfinding, coal loading/payment and running
costs, save/load. Not included: other vehicles/industries/towns, rail, depots,
signals, town growth, the full economy, online, sound/music, or the complete
OpenTTD simulation.
