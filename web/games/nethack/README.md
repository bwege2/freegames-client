# NetHack

NetHack 3.6.7 (<https://www.nethack.org/>) with its tty interface, as it runs on a terminal, in the
browser. Every C file of the game, of the tty interface and of the Unix system layer is translated to
TypeScript (`src/*.ts`, by `re/nethack/tools/c2ts`, from clang's syntax trees of the original source);
`src/rt/` stands in for what the program took from the C library, Unix and the terminal; `src/index.ts`
and `src/host.ts` connect it to the website. How the translation works and how it was checked:
`re/nethack/NOTES.md`; the tests: `test/` (golden sessions against the original, built natively).

## Tests

`npm test` replays the golden sessions of `test/golden/` (made by the natively built original,
`re/nethack/oracle/goldens.sh`): every frame the port writes to its terminal must be the original's,
byte for byte, with as many random draws, from character creation for every role through fights,
items, shops, the special levels, save and restore, bones, death, the tombstone and the record.
`test/host.test.ts` tests the browser's part. To make the port again from the C source:
`re/nethack/fetch.sh`, `re/nethack/oracle/build.sh`, `re/nethack/tools/translate.sh`.

## Controls

The original's keys, with its default options (`number_pad` off: `hjklyubn` move, `HJKLYUBN` run).
The browser adds:

| Key | Sends |
| --- | --- |
| arrow keys, Home, End, PageUp, PageDown | `h j k l y b u n` (with Shift the running capitals; with `number_pad` on, the digits) |
| Enter | a newline, as a terminal's Enter does through the tty driver |
| Alt+key | the key with the 8th bit set: NetHack's meta commands (Alt+a `#adjust`, Alt+p `#pray`, ...) |

The browser keeps Ctrl+T, Ctrl+W and Ctrl+N for itself; their commands have extended names: Ctrl+T is
`#teleport`, Ctrl+N (with `number_pad`) `#annotate`, and Ctrl+W `#wish` (wizard mode only).

## Deviations from the original

Only what the browser forces:

- **The terminal** is a VT100 of 80x24 without colours (the SDK's TextScreen draws bold, reverse and
  underlined text, no colours). NetHack does what it does on such a terminal: it shows the things it
  would colour in bold.
- **Files.** The game runs in the player's own directory: the save file (`save/<uid><name>`) and the
  bones files are kept in the player's account storage on the server. **Bones** are therefore found
  only by the player who left them; on a Unix machine they were shared by every user of the machine.
  The level files of the running game, the lock files and the logs (`logfile`, `xlogfile`) last as long
  as the game.
- **The record** of high scores, the file every user of the machine shared, is the server's score table
  `record`: the game reads it at the start and its entry goes to the server when the game ends, where
  `server/.../games/nethack/NethackModule.java` checks it and enters it by `topten()`'s rules. "One
  player" (at most three entries per role) was one Unix user; here it is one account. Games in explore
  (discover) mode are not entered, as in the original.
- **The build**: the tty interface only (the Linux hints file also builds the curses interface), and
  save files are not compressed: the browser cannot run `/usr/bin/compress` (config.h `COMPRESS` is
  left out; the Linux hints compress with gzip). `#version` lists the options of this build. The game
  data is the installation's `nhdat`, as with the Linux hints (DLB).
- **Leaving the page does not save** the game (the original saves on a hang-up signal): save with `S`.
- **The end of the program**: what it wrote last (the score list after a death, "Be seeing you..." after
  saving) stays on the screen until a key is pressed, as it would in the terminal the program ran in;
  then the page goes back to the game page.
- **The clock** is the browser's (its time zone): the phase of the moon, Friday the 13th, night and
  midnight are those of the player's day.
- **Your name** is your name on the website (as a login name can hold it); without one NetHack asks
  "Who are you?". Wizard mode is not available (only the machine's `root` and `games` could use it).
