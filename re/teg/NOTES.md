# TEG 0.13.0: reverse engineering and port notes

Reference: **Tenés Empanadas Graciela 0.13.0**, tag `0.13.0` (commit
`41b51cb5ea6655f68ee12ec0518757870f35b672`, 15 September 2024), downloaded by `fetch.sh` as
`https://github.com/wfx/teg/archive/refs/tags/0.13.0.tar.gz`, SHA-256
`d643e0b1b4ebe4baaceb398435517c57a67d7aaaa25dc49880d5f50750b089fc` (12,832,517 bytes). It is the
latest release of the original GTK client/server game. `build.sh` builds the reference `tegserver`
and `tegrobot` from it for the oracle; `transcripts.py` drives the server and writes
`web/games/teg/test/golden/oracle.json`. The original source and binaries stay in `orig/` (ignored).

## The licence, first

`COPYING` is GPL version 2; 121 source files say “only version 2 of the License”; 13 newer helper/test
files are `GPL-2.0-or-later`; Debian's `debian/copyright` for `teg 0.13.0-1` says the same. The
package's `README.md` claims “GPL v3” and names a `LICENSE` file that is not in the package; every
header and `COPYING` contradict it, and GitHub's licence metadata is GPL-2.0. **The reference is
GPL-2.0-only.** The website has an additional permission under GPL-3.0 section 7 for game ports under
GPL-2.0-only (the same used by Frozen Bubble), so the port is GPL-2.0-only and the combination is
allowed. No file used by the port is NC, ND or proprietary; every picture and text is in the
GPL-2.0-only package (see `web/games/teg/LICENSE.md`). The ticket expected GPL-2.0-or-later; the
“or later” does not exist in the reference's headers, so the port deliberately follows the actual
GPL-2.0-only terms.

The ticket says “Argentina map”. The program's map is a **world map** with 50 countries (South
America 6, North America 10, Africa 6, Oceania 4, Europe 9, Asia 15); the Argentina board belongs to
the tabletop TEG, not to TEG 0.13.0. The port uses the program's map, as the 1:1 rule requires.

## What the port takes from where

| Port | Original |
| --- | --- |
| `src/rules/data.ts` countries, names, card kinds | `common/country.cpp` `g_countries[]` |
| continents, sizes, bonuses | `common/cont.cpp` `g_conts[]` |
| 50×50 adjacency | `common/limitrof.h` `mat_ady[][]`, read as `countries_eslimitrofe()` (`common/country.cpp`) |
| missions | `common/missions.cpp` `g_missions[]` (built without `WITH_ALL_MISSIONS`) |
| colours, player names | `common/common.cpp` `g_colores[]`; `robot/ai_msg.cpp` `names[]` |
| card kinds/values, exchange rules | `common/tarjeta.h`, `common/tarjeta.cpp` (`TARJ_GALEON` 1, `TARJ_CANION` 4, `TARJ_GLOBO` 8, `TARJ_COMODIN` 16) |
| glibc `rand()` | `common/common.h` `random_between()`, `srand(g_game.seed)` in `server/main.cpp` |
| country deal | `server/countries.cpp` `countries_repartir()` |
| first player, turn order, round | `server/turno.cpp` `turno_init()`, `turno_next()`, `turno_is_round_complete()`, `turno_initialize_new_round()` |
| initial placements 5/3, reinforcement | `server/helper.cpp` `fichas_next()`, `fichas2_next()`, `fichasc_next()`, `aux_token_fichasc()`; `server/player.cpp` `player_fichasc_cant()` |
| placement validation, continent bonuses | `server/helper.cpp` `aux_token_fichas()` |
| attack dice/losses | `server/helper.cpp` `aux_token_attack()` (`ins_orden` sorts descending; ties lose for the attacker) |
| attack, conquest, troops, cards | `server/play.cpp` `token_attack()`, `token_tropas()`, `token_card()`, `token_ejer2()` |
| card exchange | `server/play.cpp` `token_canje()`, `common/common.cpp` `cards_for_this_exchange()` |
| regroup | `server/play.cpp` `token_regroup()`; `client/reagrupe.cpp` |
| mission check/assignment | `server/missions.cpp` `mission_chequear()`, `mission_asignar()` |
| surrender, elimination, win | `server/play.cpp` `token_surrender()`, `server/player.cpp` `player_poner_perdio()`; `server/main.cpp` `game_end()` |
| scores | `common/stats.cpp` `stats_score()`, `server/xmlscores.cpp` |
| robot placement | `robot/ai_fichas.cpp` `ai_fichas()`, `ai_fichasc()`, `ai_fichas_calc_puntaje_*()` |
| robot attacks, regroup, troops, exchange | `robot/ai.cpp` `ai_turno()`, `ai_reagrupe()`, `__ai_reagrupe()`, `ai_tropas()`, `ai_puedocanje()` |
| board positions, army circle centres | `client/gui-gnome/g_country.cpp` `G_country_init()`, `G_country_draw_ejer()`; `client/themes/m2/teg_theme.xml` |
| dice placement | `client/gui-gnome/dices.cpp` (`dices_ext_pos`); m2's `<dices_ext_pos>` |
| card filenames and labels | `client/gui-gnome/cards.cpp`; theme `<cards>` |
| mission card | `client/gui-gnome/mission.cpp` (`objetivo.png`, Helvetica 12 brown at (4,10)) |
| status line | `client/gui-gnome/status.cpp` (infobar, player discs, round starter, round number) |
| menus/toolbar/controls | `client/gui-gnome/interface.cpp` |

The original's program is a client/server game: the server owns the state and sends tokens
(`fichas`, `ataque`, `dados`, `pais`, `tarjeta`, `canje`, `reagrupe`, `turno`, …); the client is a
state machine with `PLAYER_STATUS_*`. The port has one pure state machine (`TegGame`) for a local
game and a translation of the same rules in the server module for online play. The original's text
protocol is not used; the online schema is `protocol/games/teg.capnp`.

## Details that were checked against the original

* **RNG and start.** `srand(seed)` and the glibc TYPE_3 generator; `random_between(min,max)` is
  `min + (1+max-min) * rand()/(RAND_MAX+1)`, truncated. `countries_repartir()` deals 48/50 in a
  round-robin and the rest from a random starting player; `turno_init()` picks
  `random_between(0, players-1)`. `test/golden/oracle.json` records the deal and first player for
  seeds 1, 2, 3, 7, 42, 12345 and 2147483647 with 2–6 players; the port matches every country.
* **Initial placement.** 5 armies each, then 3 each; the round starter places first in both rounds.
  Then attacks begin, without a reinforcement placement. In later rounds every player places
  reinforcements in order, starting with the round's new starter, and then attacks in the same order.
  `player_fichasc_cant()` is 3 up to six countries and `countries/2` above; complete continents add
  3/5/3/2/5/7, and their armies must go in that continent. The first exchange adds 4, the second 7,
  the third 10, then `(n-1)*5`.
* **Attack.** The attacker rolls `min(armies-1,3)` dice, the defender `min(armies,3)`, both sorted
  descending, compared pair by pair; a tie is a defender win (the attacker loses an army). On a
  conquest the game moves one army automatically and offers at most 2 more (the original's `tropas`
  message); the server accepts up to `min(src.armies-1,3)`. `oracle.json` has the full dice sequence
  and the countries after each attack of a 27-attack conquest, plus the card drawn afterwards.
* **Cards.** Only after conquering at least one country in the turn (two after the fourth exchange),
  at most 5 cards; a free card is picked with `get_random_country(tarjeta_es_libre)`, and if its
  country is owned it gives 2 armies and is marked used. After the draw the player may use the 2
  armies of any owned, unused card, then end the turn. A joker makes any three-card set valid; three
  equal kinds or one of each also trade. The card's country is not revealed to the other seats in
  the online snapshots.
* **Missions.** `mission_asignar()` picks a random mission, scans forward for a free one and wraps;
  missions 0 (conquer the world) and 1 (30 countries) are reserved. With the common mission enabled,
  a player with a secret mission and at least 30 countries wins the common mission first. The port's
  `oracle.json` missions match the original for seeds 1 and 12345 with 2, 3, 4 and 6 players.
* **Scores.** `countries_won*5 + armies_killed*2 + Σ(continents defended × continent bonus)`. The
  original's `game_end()` adds 350/round to the winner, but `player_insert_scores()` calls
  `stats_score()` and overwrites the score; the port reproduces the table the original actually
  writes (no bonus).
* **Robot.** The ported robot uses the original's scores: `ai_fichas_calc_puntaje_conquer` (10/11/12
  of Asia, 5/7/8 of Europe/North America, 4/5 of South America/Africa, 2/3 of Oceania, plus
  `ple` and `em>ee`), `..._fichas`, `..._defense`, the `-50` for a non-border, the attack warning
  (`-(5+2p)`), the `r=random_between(1,10)` for hopeless attacks, the first-maximum tie break, and
  the regrouping choices. The full-game test plays four robots to a winner for several seeds.

## Assets

`fetch.sh` copies the default `m2` theme (board 640×382, 50 country overlays, four cards, six dice,
infobar) and the client's `teg_pix` (empanada logo, colour swatches, army discs, `objetivo.png`) and
writes `theme.json` from `teg_theme.xml` with the positions and army offsets. Country overlay files
have no extension in the package; their bytes are unchanged and they are stored as `.png`. There are
no sounds, music or fonts in TEG 0.13.0. The map is a hand-painted world map by Wolfgang Morawetz;
the picture's tiny credit line says “Tenés Empanadas Graciela” and the theme XML names him. The
mission card's “TOP SECRET” watermark is part of `objetivo.png`. See `LICENSE.md` for the file groups.

## The online module

The original's server is the only authority: clients send `start`, `fichas`, `ataque`, `tropas`,
`canje`, `reagrupe`, `tarjeta`, `turno`, and the server answers with the dice and the new countries.
The port keeps that split: `protocol/games/teg.capnp` defines intents and a per-seat `State`;
`TegModule` runs `TegGame`, checks every action, and after every accepted action sends the state to
each seat. The state's `event` is the last log line; in fog, private card/mission events are only sent
to the seat they belong to, and events touching hidden countries are omitted. A reconnect gets a
fresh snapshot; the client asks for one after `RoomStarted` (the module cannot send before the core's
`RoomStarted`). The module's timeout (10 min) is new: the original had no clock, but an online room
must not stay stuck on a seat that is still connected and does nothing.

## Reproducing the oracle

```sh
re/teg/fetch.sh
CXX=clang++ re/teg/oracle/build.sh       # any C++20 compiler with glib and libxml2
python3 re/teg/oracle/transcripts.py      # writes web/games/teg/test/golden/oracle.json
node --test web/games/teg/test/engine.test.ts
```

`build.sh` compiles the original from `orig/src` with the same `server/` and `common/` sources that
the original's `Makefile.am` uses; `transcripts.py` starts it with `--console 0 --seed N`, connects
two or more text clients, sends the original's commands and records the responses. It does not use
REA: the reference is source-available (GPL-2.0-only), so the code itself is the specification, and
the server transcripts are the behavioural oracle. Where a rendering detail was not obvious from the
C++ (the army circle centre and the `+`/offset arithmetic), `g_country.cpp` was read line by line and
the theme positions were used; no binary was needed.
