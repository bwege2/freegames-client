# FreeCol: reference notes

## Reference version

FreeCol **1.2.0**, the latest stable release (checked 2026-10-28: GitHub `FreeCol/freecol` has tags up to `v1.2.0`,
2024-07-23, and only nightly "git" builds after it; SourceForge's `freecol/freecol-1.2.0/` is the release).

| Package | Bytes | sha-256 |
| --- | --- | --- |
| `freecol-1.2.0-src.zip` (source and data) | 231,798,930 | `15139e4cea5cea72fb009e9658c2395f9d945224d8d235a1401c93030197a9ba` |
| `freecol-1.2.0.zip` (release build, `FreeCol.jar` Revision 1690a5f) | 217,224,848 | `554e7a2de9d178366ac6385b2f42cc329148b2a6c61ef401eb6160d4c0f6fa70` |

`fetch.sh` downloads, verifies and unpacks both into `orig/` (not committed). The source zip equals the GitHub
tag `v1.2.0` file for file, but for the version string in `FreeCol.java` (`1.1.0+git` in the tag).

Rules: `data/rules/classic` (the original Colonization rules) and `data/rules/freecol` (FreeCol's rules, which
extend classic; the default).

## Licences

Checked over the whole `data/` tree (every README in it, the font's own notice) and against Debian's
`debian/copyright` for `freecol 1.2.0-1` (sources.debian.org; Debian ships 1.2.0 in main).

| Files | Licence | Ship? |
| --- | --- | --- |
| All code (`src/`) | GPL-2.0-or-later (`LICENSE`, file headers: "Copyright (C) 2002-2024 The FreeCol Team") | translated to TypeScript |
| Rules, strings (`data/rules`, `data/strings`, 62 locales via translatewiki.net), maps (`data/maps`) | GPL-2.0-or-later (FreeCol team) | yes |
| Images (`data/base/resources/images`, `data/default/resources/images`), animations (`.sza`), sounds but `alert.ogg`, the intro video | GPL-2.0-or-later (FreeCol team), except the rows below | yes |
| `data/base/resources/fonts/ShadowedBlack.ttf` | GPL-2.0-or-later ("(C) Copyright Paul Lloyd 2002 / Licensed under the GPL 2 or later", in the font) | yes |
| `data/base/resources/fonts/signature.faf` | GPL-2.0-or-later (FreeCol team) | yes |
| `data/default/resources/music/default/*.ogg` (12 tracks) | CC-BY-4.0: Alexander Zhelanov (11), Stian Grenborgen (`musicbox.ogg`) | yes, with credit |
| `images/goods/meat.png` | CC-BY-SA-3.0, derived from 0 A.D.'s `action-gather-meat.png` (Wildfire Games) | yes, with credit |
| `images/terrain/river/pebbles.png` | CC-BY-3.0 (OpenGameArt "pebbles surface") | yes, with credit |
| `images/terrain/ocean/*`, river water | CC0 (Wesnoth water animation by zookeeper and Zabin, OpenGameArt) | yes |
| `images/terrain/desert/*` | CC0 (OpenGameArt "2048 digitally painted tileable desert sand texture") | yes |
| `images/bonus/game.png` | CC0 (OpenGameArt "old deer male" by CDmir) | yes |
| `images/monarch/*`, `images/ui/doi.png` | public domain (Wikimedia) | yes |
| `images/ui/military.png`, `political.png`, `religious.png`, `trade.png`, `exploration.png`, `landing.png`, `bg_map1.jpg` | faithful reproductions of public-domain historical maps (David Rumsey Map Collection); Debian: not copyrightable (Bridgeman v. Corel). In Germany, § 68 UrhG (since 2021) gives reproductions of public-domain visual works no neighbouring right. | yes |
| `sound/event/alert.ogg` | **"derived from http://www.freesound.org/people/acclivity/sounds/32304/"**. That sound is today **CC BY-NC 4.0** on Freesound (checked 2026-10-28). It may have been taken under Freesound's earlier Sampling+ licence, which allowed transformed commercial use, but nothing records that. | **open: see below** |

No file is AGPL. Not shipped in any case: `srcdata/`, `unused/`, `www.freecol.org/`, `jars/` (Java libraries:
commons-cli, cortado, jogg/jorbis, miglayout: only MigLayout, BSD-3-Clause, would be translated if the Swing
layer needs it).

`alert.ogg` (the "alert" event sound) is the one file whose licence does not allow free redistribution as it
reads today (non-commercial only). Decision (claude_b, 2026-10-28): ship it on this non-commercial site, with
full credit, the Freesound link and the licence in `web/games/freecol/LICENSE.md`, which also says that it must be
removed for any commercial redistribution.

The intro video (`freecol-opening.video.ogg`, Theora) is left out (claude_b, 2026-10-28): browsers no longer play
Theora, re-encoding would change the original's data, and a decoder compiled to WASM is not what porting rule 2
wants. A listed deviation.

## Decisions (claude_b, 2026-10-28)

- **Online: deterministic lockstep.** Every browser runs the same translated server and AI; our server's module
  maps seats to nations, enforces turn order, relays commands in its order with a random salt per command,
  compares the state hashes every client reports at each turn end (a mismatch stops the game, with the turn named),
  hands a leaving seat to the AI from a tick it announces, and records results only when all seats agree.
  Fog of war is not secret to a modified client (a deviation). No GPL Java in the server, no core change.
- **Single player:** the translated server and AI in a Web Worker, the client on the page.
- **Assets** load lazily (only the language in use, music track by track), unchanged from the original.

## Architecture of the original (what has to be ported)

Even single player is client/server: the client starts a `FreeColServer` in its own JVM and connects to it over a
loopback **socket** (`Connection`, XML messages, `common/networking`, 116 message classes). The AI players live
in the server: `AIMain` wraps the server's own `Game`, each AI player talks to the server through a
`DummyConnection` (message objects passed in memory, no XML), and its turn runs in a thread of its own
(`AIPlayer.invoke`). Turns are sequential: one current player; `InGameController.endTurn` advances, runs
`csNewTurn` for everyone at the end of a round and hands the turn to the next player. The client keeps its own
copy of the game, built from the server's XML change sets, with only what its player can see. Saves (`.fsg`) are a
zip of `savegame.xml` (the whole server game, including the server random's state) and `savegame.properties`.

Code size (`tools/sloc.py`, non-blank non-comment lines / all lines):

| Part | Code | All |
| --- | ---: | ---: |
| `common/model` (rules, game state) | 33,662 | 70,338 |
| `common/networking` (messages) | 9,065 | 19,476 |
| `common/` io, option, util, i18n, resources, sound, logging | 10,069 | 21,185 |
| `server/ai` | 14,205 | 25,228 |
| `server/model` (rules executed: `cs*` methods) | 6,847 | 10,640 |
| `server/control`, `generator`, networking, `FreeColServer` | 5,950 | 9,717 |
| `client/control` and the rest of `client/` | 5,485 | 9,679 |
| `client/gui` (Swing, 336 files) | 41,177 | 72,450 |
| not needed: `tools`, `metaserver`, `common/debug`, `FreeCol.java` | 4,599 | 8,572 |
| **total** | **131,137** | **246,603** |

Java features the translator meets: 1,295 lambdas, streams (`java.util.stream` in 79 files), 165 anonymous
classes, enums with bodies, generics, inner classes, `float` arithmetic (76 files), `java.util.Random` (46 files),
`HashMap`/`HashSet` iteration (100 files; the keys' `hashCode` is the id string's, so the order is deterministic
and must be reproduced), reflection only for XML (`FreeColXMLReader` makes objects by tag name), threads only in
networking, the AI's `invoke` and image/sound helpers.

## The server oracle (`oracle/`)

`oracle/Oracle.java` runs the original server headless in one JVM, as the original's own debug run
(`--debug-run`) plays: the human seat skips its turns, all other nations are the original AI. It writes
`turnNNN.fsg` at the start of every turn. The original seeds new games from `new Random()` (`--seed` only reseeds
loaded games), so the oracle reseeds the server random, the in-game controller, the map generator, the game and
NameCache's static cities of Cibola from one seed.

(The release's own `--headless --debug-run` does not work in 1.2.0: a WARNING with a stack trace at start-up,
"Special options unavailable" without an `options.xml`, ends the debug run through
`FreeColDebugger.handleCrash` before it starts, and with an `options.xml` the headless client stops at login,
its GUI actions failing with NullPointerExceptions. The GUI under Xvfb starts and logs in but waits in the
pre-game.)

Measured on 2026-10-28 (this machine, JDK 21, default map 40×100, `freecol` rules, medium difficulty, 4 European
AIs + 8 native AIs; `oracle/run.sh SEED 200 OUT`):

- **Deterministic:** two runs with the same seed give the same `savegame.xml` at every turn (1–30 compared,
  seed 1; also 1–10 again from `run.sh`), but for the save date, the game's UUID and the header comment.
  Different seeds give different games.
- **Map generation:** ~300 ms.
- **One round of turns** (all AI players and `csNewTurn`), wall time: 70–130 ms in turns 2–50, ~220 ms at 75,
  ~350 ms at 100, ~440 ms at 150, ~640 ms at 200; mean 374 ms over 200 turns, worst 1,433 ms (turn 94).
- **Live heap** after GC: 7.5 MB at turn 1, 9 MB at 50, 10.4 MB at 200 (30 colonies, 40 native settlements,
  395 units).
- **Save size:** 76 KB at turn 1, 84 KB at 30, 101 KB at 97, 121 KB at 200 (`savegame.xml` 1.1–1.8 MB
  uncompressed).

### Identity hash codes: the oracle runs with `-XX:hashCode=2`

Some of FreeCol's orders depend on Java identity hash codes: `Modifier.hashCode` hashes its `ModifierType`, an
enum, whose `hashCode` is `Object`'s; the modifiers of a type sit in a `HashSet`, and its order is written into
saves (and decides the order modifiers apply in). HotSpot's identity hashes come from a thread-local generator
whose state depends on everything the JVM hashed before, so they differ between JVM versions and options: the
original is reproducible only on one JVM build with one command line. The oracle therefore runs HotSpot with
`-XX:+UnlockExperimentalVMOptions -XX:hashCode=2`, where every identity hash is 1, and the port's runtime does the
same (`jre/lang.ts identityHash`). Both are then reproducible and equal. (With every identity hash equal, maps with
identity keys put them all in one bin; Java turns long bins into trees, and the runtime reproduces those tree bins
exactly, below.)

### The original is not reproducible: AI threads and an unseeded shuffle

Two runs of the oracle with the same seed (seed 7) part at turn 62. Two causes, both in the original:

- **Unseeded randomness.** `EuropeanAIPlayer.buyShip` shuffles the ship types with `Collections.shuffle(list)`,
  which uses a `Random` seeded from the clock (so does `NameCache`'s river names). The oracle seeds
  `Collections`' random from the game's seed (reflection, `--add-opens java.base/java.util`), and so does the
  port (`Collections.r`). In the browser it stays unseeded, as in the original.
- **AI threads.** Every AI action runs in a thread of its own (`AIPlayer.invoke`): a whole turn, and every
  answer to the server (a name for new land or a region, a founding father, a diplomatic reply). They race
  with the server and with each other; which request reaches the server first decides, for example, the order
  of history events or whether a diplomatic session is still open when a turn ends. The oracle therefore runs
  the original with **one change** (`oracle/patch.py`, `oracle/patch/OracleScheduler.java`, applied to copies
  of `AIPlayer.java` and `DummyConnection.java` and put before `FreeCol.jar` on the class path): all AI work
  on one thread, a turn as a task after the one that started it, an answer when the server has finished the
  request it is busy with and before the AI's next request. The port's scheduler (`src/port/threads.ts`) does
  the same. With both, the oracle is reproducible (seed 7, 150 turns, twice equal) and the port follows it.

## The translator (`tools/j2ts`)

`tools/translate.sh` compiles the original's whole source with javac (parse, attribute, flow: every name, type and
overload resolved as javac resolves it; internal javac trees, `--add-exports`) and writes one TypeScript module per
top-level class into `web/games/freecol/src/gen/` (committed, `// @ts-nocheck`, "do not edit"), keeping the Javadoc.
Step 1 translates `net.sf.freecol.FreeCol`, `common` and `server` (411 modules, 129k lines); the client and its
Swing GUI come in step 4. `work/j2ts-report.txt` lists every member of the Java library the output uses.

Conventions (`Emit.java`):

- **Constructors** are init methods called on a fresh object: `new Unit()._Unit(game, id)` (`_Class$Types` when a
  class has several). An init method calls the superclass's init first, then runs the field initializers, then
  the body, and returns `this`: Java's order, also for virtual calls from a superclass constructor.
- **Overloads.** Methods that override each other form a family (javac's `overrides` and `implementation`) and
  share one name. A family keeps its Java name unless another family of the same name is visible in some class
  (an overload, or a private method on the same prototype chain): then it is `name$Type1$Type2`. Families that
  include a Java library method keep the library's name. Fields that collide with a method or shadow an
  ancestor's field are renamed (`name_`, `name$Class`).
- **Linking without import cycles.** A module imports only its superclasses; every other class is a module-level
  binding set at link time (`$J.module(() => { Game = $J.load('...Game'); })`). `index.ts` imports every module
  and links them. Platform replacements (`src/port/`) register under the original's class name.
- **Static initializers** run lazily, as Java does: on the first use of the class (an instance, a static method, a
  static field that is not a constant) the runtime runs `$clinit` (after the superclass's). FreeCol depends on
  this order (the `FreeCol` class's options read messages loaded later).
- **Inner classes** keep their enclosing instance in `$outer` (`.$o(outer)` before the init). Anonymous and local
  classes are made once, at module level (`function Outer$1()`, made on first use), as javac makes them: the
  local variables they capture are passed in (`.$c(a, b)`, fields `$cv_a`), not closed over. (Made in place,
  each evaluation made a new class: 60 AI turns took 165 s instead of 88 s.)
- **Enhanced for** over an `Iterable` is Java's loop: `iterator()`, `hasNext()`, `next()` (so a list changed
  during the loop behaves as in Java, as far as Java does not throw); over an array, `for … of`.
- **Functional interfaces** of `java.util.function`, `Comparator`, `Runnable`, `Callable` and FreeCol's own
  lambda targets are plain functions; an object that implements one is turned into a function where it is passed
  as one (`$J.fn`, one per object and method). Lambdas for other interfaces (`Iterable`, listeners) become objects
  with the method (`$J.lambdaObj`).
- **Numbers.** `int`: sums wrap (`(a + b) | 0` at the top of a chain), `*` is `Math.imul`, `/` is `$J.idiv`
  (truncating, `/ by zero`); casts as Java (`$J.d2i` saturates). `float`: every operation is rounded
  (`Math.fround`). `char` is a number; string conversion is Java's (`$J.fstr`, `$J.dstr`: JDK 19+ shortest
  digits, at least two). `long` is a JavaScript number (exact to 2^53; shifts and bit operations through BigInt).
- **Strings and boxed numbers** are JavaScript primitives: their methods are rewritten (`Lib.java`), and
  `equals`/`hashCode`/`compareTo` on values that may be primitives go through `$J`.

## The runtime (`web/games/freecol/src/jre`)

Java's library as FreeCol uses it, with Java's results where they matter: `HashMap`/`HashSet`/`LinkedHashMap`
exactly as OpenJDK 21 (spreading, table sizes and growth, resizing order, `computeIfAbsent`/`merge` linking at the
bin's head, and tree bins: red-black trees with Java's balancing, whose root moves to the front of the bin's list),
`java.util.Random` (48-bit generator, `nextInt(bound)`, `ints`, `nextGaussian`) and its serialized form in saves,
`PriorityQueue`'s heap, `Collections.shuffle`, stable sorts, streams with Java's collectors, `String.hashCode`,
`split`, `format`, `Properties` files, a StAX reader and a writer that writes what the JDK's `XMLStreamWriterImpl`
writes, zip files (fflate), and a virtual file system. The parts that reproduce OpenJDK's algorithms (the hash
tables and their tree bins, `PriorityQueue`) are adapted from OpenJDK 21 (GPL-2.0 with the Classpath Exception).

Streams push: the terminal operation sends each element through the stages one at a time (a sink returns true
to stop, as Java's `cancellationRequested`), so lambdas run in Java's order and short-circuiting stops where
Java's does; `sorted` is a barrier, as in Java; only `iterator()` pulls (generators). FreeCol's AI and server
are built on streams (`CollectionUtils`): with generators in every stage, 60 AI turns took 88 s, pushing 32 s.

**Speed** (seed 7, freecol rules, node 22, this machine): 60 turns of all-AI play in 23 s (the original: 6–8 s), 150
turns in 205 s with a save and comparison every turn; a round of turns takes 0.1–0.5 s up to turn 80 and
1–3 s around turn 100, in the browser's worker.

## The client (step 4)

**Swing, AWT and Metal are translated too.** `tools/translate.sh` compiles the JDK's own desktop sources
(`tools/jdk-sources.txt`, from the JDK's `src.zip`, checked by its sha256) together with FreeCol (javac's
`--patch-module java.desktop`) and MigLayout 5.3 (`fetch.sh`). `tools/j2ts/Reach.java` keeps only what FreeCol
reaches: a rapid type analysis from FreeCol's code and the roots in `tools/jdk-roots.txt` (what the hand-written
native bottom calls, and the look and feel's UI classes, named by strings). The native bottom is hand-written in
`src/jre` and `src/port/client`: the toolkit, fonts (TrueType outlines and Java's metrics table, below), images
(PNG, GIF, JPEG decoders), `Graphics2D` on an HTML canvas, window peers (windows are rectangles on one screen
canvas, stacked, no window manager), focus, mouse and keyboard input.

**Threads.** The client's threads (the EDT, the receiving thread, timers, workers) run on a scheduler
(`port/client/sched.ts`): a started thread is a task; a thread that blocks runs other work in a nested pump, and
blocks the worker on a doorbell (`Atomics.wait`) when there is none. The receiving thread listens from the moment
it is started (`port/receiving.ts`): the EDT waits for the reply to its login. FreeCol's sound threads are
replaced by an event-driven `SoundPlayer` with the original's queue, playlist and volume
(`port/client/sound.ts`); the page plays the files.

**Two workers** (`src/index.ts`, `src/worker.ts`, one script for both): the server worker (`port/web/server-main.ts`:
FreeCol's servers and their AI) and the client worker (`port/web/client-main.ts`). They talk through rings in
shared memory (`port/ring.ts`, `port/protocol.ts`): the client's sockets are pipes, and requests to the server
worker (start a server, load, save, its state) are calls. The client's `FreeColServer` is a stand-in whose
methods are such calls (`port/client/remote.ts`); FreeCol serializes the specification for it as a savegame
holds it. The server worker blocks only where the original's server threads wait for a client
(`NetworkReplyObject.getResponse`, the reply to a change set it sent): it waits on its doorbell and takes in what
the client sends meanwhile. The page sends input into a third ring and shows the client's screen, an
`ImageBitmap` per frame (at most one per 15 ms).

**Files.** The client and server read the game's files synchronously, as Java does: an index of the built assets
(`import.meta.glob`, vfs path → hashed URL) and a synchronous request per file in the worker, cached by the
browser for a year. `startup-files.txt` lists what the first screens read (main menu, new game panel, start game
panel; sounds and music load when first played); `tools/lazy.py` makes `game.json`'s `lazyAssets` of the rest. The original reads all its
images before the main menu (`ResourceManager.startPreloading`); the port reads each when first drawn (as the
original's `ImageResource.getImage` does before its preloading has reached it).

**Fonts.** Java's logical fonts on the reference machine are DejaVu 2.37 (`fetch.sh`; `oracle/run.sh` gives the
oracle's JDK a font configuration with only these, Dialog = DejaVu Sans, Serif = DejaVu Serif). Text is measured
with Java's own advances (`oracle/FontTable.java` writes the table, `tools/fonts.sh` copies it with the fonts) and
drawn glyph by glyph at those advances.

**The client oracle** (`oracle/ClientDump.java`): the original client under Xvfb, the screen the size of the
window (1280x800; FreeCol scales its fonts and images by the screen), the network one loopback interface and the
host name `localhost` (`unshare -rnu`: the new game panel lists the machine's addresses), the user `player`. It
goes from the main menu to a screen by clicking buttons and writes the Swing component tree (class, bounds,
visibility, preferred size, font, text) and the pixels. `tools/client-trees.sh` writes the trees of the screens in
`web/games/freecol/test/oracle/screens.json` there; `test/client.test.ts` runs the port's two workers in node
(worker threads, `test/workers.ts`), clicks the same buttons and compares the trees: main menu, new game panel and
start game panel are the original's. `e2e.mjs` compares the main menu's pixels in Chromium (0.17% of the pixels
differ by more than 8 of 255, 0.05% by more than 96: text antialiasing).

## Online play (step 6)

**Lockstep.** `web/games/freecol/src/port/server/lockstep.ts` runs FreeCol's server in every player's server
worker: a new multiplayer `FreeColServer` with the rules and difficulty of the room, its random (server, game,
map generator, `Collections.shuffle`, the game's UUID) from the round's seed. The local client connects to it as
the original's "Join multiplayer game" does (`client-main.ts`, in a thread of its own: `joinMultiplayerGame`
waits for the server's first message, which a thread handles). What the client sends its server is not given to
the server: each line (and the opening and closing of a connection) goes to the site's server module as a
command; only the client's replies to its own server's questions go in at once (every browser's server gets the
same empty reply from that seat, below). The module (`server/.../games/freecol/FreecolModule.java`) numbers the
commands, adds a random salt to each and sends them to everyone as entries. Each browser applies the entries in
their order: before each one the server's random is reseeded from seed, salt and index (no browser knows the
next random numbers before the entry exists); a seat's lines go to that seat's connection, which is the client's
pipe for the own seat and a stand-in for the others' (it answers each of the server's questions at once with an
empty reply, as FreeCol's clients always do); the threads the entry starts (one per message, the AI's turns) run
to their end, in order, before the next entry (`$J.startThread` queues them). So every browser's server does the
same work in the same order. After an entry that changed whose turn it is, the browser reports turn, seat on turn
and, on a new turn, a 64-bit hash of the game as a savegame holds it; the module compares them (a difference
stops the round: Stopped, results `DESYNC`).

**What the module checks** (no FreeCol code on our server): seats 2 to 8; a command's size (32 KiB) and the
round's entries (1,000,000) and bytes (128 MiB); while the game runs, a seat that is not on turn may not send the
messages the original's server takes only from the player on turn (`Message.currentPlayerMessage`, 47 tags):
sent on their own they are dropped, sent as questions they pass and every browser's server refuses them as the
original does (the client waits for that answer). A seat that leaves is handed to the computer by an entry the
module adds (`changeAI`; on turn, the computer ends that turn); a seat that comes back gets a drop entry and the
round's entries (History, in chunks of 48 KiB), and its new browser replays them without its client (`liveFrom`),
then logs in again (the original asks which vacant nation to take). The round's result is recorded when every
seat still playing reports the same end of the game.

**Found on the way.** Joining a running game, the original's client builds the in-game menus right after the
login reply while the EDT adds the game's actions (`addSpecificationActions`, invokeLater): in the JVM the EDT
wins; here the joining thread lets the EDT run first (`client-main.ts`, `restoreGUI`). In the JVM the thread a
reply wakes (the login, which sets the client's game up) runs while the receiving thread reads on; here, after a
reply, the client's reading pauses until that thread has run (`port/receiving.ts`), else the next message (another
player's login) is read before the client has a game. The game's UUID is random in the original
(`UUID.randomUUID`); online it comes from the seed.

**Tests.** `server/src/test/.../freecol/FreecolModuleTest.java` (the module with loopback clients: options,
order and turns, a desync, the end, leaving and coming back, limits); `web/games/freecol/test/online.test.ts`
(two browsers' workers in node with a stand-in for the module: they join, start a game from FreeCol's start
panel, end three turns with the same reports and hashes; one browser is replaced by a new one that replays the
round, logs in again and plays on with the same hash); `web/games/freecol/e2e.mjs` (two Chromium contexts on the
real server: Start/Join multiplayer game, the lobby, FreeCol's start panel, the game, a turn of each player, no
stop).

## Checks (steps 1–3)

`web/games/freecol/test/` (run by `npm test`; each skips with a message when the oracle is missing):

- `jre.test.ts`: `oracle/probe/.../JreProbe.java` prints what the port relies on from the Java library (hash
  map orders with list and tree bins, removal and resizing, sets, `Random`, float and double printing, integer
  arithmetic and rounding, string hashes, `split`, `format`, `PriorityQueue`, sorting, shuffling, streams); the
  same file translated by j2ts prints the same text in the runtime.
- `rules.test.ts`: both rule sets (classic, freecol) at four difficulties, read and prepared by the port as by the
  original (`SpecDump.java`): the same serialized specification.
- `roundtrip.test.ts`: three games played by the original AI (freecol seed 1 and classic seed 2 for 40 turns,
  freecol seed 7 for 150 turns: colonies, natives, Europe, the market, missions) are loaded and saved again by the
  original server (`RoundTrip.java`) and by the port: the same `savegame.xml`, byte for byte, at turns 1, 2, 10,
  20, 25, 40, 100 and 150. Its mutation check breaks the port three ways (Java float printing, Java string
  hashes, one attribute of the translated model) and each one is caught.
- `play.test.ts` (steps 2 and 3): new games from a seed, played by the original (`Oracle.java`) and by the port,
  saved at the start of every turn: every `savegame.xml` is the original's (but for the game's random UUID), so
  map generation, the server's turns, the native and European AIs and their thread order are the original's.
  Four games: freecol seed 7 for 100 turns and classic seed 2 for 60 with the human seat skipping its turns, and
  freecol seed 3 and classic seed 5 for 60 turns with a **scripted human** (`Oracle.java humanTurn`, the same in
  `test/game.ts portPlay`): each unit by id takes up to four steps west-first, lands, and a colonist founds a
  colony where it may, then the turn ends, all through the client's messages (`MoveMessage`,
  `BuildColonyMessage`, `EndTurnMessage`). Each game runs in a node process of its own (`test/play-run.ts`), as each
  of the original's in a JVM of its own (FreeCol keeps names in static fields). Its mutation check changes the
  port three ways (units move one step further, tiles produce one more, one bounded random draw in a thousand
  comes out higher) and each is caught within 20 turns.
  (Mutations of the thread order are not caught within 20 turns: an AI turn run at once instead of as a task
  gives the same game, and the queued answers are rare; seed 7 showed the race at turn 62.)
