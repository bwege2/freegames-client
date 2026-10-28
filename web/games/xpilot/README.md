# XPilot NG 4.7.3 in the browser

XPilot NG 4.7.3 (2010), the last release of XPilot, ported 1:1:

* **The X11 client** (`xpilot-ng-x11`, src/client and src/client/x11) runs in the browser, in TypeScript,
  in `src/client/` (one module per C file) on an Xlib-like layer in `src/xlib/`.
* **The server** runs inside the website's own game server as the `xpilot` module (FG-21, FG-22), one
  world per room.

The client is checked against the original: fed the same server stream and keys, it makes the same
X11 drawing calls, frame by frame, as the original client recorded with a recording Xlib (FG-26,
`test/client.test.ts`), and it sends the server exactly what the original sent.

The server module is checked the same way: fed what the original server's clients sent, the world
matches the original server's, tick by tick, and so does every datagram it sends (FG-26 goldens,
`server/src/test/java/net/slop/freegames/games/xpilot/XpilotWorldTest.java`), robots included.

Status: playable online (FG-24). `e2e.mjs` plays a room with three browsers and robots for 60 s on the
real server and checks that every client sees the others exactly where they are, frame by frame.

## Playing online

Press **Play**, then **Internet** on the welcome screen:
* **Create Room** opens a world: pick a map, team play, limited lives and robots.
* Or join one of the listed rooms by clicking its name. Others join and leave while it runs; robots
  fill it as the original's server fills its own.
* **Back** leaves the room. The world ends when its last player leaves.
* If the server stops a world because it falls behind (docs/SERVER.md, the tick watchdog), the client
  hears it as the original heard a server dropping it, and shows the reason.

## Controls

The original's default keys (configurable in the game's MENU > CONFIG, kept in your account):

| Key | Action |
| --- | --- |
| A / S | turn left / right |
| Shift | thrust |
| Return | fire |
| Space | shield |
| Tab | drop a mine |
| \\ ' ; / | fire a missile, torpedo, heat-seeker, laser |
| Up / Down, Page Up / Page Down, Right | lock on the closest / next / previous player |
| F (or Ctrl) | refuel, repair, connect to a ball |
| D | drop the ball |
| Delete or Backspace | cloak |
| [ | ECM |
| T, O, Q, P | transporter, deflector, hyperjump, phasing |
| , and . | tractor and pressor beam |
| J, Caps Lock | emergency thrust, emergency shield |
| N C I V X Z B | weapon modifiers (nuclear, cluster, implosion, velocity, mini, spread, power); K clears them, 1–4 load sets |
| H | autopilot; Home: change home base |
| E W R | next / previous / detach fuel tank |
| Numpad * / + − | power and turn speed |
| M | talk |
| Pause | pause |
| End | self-destruct |
| U | show player ids |
| Mouse | steering (pointer control), with the mouse captured |

## Deviations the browser forces

* **Servers are rooms.**
  * "Internet" lists the rooms of this site's game server instead of the meta server's servers, and
    has an added **Create room** page (map, team play, limited lives, robots).
  * "Local" finds no servers: browsers cannot broadcast on the LAN. Pinging servers does nothing.
* **The room's host is the operator** of its server: only the host may use the operator commands
  (`/set`, `/kick`, `/pause`, `/reset`, `/lock`, `/mute`, `/op`, `/shutdown`, …), and the status passes to
  the next host when the host leaves. `/password` gives no operator status (it answers "Wrong."), and
  `/op`'s `o` flag changes nobody's. `/shutdown` ends the room's game after its delay.
* **Ranks** (the server's rank file, rank.c) go to the site's "ranks" score table: one record per
  player, the latest, written by the server only when the original would write its rank file or save a
  leaving player. A player who comes back to a new room's world gets that record back, as the original
  server read its rank file (matched by account, not by nick).
* **Robots** are lib/robots.txt's (the robot file cannot be chosen), so a room has no suibots.
* **Teamcup** keeps its score file in the world's memory (no file, no mail), and missing teamcup names
  give warnings instead of stopping the server.
* **Three crashes of the original** do not happen: inviting a player into an alliance after the one
  invited before has left, capture-the-flag on a polygon map, and a robot aiming at a player who is
  gone. The world goes on as if the missing player or treasure were not there.
* **Pointer control** uses the browser's Pointer Lock.
  * Esc leaves it by sending the client's exit key.
  * Key auto-repeat is off, as in the original.
* **No recording** (the original's `-recordFile`).
* **No old-protocol servers:** the client speaks protocol 4.F.1.5 only, so maps reach it as polygons.
* **No map textures from `data_url`**; the textures in `lib/textures` are built in.
* **Talk macros:** `#f` (insert a file) is unavailable and `#h` is empty.
* **Pasting:** text from other programs cannot be pasted; the client's own cut and paste works.
* **Files:** the client rank file is JSON in account storage, and so are the client options (xpilotrc).
* **Display:**
  * The fonts are the X.org misc-fixed bitmap fonts with the metrics the oracle used.
  * There is no window manager: the client's windows open inside the game area.
* **Sound** plays the original's samples (`lib/sound`) through Web Audio, when the server sends audio.

## Option limits

Every room's world runs on the site's one server, in the one game loop that all rooms of all games
share. So a room's options cannot make a world's frame as expensive as the original allows: the
server runs at most 6 worlds at once, and 6 worlds with the worst options a room may set must fit
in one frame (20 ms; `XpilotBudgetTest`). The original's own limits stay as they are: at most 99 of
each item per player (`rules.c`), the ship's power and turn speed, `gameSpeed` at most
`framesPerSecond`, `cannonSmartness` 0 to 3, at most 16 detached fuel tanks flying around.

| What | Limit in a room | The original | Why |
| --- | --- | --- | --- |
| objects in the world (shots, sparks, debris, mines, missiles, items, asteroids, nukes) | 4096 | 16384 (`MAX_TOTAL_SHOTS`) | the work of a frame grows with its objects. When the pool is full, no new object is made, as in the original when its pool is full: a big nuke makes fewer debris. This bounds every option that makes objects: `maxPlayerShots`, `shotLife`, `fireRepeatRate`, `mineLife`, `missileLife`, `nukeDebrisLife`, `pulseLife`, the item options and the rest. |
| `framesPerSecond` | 1 to 50 | 1 to 255 | a world's work per second is its frame's work times this |
| `gameSpeed` | at most 50 | at most `framesPerSecond` | the original's limit |
| `maxRobots`, `minRobots` | at most 8 | one per base | every robot thinks every game tick; 16 seats and 8 robots are the 24 ships of the budget. A map that asks for more (polyfishtank3.xp2: 28), and `-1` (one per base), get 8. |
| `maxVisibleObject` | at most 1000 (the default) | no limit | each seat's frame goes through this many objects |
| `cellGetObjectsThreshold` | at most 500 (the default) | no limit | above it, mines, balls, asteroids, cannons, ECMs and frames go through every object instead of those around them |
| `maxAsteroidDensity` | at most 0.0025 | no limit | every asteroid checks the objects around it every frame: at most 100 asteroids on the largest map (ndh.xp2, 200 × 200 blocks) |
| `mineShotDetonateDistance` | 0 (off, the default) | no limit | with a distance, every mine checks the objects around it every frame, and mines are bounded only by the pool |
| `mapWidth`, `mapHeight` | not settable | 1100 to 31500 pixels | the map decides its size: at most 7000 × 7000 pixels (ndh.xp2) |

A room whose options go beyond a limit cannot be created, and `/set` beyond one answers "Invalid
value."; a limit a map's own options go beyond is held at the limit.

## Files

* `src/client/*.ts`: the client, one module per C file of src/client and src/client/x11.
* `src/xlib/`:
  * `xlib.ts` and `raster.ts`: a `Display` with the recording Xlib's resource ids, events and log
    format, and a software rasterizer (Bresenham thin lines, polygon wide lines, fills by pixel
    centres, the 16 GC functions, tiles, stipples, clip masks).
  * `fonts.ts` and `keysyms.ts`.
* `src/xpilot.ts`: the browser entry (`start`).
* `assets/`: lib/textures, lib/sound and shipshapes.txt, unchanged.
* `test/`:
  * `client.test.ts`: the draw logs and the client's messages against the goldens; `XPILOT_DEEP=1`
    also rasterizes every call.
  * `paths.test.ts`: screens no scenario reaches.

Licence and credits: `LICENSE.md` (FG-24); XPilot is GPL-2.0-or-later.
