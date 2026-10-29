# FreeCol

A port of **FreeCol 1.2.0** (2024), the open-source game after Sid Meier's Colonization, from its Java source
to TypeScript. Alone you play against the computer; online, two to eight players share one game, in which the
computer plays the other nations.

## How the port is made

- `src/gen/` is FreeCol's Java (the model, the rules, the savegames, the server and its AI, the client and its
  Swing GUI) and the parts of the JDK's Swing, AWT and Metal look and feel that FreeCol reaches, translated to
  TypeScript by `re/freecol/tools/j2ts` (`re/freecol/tools/translate.sh`). It is generated: change the
  translator, not these files.
- `src/jre/` is the part of the Java library the translation uses, with Java's behaviour where FreeCol's
  results depend on it (HashMap orders, `java.util.Random`, float printing, string hashes, integer arithmetic),
  and the native bottom of AWT: fonts with Java's metrics, images, drawing on canvases, windows and input.
- `src/port/` replaces the classes of FreeCol that are platform code (sockets, threads, sound), and runs the
  game in two workers as the original runs a server and a client in one JVM: `worker-server.ts` (the server
  and its AI players) and `worker-client.ts` (the client, drawing into canvases), joined by pipes in shared
  memory. `src/index.ts` shows the client's screen on the page and sends it the mouse and the keyboard.
- Online (`src/online.ts`, `src/port/server/lockstep.ts`, `protocol/games/freecol.capnp`), every player's browser
  runs the same FreeCol server and AI from the round's seed, in deterministic lockstep: what a player's client
  sends its server goes to the site's server, which puts every player's messages in one order and sends them to
  every browser; each browser's server takes them in that order. The browsers report whose turn it is and, with
  every new turn, a hash of the whole game; our server compares them.
- `assets/data/` is the release's `data/` folder, unchanged (`re/freecol/tools/assets.sh`); `assets/fonts/`
  the DejaVu fonts Java's logical fonts use and their Java metrics (`re/freecol/tools/fonts.sh`);
  `assets/jdk/` the JDK's Swing texts, icons and cursors (`re/freecol/tools/jdk-resources.sh`).
- `test/` checks the port against the original (`re/freecol/oracle/`, run on the reference release):
  the rule sets, loading and saving games, the Java library, whole games played by the AI, and the client's
  screens (component trees, `test/oracle/`).

## Deviations from the original

- **No intro video.** The original plays `freecol-opening.video.ogg` (Theora) at start; browsers no longer
  play Theora, and re-encoding it would change the original's data, so the port starts without it.
- **Images load when first shown.** The original reads all its images (about 1,700 files, 96 MB) before it
  shows the main menu; the port reads each when it is first drawn, as the original does for an image its
  preloading has not reached yet. The game starts after a few MB instead of the whole set. Music and sounds are
  downloaded when they are first played: the main menu shows at once, and its music starts when it has arrived.
- **Saved files live in the site's storage.** What the original keeps in the user's directories (client options,
  saved games, autosaves, maps) is kept per player on this site's server, which holds 64 files and 4 MiB per
  player and game: when a new file does not fit, the oldest autosaves of past years are deleted to make room
  (the autosaves of the last two turns stay). Logs are not kept.
- **Sound** is decoded and played by the browser (Web Audio), which is also the only audio device the
  preferences list.
- **One window, one screen.** The game's window is the page's game area (its size when Play is clicked), and
  the screen FreeCol sees is that window; the network has one interface, the loopback one.
- **Identity hash codes.** Where the original's results depend on the JVM's identity hash codes (enum constants
  hashed into sets), they differ between JVMs. The port behaves like HotSpot with `-XX:hashCode=2` (every
  identity hash is 1), with which the test oracle runs.
- **Long integers** are kept in JavaScript numbers: exact up to 2^53, which FreeCol's game values never reach.
- **Online play goes through the site.** "Start multiplayer game" and "Join multiplayer game" in the new game
  panel open the site's lobby (the address and port fields are not used; the meta server's list is not
  offered): the player who opens a room sets its rules and difficulty, the round's players then meet in
  FreeCol's start panel as in the original, where the first to arrive is the game's admin. Every browser runs the
  whole game (above), so a player who leaves the round can come back (the browser replays the round so far, and
  the player picks the nation again as the original offers it); a player who leaves for good is played by the
  computer from then on. National advantages are those of the rules.
- **Online, fog of war is not secret.** Every browser runs the whole game, so a modified browser could see the
  whole map. What must be fair is checked: our server takes a player's moves only while it is that player's turn
  (as the original's server does), its random numbers come from salts the browsers cannot foresee, and a browser
  whose game differs from the others' stops the round.
