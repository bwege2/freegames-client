# OpenClonk

A port of OpenClonk (master `36de799`, 2026, 9.0 alpha; https://www.openclonk.org/) to the browser. The page opens the
original's start menu, keeps the player's files, settings and savegames in the site's storage, and plays all 58
scenarios of the six folders with the original's drawing, controls, sound and music, on one computer (keyboard and
gamepad players) or online through the site's game rooms in lockstep. The engine's C++ is translated to TypeScript by
`re/openclonk/tools/cpp2ts` (clang's syntax trees of the original's own build; the translated modules are never edited by
hand), and the game content (C4Script, graphics, sounds, music) is the original's, packed by the original's `c4group`
tool (`re/openclonk/tools/pack.sh`). Reference, licences, the earlier attempt and the milestones: `re/openclonk/NOTES.md`.

The game is listed on the site since 23.11.2026 (`game.json`: `added`), and the four files whose sources are
non-commercial are **not shipped** (`NONCOMMERCIAL_FILES = false`, below).

## What there is

| Part | Where | Checked against the original by |
| --- | --- | --- |
| fixed-point math (`C4Fixed`) and the random generators (`C4Random`, pcg32) | `src/sim/lib/C4Real.ts` (translated), `src/rt/random.ts` | `test/math.test.ts`: 160,622 answers of the original, four mutants fail |
| strings (`StdStrBuf`), printf, wildcards | `src/rt/StdBuf.ts`, `src/rt/printf.ts` | `test/strings.test.ts` |
| containers (`std::sort` as libstdc++, ordered map and set) | `src/rt/std.ts` | `test/containers.test.ts` |
| reading groups (`.ocg`, `.ocd`, `.ocf`, `.ocs`) | `src/rt/group.ts` | `test/group.test.ts`: the original's `c4group` |
| the C4Script engine as the original's `c4script` builds it | `src/aul/` (translated) | `test/aul.test.ts`: the upstream programs log the same; all 936 game scripts compile with the same messages |
| the headless simulation | `src/sim/` (164 translated modules), `src/boot.ts` (the original's start of a game), `src/rt/sim.ts`, `src/rt/headless.ts` | `test/scenario.test.ts`: Acid Drilling loads like the original (481 definitions, 93,816 script lines, 0 errors) and its map and landscape are pixel-identical to the original's debug record; `test/random.test.ts`: the first 596 synchronized random calls are the original's |
| the simulation against the original's debug record | `src/rt/debugrec.ts` (the port's `AddDbgRec` as the original's bytes) | `test/debugrec.test.ts`: the original's headless server records a scenario without players and writes the debug record while it replays that record (`re/openclonk/oracle/debugrec.sh`); the port replays the same record (`test/data/<name>-record.ocs`) for the same frames and makes the same steps, all of them: Acid Drilling (Missions, 2,366,515 chunks, 682 frames), Robber's Cave (Tutorials, 1,461,499, 482), Acid Rift (Worlds, 1,533,237, 474), Rock Bottom (Arena, 605,223, 499), Boomrace (Parkour, 420,879, 503); and with input: `test/input.test.ts` lets the port play Acid Drilling with a player and key presses and record it, the original replays that record without desync, and the port's replay of it makes the original's 2,382,425 steps (489 frames) |

Still open in the headless checks: `src/rt/headless.ts` stands in for the landscape's texture table in the headless
simulation, and the map creator of `Landscape.txt` scenarios (translated now) is not compared with the original's debug
record yet (`re/openclonk/NOTES.md`, "Oracles"). The page itself runs the full game profile (`src/gen`), not the headless
one.

## The page

`src/index.ts` (`start(host, ctx)`) starts the original's application (`src/app.ts`) as the
installed game is started without a scenario, so that it opens its start menu, translated from the game's own build
(`src/gen`, the game profile: simulation, drawing, in-game GUI, start menu, sound, the SDL platform layer;
`re/openclonk/NOTES.md`):

| Step | How | Where |
| --- | --- | --- |
| content | the groups packed by `re/openclonk/tools/pack.sh --out web/games/openclonk/assets` (108.8 MiB, committed; the four non-commercial files are not, see below); Play downloads the six system groups and the Tutorials and Parkour folders (64.3 MiB), the page then the music and the other four scenario folders (`lazyAssets`) before it starts the original, whose start menu lists every folder | `src/content.ts`, `src/groups.ts` |
| the player's files | the original's user folder `~/.clonk/openclonk/` in the site's storage (account scope): the config (with `MissionAccess`, the missions a player unlocked), the player files `*.ocp`, the savegames `Savegames.ocf/…`; loaded before the start, written back after every frame in which the original changed them | `src/storage.ts` |
| start | `C4Application::Init` with the command line of an installed game, `openclonk --fullscreen`: no scenario, so the original's start menu (main menu, scenario selection, player selection and properties, options, credits and legal notice); the content where the Linux build looks for it | `src/app.ts` |
| modal dialogs | the original's modal loops (the first player's dialog, questions) are generators the page resumes each frame (`config.SUSPEND`, `rt/coro.ts`) | `src/app.ts`, `src/rt/coro.ts` |
| sounds and music | every Ogg sound of the content decoded before the start (the original's loader decodes synchronously, the browser cannot), the first 24 s of each piece of music too; the rest of a piece when the original opens it | `src/app.ts`, `src/rt/al.ts` |
| running | the original's main loop, one round per animation frame (`ScheduleProcs`): its game timer (a timerfd of 26 ms in the original's Linux build, here on `performance.now()`) runs `GameTick` and `Draw` at the original's 38.5 frames a second | `src/app.ts`, `src/rt/fs.ts` |
| keys, mouse, gamepads | the page's events as SDL's (key scancodes, text input, motion, buttons, wheel, the canvas's size), which the original's `HandleSDLEvent` reads; the browser's gamepads as SDL's game controllers (`platform/C4GamePadCon`) | `src/app.ts`, `src/rt/sdl.ts` |
| screen | the canvas is the original's SDL window; its WebGL2 context is made with what the original asks SDL for, and the original's renderer draws on it (`src/rt/gl.ts`, the shaders through `src/rt/glsl.ts`) | `src/app.ts` |
| quit | the start menu's "Exit" (or Esc in its main menu) is the original's `Application.Quit`: its config goes to the storage and the page returns to the game page (`ctx.exit()`); leaving with the site's Back button closes the window as `SDL_QUIT` does (the original quits and saves its config) | `src/index.ts` |
| when the engine stops | the page says so and shows the engine's log | `src/index.ts` |

Where it stands (23.11.2026, headless Chromium): the start menu opens with the original's labels; without a player file
it asks for a new player in its modal dialog; "Start Game" lists the six folders, and a scenario starts with the selected
players and plays (the original's drawing, controls, sound and music); the player files, the config (with the missions
unlocked) and the savegames last in the storage (a savegame of Tutorial01: 187 KB packed). **All 58 scenarios of the six
folders start and run 1,000 frames** (with the missions unlocked as a player unlocks them, two players where a scenario
asks for two; `test/count.test.ts`, `OC_COUNT=1`). Two players play on one computer with the keyboard and a gamepad, the
original's two control sets. Tutorial01's picture of a replay is the original's within a tolerance
(`test/screenshot.test.ts`: 99.7 % of the pixels within 48 of the original's, mean difference 0.5). Online, two browsers
play an Arena melee in lockstep through the server; a third joins the running round later (its content set lacked the
scenario, so it fetched it), proves its state, plays, and survives a reload/rejoin; a corrupt state check is refused and
a full room says so (`test/online-e2e.test.ts`). On SwiftShader (software WebGL) Tutorial01 runs at about 11 of the original's 38.5 frames a
second (an Arena melee in a 480x360 window at about 27); a browser with a GPU is needed for the original's speed
(`re/openclonk/NOTES.md`, "Milestone 2", "Milestone 3").

The page's screenshots are taken with `web/scripts/screenshots.mjs openclonk` from the built site and the server jar
(`screenshots.mjs` in this folder drives the original's start menu with the keyboard and clicks the intro through). The
five pictures are the start menu (labels included), the new-player dialog, the scenario selection, Tutorial 1's welcome
and its second hint at the rope bridge.

## The setting `NONCOMMERCIAL_FILES`

Four files of the original come from sources that are non-commercial today (`LICENSE.md`, "Non-commercial files"):
the wind sound `Environment::WindLoop`, the glass sound `Hits::Materials::Glass::GlassShatter` and the start menu's
parchment backgrounds `StartupDlgPaper` and `StartupPlrPropBG`. `re/openclonk/tools/pack.sh` keeps them out of the
packed groups; `NONCOMMERCIAL_FILES` in `src/settings.ts` decides alone whether they are part of the game. The
**shipped build sets it to `false`**, because the site's rule is that every asset it ships is free for any use,
commercial use included, and these four are not (CC BY-NC 4.0; the artist's "non-commercial unless express permission"
terms). None of the four is committed, in `web/games/openclonk/assets` or in a build. The operator's 14.11.2026 toggle
is kept as the mechanism, and the tests run both states:

| `NONCOMMERCIAL_FILES` | The four files | The game |
| --- | --- | --- |
| `true` (a non-commercial build; the operator's 14.11.2026 choice while the site was non-commercial) | shipped unchanged, at their places in the groups | as the original |
| `false` (the shipped build) | neither built nor shipped | no wind sound, no glass-shatter sound; the start menu's two parchment images are plain stand-ins of the same sizes in one colour (the original refuses to open its start menu without the two images, and the player properties dialog takes its size from one: `src/app.ts` PARCHMENT_STANDINS); everything else, the simulation included, is the same |

`test/noncommercial.test.ts` runs both states: the packed groups never hold the files, the engine finds them only
with the setting on, and a scenario runs with the same synchronized random calls either way. `test/menu.test.ts` opens the
start menu and its player dialog in both states.

The build: Vite emits every file an import names, even in code a constant switches off, so the page's loader
(`src/content.ts`) names the four files only inside a `// build-if ./settings.ts NONCOMMERCIAL_FILES` block, which
`web/scripts/build-if.mjs` (a plugin of `web/vite.config.ts`) removes before Vite reads the file when the setting is
off. `test/content.test.ts` checks the loader as Vite gets it in both states; two real builds (14.11.2026) had the
four files in `web/dist` with the setting on and none of them with it off, and the shipped 23.11.2026 build (the setting
off) has none of the four files or their names as imported assets (checked with `find` and the download manifest).

## Building it

The packed content is committed (`assets/`: 13 groups, 108.8 MiB, the largest `Music.ocg` at 33.6 MB, below GitHub's
100 MB per-file limit), so a clean checkout builds without the 134.6 MB reference archive. The groups are the original's
files, unchanged except for the four non-commercial files left out; `pack.sh` writes them byte for byte again from the
reference source. From the repository root:

```sh
# only to rebuild the content or to run the checks against the original:
re/openclonk/fetch.sh                    # the reference source (134.6 MB, checks sha256) into re/openclonk/orig
re/openclonk/oracle/build.sh             # the original's c4group and the math oracle into re/openclonk/work/build
re/openclonk/oracle/build-headless.sh    # c4script and openclonk-server (debug records, scenario count)
re/openclonk/oracle/build-full.sh        # the original's full game (the screenshot oracle)
re/openclonk/tools/pack.sh --out web/games/openclonk/assets   # the groups (keeps the four NC files in the way)

# the site and the game:
cd web
npm ci
npm run build                            # tsc, Vite (8 GiB heap: the 54 games need it), licenses, SEO pages, downloads
node scripts/screenshots.mjs openclonk   # the five screenshots, with server/target/freegames-server.jar
node --test --test-concurrency=1 games/openclonk/test/*.test.ts
```

`pack.sh` resolves `--out` against the directory it is called from (so the command above, from the repository root,
writes into the game's `assets/`). The oracle tools need clang, cmake and zlib (the script takes nix's when nix is
present); the tests skip with a message when the reference source, an oracle or the packed content is missing.

## Online

The original's network game, in lockstep: every browser runs the whole game, and the site's server is the host that
decides which control every browser executes at which control tick (the server module
`server/src/main/java/net/slop/freegames/games/openclonk/OpenclonkModule.java`, its messages
`protocol/games/openclonk.capnp`). In the browser the original's control queue runs as on a client of a network game
(`C4GameControl` in network mode with its network part `C4GameControlNetwork`, both translated); `src/net.ts` takes the
place of the original's `C4Network2` (its connections, lobby and file transfers), `src/lobby.ts` the place of its network
dialogs.

How to play: in the start menu choose your players, then **Network game** (the main menu's button), choose a scenario
(the Arena's melees are made for it) and start it. The site's lobby opens: join one of the rooms listed (its scenario is
played, whichever you chose), or create a room with your scenario, wait for the others and start the round. Every
player's browser then starts the scenario with the round's seed, and the players join with their player files. If your
connection drops, or you reload the page, you are back in the round within a minute (reloaded: **Network game**, any
scenario, and **Rejoin** in the lobby): your browser executes the round so far, catching up, and you play on. The room's
settings are the original's network settings of the options (control rate, the control mode central or asynchronous,
its wait), as they are when the room is made.

**Joining a running round** works without a restart: the lobby lists the rooms that are running (marked *running*), and
**Join** seats a newcomer. The module sends it the round's seed (in `RoomStarted`), the whole control history from tick
0 and a reference sync check at a recent frame; the page starts the room's scenario, replays the history (the player
files of the players who joined are inside their join controls, so no savegame file is needed), and reports its own
check. The module seats it only when the check matches; until then it is not activated, and its commands are dropped.
It then joins with its player file and plays in lockstep. If its first content set did not have the room's scenario
folder, the page downloads that group from the site's server before the scenario starts (Play downloads the six
folders; `test/online-e2e.test.ts` covers a newcomer whose first set lacked one). A full room, a corrupt history/state
check and a refused join are handled in the lobby/status line; a corrupt check leaves the newcomer unseated and it
leaves the room.

The server checks what the original's host checks: the order of the control, which client a seat's control is executed
as (packets that claim another client are dropped), the players' sync checks every 100 frames (when two differ, the round
ends: "Network: Synchronization loss!"), and the round's evaluation (it ends the round when every player's game
evaluated it alike).

## Deviations from the original

- The unsynchronized random generator (effects that are not part of the game state) is seeded from the
  browser's `crypto` instead of `std::random_device` (`src/rt/native.ts`).
- The original's SDL window is the page's canvas: it fills the player area, the browser's own full screen is the only
  full screen, and SDL's window events come from the element's size. The renderer is the original's translated OpenGL
  renderer on WebGL2: its shaders are the original's GLSL with the `#version 300 es` line and the GLSL ES differences
  (`src/rt/gl.ts`, `src/rt/glsl.ts`), and the program is drawn with the browser's WebGL2 (on SwiftShader, software
  rendering, Tutorial01 runs at about 11 of the original's 38.5 frames a second; a GPU is needed for the original's
  speed).
- The original's game timer is a 26 ms timerfd on Linux; here `performance.now()` and the animation frame drive the same
  `GameTick`/`Draw` at 38.5 frames a second. While the game short-circuits its timer (a client catching up, `GameGo`), the
  page runs further rounds within one animation frame (at most 10 ms), as the original runs them as fast as it can.
- The content groups are downloaded and unpacked into an in-memory file system; the engine reads them as folders,
  as it reads an unpacked `planet/`. Play waits for the six system groups and the Tutorials and Parkour folders; the
  music and the other four scenario folders are fetched while the start menu opens (`game.json` `lazyAssets`).
- Sound is the original's OpenAL code on the page's `AudioContext` (`src/rt/al.ts`): every Ogg is decoded before the
  start (the original's loader decodes synchronously; the browser cannot), the first 24 s of each music piece too, the
  rest when the original opens it. EFX modifiers (reverb, echo, equalizer) are reported unavailable as on a system
  without EFX; stereo panning is WebAudio's equal-power law.
- Keys the browser keeps for itself (Ctrl+W, Ctrl+T, Ctrl+N and the like) stay the browser's; the original's own keys
  are all reachable. The game gets every other key, Esc included, and prevents the page from scrolling.
- The start menu's "Mods" button shows a message instead of its dialog (mods would be downloads); the update dialog is
  left out. Ctrl+S in the credits (which writes `Credits.txt` into the working directory) does nothing.
- With `NONCOMMERCIAL_FILES` off (above), four of the original's files are missing; the two parchment images of the start
  menu are plain stand-ins of the same sizes (the smallest change that lets the original open its start menu).
- The player's files of the original's user folder (config, player files, savegames) live in the site's storage
  (`src/storage.ts`): the page writes them back after the frame in which the original wrote them. A group the original
  writes as a folder (a savegame, which it copies from its scenario, unpacked in the page's content) is stored packed by
  the original's own `C4Group_PackDirectoryTo`, as the installed game's packed scenarios would give it. The log, records
  and screenshots stay in the page's memory. A write the storage refuses (64 files, 512 KiB each, 4 MiB in all) is shown on
  the page's status line.
- Modal dialogs: the original's modal loops are generators the page resumes each frame (`rt/coro.ts`); where a function
  that is no generator starts one (a dialog's `OnShown`, a button's callback), the caller goes on before the dialog closes
  instead of after it (those callers have nothing left to do).
- The options' network page: only the control rate, the control mode and its wait are used (as the room's settings);
  ports, master server, league and the like nothing uses.
- Online: the network game's dialogs are the site's. "Network game" opens the scenario selection in network mode (in the
  original the network dialog's "Create game" does), and the site's lobby takes the list of games and the original's lobby
  together; the scenario selection's internet, league, password and comment buttons have no effect (the rooms have their
  own password; there is no league). The host is the server, which plays no part of its own: what the original's host
  decides from the game (the players' IDs, teams and colours) every browser decides alike when it executes a player's join
  request, and a player's own browser sends the join with the player file inside it (the original's host sends a join by
  network resource, a file transfer). A newcomer joins a running round by replaying the control history and proving a
  sync check (the original's host sends a savegame/dynamic record instead); changing the control rate during the round
  (the host's) is not offered. A connection that drops does not remove the player at once: the seat waits a minute for
  the browser to come back, which then executes the round so far (the original removes the client). Votes (kick, pause)
  are left out: a round cannot be paused online. Only the scenarios of the game's own folders can be played online (the
  others' browsers have no copy of your own scenarios and savegames).

- "Exit" returns to the game page; leaving the page closes the original's window (it quits and saves its config).
- The language is the browser's (`navigator.language` as `LANG`): German or English, as the original picks on Linux.
- Gamepads are the browser's (Gamepad API, standard mapping) as SDL's game controllers.

## What is not 1:1 yet

- Online: a newcomer joins a running round by replaying the whole control history and proving a reference sync check,
  not with the original's savegame/dynamic record (the resulting state is the same; a long round means a longer
  catch-up). Votes (kick, pause) are left out and the control rate cannot be changed during a round. Only the game's own
  scenario folders can be played online. Async mode is tested with the module's loopback clients, not with browsers.
- The start menu's Mods and update dialogs and the network page's unused settings (master server, league, ports) are not
  there (above).
- The headless simulation (`src/sim`, used by the debug-record tests) still has the landscape texture-table stand-in of
  `rt/headless.ts`, and the map creator of `Landscape.txt` scenarios is not compared with the original's debug record.
  The page runs the full game profile (`src/gen`), which the browser tests check.
- The original's speed on a real GPU was not measured here; the SwiftShader figure is 11 of 38.5 frames a second for
  Tutorial01.

## Tests

From `web/`, OpenClonk's own suite is `node --test --test-concurrency=1 games/openclonk/test/*.test.ts`; `npm test`
runs it with the rest of the site's tests. The 58-scenario count is the same command with `OC_COUNT=1` (about an hour,
three scenarios at a time; `OC_COUNT_ONLY=<substring>` picks one). On 26.11.2026 the suite had 91 tests: 90 pass and 1
is skipped without `OC_COUNT` (the count); with `OC_COUNT=1` all 58 scenarios start and run 1,000 frames, so all 91
pass. The server's tests (`mvn -B -f pom.xml test`) had 390, 0 failures, of them `OpenclonkModuleTest`'s 14;
`npx tsc --noEmit` and `npm run build` pass. The checks against the original need the original:
`re/openclonk/fetch.sh`,
`re/openclonk/oracle/build.sh` (the `c4group` tool and the math oracle), `re/openclonk/oracle/build-headless.sh`
(`c4script`, `openclonk-server`) and `re/openclonk/tools/pack.sh` (the packed content); without them those tests
are skipped with a message. `test/shaders.test.ts` and `test/sound.test.ts` run in headless Chromium (as
`web/scripts/e2e.mjs` finds it, or `$CHROME`): every shader program the original builds compiles and links on
WebGL2, `rt/gl.ts` draws with the original's sprite shader, the browser decodes the original's Ogg files and OpenAL
sources play them. The page's parts: `test/content.test.ts` (the loader in both states of `NONCOMMERCIAL_FILES`),
`test/page.test.ts` (scenario list, timer, keys), `test/gl.test.ts`, `test/al.test.ts`, `test/sdl.test.ts` (SDL, the
gamepads), `test/storage.test.ts` (the player's files in a fake storage: names, loading, writing back, removing, packing
folder groups, the limits). The game on the page, in headless Chromium: `test/menu.test.ts` (the start menu: the new player's
modal dialog, main menu -> scenario selection -> Tutorial01 with the new player, the player file and config round trip
through the storage; `NONCOMMERCIAL_FILES` on and off), `test/savegame.test.ts` (a savegame of Tutorial01 stored packed
within the limits and run on after a new start), `test/play.test.ts` (Tutorial01 played with the mouse and keys; Shiver
Peak's sounds and music come out of the AudioContext, and with `NONCOMMERCIAL_FILES` off it runs without the wind),
`test/screenshot.test.ts` (a replay's picture against the original's, which `re/openclonk/oracle/screenshot.sh` takes from
the original's full game on a virtual X display with Mesa), `test/multiplayer.test.ts` (two players on one computer in an Arena melee, one with the
keyboard, one with a gamepad: each walks its own clonk), `test/coro.test.ts` (the modal loops' coroutines), `test/count.test.ts` (only with `OC_COUNT=1`, about an hour, three scenarios at a time:
which of the 58 scenarios start and run 1,000 frames). Online: `test/online.test.ts` (the messages between browsers and
module, including JoinState/JoinCheck/JoinResult), `test/online-e2e.test.ts` (three browsers in headless Chromium against
the real server, `server/target/freegames-server.jar`: an Arena melee in lockstep with keys on both sides, the same state
in both; a third browser joins the running round after its content set lacked the scenario, fetches it, catches up,
proves its state, plays commands the others execute, and reloads/rejoins; a corrupt state check is refused; a full room
says so; and a browser whose state was changed is found by the module's sync checks), and the module's own tests
(`mvn -B -f pom.xml test`, `OpenclonkModuleTest` 14, including the drop-in history/check and full-room loopback tests).
