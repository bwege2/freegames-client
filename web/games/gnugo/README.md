# GNU Go 3.8

GNU Go 3.8 (2009) in its ASCII mode, `gnugo --mode ascii`, in the browser: the board drawn in letters,
moves and commands typed at its prompt `black(1): `. Translated to TypeScript from the original's C
source and checked against the original built natively (`re/gnugo/`):

- `src/engine/board.ts`: `engine/board.c` and `engine/hash.c`: the board with its incrementally kept
  strings, captures, ko, suicide and superko rules, trymove/popgo, the move history and undo, the Zobrist
  hash (from the same TT800 random numbers);
- `src/engine/unconditional.ts`: `engine/unconditional.c`: unconditionally alive strings, their territory,
  and the moves that are meaningless because of them;
- `src/engine/montecarlo.ts`: `engine/montecarlo.c`: the Monte Carlo board, the random games weighted by
  the patterns of `assets/mc_montegnu_classic.db` (read as `mc_load_patterns_from_db` reads it), and the
  UCT search `uct_genmove`;
- `src/engine/genmove.ts`: the computer's move (below), the end-of-game estimate and the count;
- `src/engine/random.ts`: `utils/random.c` (TT800) and the random seed of `utils/gg_utils.c`;
- `src/sgf/sgf.ts`: `sgf/sgfnode.c`, `sgftree.c`, `sgf_utils.c`: reading and writing SGF files;
- `src/gnugo.ts`: `interface/main.c` (the options of the ASCII mode, `--help`, `--version`,
  `--copyright`), `interface/play_ascii.c` (the board, every command, the end of the game, counting,
  free handicap), `engine/interface.c`, `engine/handicap.c`, `engine/sgffile.c`, `engine/printutils.c`.

The program runs in a Web Worker (`src/worker.ts`), so the page stays responsive while the computer
thinks; the bar shows how far its search is.

## Controls

The program starts as `gnugo --mode ascii --boardsize 9` (the bar shows the command line; change it and
press **Restart**). Without `--boardsize` the board is 19x19, as in the original.

| Input | Action |
| --- | --- |
| a move and Enter | `d4`, `k10` (columns A–T without I, rows from the bottom); `pass` |
| click on a point | types its coordinate (not in the original, see below) |
| `;` | several commands on one line: `force e5;force c3` |
| `undo`, `back`, `forward`, `last`, `goto N` | take back your last move, step through the game tree |
| `boardsize N`, `handicap N`, `freehandicap [N]`, `komi K` | before the first move: the board, fixed or free handicap (without N you place the stones yourself), komi |
| `level N`, `depth N` | how strong the computer plays (default 10), the reading depth |
| `play N`, `switch`, `playblack`, `playwhite` | let the computer play N moves, change colours |
| `force MOVE`, `force pass` | play a move for the side to move without the computer answering: two people at one keyboard |
| **Two players** in the bar | types `force` before each move and pass you enter (not in the original, see below) |
| `save FILE`, `load FILE`, `comment` | save the game as SGF in your account, load one, add a comment to the record |
| `score`, `dead`, `showboard`, `display`, `info` | show the score estimate, the dead stones, the board on or off, the settings |
| `resign`, `quit`, `exit` | give up; back to the game page |
| after two passes | `count` to count together (type a group to toggle it dead or alive, `done`), `save FILE`, `game` for a new game, `quit` |
| the bar: options, **Restart** | the command line: `--boardsize N`, `--handicap N`, `--komi K`, `--color black/white`, `--level N`, `--chinese-rules`, `--japanese-rules`, the suicide and ko rules, `-l FILE` and `-L MOVE` to resume a saved game, `-r SEED`, `--quiet`, `--mc-games-per-level N`, `--help` |
| **Files** | the program's working directory (your account): download, add or delete SGF files |

## The engine

GNU Go 3.8 chooses its moves with a large engine: pattern databases compiled into decision automata,
tactical and life-and-death reading, influence, dragons, fuseki and joseki libraries; with
`--monte-carlo` (boards up to 9x9) a Monte Carlo search refines its choice. That engine is some 60,000
lines of C and its compiled patterns; **it is not ported**. The port's computer player is GNU Go's own
Monte Carlo module, translated and checked against the original, run as `monte_carlo_genmove()` runs it:

- the random number generator reseeded with the game's seed for every move (`reset_engine`), the
  unconditionally settled points forbidden and the meaningless moves replaced (level 10 and above, as
  `worm.c` computes them), the moves `is_allowed_move()` allows, and `mc_games_per_level * level`
  simulations (8000 per level, level 10 by default: 80,000 simulations on 9x9, a few seconds);
- `potential_moves[]` of the full engine are 0, so the move ordering is the board's order and the move
  is the one with the best win rate.

What the port adds where the full engine would decide (deviations, the port's own):

- **Passing.** The Monte Carlo module never passes while it has a move. The port passes when its
  estimate (below) says every point is decided and the move it found lies in its own sure area, or when
  the opponent passed and the decided position wins.
- **Resigning.** `monte_carlo_genmove()` never resigns, nor does the port.
- **Boards larger than 9x9.** The original refuses `--monte-carlo` on them and plays with its full
  engine. The port plays them with the Monte Carlo module, with `mc_games_per_level * level * 81 /
  (size * size)` simulations, so that a move takes about as long as on 9x9. It plays clearly weaker there
  than GNU Go 3.8.
- **The score estimate and the count.** The original estimates the score and the dead groups with its
  influence function and dragon analysis. The port takes the dead stones from a few hundred of the Monte
  Carlo module's random games (a stone that ends as the opponent's more often than not is dead) and
  counts territory and prisoners (or, with `--chinese-rules`, area) with komi. When you toggle a group in
  `count` the port counts again with your choice; the original prints the same estimate as before. The
  group that toggles is the stones of one colour that touch, also diagonally, or stand one point apart
  (the original toggles a dragon).
- **Free handicap by the computer** (`freehandicap N`) places the stones at the fixed handicap points as
  far as the board allows (the original finds places with its handicap patterns).
- **The debugging commands** `capture`, `defend`, `showdragons`, `listdragons`, `showmoyo`, `showterri`,
  `showarea` need the reading engine and print that the port does not have it.
- Options of the other modes and of the full engine (`--mode gtp/gmp`, `--clock`, `--score`, the depth
  and node-limit options, …) say that they are not available in the port.

## Deviations the browser forces

- **Files.** The working directory is your account's storage on the server: `save FILE` writes there,
  `load FILE` and `-l FILE` read from there. The storage keeps names of `A-Z a-z 0-9 . _ -` (64 characters
  at most), 64 files, 512 KiB each and 4 MiB in all; a name it cannot keep cannot be opened, and the
  program says so as for a file it may not write (`Can not open NAME`). The SGF date (`DT`) is the
  browser's.
- **The terminal.** Lines are edited with Backspace and Ctrl+U (GNU Go is built without readline when its
  input is not a terminal, and reads at most 79 characters with `fgets`). The random seed, when not given
  with `-r`, is the time, as in the original.
- **Two additions for the player, both only typing**: a click on a point of the last board printed types
  its coordinate and Enter; the **Two players** box types `force ` before each move and `pass` you enter
  at the prompt (the original's way of letting two people play, by hand).
- **`quit`** goes back to the game page; when the program ends otherwise (`--help`, `--version`, a bad option, an SGF file it
  cannot parse), the page says with which status and **Restart** starts it again.

## Checked against the original

`npm test` runs:

- `test/oracle.test.ts`: 11 sessions against `re/gnugo/oracle/gnugo-oracle` (the package's own engine
  library with a small driver): random games on 5x5 to 19x19 (more than 500 moves on 19x19, past the move
  history's limit), after each part the board, ko, captures, the 64-bit hash, every string's stones and
  liberties in the board's order, every empty point's legality, suicide, self-atari, `approxlib`,
  `accuratelib` and ko for both colours; undo; `unconditional_life` and the meaningless moves; and
  `uct_genmove` from 20 positions with up to 8,000 simulations: every root move's number of simulations
  and win rate, the move chosen, and the next random number afterwards (so every random number drawn)
  equal the original's;
- `test/ascii.test.ts`: 10 sessions of the whole program against `gnugo --mode ascii` (stdout, stderr,
  exit status and the SGF files written): every command, the board for each size, handicap, free
  handicap, captures and ko, illegal moves, undo and the game tree, saving and loading SGF (variations,
  stone ranges, escapes, passes), resign, the end of the game and its menu, errors in options and files.
  These sessions play both colours with `force`; the "Result:" the original prints after two passes comes
  from its full engine and is left out;
- `test/play.test.ts`: the computer plays a game against itself to the end and counts.

`e2e.mjs` (after `npm run build`, with the server jar) plays in headless Chromium: two players with the
box and with a click on the board, a move against the computer in its worker, a game saved and loaded
again after a reload, `quit` and Back. The server knows the game as a storage-only game
(`server/.../games/Games.java`).

What is not checked against the original: the computer's moves in a real game (they come from the full
engine there), the score at the end, and the pass decisions.
