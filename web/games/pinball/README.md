# Pinball Construction Set — browser port

Bill Budge's *Pinball Construction Set* (Apple II, Electronic Arts 1983), from the MIT-licensed 6502
listings in <https://github.com/billbudge/PCS_AppleII> (Merlin source of `BOOT2.S`, `SWAP.S`,
`CDRAW.S`, `PPAK.S`, `RUN.S`, `RUN2.S`, `EDIT.S`, `WIRE.S`, `DISK.S`).

The port is the Apple II program, translated into TypeScript routine by routine, one module per
listing (`src/cdraw.ts`, `ppak.ts`, `run.ts`, `run2.ts`, `edit.ts`, `wire.ts`, `disk.ts`, `shell.ts`
for `BOOT2.S`/`SWAP.S`). It runs on a model of the Apple's 64 KiB (`src/machine.ts`) with the
original's memory map: the listings' own data (tables, menus, the parts library, the self-modified
operands) is in RAM where the original has it, and tables are kept in the original's format. The
hi-res screen at `$2000` is shown with the colour monitor's colours (`src/display.ts`), the speaker's
clicks are played at the cycle the original's loops make them (`src/sound.ts`).

Everything of the original is there: the title, the construction set (the parts box, the hand, the
arrow, the scissors and the hammer for corners, the brush and its colours, the test play, the
magnifier, the world settings, the wiring kit, the disk menu with Load, Save, Make Game and Play
Game) and the game for 1 to 4 players with five balls each.

## Controls

| Input | Action |
| --- | --- |
| Mouse | The joystick: moves the hand (or the tool) |
| Left mouse button | Button 0: pick up and drop parts, use a tool, choose in the menus |
| Right mouse button | Button 1 |
| Left Shift / ← | Left flipper (button 0) |
| Right Shift / → | Right flipper (button 1) |
| ↓, held and let go | The plunger: pulled back while held (paddle 1), shot when let go (button 0) |
| Space before a game | One more player (up to 4); a button starts the game |
| Esc | Out of a test play or a game, back to the construction set |
| Letters, Return, ← | File names in the disk menu |
| Ctrl+S | Sound off and on in a game |
| Play online (button) | A game for 2 to 4 players, each at their own computer (below) |

## Checked against the original

The listings are assembled by a small Merlin assembler written for the tests (`test/merlin.ts`) and
run on a 6502 with the Apple's soft switches and the monitor's `WAIT` and `PREAD`
(`test/cpu6502.ts`, `test/apple2.ts`), as the original program. Both run the same inputs:

* 20 frame scenarios (`test/scenarios.ts`, `test/golden.test.ts`): every part type, the flippers
  in motion, the launcher, walls, all eight steps of the four world settings, and games of 1, 2, 3
  (with balls caught in holes, the sleepers) and 4 players. Every frame (each `WAIT` of the main
  loop): each ball's state, every hit (part, surface angle, direction), the score bytes and digits,
  the speaker's clicks, and a hash of all RAM below `$B000` but the stack. Equal frame by frame.
* 8 construction set sessions (`test/editor-sessions.ts`, `test/editor.test.ts`), played by a robot
  that steers the joystick from the cursor it reads in RAM: parts out of the box, moved and thrown
  away; corners moved, cut and added; painting; the world settings; the magnifier; the test play;
  the wiring kit; the disk menu (save, load, a missing file, Make Game, Play Game, Esc, quit). Equal
  at every `WAIT` (the cursor and the RAM hash), and the files written (a table, a made game) equal
  byte for byte.
* The time (`test/timing.test.ts`): the original's cycles per frame in every frame scenario and
  construction set session; the port reaches each of its cycle charges as often as the original, and
  is within 3% of the original's time in each frame scenario, within 5% in each session.

Online play is checked with several clients in one process, one dropping out and coming back
(`test/online.test.ts`), the server module with loopback clients (`PinballModuleTest`), and two
Chromium pages playing a whole game through the real server to the same RAM
(`test/browser-online.mjs`, run by hand after a build).

The recorded lines are in `test/golden/` (the tests run without the original's files); with
`re/pinball/orig` fetched (`re/pinball/fetch.sh`) the original is run live as well.
`re/pinball/NOTES.md` has the findings.

## Deviations

1. **Mouse instead of a joystick.** In the construction set the cursor goes where the mouse points,
   after the same `WAIT` and paddle reads as the joystick's (so its pace is the original's), by at
   most 12 pixels an update (the joystick's top speed is 5; dragging a part relies on small steps:
   `DRAGOBJ2` leaves the part behind while the cursor is 16 or more pixels away from it). The
   buttons are the mouse buttons and the Shift keys and arrows; the plunger's paddle is turned up
   by holding ↓, and letting go presses button 0 for 0.15 s.
2. **The disk is the player's storage on the server.** Each DOS file is a storage file (`TABLE 1`
   becomes `TABLE_1.PB`), holding what DOS would have on the disk: the address and length in front,
   the bytes, the rest of the last sector. DOS 3.3 is not in Budge's sources; its file manager is
   reproduced as `DISK.S` calls it (`src/fm.ts`, after Apple's DOS 3.3 source: one sector buffer,
   new sectors cleared, a range written one byte longer than asked, which `DISK.S`'s `BSAVE` counts
   on), and its error messages are DOS's. The slot and drive buttons change nothing, the prompts to
   swap disks go on without waiting for a key, and a name storage does not take (other than letters,
   digits, `.`, `-` and spaces) cannot be saved (DOS's `DISK FULL`; loading it says `FILE NOT
   FOUND`).
3. **Make Game** writes the game file as the original did (byte for byte), but there is no Apple disk to boot it
   from; tables are played with the disk menu's Play Game (or online).
4. **The starting table** is the Atari 800 version's (`TST.O` in Budge's Atari repository, which
   its disk build loads as the table in memory): the Apple disk's own copy is not published. The
   two versions share the table format; its colours are the Apple's for the same pixels.
5. **The parts' bitmaps and the title picture** are not in the Apple repository either. Budge's
   Atari 800 repository has both: `BITMAPS.OBJ`, the same blocks of `$7000-$76FF` as the Apple's
   (converted to the Apple's bit order, no pixel lost) and `PCSA2.PIC`, the Apple II title picture
   (`test/gen-assets.ts`).
6. **Time is modelled, not counted instruction by instruction.** `WAIT`, `PREAD` and the speaker's
   loops are counted exactly; the rest is charged at 150 routine entries and loop heads, with the
   cycles the original spends from there, measured on the 6502 code in the frame scenarios and the
   construction set's sessions (`test/gen-cycles.ts`, `src/cycles.ts`). The port reaches every
   charge as often as the original; the game and the test play keep within 3% of the original's
   time, the construction set within 5% (code without charges of its own, most of `EDIT.S`, `WIRE.S`
   and `DISK.S`, is not counted, and the loops that only wait for a button or a key are counted
   roughly), so a long redraw there can end a little sooner than on the Apple.
7. **The 6502 stack is not modelled.** `DISK.S` keeps the stack pointer (`STACKTEMP`) only to put it
   back; the port's value is fixed (the original's drifts by four bytes each visit to the disk menu
   or the wiring kit, which end with a `JMP` into `EDIT.S`).
8. **Online play is an addition.** The original played up to four players at one Apple. "Play
   online" opens a room for 2 to 4 players on a table one of them saved with the disk menu (the
   file travels in the room options and is checked by the server). Every computer runs the same
   program — the disk menu's Play Game on that table — from the same memory; the player whose ball
   it is (`RUN2.S` `MAIN4`) plays on their own buttons, and their inputs, with the input read they
   happened at, go to everybody else as an input tape (`src/online.ts`). The players' count is the
   room's seats (the space bar question is skipped), Esc and Ctrl+S do nothing online, and a player
   who leaves ends the game. The server (`PinballModule`) passes on only the inputs of the seat
   whose turn it is, five balls each in seat order, and replays the tape to a player who comes back
   after a dropped connection.
9. **Keys are the Apple's.** There is no keyboard buffer, as on the Apple: a key typed before the
   program has read the last one replaces it.

## Credits

Original game, source, bitmaps and title picture: Bill Budge, 1982–1983, MIT (`LICENSE.md`).
