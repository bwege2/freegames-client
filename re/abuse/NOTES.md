# Abuse 0.8: reverse engineering notes

Reference: `abuse-0.8.tar.gz` (2011-05-09), sha256 `0104db5f…9d3488`, from abuse.zoy.org
(`fetch.sh`, which leaves out the non-free `data/sfx/`, `data/music/` and the add-ons' `.wav` files).

## The oracle

`oracle/build.sh` builds the release's program with clang (C++ leaves the evaluation order of a call's
arguments to the compiler; clang goes left to right, as TypeScript does) and two changes outside the
game: `oracle/sound_rec.cpp` replaces `src/sdlport/sound.cpp` and writes every sound and music call
into the trace instead of playing it (as if the sound files were installed), and `oracle/hook.cpp` is
linked with `ld --wrap`:

* a virtual clock: it starts at the seed's second and moves only when the program waits (exactly what
  it asks for) and by 1 µs per reading, so the original's busy loops end and timing is exact;
* input from a session file, visible to `SDL_PollEvent` after a given number of frames;
* a trace line per frame (`update_window_done`): virtual µs, FNV hashes of the window's pixels and the
  palette, the game state (players, the random position, a hash over every object);
* "stuck" detection when the program waits for input the session does not give.

`oracle/run.sh` runs a session with a fresh `~/.abuse` (the `abuserc` the first start writes; optional
`gamma.lsp` and save files) in UTC. The port's harness (`web/games/abuse/test/harness.ts`) gives the
port the same clock, input and trace; `web/games/abuse/test/oracle.test.ts` compares the traces line
by line for every session in `web/games/abuse/test/sessions/` (title, gamma dialog, menu icons,
volume, quit, pause and help, saving and loading, the end of a level, the end sequence, random play
on nine levels including deaths), and a mutation (one flipped bit of the random position) must fail.
`online.test.ts` runs two port clients of an online round and compares their games tick by tick.

Besides reading the source, the built program was examined with gdb (backtraces of every clock
reading between two frames) and nm (the data layout). Findings, with where they come from:

## Findings

* **Frames the oracle does not count.** `palette::load` (`src/sdlport/video.cpp`) calls
  `update_window_done()` in the same file, so `ld --wrap` does not reach it: a palette change shows,
  but is not a frame of the trace. The port's `palette_load` presents uncounted frames too
  (`present(…, counted = false)`).
* **Hidden clock readings.** Every `time_marker` constructor reads the clock (1 µs in the oracle):
  `dev_controll` has one as a member (`dev.h`, `last_area_click`; gdb: `dev.cpp:901`), each
  `gui_status_node` (`imlib/guistat.cpp`) one, and `gui_status_manager::update` one per call while
  no status window is open. The port reads the clock at the same points (`src/dev.ts`,
  `src/status.ts`).
* **The status window crashes.** `gui_status_manager::update` reads `first->stat_win->x1()` before it
  creates `stat_win`: when loading takes more than a second the original dereferences NULL. With the
  oracle's clock that never happens; the port never opens the window.
* **Scroll bar arrows read past their arrays.** `scroller::show_icon` draws (bw-4)x(bh-4) = 10x9 bytes
  (horizontal) or 8x11 (vertical) from 80-byte arrays; nm shows `hs_left_arrow`, `hs_right_arrow`,
  `vs_up_arrow`, `vs_down_arrow` one after another, then `jw_bottom` and `jw_left`
  (`imlib/jwindow.cpp`). The gamma dialog's arrows show the overread row; the port reads the same
  memory (`src/imlib/scroller.ts`).
* **open_FILE** (`game.cpp`) writes relative names as "<data dir> <name>" (with a space): files like
  `hardness.lsp` and `defaults.prp` land in the data directory under a name the program never reads.
* **Network game setup is broken in 0.8.** `addon/deathmat/dstartup.lsp` loads
  `config/levelset.lsp` and `config/username.lsp`; `netcfg.cpp` writes them as
  `addon/deathmat/levelset.lsp`, `username.lsp`. Started as the deathmatch add-on (`-a deathmat`),
  the oracle stops in a Lisp error loop (gdb: `lbreak` → `LObject::Compile` recursion). The port writes
  both paths.
* **The demos cannot play**: `levels/demo1.dat` names `levels\demo1.spe`, which the data lacks, and
  demo3-5 do not exist; the menu tries one every 10 seconds and stays (the `menu` session).
* **Mid-tick drawing.** `show_stats` and `show_kills` (`ant.cpp`, `cop.cpp`) fade and wait inside a
  Lisp call in the middle of the level's tick; the port draws them after the tick with the game state
  of the moment of the call (`src/rt/deferred.ts`); frames, times and sounds are the original's.
* **Blocking Lisp calls.** `get_save_slot` opens the save dialog inside the save console's AI: the
  port's interpreter throws `NeedInput`, the tick shows the dialog and calls the AI again with the
  answer (`src/rt/needinput.ts`); the console's AI does nothing before it asks.
* **Uninitialised and odd values kept**: `smallest_size` is `0xffffffff` in an int (area controllers
  never apply), `sfxvel()` returns a byte, `(enum)` writes the cons cell's cdr, `put_part_image` skips
  the last row and column without dirty rectangles, `SetClip` on an image without descriptor makes a
  descriptor of width x width, `process_packet_commands` prints "Unknown net command 4" every tick,
  `l_difficulty = initial_difficulty` after a demo is a no-op. Each is commented where it is ported.
* **Save time**: the load screen shows the save's time from `localtime(time(NULL))`; the sessions run
  in UTC.
