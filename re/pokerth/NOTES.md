# PokerTH 1.1.2: notes for the port

* `fetch.sh` clones the reference (tag `v1.1.2`, commit `2ca2e941…`) into `orig/`; `LICENSE.md` is the license
  check; `tools/assets.sh` copies the data the port uses, unchanged.
* `oracle/`: `build.sh` compiles the original engine sources (`src/engine/game.cpp`, `local_engine/*`) with the
  shims in `oracle/shim/` (the engine's half of `GuiInterface`, a no-op `Log`, `ConfigFile` returning 0 for
  every int, a cut-down `PlayerData`) and `oracle/tools.cpp` (xorshift32 instead of `boost::random_device`).
  `main.cpp` drives the engine as `gametableimpl.cpp` does (every QTimer becomes a queued task, in the same
  order; see the comments there) with a scripted human at seat 0; `golden.sh` writes the transcripts the
  port's tests compare (`web/games/pokerth/test/golden/`).

## What the source says

* **Which computer engine.** `LocalPlayer::action()` calls `preflopEngine3()` etc. only if
  `readConfigInt("EngineVersion")` is non-zero. 1.1.2's `configfile.cpp` has no such entry, and
  `readConfigInt` of an unknown name parses an empty string: 0. So the first engines are the ones played;
  the `...Engine3` functions are dead code.
* **Random numbers.** `Tools::GetRand` and the deck shuffle use `boost::random_device` (`tools.cpp`), so the
  original is not reproducible; the port and the oracle share one seeded stream. The order of the draws is
  the original's: per player at construction `myDude` (3..5) and four draws for `myDude4`; per hand the
  shuffle, then `sBluff` (1..100) for every active player but seat 0; per computer decision `cBluff`, and on
  the flop/turn/river `pBluff` and a 1..8 draw in some branches. The start dealer is `GetRand(0, n-1)`
  (`startwindowimpl.cpp`).
* **Quirks kept.** `cardsValue`'s flush value weighs the fourth card with 10, not 100; `calcMyOdds` on the turn
  loops `i < 49, j < 50, k < 51` and skips only the hole cards and the first three board cards;
  `FlopValues` has three hand codes twice (the first counts); `flopCardsValue` can read an uninitialised
  array element in two straight-draw branches (the port reads 0; no oracle game reaches a difference).
* **Time-outs (network).** `ServerGameStateWaitPlayerAction::TimerTimeout`: a player who did not act checks if
  his set equals the highest set, else folds.

## The layout

The game table's widgets are in layouts in `gametable.ui`; their real places at the minimum window size
(1024x600) were read from the running original (nixpkgs `pokerth-client` 1.1.2 under Xvfb with
`QT_USE_NATIVE_WINDOWS=1`, every widget a native window, `xwininfo -root -tree`), matched to the widgets by
their sizes and the children's geometry in the `.ui` file:

| What | Place (x, y, w, h) |
| --- | --- |
| player boxes 0..9 | (416,267) (209,267) (2,232) (2,56) (209,21) (416,21) (623,21) (832,56) (832,232) (623,267), 190x142 |
| board card holders | x = 389 + 55 i, y 175, 54x82; cards 392 + 55 i, 178, 48x76 |
| Pot / Total / Bets | (212,176,144,39) / (212,215) (289,215) / (212,236) (289,236) |
| round / Game / Hand | (670,176,142,39) / (670,215) (743,215) / (670,236) (743,236) |
| bet field, All-In, slider | (428,418,73,22), (501,417,95,25), (428,443,168,15) |
| Raise, Call, Fold | (428,459), (428,503), (428,547), 168x43 |
| left tool box (Hands) | (2,409,260,188), pane (8,435,248,156) |
| right tool box (Log, Away) | (762,388,260,188), pane (768,437,248,132); Speed, slider, Stop at y 573 |

The table picture is drawn unscaled, bottom centre (`setTableBackground`: `background-position: bottom
center; no-repeat`). Font sizes are the Linux branch of `GameTableStyleReader` (cash and bets 10 px, names 11,
board 13 and 17, buttons 12).
