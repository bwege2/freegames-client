# Diamond Trust of London (port)

Jason Rohrer's **Diamond Trust of London** (DS, 2012), from the open-source Nintendo DS source tree
(`re/diamondtrust/`). The board is the original Angola map and unit artwork; the rules follow the
source: eight months, three agents per firm, six producing regions plus London and Antwerp, hidden
salaries and bribes, secret moves and bids, a UN inspector, diamonds carried home, confiscation and
the open market.

## Playing

* **2 players (hot-seat)**: the two players share one device. A pass screen hides the previous
  player's money, salaries, bribes, moves, bids and sale quantity.
* **1 player vs computer**: you play London against a rule-aware AI opponent. It is a browser
  heuristic, not the DS original's hidden-information Monte-Carlo search (see below).
* **Online game**: a two-seat room through this website. The **server is the referee**: it runs the
  rules from the room seed, keeps both seats' hidden money, salaries, bribes, moves and bids, and
  sends each seat only the public board plus its own private view. No client is authoritative.
* **Rules / controls**: the in-game rules screen; the map can be clicked to highlight a region, and
  the panel has the forms and buttons.

Each month: diamonds accumulate; pay salaries to agents at home and bribes to co-located enemy
agents; both sides secretly move agents and specify bids (or inspector bribes); returning agents
deposit their diamonds; the inspector's bribes are compared and the winner moves the inspector;
sales in each region go to the highest unique bid (bids are paid even when lost or blocked); both
sides then choose how many vault diamonds to sell on the 24-money open market. A player who sells
nothing receives the 18-money allowance. After eight months the larger vault wins; equal diamonds
are decided by money.

## Differences from the DS original

* The port uses a browser board/panel layout instead of the DS's two 256×192 screens, stylus and
  camera; the map, unit sprites, title art and the original bitmap fonts (`font8`, `font16_jcr`)
  are used on the canvas. The side panel is DOM, so its body text uses a browser font; the forms
  replace the DS touch widgets.
* Unit moves, diamond awards and inspector moves are drawn as short canvas tweens; the pass and
  peek screens remain browser overlays.
* The single-player opponent is a deterministic, rule-aware heuristic (`src/ai.ts`): it keeps its
  money, pays salaries, sends carriers home, bids for regions, uses peeks and moves the inspector.
  The DS original's AI (`ai/ai.cpp`, `ai/gameState.cpp`, about 4,700 lines of hidden-information
  Monte-Carlo search with 200 simulations per candidate and 4 candidates) is not ported line by line.
  The DS camera-photo bluffing is not implemented.
* Music, sounds, the DS help/manual screens and the exact DS frame animations are not included;
  the port uses simple movement/diamond/inspector tweens instead. The original has no replay format.
* The source's exact random inspector start and all rule constants are kept; the port starts the
  inspector from the game seed.
* `assets.ts` applies the original corner-colour transparency (`applyCornerTransparency`) to the map
  names, unit sheets, inspector, diamond, vault and title images, so the white/green source-key
  backgrounds do not cover the board.

## Online protocol

`protocol/games/diamondtrust.capnp` defines the actions and the per-seat state; the server module
`DiamondTrustModule` runs `TrustGame` (a Java port of the rules) and sends `State` messages from seat
255. Actions go to `Target.server`; there is no relay of client state. The server tests cover the
start values, bribe targets, bids, inspector, market, a full eight-month idle game, hidden peeks and
a player leaving.

## Running

```sh
bash re/diamondtrust/fetch.sh
python3 re/diamondtrust/tools/build-assets.py
cd web && npm test
npm run build && node scripts/screenshots.mjs diamondtrust
```

## AI opponent

The computer plays Antwerp. Its priorities follow the original AI's evaluation: vault diamonds are
worth far more than money, field diamonds count only at the end, and bribed agents are useful for
the peek. It pays a small salary to home agents before they leave, sends carriers home, chooses one
producer per agent, outbids a leaked bid when the region is still worth it, and moves the inspector
onto enemy carriers. It does not read the human's hidden choices. The full DS Monte-Carlo search is
the documented gap; a port would need the original's hidden-information state ranges and simulation
loop.
