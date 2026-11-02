# Bomberslop

**Bomberslop is 100% made by AI** (Claude): all of its code and every picture. Its base, the rules, and its
sound effects come from **ClanBomber 2** (version 2.2.0, GPL-3.0-or-later; `LICENSE.md`).

Four blobs of slop in a canteen lay jelly bombs that splash scalding soup along their row and column. The splash
bursts crates (which may leave an extra on a plate), sets off other bombs and wipes out the blobs it reaches. Who is
left standing when the soup settles gets a point; five points (by default) win the match.

* Original: ClanBomber 2.2.0, <https://www.nongnu.org/clanbomber/>, project
  <https://savannah.nongnu.org/projects/clanbomber/>, in the Open Source Game Index:
  <https://foss-gameindex.github.io/opensourcegameindex/games/clanbomber/index.html>
* Pictures drawn as code with pxl: <https://github.com/augusto-scarvalho/claude-pxl> (`art/`)

## Controls

| Who | Walk | Bomb |
| --- | --- | --- |
| Player 1 | arrow keys | Enter |
| Player 2 | W A S D | Tab |
| Player 3 | I J K L | Space |
| Player 4 | number pad 8 4 5 6 | number pad 0 |

Alone (against the computer) or online, every one of these keys works. Laying a bomb again while standing still on
one throws it four tiles ahead (with the oven mitt). **P** pauses a local match, **Esc** quits it (the original's
keys); online, **Esc** leaves the room. Menus: arrow keys, Enter, Esc.

## The game

The rules are ClanBomber 2.2.0's, in `src/sim.ts`: a port of the original's classes method by method (`GameObject`,
`Bomber`, `Bomb`, `Explosion`, `Extra_*`, `Disease_*`, `MapTile_*`, `Map`, `MapEntry`, `Bomber_Corpse`, `Corpse_Part`,
`Observer` and the local game loop of `ClanBomber.cpp`), with the original's numbers: a bomber walks 90 px/s
(+40 a sneaker, at most 5), a bomb splashes after 2.5 s, a splash sets off the bombs it reaches 0.1 s later and
lasts 0.5 s, kicked bombs slide at 160 px/s, a round lasts 90 s, then the clock's Observer (here the Ladle) flies from
tile to tile and each tile it lands on vanishes into a hole; walls become floor first, crates burst. The last one
standing gets a point (nobody, if all fall). Bombers walk through each other, slide round corners, fall into holes
(and so do bombs, extras and puddles); ice keeps pushing whatever is on it the way it faces; arrows turn bombs their
way (a bomb coming against one stops for 0.5 s first); traps swallow bombs and shoot them, a second later, at a random
floor tile where they go off at once.

Extras (a burst crate leaves one about half the time, a disease rarely: the original's `MapTile::spawn_extra`), with
their names here:

| Here | In ClanBomber | What it does |
| --- | --- | --- |
| Jelly bomb | Bomb | one bomb more (at most 9) |
| Chili | Power | the splash reaches a tile further (at most 12) |
| Sneaker | Skateboard | 40 px/s faster |
| Spring | Kick | walk into a bomb to kick it |
| Oven mitt | Glove | throw your bomb |
| Swirl mushroom | Joint | 10 s of reversed keys |
| Hiccup beans | Viagra | 10 s of laying a bomb wherever you can |
| Jitter soda | Koks | 10 s of 600 px/s more speed |

The last three are diseases: they cannot burn (a splash sends them flying elsewhere), they pass to every blob that
touches the sick one, and picking up any extra cures you (the disease flies off to a random tile). A blob that dies
drops every extra it had collected (they fly to random tiles) and leaves a puddle of slop, which wobbles, splashes
when walked through and bursts into drops when a splash hits it.

**Online**: two to four players in a room of this website (the lobby: create a room, the others join and get ready,
the host starts). Every browser plays the same match from the round's seed in deterministic lockstep: the game runs
in turns of four frames (1/16 s); each browser sends its player's keys for each turn to everyone, two turns ahead
(125 ms), and plays a turn once it has every player's keys for it, in the server's order. Every 16th turn carries a
hash of the sender's game; the server compares them and stops the round if two games ever differ. A player who
leaves is out of the match from the turn after their last; with one player left, that player wins. A browser that
drops out or reloads the page gets every turn so far and replays the match (the lobby offers the running match as
"your game"). The room's host chooses the points to win, the round time, the map order and the first map.

## Deviations from ClanBomber 2.2.0

* **Pictures, all new.** Blobs of slop instead of bombermen, jelly puddings on saucers instead of bombs, soup
  splashes instead of fire, canteen, fridge and cellar tiles, extras served on plates (red-rimmed plates for the
  diseases), the Ladle instead of the Observer, our own letters and title. Renamed on screen: the extras (table
  above), the Observer (the Ladle), the corpses (puddles of slop and their drops). The code keeps the original's names.
* **Screen**: 320 x 240 pixels with tiles of 16 px (the original: 800 x 600, tiles of 40 px). The rules keep the
  original's units (40 to a tile); the drawing scales positions by 0.4. A HUD of the map's name, the clock and every
  player's points above the arena (the original shows the map name, the clock and its logo).
* **Maps, all new**: six of our own (Canteen, Conveyor, Drain, Fridge, Grease Trap, Pantry) in the original's map
  format and order (by name), using every kind of tile; none of the original's 33 maps, no map editor, no way to
  switch single maps off. Three looks (canteen, fridge, cellar) by map, not the original's theme setting.
* **Frames of exactly 1/64 s.** The original measures each frame's real duration (`Timer::time_elapsed`), so its
  results depend on the frame rate; the port runs fixed frames (64 a second, the rules unchanged), which makes
  online lockstep possible. 1/64 is exact in a float, so the port computes what the original computes at that rate
  (checked by the oracle, below).
* **Random numbers**: glibc's `rand()` (as the original gets it on Linux), seeded from the match (local: the clock;
  online: the round's seed); the original seeds it with the time. The original also draws `rand()` while drawing (the
  shaking arena after a splash, `Map::show`), which shifts its game's random numbers by how often it draws; the port
  draws the shake with the browser's own random numbers and the game's numbers stay the game's.
* **The score board** between rounds shows for 4 s (Enter or Space skips it in a local match) instead of waiting for
  Space (online every browser must play the same frames). At the end of a match the applause (klatsch) plays and Enter
  goes back to the menu.
* **Menus, our own**: Local game (players at the keyboard 1-4, computer players, points to win 1-10, round time
  30-300 s, maps in turn or at random, the first map), Online game, Controls and extras, About, Quit. The original's
  other settings keep their defaults: start extras and maxima, which extras exist, bomb timing, kids mode, ten corpse
  parts, shaky explosions, random start positions, the tile highlight under a bomber (not drawn).
* **Up to four players** (the original: eight), keyboard only (the original also takes joysticks and its "RC mouse");
  **no teams** (the original has four).
* **Computer players, our own** (`src/ai.ts`): they run from coming splashes, lay bombs by crates and players when a
  way out remains, collect the good extras and now and then throw with the mitt. They are not the original's
  `Controller_AI`/`Controller_AI_mass`; they draw from their own random numbers, not the game's.
* **Online play**: website rooms and deterministic lockstep (above) instead of the original's own TCP/UDP server and
  client, 2-4 players; a player who leaves is out from the next turn (the original deletes a disconnected bomber at the
  end of the round); keys go in turns of 1/16 s with 125 ms of delay; no chat, no pause online.
* **Not here**: the intro, the credits, the chat, the FPS display (F1), the full-screen key (F11: the browser's own),
  the tutorial screen, the `Disease_Frozen` that only the original's network game creates, the sounds of the intro and
  the credits (typewriter, winlevel, forward, rewind, stop, menu_back).
* **Single player**: Space lays a bomb too (all keymaps work for the one player).
* Kept on purpose, as the original does: the `std::list` quirks of `ClanBomberApplication::delete_some` (an object
  after a deleted one waits a frame; at the end of the list the loop goes round again), the order of the arguments GCC
  evaluates (`Bomber_Corpse::explode`), bombers walking through each other, the hurry-up between 21 and 18 s.

## Not finished

* No gamepad or touch controls: the game needs a keyboard (phones and tablets cannot play).
* No teams, at most four players, no map editor.
* Coming back to an online match (a dropped connection or a reload) is checked by the server's loopback tests and by
  `test/online.test.ts` against a stand-in server, not yet by the browser end-to-end test.
* Online, every browser must keep playing: a tab in the background (which browsers stop drawing) holds the match for
  everyone until it comes back or the server gives its seat up (the others then play on without it).

## Privacy

* A local match sends nothing about the game anywhere; Play opens the website's anonymous connection that counts the
  players of each game (`web/src/site/player.ts`). Bomberslop stores no files and no score tables.
* Online, the server keeps in memory, for the running round only: each player's keys of every turn (one byte per
  1/16 s), the hashes of the last 1024 turns and each browser's report of the match's end. Nothing is written to disk;
  it is gone when the round ends.
* The other players of the room get your name in the lobby (as you typed it), your seat, your keys of every turn, and
  every 16th turn a hash of your game. Your report of the end goes only to the server.

## Tests

```sh
cd web && node --test games/bomberslop/test/*.test.ts     # the rules against the original, the match, online lockstep
npm run build && node games/bomberslop/e2e.mjs             # the built site on the real server, two browsers online
JAVA_HOME=... mvn -B -f pom.xml test -Dtest=BomberslopModuleTest -pl server -am   # the server module, loopback
```

* `test/oracle.test.ts`: the rules against **the original's own code**. `re/bomberslop/oracle/build.sh` compiles
  ClanBomber 2.2.0's rule files unchanged (with stand-ins for sound, pictures, settings, timing and the network,
  `re/bomberslop/oracle/stub/`) into an oracle that plays scenarios (`test/scenarios/`: what keys each player holds
  when, mostly played by our computer players, `test/make-scenarios.ts`) and writes every 4th frame's state hash, a
  full state every 256 frames, every sound and every round (`test/golden/`). The port plays the same scenarios; all 14
  are equal, frame by frame: movement, kicks, throws, chains, every extra and disease, ice, arrows, traps, holes, the
  Ladle, puddles and drops, rounds and the end of matches.
* `test/match.test.ts`: determinism, the score board, the maps. `test/online.test.ts`: lockstep with two to four
  clients, leaving, coming back, the end report.
* `server/src/test/java/net/slop/freegames/games/bomberslop/BomberslopModuleTest.java`: options, the order and pace
  of turns, hashes of three browsers and a desync, leaving (four players), coming back, the end and a disagreement.

## Building the pictures

```sh
bash web/games/bomberslop/art/build.sh    # art/bomberslop.px.js -> assets/sprites.png + assets/sprites.json
```

It downloads pxl at the commit the art was made with (MIT; into a cache folder, not into this repository).
