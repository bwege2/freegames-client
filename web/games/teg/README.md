# Tenés Empanadas Graciela (port)

The browser port of **TEG 0.13.0**, Ricardo Quesada's GTK client/server Risk-like game. It uses the
original's default theme (`m2`), its 50 countries and adjacency matrix, its dice, cards, missions,
robot and scoring. The rules engine (`src/rules/`) is a translation of the original's
`server/play.cpp`, `helper.cpp`, `turno.cpp`, `missions.cpp`, `countries.cpp`, `player.cpp` and the
client's state machine; the robot (`src/rules/ai.ts`) is a translation of `robot/ai.cpp` and
`robot/ai_fichas.cpp`. `re/teg/NOTES.md` maps the files and functions.

* Reference: `https://github.com/wfx/teg` tag `0.13.0` (15 September 2024, commit
  `41b51cb5ea6655f68ee12ec0518757870f35b672`), downloaded and pinned by `re/teg/fetch.sh`.
* License: the original is GPL-2.0-only; this port is GPL-2.0-only. See `LICENSE.md` (the website
  has an additional permission for GPL-2.0-only game ports).
* The program's map is the world map of TEG 0.13.0, not the Argentina board of the tabletop TEG:
  the software has always shipped a Risk-like world map with 50 countries.

## Controls

The mouse does everything, as in the original:

* **Place** (first 5 armies, then 3, and the reinforcement armies at the start of every round): click
  one of your countries to add an army, right-click or the mouse wheel to take one back. **Send
  armies** commits the whole placement. A complete continent's bonus armies must be placed in that
  continent; the line above the board lists the bonuses.
* **Attack**: click one of your countries with at least 2 armies, then a neighbouring enemy country.
  Each click is one roll; the dice and the losses are shown on the board and in the log.
* **After a conquest**: choose how many more armies to move (the server/the game already moved 1).
* **Regroup**: click your country, then a neighbouring country of yours, then choose the armies.
  You cannot move the same armies twice in one turn, and after regrouping you cannot attack again
  until your next turn (the original's state machine does the same).
* **Get card**: after conquering at least one country (two after your fourth card exchange) take a
  country card. A card whose country you own can put 2 armies on it once; the cards also trade for
  armies in the placement phase (3 of a kind, one of each kind, or any set with a joker).
* **End turn** passes the attack phase.
* **View → Mission / Cards / Players** shows the secret mission card, your cards, and the table of
  players. **Game → Scores** shows the shared high scores.
* **Esc** cancels a selection or closes a dialog. **Enter** sends armies (or ends the turn).
  **R** regroup, **C** get card, **E** end turn, **M** mission, **P** players, **K** cards.

Menus: **Game** (new game, play online, scores, quit), **Actions** (send armies, regroup, get card,
end turn, surrender), **View** (players, mission, cards, zoom), **Settings** (new game rules, full
screen), **Help** (controls, about).

## Modes

* **Against the robot**: one human and one to five of the original's robots. The robot uses the same
  placement, attack, regroup and card strategies as `tegrobot` (it picks the same target under the
  same state; the tests run robot-only games).
* **Hot seat**: two to six humans on one computer. There is no hidden information between them on
  this screen, so use secret missions only if the players look away.
* **Online**: the website's shared lobby, two to six seats, one player each. The server module
  (`server/src/main/java/net/slop/freegames/games/teg/TegModule.java`) runs the game and sends each
  seat a snapshot after every action; it rolls the dice, deals the cards, decides the turn order and
  the winner. The clients only send intents (`protocol/games/teg.capnp`). The host's rules
  (secret/common mission, fog) are chosen when opening the lobby. A player who leaves is out; a
  round whose current seat stays connected but does nothing for 10 minutes ends without a winner.

## Deviations the browser forces

* **The local game is started in the page**, not by launching a server and connecting GTK clients:
  the setup dialog chooses the players, their names and colours and the rules. The original's server
  options (`--seed`, `set` console commands) are not exposed; a local game uses a random seed from
  the browser. The online room takes its seed from the server.
* **The robot runs in the page** (the original forked `tegrobot` and talked to it through a socket).
  It uses the original's strategy; its table talk is not sent (the original's robot sometimes chatted
  on a timeout). Its per-action pause is 0.36 s so a human can follow.
* **The robot's cards**: when the robot draws a card it uses the 2 armies of every card whose country it owns. The original's robot sends its end-turn before the card answer arrives and therefore usually misses that bonus; the port keeps the intended use.
* **Colours and names**: the original let every client choose a colour; online a seat gets the next
  colour in order (red, yellow, blue, black, pink, green). Names come from the lobby.
* **Online play and hot seat are new**: the original was a networked client/server game with no
  hot-seat mode; the browser adds both. The online module cannot be identical to the original's
  network protocol (it uses the website's rooms and schema), but the rules and the robot are the
  original's.
* **Fog of war** is implemented (countries not owned or next to an owned country show `?`); online
  the module sends each seat its own masked snapshot and keeps opponents' cards and missions private.
* **Scores**: the original's `~/.teg/server_scores.xml` becomes the website's shared `scores` table;
  an offline game submits the human players' scores, an online round is recorded by its module. The
  original's high-score file also listed robots; the port does not put a robot's score under a human's
  account. The original's game-end winner bonus (350/round) is not in the final tables because the
  original's own `scores_insert_player()` recomputes the score and drops it (the port follows that).
* **Texts** are English. The original's gettext catalogues (Spanish, German, French, Polish, Italian,
  Portuguese, Galician, Hungarian) are not included; the English strings and the original's
  punctuation are used.
* **Full screen** is the browser's full screen of the game area, not a new GTK window. The map scales
  to the window; **View → Zoom** and **Fit map** replace the original's canvas zoom.
* **The original's `draco`, `sentimental`, `m3`, `teg_classic` and `modern` themes** are not included;
  the port uses the default `m2` theme (the one the original installs and uses by default). The
  original's menu bar, toolbar and GTK dialogs are recreated as DOM; the board, countries, cards,
  dice and colours are the theme's own files.
* **Chat** is a line in the online room; the original had a chat area in its main window. The local
  game's log shows the same messages (the original's `*`/`rem` help lines are not).
* A dropped online connection comes back through the website's reconnect; the module sends the
  current snapshot again. The original's "reconnect" protocol is not used (the website's room takes
  care of the seat).

## Tests

`web/games/teg/test/engine.test.ts` (run by `npm test`) checks the port against the reference C++
server:

* glibc's `rand()` values (the original's generator);
* the country deal and the first player for 7 seeds and 2–6 players;
* the secret missions assigned by the original server for two seeds and four player counts;
* a run of attacks: the original's dice and the resulting country owners/armies after every attack,
  and a card drawn after a conquest (the card and the other seat's view of it);
* card exchange values and combinations, mission checks (including the 30-country common mission),
  reinforcement counts;
* a whole robot game (all seats robots) ending with the invariants intact.

The golden file `test/golden/oracle.json` is generated by `re/teg/oracle/transcripts.py`, which drives
the reference `tegserver` built by `re/teg/oracle/build.sh` (needs the original source from
`re/teg/fetch.sh` and a C++20 compiler). It is committed so `npm test` does not need the C++ build.

Server module tests: `server/src/test/java/net/slop/freegames/games/teg/TegModuleTest.java` (loopback
clients: initial state, turn order, out-of-turn refusals, server dice and card privacy, fog, leaving,
timeout, options).

Build/check:

```sh
cd web && npm install && npx tsc --noEmit && npm run build && npm test
JAVA_HOME=… mvn -B -f ../pom.xml test
```

Screenshots: `node web/scripts/screenshots.mjs teg` (built site and server jar).

## Folder

* `src/rules/` — data (countries, adjacency, continents, cards, missions, colours), glibc RNG, the
  rules engine, the robot. No DOM, so the tests run it in node.
* `src/ui/` — the board, the theme loader and the browser UI.
* `src/proto/teg.ts` — generated from `protocol/games/teg.capnp`.
* `assets/theme/` — the `m2` theme's files and `theme.json` (positions, copied by `re/teg/fetch.sh`).
* `assets/pix/` — the original's empanada logo, colour swatches, army discs and mission card.
* `screenshots/` — screenshots of this port.
