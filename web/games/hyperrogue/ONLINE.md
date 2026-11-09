# HyperRogue online: design (stage 3)

The original (13.1o) has only **local** multiplayer: up to 7 players at one computer, turn-based (multi.cpp,
`multi::players > 1`) or real-time (shmup). Online play is a deviation the operator asked for, the same as for
the site's other games. This file covers the turn-based mode. The rules of that mode are ported line by line and
match the original (step 1, below). Step 2, the network code (`src/net.ts`, `src/online.ts`, `src/online-ui.ts`,
`protocol/games/hyperrogue.capnp`, `server/.../games/hyperrogue/`), is done; it follows the design here, with the
changes listed in section 5. Shmup online is later.

## 1. What step 1 delivered

* **Rules of the turn-based multiplayer mode** (multi.cpp and the multiplayer branches elsewhere). Stage 1 had
  already ported the branches in pcmove/checkmove/monstermove/attack/game/orbs/environment/complex/items: they read
  the runtime variable `multi::players`. Step 1 ported what was still a stub in `src/multi.ts`:
  * the configured input: `initConfig` (the default keys of players 1-7, the character styles, the parameters,
    and `sconfig_savers`' `key:N`/joystick parameters of `hyperrogue.ini`), `get_actions`, `handleInput`
    (panning keys), `notremapped`, `key_to_scan` (with `SDL_GetScancodeFromKey`/`SDL_GetScancodeName` in sdl.ts)
  * `handleMulti` (every player's keys -> `multi::whereto`, accept / cancel / leave / drop / center, and when all
    have decided: the crash check, `multimove`, the monsters' turn). Its `if(alldecided)` part is
    `multi_alldecided()`: a function of its own, so that the oracle harness and the online game run exactly it.
  * `mousemovement`; the key configurers and the "keyboard & joysticks" and "multiplayer" menus
* **Drawing of several players**: celldrawer's bookkeeping (`multi::whereis`, `crosscenter`/`ccat`, the cell
  that a ranged Orb aims at), graph.cpp's markers (each player's target circle, the movement arrows), the view
  centred between the players (`center_multiplayer_map`), `drawmovestar` per player, the mimics' marker
  with configured keys, `centerpc`'s two-focus projection (`multi::two_focus`). Split screen (`subscreens`) stays a
  stub (stage 3).
* **A bug fix found by the scenarios**: `changes.value_keep(cwt)` restored a copy into `G.cwt` instead of restoring
  the walker in place. Code that holds `G.cwt` (`pcmove::checkNeedMove`) then saw the walker from before the
  rollback. That only shows when a rollback runs inside a nested `movepcto`, as in `multimove`
  (multi4-jungle: "You need to move to give space to the no monster!").
* **Oracle commands** (harness.cpp and test/trace.ts, `re/hyperrogue/oracle/scenarios-format.md`): `start <seed> -P
  <n>` (the original's option), `pmove <p> <d> [<subdir>] | wait | drop | orb <i>`, `round`, `leave <p>`,
  `plook <p>`, `rngstate`; in multiplayer the dump adds a `player` line per player and the revival queue.
* **Scenarios** written by `re/hyperrogue/tools/gen-multi-scenarios.py`: 2, 3 and 4 players in the start land,
  Icy Land, Great Wall/Caves, Desert, Jungle; players leaving the game, the revival queue and revival by an Orb of
  Life; the Orb of the Sword with two players; ranged Orbs aimed by players (`multi2-start`, `multi2-ice`,
  `multi2-sword`, `multi3-caves`, `multi3-desert`, `multi3-orbs`, `multi4-jungle`). They cover refused rounds too:
  two players aim at one cell, "Players cannot get that far away!", moves into danger. All 7 match the original
  exactly, every turn.

## 2. Is the state a pure function of (seed, options, ordered inputs)?

**In the original: no, though only in a few places.** Drawing changes the game state. Evidence: `re/hyperrogue/tools/determinism.py`
runs a scenario as it is and again with frames drawn between the turns (`svg W H screen` = `drawscreen` at a
window size, the clock `ticks` advancing; variants: one 800x600 frame, two 1920x1080 frames, one 320x200 frame,
the screenshot command), then compares every turn's dump (messages, positions, items, kills, the cells near the
players, the hash of all of dcal) and the generators at the end (`rngstate`: the next numbers of a copy of
`hrngen`, then one glibc `rand()`).

| Scenario (oracle) | turns | hrngen | glibc rand() | turn dumps |
| --- | --- | --- | --- | --- |
| multi2-start, multi3-caves, multi4-jungle, multi3-orbs | 54-108 | same | **differs** | same |
| lands-c, lands-e, orbs-walk, deaths | 39-304 | same | **differs** | same |
| lands-a (Mirror Land) | 238 | same | **differs** | **differ** from turn 181: a mirror wall's `landparam` 0x001 vs 0x401 |
| lands-g (Volcanic Wasteland) | 261 | same | **differs** | **differ** from turn 124: lava cells at the edge of dcal, `wparam` 0 vs 20 |

The port gives the same numbers in every variant (the rand() values and the hashes are identical to the
oracle's): it is 1:1 here too. Where drawing reaches the game state (source of 13.1o):

1. **glibc `rand()`**: every particle, flash, bubble, `flashdata`'s `random_spin`, the Orb of Lightning's and the
   curses' drawing, the Blizzard's snowballs, fire flickering (animations.cpp, celldrawer.cpp, graph-player.cpp,
   blizzard.cpp) draw `rand()` per frame. The rules use the same `rand()` for Camelot's knight names
   (complex2.cpp `knight_name`, which keeps a name per cell from its first use; it is used in checkmove's
   "captured by ... the Knight" end message and in help.cpp's mouse-over text, which is itself drawing) and for
   sound names (`pick123`). **No game decision reads rand()**. Only those texts depend on how many frames were drawn.
2. **`checkTide` in `celldrawer::draw`** (celldrawer.cpp: `checkTide(c)` for every drawn cell): the tides of the
   Ocean and the lava of the Volcanic Wasteland are applied to every drawn cell, also cells outside dcal (the rules
   apply them to dcal every turn, `advance_tides`). A cell beyond dcal turns to lava (or sea) earlier, then
   `heat::processfires` gives it `wparam` 20 when it enters dcal. And `checkTide` burns the item on a cell that
   turns to lava, with the message "%The1 burns!", so drawing can destroy an item and add a message.
3. **`mirror::reflect`** (complex.cpp, called by celldrawer for every cell in a mirror) keeps its cache slot in
   bits 8-19 of the cell's `landparam` and may call `buildEquidistant`, which can `setdist` (generate land, with
   `hrand`). The cache itself does not change the result of a reflection.
4. **`hrand` in drawing**: graph-monster.cpp draws a Snake Nest's snake with `mondir == NODIR` by picking
   `hrand(c->type)` and `createMov`. That is the rules' generator. No scenario reached it.
5. In cheat mode only: the screenshot (`shot::take`) calls `doOvergenerate()` (land generation with `hrand`).

Not affected: the clock (`ticks`, `SDL_GetTicks`) is read only by drawing and shmup. `time()` gives the score
file's dates and the ghost timer is counted in turns. The mouse position only chooses what the player does (it
becomes the input, `whereto`). The window size and frame timing act only through 1-5.

**In the port's online mode: yes.** `G.online_isolated` (port only, off by default, so the original's behaviour
stays) makes drawing a reader:

* every frame (`drawscreen`, `drawfullmap`) runs with generators of its own: `drawing_rng_begin/end` (rand.ts)
  swap in a drawing `rand()` state and a drawing `hrngen` and give the rules theirs back unchanged (1, 4, and the
  hrand part of 3)
* celldrawer does not call `checkTide` (2): the rules apply the tides to dcal as before. Cells beyond dcal are
  drawn with the tide of the last turn they were in range (a visual deviation at the edge of the view).
* celldrawer reflects mirror cells with `mirror_reflect_view` (complex.ts): no `buildEquidistant`, a cache of
  its own (3). A reflection whose structure the rules have not built yet is not drawn.

Evidence: `test/determinism.test.ts` (in the suite) runs multi2-start (25 rounds), multi3-orbs (30) and lands-g
(126 turns, Volcano) in the online mode with two frames drawn after every turn: every turn dump, hrngen and
rand() equal the run without drawing. A second test pins down the original's behaviour (online mode off): rand()
differs and lands-g's 124th turn differs. `determinism.py --port --online` gives the same for lands-a (Mirror
Land). In the online mode, Camelot's knight names come from the rules' rand() only, so they are the same on every
client. A knight named first by the mouse-over help still gets its name from the drawing generator, but help.cpp's
text is not part of the state that is compared; step 2 may make help read the name without assigning one.

Remaining conditions for exact lockstep, for step 2:

* every client starts the same game: `shrand(seed)` and `srand(seed)` with the round's seed (not `time()`), the
  room's options applied, the rules-relevant configuration at the defaults (see 3.6), no saved game loaded, no
  cheats (the cheat keys change the state: online they are off, as the original disables achievements in cheat mode)
* the inputs are applied at the same point of the turn on every client (3.2), and nothing else changes the state:
  the online game must not run single-player paths (`movepcto` from the keyboard, mouse clicks, the Orb of
  Safety's save, `restart`, the map editor) on its own
* `warningprotection` (pcmove.cpp): with more than one active player it never asks, but with one player left it
  shows the "Are you sure?" dialog and refuses the move until it is confirmed. Online, the confirmation becomes
  part of the input (`Decision.confirmed`: apply with `items[itWarning]` as the confirmed dialog does)
* a desync check (3.4) catches whatever this study missed

## 3. Decision: deterministic lockstep, inputs relayed in the server's order

Per `docs/SERVER.md` ("Choosing the model"), HyperRogue's turn-based multiplayer is a **deterministic lockstep**
game:

* It is turn-based. The state follows from the seed and the players' decisions (section 2). In the original, all
  players see the same shared map; nothing is hidden from a player.
* **Server authority is not possible** without a second copy of the rules: the server is Java (one server, no
  second process, `AGENTS.md`), and the rules are the TypeScript port (about 60k lines of C++ ported). Running
  them on the server would mean another port into Java, or a JavaScript engine in the server.
* What must be fair is decided by the server: the seats (seat n is player n), the seed (`RoomStarted.seed`), the
  round structure (one decision per seat and round, in the server's order), timeouts, leaving, and the check that
  the clients' games agree. A cheating client can only send its own seat's decisions: the server stamps
  `Relayed.from`, and every client applies them to that seat's player. Changing its own copy of the game only
  makes its hash differ.

### 3.1 Room and start

* Seats 2-7 (`maxSeats 7`, `minSeats 2`; MAXPLAYER is 7). `multi::players` = the number of seats at the start;
  seat n plays player n (colours and characters of `multi::scs[n]`). `dropIn() = false`: the original places all
  players at the start (system.cpp `initgame`, `cwt.at->move(3i % type)`), and a newcomer cannot join a running
  game. Revival stays the original's: a player in the revival queue comes back when someone picks up an Orb of
  Life, Friendship or Undeath.
* Room options (schema `Options`): the start land (`specialland`, the lands the "special land" list offers), the
  modes that work with multiplayer in the original (hardcore, chaos, Orb Strategy, Pure Tactics off), the turn
  timeout. The server checks them (`acceptOptions`).
* Every client: `stop_game`, the options, `multi::players = seats`, `bow::weapon = wBlade` (as
  showConfigureMultiplayer does), `G.online_isolated = true`, `shrand(seed); srand(seed)`, `start_game()`.

### 3.2 Rounds

The original's multi mode: every active player chooses a move (`whereto`: a direction relative to the player's
facing with a `subdir` for pushing, wait, drop, or an Orb aimed at a cell). When all have decided,
`handleMulti` checks for crashes (two players at one cell), `multimove()` moves all players in seat order (each
move is checked against the others' moves), then `monstersTurn()`. A refused round changes nothing but the
messages; the players choose again. Online:

* Round r (counted from 0) needs **one `Decision` from every seat** that is still in the room. The client sends
  its seat's decision when the original would count that player as decided (`multi_autojoy`, on by default:
  when a direction is chosen; or after "accept"). The online input is the single-player controls: keys, numpad, vi
  keys, the mouse. At the keyboard the local seat is `cwt` (`multi::cpid = you`), so `movepcto(d, subdir)` and a
  mouse click (`mousemovement`) become a Decision instead of a move.
* A seat whose player is dead (`player[you].at == NULL`, in the revival queue) sends `kind = none` every round,
  automatically. This way the module knows when a round is complete without knowing the rules.
* Every client applies the decisions of round r **in the server's `seq` order** once it has one from every seat
  in the round: `multi::whereto[seat] = {d, subdir, tgt = dcal[target]}` (`none`: ignored; for a living player
  it counts as wait), then `multi_alldecided()`. Played or refused, the next round is r + 1. The target of an
  Orb is an index into `dcal`, which every client has the same (it is part of the state), and is checked on
  apply (out of range: wait).
* `leave` (the original's "leave the game" key, `pcFaceFire`) is a decision too. It is applied before the round's
  `multi_alldecided`, as `handleMulti` does: `addMessage("Left the game."); multi::leaveGame(seat)`, only while
  more than one player is active.
* A client must not run ahead: it draws and takes input while waiting. The module accepts only the current round's
  decision of a seat, and only one.

### 3.3 Timeouts, leaving, reconnecting

* The original waits for every player forever. Online, a room option `turnTimeout` (seconds; 0 = wait forever,
  as the original; offered 30/60/120) lets the module send `Decision{kind = wait}` on behalf of a seat that
  has not decided (`from = 255`, with the seat named). This is a deviation, listed in README.md.
* A seat that leaves the room (`LeaveRoom`), or whose connection does not come back within `RECONNECT_S`: the module
  broadcasts `Left{seat, round}`. Clients apply it before round `round`'s `multi_alldecided` as the leave key,
  and from then on no decision is expected from that seat. With one seat left the round goes on as a single-player
  game for it (as in the original, the last active player plays on); with none, the module ends the round.
* Disconnect: the seat is kept for `RECONNECT_S` and the others wait (the timeout applies). A seat that comes back
  (`onReconnect`, `RoomStarted.rejoined`) gets `History`: every decision and `Left` of the round so far, in
  order. The client replays them headless from the seed (the rules without drawing take about a millisecond a
  round), then joins the current round. The module keeps the log: at most 7 seats × the round cap (below) ×
  about 8 bytes.

### 3.4 Desync check, end, results

* Every 8th round each client puts into its next Decision `hash` = an FNV-1a hash of its state after round r - 4
  (the dump's fields of every cell of dcal, items, kills, turncount, every player's position, the next numbers
  of a copy of hrngen). The module compares the hashes of one round. If they differ, it broadcasts `Stopped{round}`
  and ends the round with reason `desync`, as Bomberslop does.
* The game ends for everyone when `canmove` becomes false (the last active player is killed or stuck). Each
  client then sends `Over{round, stats}` (per seat: treasures, kills, deaths, as in the multiplayer menu
  `multi::treasures/kills/deaths`, and the gold `gold()`). The module finishes with `Results` when every remaining
  client sent the same `Over`, or with reason `disagreed`.
* No score table in step 2: the original keeps no shared high-score list for multiplayer (the local score file
  marks such games "Multi-player (n players)"). A later table must accept only results the module saw agreed.
* No saving: the Orb of Safety's quit-and-save is single-player. Online, quitting is leaving.

### 3.5 Server module (`HyperrogueModule`, step 2)

`maxSeats 7`, `minSeats 2`, `dropIn false`, `acceptOptions` (valid land and modes, timeout 0..600), `startRound`
returns a `RoomLogic` that:

* `onMessage(seat, to, data)`: parses `Msg` defensively. Accepts only `decision` to `all`, for the current
  round, once per seat, from a seat still in the round, with `kind` in range, `dir < 8` (a cell of the
  standard tiling has at most 7 neighbours), `subdir ∈ {-1, 1}`, `target < 65536`. Also `over`/hash to `server`. Everything else is
  dropped. A message is at most 64 bytes (packed, far below the core's 64 KiB). The core's rate limit applies, and
  the module also limits a seat to one decision per round.
* counts the round: when every seat in the round has decided, round + 1. Keeps the log for `History`. Compares the
  hashes. Runs the timeout in `tick` (interval 1000 ms) and sends the default decisions. Broadcasts `Left` from
  `onLeft`/`onDisconnect` + timeout. Ends the round on `Over` agreement, desync, everyone gone, or the round cap
  (100000 rounds).
* tests (`server/src/test/.../hyperrogue/`, loopback clients): seat stamping, one decision per round, wrong
  round dropped, round completion with dead (`none`) seats, timeout decisions, Left on leave and on disconnect,
  History on reconnect, desync stop, results agreement, malformed data dropped.

### 3.6 Client configuration that changes the rules

The settings must not differ between clients where they reach the rules. Known ones: `bow::weapon` (set to the
blade by the multiplayer start), `vid.particles`/`vid.flasheffects` (they decide how often drawing draws
`rand()`: harmless with `online_isolated`), `multi::self_hits` and `multi::friendly_fire` (read only by shmup and
the achievements in 13.1o: harmless in the turn-based mode), `warn_before_killing_friends` (only with one active
player, see `warningprotection`), `princess::challenge`, `peace::on`, `inv::on`, `yendor::on`, `tactic::on`
(modes: from the options). Step 2 should audit `config.cpp`'s parameters for reads by the rules files (pcmove,
checkmove, attack, monstermove, environment, game, orbs, complex*, landgen, monstergen, bigstuff, items) and set
those from the room options when the round starts.

### 3.7 Protocol draft: `protocol/games/hyperrogue.capnp`

```capnp
@0x...;  # capnp id
# HyperRogue online (web/games/hyperrogue): the turn-based multiplayer mode of the original (multi.cpp), 2-7
# players, deterministic lockstep: every browser runs the same game from the round's seed; seat n plays player n.
# For each round every seat sends one Decision to everyone (Target.all); the browsers apply a round's decisions in
# the server's order when they have one from every seat (multi::whereto, then handleMulti's alldecided part).
# The module (server/.../games/hyperrogue/HyperrogueModule.java) checks seats and rounds, sends decisions for
# seats that time out, Left for seats that go, History to a seat that comes back, and compares state hashes.
using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.hyperrogue");
$Java.outerClassname("HyperrogueProto");

struct Options {
  land @0 :UInt16 = 0;          # specialland (eLand), 0 = laIce (the default start)
  hardcore @1 :Bool = false;    # hardcore
  chaos @2 :Bool = false;       # ls::any_chaos (land structure "chaos")
  orbStrategy @3 :Bool = false; # inv::on
  turnTimeout @4 :UInt16 = 0;   # seconds; 0 = wait for every player, as the original
  rulesVersion @5 :UInt32;      # the port's rules version: rooms only start between equal versions
}

struct Msg {
  union {
    decision @0 :Decision;   # a seat to everyone (or the server for a seat, Relayed.from = 255)
    left @1 :Left;           # the server to everyone
    history @2 :History;     # the server to a seat that came back
    stopped @3 :Stopped;     # the server to everyone: the games differ
    over @4 :Over;           # a seat to the server: its game ended
  }
}

enum Kind { move @0; wait @1; drop @2; orb @3; leave @4; none @5; }

struct Decision {
  round @0 :UInt32;        # counted from 0
  seat @1 :UInt8;          # the player (checked: Relayed.from, or the seat the server decided for)
  kind @2 :Kind;           # move: whereto.d = dir; wait MD_WAIT; drop MD_DROP; orb MD_USE_ORB at dcal[target]
  dir @3 :UInt8;           # move: the direction relative to the player's facing (cellwalker + dir + wstep)
  subdir @4 :Int8 = 1;     # move: the pushing side (movedir.subdir, -1 or 1)
  target @5 :UInt16;       # orb: the index of the target cell in dcal
  confirmed @6 :Bool;      # the move confirms warningprotection's dialog (items[itWarning])
  hash @7 :UInt32;         # every 8th round r (r >= 8): the hash of the state after round r - 4; else 0
}

struct Left { seat @0 :UInt8; round @1 :UInt32; }    # applied before that round's moves

struct History {
  decisions @0 :List(Decision);   # every decision so far, in the server's order
  lefts @1 :List(Left);
}

struct Stopped { round @0 :UInt32; }

struct SeatStats { treasures @0 :UInt32; kills @1 :UInt32; deaths @2 :UInt32; }

struct Over {
  round @0 :UInt32;
  gold @1 :UInt32;                # gold() (shared treasure)
  seats @2 :List(SeatStats);      # multi::treasures/kills/deaths by seat
}

struct Results {
  reason @0 :Reason;
  rounds @1 :UInt32;
  gold @2 :UInt32;
  seats @3 :List(SeatStats);
}

enum Reason { over @0; disagreed @1; desync @2; left @3; limit @4; }
```

### 3.8 End-to-end plan (2 to N players)

1. **Rules against the original** (done for local play, extend for online): a round log of an online game
   (decisions in server order + lefts) converts 1:1 into an oracle scenario (`start <seed> -P n ...`, `pmove`,
   `leave`, `round`); the test compares the online clients' final dumps with the oracle's golden of that scenario.
   So an online game equals the original's local multiplayer game for the same inputs.
2. **Module** (Java, loopback clients): the checks of 3.5.
3. **Clients against the real server** (node, as `web/src/sdk/sdk.test.ts` runs `dropin`): start the server, 2,
   3 and 4 headless clients join one room. Each runs the port's rules (no canvas, `online_isolated`) and plays
   scripted decisions taken from the multi scenarios: one client draws frames between rounds, another does not,
   one leaves (Left), one disconnects and comes back (History replay). Check that all clients have equal turn
   dumps and hashes every round, that the module's `Results` agree, and that a manipulated client (one changed
   cell) is stopped with `desync`.
4. **Browser** (headless Chromium, as the screenshot tool runs): two pages play five rounds through the lobby; both
   canvases show both players.

## 4. Files

| Path | What |
| --- | --- |
| `protocol/games/hyperrogue.capnp` | the messages, options and results (section 5) |
| `server/.../games/hyperrogue/HyperrogueModule.java`, its test | the server module (3.5) and its loopback tests |
| `src/online.ts` | the game side: `online_start_game`, `online_apply_round`, the state hash, the frame wrapper, the online menu |
| `src/net.ts` | the lockstep (`Online`): decisions, Left, History, hashes, Over, results; no DOM |
| `src/online-ui.ts` | the lobby over the game's window, the status line, the results |
| `test/online.test.ts`, `test/online-client.ts` | two to four browsers as worker threads against a stand-in server |
| `web/scripts/e2e.mjs` ("HyperRogue online") | two and three browsers through the real lobby and server |
| `src/multi.ts` | multi.cpp (rules, input, menus); `multi_alldecided` |
| `src/rand.ts` | `drawing_rng_begin/end` (online mode) |
| `src/celldrawer.ts`, `src/complex.ts`, `src/graph.ts` | the drawing of several players; the online mode's `checkTide` skip, `mirror_reflect_view`, the frame isolation |
| `re/hyperrogue/oracle/harness.cpp`, `test/trace.ts` | `pmove`, `round`, `leave`, `plook`, `rngstate` (+ `online`, port only) |
| `re/hyperrogue/tools/gen-multi-scenarios.py` | writes the multi scenarios from the oracle |
| `re/hyperrogue/tools/determinism.py` | the drawing study (oracle, port, port online) |
| `test/determinism.test.ts` | the online mode's purity, and the original's leaks |

## 5. Step 2: what was built, and where it differs from the draft

* **Schema** (`protocol/games/hyperrogue.capnp`): as 3.7, but `Options` has no `chaos` (the start land, hardcore,
  Orb Strategy, the turn timeout, `rulesVersion`); `land` is one of Icy Land (default), Crossroads, Desert, Living
  Cave, Jungle, Alchemist Lab; `Decision` has no `confirmed` (the port's warning dialog is not interactive in
  single-player either: `warningprotection` refuses the move, the same in every browser); `History` comes in chunks
  of 2000 decisions with `last` on the final one (its `lefts` there).
* **Start** (`online_start_game`): `resetModes` (classic, or Orb Strategy), `stop_game`, the options, hardcore,
  `multi::players` = the seats, the blade, every per-player statistic, `whereto` and the revival queue reset,
  cheats off, `shrand(seed); srand(seed)` (the round's 64-bit seed folded to 32 bits), `start_game`. A browser that
  played a single-player game before starts the same game (`test/online.test.ts`). The online game is not the
  oracle's `start <seed> -P n` (that starts a one-player game first and runs in cheat mode), so 3.8.1's
  comparison with the oracle goldens is not made; the rules it runs are those the 7 multi scenarios check.
* **A round** (`online_apply_round`): the seats whose Left names this round leave (the leave key's rule: only while
  more than one plays) and are taken out of the revival queue (nobody would decide for them); the decisions in the
  server's order into `whereto` (a move whose direction the player's cell does not have, or an Orb target outside
  dcal, becomes a wait; `leave` is the leave key); every living player without a decision waits; `flashMessages`;
  `multi_alldecided`. The controls: `movepcto` and `targetRangedOrb` (keys, mouse) call `G.online_input` instead of
  playing (`targetRangedOrb` checks the Orb with `roMultiCheck` first); `DEFAULTCONTROL` is true online, so the
  single-player keys work; `handleMulti` is off; marking a mine is off (it changes one browser's board); a
  `stop_game` while online (a restart, a mode change) leaves the room.
* **A finding while testing in the browser**: a frame of the main loop draws `hrand` outside `drawscreen` too (the
  rules' generator advanced with every frame, so two browsers drawing different numbers of frames went apart; a
  page that came back and replayed without frames differed from the first round on). The isolation now covers the
  whole frame: `online_as_local_player` runs the keys, the mouse and the drawing on the drawing's generators
  (`drawing_rng_begin/end`), with `cwt` and `multi::cpid` set to the local player and put back after. The headless
  test draws `hrand` and `rand()` in its frames to keep this checked.
* **Hash**: FNV-1a over turncount, canmove, cheater, items, kills, the players (dcal index, facing, mirror,
  statistics), the revival queue, every dcal cell's dumped fields and the next two numbers of a copy of hrngen
  (`online_state_parts` gives the same by part, for finding a difference). Every 8th round r (r >= 8) carries the
  hash after round r - 4; the module compares the seats' hashes of a round, the server's own decisions carry none.
* **Module** (`HyperrogueModule`): as 3.5; the timeout is 0 or 10-600 s (the menu offers 30, 60, 120), checked
  every 250 ms; Left's round is the seat's next undecided round; `Over` must agree among the seats still in the
  game and connected (round, gold, every seat's treasures, kills and deaths); the host cannot end the round; at most
  200 rounds of HyperRogue at once; round cap 100000.
* **What the server keeps and sends**: per running round only the decisions (round, seat, kind, direction, side,
  target cell index) and the Lefts, in memory, to replay them to a seat that comes back; nothing is stored after the
  round. The other players get each seat's decisions and the room's seat names (the lobby's); the results (rounds,
  gold, per seat treasures, kills, deaths) go to everyone in the room. The game is recorded in the player's own score
  file in account storage, as a local multiplayer game is.
