# SuperTux 0.6.3 — reverse-engineering notes

Reference: **SuperTux 0.6.3**, released 2021-12-22, tag `v0.6.3`
(<https://github.com/SuperTux/supertux/releases/tag/v0.6.3>), archive
`SuperTux-v0.6.3-Source.tar.gz`, 182,065,428 bytes, sha256
`f7940e6009c40226eb34ebab8ffb0e3a894892d891a07b35d0e5762dd41c79f6`. The archive contains the C++
source and the complete `data/` tree (Icy Island, graphics, music, sounds, fonts). `fetch.sh`
downloads and verifies it; `tools/build-assets.py` copies the used files unchanged.

The source is the reference, so REA was not needed: the original was compiled and run headless
instead (see `oracle/`), which is stronger evidence than reading disassembly. The only question that
remained — whether the local build behaves like the release — was answered by using the release's own
data and source version (the archive is the release).

## Timing

* `src/supertux/constants.hpp`: `LOGICAL_FPS = 64`.
* `ScreenManager` (`src/supertux/screen_manager.cpp`) computes
  `ms_per_step = (Uint32)(1000.0f / LOGICAL_FPS)`, i.e. **15 ms**, and
  `seconds_per_step = 15/1000 = 0.015`. The port uses exactly this step, not 1/64 s.
* Physics is semi-implicit Euler (`src/supertux/physic.cpp`): gravity `10 * 100 = 1000 px/s²`, then
  `v += a*dt`, `pos += v*dt`; `Player::update` sets the movement and the collision system moves the body.

## Player (`src/object/player.cpp`)

Constants and rules that are reproduced:

* collision box `TUX_WIDTH 31.8`, small `30.8`, big `62.8`, ducked `31.8`, running width `34`;
* walk acceleration `300`, run `400`, skid `200` for `0.3 s`, walk/run maxima `230/320`, WALK_SPEED
  `100`, overspeed deceleration `100`, friction `1.5` (ice `0.1`), ice acceleration `0.25`;
* jumps `-520` (walk), `-580` (run), duck jump `-300`, backflip `-580`/`-720`, jump grace `0.25 s`,
  coyote time `0.1 s`, early apex multiplier `3`;
* damage: `1.8 s` safe time, `14 s` invincibility, `0.25 s` unduck-hurt, dying `3 s`;
* `handle_input` order: swimming/water jump, horizontal acceleration, vertical jump, action (fire/ice),
  duck/standup, then movement;
* wall-jump uses tiles with the `WALLJUMP` attribute and `MAX_WALLCLING_YM = 64`;
* water: the swim box is the bbox with its bottom raised 16 px; entering water plays `splash.wav`,
  changes big Tux's height to 32 and the swim acceleration uses a 600 target with the original drag.

## Collision (`src/collision/`)

The port translates `check_collisions`, `Constraints`, `set_rectangle_rectangle_constraints`,
`rectangle_aatriangle`, `CollisionSystem::collision_tilemap`, `collision_tile_attributes` and the
two-pass `collision_static_constrains` (vertical pass then horizontal pass, `EPSILON 0.002`,
`SHIFT_DELTA 7`). Unisolid tiles use `Tile::check_movement_unisolid`/`check_position_unisolid`;
AATriangle slope data is `data & 0x73` (direction 0–3, deform 0x10–0x40) and `vertical_flip` is
`3 - direction` with the deform bottom/top swap.

The port's own `journey_begins` trace agrees with the original to ≤0.1 px over 640 steps (walk, stop,
duck, jump, stomp a snowball); the remaining difference is the original's object-collision push-out,
which the port approximates with the same `EPSILON` snap.

## Camera (`src/object/camera.cpp`)

Default config: `xmode 4`, `ymode 3`, `edge_x 0.4`, `kirby_rectsize_y 0.34`, `clamp_x 0.1666`,
`clamp_y 0.3`, `max_speed_x/y 100`, `dynamic_speed_sm 0.8`. The port follows the normal-mode
look-ahead and kirby-rectangle rules and clamps to the sector.

## Objects and scripts

* Badguy activation: within 1280×800 of the player or camera (`X_OFFSCREEN_DISTANCE`,
  `Y_OFFSCREEN_DISTANCE`).
* Walking badguys use `walk_speed` acceleration, turn at walls, `max_drop_height`; the values are in
  each `src/badguy/*.cpp` (`SnowBall 80`, `Snowman 40`, `CaptainSnowball 100/200`, `Spiky 80`, …).
* Mr Ice Block: stomp → flat 2 s → waking; a running Tux kicks it at 500 px/s, it bounces with
  `-0.975`; Mr Bomb spawns a Bomb with a 1.1 s fuse; Snowman loses its head as a Snowball.
* Scripts: Icy Island's levels use only a small part of the Squirrel API. The port interprets
  `wait`, `Tux.activate/deactivate/walk/do_jump/do_duck/do_standup/do_backflip/set_dir/set_pos/
  add_bonus`, `X.goto_node/start_moving/stop_moving`, `Level.finish/spawn`, `play_sound`,
  `play_music`, `Text.set_text`, `Camera.scroll_to` and ignores the lighting/effect calls. The `.nut`
  story files are not interpreted; their levels are cutscenes, not playable levels.

## Data licences

See `web/games/supertux/LICENSE.md` for the file-by-file table. Summary: code GPL-3.0+; levels
GPL-2.0+/CC-BY-SA-3.0, four files CC-BY-SA-4.0; images GPL-3.0+ with a few dual/CC-BY files; music
GPL-2.0+; sounds GPL/CC0/CC-BY; `splash.ogg` excluded (CC-BY-SA-3.0 only). No NC or ND asset is used.
