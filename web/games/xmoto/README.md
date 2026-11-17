# X-Moto (port)

X-Moto **0.6.3** (Rasmus Neckelmann and the X-Moto team, GPL-2.0-or-later; `re/xmoto/`). The bike
and rider physics, the collision system, the levels and their Lua scripts, the game events, the
replays and the Classic theme's data are the original's; the code is TypeScript drawing on a canvas.

## Controls

* **Arrow Up / Arrow Down**: accelerate / brake.
* **Arrow Left / Arrow Right**: lean back (rotate counter-clockwise) / lean forward (clockwise).
* **Space**: turn round and drive the other way.
* **Escape**: pause menu (resume, restart, next level, quit level); after a crash, the level menu.
* **Enter**: restart the level. **Backspace**: back to the last checkpoint. **Page Up / Page Down**:
  next / previous level of the pack. In a replay, **Escape** or **Enter** ends it.

These are the original's default keys (`xmoto/input/Input.cpp`); the controls follow key presses and
releases like `StatePlaying::handleControllers`.

## What is ported

* **Physics, 1:1 and checked bit for bit**: `PlayerLocalBiker` with its 17 ODE bodies, hinges and
  contacts, the QuickStep solver, the island builder, the random constraint order, finite rotation,
  the suspensions, rider springs, attitude control, engine, brakes, roll resistance, sleeping, the
  head and body checks, death with the rider falling apart and the front wheel coming off, the
  somersault counter (`src/ode.ts`, `src/bike.ts`, `src/collision.ts`). `test/physics.test.ts` rides
  four scripts (5300 steps) through the port and through the original C++ (`re/xmoto/oracle`) and
  compares every step's floats bit for bit.
* **Rules**: strawberries, the flower (only once all strawberries are taken), wreckers, checkpoints
  (restart there; the time goes on and the replay is dropped, as in the original), zones, the time in
  hundredths, the game events and their order (`src/scene.ts`).
* **Levels**: all 307 levels and the 3 tutorial scripts of the 0.6.3 package, in their packs, with
  dynamic blocks, background blocks, parallax layers, edge effects, sprites, sky and theme
  replacements; the Lua `Game.*` library (messages, gravity, moving blocks and entities, timers,
  camera, arrows, sounds, penalties, forces, key hooks, OnLoad/Tick/zone/entity/wheel/somersault
  callbacks).
* **Replays**: recorded at 25 states per second with the script events, in the original `.rpl` format
  (format 1, which 0.6.3 writes for levels without physics blocks; formats 1 and 3 are read), shown
  with the original interpolation and event playback.
* **Display**: the sky (zoom, offset, drift), textured blocks (scale, blend colour), edge effects,
  animated sprites, the bike and rider sprites with the turn-round animation, the camera (offsets,
  smoothing, active zoom, rotation with gravity, death camera), the time panel, best time, strawberry
  counter, minimap, game messages and arrows.
* **Sound**: the engine (random bang samples at the RPM's rate, `EngineSoundSimulator`), strawberry,
  checkpoint, crash, end of level, new highscore, the scripts' sounds, and the level music (the
  level's own, else one of the theme's chosen by the level id's hash, `Theme::getHashMusic`).
* **Files**: the best times and options in `profile.txt`, replays as `.rpl` files, both in the
  player's account (server storage). A new personal best saves its replay automatically
  (`DEFAULT_AUTOSAVEHIGHSCORESREPLAYS`).

## Deviations and gaps

* **libm**: ODE's `sin`/`cos`/`atan2` are musl's (fdlibm) instead of the C library's, on both the
  port and the oracle (`re/xmoto/NOTES.md`): the last bit of these functions differs between C
  libraries and browsers, and the ride follows it. A ride is the same in every browser; it is not
  necessarily bit-identical to a given native build of 0.6.3 (glibc's results differ in ~3.6 % of
  the calls).
* **Lua**: the scripts run on fengari (Lua 5.3 in JavaScript) instead of the embedded Lua 5.1, with
  the 5.1 functions the levels use added back (`math.mod`, `math.atan2`, `math.tanh`, `table.getn`,
  `unpack`, ...). Numbers handed to the scripts that are whole print without ".0"; a script's own
  float arithmetic may print "3.0" where 5.1 printed "3". `math.random` is fengari's.
* **Chipmunk blocks are not simulated**: the four packaged levels with physics blocks ("Serenity's
  Level #1", "Domino Effect", "Plain Planks", "Lavine") show those blocks where they start; they
  collide but do not fall, swing or roll. `SetPhysicsBlock*` script calls do nothing.
* **Not drawn**: particle effects (smoke, fire, sparkles, debris and the stars of a taken
  strawberry); the "inside"/"outside" edge drawing methods are approximated (the original calls its
  own code for them work in progress); animated block textures show their first frame.
* **Menus** are rebuilt as simple panels over the original title screen with the original's texts
  (Levels, Replays, Options, Help, Quit; pause, crash and finish menus), not with the original's GUI
  widgets. The level list is grouped by pack; there are no favourites, blacklist, "new levels",
  quick play, level info viewer, statistics or several profiles (one player name per account).
* **Not ported**: ghosts (racing your best replay), web highscores and world records, level
  downloads, network play and the server, multiplayer on one screen, the level start camera
  animation, replay fast-forward/rewind, screenshots, joysticks, key rebinding, the "ugly" and low
  graphics modes, themes other than Classic.
* **Storage**: the original keeps best times in an SQLite database and replays as files; here both
  are files of the account storage (64 files, 4 MiB in all), so at most 40 replays are kept: the
  oldest is deleted when a new name is saved beyond that.
* **Quit Game** returns to the game's page on this website.

## Running

```sh
bash re/xmoto/fetch.sh                 # downloads 0.6.3, copies the data to assets/
bash re/xmoto/oracle/build.sh golden   # the oracle and its golden traces (needs g++ or nix)
cd web && npm test                     # physics against the oracle, all levels, rules, replays
npm run build && node scripts/screenshots.mjs xmoto
```
