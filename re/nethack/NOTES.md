# NetHack 3.6.7: how the port was made and checked, and what it learnt

Reference: `nethack-367-src.tgz` from nethack.org (5,577,415 bytes, sha-256 `98cf67df…acb2`, the sum the
download page lists), fetched and checked by `fetch.sh` into `orig/NetHack-3.6.7/`. The port is
`web/games/nethack/`; the oracle is the release compiled natively by `oracle/build.sh`.

## The oracle (oracle/)

`build.sh` builds the release as its Unix makefiles would with the Linux hints file
(`sys/unix/hints/linux`), with three differences that the browser forces and that the port shares:
the tty interface only (no curses interface), no compression of save files (config.h's `COMPRESS`,
`/usr/bin/compress`, is commented out: the browser cannot run a compressor), and the terminal library
replaced by `stub.c`. Everything else is the hints file's: `DLB` (the data files in `nhdat`), `SYSCF`
(the release's `sys/unix/sysconf`), `SECURE`, `TIMED_DELAY`, `DUMPLOG`, `HACKDIR="."`.

- **The build tools** are the release's: `makedefs` (onames.h, pm.h, vis_tab, date.h, and the data
  files data, rumors, oracles, options, quest.dat, engrave, epitaph, bogusmon), `dgn_comp` (dungeon),
  `lev_comp` (every `*.lev`, from the parsers in `sys/share/`) and `dlb` (nhdat, the files and order
  of Makefile.top's `DATDLB`). `makedefs -v` runs with `REPRODUCIBLE_BUILD` and `SOURCE_DATE_EPOCH` =
  2023-02-16 (the release), so the version line says "revised Feb 16 00:00:00 2023" instead of the
  build's date. `tools/translate.sh` copies `nhdat`, `license`, `symbols` and `sysconf` to the port's
  `assets/`: the port's data is the original's, made by the original's compilers.
- **clang.** C leaves open in which order the arguments of a call (and the operands of most operators)
  are evaluated, and NetHack draws random numbers in arguments all the time
  (`mksobj_at(BOULDER, somex(croom), somey(croom), ...)`). gcc picks an order per call site; clang
  always evaluates from left to right, as JavaScript does. The oracle is compiled with clang 21 (nix's),
  so that the original and the port draw in the same order. Where both sides of `=` have side effects,
  clang evaluates the right side first; the translator writes that order out.
- **stub.c** is linked in with `ld --wrap` for what the program takes from the system:
  `getchar`/`getc`/`fgetc` on stdin (the keys of the session, one at a time; with `NH_KEYS_FIFO` live
  from a pipe for `bot.py`), `time` (2024-01-01 00:00 UTC), `fopen("/dev/urandom")` (the n-th opening
  reads the seed + n: NetHack seeds its generators at the start and again for every new level,
  `reseed_random()`), `getpid` 4242, `getuid` 1000, `getlogin`/`getpwuid`/`getpwnam` (the session's
  login), `isatty` (yes for 0-2), `tcgetattr` (a Linux console: erase ^?, kill ^U, interrupt ^C),
  `usleep`/`sleep` (return at once), and termcap's `tgetent`, `tgetstr`, `tgetnum`, `tgetflag`, `tgoto`,
  `tputs` (one fixed entry: an 80x24 VT100 without colours, the same as the port's `src/rt/termcap.ts`;
  terminfo's padding `$<..>` is left out by both). It records a frame each time the program reads a key:
  the key's index, the bytes written to standard output so far and the number of draws from ISAAC64
  (both generators); `E` when the keys are used up (exit 99), `X` at the exit.
- `DEBUG=1 build.sh` builds `nethack-oracle-debug` (`-O0 -g`; the order of evaluation is clang's either
  way). With `NH_RNGTRACE` it writes the callers of every draw; `rngtrace.py` puts them next to the
  port's (`test/rngtrace.ts`) and shows the first draw whose callers differ. That, and `gdb` on the debug
  build, answered every question the source did not.

`run.py` runs the oracle once; `drive.py` runs a session (`sessions/*.txt`: seed, login, clock, runs with
their command line and keys) and writes its golden: per run every frame (kind, key index, draws, the
bytes since the frame before), the exit status and the files the run left; the runs of a session follow
each other with those files (save files, bones, the record). `goldens.sh` writes all goldens into
`web/games/nethack/test/golden/`.

**bot.py** plays the oracle live and decides every key from the screen alone, so its keys replay the
same anywhere; `sessions/bots.json` says how each of its sessions was made. It explores (breadth-first to
the nearest unexplored place it has not stood on, then the things lying around, then searching dead
ends), fights what stands next to it, opens doors and kicks locked ones, goes downstairs when it has
seen a level, eats when hungry, prays when its hit points are low, and every 37 keys uses something
(inventory, quaff, read, zap, wear, put on, apply, engrave, take off, look, attributes, throw, cast,
overview, earlier messages). In wizard mode (login `root`, `-D`) it maps each level (^F, ^E), wishes,
changes its level, and goes from level to level with ^V, by number or by the level menu (`@minetn`).
At the end of a game it looks at its possessions and attributes, so that the tombstone, the end screens
and the record show.

The sessions: `create` (every role, with races, genders and alignments chosen by hand, and one chosen at
random; each quits at once: the end screens and the record of 14 games), `commands` (a Valkyrie: the
inventory, help, look, search, walking, `^X`, options, earlier messages, prayer, running), `save` (saved,
restored, saved, restored, played until death), `valkyrie`, `samurai`, `wizard`, `healer`, `barbarian`,
`tourist` (the bot plays until the character dies or 4000 keys), `tour`, `tour2`, `tour3` (wizard mode
through the special levels: the Oracle, Minetown, the big room, Sokoban, the Mines' end, Medusa, the
castle, the Valley, Juiblex, Orcus, Asmodeus, Baalzebub, the fake and real Wizard's tower, the Rogue
level, Fort Ludios, the quest's levels), `bones` (a knight dies on level 15 and leaves bones; a samurai
finds them), `shop` (Izchak's lighting store in Minetown: buying, selling, paying; written by hand),
`help` (the help menu and its texts from nhdat, what-is and what-does, the version, the options menu,
the overview, conduct, attributes, an annotation; written by hand).

## The port (web/games/nethack/src)

Every C file of the game (`src/*.c`, `vis_tab.c`), of the tty interface (`win/tty/*.c`) and of the Unix
layer (`sys/share/ioctl.c`, `unixtty.c`, `posixregex.c`, `sys/unix/unixmain.c`, `unixunix.c`,
`unixres.c`) is translated by `tools/c2ts` from clang's syntax trees (`tools/translate.sh`):
3,465 functions in 119 modules, 2,253 of them `async` because they can wait for a key. How C becomes
TypeScript: `tools/c2ts/CONVENTIONS.md`. Only what needs 64-bit integers is written by hand
(`src/rt/rng.ts`: ISAAC64, `RND`, `rn2_on_display_rng`, `init_isaac64`, `sys_random_seed`), with the C
library, Unix and the terminal (`src/rt/`). The program writes to a terminal as on Unix; `src/vt.ts` is
that terminal (the subset of a VT100 the termcap entry uses), and `src/index.ts` draws it on the SDK's
TextScreen and hands it the keys.

The tests replay every golden (`test/sessions.test.ts`): every frame must be the original's byte for
byte (what was written to the terminal, cursor movement and attributes included), with as many draws
from the random generators, and every run must end as the original's did.

**Mutation check.** With one rule changed in the port, the hero's chance to hit (uhitm.c
`find_roll_to_hit()`: `tmp = 1 + Luck + ...` made `2 + ...` in `src/uhitm.ts`), the tests fail: four
sessions (`bones`, `save`, `tour`, `tourist`) part from the original at the first attack whose roll the
change decides, e.g. `save`, run 1, frame 396: "You miss the kobold zombie." in the original, "You
destroy the kobold zombie!" in the mutant, and two draws more. The other sessions pass: none of their
attacks fell on the changed threshold.

## What the source does not say

- **The order of evaluation** (above): clang's, left to right. With gcc the original draws in other
  orders at many call sites; the port follows the oracle's compiler.
- **qsort's order of comparisons.** `sortloot()` sorts with `sortloot_cmp()`, which names the objects
  (`loot_xname()`, cached) as it compares them. The oracle's glibc 2.44 sorts with a top-down merge sort
  (`msort_with_tmp`: halves of n/2 and n - n/2); `src/rt/sys.ts` does the same comparisons in the same
  order (and awaits a comparator that is async).
- **Longs in files.** The special levels store their numbers as 8-byte longs; a monster or object given
  as "random" is -1, which a double read byte by byte turns into 0 (2^64 - 1 rounds to 2^64). The
  runtime reads and writes 8-byte integers through BigInt.
- **Pointers in files.** The original writes structs with their pointers to save files, level files and
  bones (heap addresses that NetHack never uses again: it sets the pointers anew when it reads them). The
  port writes 1 for a pointer that is not null; a save file is otherwise the original's, byte for byte
  (the same size and layout: clang's layouts for x86-64).
- **Uninitialised memory.** The port's locals start as zero; the C's start with whatever is on the stack.
  No session has shown a place where NetHack reads one before setting it.

## Bugs of the original the port keeps

All of them: the program is translated statement by statement, not rewritten, so whatever the original
does, intended or not, the port does too (the release's `doc/fixes36.7` and the bug list at nethack.org
are the place to look them up). The record keeps at most 10 characters of a name (`NAMSZ`), as the
original's does.

## REA

The questions above were questions about the compiled original (in which order it draws, what it reads
from a level file, how glibc sorts), not about the source. They were settled on the oracle itself, the
binary built from the reference source: by tracing every draw of its random generators with its callers
(`NH_RNGTRACE`, `addr2line`) against the port's, and by stopping it in `gdb` where the two parted (the
special levels' monster ids). The REA toolkit itself was not needed for that.
