# Lincity (port)

Classic **Lincity 1.13.1** (2004), the X11 version (`xlincity`), by I J Peters, Greg Sharp and Corey
Keasling: its C source translated to TypeScript function by function (`src/lc/`, how and why in
`re/lincity/NOTES.md`). The program runs in a worker as the C program ran, the page shows its 640×480
window. The rules, numbers, timing, random numbers, screens, help pages, built-in scenes and the
saved-scene format are the original's; the tests (`test/`) play sessions with the port and with the
original program itself and require the same screen, map and state at every step. On a clean checkout
(without `re/lincity/fetch.sh` and the oracle) the port plays the sessions with the shipped data pack and
is compared with the original's recorded digests (`test/sessions/expected.json`); the parts that need the
original's tree or the oracle are skipped.

Lincity-NG, the later C++ rewrite, is a different program and not what this port follows.

## Controls

As in the original (`help/keyboard.hlp`, `help/mouse.hlp`):

* **Left mouse button**: pick a building in the palette on the left and place it on the map; press and
  drag to lay a line of track, road, rail or power line; click a building for its figures in the panel on
  the right; the buttons (Menu, Help, Stats, the speed buttons, the mini map's views) and help links.
* **Right mouse button**: help for almost anything; on the map, a square's coverage and pollution.
* **Middle mouse button**: drag the map.
* **Arrow keys** (with Shift: faster) and the **mouse wheel** (with Ctrl: sideways): scroll the map.
* **Esc**: the menu (new game, load, save, options, help, quit); in help, back. **H**: help.
* **P** pause, **S** save, **L** load, **O** options, **V** the mini map's view over the main map,
  **r** statistics, **Q** quit.
* **Space**, **Enter**: a left click at the pointer (OK in dialogs); **Backspace**: a right click.
  In yes/no dialogs **Y** and **N**.
* **f** sets a random fire. Test mode, after a yes to its question: **m** money, **t** and **T**
  technology, **e** people.

## Files

Saved scenes and the preferences are kept in your account on our server instead of the original's
home directory: `~/.lincity/N_comment` (the nine scene slots, in the original's format) as `scene-N`,
`~/.lincityrc` as `lincityrc`. Without an account or server the game runs and keeps nothing. The
built-in scenes `good_times` and `bad_times` come with the game.

## Differences from the original

* **Leaving**: Quit (the menu's, or Q) goes back to the website. The original then also printed the
  game's statistics to the terminal; the port does not. The website's Back leaves the game at once, as
  closing the original's window did (nothing is saved unless you saved).
* **Window**: the window is 640×480, scaled to fit the page by whole numbers. The original's X window
  could be resized and its main view grew with it; the page does not resize it (the ported code still
  does: the tests resize the window of both).
* **The splash screen** scrolls its three lines with a 30 ms pause per step, as the original did on the
  32-bit machines of its time. On a 64-bit machine the original's pause computation overflows and the
  text runs as fast as the X server answers (`re/lincity/NOTES.md`, "The splash screen"). This is a
  decision, not a browser limit: the port shows the splash as it was meant and as 1.13.1 showed it on
  the machines it was written for.
* **New power grids** start with zero available power. The original reads two fields of a fresh grid
  before setting them (`power.c`), whatever the memory held; usually that was zero too.
* **"Confine X pointer"** (options) does nothing: a page cannot hold the pointer inside the window.
* **The bulldozer's cursor** (the X cursor font's pirate) is drawn by the browser as a CSS cursor, the
  other pointer is the browser's arrow.
* **Saved scenes** are gzip files as in the original, with the scene's own name in the gzip header
  where the original's say `tmp-save` (`gzip` was run on a temporary file); the content is byte for byte
  the same, and either program reads the other's scenes.
* **The load and save screens** list the scenes by name; the original listed them in the directory's
  order.
* **English only**: the original's Catalan and Italian translations (gettext) are not included, as the
  original showed English unless the system was set to one of them. This is a decision, not a browser
  limit: the website is English, and the port shows what the original showed by default.
* **Input while the program is busy**: the page queues the keys and buttons for the program (as the X
  server did) in a queue of 1024 events. When 1024 events wait unread, the newest ones are dropped; an
  event already queued is never overwritten (`src/shared.ts`, `test/events.test.ts`). The X server's own
  queue had no such limit in practice.
* Not in 1.13.1's X11 program and so not here either: command-line options (commented out in main.c),
  the network game (not built), sound.
