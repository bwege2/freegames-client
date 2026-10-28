# Core War: pMARS 0.9.5 in the browser

A port of **pMARS 0.9.5** (Albert Ma, Na'ndor Sieben, Stefan Strack, Mintardjo Wangsaw), the
reference simulator of Core War, in the version Debian ships (`pmars_0.9.5.orig.tar.xz`). The build it
follows is the one of the package's `src/Makefile` and of Debian: `-DEXT94 -DXWINGRAPHX -DPERMUTATE
-DRWLIMIT`. That is ICWS'94 with the extensions (SEQ, SNE, NOP, the `*`, `{` and `}` modes, P-space with
LDP, STP and PIN), the X11 core display, the `-P` permutations and the read/write limits. The C files
became TypeScript modules of the same names:

| C | TypeScript | |
| --- | --- | --- |
| `sim.c`, `pos.c` | `src/sim.ts`, `src/pos.ts` | the MARS, the RNG and the placement |
| `asm.c`, `token.c`, `eval.c` | `src/asm.ts`, `src/token.ts`, `src/eval.ts` | the assembler with its preprocessor |
| `disasm.c` | `src/disasm.ts` | listings |
| `clparse.c`, `pmars.c` | `src/clparse.ts`, `src/pmars.ts` | options, main, results, exit codes |
| `cdb.c` | `src/cdb.ts` | the debugger, and the score functions |
| `xwindisp.c` | `src/xwindisp.ts`, `src/display.ts` | the X11 display |
| `str_eng.c`, `global.c` | `src/str_eng.ts`, `src/global.ts` | messages, globals |

`test/pmars.test.ts` checks the port against pMARS itself: 104 cases (`re/corewar/oracle/cases.txt`)
of battles, listings, assembler errors, command-line errors and cdb sessions. They compare stdout,
stderr, the exit status, cdb's output and the core display's calls of every cycle (`re/corewar/NOTES.md`).

## Playing

The page works like the terminal pMARS runs in. Its command line holds the options and the warrior
files, exactly as in `pmars -r 10 warriors/sunset.red mine.red`. Run (or Enter) starts it. The options
form (Options) writes the options into the line. It does not cover everything: `-@ file`, `-=`
(score formula), `-Q` and `-A` are typed into the line. While pMARS runs, its X window sits above the
terminal. The window has the core display and, under it, the text panel cdb works in.

| Where | Key | What |
| --- | --- | --- |
| page | Run, Enter in the command line | run pmars |
| page | Options | a form for the common options |
| page | Files, editor, Save, New, Delete | your files on the server, the examples (`warriors/…`), the option and macro files (`config/…`) |
| core window | `0` … `4` | display level (nothing, executions, writes, increments and decrements, reads) |
| core window | `<` `>` | slower, faster (the nine speeds of `-v`) |
| core window | `d`, or any other key | enter cdb |
| core window | `c`, `r`, Space | clear the core display |
| core window | `q`, Esc | quit pMARS ("Press any key ..") |
| cdb | a command, Enter | `help` lists them. Enter alone repeats the last command; `~` chains, `!!`…`!n` loops |
| cdb | arrows, F1–F12, Ins, Del, PgUp, PgDn, End, Tab, Ctrl+letter, Alt+letter | the macro of that name (` m up`, ` m f5`, ` m ctrl-c` …), from `pmars.mac` |
| cdb | mouse buttons on the core | the current address, then the macros `mousel`, `mouser`, `mousem` |
| terminal | Ctrl+C | interrupt (SIGINT): enter cdb |
| terminal | typing, Ctrl+D | the standard input, for warriors read from `-` |
| page | Online battle | the lobby, then each player enters one warrior (below) |

When the battle ends, the window shows "Press any key .." and waits for a key; after that pMARS prints
the results. Stop ends a running pMARS.

Why a command line: all 22 options of pMARS, `-@` option files, warriors from the standard input and
the exit statuses work exactly as in the original, error messages and usage screen included. The form
only fills in the line.

### Online battles

Online battle opens the shared lobby (2–8 seats). The room takes its options (rounds, core size,
cycles, processes, length, distance, read/write limits, P-space, `-8`) from the form. Each player then
enters one warrior; it stays secret until every seat has entered one. The server then sends all of
them, in seat order, and the value pMARS seeds its RNG with. The module derives that value from the
round's seed: positions and permutations are the server's. Every client runs the same battle and
reports it. The server module compares the reports and announces the result, or a dispute if they
differ.

Not in the original (one computer, one pMARS):

* **The reports are waited for 10 minutes after the first one.** A player who stays in the room but
  does not report (the battle stopped, or watched at a crawl) no longer keeps the round open. The
  result comes from the reports that are in, and it names the players whose report is missing,
  whether they left or did not report in time.
* **A result that rests on one report is marked unconfirmed.** This happens when every other player
  left or did not report.
* Entering a warrior has no time limit: writing one takes as long as it takes. The battle starts when
  everyone still in the room has entered one, so whoever does not want to wait can leave.

## Deviations the browser forces

* **The X window** is a canvas for the graphics plus the SDK's TextScreen for the text panel. The
  canvas has the names, the process and cycle meters, the core and the menu line, drawn pixel for
  pixel. The panel gets one cell per X character position, with cdb's two panels for `switch` and
  `close`.
  * The font is the browser's monospace, rasterized at the size of the misc-fixed font the X server
    would choose (9×15 for 640×480).
  * The colours are X's `rgb.txt` values of pMARS's palette.
  * The lines cdb prints in a warrior's colour (its next instruction) are bold in the panel.
  * The window opens inside the page: `-geometry` sets its size, but its position is ignored.
    `-display` and `-fn` are accepted and have no effect.
  * cdb cannot move the mouse pointer to the current address (XWarpPointer).
  * When pMARS closes the window it disappears, and the terminal takes its place.
* **The terminal** shows stdout and stderr together, in the order they are written. "Exiting" pMARS
  prints its exit status there and returns to the command line.
* **Files**:
  * Your files are in your account on the server, with flat names (`[A-Za-z0-9._-]`, 64 files,
    512 KiB each).
  * The package's example warriors and the six small warriors of the port's tests are read-only, at
    `warriors/…`. The package's option and macro files are at `config/…`.
  * When there is no `pmars.mac` among your files, cdb's default macro file is `config/pmars.mac`, as
    if pMARS were run in `config/`.
  * cdb's `write logfile` appends to a file in your account.
* **Speed**: speeds 0–2 run as fast as the browser can, with a frame drawn about every 15 ms. The
  slower speeds wait as pMARS's `usleep()` does.
* **Online battles** run as pMARS's SERVER build does, without the debugger, so that every client
  runs the same battle: `d` and `-e` do nothing there. The warriors are files named `seat<n>.red`.
* **Where pMARS 0.9.5 hangs or crashes**, the port stops or reports instead:
  * Source lines of 256 characters or more. pMARS's line index is a `uChar` (`asm.c`, `assemble()`),
    so it scans forever. The port stops with "pmars: line n is longer than 255 characters: pMARS 0.9.5
    loops forever on this input".
  * A last line that ends with a backslash (a continuation that never comes): pMARS loops forever; the
    port stops with a message.
  * A FOR loop that expands to more than a million lines (`for 65535` never ends in pMARS, whose
    counter is 16 bits): the port stops with the same kind of message.
  * Values far outside the core, such as `dat #9000000000000000`. pMARS's `normalize()` subtracts the
    core size once per loop, which takes hours. The port computes the same remainder at once.
  * cdb's `search` with no match, started at address 0, searches forever (until Ctrl+C); the port stops
    after one pass. Esc in a cdb line that wrapped to a second line also loops forever in pMARS; the
    port deletes what it can.
  * Core, queue or P-space sizes over 4,194,304 entries make malloc() "fail": pMARS prints "Out of
    memory", as on a machine with little memory.
