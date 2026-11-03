# The Powder Toy

A port of **The Powder Toy v100.1.400** (C++, GPL-3.0) to TypeScript, translated line by line: the simulation
(`src/sim/`, all 195 elements in `src/elements/`, the 11 simulation tools in `src/simtools/`), the renderer and
bitmap font (`src/graphics/`), the save format (`src/save/`) and the game window with its dialogs (`src/gui/`).
`PORTING.md` has the translation rules; `re/powdertoy/NOTES.md` how it was checked against the original.

## Controls

As in the original (its README's key table): draw with the left and right mouse buttons, Shift for lines, Ctrl
for boxes, Ctrl+Shift to fill; wheel, `[` and `]` for the brush size, Tab for its shape; middle click or Alt+click
picks an element; Space pauses, F steps a frame; 0-9 render modes; E element search; S/L/K stamps; Ctrl+Z/Y
undo/redo; Ctrl+C/V/X copy, paste, cut; Z zoom; W/Y/Ctrl+E gravity, air and edge modes; U ambient heat;
N Newtonian gravity; B decoration editor, Ctrl+B decorations on/off; H HUD, D debug, G grid; I invert pressure;
`=` reset pressure; F1 or Ctrl+H the intro text; Q or Esc quits (back to the game page, after the original's
confirmation). Touch and pen work as the mouse.

## Saves and stamps

The original kept saves, stamps and preferences in files; the port keeps them in the player's account storage,
in the original's formats:

| Original | Port (account storage) |
| --- | --- |
| `Saves/<name>.cps` (OPS) | `save-<name>.cps` (characters outside `A-Za-z0-9._-` become `_`) |
| `stamps/<id>.stm` + `stamps.def` | `stamp-<10 hex>.stm` + `stamps.json` (most recently used first) |
| `powder.pref` (JSON) | `powder.pref` (JSON, same keys) |

Saves written by the port are OPS files the original reads (checked with the original's own GameSave code);
saves of the original (`.cps`, `.stm`) can be dropped onto the game to open them.

## Deviations

* **Online features are not ported**: the online save browser and search, save previews, login and profiles,
  tags, voting, uploading, update checks and the server's messages of the day. Their buttons keep their place
  in the layout and are disabled; save, thread and search signs say "Not available".
* **No Lua**: the console (backtick key) and Lua scripts are not ported, nor what only Lua turns on (the
  graphics cache, debug overlays, recording).
* **Open** opens the local file browser with a plain click (the original needed Ctrl+click while online);
  **Save** saves locally, as the original does without a signed-in user.
* **Undo** keeps whole snapshots instead of the original's snapshot deltas (same behaviour, more memory).
* **Bitmap brushes** (`brushes/*.ptb` files) do not exist in the browser, so only the three built-in brushes are
  there.
* **Settings** that only make sense on a desktop are left out of the options: window scale, full screen,
  resizable and integer/blurry scaling, data folder, migration, render thread, stdout redirect, MOTD, platform
  clipboard. Credits are not ported.
* **Screenshots** (P/F2) are downloaded as a PNG file; the save clipboard stays in memory, text copy and paste
  use the browser's clipboard.
* **Keys the browser keeps**: F11 (the site's full screen), F12, Ctrl+W/T/N. Cmd counts as Ctrl on macOS.
* **Newtonian gravity** is computed on the main thread with our own FFT instead of FFTW on a thread: the same
  kernel and convolution, results equal up to float rounding, one frame of latency as in the original.
* **bzip2**: the port's compressor writes valid bzip2 streams that the original reads, but not byte for byte
  what libbzip2 writes (different Huffman tables); the decompressor reads any stream except the "randomised"
  blocks only bzip2 0.9.0 wrote.
* **Floating point**: the desktop builds of the original flush denormal floats to zero (FTZ/DAZ); its browser
  build does not, and neither does this port. Functions such as `sinf`/`cosf` come from JavaScript's `Math`
  and can differ from the C library in the last bit; the oracle scenarios pass bit for bit, see NOTES.
* Smaller UI gaps: no background picture in the local save dialog, no progress window while stamps are deleted.
