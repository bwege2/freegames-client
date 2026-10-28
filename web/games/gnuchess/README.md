# GNU Chess 6.3.0

GNU Chess 6.3.0 (2025) running in the browser: the whole program translated to TypeScript, source file
by source file, and checked against the original built natively (`re/gnuchess/`). Its three parts work
as in the original, as separate threads that talk through pipes:

- `src/frontend/`: the GNU Chess 5 command interface: the prompt, every command, the board display
  (classical and graphic), move parsing (SAN and coordinates), EPD and PGN files (with the flex PGN
  scanner `lexpgn`), the player list;
- `src/adapter/`: PolyGlot 1.4, which turns the frontend's xboard commands into UCI for the engine,
  keeps the game and decides when it has ended, keeps the clock, plays from the opening book
  (`assets/smallbook.bin`, the package's) and builds books (`book add`);
- `src/engine/`: Fruit 2.1, the chess engine (search, evaluation, hash tables, its own book);
- `src/main.ts`: `main.cc` and `components.cc`: the process and how its threads are scheduled.

The engine runs in a Web Worker (`src/worker.ts`, `src/worker-link.ts`), so the page stays responsive
while it thinks.

## Controls

The program starts as `gnuchess` with no options, at its prompt `White (1) : `.

| Input | Action |
| --- | --- |
| a move and Enter | `e4`, `Nf3`, `exd5`, `Nbd2`, `O-O`, `e8=Q`, or from and to square: `e2e4`, `e7e8q` |
| Backspace, Ctrl+U | correct the line, clear it |
| `help`, `help COMMAND` | the program's list of commands, and what one does |
| `depth N` | think N half-moves deep (`new` forgets it) |
| `level MOVES MINUTES INC`, `st N`, `time`, `otim` | the clock: MOVES in MINUTES plus INC seconds a move; N seconds a move |
| `easy`, `hard` | do not think, or think, in your time (pondering is on at the start) |
| `post`, `nopost` | show the engine's thinking: depth, score, time (centiseconds), nodes, line |
| `undo`, `remove` | take back one move, two moves (`remove` also writes `game.log`, once) |
| `new`, `go`, `force`, `manual` | a new game; the computer takes the side to move; the computer only checks the moves (two people at one keyboard) |
| `hint`, `bk`, `book on/off/best/worst` | a hint and the book moves (both need `book on`), the opening book |
| `show board`, `show game`, `show moves` | the board, the moves so far, the moves possible |
| `graphic`, `nographic`, `coords`, `nocoords` | the board with Unicode pieces on coloured squares, and with ranks and files |
| `pgnsave F`, `pgnload F`, `pgnreplay F`, `next`, `previous`, `first`, `last` | games as PGN files, and stepping through a loaded game |
| `save F`, `load F [N]`, `load next`, `setboard FEN`, `solve F` | positions as EPD (`save` appends), and solving a file of them |
| `name NAME`, `result R`, `list` | the log and game files of a player, the result, the player list (`players.dat`) |
| `xboard` | the protocol mode for chess GUIs (no prompt) |
| `quit` | back to the game page |
| the bar: options, **Restart** | start GNU Chess again with options, as on its command line (`-e`, `-m`, `-g`, `-p`, `-M SIZE`, `-x`, `-u`, `-q`, `--help`, `--version`; see `--help`) |
| **Files** | the program's working directory (your account): download, add or delete files |
| **Play online** | a game against someone else: see below |
| mouse wheel | scroll back through what GNU Chess has printed |

## Online play

Two people play each other in GNU Chess's manual mode (as `gnuchess -m`, where the program only checks
the moves): **Play online** opens the shared lobby; in a room the host's seat is White, the other
Black. Each player runs their own GNU Chess. A move you type is checked by the program's own move
reader and sent to the server, which keeps the game (`server/.../games/gnuchess/GnuchessModule.java`):
it takes only a legal move of the side to move and sends it to both players. Then the move goes into
both programs: yours as you typed it, your opponent's in coordinates (`e7e5`) at your prompt. The
server also ends the game, with the adapter's rules (mate, stalemate, the fifty-move rule, the third
repetition, insufficient material).

What online play adds (the original has no network game):

- `resign`, and `draw` to offer a draw or accept the opponent's offer (it stands until you move);
  `quit` leaves the game, which the opponent then wins;
- while the game runs, the commands that would change the game on one side only are refused
  (`new`, `undo`, `remove`, `setboard`, `load`, `pgnload`, `pgnreplay`, `next`, `previous`, `first`,
  `last`, `go`, `white`, `black`, `switch`, `edit`, `xboard`, `analyze`, `solve`, `usermove`, `?`,
  `exit`); a move when it is not your turn is refused too;
- after a reload or a lost connection, the lobby offers the game again and the moves played so far
  are typed into a new program (the client asks the server for them, `historyRequest`: when the new
  connection takes the seat over before the server has seen the old one go, the core does not tell the
  module that the seat came back);
- when the game is over the board is yours (`pgnsave FILE` keeps the game); **Play again** goes back
  to the lobby, **Leave** to GNU Chess on your own.

## Deviations the browser forces

- **Files.** The program's working directory is your account's storage on the server: what it writes
  there (`pgnsave`, `save`/`epdsave`, `game.log` on `remove`, the `log.nnn`/`game.nnn` of `name`,
  `players.dat`, `book.bin` of `book add`) is saved, what it reads (`pgnload`, `load`, `solve`,
  `book add`) comes from there. The storage keeps names of `A-Z a-z 0-9 . _ -` (64 characters at
  most), 64 files, 512 KiB each and 4 MiB in all; a file it cannot keep cannot be opened, and the
  program says so as it does for a file it may not write (`Cannot write to file ...`). Where the
  original then crashes (`save` to a file it cannot open writes on a NULL FILE), the port prints
  `Segmentation fault` and ends the program, as a shell would show it. The book is the installed
  one, at its installed path; the program's `$HOME` is `/home/player`, so its
  `$HOME/.config/gnuchess/gnuchess.ini` is the storage file `gnuchess.ini` (added with **Files**).
  Without one, GNU Chess prints `Can't open file "(null)": Bad address - using defaults` when it
  starts, as the original does.
- **The engine in a Web Worker.** A worker cannot read messages while it searches, and Fruit reads
  its pipe during a search. So `isready` and `quit` are handled beside the worker; `stop` (a move
  other than the one the engine pondered on, `?`, a command while it ponders) stops the worker and
  starts a new one with the same options, whose hash table is empty, and the best move so far is
  sent as Fruit sends it; a ponder search is limited by the time Fruit allots to that move (as it is
  after the expected move, `ponderhit`), where Fruit would go on until you move, and its best move is
  held back until you move, as Fruit holds it. While a search runs, `position`, `go`, `setoption` and
  `ucinewgame` are ignored, as Fruit ignores them.
- **The terminal.** The program's output is shown in a terminal like a Linux console: UTF-8, and the
  colour sequences of the graphic board (`ESC[7;37m`, `ESC[7;35m`, `ESC[0m`). The SDK's Teletype has no
  colours, so the port has a terminal of its own (`src/terminal.ts`). A line can be 126 characters
  long: the original reads at most 127 bytes with `fgets` and waits for ever when a line is longer.
  GNU Chess is built here without readline (as it reads input that is not a terminal): the prompt is
  its own and lines are edited with Backspace and Ctrl+U, with no history.
- **The threads.** The original's threads run at the same time; here they take turns. Where the
  original's output depends on which thread is first, the port does what the original usually does:
  the prompt comes when the frontend wakes the input thread, the adapter answers after that (`bk`
  lists the book moves before the next prompt, as the adapter prints them itself; `hint` comes after
  it). At the start, the prompt is printed before the adapter's message about `gnuchess.ini`.
- **When the adapter exits** (a second fatal error, e.g. `setboard` with a FEN it cannot read, or
  `load` of an EPD file whose first line is a comment): the original's `exit()` waits for the next
  line typed (glibc locks stdin, which the input thread holds) and handles it meanwhile; if that line
  opens a file, the original hangs. The port ends after the next line in every case.
- **`list`** stops after ten players and waits for a key in the original (`getchar()`, which competes
  with the input thread for the terminal); the port goes on.
- **Memory outside the arrays.** Two commands read outside an array in the original: `previous` and
  `last` at the start of a game print `Game[-1]`'s move, and an EPD position without the en-passant
  field makes `board.ep` 0. The port reads what lies there in the reference build
  (`re/gnuchess/oracle`): the ints `RealGameCnt` and `GameCnt`, and `NotBitPosArray`.
- **Time.** The clock is the browser's; the PGN `Date` tag is in the browser's time zone.
- **`quit`** goes back to the game page; when the program ends otherwise, the page says with which
  status and **Restart** starts it again.

## Checked against the original

`npm test` runs `test/engine.test.ts` (82 positions, the Bratko-Kopec and Win at Chess tests,
endgames, mates and special moves, at fixed depths: the same best move, ponder move, score, depth,
selective depth, principal variation and node counts as GNU Chess 6.3.0 compiled natively; the
engine's options and its own book too), `test/adapter.test.ts` and `test/sessions.test.ts` (30 sessions
of the whole program: commands, errors, the board in all its forms, PGN and EPD files, solve, name and
the player list, xboard mode; stdout, stderr, the exit status and the files written must be the
original's). `GNUCHESS_DEEP=1 npm test` runs the positions deeper as well. `e2e.mjs` plays a local
game and an online game in headless Chromium.
