# Colossal Cave Adventure (port)

Open Adventure 1.22, Eric S. Raymond's continuation of Crowther and Woods' Adventure 2.5 (the 430-point
version of 1995), ported to TypeScript one C file at a time: `src/main.ts` is `main.c`, then `misc.ts`,
`actions.ts`, `score.ts`, `saveresume.ts`, `init.ts` and `advent.ts` (`advent.h`), with the same
functions in the same order. `src/dungeon.ts` is generated from the original's `adventure.yaml` by
`re/adventure/make-dungeon.py`, as the original's `make_dungeon.py` generates `dungeon.c`. It runs on
the SDK's teletype, 80 columns, as `advent` runs in a terminal. Notes on the port: `re/adventure/NOTES.md`.

## Controls

* **Commands**: type one or two words and press Enter: `GO NORTH` or just `N`, `GET LAMP`, `INVENTORY`,
  `LOOK`. Upper or lower case; only the first five letters of a word count. `HELP` and `INFO` explain
  the game, `SCORE` shows the score so far, `BRIEF` shortens descriptions, `QUIT` ends the game.
* **Questions** (instructions, hints, "Is this acceptable?"): answer `y`/`yes` or `n`/`no`.
* **Editing**: Backspace corrects the line before Enter, Ctrl+U clears it.
* **Saving**: `SAVE` (it costs 5 points), confirm, then give a file name: the game is stored in your
  account on the server and the program ends, as the original's does. To go on, start a new game and
  type `RESUME` and the same file name.
* **Scrolling**: the mouse wheel (or a swipe) scrolls back through what the game has printed.

## Deviations the browser forces

* **Files are in your account storage.** The original reads and writes save files in the directory it
  runs in; here they are kept on the server, per player and game. A file name may have letters,
  digits, `.`, `_` and `-`, up to 64 characters (not `.` or `..`, not ending in `.tmp`); any other
  name (a path, a name with spaces) cannot be opened, and the game says so in the original's words
  ("Can't open file …, try again."). The file format is the original's own (`struct save_t` as Open
  Adventure 1.22 writes it on x86-64 Linux); the tests check that the port writes the same bytes.
* **A failed save asks again.** If the server cannot store the file (not reachable, storage full), the
  game prints "Can't open file …, try again." and asks for a name again. The original opens the file
  first and ignores a failing write (the game would be lost); here the file is written in one step.
* **The end of the program.** When the game ends (`QUIT`, death, victory, after `SAVE`) its last text
  stays on the screen with the line `[Press a key to return to the game page.]`; a key goes back to
  the game page, where the original would have returned to the shell.
* **Line editing is the teletype's.** The original reads lines with libedit: Up/Down recall earlier
  lines, Left/Right move in the line, Tab completes file names, Ctrl+D (end of input) ends the game
  with the score without asking. Here Backspace and Ctrl+U edit the line, and none of the others exist.
* **Ctrl+C** copies selected text, as in the browser; in the original it interrupts the program,
  which ends without a score. `QUIT` ends the game.
* **No command line.** The original's options `-l` (log the commands to a file), `-o` (oldstyle: no
  prompt, words truncated as in the FORTRAN version), `-r` (resume a save file at start) and script
  files are not offered on the website (the tests use them all). `RESUME` at the start does what `-r`
  does.

Not deviations: the texts, the prompts and the echo of typed lines are those of the original in a
terminal (the tests compare them with recorded terminal sessions); the random numbers are the
original's (its linear congruential generator, seeded like the original from the clock through
glibc's `srand(time(NULL))` and `rand()`), so every game is a new one, and `SEED n` replays one.
