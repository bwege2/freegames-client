# PokerTH (port)

PokerTH 1.1.2 (2017, the last release of the classic Qt client; `re/pokerth/fetch.sh`) in the browser.

* **The engine**, translated line by line from the C++ source (`src/engine/`): the game and its blinds
  (`game.cpp`: raised every n hands or minutes, doubled or by a manual list), the hand (`localhand.cpp`:
  dealing, buttons, blinds, the all-in rules), the betting rounds (`localbero*.cpp`), the board with the pot,
  side pots and who must show (`localboard.cpp`), the hand values (`cardsvalue.cpp`, with the hand names of the
  log) and the computer opponents (`localplayer.cpp`: the preflop, flop, turn and river engines with their
  odds tables, bluffs and the human player's aggression). 1.1.2 has no `EngineVersion` setting, so the
  original always uses the first engines; the unused `...Engine3` functions are not ported.
* **The game table** (`src/table.ts`): `gametableimpl.cpp` with its animation timers and speeds, the
  original's layout (every widget at its place of the 1024x600 window), the default table style's pictures,
  colours and fonts, the flip and fade animations of the cards, the log, the pre-action buttons, the away
  modes and the sounds with their positions.

**Checked against the original.** `re/pokerth/oracle/` compiles PokerTH 1.1.2's own engine sources (with small
headers in place of the GUI, the SQLite log and the config file) and drives them as the game table does,
with a fixed random stream instead of `boost::random_device`; seat 0 is a scripted human that uses the game
table's own action code. `test/oracle.test.ts` plays the same 16 local games (2 to 10 players, different
cash, blinds and manual blinds, 600 hands in all) with the port and compares the transcripts line by line:
every card, hand value, best five cards, every action and amount of every player, the board, who has to
show, the hand names, the winners and everyone's cash after every hand. It also compares `cardsValue` on
304,000 random seven-card hands.

## Controls

* **Fold, Check/Call, Bet/Raise, All-In**: the buttons, or **F1**, **F2**, **F3**, **F4**. The slider and the
  field above them set the amount; **Return** in the field bets or raises it.
* While the others act, the buttons are **pre-actions**: the checked one is taken when it is your turn.
* **Away** tab: manual (F6), auto check/fold all (F7), auto check/call any (F8).
* **Stop** (or **Shift**) stops after this hand; **Start** goes on, or starts a new game when it is over.
* **Speed**: the game speed, 1 (slow) to 11 (no animations).
* **Ctrl+N** or the menu: a new local game. The start window has **1 Start Local Game** and **2 Internet Game**.

## Online

The original's internet game connects to a PokerTH server that runs the engine. Here the engine runs on every
player's machine in lockstep: the actions go through our server in one order for everyone, and the server's
module deals (`server/.../games/pokerth/PokerthModule.java`, `protocol/games/pokerth.capnp`): it shuffles
with its own random numbers, sends each player its two cards privately and shows board and hole cards only
when every player's engine asks for them. A player who does not act in the time-out checks if he can, else
folds, as on the original server; a player who leaves the room folds or checks from then on.

## Deviations

* The original's settings dialog, logs dialog, LAN games (create/join network game), the internet lobby
  with chat, the avatars, card decks and table styles to choose from, and the **Chance** tab are not ported;
  the port has the default table style and card deck. The start window has no icons on its buttons.
* Settings are kept in the player's server storage as `config.xml` (the original: `~/.pokerth/config.xml`),
  with the entries the port uses.
* The random numbers: the original uses `boost::random_device`; the port a seeded stream (browser random
  numbers locally, the room's seed online).
* Online: no computer opponents ("fill up with computer opponents" of LAN games), no chat, no spectators, no
  kick votes, no rejoin of a running game after a lost connection, no "Show my cards" button. The shown hole
  cards of a showdown reach every client (the original's server sends only the cards that must be shown; the
  others are not displayed here either, but a client could read them).
* The menu bar has only the entries the port needs (new game, back to the start window).
