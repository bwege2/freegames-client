# OpenClonk: port notes

## Reference version

OpenClonk **master `36de799`** (2026-04-28, version 9.0 alpha), the operator's choice (14.11.2026) over the
last release v8.1 (2018; master is 503 commits ahead of it). `fetch.sh` downloads GitHub's archive of that commit
(134,607,499 bytes, sha256 `840c43c3…aa440`) into `orig/` (not committed).

Size of the reference:

| Part | Lines | In the port |
| --- | ---: | --- |
| engine C++ `src/` | 243,696 | |
| ‑ simulation: `lib` 26,538, `object` 24,798, `landscape` 22,059, `script` 15,780, `game` 12,910, `control` 12,707, `c4group` 6,959, `player` 3,828, `config` 1,698 | ~127,000 | translated (`src/sim/`) |
| ‑ `graphics` 11,665 (OpenGL renderer), `gui` 39,721 (menus, script GUI) | ~51,000 | translated, drawing on WebGL2 (milestones 2, 3) |
| ‑ `network` 23,062 | | replaced by the site's rooms (milestone 4) |
| ‑ `editor` 16,525, `mape` 9,208, `platform` 13,736 (SDL, Win32, Cocoa), `netpuncher` | | left out (browser-forced) |
| game content `planet/`: 936 C4Script files | 152,721 | run unchanged on the translated script engine |
| shaders `planet/**/*.glsl` | 753 | used as they are (WebGL2 GLSL ES 3.00 needs a version line) |
| content (meshes, skeletons, images, sounds, music) | 159 MB | original files, packed by the original's `c4group` |

## Licences (checked 13.11.2026)

| Files | Licence | Shipped |
| --- | --- | --- |
| engine `src/` (`COPYING`) | ISC | translated |
| scripts `planet/**/*.c` (`planet/AUTHORS`) | ISC | yes |
| content: graphics, models, textures, sounds, music (`planet/COPYING`, `planet/AUTHORS`) | CC BY 3.0, unless an `authors.txt` says otherwise | yes |
| music, 9 tracks by Martin Strohmeier (K-Pone) (`Music.ocg/authors.txt`; `Cavern` and `Nautilus` are not named there, their Vorbis tags say K-Pone, album OpenClonk) | CC BY 3.0 | yes |
| material textures (`Material.ocg/authors.txt`) | CC BY 3.0 | yes |
| sounds from Freesound (`Sound.ocg/authors.txt` and per folder): 95 source pages read one by one | CC0, CC BY 3.0, CC BY 4.0 | yes |
| font `Graphics.ocg/Endeavour.ttf` (Jan Luecker, Günther Brammer, clonk.de) | part of the content, CC BY 3.0 | yes |
| `Decoration.ocd/Village.ocd` (Dustin Ness) | ISC | yes |
| third-party code used: pcg (Apache-2.0), timsort (MIT), tinyxml (zlib), blake2 (CC0) | | translated where the engine uses it |
| not used: getopt (BSD), backward-cpp (MIT), natupnp, `licenses/LGPL.txt` and `xiph.txt` (the Windows installer's libraries) | | no |
| trademark (`TRADEMARK`) | "'Clonk' is a registered trademark of Matthes Bender." must be shown; a product title with "Clonk" needs a prefix ("OpenClonk" has one) | notice on the game page and in `LICENSE.md` |

No file of the repository carries an NC or ND clause. Four files come from sources that are **non-commercial
today**:

| File | Source | Licence shown by the source (13.11.2026) |
| --- | --- | --- |
| `Sound.ocg/Environment.ocg/WindLoop.ogg` | freesound.org ERH, sound 34338 "wind.wav" (2007) | CC BY-NC 4.0 |
| `Sound.ocg/Hits.ocg/Materials.ocg/Glass.ocg/GlassShatter.ogg` | freesound.org Connum, sound 66520 "breaking_a_bottle_no2.wav" (2009) | CC BY-NC 4.0 |
| `Graphics.ocg/StartupDlgPaper.png`, `Graphics.ocg/StartupPlrPropBG.png` | "old crackly parchment texture" by Teeth-Man (DeviantArt, 2007) | badge CC BY-SA 3.0, but the artist's text: "non-commerically, unless express permission is given" |

Both sounds were uploaded when Freesound licensed everything as Sampling+; nothing records the licence they had
when OpenClonk took them. **Decision (operator, 14.11.2026):** a toggle, `NONCOMMERCIAL_FILES` in
`web/games/openclonk/src/settings.ts`. On, the four files ship unchanged; off, they are not built, committed or shipped at
all and the port runs without them (`web/games/openclonk/README.md`, `LICENSE.md`).

**The shipped build sets it to `false` (23.11.2026).** The site's rule is that every asset it ships is free for any use,
commercial use included; the four are not (CC BY-NC 4.0 and the artist's non-commercial terms). The toggle stays as the
mechanism and the tests run both states; `web/games/openclonk/assets` (the packed groups, committed) and `web/dist` hold
none of the four. Verified with `re/openclonk/work/build/c4group ... -l -r` and by the build (see below).

Open, not blocking: `Objects.ocd/Icons.ocd/Skull.ocd` (`authors.txt` says CC0; the Pixabay page shows the Pixabay
Content License, which allows commercial use but is no free licence; the uploader, Clker-Free-Vector-Images,
publishes public-domain clip art); `Sound.ocg/Animals.ocg/MosquitoBuzz.ogg` (`authors.txt`: CC0; freesound
188708 is deleted); `Icons.ocd/Number.ocd` (digits drawn with the fonts Blender BFont and Webly Sleek, whose DaFont
page is gone); the two OpenGameArt sources (controller icons CC0, the Sandbox teleporter icon CC BY 3.0) answered
403 and were confirmed through search results only; sounds without an `authors.txt` of their own (DeepSeaMining's
crystal communicator, BigVolcano, Switch, TreasureHunt's PlaneDrop, FightForGidl's OgreClubHit) fall under
`planet/COPYING`.

## The earlier attempt (`origin/openclonk`, 44 commits) and what this branch keeps

That branch translated the engine with a C++-to-TypeScript translator (`tools/cpp2ts`, clang's syntax trees) and
added a page with a hand-made renderer. Checked on 13.11.2026: its 31 tests pass with the oracles built (8 pass,
23 skip without them), and the translator writes its 161 simulation modules byte for byte again from the syntax
trees (9 min 21 s). It was not 1:1:

* `src/rt/headless.ts` replaced parts of the synchronized simulation by stand-ins: the mesh library, skeletal
  animation (`PlayAnimation` returned animation 0, positions were never advanced), `C4DefGraphics`, the object
  shapes from `DefCore.txt` (filled by a hand parser), the debug record. The synchronized random stream therefore
  left the original's after 596 calls, in the first frames of the round.
* The page drew its own approximation (landscape sampled on the CPU without the original's shaders, flat-shaded
  meshes without animation, objects as triangles), not the original's drawing.
* The same 25,605 translated lines were committed twice more (`src/gen`, `src/aul`), and 52 MB of packed groups.

This branch starts again from `main` and takes over only what was verified against the original:

| Kept | Verified by |
| --- | --- |
| the translator `tools/cpp2ts` with `ast.sh`, `prune.py`, `shrink.py`, `translate.py`, the unit lists | the same output from the same trees; the tests below |
| the runtime for translated C++ (`web/games/openclonk/src/rt/`: integers, libc, printf, `StdBuf`, containers, pointers, the in-memory file system, gzip, PNG, blake2b, random) | `math`, `strings`, `containers`, `group` tests against the original |
| the C4Script engine as the original's `c4script` builds it (`src/aul/`) | `aul.test.ts`: the upstream programs log the same; all 936 `planet` scripts compile with the same messages |
| fixed-point math and the random generators | `math.test.ts`: 160,622 answers equal the original's |
| the group reader | `group.test.ts` against the original's `c4group` |
| the headless simulation (`src/sim/`) as the translator writes it | loading AcidDrilling: 481 definitions, 93,816 script lines, 0 errors; map and landscape pixel-identical to the original's debug record; the first 596 synchronized random calls equal |

Not kept: the page and its renderer (`src/app/`), the duplicate `src/gen/`, the committed packed groups, the
screenshots. The stand-ins of `rt/headless.ts` are kept for now, each marked, and are the first work of milestone 1.

## Milestones

1. **Simulation 1:1, headless.** Translate what the stand-ins replace (`lib/StdMesh*`, `object/C4DefGraphics`,
   `C4MeshAnimation`, `C4MeshDenumerator`, `C4Shape::CompileFunc`, `control/C4Record`, `C4Playback`). Check: the
   original's headless server records a scenario with `--debugrecwrite`; the port plays the same scenario and
   control and compares its debug-record chunks with the original's (the original's own desync check,
   `C4Record::Check`), frame by frame, for at least 2,000 frames. Everything else depends on an exact simulation,
   so it comes first.
2. **First playable version.** One scenario folder (Tutorials, Parkour): the OpenGL renderer translated onto
   WebGL2 with the original's shaders (landscape, sprites, skinned meshes, light and fog of war), the script GUI,
   the player controls, sound through WebAudio. The page starts a scenario directly.
3. **Menus and content.** The start menu (`gui/C4Startup*`), player files and savegames in server storage, the
   other scenario folders (Missions, Worlds, Arena, Defense). Done 15.11.2026 ("Milestone 3" below).
4. **Online.** Lockstep: every client runs the simulation; the control packets (`C4Control`) go through the
   site's rooms in the server's order; a server module checks seats, rates and the clients' sync hashes. Hooked to the
   game 15.11.2026 ("Online (milestone 4)" below).

## Online (milestone 4)

The original's network game is lockstep: every client runs the simulation, and the host decides which control every
client executes at which control tick. Here the site's server is that host, a dedicated one without players
(`protocol/games/openclonk.capnp`, `server/.../games/openclonk/OpenclonkModule.java`); in the browser the original's
control queue runs as on a client of a network game, with `web/games/openclonk/src/net.ts` in the place of `C4Network2`
("The hookup" below). Tests: `OpenclonkModuleTest` (loopback clients against the real server), `test/online.test.ts`
(the messages), `test/online-e2e.test.ts` (browsers against the real server).

| Original | Here |
| --- | --- |
| `C4GameControlNetwork` in `CNM_Central`: clients send their `C4GameControlPacket` (client ID, `iCtrlTick`, `C4Control`) to the host; `PackCompleteCtrl` waits for every activated client's control of a tick and sends the complete control (`C4ClientIDAll`) in client ID order | `Control {tick, ctrl}` to the module; once every activated seat sent its control for the next tick, `Tick {tick, events, controls}` to all, the seats' control in seat order |
| `CNM_Decentral` (the default of `Config.Network.ControlMode`): every client packs the same in the same order | the same order, packed once by the module |
| `CNM_Async`: a tick waits `AsyncMaxWait` frames (× 1000 / `iTargetFPS` 38 ms) for a slow client, whose control goes into a later tick | room option `mode: async`, `asyncMaxWait`; the room ticks every 20 ms to pack; `SeatControl.tick` says for which tick late control was sent |
| `C4ClientIDHost` = 0, client IDs from `C4ClientIDStart` = 1 | the module is client 0 and its events come first in a tick; seat s is client s + 1 |
| `C4Control` in `StdCompilerBinWrite` form | `ctrl` as `Data`, at most 32 KiB (a `C4ControlJoinPlayer` with its player file after `Strip`, BigIcon ≤ `C4NetResMaxBigicon` = 20 KB); empty: no input, but still sent each tick |
| `ControlRate` (`Config.Network.ControlRate` 3, `C4MaxControlRate` 20), tick T executed at frame T × ControlRate | room option `controlRate`, fixed for the round (changing it at runtime, `C4ControlSet C4CVT_ControlRate`, is the host's: not offered) |
| `iControlPreSend` ≤ `C4MaxPreSend` = 15 frames | the original's (`C4GameControlNetwork::CalcPerformance` from the host connection's ping: the SDK's round-trip time); the module takes control at most 20 ticks ahead of the last complete tick |
| `C4ControlClientJoin`, `C4ControlClientUpdate` `CUT_Activate`, `C4ControlClientRemove` (players removed by `Players.RemoveAtClient(id, true)`) | `SeatEvent` `join` (every seat, tick 0), `deactivate` (its connection dropped: ticks no longer wait for it), `activate` (it sends again), `remove` (it left, or did not come back within the site's `RECONNECT_S`) |
| a disconnected client is removed at once | deactivated: the site keeps the seat for `RECONNECT_S`; back, it gets `History` (every tick from 0, in 48 KiB messages, and `resume`, its next tick), executes them catching up (`CtrlOverflow`: complete control `C4ControlOverflowLimit` = 3 ticks ahead runs without the timer) and is activated by its first control, as a client asks the host with `C4Network2::RequestActivate` |
| runtime join: the host sends a newcomer a savegame (`C4Network2` dynamic record) at a sync point | left out so far: the browsers write and load savegames since milestone 3 (`C4GameSave`, 187 KB packed for Tutorial01), the hookup is open. The module is not drop-in |
| `C4ControlSyncCheck` every `C4SyncCheckRate` = 100 frames: the host's goes into the control queue and the clients compare theirs ("Network: Synchronization loss!") | every browser sends its own (`SyncCheck`, the nine values and an optional hash of the port's); the module compares each with the first of that frame and on a difference sends `Desync` (both checks) and ends the round, `Results {reason: desync, frame}` |
| `C4RoundResults` (`C4Game::Evaluate`), `PIF_Won` | `RoundResults` from every browser; the round ends when every seat still in the round reported, `evaluated` with the evaluation if all are equal (compared field by field, rebuilt), else `disagreed`; the host's FinishRoom is refused |
| `PID_ControlReq` (recovering lost control) | not needed: the site's transport is reliable and ordered |
| the host does not check the `iByClient` of queued control | the module tags each seat's control with its seat; the browsers must execute it as client seat + 1 and drop packets that claim another client, so only the module's events act as the host |

Limits of the module: control 32 KiB, a seat's control waiting for its tick 48 KiB (64 packets), 20 ticks ahead, the
kept ticks 64 MiB (then the round ends, `limit`), 20,000 sync-check frames, an evaluation's lists 64 entries and texts
64 bytes, the scenario path 128 bytes (`*.ocf/…/*.ocs`). Room options: `scenario`, `controlRate`, `maxPlayers`
(`C4GameParameters::MaxPlayers`, 0..64, 0 = the scenario's), `mode`, `asyncMaxWait`.

### The hookup (15.11.2026)

The browser is a client of a network game in central mode (or asynchronous, the room's `mode`), as the original's client
is: `C4GameControl` in `CM_Network` with its network part `C4GameControlNetwork` (both translated; `network/
C4GameControlNetwork.cpp` joined the game profile for it, `tools/units.txt`, `config.py GAME_TRANSLATES`, so the client's
control logic is the original's: `CtrlNeeded`/`DoInput` send this client's control `iControlPreSend` frames ahead,
`HandleControl`/`CheckCompleteCtrl`/`CtrlReady` wait for the host's complete control, `CtrlOverflow` catches up without
the timer, `CalcPerformance` sets the PreSend from the host's ping, the sync control queue runs the host's actions at their
tick). What `C4Network2` does for such a client is `src/net.ts` (`RoomsNetwork`, the page's `::Network` during a round;
everything a client of the original never calls in a game answers as in a game without the network):

| The original's client | Here |
| --- | --- |
| `C4Game::Init` takes the client's branch (`InitNetworkFromReference`, `RetrieveScenario` from the host) | the page starts the round's scenario itself (every browser has the content), so `C4Game::Init` takes the host's branch: `InitNetworkHost` → `Network.InitHost`, which makes the browser a client (`Game.Clients` with this client, seat + 1, and the host, client 0; `Control.Network.Init(client, false, 0, true)`, `SetCtrlMode`), then `C4GameControl::InitNetwork`, `Network.Players.Init`, `Network.Start` (`SetRunning`). The command line is the start menu's (`Game.NetworkActive`, `fLobby` as `C4StartupScenSelDlg::StartScenario` sets them for a network game) |
| the host's scenario has `C4S.Head.RandomSeed`; `Game.Parameters` (ControlRate, MaxPlayers) come from the host | `Game.RandomSeed` = the round's seed (int32), `Parameters.ControlRate`/`MaxPlayers` from the room's options, set in `InitHost` (before `C4Game::InitControl` fixes the random generator) |
| `Clients.SendMsgToHost(PID_Control, C4GameControlPacket)` | its `C4Control` (binary) to the module as `Control {tick, ctrl}` |
| the host's complete control (`PID_Control`, `C4ClientIDAll`) → `HandleControl` | the module's `Tick`: each seat's `C4Control` read with `StdCompilerBinRead`, its packets kept only if they are control (`CID_First`), by its client (`iByClient` = seat + 1), no sync check (the module compares those), a player info only of its own client and without player IDs, a join only at its own client and with the file inline (`fByRes` false), a client update only of itself; appended in seat order into a `C4GameControlPacket(C4ClientIDAll, tick)` for `C4GameControlNetwork::HandleControl` |
| the host's sync control (`C4ControlClientJoin`, `C4ControlClientUpdate CUT_Activate`, `C4ControlClientRemove`, `iByClient` = 0) at a control tick (`ExecSyncControl` → `AddSyncCtrlToQueue`) | the tick's `SeatEvent`s as those packets (by client 0, the seat's name from the room as the client's name, the same in every browser), queued with `AddSyncCtrlToQueue(ctrl, tick)`: `ExecQueuedSyncCtrl` runs them at the start of the tick, before its complete control |
| `C4Network2Players`: a client's join request (`PID_PlayerInfoUpdReq`) goes to the host, which gives IDs, teams and colours (`HandlePlayerInfoUpdRequest`) and sends the result (`C4ControlPlayerInfo`, direct) and queues the joins by network resource (`JoinUnjoinedPlayersInControlQueue`) | the request goes into the client's control as a `C4ControlPlayerInfo` (players without IDs); every browser executing it at its tick does the host's part (`AssignPlayerIDs`, `AssignTeams`, `UpdatePlayerAttributes`, `SendUpdatedPlayers` as direct control) and the client's (`AddInfo`, `RecheckPlayers`/`RecheckTeams`), marks the joins issued, and the player's own browser queues `C4ControlJoinPlayer(file, client, id)` with the player file inline (after `Strip`) as `LocalJoinUnjoinedPlayersInQueue` does in a game without the network; it is executed at a later tick. The player infos are made without the network's resources (`isEnabled()` answers false while `C4ClientPlayerInfos` reads the player files): no file transfer, the player file travels in the join |
| `C4ControlSyncCheck`: the host's goes into the queue, a client compares it with its own (`C4GameControl::DoSyncCheck` keeps its own in `SyncChecks`) | each browser's own check (`Control.GetSyncCheck(frame)` after the frame) goes to the module; on the module's `Desync` the browser executes the other seat's check as `C4ControlSyncCheck::Execute` does on a client: "Network: Synchronization loss!", the two checks logged, the sync error sound, `RoundResults.EvaluateNetwork(NR_NetError)`, `Network.Clear()` |
| `C4Game::Evaluate` (`RoundResults.EvaluateGame`) | after it (`Game.Evaluated`), `C4RoundResults` (goals, fulfilled goals, playing time, each player's ID, total playing time, scores, and from its `C4PlayerInfo` name, `HasTeamWon`, client) to the module |
| a deactivated client asks the host (`RequestActivate`, `PID_ClientActReq`), refused while it is far behind | a browser whose client the module deactivated (its connection dropped) and that has caught up (`CtrlOverflow` false) sends (empty) control for the first incomplete tick, again for each newer one, until its activation is executed, the input meanwhile with it (one message per new tick: control for all the complete ticks at once ran into the server's 200 messages a second); control for a tick sent already goes with the next one |
| a client that lost its connection is removed | back in the round (`RoomStarted` again, or the page reloaded and the lobby's Rejoin), the page starts the scenario again and the module's `History` (every tick so far) is executed from frame 0; control for the ticks before `resume` is not sent again (the module has it), so what the browser decided again while executing them (its join request, its join) is not repeated |

The `Lockstep` class of the module's first version (a TypeScript rewrite of `C4GameControlNetwork`'s client logic for a
`LockstepGame` interface) is gone: the original's translated code does that now. `C4Network2Players`, whose host part is
now done by every browser, is written in `src/net.ts` from the original's functions (the original's version sends by
network resource and needs the host's lobby). The page (`src/lobby.ts`): the main menu's "Network game" (in the original
`C4StartupNetDlg`, the list of network games) opens the scenario selection in network mode (`SDID_ScenSelNetwork`, which
the network dialog's "Create game" opens in the original); a scenario started there stops before `C4Game::Init` (the page
does not run the main loop's next round while `AppState` is `C4AS_StartGame` with `Game.NetworkActive`) and the site's lobby
(`ctx.lobby`) opens: the list of rooms (join, or Rejoin a running round after a reload) and a new room with the chosen
scenario and the original's network settings (`Config.Network.ControlRate`, `ControlMode`, `AsyncMaxWait`) as options.
Why before `C4Game::Init` and not in the original's lobby: the original's lobby is a modal loop inside `C4Game::Init`
(`C4Network2::DoLobby`), and the site's lobby is the page's (a DOM dialog with its own promise), not the original's GUI;
before the start the page can wait for it without suspending the original, and every browser then starts the same
scenario from the same seed. Cancelled, the original goes back to its start menu as after an aborted lobby
(`C4GameLobby::UserAbort`, `QuitGame`). When the original is back in its menu after the round, the page leaves the room.

Catching up: the original's main loop does not wait while the game short-circuits its timer (`C4Game::Ticks`:
`GameGo`, which `C4GameControl::Ticks` sets while the complete control is `C4ControlOverflowLimit` ticks ahead, then
`Application.NextTick`); the page ran one round of the main loop per animation frame, so a rejoined browser caught up at
the original's speed and never reached the others. `src/app.ts frame()` now runs more rounds within an animation frame (at
most 10 ms) while each one executed a frame and `GameGo` is set (also the original's full speed).

### Online: where it stands (15.11.2026)

`test/online-e2e.test.ts`, two headless Chromiums (SwiftShader, 480x360) against the real server
(`server/target/freegames-server.jar`), Arena's Flint Brawl, control rate 3: both players join through their control (the
join request, then the join with the player file), walk and jump with keys; both run at about 27 frames a second in
lockstep (PreSend 1 on localhost), every 100 frames their sync checks agree, and the state (frame, objects, every player's
number, name, client and crew positions) is the same in both at frames 200 and 400. Then the second page is closed and
opened again (as a reload): it rejoins the running round (the lobby's path, `rooms.join` of the room it is still seated
in), gets the module's `History` (about 530 ticks), executes them from frame 0 while the other plays on alone, catches up,
asks to be activated, is activated, and both play on in lockstep with keys of the rejoined player: the same state at frames
200 and 400 (executed again) and at two later frames, the rejoined player's control executed. A second round: one browser
draws one synchronized random number at frame 150 that the other does not; at frame 200 the module finds the sync checks
different and ends the round (`Results {desync, 200}`), and both log the original's "Network: Synchronization loss!". The
start menu's way in is `test/menu.test.ts` ("a network game from the start menu"), with stand-ins for the site's lobby and
the module: "Network game" opens the scenario selection in network mode, the Arena's Flint Brawl starts after the
original's warning that more players must join, the lobby gets the room options (the scenario, `Config.Network`'s control
rate), the round runs as client 1 in `CM_Network`, the player joins through the control and its sync checks go out.

Tests (15.11.2026): all 88 tests of `web/games/openclonk/test` pass, 2 skipped (the count without `OC_COUNT`, the
FreeType oracle not built in this worktree; the five tests of the TypeScript `Lockstep` are gone with it, the two online
end-to-end tests and the start menu's network game came); `mvn -B -f pom.xml test`: 319 tests pass (slipstream 25,
server 294, of them `OpenclonkModuleTest` 12, the module unchanged); `npx tsc --noEmit` and `npm run build` pass
(OpenClonk's download 74.0 MB). The debug records of the simulation (`src/sim`) are untouched by this milestone.

Open: an oracle of the original for online rounds (a record of the port's round replayed by the original's headless
server, as `oracle/debugrec.sh --replay` does for local records: a network client's record has no sync checks, since the
host's are compared, so the original's replay could only be compared through debug records the port would write in the
browser); a round that runs already cannot be joined (the original sends a newcomer a savegame; the module is not drop-in);
votes (kick, pause) and changing the control rate during the round are left out; async mode is tested with the module's
loopback clients only, not with browsers.

## The oracle of the simulation: the original's debug record

`oracle/debugrec.sh <scenario> [name] [seconds]` lets the original's headless server play a scenario and record it,
then replay the record with `--debugrecwrite`: the original's own desync check (`C4Playback::Check`) writes every step
that matters for the game state to `work/dbgrec/<name>.rec` (random numbers, created, executed and removed objects,
landscape pixels, mass movers, every script function call with its arguments, ...). The port turns its own
`AddDbgRec` calls into the same bytes (`src/rt/debugrec.ts`) and `test/debugrec.test.ts` replays the same record
(`test/data/<name>-record.ocs`) and compares the two streams chunk by chunk and names the first difference; without
the original's file it compares the hashed blocks of `test/data/<name>-dbgrec.json` (`tools/dbgrec-fixture.ts`).

Neither of the original's runs ends by itself. Without players the round is over when the scenario's goal sees
nobody (frame 35), but the server runs it on; and a replay does not end with its record: `C4Playback::ExecuteControl`
reaches the record's last chunk (`RCT_End`, which `C4Record::Stop` writes 37 frames after the last control) and sets
`Finished`, but the next frame returns at `currChunk == chunks.end()` before it would call `Finish`, so the game goes
on without control (the replay logs no "Game over"). `debugrec.sh` stops each run after `<seconds>` with SIGINT, which
the original takes as `Application.Quit` between two frames: the debug record ends with a whole frame (its last chunk
is `C4Game::Execute`'s `eGame`; the fixture tool checks it). The test runs the port's replay for exactly those frames
and requires the whole record and nothing more. (The port's extra `Block Ticks` after Acid Drilling's last chunk was
the first chunk of the next frame, which the stopped original did not run.)

Scenarios without players (14.11.2026; `debugrec.sh ... 15` for the four new ones, 20 for Acid Drilling), one of each
scenario folder:

| Scenario (folder) | Frames | Chunks | Equal | What it needed |
| --- | ---: | ---: | --- | --- |
| Acid Drilling (Missions) | 682 | 2,366,515 | all | the steps in the table below |
| Robber's Cave, `Tutorial05` (Tutorials) | 482 | 1,461,499 | all | `C4Game::GRBroadcast` puts a `~` in front of the function's name with `std::string::insert(0, 1, '~')`, which the runtime's `StdString` did not have (it inserted nothing, so every `GameCallEx` was an error: "Undefined function: OnClonkCreation"); `C4GameObjects::CrossCheck` (collisions and collection, every frame) was on the `SKIP` list as a "developer check": translated, with the range-for variable `ball` boxed (`C4AulParSet(ball)` forwards its address) and its forward `goto` out of three loops |
| Acid Rift (Worlds) | 474 | 1,533,237 | all | the map script: `C4MapScriptHost::InitializeMap` (`std::tie(*fg, *bg) = pair`; `&sfcMap` of a `std::unique_ptr` is a box, `*p` of a pointer to one reads it), `C4MapScriptMatTexMask::UnmaskSpec`/`Init` (no longer skipped), an array indexed by a `bool` (`ymove[inside != !dir]`: clang writes no conversion, JavaScript's `a[true]` is undefined); the scenario parameters (`player/C4ScenarioParameters` translated instead of a stand-in that left `SCENPAR_*` undefined; `&pair.second` of a library class is a pointer to the field) |
| Rock Bottom (Arena) | 499 | 605,223 | all | the scoreboard's cells (`GetScoreboardData` reads them back): `gui/C4Scoreboard.cpp` translated, its dialog (`C4ScoreboardDlg`) an empty class; `rt/headless.ts` has the GUI screen `pGUI`, which cannot show a dialog, so `ShowRemoveDlg` deletes it as the original's does for a dialog that fails to show |
| Boomrace (Parkour) | 503 | 420,879 | all | the Parkour goal's message-board command (`AddMsgBoardCmd`): `C4MessageInput`'s command list in `rt/headless.ts` (a GUI class, but `C4ControlMsgBoardCmd` runs its scripts); the graphics overlays' facet (`C4TargetFacet::Set`, `graphics/C4FacetEx.cpp` translated as far as the simulation reaches it) |

Records written by the port are a separate oracle ("The input oracle" below).

### The input oracle

`test/input.test.ts`: the port plays Acid Drilling with a local player (`boot({ playerName, record: true })`) for 300
frames; keys go in as the page sends them (`src/input.ts`: `C4PlayerControl::ProcessKeyDown/Up`, the WASD set: D, W,
A, ...), and the clonk walks, jumps and stops. `C4Record` writes the record as the original's `--record` does
(`C4GameSaveRecord`, the player infos, `CtrlRec.ocb` with the join packet and its packed player file, the key
controls, the sync checks every 100 frames, `RCT_End` from `C4GameControl::StopRecord`). The original's headless
server replays that record (`oracle/debugrec.sh --replay <record> <name> [seconds]`) with `--debugrecwrite`, and the
port replays the same record: the original logs no desync ("Network: Synchronization loss!" of the sync checks,
"Playback error") and both write the same debug record. The committed record (`test/data/input-record.ocs`, 76 KB,
packed by the original's `c4group`) with the original's debug record of it (`input-dbgrec.json`): **all 2,382,425
chunks over 489 frames equal**, with two players joining (the local "Clonk" and the scenario's script player), the
HUD's script GUI, the key controls and the clonk's walking and jumping. With players the original's debug record goes
on after its last frame while the stopped game is cleared (the players' removal); the fixture and the tests take the
whole frames (37,722 chunks left out here).

What it needed: the full scenario path (`boot.ts SYSTEM_DATA`, `/usr/share/games/openclonk/` as the original's Linux
build installs it: `C4GameSave` copies the scenario from `Game.ScenarioFilename`, and `C4GroupSet::RegisterParentFolders`
never checks a first path component right below the root); `TempPath` (`/tmp/`, the packed player file of a join);
C's `remove()` (the translator took it for `std::remove`, so `EraseFile` failed); `(T *)` of a `void *` into a buffer
reads its bytes as T (`rt $reinterpVoid`: `StdCompilerBinRead` read a `uint8_t` sign-extended and an `int32_t` as one
byte); struct byte views (above); `C4NetIOPacket` (a `StdCopyBuf` with an address: the copy of a control packet is
`unpack(pack())`) and the empty network addresses in `rt/headless.ts`; and the script GUI: with
`C4Game::GRBroadcast` fixed, every player's HUD opens script GUI windows (`GuiOpen`), so `rt/scriptgui.ts` keeps
`C4ScriptGuiWindow`'s synchronized part as the original does (IDs from the root's counter, which every Call action
also counts, sub-windows by name and ID, priority order, `OnClose` calls, `ClearPointers`) until the GUI is translated.

Open: the port's `C4Group_PackDirectory` does not pack the record (it stays a folder; the test packs it with the
original's `c4group`); one scenario and one key sequence so far.

How Acid Drilling's record became equal (14.11.2026), chunks the port made the same:

| Chunks | First difference | Cause, fix |
| ---: | --- | --- |
| 401 | `Format("$DefaultStack$", 1)` where the original calls `Format("x%d (Default)", 1)` | the scripts' `$...$` strings were never replaced: `C4LangStringTable::PopulateStringTable` was on the translator's `SKIP` list, and a skipped function becomes an empty body. Fixed: the translator types a local unnamed enum as an integer, so the function is translated |
| 401 | the same | `std::make_pair` kept references to its arguments, and the string-table loader clears its key and value after inserting them, so every entry ended up empty. Fixed: `StdPair.make` copies, as C++ does (10 modules use it) |
| 9,341 | `GetMeshMaterial()` of `Deco_AltMaterials` returns nil, the original's `"DefaultChest"` | the mesh library was a stand-in (`rt/headless.ts`). Fixed: `lib/StdMesh*`, `C4DefGraphics`, `C4MeshAnimation`, `C4MeshDenumerator`, `C4Record` and `C4Shape::CompileFunc` are translated and their stand-ins are gone. The translator now resolves a class name printed without its namespace from where it is written (`Ogre::Mesh::Chunk` and `Ogre::Skeleton::Chunk`; the parameters of a called method are looked up in its class), names a template over a lambda by `lambda`, keeps function-pointer template arguments as clang prints them, resolves a class's typedefs of library containers (`ShaderMap`), numbers alike instances of one member template (`StdMeshMaterialSubLoader::Load` for techniques, passes and texture units), makes an out-of-class specialization of a member template a method of its class (`DataStream::Peek<std::string>`), translates `typeid` (a class), `std::istringstream >>` (rt `IStringStream`), `std::make_tuple`, `(const float *) bytes` (rt `$reinterp`), unions of several structs, `#pragma pack` in `sizeof`, and `memcpy` into a local of a number type (a typed-array box); `catch (std::exception &)` no longer catches the port's own JavaScript errors. The runtime orders `std::string`s and pointers in maps and sorts, `std::make_pair` copies class values only, `C4Surface` reports the image sizes (no pixels, `rt/headless.ts`). Translator runs take 2 minutes instead of 8 (a function is translated once, not in every round) |
| 889,185 | `RCT_RotVtx2` of `C4Shape::Rotate`: the field `r` | the original never sets it (stack garbage: the angle of the `RCT_RotVtx1` struct before). Not compared (`UNSET` in `rt/debugrec.ts`) |
| 889,457 | `GetAnimationLength("Rotate1")` of `LargeCaveMushroom` | the skeleton's animations were lost: `std::make_pair(path, shared_ptr)` cloned the skeleton. Fixed in the translator (`make_pair` copies class values, not pointers) |
| 891,263 | `SetOwner(-1)` on a chest (`Object(164)`, `GetOwnerOfPosition` returns `NO_OWNER`), the port `SetOwner(0)` | `const int NO_OWNER = -1` (C4Constants.h) was a global set up after the script constant table that reads it. Fixed: the translator folds a `const` integer with a constant initializer, as C++ does |
| 905,219 | the bat's `SetXDir(-5)` (frame 1), the port `SetXDir(0)` | `std::min`/`std::max` of `C4Real`s compared the objects as JavaScript does (always the first): `RedirectForce` took all of the force. Fixed: `std::min`/`max` of a class use its `operator<` (rt `$minBy`/`$maxBy`) |
| 954,289 | frame 35: the original ends the frame, the port calls the game-over scripts | the original's debug record is written while it *replays* its record, and `C4Game::GameOverCheck` does nothing in a replay. Fixed: the port replays the same record (`oracle/debugrec.sh` keeps it, `test/data/aciddrilling-record.ocs`; `boot({ replay })`). For that the translator calls functions through pointers and function-valued fields with their reference parameters (the material reactions' `int32_t &`, which `rt/headless.ts` boxed by hand before), no longer skips the network/record array adaptors, and the default user folder is the original's on Linux |
| 1,212,718 | frame 155: the original goes on with `Block PlrEx`, the port scans a material (`MatScan [616]`) | functions on the `SKIP` list were still empty bodies. Fixed: the translator now translates forward `goto`s (`C4Shape::LineConnect`), pointers to data members (`C4ID`'s safe bool), nested compound assignments (`C4Landscape::FindMatPathPush`), `std::function` tests (`C4PathFinder::Find`), `C4Command::Get`, value-initialized `std::array`s, and byte views of record structs (`getBufPtr<T>`); the runtime fills ranges as C++ assigns them |
| **2,366,515** (all) | after the original's last chunk the port wrote one more (`Block Ticks`) | the whole record is equal. The extra chunk was the next frame's: the original was stopped there (see above); the test runs the original's 682 frames |

The functions still on the `SKIP` list are presentation, developer tools or `C4TextureMap::LoadMap` (the stand-in
below has its own); no scenario of the oracle reaches them. `NOT_PORTED` names functions that fail when they are
called: the TinyXML loaders of Ogre XML meshes and skeletons (`planet/` has only binary ones) and
`C4Playback::StreamToRecord`. Not in the oracle yet: `C4MapCreatorS2` (`Landscape.txt`: Parkour's Cavern,
BristleRidge, ShiverPeak, VolcanoEscape; translated since 15.11.2026: its attribute table's pointers to data members
reinterpreted between member types are the fields' names, its enum lives in an anonymous namespace), the script GUI
`C4ScriptGuiWindow` (`GuiOpen`: Parkour's Aerobatics, Arena's IAmRich, the first tutorials; translated in the game
profile).

Stand-ins left in `rt/headless.ts`: `C4TextureMap` (landscape/C4Texture: the texture table with average colour 0),
the `C4Fixed` division by zero, `C4MessageInput`'s message-board commands (the list as the original keeps it).
`C4Surface` there is presentation (sizes, no pixels), so are `pGUI` and `C4GameOverDlg::IsShown`. `C4Config` is the
minimal object of `rt/sim.ts` (config/C4Config is not translated), with `C4ConfigGeneral::CreateSaveFolder` for the
records.

Pointers to the bytes of plain structs: `(void *) &s` and `(BYTE *) &s` of a struct of numbers and arrays of numbers
are `rt/ptr.ts` `$bytesView` (the struct's layout from the translator; reading and writing the bytes reads and writes
the fields), so that `C4Group` writes and scrambles its headers and entries and `C4Record` its chunk heads as the
original does; before, those calls got the objects and a packed group could not be written. `errno` is one cell
(`CreatePath` reads it after `mkdir`).

The committed `src/aul/` was not written by the translator as it is now (nor by the one of the earlier attempt): it
is older. A fresh `translate.py --aul` differs (C4Config, network and player-control modules) and fails
`aul.test.ts` (the standalone `Config` has no `General`); it is left as it is until the standalone profile is
translated again with the stubs it needs.

The translator takes about 2 minutes for the simulation profile (`translate.py --sim`, one CPU); two profiles or
variants can run side by side (a copy of `tools/` next to it translates with another `config.py`).

## Milestone 2: what is ready, what waited for the translator (14.11.2026, branch `openclonk-page`)

Built beside the alignment of the simulation, without touching the translator or the translated modules.

**Ready:**

| Part | Where | Checked by |
| --- | --- | --- |
| content for the page: the groups packed by `tools/pack.sh --out web/games/openclonk/assets` (System 0.1, Graphics 2.0, Material 4.6, Sound 19.2, Objects 29.2, Decoration 8.5, Tutorials 0.4, Parkour 3.3 MB at Play = 71.3 MB with the four non-commercial files; Missions 7.9, Worlds 2.9, Defense 1.0, Arena 1.3, Music 33.6 MB lazy). Not committed (113 MB): the build needs `pack.sh` first; a deploy needs it on the deploying machine, or a decision to commit them | `src/content.ts`, `src/groups.ts`, `game.json` `lazyAssets` | `test/content.test.ts` |
| `NONCOMMERCIAL_FILES` in the build: Vite emits files named by imports even in dead code (tried: `if (false)`, a constant ternary, eager and lazy globs all emitted them), so the loader names the four files in a `// build-if ./settings.ts NONCOMMERCIAL_FILES` block that `web/scripts/build-if.mjs` (a `pre` plugin in `web/vite.config.ts`) blanks when the setting is off. Two real `npm run build` runs: on, `WindLoop-*.ogg`, `GlassShatter-*.ogg`, `StartupDlgPaper-*.png`, `StartupPlrPropBG-*.png` in `web/dist/assets` (same bytes as the originals) and in the Play download; off, none of the four (by content and by name) | `src/content.ts`, `web/scripts/build-if.mjs` | `test/content.test.ts` (the loader as Vite gets it, both states) |
| the page: scenario list (Title.txt titles, EntrySortFunc's order), start with `time()` as seed, the game timer, keys, Esc leaves, the canvas cleared through `rt/gl.ts` and one line of text; an engine that stops is shown with its log | `src/index.ts`, `src/scenarios.ts`, `src/timer.ts`, `src/keys.ts`, `src/input.ts` | `test/page.test.ts`; headless Chromium against `vite preview`: Sandbox runs at 39 frames a second, Tutorial01 stops in the script GUI and says so |
| game timer: `C4ApplicationGameTimer` runs one game tick per expiry of its 26 ms timer (its `tLastGameTick` stays `NegativeInfinity`, so the condition with `iExtraGameTickDelay` is always true); `SetGameSpeed(s)` sets the timer to `1000/s` ms below `MaxRefreshDelay` (30), else to 30 ms | `src/timer.ts` | `test/page.test.ts` |
| keys: `KeyboardEvent.code` is the SDL scancode, `C4AppSDL.cpp`'s table gives the K_ code, the engine finds it by its `KeyCodeMap` name. The original's entry `Game.DoKeyboardInput` cannot run yet: it asks `pGUI` (gui/C4Gui*, not translated) for the keyboard focus, and `C4KeyboardInput::DoInput` reaches the controls through `C4KeyCB*` callbacks, which hold member-function pointers and are empty shells in the translation (`rt/headless.ts`). `src/input.ts` does DoInput's last-key data and calls `C4PlayerControl::ProcessKeyDown/Up` until both are there, then switches to `DoKeyboardInput` by itself | `src/input.ts` | `test/page.test.ts` (the key chain against both tables of the original; D reaches Acid Drilling's player) |
| OpenGL: the 110 functions of OpenGL 3.2 core, libepoxy and SDL-GL the original calls (`tools/gl.txt`), as `gl$<name>` on WebGL2. Under epoxy the syntax trees call the function-pointer variables `epoxy_glFoo`: the translator maps `epoxy_<name>` to `gl$<name>`. Bridged: BGRA pixel data, 1D textures (height 1), `glDrawElementsBaseVertex` (attributes re-pointed), `glMapBuffer` (a copy uploaded on unmap), `glGetTexImage` (through a framebuffer), unsized `GL_RED` float data (R8, as a desktop driver stores it), `GL_CLAMP` (invalid in the 3.2 core profile there and here); no effect: `glPolygonMode` (debug wireframes), KHR_debug | `src/rt/gl.ts` | `test/gl.test.ts` (every call of the original's sources is provided; struct layouts); `test/shaders.test.ts` (draws with the original's sprite shader through `gl$`: `C4BltVertex` objects, BGRA texture and read-back, row-major matrices, base vertex) |
| shaders: `C4Shader` builds every program with `#version 150`. `rt/glsl.ts` rewrites in one place: `#version 300 es` and highp precisions (needed by all 214 programs: the fragment shaders have no default float precision, `sampler2DArray` none at all); `sampler1D` to `sampler2D` with `texture(s, vec2(x, 0.5))` (the landscape's material map; the two landscape programs); implicit int-to-float conversions made explicit (`LandscapeShader.glsl`: `float materialIx = int(...)`, `materialDepth - 1`; the Ambience's "Psycho" script shader: `scalerPx.r < 1`). Five lines change; with them all 214 programs (428 with planet's two script shaders) compile and link in headless Chromium: 16 sprite, 4 sky, 2 landscape, 2 fog of war, 190 mesh programs (every construct of `GetFragmentShaderCodeForPass`, both bone workarounds, the `NormalMap` custom program, each with and without light and Mod2) | `src/rt/glsl.ts`, `test/shaders.ts` | `test/shaders.test.ts` |
| sound: the Linux build uses OpenAL (with ALUT and libvorbisfile; `cmake/FindAudio.cmake` prefers it to SDL_mixer). The 45 functions it calls (`tools/al.txt`) as `al$<name>` on WebAudio (`ctx.audio`). Decoding: browsers decode Ogg Vorbis only asynchronously, so the page decodes the Ogg files before the start (`decodeOggVorbis`: at the file's own rate, rounded to 16 bits like `ov_read`) and `ov_*` serve them synchronously; WAV is read directly (ALUT). EFX (sound modifiers) is reported missing: the original then plays without modifiers. Chromium and Firefox decode Ogg Vorbis; Safari only in recent versions | `src/rt/al.ts` | `test/al.test.ts` (every call provided; WAV; VorbisLoader::ReadInfo's sequence), `test/sound.test.ts` (Chromium decodes three original files to exactly their sample count; an OpenAL source plays one, panned right) |

(Counted before the oracle work of 14.11.2026 afternoon, which translated the scoreboard and the scenario parameters, keeps the message-board commands and the script GUI's synchronized part, and fixed `GameCallEx`; not counted again.) Which scenarios the engine starts and runs for 200 frames today (headless, all 58 of the six folders): 28. The
others stop in parts that are not translated: `C4ScriptGuiWindow` (Tutorial01, 02), `C4Scoreboard` (six Arena
scenarios), `C4MessageInput::AddCommand` (Parkour Aerobatics, Boomrace), the teams' and player infos' array adapters
`mkArrayAdaptMap` (eleven), `C4MapCreatorS2` (DeadlyGrotto, BristleRidge, Cavern), graphics overlays
`C4GraphicsOverlay::SetID` (Tutorial04, 07, 08), mesh skeletons (Raid), `C4FacetSurface::Create` (MtBrame), a
`BigInt` conversion (Tutorial03). The page shows these as what they are.

### The game profile (`src/gen`, 15.11.2026)

`translate.py` without `--sim`/`--aul` translates the game (`tools/units.txt`, the `openclonk` target of `work/full`
with SDL2, OpenGL 3.2 and OpenAL): the simulation of `units-sim.txt` plus drawing (`graphics/*`, the landscape's
renderer, the sky, particles, the fog of war, viewports, `C4GraphicsSystem`, `C4FullScreen`), the in-game GUI
(`C4ScriptGuiWindow`, `C4Gui*`, `C4Menu`, the message board, the mouse, the scoreboard, the message input, the upper
board, the key-binding callbacks), sound and music (`platform/C4Sound*`, `C4Music*`), the application, its SDL window and
main loop (`C4Application`, `platform/C4App*`, `C4WindowSDL`, `StdScheduler`, `StdSchedulerPoll`) and the start menu's
frame `gui/C4Startup` (its dialogs are milestone 3). 209 modules, no translator error.

Memory. The syntax trees of the game's 183 units were 3.9 GB of JSON after pruning, and pruning itself loaded each
unit's raw dump (C4Game.cpp: 1.4 GB of JSON) whole into Python, eight at a time: the machine ran out of memory once.
Now `prune.py` reads clang's dump one top-level declaration at a time (peak 430 MB per unit, the same output as before
modulo addresses, checked for C4Real and C4Menu), `ast.sh` runs `shrink.py` (each inline body once) over all trees
(870 MB), and the translation of the game profile peaks at **5.4 GB** (`/usr/bin/time -v`, 4 to 5 minutes; every heavy
job runs in `systemd-run --user --scope -p MemoryMax=...`).

What the translator learned for it (each from an error of the game profile): the C libraries' enums and number
typedefs from their headers (`tools/libenums.h`, `libenums.py`, written by `ast.sh` into `work/libenums.json`: SDL's
`SDL_Scancode`, `KMOD_*`, `SDL_GL_*`, GL's `GLuint`, ...; only the libraries' own prefixes, not X11's `Window`);
`offsetof` (clang's JSON does not name type and member: `prune.py` reads them from the source, through one level of a
function-like macro, `VERTEX_OFFSET`); integers as pointers into OpenGL buffers; `while` with a declaration;
`for` initializers of several kinds; pointers to data members of anonymous unions (`C4ParticleValueProvider`);
typedef'd unnamed unions (`C4ScriptGuiWindowProperty::Prop`); local unnamed structs; generic lambdas; user-defined
string literals; references to `std::unique_ptr`s (`auto &strategy = c ? a : b;` and range-for over an array of them);
references to arrays (`auto &v = s.intVec`, printed `int &[4]`); a static array declared without its size; classes
derived from `std::vector` (`C4RectList`, a JavaScript array); C library structs as objects (getopt's `option`,
`pollfd`, `ov_callbacks`, `itimerspec`, copies and assignment); `std::replace`, `transform`, `set_difference`,
inserters, `sregex_token_iterator`/`cregex_token_iterator` (`C4TextureMap::LoadMap`, no longer skipped), `stoul`,
`chrono`, `uniform_real_distribution` (libstdc++'s draw), `std::get` of tuples, stream `peek`/`get`/`put`/`>> ws`,
vector `capacity`/`reserve`, copies of library iterators, exceptions by class (`$isException`), the constants of
opaque modules. Plain structs get their C++ layout as `static $layout`, which `memcpy` into bytes and OpenGL uploads
use. `DrawCrewOverheadText`, `KeyCode2String` and the markup tags are no longer skipped in the game profile.
`PretransformMeshVertices` is `NOT_PORTED` (only for the workaround `ForceSoftwareTransform`, which C4DrawGL never sets).

What the runtime gives the game (`src/rt`): libpng and libjpeg (`libpng.ts`; `libjpeg.ts` follows libjpeg-turbo's
default decompression: Huffman (baseline and progressive), the islow IDCT, fancy upsampling h2v1/h2v2/h1v2 with their
rounding, jdcolor's YCbCr tables; the content has 174 JPEGs, 126 of them progressive), threads on one thread
(`threads.ts`: `StdThread`, `CStdEvent`, `CStdCSec`; the particle thread runs when its event is set, the screenshot
writer at once), the scheduler's descriptors (`eventfd`, `timerfd` on `performance.now()`, `poll`: the game timer is
the original's timerfd of 26 ms, so the game runs at the original's 38.5 frames a second whatever the display's rate),
`getopt_long`, `HOME`, `readlink("/proc/self/exe")` (`/usr/local/bin/openclonk`), `setlocale`, `setjmp`/`longjmp`,
`GetResStr` (the original's regex on JavaScript's RegExp), `StdMesh_tim_sort` (timsort is stable: any stable sort by
the same comparator gives its result), WebGL2 contexts made with what the original asks SDL for (depth, stencil,
multisampling), music decoded while it plays (`al.ts`: the first 24 s of each piece before the start, the rest when the
original opens it).

### The page on the original's application (`src/app.ts`)

The page starts the original as the installed game is started: `C4Application::Init` with the command line
`openclonk --fullscreen ~/.clonk/openclonk/Clonk.ocp /usr/local/share/games/openclonk/<scenario>` (`--fullscreen`: the
game, not the editor, which the original opens for a scenario on its command line); the content mounted where the
Linux build looks for it (`OC_SYSTEM_DATA_DIR`), the player file where its player selection writes it. Each animation
frame runs one round of the original's main loop (`C4AbstractApp::Run`: `ScheduleProcs(0)`): `FlushMessages` hands the
page's events to the original's `HandleSDLEvent` (keys by scancode, text input, mouse motion, buttons, wheel, the
canvas's size), and the game timer runs `GameTick` and `Draw` when it has expired. The page's own timer, keys and input
modules (`src/timer.ts`, `keys.ts`, `input.ts`) remain for the headless tests of the simulation.

### Milestone 2: where it stands (15.11.2026, evening)

**Tutorial01 plays on the page** with the original's drawing, controls and sound: in headless Chromium (WebGL2 on
SwiftShader) the original loads it, draws the landscape, the sky, the meshes (clonk, palms, wipf) with their skins and
bones, the light and fog of war, the particles, the HUD, the guide's script GUI dialog and the message board; three
mouse clicks on the dialog's "Next message" finish the intro (the scenario switches the player's controls on only
then), and W, A, D walk and jump the clonk over the bridge, all through the original's paths (`HandleSDLEvent`,
`C4GUI::MouseMove`, `Game.DoKeyboardInput`, the default control set, `C4ControlPlayerControl`, the scripts). Checked for
3,000 frames with walking and jumping, no error. `test/play.test.ts` plays it so (and the sound below).

What the frames after the first needed (each from a stop or a wrong picture in the browser):

| Symptom | Cause | Fix |
| --- | --- | --- |
| stop in `C4ParticleValueProvider::FloatifyParameterValue` | `this->*value /= d`: the address of `obj->*field` was null | translator: `&(obj->*field)` is `P($memberOf(obj, f), $memberKey(f))` |
| stop in `C4ParticleChunk::Draw`, then `DeleteAndReplaceParticle` | `reinterpret_cast<GLvoid *>(offsetof(...))` became a magic pointer; `std::copy` into a vector of vertex structs | runtime: `rt/gl.ts` reads such pointers as offsets; `std_copy` assigns into arrays of class objects |
| sky, landscape and every mesh black, the GUI fine | `C4Surface::ReadJPEG`: `buffer[0] + i * components` lost its `[0]`: libjpeg's `JSAMPARRAY` was an unknown class, and `p[0]` of a pointer to a class is the object itself. Every JPEG (the sky, the material textures, the meshes' skins) was black | `tools/libenums.py` records libjpeg's pointer typedefs (`JSAMPROW`, `JSAMPARRAY`, `JSAMPIMAGE`) |
| the clonk black, its two-texture material on one sampler | `StdMeshMaterialProgram::GetParameterIndex`: `std::find` of a `const char *` in a vector of `StdCopyStrBuf` compared objects, so `oc_Texture1` was never set | translator: `std::find`/`count` of a value of another type use the element class's `operator==` for that type |
| bones: `uniformMatrix4x3fv: invalid size` | `&bones[0].m[0][0]` of a `std::vector<BoneTransform>` read only the first row | translator: `&obj.m[i][j]` of a 2-D array field is `rt $rowp`, which `rt/gl.ts` reads on through the next rows and objects |
| the parallax sky's zoom stayed, programs stayed bound | locals whose destructors draw were never destroyed | translator `config.RAII`: `ZoomDataStackItem`, `C4ShaderCall`, `ScopedLocale`, the script uniforms' `Popper` (in its `std::unique_ptr`) |
| the object lists slowed down | every range-for over a `C4ObjectList` registered its begin and end iterators for good | translator `config.RAII_ITERATORS`: they unregister after the loop |
| `this.pPathFinder.SetWaypoint is not a function` (the wipf's `MoveTo`) | a functor (`ObjectAddWaypoint`) made a `std::function` stayed an object | translator: wrapped with `rt $fn` |
| struct copies shared rows (`BoneTransform::m`) | `$assign` of arrays of arrays or of class values copied only the outer array | translator: deep copies, the copies know their places |
| half a million entries in proplists' reference sets after 1,000 frames, the heap growing by 0.6 MB a frame | `C4Value` locals of the C++ code never ran their destructor (`DelDataRef`), so every one stayed in its proplist's `Refs` | game profile: `C4PropList::RefSet` is `rt WeakRefSet` (weak, with a count that does not depend on the collector; see its comment). The headless simulation keeps the plain set: a `WeakRef` keeps its value alive until the running task ends, and a test's replay is one task |
| music did not load | `rt/al.ts` passed `size_t` as BigInts to the original's Ogg read callbacks, which the translator gives as numbers | `rt/al.ts` |

The screenshot oracle (`oracle/screenshot.sh`) now works: SDL chose the desktop's Wayland compositor when
`WAYLAND_DISPLAY` was set (the game opened on the user's desktop, the X screen stayed black), nix's Xvfb offered no GLX
without `LIBGL_DRIVERS_PATH` to Mesa's DRI drivers, a fullscreen window stays 1x1 without a window manager (the game now
runs in a window of the screen's size, which draws the same), and `C4FullScreen::Execute` only requests the update:
gdb now stops after `C4GraphicsSystem::FinishDrawing` (the buffers swapped).

**Screenshot comparison** (`test/screenshot.test.ts`, Acid Drilling's input record at frame 300, 1024x768, the
original with Mesa llvmpipe, the port with Chromium's SwiftShader): 99.7 % of the pixels within 48 of the original's
in every channel, mean difference 0.5. The differences (`re/openclonk/work/shot/diff-300.png`) are the edges of meshes
and sprites (multisampling and texture filtering of the two rasterizers), the clock in the upper board (wall time since
the start: the port runs slower) and the crew portraits' animation phase.

**Sound**: in headless Chromium with an AudioContext the content's sounds are decoded before the start, and Shiver
Peak's wind loop and the music system's music come out of the page's AudioContext (`test/play.test.ts` meters the
output after `rt/al.ts`'s master gain); with `NONCOMMERCIAL_FILES` off the scenario runs the same without the wind
sound, which is then missing from the sound system.

**Speed**: in headless Chromium on SwiftShader (software rendering), Tutorial01 runs at about 11 frames a second
instead of 38.5: 3,000 frames took 274 s, a fifth of it idle (the GPU process). A browser with a GPU is needed to see
the original's speed; not measured here.

**Scenarios** (all 58 of the six folders, each started on the page in headless Chromium at 640x480 with the player
"Clonk" and run for 1,000 frames, `h/count.cjs` of the session, not in the repository): the first count, 40 ran 1,000
frames. The others:

| Scenarios | Stop | Cause, fix |
| --- | --- | --- |
| Crash, DarkCastle, DeepSeaMining, SPLIT, TreasureHunt (Missions) | before frame 0: "Access to this mission not yet granted." | the original's own check (`Scenario.txt` `MissionAccess`, the keys of `Config.General.MissionAccess` that finished missions give): a new player's config has none. Not a failure of the port; the player files and their config come with milestone 3 |
| Sandbox (Tutorials), RapidRefining (Worlds) | `Cannot access 'pars' before initialization` (`C4Landscape::DigMaterial2Objects`) | a block declared `C4AulParSet pars` again after using the outer one; JavaScript's `let` is in its temporal dead zone from the start of the block. Translator: a local that shadows one of an enclosing block gets its own name |
| MineRescue (Missions); DarkMine, FlintBrawl, HotIce, MeltingCastle, RockBottom (Arena) | `C4Sky::Init` | an empty sky list: libstdc++'s `regex_token_iterator` gives the whole (empty) text as the one part when the separator never matches, the runtime gave none. Runtime fixed |
| MoltenMonarch, Overcast, Ruins, ScorchedGardens, ThunderousSkies (Arena) | `printf: conversion %p` (`CStdFile::Create` names a file in memory `<%p>`) | runtime printf: `%p` as glibc prints it |
| the nine Arena scenarios above, then | frame 65: `C4Player::Save` (`::Network.ResList.getRefRes`), then the game-over dialog | with one player the melee goal is reached at once and the round ends (as in the original). The network's resource list is empty (`app.ts`), the player list box of the game-over dialog is translated now (`gui/C4PlayerInfoListBox`, a unit of `units.txt`), a constructor's (or destructor's) call of a method on `this` goes to the class's own method (C++ dispatches so while a derived class is not constructed yet; `C4GUI::Window`'s constructor calls `UpdateOwnPos`), and `*this = cpy` in a base class's method uses that class's assignment (`C4Facet::Set`, called by `C4FacetSurface::Set`, assigned the derived class's surface too) |

After the fixes: **53 of the 58 start and run without an error, 44 of them for 1,000 frames**. The nine Arena scenarios
of the last row are melees for at least two players (`MinPlayer=2` in their `Scenario.txt`; the original's lobby
would not start them alone): with the page's one player the round is over at frame 65 ("Game over.", the player file
saved, "Game evaluated.") and the game-over dialog waits. The five Missions refuse as the original does for a new
player. Not counted: a scenario with two players (the page starts one; online play is milestone 4).

`game.json` is no longer marked broken (still not listed): its controls are the original's default control set
(`PlayerControls.txt`, "WASD", with hotkeys and the mouse; Esc is the original's `GameAbort`, F1 its help), and its two
screenshots are of the port (`screenshots.mjs`, by `web/scripts/screenshots.mjs`: Tutorial01's welcome, then the intro
clicked through and the clonk at the bridge).

Not done yet:

* the speed on a real GPU, and the CPU's share (the profile's top: script execution, `$reinterp`/`$oat`/`$wr` of the
  runtime's pointers, the vertex uploads' `layoutBytes`);
* `C4Value` and `C4AulParSet` temporaries and locals still do not run their destructors: their proplists are held
  weakly now, but strings and arrays they refer to keep their reference counts (memory only);
* one translated tree for page and tests (below).

One translated tree for page and tests (goal of milestone 2, open): the debug-record tests still run `src/sim`. They run
the simulation headless in node, where the game profile's renderer has no OpenGL context, and the original's debug
records come from its headless server, whose build leaves the drawing code out (`USE_CONSOLE`). Using `src/gen` for
them needs either the tests in a browser (the page's replay through `src/app.ts`, as the screenshot test does, with the
debug-record chunks hashed in the page) or a headless mode of the game profile; until then `src/sim` stays, translated
by the same translator from the headless build's syntax trees (`translate.py --sim`), and both trees are written again
by every translator change (this session: both, the debug records equal).

## Milestone 3: the start menu, the player's files, savegames, all scenario folders (15.11.2026)

### The start menu

The page starts the original as the installed game is started without a scenario (`openclonk --fullscreen`):
`C4Application::PreInit` finds no scenario and opens the start menu (`C4Startup::InitStartup`). Translated (`tools/units.txt`,
`config.py GAME_TRANSLATES`): `gui/C4StartupMainDlg` (main menu), `C4StartupScenSelDlg` (scenario selection with its folders,
mission access, game options and the option buttons of `network/C4Network2Dialogs`), `C4StartupPlrSelDlg` (player selection,
player properties, crew, colour picker), `C4FileSelDlg` (the portrait selection of the player properties), `C4StartupOptionsDlg`,
`C4StartupAboutDlg` (the credits with the trademark notice) and `C4StartupLegalDlg` (the licences, `C4Licenses`), `C4GameOptions`,
`C4Folder` (the folders' `Folder.txt`), and `platform/C4GamePadCon` (below). Left out, what the site replaces
(`config.py GAME_OPAQUE`): the network game dialog `C4StartupNetDlg` (LAN, master server, lobby: the site's rooms), the mods
dialog `C4StartupModsDlg` (downloads from the mod database), the update dialog. Their main menu buttons say so in the
original's own message box (`src/app.ts leftOutStartup`). `C4StartupAboutDlg::SaveCredits` (Ctrl+S writes `Credits.txt` into
the working directory) is on the `SKIP` list. "Exit" (and Esc in the main menu) is the original's `Application.Quit`: the page
saves what the original wrote (its config) to the storage and returns to the game page (`ctx.exit()`); leaving the page with the
site's Back button is the window closed (`SDL_QUIT`): the page calls `C4Application::Quit` too, which saves the config. The
language is the browser's (`LANG` from `navigator.language`, which `setlocale(LC_MESSAGES, NULL)` answers: `IsGermanSystem`
picks German or English, as on Linux).

### Modal loops

A modal dialog of the original waits in a message loop of its own (`C4GUI::Dialog::DoModal`: `while (fShow)
Application.ScheduleProcs();`), inside the function that showed it. The first thing the start menu does for a new user is
one: `C4StartupMainDlg::OnShown` asks for a new player with `ShowModalDlg(new C4StartupPlrPropertiesDlg)`; so do its questions
and error messages (`ShowMessageModal`), the colour picker, the portrait selection, and in the game the savegame's free players
(`C4PlayerInfoList::RestoreSavegameInfos`). A page cannot wait inside a function. The translator writes such loops as generators
(`config.SUSPEND = {'Dialog::DoModal': 'ScheduleProcs'}`): the loop yields before each wait, and every function that calls a
generator directly (a non-virtual call, or a virtual call of a method that is a generator itself) becomes one too, transitively:
33 functions (`work/coroutines-gen.txt`: `Dialog::DoModal`, `Screen::ShowModalDlg`, `ShowMessageModal`, the dialogs' handlers,
`C4Game::Init`, `C4Application::GameTick`, ...). Where a function that is no generator would call one (a virtual call that only
an override answers with a generator, a callback through a member function pointer, a constructor, a lambda), `rt/coro.ts
$spawn` runs it up to its first wait and keeps it; the page then resumes the innermost waiting loop each frame instead of its
own round of the main loop (`src/app.ts frame`), as the original's outer loop does not run while a modal one does. The one
difference to the original: such a caller goes on at once instead of after the dialog closed. The callers that reach a modal loop
so (`Dialog::Show` after `OnShown`, the GUI's button and key callbacks, the scheduler's timer) have nothing left to do after
the call. The simulation is not touched: no function of it waits (its member function pointers and virtual calls are checked by
class: `pointer_color`, `maybe_keys`).

What else the start menu needed of the translator and the runtime (each from a stop or a wrong behaviour in the browser):

| Symptom | Cause | Fix |
| --- | --- | --- |
| ambiguous class `CallbackButton<C4StartupOptionsDlg>` | the printed name leaves out the default `Base = C4GUI::Button`, and the options use both `<Dlg>` and `<Dlg, SmallButton>` | `program.py class_of_type`: the one-argument spelling means `Button` |
| ambiguous class `Option` | `StdSTLContainerAdapt<std::vector<C4ScenarioParameterDef::Option>>` prints its argument without its class; `C4GameOptionsList::Option` came with the scenario selection | the one the class being translated names |
| `constructor of C4KeyBinding: 2 candidates` | `std::make_unique<C4KeyBinding>(keys, ...)` with a `CodeList` (a `std::vector`) | a library class counts for a library parameter |
| `Duplicate member "CheckCondition"`: `C4KeyCB<C4FileSelDlg::ListItem>` and `C4KeyCB<C4StartupPlrSelDlg::ListItem>` were one class | template arguments named classes inside classes without their outer class | `type_node`: `Outer::Inner` (the simulation's modules only reorder their classes) |
| `Cannot access 'FullscreenDialog' before initialization` | `CallbackButton<C4StartupOptionsDlg, SmallButton>` (in `C4Gui.ts`, its template's module) extends `SmallButton` of `C4StartupOptionsDlg.ts`, which imports `C4Startup.ts`, which imports `C4Gui.ts` | a specialization whose base class's module is set up later lives in that module (`relocate_specializations`) |
| the about dialog: `std::stringstream <<`, a copied `std::initializer_list` | not translated before | `rt IStringStream.write/str`, `initializer_list` copies its array |
| `a.subarray is not a function` (`C4StartupMainDlg::UpdateParticipants`) | a `std::vector<char>` is a JavaScript array, read as a C string | `StdString.of` and the C library read C strings in arrays too |
| Return did nothing in the new player's dialog | `std::multimap` was a map: of the bindings of one key code only the first was kept (`C4KeyboardInput::KeysByCode`; the in-game menu's `FullscreenMenuOK` took Return from the GUI's `GUIEditConfirm` and `GUIDialogOkay`) | `rt StdMultiMap` (also `C4ScriptGuiWindow::childrenIDMap`); the simulation's `KeysByCode` too |
| `Cannot read properties of null (reading 'SetBounds')` (`TextWindow::UpdateSize`) | `C4GUI::Control`'s constructor calls `SetBounds`, whose virtual `UpdateSize` C++ calls as `Control`'s (the object is no `TextWindow` yet); JavaScript called `TextWindow`'s, whose windows did not exist yet | `config.CTOR_DISPATCH`: classes derived from `C4GUI::Element` keep the class whose constructor runs (`this.$dyn`), and their overrides hand a call made while a base class is constructed to that class's version |
| `pointer arithmetic on an object that is not in an array` (`StdEnumAdapt::CompileFunc` of `C4Command`, writing a savegame) | an array of a struct the translation does not name (`StdEnumAdapt<int32_t>::Entry`) was made of plain objects | `$oarr` of plain objects: they know their places |

### The player's files in the site's storage

`src/storage.ts` keeps the files of the original's user folder `~/.clonk/openclonk/` (`Config.General.UserDataPath`) that
last, one storage file each with the original's bytes (account scope, AGENTS.md server principle 6):

| Path | What | Size (measured) |
| --- | --- | ---: |
| `config` | `C4Config::Save` (INI): the options, the participants, `MissionAccess` (the missions unlocked, saved after a round by `C4Game`) | 973 bytes (a new user's) |
| `<name>.ocp` | a player file, a packed group (`C4StartupPlrPropertiesDlg`, `C4Player::Save` after a round) | 214 bytes new, 307 after a round |
| `Savegames.ocf/Title.txt`, `Savegames.ocf/<scenario>.ocf/Title.txt` | the savegame folders' titles (`CreateSaveFolder`) | 14, 15 bytes |
| `Savegames.ocf/<scenario>.ocf/<scenario><n>.ocs` | a savegame (`C4Game::QuickSave`, the in-game menu's "Save game"), a packed group | Tutorial01 at frame 368: 188,172 bytes |

Names: the path with `/` as `__` and every byte outside `[A-Za-z0-9.-]` as `_XX` (at most 64 characters: the longest
savegame name of the six folders, `Savegames.ocf__DeepSeaMining.ocf__DeepSeaMining10.ocs`, has 54). The page loads them into
the in-memory file system before `C4Application::Init` and, after every frame, writes back the kept files at or below a path the
engine changed (`rt/fs.ts takeChanges`: opened for writing, written, removed, renamed, made), in order, when their bytes
differ; a file the storage cannot keep (more than 64 files, 512 KiB per file, 4 MiB in all) is reported on the page's status line.
The log, records and screenshots stay in memory.

Savegames: the original writes a savegame as a copy of its scenario (`C4GameSave::SaveCreateGroup`: `C4Group_CopyItem`), and
the page's content is unpacked into folders, so the savegame is a folder (Tutorial01: 2,164,477 bytes: `Game.txt` 445 KB, the
two `DiffLandscape*.bmp` 787 KB each, the scenario's own files). The storage packs such a folder with the original's own
`C4Group_PackDirectoryTo` (gzip, `rt/gz.ts` at level 1 as the original's "wb1"): 188,172 bytes, well below 512 KiB, so about
twenty savegames fit the 4 MiB with the player files. Loading a savegame needed the runtime to order pointers into one array by
their places (`rt/std.ts less`): `StdCompilerINIRead::getLineNumberOfPos` looks positions up in its sorted list of line breaks
with `std::lower_bound`, and the port ordered `char *` by the order they were first compared, so the lookup failed, and the scan
for the next line break ran past the end of `Game.txt` forever.

### NONCOMMERCIAL_FILES off

The original refuses to open its start menu without its two parchment images (`C4StartupGraphics::Init` returns false, the
application quits with "IDS_ERR_NOGFXSYS"); `StartupPlrPropBG` also gives the player properties dialog its size. The smallest
deviation: with the setting off the page puts plain images of the same sizes (628x483 and 365x400, one colour of the page's
own choice, RGBA d8c8a4ff) at their places (`src/app.ts PARCHMENT_STANDINS`), so the original's code runs unchanged.
`test/menu.test.ts` opens the start menu and its player dialog in both states.

### Gamepads, local multiplayer

The original's local multiplayer: several players in one game on one computer, each with a control set chosen in the player
properties (`C4StartupPlrPropertiesDlg`, "Control"). This version's content has two sets (`System.ocg/PlayerControls.txt`):
keyboard and mouse ("WASD") and gamepad; `C4Player::InitControl` gives a second player who chose the keyboard the same keys
("Choose next while control taken // TODO" in the original), and a gamepad player without a gamepad pauses the game ("No
gamepad available"). So two players play on one computer with the keyboard and a gamepad. `platform/C4GamePadCon` is
translated; SDL's game controllers are the browser's Gamepad API (`rt/sdl.ts`: the gamepads with the standard mapping, polled
each frame into `SDL_CONTROLLER*` events, buttons and axes as SDL maps them, rumbling through the vibration actuator).

### All scenario folders: the count

Every scenario of the six folders is in the original's scenario selection (the page mounts all folders before the start;
Missions, Worlds, Defense, Arena and the music are `lazyAssets`), gated as the original gates them: the five locked missions
need the keys of `Config.General.MissionAccess` that finished missions give (`GainScenarioAccess`: Raid gives S2Raid for
Crash, Crash S2Crash for Deep Sea Mining, Deep Sea Mining S2Sea for Treasure Hunt, Treasure Hunt S2Treasure for Dark Castle;
SPLIT asks for "NEVER", which no scenario gives), and the config with them lasts in the storage (`C4Game::DoGameOver` saves it).
The scenario selection refuses a scenario with fewer players than its `MinPlayer` (the twelve Arena melees, the three Defense
scenarios, Acid Drilling and Boomshire ask for two).

`test/count.test.ts` (`OC_COUNT=1`, three at a time in their own browsers, 640x480): each scenario started as the scenario
selection starts it, with the config of a player who unlocked the missions (and "NEVER" for SPLIT), one player, two where the
scenario asks for two, run for 1,000 frames. **All 58 start and run 1,000 frames without an error** (15.11.2026, before the two
control fixes below; the milestone 2 count was 53 started, 44 for 1,000 frames: the nine melees ended at once with one player,
the five missions were locked). None ended its round within the 1,000 frames.

Two fixes of the controls came from the local multiplayer test (`test/multiplayer.test.ts`), after the count:

| Symptom | Cause | Fix |
| --- | --- | --- |
| the gamepad set's keys did nothing | the runtime's `sscanf` skipped ordinary characters of its format: `C4KeyCodeEx::String2KeyCode` tries `sscanf(name, "\\x%x")` on every key name, so "ControllerLeftStickRight" read as the hex number C (12), as did "Escape" (E) and "F1" (F1) | `rt/libc.ts sscanf`: an ordinary character must match the input, white space matches white space |
| then D no longer walked: every assignment of key D had Shift | `C4PlayerControlAssignment::ResolveRefs` copies a referenced combo's keys into its own (`for (auto item : ref->KeyCombo) { item.Key.dwShift \|= ref_shift; ... }`, `NewCombo.insert(end, ref->KeyCombo.begin(), ref->KeyCombo.end())`) and then adds its shift states to them (`for (auto &i : KeyCombo) i.Key.dwShift \|= shift`): the translation took the referenced keys themselves, so "Shift+CON_Right" put Shift on D's own key; the wrong key names had hidden it | the translator copies a range-for's class value when the body changes it (`emit.py mutates`), and `vector::insert` of class values copies them (`seq_insert`) |

### Tests of milestone 3

`test/storage.test.ts` (node, a fake storage: the kept files and their names, loading, writing back in order and only what
changed, removing, a folder group stored packed, the limits), `test/coro.test.ts` (the modal loops' coroutines, nested),
`test/sdl.test.ts` (the gamepads as SDL game controllers); in headless Chromium: `test/menu.test.ts` (first start: the main menu
asks for a new player in its modal loop, typed name and Return create the player file, which goes to the storage; "Start
Game" -> Tutorials -> Wandering Wipf starts with the new player; the window closed saves the config; a second start loads both
and asks for no player; `NONCOMMERCIAL_FILES` on and off), `test/savegame.test.ts` (Tutorial01 saved by `C4Game::QuickSave` as
the in-game menu's "Save game" does, stored packed within the limits, loaded on a new start and run on from its frame),
`test/multiplayer.test.ts` (Shiver Peak with a keyboard player and a gamepad player: D walks one clonk, the stick the other;
the Arena's melees start their clonks in relaunch containers), `test/count.test.ts` (`OC_COUNT=1`: the scenario count above).
All 90 tests of `web/games/openclonk/test` (15.11.2026): 88 pass, 2 skipped (the count without `OC_COUNT`, the FreeType oracle
not built in this worktree); the debug records of the five scenarios and of the input record are still equal step for step
after the runtime and translator changes of this milestone. `npx tsc --noEmit` and `npm run build` pass (OpenClonk's download:
74.0 MB).

## Production (23.11.2026): the shipped game, the assets, the GUI font fix

**The shipped build.** `NONCOMMERCIAL_FILES` is `false` (`web/games/openclonk/src/settings.ts`): the site ships only
assets free for any use, commercial use included. The four non-commercial files are not built, not committed and not in
`web/dist`; the packed groups in `web/games/openclonk/assets` (13 files, 108.8 MiB, ISC/CC BY 3.0, largest `Music.ocg`
33.6 MB) are committed so a clean checkout builds, and `tools/pack.sh --out web/games/openclonk/assets` writes them again
byte for byte (the four NC files go to `work/pack/noncommercial` beside the groups, never into the assets). `pack.sh
--out` is relative to the caller's directory now, as its comment says. Verified absent with `c4group -l -r` on every
group and by `find web/dist`/the downloads manifest; `test/noncommercial.test.ts` and `test/content.test.ts` check the
shipped assets hold none of them (no `noncommercial/`, and none inside the groups).

**The GUI font bug (found while taking the live screenshots).** The start menu drew its buttons' bars but no labels. The
cause: `C4GraphicsResource` has reference members (`CStdFont &TitleFont` and the other GUI fonts) bound in its
constructor's initializer list to its `FontTitle`/`FontRegular`/... members; the translator emitted that binding as a
copy at the top of the generated `init()`, *before* the `new CStdFont()` lines for the members, so the aliases pointed at
the previous, never-loaded font objects. `GetTextExtent` returned 0 and no glyph was drawn; the dialog text used
`FontRegular` directly and was visible, which hid it. The translator now emits reference-field bindings after all field
constructors (`tools/cpp2ts/__main__.py`, `ctor_inits`); `src/gen` and `src/sim` were regenerated with it (16 and 12
modules, only the bindings move). `test/menu.test.ts` now checks that `TitleFont`, `CaptionFont`, `TextFont` and
`TooltipFont` have glyph extents. The menu screenshots and the Tutorial01 HUD changed accordingly.

`npm run build` on this 53-game site needs more than Node's 4 GiB default heap; `web/package.json`'s build script sets
`--max-old-space-size=8192` (Vite itself built with 12 GiB; 8 GiB passed). The openclonk download is 72.5 MB (the six
system groups, Tutorials and Parkour first, the rest lazy).

**Checks (24.11.2026), on the branch rebased onto `origin/main` 4ca85099 (the 0 A.D. merge).**
`node --test --test-concurrency=1 games/openclonk/test/*.test.ts`: 89 tests, 88 pass and 1
skipped without `OC_COUNT` (the count); with `OC_COUNT=1` the count passes all 58 scenarios (1000 frames each, no errors,
no rounds over; 2,604 s with three at a time), so all 89 pass. The count ran on the same OpenClonk tree before the last
rebase; that rebase changed only the 0 A.D. game and the shared game lists, not OpenClonk's code or assets, and the
89-test suite and the build were rerun on the final base. `test/count.test.ts`'s table is
`/tmp/oc-count.json` in that session. `mvn -B -f pom.xml test`: 388 tests, 0 failures (of them `OpenclonkModuleTest`'s
12). One full Maven run before that hit `HyperrogueModuleTest.decisionsGoToEveryoneOncePerRoundForTheirSeat` (expected
`ORB`, got `WAIT`); the test passed twice alone and the next full run passed. It is unrelated to OpenClonk (Hyperrogue's
module and test are untouched), and is left for the server owner to look at as a flaky test. `npx tsc --noEmit` and `npm run build` pass; the build's openclonk download is 72.5 MB. A real browser playthrough
of the built site and server: the game page and Play button, a new player "Tester", Start Game -> Tutorials -> Tutorial
1, the intro clicked through and several minutes of walking/jumping, the player menu's Save game (slot 1) wrote
`Savegames.ocf__Tutorial.ocf__Tutorial1.ocs` (190,478 bytes) and the page reload loaded it back: the scenario selection
lists the Savegames folder. The two-browser online round and the reload/rejoin are the `online-e2e` tests above.

The online desync e2e (`test/online-e2e.test.ts`, "a browser whose state differs") drew **one** synchronized random
number in the altered browser. The simulation's own random draws vary with what the values decide (particles), so the
`RandomCount` could catch up by one within the 50 frames to the next sync check and the round went on; it was flaky in
full-suite runs and passed alone. It now draws 1,000 (the offset cannot catch up), and the test computes the expected
check from the frame the alteration actually happened at (the page's frame hook; a page that starts late may first see a
later frame), instead of hardcoding 200. Three consecutive two-browser runs passed.

## Oracles

`oracle/build.sh` builds the original's `c4group` tool and `openclonk-oracle` (math and random);
`oracle/build-headless.sh` the original's `c4script` and `openclonk-server` (headless game, debug records);
`oracle/build-full.sh` configures the full game (its `compile_commands.json` is what `tools/units.py` expands the
unit lists with). Without them the tests that need them are skipped with a message.
