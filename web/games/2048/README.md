# 2048 (port)

Gabriele Cirulli's 2048 (2014), ported from its HTML, CSS and JavaScript (`re/2048/`): the original's
`js/game_manager.js`, `js/grid.js`, `js/tile.js`, `js/html_actuator.js` and
`js/keyboard_input_manager.js` translated to TypeScript, with the original's `style/main.css` and its
Clear Sans fonts. The rules, the 90 % / 10 % chance of a 2 or a 4, the order of the moves and the
random positions are the original's, checked step by step against the original's own code
(`re/2048/oracle/oracle.mjs` → `test/golden/`).

## Controls

* **Arrow keys**, **W A S D** or **H J K L**: move up, right, down, left. A key with a modifier held
  does nothing, as in the original.
* **R**: a new game (as in the original, also after a game over or a win).
* **New Game** (below the title): a new game.
* **Swipe** on the board (touch screens): move; more than 10 pixels, the longer axis decides.
* **Keep going** after the 2048 tile lets you play on for a higher score; **Try again** after game
  over starts a new game.

## Deviations the browser forces

* **Best score and running game**: the original kept `bestScore` and `gameState` in the browser's
  `localStorage`, `gameState` as the same JSON. They are files of the player's account on the server,
  under the same names and in the same formats, so the game continues in another browser or after
  clearing this one. A write reaches the server asynchronously.
* **The page fits the player window**: the original's page is a 500 px column with a 500 px board
  (280 px and smaller type below a 520 px wide window) and scrolls if the window is short. The player
  window has no scrolling, so the same column is scaled to fit it, and its page margins are smaller.
* **The note about the original site is left out**: the paragraph beginning "Note: This site is the
  official version of 2048" describes gabrielecirulli.github.io, not this page. The rest of the
  page's text, including the credits, is here.
* **Fonts**: the original's Clear Sans WOFF files (Apache-2.0) are served from the game's own folder,
  not from a font CDN.
* **The favicon and Apple touch icons** of the original page are site chrome and are not part of the
  game.
* **Leaving**: the website's Back button leaves the game at any time (the original had no such
  button); a running game is saved after every move and continues when it is played again.

Online play is not part of 2048: it is a single-player game, as in the original.
