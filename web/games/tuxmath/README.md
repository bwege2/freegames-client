# Tux, of Math Command (port)

Tux4Kids' **Tux, of Math Command 2.0.3** (2011), ported from its C/SDL source and its data
(`re/tuxmath/`): the original igloos, cities, comets, Tux animations, backgrounds, sounds, music,
font, lesson files and math-card generator are used unchanged. The picture is the original's
640×480 screen, drawn on the SDK's pixel screen.

## Controls

* **0–9**: type the answer (up to three digits).
* **Minus**: negative answer, where the lesson allows negatives.
* **Enter**: fire the laser at every comet carrying that answer.
* **Backspace**: delete the last digit.
* **P**: pause; **Esc**: leave the game (the original's stop button does the same).
* **Arrow keys**, **Enter/Space**, **Esc**: menus and submenus; the mouse works too.
* The website's **Back** leaves the game at any time.

## The game

* **Splash → main menu**: Play Alone, Network Game, Play With Friends, Factoroids, Help,
  More Options, Quit, with the original labels and descriptions.
* **Play Alone → Play Arcade Game**: the five original levels — Space Cadet (addition to 10),
  Scout (addition and subtraction to 20), Ranger (all four operations to 100),
  Ace (all four operations with negatives), Commando (three- and four-number formulas).
  Each level's own lesson file supplies the ranges, operations, formats and list length.
* **The arcade rules** are `game.c`'s: four igloos with two layers each, comets that fall on them,
  a new comet every wave, faster and more numerous comets as the waves go on, scoring
  `25 · difficulty · (480 − y + 1) / 480`, a correct answer zapping every comet with that answer,
  a wrong answer costing a life only indirectly (the comet still lands), and game over when the last
  igloo has melted. Comets carry the lesson's formulas; the answer is typed into the LED display.
* **Question lists** are the original's: the levels with `comprehensive = 1` get the exhaustive
  shuffled list of every valid two-number card (all valid operand pairs, all allowed formats);
  Commando (`comprehensive = 0`, 3–4 numbers) gets random cards from the recursive generator, as the
  original does. A correct answer puts its card back into the list at a random place, so play goes on
  until the igloos are gone.
* **Math cards** (`math.ts`) are `mathcards.c`: the three formats (`a + b = ?`, `? + b = c`,
  `a + ? = c`), the four operations, the per-operation ranges, `MAX_ANSWER` and negative filters,
  difficulty 1–4 (plus 2 for a missing-number format), and the original's multi-number recursion,
  including its `find_divisor()` and its quirks.
* **Hall of Fame**: ten entries per level in the player's account on the server (JSON instead of the
  original's `highscores.txt`), with name entry after a qualifying score.
* **Training Academy**: the original lesson files are listed and played with their own options
  (the first 30, alphabetically). Gold stars and the mission/campaign progression are not saved.
* **Sound and music**: the original WAV effects and the menu track `tuxi.ogg`; the three arcade music
  tracks are chosen at random as the original does. No volume control (the original has none in-game).

## Deviations the browser forces and known gaps

Faithful: the 640×480 layout and HUD, the original art/sounds/music/font, all five arcade lesson
files, the math-card generation (both exhaustive and random paths), comet motion and scoring, igloo
damage and game over, the menu tree and texts, high-score name entry and tables.

Not yet at 1:1, consciously listed:

* **Network Game** and **Play With Friends** are not ported: the original's TCP LAN protocol and its
  local turn-based multiplayer are replaced by a message; the site's own server is not used by this
  game.
* **Fleet Missions** (the campaign with its 30+ scripted missions), **Factoroids**, **Play Custom
  Game** and the demo mode are not ported (the menu entries explain this).
* **Bonus comets, extra lives, power-up comets and the smart bomb** are not implemented; the extra-life
  progress bar is absent. **Penguins and steam** are drawn but not animated with the original's
  walking/ducking/evaporation state machines. City colours (the non-igloo graphics) are not used; the
  original's default igloos are.
* **Training Academy** runs the lessons but does not save gold stars, summaries or the `log.csv`
  progress files. The lesson list is the first 30 rather than all 58 with their groups.
* **Menus** are drawn on the canvas with the original menu background, title and icons and the
  original Andika font, but the original's menu XML layout, animated title, button chrome and
  transition effects are simplified. The Help and Credits screens are summaries, not the original's
  scripted pages/credits scroll.
* **Tux** uses the original frames but a simplified animation state machine (yes/yay/drat/yipe/fist
  with timers), not the full sequence timing of `game.c`.
* **Saved data**: only the high-score table is stored (account scope). The original's `options` file,
  per-user config, game summaries and gold stars are not.
* **Multi-number formulas** reproduce the original's parenthesis-free text: for 3–4 numbers the
  written formula is evaluated left to right, while the stored answer was computed recursively, so
  some Commando cards do not satisfy their printed equation. This is an original bug, kept on purpose
  (see `re/tuxmath/NOTES.md`); the port does not "fix" it.
* **The original C program was not built as an oracle** (SDL/GL development packages and a display are
  unavailable here). The port is checked by the original lesson files and deterministic tests of the
  translated generator and arcade rules; the RE notes cite the source lines.

The original's `COPYING`, `doc/COPYING_GPL3`, `doc/OFL` and `doc/README_DATA_LICENSES` are in the
downloaded archive (not committed); see `re/tuxmath/fetch.sh`.

## Running

```sh
bash re/tuxmath/fetch.sh              # downloads 2.0.3 and copies its data unchanged
cd web && npm test                    # the port's lesson/generator/arcade tests
npm run build && node scripts/screenshots.mjs tuxmath
```
