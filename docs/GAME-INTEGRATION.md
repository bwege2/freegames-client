# Putting a game on the website

Everything of one game lives in its folder `web/games/<id>/` (plus, if it talks to the server, its
schema `protocol/games/<id>.capnp` and its server module, `docs/SERVER.md`). The website finds games by
their folders; nothing else needs registering on the web side.

The working reference for everything below is the example game: `web/games/example/` (a dice race,
not listed; open `#/example` on the site), `protocol/games/example.capnp` and
`server/src/main/java/net/slop/freegames/games/example/ExampleModule.java`.

## The folder

| Path | What |
| --- | --- |
| `game.json` | the game page: title, tagline, summary, facts about the original, players, controls, screenshots (schema: `GameManifest` in `web/src/sdk/game.ts`; checked by `web/test/catalog.test.ts`) |
| `screenshots/` | PNG/JPG/WebP/GIF screenshots **of the port**, listed in `game.json`; the first is the thumbnail on the start page. A playable game shows at least two. |
| `src/index.ts` | exports `start` (below). Once it exists, the game's Play button works. It is loaded as its own chunk only when someone plays. |
| `src/…` | the port. Import assets with Vite (`import url from '../assets/x.png?url'`, `import.meta.glob`), so they get hashed file names and are served by the server. |
| `src/proto/<id>.ts` | generated from `protocol/games/<id>.capnp` by `tools/gen-protocol.sh` (commit it) |
| `assets/` | the original's data the port uses (converted losslessly where needed) |
| `test/*.test.ts` | headless tests (`node --test`, run by `npm test`): the port against the original |
| `README.md`, `LICENSE.md` | controls and deviations; license and credits |

All ten folders already have a `game.json` written from `docs/RESEARCH.md`: check it against what you
port, fill in controls and screenshots, and correct anything that is not exact.

The start page searches, filters and sorts the games with three fields of `game.json`:

| Field | What |
| --- | --- |
| `genres` | one or more of `GENRES` in `web/src/sdk/game.ts`: the Genre column of Wikipedia's table, spelled out (`docs/RESEARCH.md`) |
| `modes` | how it can be played, from `PLAY_MODES`: `single` (alone or against the computer), `multi` (two or more on one computer), `online` |
| `added` | the day the port went live (`YYYY-MM-DD`), for "Newest added". **Set it in the ticket that makes the game playable** (the catalog test asks for it once `src/index.ts` exists). |

The list's choices live in the URL (`#/?q=cave&genre=puzzle&year=1980s&players=online&playable=1&sort=year`);
`web/src/site/filter.ts` reads and writes it.

## `start(host, ctx)`

```ts
import type { StartGame } from '../../../src/sdk/index.ts';

export const start: StartGame = (host, ctx) => {
  // host: an empty, focusable element filling the window below the site's bar. Size the game to it
  // (ResizeObserver) and keep the original's aspect ratio; integer scaling for pixel art.
  const game = new MyPort(host, ctx);
  return { stop: () => game.destroy() };
};
```

The site calls `start` when the player clicks Play, and `stop()` when the player leaves: the Back button,
the browser's back, or `ctx.exit()`. After `stop()` nothing of the game may keep running. The SDK
ends much of it for you:

| Use | and the SDK ends it |
| --- | --- |
| `ctx.signal` for `addEventListener(…, { signal })`, `fetch`, your own timers | aborted on stop |
| `ctx.frame((time, dt) => …, signal?)` for the game loop | stops on stop (or when `signal`, e.g. a screen's, aborts) |
| `ctx.audio` (an `AudioContext`, started by the Play click) for all sound | closed on stop |
| `ctx.net` / `ctx.rooms` / `ctx.storage` / `ctx.scores` | the connection is closed, the room left |

Whatever else you start (a Phaser game, a three.js renderer, a Web Worker), `stop()` destroys it. The
host element is emptied after `stop()`.

Keys: the game gets every key, Esc included (the site uses no keys; in full screen, Chromium keeps
Esc for the game, and holding Esc leaves full screen). Call `preventDefault()` for keys the browser
would otherwise use (arrows and space scroll, `/` searches).

`ctx.exit()` is the original's "quit": it returns to the game page.

## Text games and pixel screens

Two shared pieces in the SDK, so that ports look and behave alike (optional, but use them unless the
original needs something they cannot do). The example game's menu shows both (**Terminal**, **Pixel
screen**); the code is `web/games/example/src/demos.ts`.

**`Teletype`**: a scrolling printing terminal for line-oriented programs (Hunt the Wumpus, Colossal Cave
Adventure, GNU Chess, pMARS's cdb). `write()` prints (`\n`, `\r` prints over the line, `\b`, `\t`, BEL
calls `onBell`), lines wrap hard at `cols` like a teletype, earlier lines stay readable above.
`readLine({ transform, maxLength })` reads a line with echo; `readKey()` reads raw keys.

```ts
const tty = new Teletype(host, { cols: 72, rows: 24 }, ctx.signal);
tty.writeLine('INSTRUCTIONS (Y-N)');
const answer = await tty.readLine({ transform: (s) => s.toUpperCase() });   // rejects when the game stops
```

**`TextScreen`**: a curses screen (default 80×24) for full-screen programs (Moria): `writeAt(row, col,
text)`, `moveTo`, `clear`, `clearToEol`, `clearToBottom`, `setAttr(REVERSE | BOLD | UNDERLINE)`,
`showCursor`, `readKey()` (raw, no echo) and `readLine()` (echo at the cursor, like `getstr`; it stays
on its row). Like curses without `scrollok`, writing the bottom-right cell or a newline on the last row
does not scroll (`new TextScreen(host, { scroll: true }, signal)` does). Writes through `screen.grid`
redraw too; `grid.snapshot()` / `grid.restore()` put the screen back after an overlay. Every key comes
with `seq`, the bytes a VT100/xterm sends (`"\x1b"` Esc, `"\x12"` Ctrl+R, `"\x1b[A"` Up,
`"\x1b[Z"` Shift+Tab), so a ported input routine can read them as the original read its terminal.
Characters typed with AltGr or macOS's Option, and finished IME compositions, arrive as characters.

Both scale the font so `cols` characters fill the window, take keys from a hidden text field (phone
keyboards, IMEs and paste work), keep game keys from scrolling the page, let copy (select with the
mouse, Ctrl+C), paste, F5, F11 and F12 through, and remove themselves when their signal aborts. The browser keeps a few
shortcuts no page can take (Ctrl+W, Ctrl+T, Ctrl+N): if the original used one, map it in the port and
list it in its README. The buffer logic (`TeletypeBuffer`, `TextGrid`, `LineEditor`, `keyInput`) has no
DOM, so tests can drive the port's output headless.

**`PixelScreen`**: a canvas at the original's resolution, scaled by whole numbers of device pixels when it
fits (else best fit), letterboxed, never blurred, with the original display's pixel aspect ratio;
`maxScale()` / `setScale(n)` for an original's zoom key:

```ts
// Apple II hi-res: 280x192 shown at 4:3, so a pixel is (4/3) / (280/192) as wide as it is high
const screen = new PixelScreen(host, { width: 280, height: 192, pixelAspect: (4 / 3) / (280 / 192) }, ctx.signal);
screen.ctx.fillRect(…);                                         // draw in original pixels
screen.canvas.addEventListener('pointerdown', (e) => { const p = screen.toPixel(e.clientX, e.clientY); … });
```

Phaser can render into it (`canvas: screen.canvas, type: Phaser.CANVAS`), or use its own scale manager
with `pixelArt: true` and `Phaser.Scale.FIT`.

## The server, from a game

The connection opens on first use; a game that never touches `ctx.net`, `rooms`, `storage` or `scores`
never connects (Hunt the Wumpus, Passage).

### Storage: what the original kept on disk

```ts
const save = await ctx.storage.get('savegame');            // Uint8Array | null
await ctx.storage.put('savegame', bytes);                  // replaces the file
await ctx.storage.list('table-');                          // [{ name, size, modified }]
await ctx.storage.delete('table-3');
```

Per player and game, names `[A-Za-z0-9._-]{1,64}`, 64 files, 512 KiB each, 4 MiB in total. Keep the
original's file format where it had one (a port can then read files the original wrote). Never keep
anything that must last only in `localStorage`.

### Score tables: a score file shared by everyone

```ts
const { rank, entries } = await ctx.scores.submit('scores', points, name, detail);  // rank 0: not in the table
const top = await ctx.scores.get('scores', 10);
```

The table is declared, and every entry checked, by the game's server module (`docs/SERVER.md`).

### Online multiplayer

```ts
const round = await ctx.lobby(host, {                      // the shared lobby: name, rooms, create, join, ready, start
  title: 'Ballerburg online',
  seats: { min: 2, max: 2 },
  seatNames: ['Left castle', 'Right castle'],
  options: () => packGame(Options, (o) => { o.rounds = 3; }),   // room options in the game's schema
});
// round: { seed, seats, you, options, round, rejoined }: seed every client's RNG with round.seed

ctx.rooms.send(packGame(Msg, (m) => { m._initShot().angle = 45; }), 'all');   // 'others' | 'all' | 'server' | { seat }
ctx.rooms.on('message', ({ from, seq, data }) => {
  let m; try { m = unpackGame(Msg, data); } catch { return; }      // peers may send garbage
  …
});
ctx.rooms.on('started', (r) => { if (r.rejoined) resync(); });     // back after a dropped connection
ctx.rooms.on('finished', (f) => { if (f.stopped) showMessage(f.stopped); else showResults(f.results); }); // stopped: the server's tick watchdog
ctx.rooms.on('finished', ({ results }) => …);
ctx.rooms.finish(packGame(Results, …));                            // host: end the round (a module may refuse)
```

Game messages are always one packed message of the game's own schema (`packGame`/`unpackGame` from
the SDK, `protocol/games/<id>.capnp`), never JSON. For lockstep play send inputs with `'all'` and apply
everyone's (your own included) in arrival order: the server's `seq` order is the same for every client.
`send(data, to, false)` is unreliable: only for messages the next one supersedes.

A **real-time game whose round keeps running while players come and go** passes `dropIn: true` to the
lobby. The lobby then also lists running rooms (with their player count, marked *running*) and joining
one puts you into the running round: `lobby()` resolves with the room's current `seed`, seats and your
seat, the others get `ctx.rooms.on('joined', (info) => …)` and `ctx.rooms.on('left', (info) => …)` when
players arrive or go, and the round ends when the module or the last player ends it. The server module paces the
simulation (`RoomContext.setTickInterval`, 10–1000 ms; XPilot's 50 frames/s is 20 ms) and can skip
frames for a slow seat (`RoomContext.queued(seat)`), see `docs/SERVER.md` "Real-time rooms".

A dropped connection reconnects by itself and gets its seat back (`started` again with `rejoined:
true`); the module or the other clients then bring it up to date. The module's catch-up comes right
after RoomStarted: messages of the running round that arrive before the game has called
`rooms.on('message', …)` (because it is still loading assets or starting a worker) are kept and
handed to the first `message` handler, in order, so a game may subscribe after awaiting its setup. After a **page reload** (or a closed
and reopened tab) the seat is kept for `RECONNECT_S` as well: the lobby lists that running round first,
as "(your game)" with **Rejoin** (`Rooms.isMine(room)`), and joining it gives `started` with
`rejoined: true`, the same path. A second tab of the same account takes the connection over; the first
gets the status `replaced` (and `closed` with "opened in another tab" if it was in a room) and does not
reconnect, so two tabs do not push each other out in turn. How to choose between lockstep,
server authority and state relay: `docs/SERVER.md`.

Local multiplayer the original had (hot-seat, two players on one keyboard) stays as it was; online is
an extra mode of the game's own menu.

## Downloads: what Play fetches first

Play downloads the game's files before it starts the game and shows how much, how far and how long still; the game
then finds them in the browser's cache. The build lists them (`web/scripts/downloads.mjs` → `dist/downloads.json`):
the game's code, its workers and every asset its code references (`import x from '../assets/f.bin?url'`,
`new URL('../assets/f.bin', import.meta.url)`). The game page shows the total. Files the game loads only later,
while playing (music, the rest of a large world), go in `game.json` as `"lazyAssets": ["assets/music/**"]` (globs in
the game's folder): Play does not wait for them. Built assets are named by their content, so browsers keep them.

## Workers, shared memory and what a page may load

The site's pages are cross-origin isolated (`Cross-Origin-Opener-Policy: same-origin`,
`Cross-Origin-Embedder-Policy: require-corp`, from the server and from Vite). So a game may run its parts in
workers that share memory and wait on each other (`SharedArrayBuffer`, `Atomics.wait` in a worker), where the
original's threads block on each other; check `crossOriginIsolated` and show a clear message if it is false.
In return a game loads nothing from other sites: every script, image, sound and font comes from its own folder.

## Running it

```sh
server/run.sh                               # the server on :8790 (builds the jar on first run)
cd web && npm install && npx vite           # the site with hot reload on :5290 (proxies /ws to the server)
npm test                                     # catalog + SDK tests + every games/*/test/*.test.ts
npm run build && npm run test:e2e           # the built site in headless Chromium against the real server
```

`?transport=ws` forces WebSocket; `?server=ws://host:port/ws` picks another server, but only on a
development page (localhost) or for the page's own host: the connection carries the account token.
