# Netrek (Vanilla 2.19.0, COW 3.3.3) in the browser

Netrek, ported 1:1 from the last releases of its server and its client:

* **The client** COW 3.3.3 (`netrek-client-cow`) runs in the browser, in TypeScript: `src/cow/` is its C
  sources translated function by function (`re/netrek/tools/translate.sh`, the c2ts translator), on a small
  C runtime (`src/rt/`) and an X server (`src/xlib/`) that does what the client oracle's recording Xlib does.
* **The server** netrek-server-vanilla 2.19.0 (the daemon, ntserv per player and the robots) runs inside the
  website's own game server as the `netrek` module, in Java, one galaxy per room.

Both are checked against the originals:

* The server: the original server built from source runs in lockstep on a virtual clock
  (`re/netrek/oracle`, `re/netrek/NOTES.md`) with scripted clients and the original COW; its whole world
  (players, torpedoes, plasmas, phasers, planets, the robots) is recorded frame by frame, and so is every byte
  and every UDP datagram it sends. The Java server, fed the same client bytes and datagrams, has the same
  world and sends the same bytes and datagrams in every frame of eight scenarios: alone, a duel, the practice
  robot, bombing with a rescue robot, tournament mode with short packets, three clients in the UDP modes
  (portswap, packet mode, fat UDP, back to TCP), and the original COW against the practice robot over TCP and
  in UDP mode (`server/src/test/java/net/slop/freegames/games/netrek/NetrekWorldTest.java`).
* The client: the original COW, built from source on a recording Xlib, played the `cowduel` and `cowudp`
  scenarios live against the original server. Fed the same server stream and datagrams and the same keys and
  mouse, the TypeScript COW makes the same X calls in every frame, with their arguments (cowduel: 64,024 lines
  of the call log), and sends the same bytes and datagrams to the server (`test/replay.test.ts`).

`e2e.mjs` plays a galaxy with three browsers and the practice robot for a minute on the real server, in UDP
mode: every client switches to UDP and gets its updates as datagrams (WebTransport datagrams, 25 per second
each), everyone sees the others where their own clients have them, updates come at the original's rate, a
player leaves and drops back in with the character's password, Back stops the game and the room closes after
the last player.

## The network

As the original: the TCP stream for the login, the critical packets and everything until UDP is on, and UDP
for the fast updates. COW asks for UDP as it enters the game (its default, `tryUdp: on`); from then on the
server sends positions, torpedoes and the status as datagrams, each with its sequence number, and COW sends
some of its commands as datagrams. On this site the stream is the room's reliable channel and a datagram is an
unreliable message (a WebTransport datagram; over the WebSocket fallback it arrives anyway). A lost datagram
is lost, as on the original's network: the next update has the ship where it is now. COW's UDP window (`+`)
switches between simple UDP, fat UDP and receiving by TCP only, asks for a full update, or goes back to TCP.

## Playing online

Press **Play**:

* **Create room** and **Start** open a galaxy; or **Join** one that runs. Others join and leave while it runs
  (up to 16 players).
* COW's login window asks for your name (your name on this site is filled in) and a password: a new name
  becomes a character, and its password is the one you type twice.
* Press Enter for the default team, or pick a team's window and a ship's key (s d c b a o).
* **Back** leaves the galaxy. It ends when its last player leaves.

## Controls

COW's default keys (h shows them all in the game):

| Key | Action |
| --- | --- |
| right mouse button, k | steer towards the pointer |
| left mouse button, t | fire a photon torpedo towards the pointer |
| middle mouse button, p | fire a phaser |
| 0–9, !, @, %, # | speed 0–9, 11, 12, maximum, half of maximum |
| s, u | shields |
| c | cloak |
| f | fire a plasma torpedo |
| d, D | detonate the enemy's torpedoes, your own |
| o | orbit a planet, dock at a base |
| b, z, x | bomb, beam up armies, beam down armies |
| l, ; | lock on a player or planet, on a planet |
| T, y | tractor, pressor beam |
| R | repair |
| r | refit (another ship, at your home planet) |
| e | docking permission |
| * | call the practice robot |
| E, F | distress call, report the armies you carry |
| m then A, T, a team or a player | send a message |
| i, I | information on a player or planet |
| L, P, U, S, w | players list, planets list, ranks, statistics, war window |
| + | the UDP window (UDP or TCP, receive mode, full update) |
| q, Q | quit (fast) |

## Deviations from the original (each because of the browser or the website)

* **No sounds.** COW's release has none, and the separate sound package (COW-Sound 3.00) has no licence and
  contains Star Trek audio. COW's sound code is kept as it is and finds no sound files, as the original does
  without them.
* **No metaserver; servers are rooms.** COW connects to the room's server: its command line is
  `netrek-client-cow -h <this site's host name>`. The metaserver list (`-m`) and the command line's other
  options are not offered.
* **Datagrams go to the room's server only.** The ports in the UDP negotiation are the original's numbers
  (the server's from 32768 up, as a kernel gives them), but every datagram of a seat goes between that seat's
  client and its ntserv, whatever address and port COW names.
* **Characters per account.** The server's player file is kept in the website's `players` table under your
  account: one character per account, the one you played last. In a new galaxy it comes back with its rank and
  statistics when you log in under its name, and the first password you type is its password in that galaxy;
  another account cannot take a name that is already in the galaxy without its password, as on the original.
  Names that nobody in the galaxy has are new characters, as on the original.
* **The rc file.** COW reads `.netrekrc` from your account's storage (a new player's has
  `name: <your name>`; everything else is COW's default). COW 3.3.3 never writes it, and the site has no
  editor for it yet.
* **Room options.** Each galaxy runs the server's sample `sysdef` (its defaults). The server module accepts
  `sysdef` lines as room options (tournament size, ships, plasma, ranks, chaos, hidden mode and the like,
  checked against a list of keys and values), but the site's room dialog does not offer them yet.
* **No server operator.** The server's operator tools in `tools/` (`xsg`, `trimscores`, `setgalaxy` and the
  others) are not ported; there is no shell on the server. Messages to GOD work as on the original (its
  commands and votes).
* **Robots.** The robots the server starts itself are the original's robotII: the practice robot (`*`), the
  rescue robots and the HunterKiller. The other robot programs of the package, which an operator starts from
  the shell (`newbie`, `pret`, `inl`, `mars`, `puck`, `basep`), are not ported.
* **The X display.** COW's windows are drawn at the places COW gives them, scaled to the page (whole-number
  scaling when it fits); there is no window manager, so they cannot be moved. The keyboard is read by key
  position as a US keyboard; COW moving the pointer (`XWarpPointer`) does not move the real one.
* **Time and process.** COW's clock is the browser's; its process id is random. Leaving the room ends COW as
  closing its connection would; dropping back in starts COW anew, with a new connection.

## Files

| Path | What |
| --- | --- |
| `src/index.ts`, `src/host.ts`, `src/screen.ts` | the game in the page: room, stream, rc file, display, input |
| `src/cow/` | COW 3.3.3, translated (do not edit: `re/netrek/tools/translate.sh`) |
| `src/rt/` | the C runtime COW runs on |
| `src/xlib/` | the X server (after the oracle's recording Xlib), its fonts and keysyms |
| `src/proto/netrek.ts` | the bindings of `protocol/games/netrek.capnp` |
| `assets/pixmaps/` | COW 3.3.3's images, unchanged |
| `test/` | the replay of the client oracle |
| `e2e.mjs`, `screenshots.mjs` | the end-to-end test, the screenshots for the game page |
