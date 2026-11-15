# Brogue (Brogue: Community Edition 1.15.1)

The port runs and is checked against the original; `re/brogue/NOTES.md` lists what a next round could add.

Reference version: **Brogue CE 1.15.1** (tag `v1.15.1`, commit `1ba4240`, `re/brogue/fetch.sh`). The C program
(`src/brogue`, `src/variants`, `main.c`, `platformdependent.c`) is translated to TypeScript statement by statement
by `re/brogue/tools/c2ts` (from the NetHack port's translator; `src/game/`, do not edit, run
`re/brogue/tools/translate.sh`). SDL's platform (`sdl2-platform.c`, `tiles.c`) is rewritten for the page:
`src/host.ts` (keys, mouse, pauses, the canvas), `src/tiles.ts` (tiles.png downscaled exactly as tiles.c does),
`src/files.ts` (account storage, high scores), `src/rt/` (the C library).

## Checked against the original (`test/`)

- `sessions.test.ts`: 10 sessions run on the original (built natively with clang, `re/brogue/oracle/`) and on the
  port: title menu, seeded games (also seed 2^64-1), save and load, Rapid and Bullet Brogue, wizard mode with
  autopilot, the seed catalog to depth 40. Every frame (glyph and colours of all 3400 cells, at the same virtual
  time) and every file left (recordings, saves, high scores, run history) are byte for byte the original's.
- `tiles.test.ts`: the glyph textures for six window sizes equal the original tiles.c's (compiled with SDL2).
- `host.test.ts`: storage names, the high-score files as server tables, the key mapping.
- `leave.test.ts`: leaving the page saves the game wherever the program is (waiting for a key, in a pause, between
  two of its own steps), the keys are the game area's, and a file the server refuses does not hold back the
  others.
- A mutation (hit probability +1) makes three sessions fail.

## Controls

The original's (`?` in the game lists them): hjklyubn / arrows move, Shift runs, mouse points and travels,
x explore, > < stairs, i inventory, G text/tiles/hybrid, S save, Q quit.

## Deviations the browser forces

- **Files.** The working directory is your account storage. Names are stored encoded (`-` and hex for characters
  storage does not allow); a name that would be longer than 64 characters cannot be created. Storage limits
  (512 KiB per file, 4 MiB) apply to long recordings.
- **High scores** (`BrogueHighScores.txt` and the variants') are the server's tables `Brogue`, `RapidBrogue`,
  `BulletBrogue`, shared by everyone (as the file was by a machine's users); the date is the server's; ties are
  ordered newest first. The server can only check entries for plausibility (`BrogueModule.java`).
- **Window size.** The game fills the page's game area; `+ - = PageUp PageDown` (resize in SDL) do nothing;
  F11 is the browser's full screen.
- **Leaving the page** is the window's close button: the game is saved as `quitImmediately()` does, at once when
  the program waits for input or time, otherwise the moment it next comes to the platform; the save reaches the
  server only while the connection still sends it. A file the server refuses is reported and the other files are
  still sent.
- **Keys** reach the game while its game area (the canvas or the page's player) has the focus: a click on the
  game gives it back. SDL took the keys of its window only; the page's other fields and buttons keep theirs.
- **Screenshot key** downloads `Screenshot.png` instead of writing it into the working directory.
- No `keymap.txt`, no command line (Play starts the title screen).

## Open

See `re/brogue/NOTES.md`, "State of the work".
