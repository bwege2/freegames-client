# Teeworlds 0.7.5: reference notes

Reference version: the last official release, **Teeworlds 0.7.5** (2020-06-27), its release source tarball
from github.com/teeworlds/teeworlds (tag `0.7.5`):

| Package | Bytes | sha-256 |
| --- | --- | --- |
| `teeworlds-0.7.5-src.tar.gz` (https://github.com/teeworlds/teeworlds/releases/download/0.7.5/teeworlds-0.7.5-src.tar.gz) | 8,935,505 | `fcde2223398e027434ec96315103e9861fc458161b49b15908dc56b8e7a8ecd9` |

The tarball holds the code (`src/`), the data (`datasrc/`: graphics, sounds, skins, the font, the UI themes)
and the official maps (`datasrc/maps/`: dm1–dm3, dm6–dm9, ctf1–ctf8, lms1). `fetch.sh` downloads and verifies
it and unpacks it into `orig/` (not committed). Not DDNet, not 0.6: 0.7 has its own protocol (tokens, skin
parts, the game types lms and lts), and 0.7.5 is its last release.

## Licenses

Checked file by file before porting (`license.txt`, the license files in `datasrc/`, every file under
`src/engine/external/`, and a `grep` for "GPL", "General Public", "copyright" and "license" over the tree).
Nothing in the tree is GPL or AGPL.

| Files | License | Shipped / ported? |
| --- | --- | --- |
| The code: `src/` except `src/engine/external/` (`license.txt`: "Copyright (C) 2007-2020 Magnus Auvinen"; each file: "(c) Magnus Auvinen. See licence.txt in the root of the distribution") | **zlib** license | ported: the server to Java (`server/.../games/teeworlds/`, never published), the client and the shared code to TypeScript (`web/games/teeworlds/src/`); every ported file keeps the notice and says it is altered |
| The data: everything under `datasrc/` except the font (`license.txt`: "All content under 'data' and 'datasrc' except the font (which has its own license) is released under CC-BY-SA 3.0"; authors listed there: android272, Chi11y (chi1), Crises, Daniel, Echchouik, Fisico, Landil, Lappi, LordSk, maikka, matricks, Pocram, red_com, serpis, SkizZ, somerunce, Sonix, Stephanator, teetow, Ubu, Zatline) | **CC BY-SA 3.0** | shipped unchanged (PNG images, WavPack sounds, skins, maps) |
| The maps `datasrc/maps/*.map` (`datasrc/maps/license.txt`: "All content is released under CC-BY-SA 3.0"; `readme.txt`: "Copyright (c) 2015 Magnus Auvinen", the zlib disclaimer) | **CC BY-SA 3.0** | shipped unchanged (in the client and in the server) |
| The translations `datasrc/languages/*.json` (`license.txt` there: CC-BY-SA 3.0, authors in each file) | **CC BY-SA 3.0** | not shipped: the port is English, as the original's default |
| The font `datasrc/fonts/DejaVuSans.ttf` (DejaVu 2.33; `datasrc/fonts/LICENSE`: Bitstream Vera Fonts Copyright (c) 2003 Bitstream, Inc.; DejaVu changes public domain; Arev Fonts Copyright (c) 2006 Tavmjong Bah) | **Bitstream Vera / Arev** font license (free; renaming required only for modified fonts) | shipped unchanged |
| `src/engine/external/wavpack/` (tiny WavPack 4.40 decoder; "Copyright (c) 1998 - 2006 Conifer Software") | **BSD-3-Clause** | ported to TypeScript (the client decodes the original `.wv` sounds) |
| `src/engine/external/zlib/` (zlib 1.2.x, Jean-loup Gailly and Mark Adler) | **zlib** | not ported: the browser's `DecompressionStream` and Java's `Inflater` read the maps |
| `src/engine/external/md5/` (L. Peter Deutsch, Aladdin Enterprises) | **zlib**-style | not ported: Java's `MessageDigest` computes the tokens |
| `src/engine/external/pnglite/` (Daniel Karling) | **zlib** | not ported: the browser decodes the PNGs |
| `src/engine/external/json-parser/` (James McLaughlin et al.) | **BSD-2-Clause** | not ported: `JSON.parse` reads the skins |

All of it may be redistributed: the code under zlib (the notice kept, altered versions marked), the data under
CC BY-SA 3.0 with attribution and the license's URI (https://creativecommons.org/licenses/by-sa/3.0/), the
font with its notice. Nothing the game needs is non-free. The country flags (`datasrc/countryflags/`) are
part of `datasrc/` and so CC BY-SA 3.0 as well.

The zlib license allows the server port to stay closed (it asks only for the notice in source distributions
and that altered versions are marked). No AGPL or GPL code is in the server.

One more piece of third-party code is translated: glibc's `powf` (see "Findings") is taken from Arm's
optimized-routines (github.com/ARM-software/optimized-routines, `math/powf.c` and its tables, MIT OR
Apache-2.0 WITH LLVM-exception), the code glibc ships, not from glibc's LGPL sources; its notice is kept in
`server/.../teeworlds/base/FMath.java` and `web/games/teeworlds/src/base/powf.ts`.

## The oracles (re/teeworlds/oracle)

`oracle/build.sh` builds two programs from the release source with a pinned toolchain (the nixpkgs of the
Netrek and XPilot oracles: clang 21.1.8, glibc 2.44; `-O1 -ffp-contract=off -fno-fast-math`, the default
x86-64 target without FMA, so every float operation rounds as the source says; clang evaluates a call's
arguments left to right, as Java and TypeScript do). The generated sources come from the release's own
`datasrc/compile.py`. Nothing of the game is changed.

* **`tw-server-oracle`**: the dedicated server (`src/engine/server`, `src/engine/shared`, `src/game/server`,
  `src/game/*.cpp`, `src/base`, the bundled zlib and md5), with `oracle_main.cpp` (the original `main()` of
  `server.cpp`; the command line comes from the scenario file) and `hook.cpp` linked with `ld --wrap`:
  * a **virtual clock** (µs): constant within one turn of `CServer::Run`'s loop, moved only in
    `m_NetServer.Wait()` to exactly the game start + 20000·(tick+1) + 1, so that every turn runs exactly one
    game tick: the ticks, `DoSnapshot` on even ticks, then `PumpNetwork` (`NetServer.Update`, then every
    datagram that arrived). The clock starts at 1,000,000,000 µs; `srand(time_get())` (in `CEngine`'s
    constructor) seeds glibc's `rand()` with it;
  * an **in-memory UDP network**: the server is 10.0.0.254:8303, scripted client k is 10.0.0.(k+1) on port
    40000 + its connection number (a reconnect is a new port);
  * **secure random bytes** from a fixed generator, every call recorded (`InitRconPasswordIfUnset` draws 6
    bytes at startup, the token manager 8 bytes at startup and every 16 seconds);
  * **scripted clients** (`client.cpp`) in the same process that speak the original protocol through the
    original engine classes (`CNetClient`, `CMsgPacker`/`CUnpacker`, `CSnapshotDelta`, `CSnapshotStorage`,
    `CNetObjHandler`): they connect, download the map, enter, send an input every game tick as
    `CClient::SendInput` builds it, decode and ack snapshots, chat, emote, change teams, spectate, vote, close
    their connection or go silent (time out) and come back; bots steer towards targets and flags. Their
    `rand()` is a stream of their own, so glibc's stream holds the server's calls only.
* **`tw-core-oracle`** (`core.cpp`): the game core (`gamecore.cpp`, `collision.cpp`, `layers.cpp`, the map
  loader `map.cpp`/`datafile.cpp`) on an official map: N characters, seeded random input with much hooking of
  the ground and of each other, stepped as the server steps them (`Tick(true)` for all, then `Move()` and
  `Quantize()` for all); death tiles and leaving the map respawn. It also records every `atan2f` and `powf`
  call (`golden/core/libm.jsonl.gz`).

Scenarios (`oracle/scenarios/*.scn`, goldens in `golden/<scenario>/`):

| Scenario | What happens |
| --- | --- |
| dm | dm1, 3 clients, 60 s: map downloads, 15 kills, chat and team chat, emoticons, a weapon choice, a kill command |
| tdm | dm1, 4 clients, team damage, 5 s warmup, 1 min time limit: the match ends and a new one starts; 25 kills, team changes |
| ctf | ctf1, 2 against 2 with attacker and defender bots: 6 flag grabs, 3 captures, drops and returns |
| lms | lms1, 3 clients: rounds end, the match ends (spawns use the server's `rand()`) |
| lts | lms1, 2 against 2: rounds and the match end |
| joinleave | dm1, 4 clients: a spectator and spectator modes, a client that closes its connection and reconnects, one that goes silent and times out after 10 s and reconnects, a spectate vote, a kick vote, an option vote that changes the map to dm2 (every client gets MAP_CHANGE and downloads again), a skin change, the ready change |
| armor | dm1, 4 clients, 3 min, bots that fetch shields and prefer grenade and laser: 93 armor pickups, 67 hits taken with armor up (29 of them for more than 1, taking health and armor), 4 kills through armor, 63 kills |

Goldens: `packets.jsonl.gz` (a header with the clock's start, the startup random bytes and the srand seed;
then per turn of the loop: its clock, tick, the client datagrams the server read and the datagrams it sent,
in order, and the random bytes drawn), `snaps.jsonl.gz` (every snapshot each client decoded, with its tick
and crc and items, and every message it decoded), `summary.txt`, `config.txt`; and the core runs
`golden/core/<map>-<n>.jsonl.gz` (per tick every input and every character's core, floats as bit patterns).

### What the tests check against them

* **The server** (`server/src/test/.../teeworlds/ServerReplayTest`): the Java server gets the golden's clock,
  random bytes and client datagrams turn by turn and must send exactly the original's datagrams, byte for byte
  and in order, in every turn of all seven scenarios (62,973 datagrams: handshakes, map downloads, every
  snapshot with its delta and Huffman compression, chat, kills, votes, the map change, drops and timeouts).
  It does. A mutation (health capped at 9 instead of 10) fails all six first scenarios within 1 to 4 seconds of
  game time; one in the armor rule (`if (Dmg > 2)` for `if (Dmg > 1)` in `TakeDamage`, which none of the
  others reaches) fails `armor` at tick 168.
* **The core** in Java (`CoreTest`) and in TypeScript (`web/games/teeworlds/test/core.test.ts`): every
  character's state, bit for bit, every tick of seven runs (2, 4 and 8 characters on dm1, dm2, dm6, ctf1,
  ctf2; 2500 to 3000 ticks each); and `powf`/`atan2f` on all 17,236 + 88,000 recorded calls. Both pass; a
  mutation (0.85 → 0.86 in the player collision) fails every run.

## Findings

* **glibc's `powf` is not correctly rounded.** `atan2f` matched `(float)atan2((double)y, (double)x)` on all
  88,000 calls, but `powf` differed from the correctly rounded result on 5 of 17,236 (all `powf(1.4f, x)`,
  the velocity ramp; e.g. `powf(3fb33333, 3d57ed9a)` is `3f824a6b` in glibc, `3f824a6a` exactly). The ports
  use glibc 2.44's algorithm (Arm optimized-routines `powf`, MIT); glibc's FMA variant gave the same results.
* **`CSnapshot::GetItemIndex`'s binary search reads past the keys.** `find_binary` narrows with
  `plain_range_sorted::slice(start, count)`, which takes a count, so a step to the right makes the range reach
  past its end into the offsets that follow the keys in memory. It still finds every key of a real snapshot
  (checked over 20,000 random snapshots); the ports search the same way, over the same memory layout.
* **Snapshot ids time out on a 32-bit clock.** `CSnapIDPool::FreeID` stores `time_get() + 5 s` in an `int`.
  With the oracle's clock (10⁹ µs) the timeout works; with a real `gettimeofday` (≈1.7·10¹⁵ µs) the truncated
  value is arbitrary, so freed ids come back at once or after a random time. The Java server keeps the `int`.
* **A client's disconnect reason is lost.** Server connections are made with `m_BlockCloseMsg` set, so the
  reason in a client's CLOSE is ignored: `Sv_ClientDrop` and the drop log carry an empty reason.
* **The server makes an rcon password** when none is set (`InitRconPasswordIfUnset`, 6 random bytes) and
  prints it to its console. The port draws the bytes but sets no password (no remote console).
* **A whisper to client -1 goes to everyone**: `Cl_Say` with mode whisper and target -1 is sent to the target
  "-1", which `SendPackMsg` takes as all clients.
* **A map change has two turns with tick 0**: the vote passes in one turn; the next reloads the map
  (`m_GameStartTime` = now, tick 0) and the one after still has tick 0 (no tick is due yet).
* **The Huffman coder** keeps its bits in a 32-bit `unsigned`; the ports do the same.
* `CConsole::AddCommandSorted` drops the list's only command when a new one sorts before it (never with the
  server's commands, which start with several).

## The network design

The original speaks UDP with its own reliability (vital chunks, sequence numbers, acks, resends), Huffman
compression and 0.7's connection tokens. Its packets are carried as they are: `protocol/games/teeworlds.capnp`
`Msg.udp` is one datagram. A seat sends its client's datagrams to the server (`Target.server`, unreliable:
WebTransport datagrams; over the WebSocket fallback, or above the datagram size, the core sends them
reliably), and the room sends the seat whatever the server writes to the seat's address, unreliably. A lost
datagram is lost, as on the original's network; the protocol's resends and the snapshots' deltas against the
last acked snapshot handle it, exactly as on UDP.

In the room (`TeeworldsRoom`) every seat is a peer address of the server: 10.0.0.(seat+1), a new port for
each new connection of the seat (a newcomer, or a client that starts again after a dropped connection; the
seat's old connection is closed then). The server's main loop (`Server.iteration()`, one turn of
`CServer::Run`'s loop without its wait) runs every room tick (10 ms; the original waits at most 5 ms) and for
every datagram that arrives; game ticks run on the server's game time (50 per second), snapshots every second
tick (25 per second), as the original's. Its clock is the wall clock in microseconds (the original's
`gettimeofday`). The module allows up to 16 seats (the core's limit) and 24 rooms at once
(`TeeworldsBudgetTest`: a full room of 16 players fighting on ctf2 costs about 0.15 ms per game tick on the
development machine, and the server sends about 2.5 kB per player and second).
