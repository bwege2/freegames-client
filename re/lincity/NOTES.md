# Lincity: notes for the port

## The reference

Classic **Lincity 1.13.1** (2004), the X11 version (`xlincity`): Debian's `lincity_1.13.1.orig.tar.gz`
(1,064,236 bytes, sha-256 `7b4cbd11…5015d`, the SourceForge release `lincity-1.13.1.tar.gz`). `fetch.sh`
downloads it to `orig/` and unpacks it to `orig/lincity-1.13.1/`. Lincity-NG (C++, OpenGL, a different
interface) is a later rewrite and not the reference.

License: `COPYRIGHT` puts Lincity under "the GNU GENERAL PUBLIC LICENSE" without a version, `COPYING` is
GPL-2; Debian lists it as GPL-2+. Checked over every data directory the port uses (`opening/`, `help/`,
`messages/`, `icons/`, `colour.pal`): no other notices, except the main font's own header ("Public domain
font(?)", `opening/iso8859-1-8x8.fnt`) and the Windows fonts `opening/winfont_*.fnt`, which carry a
Microsoft notice; only the Windows build reads those, and the port leaves them out (`tools/pack.py`).
Details in `web/games/lincity/LICENSE.md`.

## How the port is made

The X11 program's C source (about 28,000 lines with `modules/`, of which the X11 program uses most) is translated to TypeScript one file at a
time, function by function, with the C names (`web/games/lincity/src/lc/`, 11,000 lines):

| Original | Port (`src/lc/`) |
| --- | --- |
| main.c, simulate.c, engine.c, market.c, transport.c, power.c, stats.c, modules/*.c | main.ts, simulate.ts, engine.ts, market.ts, transport.ts, power.ts, stats.ts, modules.ts |
| screen.c, mps.c, pbar.c, module_buttons.c, geometry.c, mouse.c, dialbox.c, lchelp.c, splash.c | the same names |
| ldsvgui.c, ldsvguts.c, fileutil.c, lintypes.c, shrtypes.c, lclib.c, timer.c | the same names |
| lcx11.c, pixmap.c | lcx11.ts, pixmap.ts (the drawing: every call writes the 8-bit pixmap, as in the original) |
| engglobs.c, cliglobs.c, shrglobs.c, `#define`s of the headers | g.ts (globals as `G.name`), consts.ts (evaluated by the C compiler from the headers) |
| `Map map` (engglobs.h) | map.ts: one ArrayBuffer laid out as gcc lays out the struct, so pointer walks and raw saves work the same |
| glibc (rand, printf, scanf), stdio on files, gzip | c.ts, stdio.ts (fflate for gzip) |
| Xlib, the X server, the clock | platform.ts (an interface): the page's worker (`src/worker.ts`) or the tests' harness (`test/harness.ts`) |

The program runs as the C program does: synchronously, with its own nested event loops (dialogs, help
pages, the load and save screens wait for input where the original waits). In the browser it runs in a
worker (`src/worker.ts`) that blocks on `Atomics.wait`; the page (`src/index.ts`) shares the event queue,
the pixmap and the palette with it through SharedArrayBuffers and draws the pixmap through the palette.

Floats are `float` where the C has `float` (`Math.fround` at every store), `int` arithmetic is 32-bit
(`| 0`, `Math.imul`, `idiv`), `short` and `unsigned short` fields are typed array views. `rand()` is
glibc's (the TYPE_3 additive generator, `c.ts`); `srand(time(0))` at start (main.c), as the original.
printf's `%f` rounding is glibc's (the exact binary value, ties to even).

## The oracle

`oracle/` builds the original program itself as the test oracle (`oracle/build.sh`): all of xlincity's C
sources, unchanged, linked against `oracle/fakex.c` instead of libX11, and `oracle/dump.c`.

* `fakex.c` is a small Xlib: a window that is a buffer, a palette, events from a script (keys, button
  presses and releases, pointer moves, `ConfigureNotify` for a resize) at given times, and a virtual clock:
  `gettimeofday`, `time` and `select` are wrapped (`-Wl,--wrap`), `select()` advances the clock by its
  timeout, `XPending()` by 1 ms when nothing is due. So a session runs the same every time and as fast as
  the machine allows.
* `dump.c` writes, when the script says `dump NAME`, the program's state: the pixmap (what the window
  shows), the whole `map` struct, the globals (money, population, tech level, the stats, the timers, the
  flags, ...), the power grids, the substations and markets, the client state and the palette. The port's
  `test/dump.ts` writes the same layout.

The tests (`web/games/lincity/test/oracle.test.ts`) play the sessions of `test/sessions/` (written by
`sessions/make.py`) with the port and compare every dump and every file left in `~/.lincity` with the
original's (`sessions/expected.json`, recorded by `test/record.ts`; when the oracle is built the test runs
it too and shows the first differing pixels, map fields or globals). The sessions cover the splash and
opening page, a random village and a bare board, test mode (cheat keys), building every one of the 32
modules, dragging track, road, rail and power lines, bulldozing, fire, the nine mini map views, the menu,
help pages, statistics, preferences, a market's panel, the speed buttons, saving and loading scenes, the
built-in scenes good_times and bad_times, resizing the window, and decades of simulation. Every dump is
byte for byte the original's.

## Findings the port depends on

Reading the source settled most questions. What the compiled program does differently from what the
source seems to say was checked in a reference build of xlincity (plain `gcc -O2 -std=gnu89` of the X11
sources against libX11, x86-64, as the distributions built it) with REA's GDB session
(`start_gdb_session`, `gdb_console`: `disassemble /s`), and by running the oracle.

* **The clock.** `get_real_time()` (timer.c) is `real_time = (tv_sec - real_start_time) * 1000 +
  tv_usec / 1000`, a `long` in milliseconds. `real_start_time` is set by `reset_start_time()` (main.c:312)
  only after the splash screen. A day of the city passes when `real_time` reaches `next_time_step`
  (main.c's main loop), and the speed buttons set the step (timer.c). The port's clock is
  `gettimeofday` too (`platform.nowUs`): in the browser the time since the program started, in the
  tests the oracle's virtual clock.
* **The splash screen** (splash.c `si_scroll_text`): `int t = real_time + SPLASH_SCROLL_DELAY;` then
  `while (real_time < t) { lc_usleep (1); get_real_time (); }` between two steps of the scrolling text.
  Before `reset_start_time()`, `real_time` is the time since 1970 in milliseconds (about 1.7e12), so on
  LP64 the sum is cut to 32 bits: the reference build does `mov real_time,%eax; add $0x1e,%eax`
  (si_scroll_text+603..610) and later `movslq 0x8(%rsp),%r13; cmp %r13,real_time` (+926..931): `t` is
  a small or negative number and the loop never waits; the text runs as fast as the X server answers.
  On the 32-bit machines of its time the sum wrapped the same way as `real_time` and the scroll waited
  30 ms a step. The port computes it exactly as the C does (`(real_time + 30) | 0`, `splash.ts`), with
  the clock it is given: the oracle's virtual clock starts at 1e9 seconds, like a real one, and the tests
  match the 64-bit original; the browser's clock starts at 0 when the program starts, so in the browser
  `t` does not overflow and the scroll waits 30 ms a step, as it did on 32-bit machines (README).
* **Uninitialised memory** (power.c `map_power_grid`): `grid[++grid_num] = (Grid *) lcalloc
  (sizeof (Grid))` sets `total_power`, `power_lines`, `demand` and `max_power` but not `avail_power`
  and `powered` (reference build: the call to `lcalloc` at map_power_grid+78, then only the four stores).
  `lcalloc` is `malloc`. They are read before they are written when a new grid is made in the middle
  of a month, so the original's results depend on what the heap held. The port starts them at 0, and
  the oracle's `malloc` zeroes (`fakex.c`, `--wrap=malloc`), so both are deterministic and the same.
* **strtok without a declaration** (readpng.c `load_png_graphic`, used for `opening/icons.png` by
  lintypes.c): readpng.c does not include `<string.h>`, so `strtok` is implicitly `int`. The reference
  build truncates the returned pointer: `call strtok@plt; test %eax,%eax; movslq %eax,%rbx`
  (0x41fcde..0x41fce7, objdump of the same build); the pointer into the stack buffer is cut to 32 bits.
  The oracle is built with `-include string.h` so that it reads the icon list as intended; the port does.
* **Reads past the end of arrays**, kept as the C does them: `connect_transport()` looks one column past
  the map's edge (`map.type[100][y]` is `map.group[0][y]` in the struct; map.ts lays the struct out as
  gcc does); `remove_a_substation()` copies `substationx[q + 1]` at the last index, which is
  `substationy[0]` (the next global in memory, modules.ts); `write_pbar_int()` reads `data[data_size - 1]`
  with `data_size` 0, which is `data_size` itself (pbar.ts).
* **The load and save screens** list `~/.lincity` with `readdir()`, in the directory's order; scenes are
  files `N_comment`. The port lists by name (the tests' sessions never have two files for one number).
* **Saved scenes** are written to `~/.lincity/tmp-save`, compressed with `system ("gzip -f ...")` and
  moved to `N_comment` with `mv` (ldsvguts.c `save_city`), so their gzip header holds the name "tmp-save" and a time stamp.
  The port's scenes hold the scene's file name and no time stamp (the account's storage keeps the
  scene under its number and gets the comment back from the header). The content is byte for byte the
  original's; the tests compare the decompressed files. The original reads scenes through
  `popen ("gzip -d -c < file")` (fileutil.c `fopen_read_gzipped`), so it reads both kinds, and so does
  the port.
* **X details** the program depends on: `XLookupString` gives the character for keys (Ctrl+letter is
  the control code), arrow keys come as KeySyms; the wheel is buttons 4 and 5 and scrolls the map (with
  Ctrl sideways, with Shift further: lcx11.c `HandleEvent`); the bulldozer's cursor is `XC_pirate`
  (module_buttons.c), the other the default arrow. The "Confine X pointer" option grabs the pointer into
  the window (`XGrabPointer` with `confine_to`, lcx11.c `confine_pointer`); a page cannot do that, so
  the option is kept in the preferences and does nothing (README).

## State of the work (intermediate, FG-43 released)

Done and verified:

* The whole X11 program translated (`src/lc/`), running in a worker in the browser; storage of scenes and
  `~/.lincityrc` through the server (`GameModule.storageOnly("lincity")`), checked in Chromium: save in
  slot 1, reload the page, load it back.
* The oracle (`oracle/`), 7 sessions (`test/sessions/`, `make.py`) with the original's digests
  (`expected.json`, `test/record.ts`): every dump of the port equals the original's
  (`node --test games/lincity/test/*.test.ts`: 12 tests pass, about 50 s).
* `LICENSE.md`, `README.md` (deviations), these notes, the favicon (`web/icons/lincity*.png`,
  `scripts/icons.py` `i_lincity`), `re/lincity` in `scripts/source-paths.mjs`; `npm run build` passes.

Open:

* Screenshots: `web/games/lincity/screenshots.mjs` is written but not run yet
  (`npm run build && JAVA_HOME=<jdk21> node scripts/screenshots.mjs lincity`), then list the files in
  `game.json` "screenshots" (opening.png, good-times.png, statistics.png) and check them.
* The full check (`mvn -B -q -f pom.xml package && cd web && npm ci && npm run build && npm test`) has not
  been run end to end on this head (the build and the Lincity tests pass separately).
* Optional: let the page resize the program's window to the host (the ported code supports resizing).
* Then submit FG-43 with evidence for its criteria.
